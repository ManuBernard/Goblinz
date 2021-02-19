import "./style.css"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import * as dat from "dat.gui"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { log, Raycaster } from "three"

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const debugObject = {}

// Canvas
const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()

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
  "/textures/environmentMaps/0/px.jpg",
  "/textures/environmentMaps/0/nx.jpg",
  "/textures/environmentMaps/0/py.jpg",
  "/textures/environmentMaps/0/ny.jpg",
  "/textures/environmentMaps/0/pz.jpg",
  "/textures/environmentMaps/0/nz.jpg",
])

environmentMap.encoding = THREE.sRGBEncoding

scene.background = environmentMap
scene.environment = environmentMap

debugObject.envMapIntensity = 5
gui
  .add(debugObject, "envMapIntensity")
  .min(0)
  .max(10)
  .step(0.001)
  .onChange(updateAllMaterials)

/**
 * Models
 */
const world = {
  groundChunk: 2,
  doodadsPerChunk: 10,
  doodadsStartAt: 4,
  posConstraintMin: 0,
  scaleVariation: 0.6,
}

gui
  .add(world, "groundChunk")
  .min(1)
  .max(15)
  .step(1)
  .onFinishChange(generateWorld)

gui
  .add(world, "doodadsPerChunk")
  .min(1)
  .max(20)
  .step(1)
  .onFinishChange(generateWorld)

gui
  .add(world, "scaleVariation")
  .min(0.1)
  .max(2)
  .step(0.001)
  .onFinishChange(generateWorld)

generateWorld()

function generateWorld() {
  // Clean scene-
  scene.children.forEach((child) => {
    if (child.name == "Ground") {
      scene.remove(child)
    }
  })

  // Ground
  gltfLoader.load("/models/goblins-ground.glb", (gltf) => {
    const box = new THREE.Box3().setFromObject(gltf.scene)
    const groundSize = new THREE.Vector3()

    box.getSize(groundSize)

    const ground = new THREE.Group()
    ground.name = "Ground"

    for (let i = 0; i < world.groundChunk; i++) {
      const groundChunk = gltf.scene.clone()
      groundChunk.position.x = groundSize.x * i
      ground.add(groundChunk)
    }

    scene.add(ground)

    updateAllMaterials()

    loadDoodads(ground)
  })
}

// Doodads
function loadDoodads(ground) {
  const box = new THREE.Box3().setFromObject(ground)
  const groundX = box.getSize().x
  const groundY = box.getSize().y
  const groundZ = box.getSize().z

  gltfLoader.load("/models/goblins-doodads.glb", (gltf) => {
    const doodads = gltf.scene.children
    const doodadsContainer = new THREE.Group()

    doodadsContainer.name = "Doodads"

    for (let i = 0; i < world.doodadsPerChunk * world.groundChunk; i++) {
      doodads.forEach((doodad) => {
        const doodadCopy = doodad.clone()

        // Calculate scale
        let scaleFactor = (Math.random() - 0.5) * world.scaleVariation + 1

        doodadCopy.scale.x *= scaleFactor
        doodadCopy.scale.y *= scaleFactor
        doodadCopy.scale.z *= scaleFactor

        // Calculate x & z coordinate
        const x = Math.random() * groundX
        const z = -(
          Math.random() * (groundZ - world.posConstraintMin) +
          world.posConstraintMin
        )

        // Calculate y coordinate using raycaster
        const rayCasterOffsetY = 1
        const doodadYPosRaycaster = new THREE.Raycaster()
        const rayOrigin = new THREE.Vector3(x, groundY + rayCasterOffsetY, z)
        const rayDirection = new THREE.Vector3(0, -1, 0)

        rayDirection.normalize()
        doodadYPosRaycaster.set(rayOrigin, rayDirection)

        const intersects = doodadYPosRaycaster.intersectObjects(
          ground.children,
          true
        )

        if (intersects[0].object.name == "Path") return

        const doodadBox = new THREE.Box3().setFromObject(doodadCopy)
        let doodadSize = new THREE.Vector3()
        doodadBox.getSize(doodadSize)

        const y = groundY + rayCasterOffsetY - intersects[0].distance

        console.log(intersects)
        // Calculate rotation
        const doodadRotation = Math.random() * Math.PI * 2
        doodadCopy.position.x = x
        doodadCopy.position.y = y
        doodadCopy.position.z = z

        doodadCopy.rotation.z = doodadRotation

        doodadsContainer.add(doodadCopy)
      })

      ground.add(doodadsContainer)
    }
  })
}
/**
 * Lights
 */

const directionalLight = new THREE.DirectionalLight("#ffffff", 3)
directionalLight.position.set(0.25, 3, -2.25)
directionalLight.castShadow = true
directionalLight.shadow.camera.far = 15
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.normalBias = 0.05

const directionalLightCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
)

scene.add(directionalLightCameraHelper)

scene.add(directionalLight)

gui
  .add(directionalLight, "intensity")
  .min(0)
  .max(10)
  .step(0.001)
  .name("lightIntensity")

gui
  .add(directionalLight.position, "x")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("lightX")

gui
  .add(directionalLight.position, "y")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("lightY")

gui
  .add(directionalLight.position, "z")
  .min(-5)
  .max(5)
  .step(0.001)
  .name("lightZ")

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
  100
)
camera.position.set(-10, 7, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
})

renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 3
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

gui
  .add(renderer, "toneMapping", {
    No: THREE.NoToneMapping,
    Linear: THREE.LinearToneMapping,
    Reinhard: THREE.ReinhardToneMapping,
    Cineon: THREE.CineonToneMapping,
    ACESFilmic: THREE.ACESFilmicToneMapping,
  })
  .onFinishChange(() => {
    renderer.toneMapping = Number(renderer.toneMapping)
    updateAllMaterials()
  })

gui.add(renderer, "toneMappingExposure").min(0).max(10).step(0.001)

/**
 * Animate
 */
const tick = () => {
  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
