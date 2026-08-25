#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { pipeline } = require('stream/promises');
const { spawn } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const webDir = path.join(rootDir, 'web');
const serverDir = path.join(rootDir, 'server');
const deployDir = path.join(rootDir, 'deploy');
const imagesDir = path.join(deployDir, 'images');
const envFile = path.join(deployDir, '.env');

const IMAGE_NAMES = {
  web: 'banana-flow-admin-web-v3',
  server: 'banana-flow-admin-server-py',
  db: ['mysql:8.0', 'redis:7.0'],
};

function printHelp() {
  console.log(`
用法:
  node scripts/build-images.js [选项]

常用:
  node scripts/build-images.js
  node scripts/build-images.js --target app
  node scripts/build-images.js --target web --seq 2
  node scripts/build-images.js --no-cache-server --skip-db-pull

选项:
  --target <all|app|web|server|db>  打包目标，默认 all
  --date <YYYYMMDD>                 指定版本日期，默认今天
  --seq <N>                         指定当日序号，默认按 deploy/images 自动递增
  --web-version <tag>               指定前端完整版本号
  --server-version <tag>            指定后端完整版本号
  --skip-web-build                  跳过 pnpm build:production
  --no-cache-server                 后端镜像使用 docker build --no-cache
  --skip-db-pull                    跳过 mysql/redis 镜像拉取
  --no-update-env                   不更新 deploy/.env 中的 WEB_VERSION/SERVER_VERSION
  --help                            查看帮助
`);
}

function parseArgs(argv) {
  const args = {
    target: 'all',
    date: formatDate(new Date()),
    seq: undefined,
    webVersion: undefined,
    serverVersion: undefined,
    skipWebBuild: false,
    noCacheServer: false,
    skipDbPull: false,
    updateEnv: true,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const readValue = () => {
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        throw new Error(`${arg} 需要一个值`);
      }
      i += 1;
      return value;
    };

    if (arg === '--help' || arg === '-h') {
      args.help = true;
    } else if (arg === '--target') {
      args.target = readValue();
    } else if (arg === '--date') {
      args.date = readValue();
    } else if (arg === '--seq') {
      args.seq = Number(readValue());
    } else if (arg === '--web-version') {
      args.webVersion = readValue();
    } else if (arg === '--server-version') {
      args.serverVersion = readValue();
    } else if (arg === '--skip-web-build') {
      args.skipWebBuild = true;
    } else if (arg === '--no-cache-server') {
      args.noCacheServer = true;
    } else if (arg === '--skip-db-pull') {
      args.skipDbPull = true;
    } else if (arg === '--no-update-env') {
      args.updateEnv = false;
    } else {
      throw new Error(`未知选项: ${arg}`);
    }
  }

  if (!['all', 'app', 'web', 'server', 'db'].includes(args.target)) {
    throw new Error('--target 只支持 all、app、web、server、db');
  }
  if (!/^\d{8}$/.test(args.date)) {
    throw new Error('--date 格式应为 YYYYMMDD，例如 20260721');
  }
  if (args.seq !== undefined && (!Number.isInteger(args.seq) || args.seq < 1)) {
    throw new Error('--seq 必须是大于 0 的整数');
  }

  return args;
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function getTargets(target) {
  if (target === 'all') return { web: true, server: true, db: true };
  if (target === 'app') return { web: true, server: true, db: false };
  return { web: target === 'web', server: target === 'server', db: target === 'db' };
}

function getNextSequence(date) {
  if (!fs.existsSync(imagesDir)) return 1;

  const versionPattern = new RegExp(`-v${date}\\.(\\d+)\\.(?:web|server)\\.tar\\.gz$`);
  const maxSeq = fs.readdirSync(imagesDir).reduce((max, file) => {
    const match = file.match(versionPattern);
    if (!match) return max;
    return Math.max(max, Number(match[1]));
  }, 0);

  return maxSeq + 1;
}

function commandName(command) {
  if (process.platform !== 'win32') return command;
  if (command === 'pnpm') return 'pnpm.cmd';
  if (command === 'npm') return 'npm.cmd';
  return command;
}

function shouldUseShell(command) {
  return process.platform === 'win32' && ['pnpm', 'npm'].includes(command);
}

function run(command, args, options = {}) {
  const cwd = options.cwd || rootDir;
  console.log(`\n> ${command} ${args.join(' ')}`);

  return new Promise((resolve, reject) => {
    const child = spawn(commandName(command), args, {
      cwd,
      stdio: 'inherit',
      shell: shouldUseShell(command),
      env: process.env,
    });

    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`命令执行失败(${code}): ${command} ${args.join(' ')}`));
      }
    });
  });
}

async function gzipFile(source, target) {
  await pipeline(
    fs.createReadStream(source),
    zlib.createGzip({ level: 9 }),
    fs.createWriteStream(target),
  );
  fs.rmSync(source, { force: true });
}

async function saveImage(images, outputFileName) {
  fs.mkdirSync(imagesDir, { recursive: true });

  const outputPath = path.join(imagesDir, outputFileName);
  const tempTarPath = outputPath.replace(/\.gz$/, '');

  fs.rmSync(outputPath, { force: true });
  fs.rmSync(tempTarPath, { force: true });

  await run('docker', ['save', '-o', tempTarPath, ...images]);
  await gzipFile(tempTarPath, outputPath);
  console.log(`已导出: ${path.relative(rootDir, outputPath)}`);
}

function updateEnvVersions(webVersion, serverVersion, targets) {
  if (!fs.existsSync(envFile)) {
    console.warn(`未找到 ${path.relative(rootDir, envFile)}，跳过版本写入`);
    return;
  }

  const original = fs.readFileSync(envFile, 'utf8');
  let next = original;

  if (targets.web && webVersion) {
    next = upsertEnv(next, 'WEB_VERSION', webVersion);
  }
  if (targets.server && serverVersion) {
    next = upsertEnv(next, 'SERVER_VERSION', serverVersion);
  }

  if (next !== original) {
    fs.writeFileSync(envFile, next);
    console.log(`已更新: ${path.relative(rootDir, envFile)}`);
  }
}

function upsertEnv(content, key, value) {
  const line = `${key}=${value}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');

  if (pattern.test(content)) {
    return content.replace(pattern, line);
  }

  const ending = content.endsWith('\n') ? '' : '\n';
  return `${content}${ending}${line}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const targets = getTargets(args.target);
  const seq = args.seq || getNextSequence(args.date);
  const webVersion = args.webVersion || `v${args.date}.${seq}.web`;
  const serverVersion = args.serverVersion || `v${args.date}.${seq}.server`;

  console.log('打包参数:');
  console.log(`  target: ${args.target}`);
  console.log(`  web:    ${targets.web ? webVersion : '跳过'}`);
  console.log(`  server: ${targets.server ? serverVersion : '跳过'}`);
  console.log(`  db:     ${targets.db ? 'database-images.tar.gz' : '跳过'}`);

  await run('docker', ['version', '--format', '{{.Server.Version}}']);

  if (targets.web) {
    if (!args.skipWebBuild) {
      await run('pnpm', ['build:production'], { cwd: webDir });
    }
    await run('docker', ['build', '-t', `${IMAGE_NAMES.web}:${webVersion}`, './'], { cwd: webDir });
    await saveImage([`${IMAGE_NAMES.web}:${webVersion}`], `${IMAGE_NAMES.web}-${webVersion}.tar.gz`);
  }

  if (targets.server) {
    const buildArgs = ['build'];
    if (args.noCacheServer) buildArgs.push('--no-cache');
    buildArgs.push('-t', `${IMAGE_NAMES.server}:${serverVersion}`, './');

    await run('docker', buildArgs, { cwd: serverDir });
    await saveImage([`${IMAGE_NAMES.server}:${serverVersion}`], `${IMAGE_NAMES.server}-${serverVersion}.tar.gz`);
  }

  if (targets.db) {
    if (!args.skipDbPull) {
      await run('docker', ['pull', 'mysql:8.0']);
      await run('docker', ['pull', 'redis:7.0']);
    }
    await saveImage(IMAGE_NAMES.db, 'database-images.tar.gz');
  }

  if (args.updateEnv) {
    updateEnvVersions(webVersion, serverVersion, targets);
  }

  console.log('\n打包完成。输出目录: deploy/images');
}

main().catch((error) => {
  console.error(`\n打包失败: ${error.message}`);
  process.exit(1);
});
