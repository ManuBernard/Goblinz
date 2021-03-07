import * as THREE from "three"
import * as dat from "dat.gui"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"

const gltfLoader = new GLTFLoader()

export default class Doodads {
  constructor(scene) {
    this._doodads = null
    this._scene = scene

    this.parameters = {
      groundChunk: 3,
      doodads: {
        arbre: {
          density: 7,
          scaleVariation: 0.5,
          depthMin: 28,
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
          scaleVariation: 2,
          depthMin: 30,
          depthMax: 80,
          collideDistance: 0,
        },
        rocher1: {
          density: 8,
          scaleVariation: 3,
          depthMin: 20,
          depthMax: 30,
          collideDistance: 1,
        },
        rocher2: {
          density: 8,
          scaleVariation: 3,
          depthMin: 30,
          depthMax: 50,
          collideDistance: 1,
        },
        rocherbranche: {
          density: 1,
          scaleVariation: 0,
          depthMin: 30,
          depthMax: 60,
          collideDistance: 1,
        },
        champignon1: {
          density: 18,
          scaleVariation: 1.5,
          depthMin: 15,
          depthMax: 45,
          collideDistance: 0,
        },
        champignon2: {
          density: 28,
          scaleVariation: 1.5,
          depthMin: 15,
          depthMax: 45,
          collideDistance: 0,
        },
        buisson: {
          density: 8,
          scaleVariation: 1.5,
          depthMin: 17,
          depthMax: 30,
          collideDistance: 0,
        },
        souche: {
          density: 3,
          scaleVariation: 1.5,
          depthMin: 27,
          depthMax: 50,
          collideDistance: 0,
        },
        branche: {
          density: 3,
          scaleVariation: 1.5,
          depthMin: 20,
          depthMax: 120,
          collideDistance: 0,
        },
      },
    }
  }

  generate(ground) {
    const box = new THREE.Box3().setFromObject(ground)
    const groundX = box.getSize().x
    const groundY = box.getSize().y
    const groundZ = box.getSize().z

    gltfLoader.load("/static/models/goblins-doodads.glb", (gltf) => {
      const doodads = gltf.scene.children
      const doodadsContainer = new THREE.Group()
      const existingCoordinates = []

      doodadsContainer.name = "Doodads"

      // Foreach chunk
      for (let chunkI = 0; chunkI < this.parameters.groundChunk; chunkI++) {
        // Foreach doodads
        doodads.forEach((doodad) => {
          const doodadSettings = this.parameters.doodads[doodad.name]

          if (doodadSettings) {
            // Loop in doodads density
            for (let i = 0; i < doodadSettings.density; i++) {
              const doodadCopy = doodad.clone()

              // Calculate scale
              let scaleFactor = Math.abs(
                (Math.random() - 0.5) * doodadSettings.scaleVariation + 1 * 5
              )

              doodadCopy.scale.x *= scaleFactor
              doodadCopy.scale.y *= scaleFactor
              doodadCopy.scale.z *= scaleFactor

              // Calculate x & z coordinate
              const x =
                Math.random() * (groundX / this.parameters.groundChunk) +
                chunkI * (groundX / this.parameters.groundChunk)
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

              const intersects = doodadYPosRaycaster.intersectObject(
                ground,
                true
              )

              let applyDoodad = true
              // // Don't pop doodads on the path
              // if (intersects[0].object.name == "Path") {
              //   applyDoodad = false
              // }

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

          this._doodads = doodadsContainer
          this._scene.add(doodadsContainer)
        })
      }
    })
  }
}
