import * as THREE from 'three'
import { setupScene } from './setup-scene'
import vertexShader from './shaders/water/vertex.vert'
import fragmentShader from './shaders/water/fragment.frag'
import GUI from 'lil-gui'

const gui = new GUI({ width: 320 })
const debugObject = {
  depthColor: '#ff4000',
  surfaceColor: '#151c37',
}

const canvas = document.querySelector('.webgl') as HTMLCanvasElement
const { scene, camera, renderer, controls } = setupScene({ canvas })

// Tone mapping
renderer.toneMapping = THREE.ACESFilmicToneMapping

// Axes helper
// const axesHelper = new THREE.AxesHelper(2)
// axesHelper.position.y += 0.25
// scene.add(axesHelper)

// Geometry
const waterGeometry = new THREE.PlaneGeometry(4, 4, 1024, 1024)
// delete normals - (we will compute the normals in the vertex shader)
waterGeometry.deleteAttribute('normal')
waterGeometry.deleteAttribute('uv')

// Material
const waterMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  side: THREE.DoubleSide,
  uniforms: {
    uTime: { value: 0 },

    uBigWavesElevation: { value: 0.2 },
    uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
    uBigWavesSpeed: { value: 0.75 },

    uSmallWavesElevation: { value: 0.15 },
    uSmallWavesFrequency: { value: 3 },
    uSmallWavesSpeed: { value: 0.2 },
    uSmallWavesIterations: { value: 4 },

    uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
    uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
    uColorOffset: { value: 0.925 },
    uColorMultiplier: { value: 1.0 },
    // wireframe: true,

    uShift: { value: 0.01 },
  },
})

// Debug
// Big Waves
gui
  .add(waterMaterial.uniforms.uBigWavesElevation, 'value')
  .min(0)
  .max(1)
  .step(0.001)
  .name('uBigWavesElevation')

gui
  .add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x')
  .min(0)
  .max(10)
  .step(0.001)
  .name('uBigWavesFrequency X')
gui
  .add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y')
  .min(0)
  .max(10)
  .step(0.001)
  .name('uBigWavesFrequency Y')

gui
  .add(waterMaterial.uniforms.uBigWavesSpeed, 'value')
  .min(0)
  .max(4)
  .step(0.001)
  .name('uBigWavesSpeed')

// Small Waves
gui
  .add(waterMaterial.uniforms.uSmallWavesElevation, 'value')
  .min(0)
  .max(1)
  .step(0.001)
  .name('uSmallWavesElevation')
gui
  .add(waterMaterial.uniforms.uSmallWavesFrequency, 'value')
  .min(0)
  .max(30)
  .step(0.001)
  .name('uSmallWavesFrequency')
gui
  .add(waterMaterial.uniforms.uSmallWavesSpeed, 'value')
  .min(0)
  .max(4)
  .step(0.001)
  .name('uSmallWavesSpeed')
gui
  .add(waterMaterial.uniforms.uSmallWavesIterations, 'value')
  .min(0)
  .max(5)
  .step(1)
  .name('uSmallWavesIterations')

// Colors
gui
  .addColor(debugObject, 'depthColor')
  .onChange(() => {
    waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor)
  })
  .name('uDepthColor')

gui
  .addColor(debugObject, 'surfaceColor')
  .onChange(() => {
    waterMaterial.uniforms.uSurfaceColor.value.set(debugObject.surfaceColor)
  })
  .name('uSurfaceColor')
gui
  .add(waterMaterial.uniforms.uColorOffset, 'value')
  .min(0)
  .max(1)
  .step(0.001)
  .name('uColorOffset')
gui
  .add(waterMaterial.uniforms.uColorMultiplier, 'value')
  .min(0)
  .max(10)
  .step(0.001)
  .name('uColorMultiplier')

// Shift
gui
  .add(waterMaterial.uniforms.uShift, 'value')
  .min(0)
  .max(0.2)
  .step(0.001)
  .name('uShift')

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = -Math.PI * 0.5
scene.add(water)

// Animation
const clock = new THREE.Clock()
renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime()
  // Update controls
  controls.update()

  // Update uniforms
  waterMaterial.uniforms.uTime.value = elapsedTime

  // Render
  renderer.render(scene, camera)
})