import * as BABYLON from "@babylonjs/core";
import { ThemeOptions } from '@mui/material/styles';

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

export const alignmentVectors: BABYLON.Vector3[] = [
  // XY plane
  new BABYLON.Vector3(-1, -1, 0),
  new BABYLON.Vector3(-1, 0, 0),
  new BABYLON.Vector3(-1, 1, 0),
  // YZ plane
  new BABYLON.Vector3(0, -1, -1),
  new BABYLON.Vector3(0, -1, 0),
  new BABYLON.Vector3(0, -1, 1),
  // XZ plane
  new BABYLON.Vector3(0, 0, -1),
  new BABYLON.Vector3(-1, 0, -1),
  new BABYLON.Vector3(-1, 0, 1),
  // Crossplanes
  new BABYLON.Vector3(-1, -1, -1),
  new BABYLON.Vector3(-1, 1, -1),
  new BABYLON.Vector3(-1, 1, 1),
  new BABYLON.Vector3(-1, -1, 1),
];

export function vec2toVec3(flatVector: BABYLON.Vector2) {
  return new BABYLON.Vector3(flatVector.x, 0, flatVector.y);
}
export function vec3toVec2(vector: BABYLON.Vector3) {
  return new BABYLON.Vector2(vector.x, vector.z);
}

export const themeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#93c2ff',
    },
    secondary: {
      main: '#dcf2ff',
    },
    info: {
      main: '#3173c5',
    },
  },
};