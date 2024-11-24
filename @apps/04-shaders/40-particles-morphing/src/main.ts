import * as THREE from 'three'
import { setupScene } from './setup-scene'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import GUI from 'lil-gui'
import gsap from 'gsap'
// Shaders
import vertexShader from './shaders/vertex.vert'
import fragmentShader from './shaders/fragment.frag'

const gui = new GUI({ width: 320 })
const debugObject = {
  clearColor: '#160920',
}

// Loaders
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

// Scene
const canvas = document.querySelector('.webgl') as HTMLCanvasElement
const { scene, camera, renderer, controls } = setupScene({ canvas })

/*
 * Particles
 */
interface Particles {
  geometry?: THREE.SphereGeometry | THREE.BufferGeometry
  material?: THREE.ShaderMaterial
  points?: THREE.Points
  maxCount?: number
  positions?: THREE.BufferAttribute[]
  index: number

  // Morph methods
  morph: (index: number) => void
  morph0: () => void
  morph1: () => void
  morph2: () => void
  morph3: () => void

  // Material Colors
  colorA: THREE.Color
  colorB: THREE.Color
}
const particles = {} as Particles
const pixelRatio = renderer.getPixelRatio()

// * Load Models
gltfLoader.load('models.glb', gltf => {
  const positions = gltf.scene.children.map(child => {
    if (child instanceof THREE.Mesh) {
      return child.geometry.attributes.position
    }
  }) as THREE.BufferAttribute[]
  // console.log(positions)

  particles.index = 0
  particles.maxCount = 0
  for (const position of positions) {
    if (position.count > particles.maxCount) {
      particles.maxCount = position.count
    }
  }
  /*
  ^ The problem:
  - The number of vertices of each model is different
  
  ^ The solution:
  - If we want to use the same geometry for all models, we need to make the number of vertices the same
  - We can do this by creating a new array with the maximum number of vertices and
    filling the rest with random position
*/
  particles.positions = []
  for (const position of positions) {
    /*
  ^ Description:
  - Create a new array with the max count of particles * 3 (x, y, z)
  - Loop through the max count of particles
  - If the index is less than the original array length, copy the value from the original array
  - Otherwise, set to random position
*/

    // Array of positions of each model (Float32Array)
    const originalArray = position.array
    /*
      The new array will have the max count of particles * 3 (x, y, z)
      Will store the positions of original array and if the original array is
      shorter than the max count(from all models), it will fill the rest with random position
    */
    const newArray = new Float32Array(particles.maxCount * 3)

    for (let i = 0; i < particles.maxCount; i++) {
      const i3 = i * 3

      /*
        If the index is less than the original array length, copy the value from the original array
        Otherwise, set to random position
      */
      if (i3 < originalArray.length) {
        newArray[i3] = originalArray[i3]
        newArray[i3 + 1] = originalArray[i3 + 1]
        newArray[i3 + 2] = originalArray[i3 + 2]
      } else {
        // If the model's position count is less than the original array, fill them with random position
        const randomIndex = Math.floor(position.count * Math.random()) * 3
        newArray[i3] = originalArray[randomIndex]
        newArray[i3 + 1] = originalArray[randomIndex + 1]
        newArray[i3 + 2] = originalArray[randomIndex + 2]
      }
    }

    // Create a new Float32BufferAttribute with the same length for each model
    particles.positions.push(new THREE.Float32BufferAttribute(newArray, 3))
  }
  // console.log(particles.positions)

  // ^ Particles geometry
  // particles.geometry = new THREE.SphereGeometry(3)
  // & Disable index to remove extra vertices in the geometry
  // particles.geometry.setIndex(null)
  const sizesArray = new Float32Array(particles.maxCount)
  for (let i = 0; i < particles.maxCount; i++) {
    sizesArray[i] = Math.random()
  }

  particles.geometry = new THREE.BufferGeometry()
  particles.geometry?.setAttribute(
    'position',
    particles.positions[particles.index]
  )
  particles.geometry?.setAttribute('aPositionTarget', particles.positions[3])
  particles.geometry.setAttribute(
    'aSize',
    new THREE.Float32BufferAttribute(sizesArray, 1)
  )

  // ^ Particles material
  particles.colorA = new THREE.Color(0.05, 0.63, 0.88)
  particles.colorB = new THREE.Color(0.88, 0.44, 0.03)
  particles.material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uSize: new THREE.Uniform(0.4),
      uResolution: new THREE.Uniform(
        new THREE.Vector2(
          window.innerWidth * pixelRatio,
          window.innerHeight * pixelRatio
        )
      ),
      uProgress: new THREE.Uniform(0),
      uColorA: new THREE.Uniform(particles.colorA),
      uColorB: new THREE.Uniform(particles.colorB),
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  })

  // Points
  particles.points = new THREE.Points(particles.geometry, particles.material)
  /*
    Fix bounding error
    - When we morph the particles, the bounding sphere is not updated it still uses the old one
    - So, we need to disable frustum culling
    Frustrum calling is basically checking if the particles are in the camera's frustum
    If they are not, they are not rendered
  */
  particles.points.frustumCulled = false
  scene.add(particles.points)

  // ^ Methods
  particles.morph = (index: number) => {
    if (particles.positions && particles.geometry && particles.material) {
      // Current position = particles.index (previous index)
      particles.geometry.attributes.position =
        particles.positions[particles.index]

      // Target position = passed index
      particles.geometry.attributes.aPositionTarget = particles.positions[index]

      // Animate uProgress
      gsap.fromTo(
        particles.material.uniforms.uProgress,
        { value: 0 },
        // Linear easing cuz we already have our own easing in the shader
        { value: 1, duration: 3, ease: 'linear' }
      )

      // Save index for next morph
      particles.index = index
    }
  }
  particles.morph0 = () => particles.morph(0)
  particles.morph1 = () => particles.morph(1)
  particles.morph2 = () => particles.morph(2)
  particles.morph3 = () => particles.morph(3)

  // ^ Tweaks
  // Material Color
  gui.addColor(particles, 'colorA').onChange(() => {
    particles.material?.uniforms.uColorA.value.set(particles.colorA)
  })
  gui.addColor(particles, 'colorB').onChange(() => {
    particles.material?.uniforms.uColorB.value.set(particles.colorB)
  })

  // Progress
  gui
    .add(particles.material.uniforms.uProgress, 'value', 0, 1, 0.01)
    .name('uProgress')
    .listen()

  // Morph buttons
  gui.add(particles, 'morph0')
  gui.add(particles, 'morph1')
  gui.add(particles, 'morph2')
  gui.add(particles, 'morph3')
})

// Render
gui.addColor(debugObject, 'clearColor').onChange(() => {
  renderer.setClearColor(debugObject.clearColor)
})
renderer.setClearColor(debugObject.clearColor)

// Resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  // Update particles material resolution
  particles.material?.uniforms.uResolution.value.set(
    window.innerWidth * pixelRatio,
    window.innerHeight * pixelRatio
  )

  renderer.setSize(window.innerWidth, window.innerHeight)
})

// * Animation
const clock = new THREE.Clock()
renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime()

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)
})
