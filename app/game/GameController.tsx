import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";

export default class GameController {
  debug: boolean = true;
  loading: boolean = false;
  canvas: HTMLCanvasElement;
  engine?: BABYLON.Engine;
  scene?: BABYLON.Scene;
  // baseMesh
  // pearls

  constructor(canvas: HTMLCanvasElement) {
    this.loading = true;
    this.canvas = canvas;
    this.setUp();
    registerBuiltInLoaders();
  }

  setUp = async () => {
    await this.babylonInit();
  };

  async babylonInit() {
    // initialize
    this.engine = new BABYLON.Engine(this.canvas);
    this.scene = new BABYLON.Scene(this.engine);
    if (this.debug) this.scene.debugLayer.show();
    // import assets
    const imported = BABYLON.SceneLoader.ImportMeshAsync(
      "./",
      "Tetra.glb",
      undefined,
      this.scene
    );
    console.log(await imported);
    // environment
  }
}
