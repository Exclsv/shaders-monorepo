import * as THREE from 'three'
import { setupScene } from './setup-scene'
import GUI from 'lil-gui'
import vertexShader from './shaders/earth/vertex.vert'
import fragmentShader from './shaders/earth/fragment.frag'
import atmosphereFragmentShader from './shaders/atmosphere/fragment.frag'
import atmosphereVertexShader from './shaders/atmosphere/vertex.vert'

const gui = new GUI()

// Loaders
const textureLoader = new THREE.TextureLoader()

// Scene
const canvas = document.querySelector('.webgl') as HTMLCanvasElement
const { scene, camera, renderer, controls } = setupScene({ canvas })

/**
 * Earth
 */
const earthParams = {
  atmosphereDayColor: '#00aaff',
  atmosphereTwilightColor: '#ff6600',
}
gui.addColor(earthParams, 'atmosphereDayColor').onChange(() => {
  earthMaterial.uniforms.uAtmosphereDayColor.value.set(
    earthParams.atmosphereDayColor
  )
  atmosphereMaterial.uniforms.uAtmosphereDayColor.value.set(
    earthParams.atmosphereDayColor
  )
})
gui.addColor(earthParams, 'atmosphereTwilightColor').onChange(() => {
  earthMaterial.uniforms.uAtmosphereTwilightColor.value.set(
    earthParams.atmosphereTwilightColor
  )
  atmosphereMaterial.uniforms.uAtmosphereTwilightColor.value.set(
    earthParams.atmosphereTwilightColor
  )
})
// * Textures
const earthDayTexture = textureLoader.load('./earth/day.jpg')
earthDayTexture.colorSpace = THREE.SRGBColorSpace
earthDayTexture.anisotropy = 8 // ? Makes the texture look sharper

const earthNightTexture = textureLoader.load('./earth/night.jpg')
earthNightTexture.colorSpace = THREE.SRGBColorSpace
earthNightTexture.anisotropy = 8

const earthSpecularCloudsTexture = textureLoader.load(
  './earth/specularClouds.jpg'
)
earthSpecularCloudsTexture.anisotropy = 8
earthSpecularCloudsTexture.wrapS = THREE.RepeatWrapping
earthSpecularCloudsTexture.wrapT = THREE.RepeatWrapping

// * Mesh
const earthGeometry = new THREE.SphereGeometry(2, 64, 64)
const earthMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: new THREE.Uniform(0),
    uDayTexture: new THREE.Uniform(earthDayTexture),
    uNightTexture: new THREE.Uniform(earthNightTexture),
    uSpecularCloudsTexture: new THREE.Uniform(earthSpecularCloudsTexture),
    uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
    uAtmosphereDayColor: new THREE.Uniform(
      new THREE.Color(earthParams.atmosphereDayColor)
    ),
    uAtmosphereTwilightColor: new THREE.Uniform(
      new THREE.Color(earthParams.atmosphereTwilightColor)
    ),
  },
})
const earth = new THREE.Mesh(earthGeometry, earthMaterial)
scene.add(earth)

// Atmosphere
const atmosphereMaterial = new THREE.ShaderMaterial({
  vertexShader: atmosphereVertexShader,
  fragmentShader: atmosphereFragmentShader,
  side: THREE.BackSide,
  transparent: true,
  uniforms: {
    uSunDirection: new THREE.Uniform(new THREE.Vector3(0, 0, 1)),
    uAtmosphereDayColor: new THREE.Uniform(
      new THREE.Color(earthParams.atmosphereDayColor)
    ),
    uAtmosphereTwilightColor: new THREE.Uniform(
      new THREE.Color(earthParams.atmosphereTwilightColor)
    ),
  },
})
const atmosphere = new THREE.Mesh(earthGeometry, atmosphereMaterial)
atmosphere.scale.setScalar(1.04)
scene.add(atmosphere)

// * Sun
// ! Keep an eye on the sun radius, if it's not 1, the direction should be normalized
const sunSpherical = new THREE.Spherical(1, Math.PI * 0.5, 0.5)
const sunDirection = new THREE.Vector3()

// * Debug
const debugSun = new THREE.Mesh(
  new THREE.IcosahedronGeometry(0.1, 2),
  new THREE.MeshBasicMaterial()
)
scene.add(debugSun)

// * Update
const updateSun = () => {
  // Gets the direction from the spherical coordinates
  sunDirection.setFromSpherical(sunSpherical)

  // Debug
  debugSun.position.copy(sunDirection).multiplyScalar(5)

  // Update shader
  earthMaterial.uniforms.uSunDirection.value.copy(sunDirection)
  atmosphereMaterial.uniforms.uSunDirection.value.copy(sunDirection)
}
updateSun()

// Tweaks
gui.add(sunSpherical, 'phi').min(0).max(Math.PI).onChange(updateSun)
gui.add(sunSpherical, 'theta').min(-Math.PI).max(Math.PI).onChange(updateSun)

// * Animation
const clock = new THREE.Clock()
renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime()

  // Update shader
  earthMaterial.uniforms.uTime.value = elapsedTime

  // Rotate earth
  earth.rotation.y = elapsedTime * 0.1

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)
})
