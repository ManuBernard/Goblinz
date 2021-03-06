import * as THREE from "three"
import groundVertexShader from "./shaders/ground/vertex.glsl"
import groundFragmentShader from "./shaders/ground/fragment.glsl"
import * as dat from "dat.gui"

// Debug
const gui = new dat.GUI()

const parameters = {}

parameters.groundSize = new THREE.Vector2(1300, 100)
parameters.grassColor = "#09c032"
parameters.grassShadowColor = "#196429"
parameters.sandColor = "#898830"

export default function generateGround(scene) {
  const groundGeometry = new THREE.PlaneGeometry(
    parameters.groundSize.x,
    parameters.groundSize.y,
    400,
    30
  )

  const groundMaterial = new THREE.ShaderMaterial({
    vertexShader: groundVertexShader,
    fragmentShader: groundFragmentShader,
    uniforms: {
      u_groundSize: { value: parameters.groundSize },

      u_hillsHeight: { value: 55 },
      u_hillsFrequency: { value: new THREE.Vector2(0.11, 0.44) },
      u_hillsShadow: { value: 25 },

      u_valeyPosition: { value: 36 },
      u_valeySize: { value: 70 },
      u_valeyDepth: { value: 51 },

      u_pathPosition: { value: 0.074 },
      u_pathSize: { value: 0.074 },
      u_pathSinusoid: { value: 89 },
      u_pathSinusoidStrength: { value: 0 },

      u_grassColor: { value: new THREE.Color(parameters.grassColor) },
      u_grassShadowColor: {
        value: new THREE.Color(parameters.grassShadowColor),
      },
      u_sandColor: { value: new THREE.Color(parameters.sandColor) },
    },
  })

  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  /**
   * Vertex
   */
  // Hills
  gui
    .add(groundMaterial.uniforms.u_hillsHeight, "value")
    .min(0)
    .max(100)
    .step(0.01)
    .name("u_hillsHeight")
  gui
    .add(groundMaterial.uniforms.u_hillsFrequency.value, "x")
    .min(0)
    .max(1)
    .step(0.0001)
    .name("u_hillsFrequency X")
  gui
    .add(groundMaterial.uniforms.u_hillsFrequency.value, "y")
    .min(0)
    .max(1)
    .step(0.0001)
    .name("u_hillsFrequency Y")

  // Valey
  gui
    .add(groundMaterial.uniforms.u_valeyPosition, "value")
    .min(-100)
    .max(100)
    .step(0.01)
    .name("valeyPosition")
  gui
    .add(groundMaterial.uniforms.u_valeySize, "value")
    .min(0)
    .max(100)
    .step(0.01)
    .name("u_valeySize")
  gui
    .add(groundMaterial.uniforms.u_valeyDepth, "value")
    .min(0)
    .max(200)
    .step(0.01)
    .name("u_valeyDepth")

  // Path
  gui
    .add(groundMaterial.uniforms.u_pathPosition, "value")
    .min(0)
    .max(1)
    .step(0.001)
    .name("u_pathPosition")
  gui
    .add(groundMaterial.uniforms.u_pathSize, "value")
    .min(0)
    .max(1)
    .step(0.001)
    .name("u_pathSize")
  gui
    .add(groundMaterial.uniforms.u_pathSinusoid, "value")
    .min(0)
    .max(100)
    .step(0.001)
    .name("u_pathSinusoid")
  gui
    .add(groundMaterial.uniforms.u_pathSinusoidStrength, "value")
    .min(0)
    .max(100)
    .step(0.001)
    .name("u_pathSinusoidStrength")
  // Color

  gui
    .add(groundMaterial.uniforms.u_hillsShadow, "value")
    .min(0)
    .max(50)
    .step(0.001)
    .name("hillsShadow")

  gui.addColor(parameters, "grassColor").onChange(() => {
    groundMaterial.uniforms.u_grassColor.value.set(parameters.grassColor)
  })

  gui.addColor(parameters, "grassShadowColor").onChange(() => {
    groundMaterial.uniforms.u_grassShadowColor.value.set(
      parameters.grassShadowColor
    )
  })

  gui.addColor(parameters, "sandColor").onChange(() => {
    groundMaterial.uniforms.u_sandColor.value.set(parameters.sandColor)
  })

  ground.rotation.x = -Math.PI * 0.5

  return ground
}
