import * as BABYLON from "@babylonjs/core";

export function isValidUrlGameData(gameData: string): Boolean {
  if (!gameData) return false;
  let pass = true;
  // check for characters and length
  if (gameData.length > 64) pass = false;
  Array.from(gameData).forEach((character) => {
    if (isNaN(decodeBase16(character))) pass = false;
  });
  return pass;
}

export function bindPhysicsBody(
  transformNode: BABYLON.TransformNode,
  shape: BABYLON.PhysicsShape,
  aggregateOptions: BABYLON.PhysicsAggregateParameters,
  scene: BABYLON.Scene,
  viewer?: BABYLON.PhysicsViewer
) {
  new BABYLON.PhysicsAggregate(transformNode, shape, aggregateOptions, scene);

}

const base16Values = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
];
export function encodeBase16(index: number): string {
  if (typeof index != "number" || index < 0 || index > 15)
    return "error: wrong index";

  return base16Values[index];
}
export function decodeBase16(index: string): number {
  // TODO check regex for character
  const gameDataRegexp = new RegExp("[A-Fa-f0-9]", "i");
  if (!gameDataRegexp.test(index)) {
    console.log(`${index} can't be decoded in base16`);
    return NaN;
  }
  return base16Values.indexOf(index.toUpperCase());
}
