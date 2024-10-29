
import * as BABYLON from "@babylonjs/core";
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";

export default class GameController {
  debug: boolean = true
  loading: boolean = false
  canvas: HTMLCanvasElement
  engine: BABYLON.Engine
  scene: BABYLON.Scene
  // baseMesh
  // pearls

  constructor(canvas: HTMLCanvasElement) {
    this.loading = true
    this.canvas = canvas
    this.engine = new BABYLON.Engine(canvas)
    this.scene = new BABYLON.Scene(this.engine)
    if (this.debug) this.scene.debugLayer.show()
    this.setUp()
  }

  setUp = async () => {
    // imports
    registerBuiltInLoaders()
    BABYLON.appendSceneAsync("./assets/Tetra.glb", this.scene).then(() => {
      // Create a default arc rotate camera and light.
      this.scene.createDefaultCameraOrLight(true, true, true);

      this.engine.runRenderLoop(() => { this.scene.render() })
    });
    // environment
  }


}