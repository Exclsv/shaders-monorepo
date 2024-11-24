import * as THREE from 'three'
import { setupScene } from './setup-scene'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import GUI from 'lil-gui'
const canvas = document.querySelector('.webgl') as HTMLCanvasElement
const { scene, camera, renderer, controls } = setupScene({ canvas })

// Loaders
const textureLoader = new THREE.TextureLoader()
const flagTexture = textureLoader.load('./textures/flag-french.jpg')

// Gui
const gui = new GUI()

// Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 32, 32)
const count = geometry.attributes.position.count
const randoms = new Float32Array(count)
for (let i = 0; i < count; i++) {
  randoms[i] = Math.random()
}
geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))
// console.log(geometry)

// Material
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  side: THREE.DoubleSide,
  transparent: true,
  uniforms: {
    // uFrequency: { value: 15 },
    uFrequency: { value: new THREE.Vector2(10, 5) },
    uTime: { value: 0 },
    uColor: {
      value: new THREE.Color('#ff8800'),
    },
    uTexture: { value: flagTexture},
  },
  // wireframe: true
})

// Tweak Gui
gui.add(material.uniforms.uFrequency.value, 'x').min(0).max(20).step(0.01)
gui.add(material.uniforms.uFrequency.value, 'y').min(0).max(20).step(0.01)

// Mesh
const mesh = new THREE.Mesh(geometry, material)
mesh.scale.y = 2 / 3 // aspect ratio 2:3
scene.add(mesh)

// Animation
const clock = new THREE.Clock()
renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime()
  // Update controls
  controls.update()

  // Update time
  material.uniforms.uTime.value = elapsedTime

  // Render
  renderer.render(scene, camera)
})
