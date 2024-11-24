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
  sizes: {
    resolution: THREE.Vector2
    pixelRatio: number
  }
} {
  // Scene
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#202020')

  const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2),
    resolution: new THREE.Vector2(),
  }
  sizes.resolution.set(
    sizes.width * sizes.pixelRatio,
    sizes.height * sizes.pixelRatio
  )

  // Camera
  const camera = new THREE.PerspectiveCamera(
    25,
    window.innerWidth / window.innerHeight,
    0.1,
    200
  )
  camera.position.set(1.5, 0, 6)

  // Rendered
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(sizes.pixelRatio)

  const controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
  controls.dampingFactor = 0.01

  window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)
    sizes.resolution.set(
      sizes.width * sizes.pixelRatio,
      sizes.height * sizes.pixelRatio
    )

    // Update camera
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
  })

  return {
    scene,
    camera,
    renderer,
    controls,
    sizes,
  }
}
