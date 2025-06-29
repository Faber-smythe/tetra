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
    isGhostPearl = false
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

    this.applyColor(isGhostPearl);

    if (fastSpawnPosition) {
      this.mesh.position = fastSpawnPosition;
    } else {
      this.mesh.position = new BABYLON.Vector3(
        pileMesh.position.x,
        2,
        pileMesh.position.z
      );
    }

    // ghost pearl are used for preview and should not have physics
    if (isGhostPearl) {
      this.mesh.visibility = 0.4;
      this.mesh.physicsBody?.dispose();
      this.mesh.isPickable = false;
    }
    this.mesh.rotationQuaternion = null;
    this.mesh.setEnabled(true);
    this.mesh.rotation.y *= 10;

    this.mesh.actionManager = new BABYLON.ActionManager(this.scene);
    this.mesh.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(
        BABYLON.ActionManager.OnPickDownTrigger,
        (ev) => {
          // pearl only spawns on left click
          if (ev.sourceEvent.inputIndex === 2) {
            this.mesh.rotation.y += 30;
          }
        }
      )
    );
  }

  applyColor(isGhostPearl = false, color?: "W" | "B") {
    if (!color) color = this.color;

    const pearlMaterial = this.scene.getMaterialByName(
      `pearl-material-${color}${isGhostPearl ? "-ghost" : ""}`
    )!;
    this.mesh.material = pearlMaterial;
  }
}
