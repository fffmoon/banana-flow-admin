// import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

// /**
//  * @author Qing
//  * @description 所有场景的基类，需要手动调用 render 函数才会渲染
//  * @date 2024-10-02 19:52:37
//  */
// export class View {
//   id: string
//   dom: HTMLElement
//   renderer: THREE.WebGLRenderer
//   camera: THREE.PerspectiveCamera
//   scene: THREE.Scene
//   controls: OrbitControls
//   private updateTimer: null | number
//   renderCallbacks: { name: string, cb: () => void }[] = []

//   /**
//    * 构造函数
//    * @param id DOM元素的id
//    */
//   constructor(id: string) {
//     this.id = id

//     this.dom = document.getElementById(this.id) as HTMLElement
//     this.renderer = null!
//     this.camera = null!
//     this.scene = null!
//     this.controls = null!
//     this.updateTimer = null
//     this.renderCallbacks = []

//     this.initView()
//   }

//   /**
//    * 初始化视图
//    */
//   private initView(): void {
//     this.initRenderer()
//     this.initCamera()
//     this.initScene()
//     this.initControls()
//     this.resize()
//     window.addEventListener('resize', this.resize.bind(this))
//   }

//   /**
//    * 初始化WebGL渲染器
//    */
//   initRenderer(): void {
//     this.renderer = new THREE.WebGLRenderer({
//       antialias: true, // 开启反锯齿
//     })
//     this.dom.appendChild(this.renderer.domElement) // 将渲染器添加到画布中
//   }

//   /**
//    * 初始化透视相机
//    */
//   initCamera(): void {
//     // 创建透视相机
//     this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 20000)
//     // 设置相机位置
//     this.camera.position.set(0, 600, 1600)
//     // 设置相机朝向
//     this.camera.lookAt(0, 0, 0)
//   }

//   /**
//    * 初始化场景
//    */
//   initScene(): void {
//     this.scene = new THREE.Scene()
//   }

//   /**
//    * 初始化相机控制器
//    */
//   initControls(): void {
//     this.controls = new OrbitControls(this.camera, this.renderer.domElement)
//     this.controls.target.set(0, 0, 0)
//     this.controls.enableDamping = false // 是否开启阻尼
//     this.controls.screenSpacePanning = false // 定义当平移的时候摄像机的位置将如何移动, 摄像机将在与摄像机向上方向垂直的平面中平移
//   }

//   /**
//    * 渲染循环
//    */
//   render(): void {
//     this.controls.update() // 更新控制器
//     this.renderer.render(this.scene, this.camera) // 渲染场景

//     // 渲染回调
//     if (this.renderCallbacks.length > 0) {
//       for (let i = 0; i < this.renderCallbacks.length; i++) {
//         const callBack = this.renderCallbacks[i].cb
//         callBack()
//       }
//     }

//     if (this.updateTimer)
//       cancelAnimationFrame(this.updateTimer)
//     this.updateTimer = requestAnimationFrame(this.render.bind(this))
//   }

//   /**
//    * 窗口改变
//    */
//   resize(): void {
//     // 更新相机长宽比
//     this.camera.aspect = this.dom.clientWidth / this.dom.clientHeight
//     this.camera.updateProjectionMatrix()

//     // 更新渲染器的尺寸和像素比
//     this.renderer.setSize(this.dom.clientWidth, this.dom.clientHeight)
//     this.renderer.setPixelRatio(window.devicePixelRatio)
//     this.renderer.toneMapping = THREE.ACESFilmicToneMapping // 色调映射
//   }
// }
