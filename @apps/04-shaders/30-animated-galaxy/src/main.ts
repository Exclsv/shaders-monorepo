import * as THREE from 'three'
import { setupScene } from './setup-scene'
import vertexShader from './shaders/vertex.vert'
import fragmentShader from './shaders/fragment.frag'
import GUI from 'lil-gui'

const gui = new GUI()

const canvas = document.querySelector('.webgl') as HTMLCanvasElement
const { scene, camera, renderer, controls } = setupScene({ canvas })

// Galaxy
const parameters = {
  count: 200000,
  size: 0.005,
  radius: 5,
  branches: 3,
  spin: 0,
  randomness: 0.5,
  randomnessPower: 3,
  insideColor: '#ff6030',
  outsideColor: '#1b3984',
}

let geometry: THREE.BufferGeometry | null = null
let material: THREE.ShaderMaterial | null = null
let points: THREE.Points | null = null

const generateGalaxy = () => {
  /* 
  ^ KEEP IN MIND:
    - Always dispose of the old geometry and material before creating new ones.
    - This helps in releasing the memory and preventing memory leaks.
  */

  if (points !== null) {
    // Destroy old material and geometry
    geometry?.dispose() // Release the memory
    material?.dispose() // Release the memory
    scene.remove(points) // Remove the points from the scene
  }

  geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(parameters.count * 3)
  const colors = new Float32Array(parameters.count * 3)
  const scales = new Float32Array(parameters.count * 1)
  const randomness = new Float32Array(parameters.count * 3)

  const insideColor = new THREE.Color(parameters.insideColor)
  const outsideColor = new THREE.Color(parameters.outsideColor)

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3

    // Position
    const radius = Math.random() * parameters.radius // distance from the center
    const spinAngle = radius * parameters.spin // bigger the radius, bigger the spin
    const branchAngle =
      ((i % parameters.branches) / parameters.branches) * Math.PI * 2 // 0, 0.33, 0.66 of rotation

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius 
    // positions[i3 + 1] = 0 + randomY
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius

    // Randomness
    const randomX =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius
    const randomY =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius
    const randomZ =
      Math.pow(Math.random(), parameters.randomnessPower) *
      (Math.random() < 0.5 ? 1 : -1) *
      parameters.randomness *
      radius

    randomness[i3] = randomX
    randomness[i3 + 1] = randomY
    randomness[i3 + 2] = randomZ

    // Color
    // ! Do not use lerp method directly on the color, because it will change the color itself
    const mixedColor = insideColor.clone()
    mixedColor.lerp(outsideColor, radius / parameters.radius)

    colors[i3] = mixedColor.r
    colors[i3 + 1] = mixedColor.g
    colors[i3 + 2] = mixedColor.b

    // Scale
    scales[i] = Math.random()
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  geometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1))
  geometry.setAttribute('aRandomness', new THREE.BufferAttribute(randomness, 3))

  material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    // Automatically sends the color attribute to the fragment shader
    vertexColors: true, // Using the colors from the geometry attribute
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: 30 * renderer.getPixelRatio() },
    },
  })

  points = new THREE.Points(geometry, material)
  scene.add(points)
}

gui
  .add(parameters, 'count')
  .min(100)
  .max(1000000)
  .step(100)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, 'radius')
  .min(0.01)
  .max(20)
  .step(0.01)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, 'branches')
  .min(1)
  .max(20)
  .step(1)
  .onFinishChange(generateGalaxy)
// gui
//   .add(parameters, 'spin')
//   .min(-5)
//   .max(5)
//   .step(0.001)
//   .onFinishChange(generateGalaxy)
gui
  .add(parameters, 'randomness')
  .min(0)
  .max(2)
  .step(0.001)
  .onFinishChange(generateGalaxy)
gui
  .add(parameters, 'randomnessPower')
  .min(1)
  .max(10)
  .step(0.01)
  .onFinishChange(generateGalaxy)
gui.addColor(parameters, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(parameters, 'outsideColor').onFinishChange(generateGalaxy)

generateGalaxy()

// Animation
const clock = new THREE.Clock()
renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime()

  // Update material uniforms
  if (material) {
    material.uniforms.uTime.value = elapsedTime
  }

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)
})
