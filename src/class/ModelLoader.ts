/*
 * @Author: Qing
 * @Description:
 * @Date: 2024-10-02 22:41:09
 * @LastEditTime: 2024-10-02 23:19:02
 */
// import type { View } from '@/class/View'

//  import * as THREE from 'three'

// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// export class ModelLoader {
//   viewer: View
//   manager: THREE.LoadingManager
//   constructor(viewer: View) {
//     this.viewer = viewer
//     this.manager = new THREE.LoadingManager()
//   }

//   loadModel(url, successCallback, progressCallback?) {
//     const loader = new GLTFLoader(this.manager)
//     loader.load(
//       url,
//       (gltf) => {
//         successCallback(gltf)
//       },
//       (xhr) => {
//         const load = Math.floor((xhr.loaded / xhr.total) * 100)
//         progressCallback?.(xhr, load)
//       },
//       (error) => {
//         console.error('模型渲染报错：', error)
//       },
//     )
//   }
// }
