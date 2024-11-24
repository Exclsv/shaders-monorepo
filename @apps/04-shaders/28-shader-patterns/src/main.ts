import * as THREE from 'three'
import { setupScene } from './setup-scene'
import vertexShader from './shaders/vertex.vert'
import fragmentShader from './shaders/fragment.frag'
import GUI from 'lil-gui'

const gui = new GUI()

const canvas = document.querySelector('.webgl') as HTMLCanvasElement
const { scene, camera, renderer, controls } = setupScene({ canvas })

// Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 32, 32)

// Material
const material = new THREE.RawShaderMaterial({
  vertexShader,
  fragmentShader,
  side: THREE.DoubleSide,
})

// Mesh
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

// Animation
const clock = new THREE.Clock()
renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime()
  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)
})
