import * as THREE from 'three'
import { setupScene } from './setup-scene'
import vertexShader from './shaders/vertex.vert'
import fragmentShader from './shaders/fragment.frag'
import GUI from 'lil-gui'
import gsap from 'gsap'
import { createSky } from './sky'

const gui = new GUI({
  width: 320,
})

// Loaders
const textureLoader = new THREE.TextureLoader().setPath('/particles/')

const canvas = document.querySelector('.webgl') as HTMLCanvasElement
const { scene, camera, renderer, controls, sizes } = setupScene({ canvas })

// * Fireworks
// ^ Textures
const textures = [
  textureLoader.load('1.png'),
  textureLoader.load('2.png'),
  textureLoader.load('3.png'),
  textureLoader.load('4.png'),
  textureLoader.load('5.png'),
  textureLoader.load('6.png'),
  textureLoader.load('7.png'),
  textureLoader.load('8.png'),
]

const createFirework = (
  count: number,
  position: THREE.Vector3,
  size: number,
  texture: THREE.Texture,
  radius: number,
  color: THREE.Color
) => {
  // ^ Positions Array
  const positionsArray = new Float32Array(count * 3)
  const sizesArray = new Float32Array(count)
  const timeMultipliersArray = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    const i3 = i * 3

    const spherical = new THREE.Spherical(
      radius * (0.75 + Math.random() * 0.25),
      Math.random() * Math.PI, // phi
      Math.random() * Math.PI * 2 // theta
    )

    const position = new THREE.Vector3()
    position.setFromSpherical(spherical)

    positionsArray[i3] = position.x
    positionsArray[i3 + 1] = position.y
    positionsArray[i3 + 2] = position.z

    sizesArray[i] = Math.random()

    timeMultipliersArray[i] = 1 + Math.random()
  }

  // ^ Geometry
  const geometry = new THREE.BufferGeometry()

  const positionsAttribute = new THREE.Float32BufferAttribute(positionsArray, 3)
  geometry.setAttribute('position', positionsAttribute)

  const sizesAttribute = new THREE.Float32BufferAttribute(sizesArray, 1)
  geometry.setAttribute('aSize', sizesAttribute)

  const timeMultipliersAttribute = new THREE.Float32BufferAttribute(
    timeMultipliersArray,
    1
  )
  geometry.setAttribute('aTimeMultiplier', timeMultipliersAttribute)

  // ^ Material
  texture.flipY = false // ! Fix texture orientation
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uSize: new THREE.Uniform(size),
      uResolution: new THREE.Uniform(sizes.resolution),
      uTexture: new THREE.Uniform(texture),
      uColor: new THREE.Uniform(color),
      uProgress: new THREE.Uniform(0),
    },

    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })

  // ^ Points
  const firework = new THREE.Points(geometry, material)
  firework.position.copy(position)
  scene.add(firework)

  // ^ Destroy Firework
  const destroyFirework = () => {
    scene.remove(firework)
    geometry.dispose()
    material.dispose()
  }

  // ^ Animate
  gsap.to(material.uniforms.uProgress, {
    value: 1,
    duration: 3,
    ease: 'linear',
    onComplete: destroyFirework,
  })
}

// createFirework(
//   100, // count
//   new THREE.Vector3(), // position
//   0.5, // size
//   textures[7], // texture
//   1, // radius
//   new THREE.Color('#8affff') // color
// )

const createRandomFirework = () => {
  const count = Math.round(400 + Math.random() * 1000)
  const position = new THREE.Vector3(
    (Math.random() - 0.5) * 2,
    Math.random(),
    (Math.random() - 0.5) * 2
  )
  const size = 0.1 + Math.random() * 0.1
  const texture = textures[Math.floor(Math.random() * textures.length)]
  const radius = 0.5 + Math.random()
  const color = new THREE.Color()
  color.setHSL(Math.random(), 1, 0.7)

  createFirework(count, position, size, texture, radius, color)
}
createRandomFirework()

window.addEventListener('click', createRandomFirework)

// Sky
createSky(scene, camera, renderer, gui)

// Animation
const clock = new THREE.Clock()
renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime()

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)
})
