import * as THREE from "three"
import groundVertexShader from "./shaders/ground/vertex.glsl"
import groundFragmentShader from "./shaders/ground/fragment.glsl"
import * as dat from "dat.gui"

// Debug
const gui = new dat.GUI()

const parameters = {
  groundSize: new THREE.Vector2(200, 100),
}

export default function generateGround(scene) {
  const groundGeometry = new THREE.PlaneGeometry(
    parameters.groundSize.x,
    parameters.groundSize.y,
    512,
    512
  )

  const groundMaterial = new THREE.ShaderMaterial({
    vertexShader: groundVertexShader,
    fragmentShader: groundFragmentShader,
    uniforms: {
      groundSize: { value: parameters.groundSize },

      hillsStarts: { value: 0.366 },
      hillsHeight: { value: 21 },
      hillsFrequency: { value: new THREE.Vector2(0.04, 0.18) },
    },
  })

  const ground = new THREE.Mesh(groundGeometry, groundMaterial)

  gui
    .add(groundMaterial.uniforms.hillsStarts, "value")
    .min(0)
    .max(1)
    .step(0.001)
    .name("hillsStarts")
  gui
    .add(groundMaterial.uniforms.hillsHeight, "value")
    .min(0)
    .max(30)
    .step(0.01)
    .name("hillsHeight")
  gui
    .add(groundMaterial.uniforms.hillsFrequency.value, "x")
    .min(0)
    .max(1)
    .step(0.0001)
    .name("hillsFrequencyX")
  gui
    .add(groundMaterial.uniforms.hillsFrequency.value, "y")
    .min(0)
    .max(1)
    .step(0.0001)
    .name("hillsFrequencyY")

  ground.rotation.x = -Math.PI * 0.5
  scene.add(ground)
}
