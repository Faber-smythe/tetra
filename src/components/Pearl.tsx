import * as BABYLON from "@babylonjs/core";


export default class Pearl {
  mesh!: BABYLON.Mesh;
  name!: string;
  color: "B" | "W";
  coordinates: BABYLON.Vector3;
  scene: BABYLON.Scene;

  constructor(
    name: string,
    color: "B" | "W",
    pileMesh: BABYLON.Mesh,
    coordinates: BABYLON.Vector3,
    scene: BABYLON.Scene,
    fastSpawnPosition?: BABYLON.Vector3,
    isGhostPreview = false
  ) {
    this.color = color;
    this.name = name;
    this.coordinates = coordinates;
    this.scene = scene;
    const pearlSpecimen = scene.getMeshByName("pearl-specimen") as BABYLON.Mesh;
    if (!pearlSpecimen) {
      console.error("no pearlSpecimen found");
      return;
    }
    this.mesh = pearlSpecimen.clone(name);
    this.mesh.physicsBody!.disablePreStep = false;

    this.applyColor()

    if (fastSpawnPosition) {
      this.mesh.position = fastSpawnPosition
    } else {
      this.mesh.position = new BABYLON.Vector3(
        pileMesh.position.x,
        2,
        pileMesh.position.z
      );
    }

    // ghost pearl are used for preview and should not have physics
    if (isGhostPreview) {
      this.mesh.visibility = .4
      this.mesh.physicsBody?.dispose()
      this.mesh.isPickable = false
    }
    this.mesh.setEnabled(true);
  }

  applyColor(color?: "W" | "B") {
    if (!color) color = this.color

    const blackPearlMat = this.scene.getMaterialByName("black-pearls")!;
    const whitePearlMat = this.scene.getMaterialByName("white-pearls")!;
    if (color == "B") this.mesh.material = blackPearlMat;
    if (color == "W") this.mesh.material = whitePearlMat;
  }
}
