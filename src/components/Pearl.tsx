import * as BABYLON from "@babylonjs/core";


export default class Pearl {
  mesh!: BABYLON.Mesh;
  color: "B" | "W";

  constructor(
    name: string,
    color: "B" | "W",
    pile: BABYLON.Mesh,
    scene: BABYLON.Scene
  ) {
    this.color = color;
    const pearlSpecimen = scene.getMeshByName("pearl-specimen") as BABYLON.Mesh;
    if (!pearlSpecimen) {
      console.error("no pearlSpecimen found");
      return;
    }
    this.mesh = pearlSpecimen.clone(name);
    this.mesh.physicsBody!.disablePreStep = false;
    this.mesh.position = new BABYLON.Vector3(
      pile.position.x,
      2,
      pile.position.z
    );
    console.log(this.mesh.position);
    this.mesh.setEnabled(true);
  }
}
