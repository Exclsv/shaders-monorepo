import * as THREE from 'three'
import { setupScene } from './setup-scene'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import GUI from 'lil-gui'
import vertexShader from './shaders/vertex.vert'
import fragmentShader from './shaders/fragment.frag'

const gui = new GUI()

// Loader
const gltfLoader = new GLTFLoader()
const textureLoader = new THREE.TextureLoader()

const canvas = document.querySelector('.webgl') as HTMLCanvasElement
const { scene, camera, renderer, controls } = setupScene({ canvas })

gltfLoader.load('./bakedModel.glb', gltf => {
  const bakedMesh = gltf.scene.getObjectByName('baked') as THREE.Mesh
  const material = bakedMesh?.material as
    | THREE.MeshStandardMaterial
    | THREE.MeshBasicMaterial
  material.map!.anisotropy = 8

  scene.add(gltf.scene)
})

// * Smoke
// ^ Geometry
const smokeGeometry = new THREE.PlaneGeometry(1, 1, 16, 64)
// Move the origin to the bottom of the smoke
smokeGeometry.translate(0, 0.5, 0)
// Scale the smoke
smokeGeometry.scale(1.5, 6, 1.5)

// Texture
const perlinTexture = textureLoader.load('perlin.png')
perlinTexture.wrapS = THREE.RepeatWrapping
perlinTexture.wrapT = THREE.RepeatWrapping

// ^ Material
const smokeMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  side: THREE.DoubleSide,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uPerlinTexture: new THREE.Uniform(perlinTexture),
  },
  transparent: true,
  depthWrite: false, // removes occlusion
  // wireframe: true,
})

// ^ Mesh
const smoke = new THREE.Mesh(smokeGeometry, smokeMaterial)
smoke.position.y = 1.83
scene.add(smoke)

// Animation
const clock = new THREE.Clock()
renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime()
  // Update uniforms
  smokeMaterial.uniforms.uTime.value = elapsedTime

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)
})
