import GUI from 'lil-gui'
import * as THREE from 'three'
import { Sky } from 'three/addons/objects/Sky.js'
export function createSky(
  scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  gui: GUI
) {
  // Add Sky
  const sky = new Sky()
  sky.scale.setScalar(450000)
  scene.add(sky)

  const sun = new THREE.Vector3()

  /// GUI

  const skyParameters = {
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.95,
    elevation: -2.2,
    azimuth: 180,
    exposure: renderer.toneMappingExposure,
  }

  function updateSky() {
    const uniforms = sky.material.uniforms
    uniforms['turbidity'].value = skyParameters.turbidity
    uniforms['rayleigh'].value = skyParameters.rayleigh
    uniforms['mieCoefficient'].value = skyParameters.mieCoefficient
    uniforms['mieDirectionalG'].value = skyParameters.mieDirectionalG

    const phi = THREE.MathUtils.degToRad(90 - skyParameters.elevation)
    const theta = THREE.MathUtils.degToRad(skyParameters.azimuth)

    sun.setFromSphericalCoords(1, phi, theta)

    uniforms['sunPosition'].value.copy(sun)

    renderer.toneMappingExposure = skyParameters.exposure
    renderer.render(scene, camera)
  }

  gui.add(skyParameters, 'turbidity', 0.0, 20.0, 0.1).onChange(updateSky)
  gui.add(skyParameters, 'rayleigh', 0.0, 4, 0.001).onChange(updateSky)
  gui.add(skyParameters, 'mieCoefficient', 0.0, 0.1, 0.001).onChange(updateSky)
  gui.add(skyParameters, 'mieDirectionalG', 0.0, 1, 0.001).onChange(updateSky)
  gui.add(skyParameters, 'elevation', -4, 8, 0.1).onChange(updateSky)
  gui.add(skyParameters, 'azimuth', -180, 180, 0.1).onChange(updateSky)
  gui.add(skyParameters, 'exposure', 0, 1, 0.0001).onChange(updateSky)

  updateSky()
}
