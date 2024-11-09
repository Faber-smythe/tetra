import * as BABYLON from "@babylonjs/core";


export default class Pearl {
  mesh!: BABYLON.Mesh;
  name!: string;
  color: "B" | "W";
  coordinates: BABYLON.Vector3;

  constructor(
    name: string,
    color: "B" | "W",
    pileMesh: BABYLON.Mesh,
    coordinates: BABYLON.Vector3,
    scene: BABYLON.Scene,
    fastSpawnPosition?: BABYLON.Vector3
  ) {
    this.color = color;
    this.name = name;
    this.coordinates = coordinates;
    const pearlSpecimen = scene.getMeshByName("pearl-specimen") as BABYLON.Mesh;
    if (!pearlSpecimen) {
      console.error("no pearlSpecimen found");
      return;
    }
    this.mesh = pearlSpecimen.clone(name);
    this.mesh.physicsBody!.disablePreStep = false;
    let position
    if (fastSpawnPosition) {
      this.mesh.position = fastSpawnPosition
    } else {
      this.mesh.position = new BABYLON.Vector3(
        pileMesh.position.x,
        2,
        pileMesh.position.z
      );
    }
    this.mesh.setEnabled(true);
  }
}
