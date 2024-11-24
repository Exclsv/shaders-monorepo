import * as THREE from 'three'
import { setupScene } from './setup-scene'
import GUI from 'lil-gui'
import vertexShader from './shaders/vertex.vert'
import fragmentShader from './shaders/fragment.frag'

const gui = new GUI()

// Loaders
const textureLoader = new THREE.TextureLoader()

// Scene
const canvas = document.querySelector('.webgl') as HTMLCanvasElement
const { scene, camera, renderer, controls } = setupScene({ canvas })

//  * Canvas 2D
const canvas2D = document.createElement('canvas')
canvas2D.width = 128
canvas2D.height = 128
document.body.appendChild(canvas2D)
canvas2D.classList.add('displacement-canvas')

// Context
const context2D = canvas2D.getContext('2d')
context2D?.fillRect(0, 0, canvas2D.width, canvas2D.height)

// Glow image
const glowImage = new Image()
glowImage.src = './glow.png'

// * Interactive plane
const interactivePlane = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshBasicMaterial({ color: 'red', side: THREE.DoubleSide })
)
interactivePlane.visible = false
scene.add(interactivePlane)

// Raycaster
const raycaster = new THREE.Raycaster()

// Coordinates - (away from the screen by default to avoid triggering the raycaster on load)
const screenCursor = new THREE.Vector2(9999, 9999)
const canvasCursor = new THREE.Vector2(9999, 9999)
const canvasCursorPrevious = new THREE.Vector2(9999, 9999)

// * Pointer move - (Event listener)
window.addEventListener('pointermove', event => {
  screenCursor.x = (event.clientX / window.innerWidth) * 2 - 1
  screenCursor.y = -(event.clientY / window.innerHeight) * 2 + 1
  // console.log(screenCursor)
})

// Texture
const canvasTexture = new THREE.CanvasTexture(canvas2D)

/**
 * Particles
 */
const particlesGeometry = new THREE.PlaneGeometry(10, 10, 128, 128)
/*
  Be default the geometry has an index, but we don't need it for this example
  It adds additional vertices to the geometry, and as a result, the buffer is loaded with more
  vertices than needed. To render only one particle per point, we need to remove the index.
*/
particlesGeometry.setIndex(null)
// As we don't use normal, we can just delete it
particlesGeometry.deleteAttribute('normal')
const pictureTexture = textureLoader.load('./picture-4.png')

// ^ Intensity
const intensityArray = new Float32Array(
  particlesGeometry.attributes.position.count
)
// ^ Angle
const angleArray = new Float32Array(particlesGeometry.attributes.position.count)
for (let i = 0; i < intensityArray.length; i++) {
  intensityArray[i] = Math.random()
  angleArray[i] = Math.random() * Math.PI * 2 // 0 to 360 degrees
}
// & Intensity & Angle attributes
particlesGeometry.setAttribute(
  'aIntensity',
  new THREE.BufferAttribute(intensityArray, 1)
)
particlesGeometry.setAttribute(
  'aAngle',
  new THREE.BufferAttribute(angleArray, 1)
)

// * Particles material
const pixelRatio = renderer.getPixelRatio()
const particlesMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uResolution: new THREE.Uniform(
      new THREE.Vector2(
        window.innerWidth * pixelRatio,
        window.innerHeight * pixelRatio
      )
    ),
    uPictureTexture: new THREE.Uniform(pictureTexture),
    uDisplacementTexture: new THREE.Uniform(canvasTexture),
  },
  blending: THREE.AdditiveBlending,
})
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

// * Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  particlesMaterial.uniforms.uResolution.value.set(
    window.innerWidth * pixelRatio,
    window.innerHeight * pixelRatio
  )

  renderer.setSize(window.innerWidth, window.innerHeight)
})

// * Animation
const clock = new THREE.Clock()
renderer.setAnimationLoop(() => {
  const elapsedTime = clock.getElapsedTime()

  // * Raycaster
  raycaster.setFromCamera(screenCursor, camera)
  const intersections = raycaster.intersectObject(interactivePlane)

  if (intersections.length) {
    const uv = intersections[0].uv // from 0 to 1
    // console.log(uv)
    canvasCursor.x = uv!.x * canvas2D.width
    canvasCursor.y = (1 - uv!.y) * canvas2D.height

    console.log(canvasCursor)
  }

  // * Displacement
  context2D!.globalCompositeOperation = 'source-over'
  context2D!.globalAlpha = 0.02
  context2D?.fillRect(0, 0, canvas2D.width, canvas2D.height)

  // Speed alpha
  const cursorDistance = canvasCursorPrevious.distanceTo(canvasCursor)
  canvasCursorPrevious.copy(canvasCursor)
  const alpha = Math.min(cursorDistance * 0.1, 1)

  // * Draw the glow image on the canvas
  const glowSize = canvas2D.width * 0.25
  context2D!.globalCompositeOperation = 'lighten'
  context2D!.globalAlpha = alpha // Reset global alpha
  context2D?.drawImage(
    glowImage,
    // Move the glow image to the cursor position
    canvasCursor.x - glowSize * 0.5,
    canvasCursor.y - glowSize * 0.5,
    glowSize,
    glowSize
  )

  // Update the canvas texture
  canvasTexture.needsUpdate = true

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)
})
