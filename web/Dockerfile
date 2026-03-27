FROM nginx:stable-alpine
# 区别于之前的外部挂载，现在直接将 dist 复制进镜像的默认目录
COPY dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]