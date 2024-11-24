import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

type SceneSetup = {
  canvas: HTMLCanvasElement
}

export function setupScene({ canvas }: SceneSetup): {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  controls: OrbitControls
} {
  // Scene
  const scene = new THREE.Scene()

  // Camera
  const camera = new THREE.PerspectiveCamera(
    35,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  )
  camera.position.set(4.5, 4, 11)

  // Rendered
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(window.innerWidth, window.innerHeight)

  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.dampingFactor = 0.01

  return {
    scene,
    camera,
    renderer,
    controls,
  }
}
