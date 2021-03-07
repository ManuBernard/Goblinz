import "./style.css"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import * as dat from "dat.gui"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

import Ground from "./ground.js"
import Doodads from "./doodads.js"
import debug from "./debug.js"

/**
 * Loaders
 */
const cubeTextureLoader = new THREE.CubeTextureLoader()
const textureLoader = new THREE.TextureLoader()

let worldView = false
/**
 * Base
 */
// Debug

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

/**
 * Game
 */

// Ground
const ground = new Ground(scene)
const doodads = new Doodads(scene)

// Generate world
function generateWorld() {
  // Clean scene
  scene.remove(ground._ground)
  scene.remove(doodads._doodads)

  // Generate and add ground
  ground.generate()
  scene.add(ground._ground)
  doodads.generate(ground._ground)
}

const callbacks = {
  generateWorld: generateWorld,
  inGameCamera: () => {
    camera.position.set(150, 3, 0)
    camera.lookAt(150, 0, -1000)
    worldView = false
  },
  worldCamera: () => {
    worldView = true
    camera.position.set(-150, 90, 70)
    camera.lookAt(0, 0, 0)
  },
}

debug(ground, doodads, callbacks)
callbacks.generateWorld()

/**
 * Lights
 */
const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444)
hemiLight.position.set(0, 20, 0)
hemiLight.intensity = 2
scene.add(hemiLight)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  1000
)

scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Set camera
callbacks.inGameCamera()

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.CineonToneMapping
renderer.toneMappingExposure = 1.7
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

/**
 * Update all material
 */
const updateAllMaterials = () => {
  scene.traverse((child) => {
    if (
      child instanceof THREE.Mesh &&
      child.material instanceof THREE.MeshStandardMaterial
    ) {
      child.material.envMap = environmentMap
      child.material.envMapIntensity = debugObject.envMapIntensity
      child.material.needsUpdate = true
      child.castShadow = true
      child.receiveShadow = true
    }
  })
}

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
  "/static/textures/environmentMaps/out/px.png",
  "/static/textures/environmentMaps/out/nx.png",
  "/static/textures/environmentMaps/out/py.png",
  "/static/textures/environmentMaps/out/ny.png",
  "/static/textures/environmentMaps/out/pz.png",
  "/static/textures/environmentMaps/out/nz.png",
])

environmentMap.encoding = THREE.sRGBEncoding

scene.environment = environmentMap

textureLoader.load("/static/textures/background.png", function (texture) {
  scene.background = texture
})

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update controls
  if (worldView) controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
