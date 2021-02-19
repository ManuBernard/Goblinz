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
const loader = new THREE.TextureLoader()

/**
 * Base
 */
// Debug
const gui = new dat.GUI()
const debugObject = {}

debugObject.background = "#c1eaf7"
debugObject.fogNear = 4
debugObject.fogFar = 45
// Canvas

const canvas = document.querySelector("canvas.webgl")

// Scene
const scene = new THREE.Scene()
scene.fog = new THREE.Fog(
  debugObject.background,
  debugObject.fogNear,
  debugObject.fogFar
)

const debugFolderFog = gui.addFolder("Fog")

debugFolderFog.addColor(debugObject, "background").onChange(() => {
  // scene.background.set(debugObject.background)
  scene.fog.color.set(debugObject.background)
})

debugFolderFog
  .add(debugObject, "fogNear")
  .min(1)
  .max(10)
  .step(1)
  .onChange(() => {
    scene.fog.near = debugObject.fogNear
  })

debugFolderFog
  .add(debugObject, "fogFar")
  .min(2)
  .max(70)
  .step(1)
  .onChange(() => {
    scene.fog.far = debugObject.fogFar
  })

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
  "/textures/environmentMaps/out/px.png",
  "/textures/environmentMaps/out/nx.png",
  "/textures/environmentMaps/out/py.png",
  "/textures/environmentMaps/out/ny.png",
  "/textures/environmentMaps/out/pz.png",
  "/textures/environmentMaps/out/nz.png",
])

environmentMap.encoding = THREE.sRGBEncoding

scene.environment = environmentMap

loader.load("/textures/background.png", function (texture) {
  scene.background = texture
})

debugObject.envMapIntensity = 0.4
gui
  .add(debugObject, "envMapIntensity")
  .min(0)
  .max(10)
  .step(0.001)
  .onChange(updateAllMaterials)

/**
 * Models
 */
debugObject.world = {
  groundChunk: 3,
  doodads: {
    arbre: {
      density: 7,
      scaleVariation: 0.5,
      depthMin: 8,
      collideDistance: 1,
    },
    sapin: {
      density: 25,
      scaleVariation: 0.7,
      depthMin: 17,
      collideDistance: 1,
    },
    herbe: {
      density: 300,
      scaleVariation: 3,
      depthMin: 0,
      depthMax: 10,
      collideDistance: 0,
    },
    rocher1: {
      density: 8,
      scaleVariation: 3,
      depthMin: 0,
      depthMax: 20,
      collideDistance: 1,
    },
    rocher2: {
      density: 8,
      scaleVariation: 3,
      depthMin: 10,
      depthMax: 20,
      collideDistance: 1,
    },
    rocherbranche: {
      density: 1,
      scaleVariation: 0,
      depthMin: 10,
      depthMax: 20,
      collideDistance: 1,
    },
    champignon1: {
      density: 18,
      scaleVariation: 1.5,
      depthMin: 0,
      depthMax: 15,
      collideDistance: 0,
    },
    champignon2: {
      density: 28,
      scaleVariation: 1.5,
      depthMin: 0,
      depthMax: 20,
      collideDistance: 0,
    },
    buisson: {
      density: 8,
      scaleVariation: 1.5,
      depthMin: 7,
      depthMax: 20,
      collideDistance: 0,
    },
    souche: {
      density: 3,
      scaleVariation: 1.5,
      depthMin: 7,
      depthMax: 20,
      collideDistance: 0,
    },
    branche: {
      density: 3,
      scaleVariation: 1.5,
      depthMin: 10,
      depthMax: 20,
      collideDistance: 0,
    },
  },
}

const debugFolderGround = gui.addFolder("World Generation")

debugFolderGround
  .add(debugObject.world, "groundChunk")
  .min(1)
  .max(15)
  .step(1)
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

    for (let i = 0; i < debugObject.world.groundChunk; i++) {
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
    const existingCoordinates = []

    doodadsContainer.name = "Doodads"

    // Foreach chunk
    for (let chunkI = 0; chunkI < debugObject.world.groundChunk; chunkI++) {
      // Foreach doodads
      doodads.forEach((doodad) => {
        const doodadSettings = debugObject.world.doodads[doodad.name]

        if (doodadSettings) {
          // Loop in doodads density
          for (let i = 0; i < doodadSettings.density; i++) {
            const doodadCopy = doodad.clone()

            // Calculate scale
            let scaleFactor = Math.abs(
              (Math.random() - 0.5) * doodadSettings.scaleVariation + 1
            )

            doodadCopy.scale.x *= scaleFactor
            doodadCopy.scale.y *= scaleFactor
            doodadCopy.scale.z *= scaleFactor

            // Calculate x & z coordinate
            const x =
              Math.random() * (groundX / debugObject.world.groundChunk) +
              chunkI * (groundX / debugObject.world.groundChunk)
            const depthConstraintMin = doodadSettings.depthMin
              ? doodadSettings.depthMin
              : 0
            const depthConstraintMax = doodadSettings.depthMax
              ? doodadSettings.depthMax
              : groundZ

            const z = -(
              Math.random() * (depthConstraintMax - depthConstraintMin) +
              depthConstraintMin
            )

            // Calculate y coordinate using raycaster
            const rayCasterOffsetY = 1
            const doodadYPosRaycaster = new THREE.Raycaster()
            const rayOrigin = new THREE.Vector3(
              x,
              groundY + rayCasterOffsetY,
              z
            )
            const rayDirection = new THREE.Vector3(0, -1, 0)

            rayDirection.normalize()
            doodadYPosRaycaster.set(rayOrigin, rayDirection)

            const intersects = doodadYPosRaycaster.intersectObjects(
              ground.children,
              true
            )

            let applyDoodad = true
            // Don't pop doodads on the path
            if (intersects[0].object.name == "Path") {
              applyDoodad = false
            }

            // Check if as collision with existing doodads to avoid ugly results
            if (doodadSettings.collideDistance) {
              existingCoordinates.forEach((coordinate) => {
                if (
                  x > coordinate.x - doodadSettings.collideDistance &&
                  x < coordinate.x + doodadSettings.collideDistance &&
                  z > coordinate.z - doodadSettings.collideDistance &&
                  z < coordinate.z + doodadSettings.collideDistance
                ) {
                  applyDoodad = false
                }
              })
            }

            if (!applyDoodad) {
              i = i - 1
              continue
            }

            // Save coordinate to avoic collisions
            if (doodadSettings.collideDistance > 0)
              existingCoordinates.push({ x: x, z: z })

            const doodadBox = new THREE.Box3().setFromObject(doodadCopy)
            let doodadSize = new THREE.Vector3()
            doodadBox.getSize(doodadSize)

            const y = groundY + rayCasterOffsetY - intersects[0].distance

            // Calculate rotation
            const doodadRotation = Math.random() * Math.PI * 2
            doodadCopy.position.x = x
            doodadCopy.position.y = y
            doodadCopy.position.z = z

            doodadCopy.rotation.z = doodadRotation

            doodadsContainer.add(doodadCopy)
          }
        }
      })
    }

    ground.add(doodadsContainer)
  })
}
/**
 * Lights
 */

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444)
hemiLight.position.set(0, 20, 0)
hemiLight.intensity = 2
scene.add(hemiLight)

gui
  .add(hemiLight, "intensity")
  .min(0)
  .max(10)
  .step(0.001)
  .name("hemiLightIntensity")

const dirLight = new THREE.DirectionalLight(0xffffff)

// const directionalLight = new THREE.DirectionalLight("#ffffff", 3)
// directionalLight.position.set(0.25, 3, -2.25)
// directionalLight.castShadow = true
// directionalLight.shadow.camera.far = 15
// directionalLight.shadow.mapSize.set(1024, 1024)
// directionalLight.shadow.normalBias = 0.05

// const directionalLightCameraHelper = new THREE.CameraHelper(
//   directionalLight.shadow.camera
// )

// scene.add(directionalLightCameraHelper)

// scene.add(directionalLight)

// gui
//   .add(directionalLight, "intensity")
//   .min(0)
//   .max(10)
//   .step(0.001)
//   .name("lightIntensity")

// gui
//   .add(directionalLight.position, "x")
//   .min(-5)
//   .max(5)
//   .step(0.001)
//   .name("lightX")

// gui
//   .add(directionalLight.position, "y")
//   .min(-5)
//   .max(5)
//   .step(0.001)
//   .name("lightY")

// gui
//   .add(directionalLight.position, "z")
//   .min(-5)
//   .max(5)
//   .step(0.001)
//   .name("lightZ")

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
  60,
  sizes.width / sizes.height,
  0.1,
  100
)

scene.add(camera)

// Controls
let controls = null

const debugFolderCamera = gui.addFolder("Camera")

debugObject.viewWorld = function () {
  camera.position.set(-10, 10, 5)
  controls = new OrbitControls(camera, canvas)
  controls.enableDamping = true
}

debugObject.viewIngame = function () {
  camera.position.set(30, 1, 0)
  camera.lookAt(30, 0.5, -4)
  controls = null
}

debugFolderCamera.add(debugObject, "viewWorld")
debugFolderCamera.add(debugObject, "viewIngame")

debugObject.viewIngame()

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
renderer.toneMapping = THREE.CineonToneMapping
renderer.toneMappingExposure = 1.7
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
  if (controls) controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
