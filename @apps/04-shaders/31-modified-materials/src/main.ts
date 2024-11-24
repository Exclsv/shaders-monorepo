import * as THREE from 'three'
import { setupScene } from './setup-scene'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import vertexShader from './shaders/vertex.vert'
import modelVertexShader from './shaders/model.vert'
import normalVertexShader from './shaders/normal.vert'
import GUI from 'lil-gui'
import { updateAllMaterials } from './utils/lib'

const gui = new GUI()

const canvas = document.querySelector('.webgl') as HTMLCanvasElement
const { scene, camera, renderer, controls } = setupScene({ canvas })

// Loaders
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

// Update all materials

// Environment map
cubeTextureLoader.setPath('/textures/environmentMaps/0/')
const environmentMap = cubeTextureLoader.load([
  'px.jpg',
  'nx.jpg',
  'py.jpg',
  'ny.jpg',
  'pz.jpg',
  'nz.jpg',
])

scene.background = environmentMap
scene.environment = environmentMap

/**
 * Material
 */

// Textures
const mapTexture = textureLoader.load('/models/LeePerrySmith/color.jpg')
mapTexture.colorSpace = THREE.SRGBColorSpace
const normalTexture = textureLoader.load('/models/LeePerrySmith/normal.jpg')

// Material
const material = new THREE.MeshStandardMaterial({
  map: mapTexture,
  normalMap: normalTexture,
})

const depthMaterial = new THREE.MeshDepthMaterial({
  // To get the depth in RGBA format to have more precision
  depthPacking: THREE.RGBADepthPacking,
})

const customUniforms = {
  uTime: { value: 0 },
}

material.onBeforeCompile = shader => {
  shader.uniforms.uTime = customUniforms.uTime
  shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    vertexShader
  )
  shader.vertexShader = shader.vertexShader.replace(
    '#include <beginnormal_vertex>',
    normalVertexShader
  )
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    modelVertexShader
  )
}

depthMaterial.onBeforeCompile = shader => {
  shader.uniforms.uTime = customUniforms.uTime
  shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    vertexShader
  )
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    modelVertexShader
  )
}

/**
 * Models
 */
gltfLoader.load('/models/LeePerrySmith/LeePerrySmith.glb', gltf => {
  // Model
  const mesh = gltf.scene.children[0] as THREE.Mesh
  mesh.rotation.y = Math.PI * 0.5
  mesh.material = material

  // Update depth material
  mesh.customDepthMaterial = depthMaterial

  scene.add(mesh)

  // Update materials
  updateAllMaterials(scene)
})

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 2, -2.25)
scene.add(directionalLight)

// Renderer
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1

// Animation
const clock = new THREE.Clock()
renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime()

  // Update custom uniforms
  customUniforms.uTime.value = elapsedTime

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)
})
