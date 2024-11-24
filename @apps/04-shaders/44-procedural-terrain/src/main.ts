import * as THREE from 'three'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import GUI from 'lil-gui'
import { Brush, Evaluator, SUBTRACTION } from 'three-bvh-csg'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'

import { setupScene } from './setup-scene'
// Shaders
import vertexShader from './shaders/vertex.vert'
import fragmentShader from './shaders/fragment.frag'

const gui = new GUI({ width: 320 })
const debugObject = {
  colorWaterDeep: '#002b3d',
  colorWaterSurface: '#66a8ff',
  colorSand: '#ffe894',
  colorGrass: '#85d534',
  colorSnow: '#ffffff',
  colorRock: '#bfbd8d',
}

// Loaders
const rgbeLoader = new RGBELoader()

// Scene
const canvas = document.querySelector('.webgl') as HTMLCanvasElement
const { scene, camera, renderer, controls } = setupScene({ canvas })

/**
 * * Environment map
 */
rgbeLoader.load('/spruit_sunrise.hdr', envMap => {
  envMap.mapping = THREE.EquirectangularReflectionMapping

  scene.background = envMap
  scene.backgroundBlurriness = 0.5
  scene.environment = envMap
})

/**
 * * Terrain
 */
const geometry = new THREE.PlaneGeometry(10, 10, 500, 500)
geometry.rotateX(-Math.PI * 0.5) // Do not rotate mesh, the axes will be modified
// Optimisation
geometry.deleteAttribute('normal') // We use our own computed normals in the vertex shader
geometry.deleteAttribute('uv') // We don't need UVs for this terrain

// Material
const uniforms = {
  uTime: new THREE.Uniform(0),

  uPositionFrequency: new THREE.Uniform(0.2),
  uStrength: new THREE.Uniform(2.0),
  uWarpFrequency: new THREE.Uniform(5.0),
  uWarpStrength: new THREE.Uniform(0.5),

  // Colors
  uColorWaterDeep: new THREE.Uniform(
    new THREE.Color(debugObject.colorWaterDeep)
  ),
  uColorWaterSurface: new THREE.Uniform(
    new THREE.Color(debugObject.colorWaterSurface)
  ),
  uColorSand: new THREE.Uniform(new THREE.Color(debugObject.colorSand)),
  uColorGrass: new THREE.Uniform(new THREE.Color(debugObject.colorGrass)),
  uColorSnow: new THREE.Uniform(new THREE.Color(debugObject.colorSnow)),
  uColorRock: new THREE.Uniform(new THREE.Color(debugObject.colorRock)),
}

const material = new CustomShaderMaterial({
  baseMaterial: THREE.MeshStandardMaterial,
  vertexShader,
  fragmentShader,
  uniforms,
  metalness: 0,
  roughness: 0.5,
  color: '#85d534',
})

const depthMaterial = new CustomShaderMaterial({
  baseMaterial: THREE.MeshDepthMaterial,
  vertexShader,
  uniforms,
  depthPacking: THREE.RGBADepthPacking,
})

// Mesh
const terrain = new THREE.Mesh(geometry, material)
terrain.customDepthMaterial = depthMaterial
terrain.receiveShadow = true
terrain.castShadow = true
scene.add(terrain)

/**
 * * Water
 */
const water = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10, 1, 1),
  new THREE.MeshPhysicalMaterial({
    transmission: 1,
    roughness: 0.3,
    ior: 1.33,
    color: '#6a7b90',
  })
)
water.rotation.x = -Math.PI * 0.5
water.position.y = -0.1
scene.add(water)

/**
 * * Board
 */
const boardFill = new Brush(new THREE.BoxGeometry(11, 2, 11))
const boardHole = new Brush(new THREE.BoxGeometry(10, 2.1, 10))

/**
 * In case if you need to apply some transformations to the brush before evaluation
 * use `updateMatrixWorld` method. It will update the geometry in a way that the evaluator
 * will preserve the transformations.
 */
/* boardHole.position.y = 0.2
boardHole.updateMatrixWorld() */

// ^ Evaluate
const evaluator = new Evaluator()
/*
  By default the evaluator will preserve all the material properties of the brushes.
  Additionally, we have access to geometry properties.
*/
const board = evaluator.evaluate(boardFill, boardHole, SUBTRACTION)
board.geometry.clearGroups()
board.material = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  metalness: 0.1,
  roughness: 0.5,
})
board.castShadow = true
board.receiveShadow = true
scene.add(board)

// * GUI Tweaks
gui
  .add(uniforms.uPositionFrequency, 'value', 0, 0.5, 0.01)
  .name('uPositionFrequency')
gui.add(uniforms.uStrength, 'value', 0, 5, 0.01).name('uStrength')
gui.add(uniforms.uWarpFrequency, 'value', 0, 10, 0.01).name('uWarpFrequency')
gui.add(uniforms.uWarpStrength, 'value', 0, 1, 0.01).name('uWarpStrength')

// Color tweaks
gui
  .addColor(debugObject, 'colorWaterDeep')
  .onChange(() =>
    uniforms.uColorWaterDeep.value.set(debugObject.colorWaterDeep)
  )
gui
  .addColor(debugObject, 'colorWaterSurface')
  .onChange(() =>
    uniforms.uColorWaterSurface.value.set(debugObject.colorWaterSurface)
  )
gui
  .addColor(debugObject, 'colorSand')
  .onChange(() => uniforms.uColorSand.value.set(debugObject.colorSand))
gui
  .addColor(debugObject, 'colorGrass')
  .onChange(() => uniforms.uColorGrass.value.set(debugObject.colorGrass))
gui
  .addColor(debugObject, 'colorSnow')
  .onChange(() => uniforms.uColorSnow.value.set(debugObject.colorSnow))
gui
  .addColor(debugObject, 'colorRock')
  .onChange(() => uniforms.uColorRock.value.set(debugObject.colorRock))

/**
 * * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 2)
directionalLight.position.set(6.25, 3, 4)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.near = 0.1
directionalLight.shadow.camera.far = 30
directionalLight.shadow.camera.top = 8
directionalLight.shadow.camera.right = 8
directionalLight.shadow.camera.bottom = -8
directionalLight.shadow.camera.left = -8
scene.add(directionalLight)

// * Animation
const clock = new THREE.Clock()
renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime()

  uniforms.uTime.value = elapsedTime

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)
})
