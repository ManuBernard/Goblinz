import * as THREE from "three"
import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise"

import groundVertexShader from "./shaders/ground/vertex.glsl"
import groundFragmentShader from "./shaders/ground/fragment.glsl"

export default class Ground {
  constructor(options) {
    this._ground = null

    this.parameters = {}
    this.parameters.groundSize = new THREE.Vector2(1000, 200)
    this.parameters.groundResolution = new THREE.Vector2(128, 64)

    this.parameters.mountainsSpreading = 200
    this.parameters.mountainsStrength = 3
    this.parameters.mountainsRandomness = 0.2

    this.parameters.grassColor = "#40690f"
    this.parameters.grassShadowColor = "#1b310d"
    this.parameters.sandColor = "#c0a544"

    this.groundMaterial = null
  }

  generate() {
    // Ground Geometry
    const groundGeometry = new THREE.PlaneGeometry(
      this.parameters.groundSize.x,
      this.parameters.groundSize.y,
      this.parameters.groundResolution.x - 1,
      this.parameters.groundResolution.y - 1
    )

    this.groundMaterial = new THREE.ShaderMaterial({
      vertexShader: groundVertexShader,
      fragmentShader: groundFragmentShader,

      uniforms: {
        u_hillsHeight: { value: 12 },
        u_hillsFrequency: { value: new THREE.Vector2(0.11, 0.44) },
        u_hillsShadow: { value: 25 },

        u_valeyPosition: { value: -26 },
        u_valeySize: { value: 98 },
        u_valeyDepth: { value: 4 },

        u_pathPosition: { value: 0.074 },
        u_pathSize: { value: 0.074 },
        u_pathSinusoid: { value: 89 },
        u_pathSinusoidStrength: { value: 0 },

        u_grassColor: { value: new THREE.Color(this.parameters.grassColor) },
        u_grassShadowColor: {
          value: new THREE.Color(this.parameters.grassShadowColor),
        },
        u_sandColor: { value: new THREE.Color(this.parameters.sandColor) },
      },
    })

    // Ground Mesh
    this._ground = new THREE.Mesh(groundGeometry, this.groundMaterial)
    this._ground.name = "ground"

    // Rotate Ground & update position
    this._ground.geometry.rotateX(-Math.PI / 2)
    this._ground.translateX(this.parameters.groundSize.x / 2)
    this._ground.translateZ(-this.parameters.groundSize.y / 2)

    // Apply terrain
    const data = generateHeight(
      this.parameters.groundResolution.x,
      this.parameters.groundResolution.y
    )

    const vertices = this._ground.geometry.attributes.position.array

    for (let i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
      const x = vertices[j + 0]
      const y = vertices[j + 1]
      const z = vertices[j + 2]

      vertices[j + 1] =
        cubicPulse(
          -this.parameters.groundSize.y / 2,
          this.parameters.mountainsSpreading,
          z
        ) * this.parameters.mountainsStrength

      vertices[j + 1] *= data[i] * this.parameters.mountainsRandomness
    }
  }
}

/**
 * Cubic Pulse
 */
function cubicPulse(c, w, x) {
  x = Math.abs(x - c)
  if (x > w) return 0.0
  x /= w
  return 1.0 - x * x * (3.0 - 2.0 * x)
}

/**
 * Generzte height
 */
function generateHeight(width, height) {
  const size = width * height,
    data = new Uint8Array(size),
    perlin = new ImprovedNoise(),
    z = Math.random() * 1000

  let quality = 1

  for (let j = 0; j < 4; j++) {
    for (let i = 0; i < size; i++) {
      const x = i % width,
        y = ~~(i / width)
      data[i] += Math.abs(
        perlin.noise(x / quality, y / quality, z) * quality * 1.75
      )
    }

    quality *= 5
  }

  return data
}

// parameters.buildGround = () => {
//   const groundGeometry = new THREE.PlaneGeometry(
//     parameters.groundSize.x,
//     parameters.groundSize.y,
//     parameters.groundResolution.x,
//     parameters.groundResolution.y
//   )

//   const ground = new THREE.Mesh(
//     groundGeometry,
//     new THREE.MeshBasicMaterial({ color: "grey", wireframe: true })
//   )

//   ground.geometry.rotateX(-Math.PI / 2)

//   const data = generateHeight(10, 10)

//   const vertices = ground.geometry.attributes.position.array

//   for (let i = 0; i < vertices.length; i += 3) {
//     const x = vertices[i + 0]
//     const y = vertices[i + 1]
//     const z = vertices[i + 2]

//     vertices[i + 1] = cubicPulse(0, 50, z) * Math.random() * 10
//     // vertices[i + 1] *= Math.sin(x / 10) * 5
//     // vertices[i + 1] = data[i] * 0.5
//     // vertices[i + 1] = Math.abs(vertices[i + 1])
//   }

//   ground.geometry.computeFaceNormals() // needed for helper

//   ground.name = "Ground"

//   return ground
// }

// function cubicPulse(c, w, x) {
//   x = Math.abs(x - c)
//   if (x > w) return 0.0
//   x /= w
//   return 1.0 - x * x * (3.0 - 2.0 * x)
// }

// function generateHeight(width, height) {
//   const size = width * height,
//     data = new Uint8Array(size),
//     perlin = new ImprovedNoise(),
//     z = Math.random() * 10

//   let quality = 1.2

//   for (let j = 0; j < 4; j++) {
//     for (let i = 0; i < size; i++) {
//       const x = i % width,
//         y = ~~(i / width)
//       data[i] += Math.abs(
//         perlin.noise(x / quality, y / quality, z) * quality * 1.75
//       )
//     }

//     quality *= 5
//   }

//   return data
// }

// /**
//  *
//  * Debug
//  *
//  *  */

// // OLD
// gui.add(parameters, "buildGround").name("Regenerate ground")

// const groundMaterial = new THREE.ShaderMaterial({
//   vertexShader: groundVertexShader,
//   fragmentShader: groundFragmentShader,
//   uniforms: {
//     u_groundSize: { value: parameters.groundSize },

//     u_hillsHeight: { value: 12 },
//     u_hillsFrequency: { value: new THREE.Vector2(0.11, 0.44) },
//     u_hillsShadow: { value: 25 },

//     u_valeyPosition: { value: -26 },
//     u_valeySize: { value: 98 },
//     u_valeyDepth: { value: 4 },

//     u_pathPosition: { value: 0.074 },
//     u_pathSize: { value: 0.074 },
//     u_pathSinusoid: { value: 89 },
//     u_pathSinusoidStrength: { value: 0 },

//     u_grassColor: { value: new THREE.Color(parameters.grassColor) },
//     u_grassShadowColor: {
//       value: new THREE.Color(parameters.grassShadowColor),
//     },
//     u_sandColor: { value: new THREE.Color(parameters.sandColor) },
//   },
// })

// /**
//    * Vertex
//    */
//   // Hills
//   gui
//     .add(groundMaterial.uniforms.u_hillsHeight, "value")
//     .min(0)
//     .max(100)
//     .step(0.01)
//     .name("u_hillsHeight")
//   gui
//     .add(groundMaterial.uniforms.u_hillsFrequency.value, "x")
//     .min(0)
//     .max(1)
//     .step(0.0001)
//     .name("u_hillsFrequency X")
//   gui
//     .add(groundMaterial.uniforms.u_hillsFrequency.value, "y")
//     .min(0)
//     .max(1)
//     .step(0.0001)
//     .name("u_hillsFrequency Y")

//   // Valey
//   gui
//     .add(groundMaterial.uniforms.u_valeyPosition, "value")
//     .min(-100)
//     .max(100)
//     .step(0.01)
//     .name("valeyPosition")
//   gui
//     .add(groundMaterial.uniforms.u_valeySize, "value")
//     .min(0)
//     .max(100)
//     .step(0.01)
//     .name("u_valeySize")
//   gui
//     .add(groundMaterial.uniforms.u_valeyDepth, "value")
//     .min(0)
//     .max(200)
//     .step(0.01)
//     .name("u_valeyDepth")

//   // Path
//   gui
//     .add(groundMaterial.uniforms.u_pathPosition, "value")
//     .min(0)
//     .max(1)
//     .step(0.001)
//     .name("u_pathPosition")
//   gui
//     .add(groundMaterial.uniforms.u_pathSize, "value")
//     .min(0)
//     .max(1)
//     .step(0.001)
//     .name("u_pathSize")
//   gui
//     .add(groundMaterial.uniforms.u_pathSinusoid, "value")
//     .min(0)
//     .max(100)
//     .step(0.001)
//     .name("u_pathSinusoid")
//   gui
//     .add(groundMaterial.uniforms.u_pathSinusoidStrength, "value")
//     .min(0)
//     .max(100)
//     .step(0.001)
//     .name("u_pathSinusoidStrength")
//   // Color

//   gui
//     .add(groundMaterial.uniforms.u_hillsShadow, "value")
//     .min(0)
//     .max(50)
//     .step(0.001)
//     .name("hillsShadow")

//   gui.addColor(parameters, "grassColor").onChange(() => {
//     groundMaterial.uniforms.u_grassColor.value.set(parameters.grassColor)
//   })

//   gui.addColor(parameters, "grassShadowColor").onChange(() => {
//     groundMaterial.uniforms.u_grassShadowColor.value.set(
//       parameters.grassShadowColor
//     )
//   })

//   gui.addColor(parameters, "sandColor").onChange(() => {
//     groundMaterial.uniforms.u_sandColor.value.set(parameters.sandColor)
//   })

//   //  ground.rotation.x = -Math.PI * 0.5
//   // ground.position.z -= 100
