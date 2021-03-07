import * as dat from "dat.gui"

const doodadsGui = new dat.GUI()
const gui = new dat.GUI()

export default function debug(ground, doodads, callbacks) {
  debugGround(ground)
  debugDoodads(doodads)

  gui.add(callbacks, "generateWorld").name("Regenerate")
  gui.add(callbacks, "inGameCamera").name("inGameCamera")
  gui.add(callbacks, "worldCamera").name("worldCamera")
}

/**
 * Ground
 */
function debugGround(ground) {
  const guiGround = gui.addFolder("Ground")
  guiGround
    .add(ground.parameters.groundSize, "x")
    .min(0)
    .max(1500)
    .step(1)
    .name("Ground size X")
  guiGround
    .add(ground.parameters.groundSize, "y")
    .min(0)
    .max(1500)
    .step(1)
    .name("Ground size Y")
  guiGround
    .add(ground.parameters.groundResolution, "x")
    .min(0)
    .max(1500)
    .step(1)
    .name("Ground res X")
  guiGround
    .add(ground.parameters.groundResolution, "y")
    .min(0)
    .max(1500)
    .step(1)
    .name("Ground res Y")

  guiGround
    .add(ground.parameters, "mountainsSpreading")
    .min(0)
    .max(1000)
    .step(1)
    .name("mountainsSpreading")
  guiGround
    .add(ground.parameters, "mountainsStrength")
    .min(0)
    .max(5)
    .step(0.001)
    .name("mountainsStrength")
  guiGround
    .add(ground.parameters, "mountainsRandomness")
    .min(0)
    .max(1)
    .step(0.001)
    .name("mountainsRandomness")

  guiGround.addColor(ground.parameters, "grassColor").onChange(() => {
    ground.groundMaterial.uniforms.u_grassColor.value.set(
      ground.parameters.grassColor
    )
  })

  guiGround.addColor(ground.parameters, "grassShadowColor").onChange(() => {
    ground.groundMaterial.uniforms.u_grassShadowColor.value.set(
      ground.parameters.grassShadowColor
    )
  })

  guiGround.addColor(ground.parameters, "sandColor").onChange(() => {
    ground.groundMaterial.uniforms.u_sandColor.value.set(
      ground.parameters.sandColor
    )
  })
}

/**
 * Doodads
 */
function debugDoodads(doodads) {
  for (const property in doodads.parameters.doodads) {
    const doodad = doodads.parameters.doodads[property]
    const guiDoodad = doodadsGui.addFolder(property)
    guiDoodad.add(doodad, "density").min(0).max(1000).step(1).name("Density")

    guiDoodad
      .add(doodad, "scaleVariation")
      .min(0)
      .max(5)
      .step(0.001)
      .name("ScaleVariation")

    guiDoodad
      .add(doodad, "scaleFactor")
      .min(0)
      .max(20)
      .step(1)
      .name("ScaleFactor")

    guiDoodad.add(doodad, "depthMin").min(0).max(300).step(1).name("MinDepth")

    guiDoodad.add(doodad, "depthMax").min(0).max(300).step(1).name(`MaxDepth`)
  }
}
