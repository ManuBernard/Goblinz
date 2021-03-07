import * as dat from "dat.gui"

const gui = new dat.GUI()

export default function debug(ground, callbacks) {
  gui
    .add(ground.parameters.groundSize, "x")
    .min(0)
    .max(1500)
    .step(1)
    .name("Ground size X")
    .onFinishChange(() => {
      ground.generate()
    })
  gui
    .add(ground.parameters.groundSize, "y")
    .min(0)
    .max(1500)
    .step(1)
    .name("Ground size Y")
    .onFinishChange(() => {
      ground.generate()
    })
  gui
    .add(ground.parameters.groundResolution, "x")
    .min(0)
    .max(1500)
    .step(1)
    .name("Ground res X")
    .onFinishChange(() => {
      ground.generate()
    })
  gui
    .add(ground.parameters.groundResolution, "y")
    .min(0)
    .max(1500)
    .step(1)
    .name("Ground res Y")
    .onFinishChange(() => {
      ground.generate()
    })

  gui
    .add(ground.parameters, "mountainsSpreading")
    .min(0)
    .max(1000)
    .step(1)
    .name("mountainsSpreading")
    .onFinishChange(() => {
      ground.generate()
    })
  gui
    .add(ground.parameters, "mountainsStrength")
    .min(0)
    .max(5)
    .step(0.001)
    .name("mountainsStrength")
    .onFinishChange(() => {
      ground.generate()
    })
  gui
    .add(ground.parameters, "mountainsRandomness")
    .min(0)
    .max(1)
    .step(0.001)
    .name("mountainsRandomness")
    .onFinishChange(() => {
      ground.generate()
    })

  gui.addColor(ground.parameters, "grassColor").onChange(() => {
    ground.groundMaterial.uniforms.u_grassColor.value.set(
      ground.parameters.grassColor
    )
  })

  gui.addColor(ground.parameters, "grassShadowColor").onChange(() => {
    ground.groundMaterial.uniforms.u_grassShadowColor.value.set(
      ground.parameters.grassShadowColor
    )
  })

  gui.addColor(ground.parameters, "sandColor").onChange(() => {
    ground.groundMaterial.uniforms.u_sandColor.value.set(
      ground.parameters.sandColor
    )
  })

  // Generate world
  console.log(callbacks)
  gui.add(callbacks, "generateWorld").name("Regenerate")
  gui.add(callbacks, "inGameCamera").name("inGameCamera")
  gui.add(callbacks, "worldCamera").name("worldCamera")
}
