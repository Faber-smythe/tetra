import * as BABYLON from "@babylonjs/core";
import Pearl from "./Pearl";

export default class Pile {
  coordinates: BABYLON.Vector2;
  mesh!: BABYLON.Mesh;
  pileIndex: number;
  scene!: BABYLON.Scene;
  pearls: Pearl[] = [];
  rewind: number = 0;
  ghostPearl: Pearl | null = null;

  constructor(
    coordinates: BABYLON.Vector2,
    mesh: BABYLON.Mesh,
    pileIndex: number,
    scene: BABYLON.Scene
  ) {
    this.coordinates = coordinates;
    this.mesh = mesh;
    this.pileIndex = pileIndex;
    this.scene = scene;
  }

  spawnPearl(name: string, color: "W" | "B", fastSpawn = false) {
    const coordinates = new BABYLON.Vector3(
      this.coordinates.x,
      this.pearls.length,
      this.coordinates.y
    );
    let newPearl;
    if (fastSpawn) {
      const fastSpawnPosition = new BABYLON.Vector3(
        this.mesh.position.x,
        0.7 + this.pearls.length * 0.383,
        this.mesh.position.z
      );
      newPearl = new Pearl(
        name,
        color,
        this.mesh,
        coordinates,
        this.scene,
        fastSpawnPosition
      );
    } else {
      newPearl = new Pearl(name, color, this.mesh, coordinates, this.scene);
    }

    /* setting constraints and repositionning after 1000ms to workaround pearl glitching */
    const pileConstraint = new BABYLON.SliderConstraint(
      new BABYLON.Vector3(0, 0, 0),
      new BABYLON.Vector3(0, 0, 0),
      new BABYLON.Vector3(0, 1, 0),
      new BABYLON.Vector3(0, 1, 0),
      this.scene
    );
    this.mesh.physicsBody?.addConstraint(
      newPearl.mesh.physicsBody!,
      pileConstraint
    );

    this.pearls.push(newPearl);
    return newPearl;
  }

  pearlSleep(pearl?: Pearl) {
    if (!pearl) pearl = this.pearls[this.pearls.length - 1];
    pearl.mesh.physicsBody?.setMotionType(BABYLON.PhysicsMotionType.STATIC);
    pearl.mesh.position.y = 0.32 + (this.pearls.length - 1) * 0.383;
  }

  showGhostPearl(color: "W" | "B") {
    const coordinates = new BABYLON.Vector3(-1, -1, -1);
    const fastSpawnPosition = new BABYLON.Vector3(
      this.mesh.position.x,
      0.32 + this.pearls.length * 0.383,
      this.mesh.position.z
    );

    if (!this.ghostPearl) {
      this.ghostPearl = new Pearl(
        `ghost-pearl-${this.pileIndex}`,
        color,
        this.mesh,
        coordinates,
        this.scene,
        fastSpawnPosition,
        true
      );
    } else {
      this.ghostPearl.mesh.position = fastSpawnPosition;
      this.ghostPearl.applyColor(true, color);
      this.ghostPearl.mesh.setEnabled(true);
    }
  }

  hideGhostPearl() {
    if (this.ghostPearl && this.ghostPearl.mesh.isEnabled()) {
      this.ghostPearl.mesh.setEnabled(false);
    }
  }
}
