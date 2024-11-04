import * as BABYLON from "@babylonjs/core"

export function isValidUrlGameData(gameData: string): Boolean {
  if (!gameData) return false
  let pass = true
  // check for characters and length
  if (gameData.length > 64) pass = false
  const gameDataRegexp = new RegExp("[A-Fa-f0-9]", "i")
  Array.from(gameData).forEach((character) => {
    if (!gameDataRegexp.test(character)) pass = false
  })
  return true
}

export function bindPhysicsBody(transformNode: BABYLON.TransformNode, shape: BABYLON.PhysicsShape, aggregateOptions: BABYLON.PhysicsAggregateParameters, scene: BABYLON.Scene, viewer?: BABYLON.PhysicsViewer) {
  new BABYLON.PhysicsAggregate(transformNode, shape, aggregateOptions, scene);

  // if (viewer) viewer.showBody(body);
}; 