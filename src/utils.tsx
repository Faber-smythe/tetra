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

export const buildNodeMaterial = (scene: BABYLON.Scene, color: "W" | "B"): BABYLON.NodeMaterial => {
  const baseColor = require('./assets/textures/marble_albedo.jpg')
  const roughness = require('./assets/textures/marble_albedo.jpg')
  const emissive = require('./assets/textures/marble_albedo.jpg')


  // ---------------------------------------
  // ---------------------------------------
  // ---------------------------------------
  // ---------------------------------------
  var nodeMaterial = new BABYLON.NodeMaterial("node");

  var nodeMaterial = new BABYLON.NodeMaterial("node");

  // InputBlock
  var position = new BABYLON.InputBlock("position");
  position.visibleInInspector = false;
  position.visibleOnFrame = false;
  position.target = 1;
  position.setAsAttribute("position");

  // TransformBlock
  var WorldPos = new BABYLON.TransformBlock("WorldPos");
  WorldPos.visibleInInspector = false;
  WorldPos.visibleOnFrame = false;
  WorldPos.target = 1;
  WorldPos.complementZ = 0;
  WorldPos.complementW = 1;

  // InputBlock
  var World = new BABYLON.InputBlock("World");
  World.visibleInInspector = false;
  World.visibleOnFrame = false;
  World.target = 1;
  World.setAsSystemValue(BABYLON.NodeMaterialSystemValues.World);

  // TransformBlock
  var Worldnormal = new BABYLON.TransformBlock("World normal");
  Worldnormal.visibleInInspector = false;
  Worldnormal.visibleOnFrame = false;
  Worldnormal.target = 1;
  Worldnormal.complementZ = 0;
  Worldnormal.complementW = 0;

  // InputBlock
  var normal = new BABYLON.InputBlock("normal");
  normal.visibleInInspector = false;
  normal.visibleOnFrame = false;
  normal.target = 1;
  normal.setAsAttribute("normal");

  // PBRMetallicRoughnessBlock
  var PBRMetallicRoughness = new BABYLON.PBRMetallicRoughnessBlock("PBRMetallicRoughness");
  PBRMetallicRoughness.visibleInInspector = false;
  PBRMetallicRoughness.visibleOnFrame = false;
  PBRMetallicRoughness.target = 3;
  PBRMetallicRoughness.lightFalloff = 0;
  PBRMetallicRoughness.useAlphaTest = false;
  PBRMetallicRoughness.alphaTestCutoff = 0.5;
  PBRMetallicRoughness.useAlphaBlending = false;
  PBRMetallicRoughness.useRadianceOverAlpha = true;
  PBRMetallicRoughness.useSpecularOverAlpha = true;
  PBRMetallicRoughness.enableSpecularAntiAliasing = false;
  PBRMetallicRoughness.realTimeFiltering = false;
  PBRMetallicRoughness.realTimeFilteringQuality = 8;
  PBRMetallicRoughness.useEnergyConservation = true;
  PBRMetallicRoughness.useRadianceOcclusion = true;
  PBRMetallicRoughness.useHorizonOcclusion = true;
  PBRMetallicRoughness.unlit = false;
  PBRMetallicRoughness.forceNormalForward = false;
  PBRMetallicRoughness.debugMode = 0;
  PBRMetallicRoughness.debugLimit = 0;
  PBRMetallicRoughness.debugFactor = 1;

  // InputBlock
  var view = new BABYLON.InputBlock("view");
  view.visibleInInspector = false;
  view.visibleOnFrame = false;
  view.target = 1;
  view.setAsSystemValue(BABYLON.NodeMaterialSystemValues.View);

  // InputBlock
  var cameraPosition = new BABYLON.InputBlock("cameraPosition");
  cameraPosition.visibleInInspector = false;
  cameraPosition.visibleOnFrame = false;
  cameraPosition.target = 1;
  cameraPosition.setAsSystemValue(BABYLON.NodeMaterialSystemValues.CameraPosition);

  // TextureBlock
  var colorTex = new BABYLON.TextureBlock("colorTex");
  colorTex.visibleInInspector = false;
  colorTex.visibleOnFrame = false;
  // colorTex.target = 3;
  colorTex.convertToGammaSpace = false;
  colorTex.convertToLinearSpace = false;
  colorTex.disableLevelMultiplication = false;
  colorTex.texture = new BABYLON.Texture(baseColor, null, false, true, 3);
  colorTex.texture.wrapU = 1;
  colorTex.texture.wrapV = 1;
  colorTex.texture.uAng = 0;
  colorTex.texture.vAng = 0;
  colorTex.texture.wAng = 0;
  colorTex.texture.uOffset = 0;
  colorTex.texture.vOffset = 0;
  colorTex.texture.uScale = 1;
  colorTex.texture.vScale = 1;
  colorTex.texture.coordinatesMode = 7;

  // InputBlock
  var uv = new BABYLON.InputBlock("uv");
  uv.visibleInInspector = false;
  uv.visibleOnFrame = false;
  uv.target = 1;
  uv.setAsAttribute("uv");

  // TextureBlock
  var roughnessTex = new BABYLON.TextureBlock("roughnessTex");
  roughnessTex.visibleInInspector = false;
  roughnessTex.visibleOnFrame = false;
  // roughnessTex.target = 3;
  roughnessTex.convertToGammaSpace = false;
  roughnessTex.convertToLinearSpace = false;
  roughnessTex.disableLevelMultiplication = false;
  roughnessTex.texture = new BABYLON.Texture(roughness, null, false, true, 3);
  roughnessTex.texture.wrapU = 1;
  roughnessTex.texture.wrapV = 1;
  roughnessTex.texture.uAng = 0;
  roughnessTex.texture.vAng = 0;
  roughnessTex.texture.wAng = 0;
  roughnessTex.texture.uOffset = 0;
  roughnessTex.texture.vOffset = 0;
  roughnessTex.texture.uScale = 1;
  roughnessTex.texture.vScale = 1;
  roughnessTex.texture.coordinatesMode = 7;

  // TextureBlock
  var emissiveTex = new BABYLON.TextureBlock("emissiveTex");
  emissiveTex.visibleInInspector = false;
  emissiveTex.visibleOnFrame = false;
  // emissiveTex.target = 3;
  emissiveTex.convertToGammaSpace = false;
  emissiveTex.convertToLinearSpace = false;
  emissiveTex.disableLevelMultiplication = false;
  emissiveTex.texture = new BABYLON.Texture(emissive, null, false, true, 3);
  emissiveTex.texture.wrapU = 1;
  emissiveTex.texture.wrapV = 1;
  emissiveTex.texture.uAng = 0;
  emissiveTex.texture.vAng = 0;
  emissiveTex.texture.wAng = 0;
  emissiveTex.texture.uOffset = 0;
  emissiveTex.texture.vOffset = 0;
  emissiveTex.texture.uScale = 1;
  emissiveTex.texture.vScale = 1;
  emissiveTex.texture.coordinatesMode = 7;

  // LerpBlock
  var Lerp = new BABYLON.LerpBlock("Lerp");
  Lerp.visibleInInspector = false;
  Lerp.visibleOnFrame = false;
  Lerp.target = 4;

  // InputBlock
  var Color = new BABYLON.InputBlock("Color3");
  Color.visibleInInspector = false;
  Color.visibleOnFrame = false;
  Color.target = 1;
  Color.value = new BABYLON.Color3(0.0196078431372549, 0.0196078431372549, 0.0196078431372549);
  Color.isConstant = false;

  // InputBlock
  var glowLevel = new BABYLON.InputBlock("glowLevel");
  glowLevel.visibleInInspector = true;
  glowLevel.visibleOnFrame = false;
  glowLevel.target = 1;
  glowLevel.value = 1;
  glowLevel.min = 0;
  glowLevel.max = 1;
  glowLevel.isBoolean = false;
  glowLevel.matrixMode = 0;
  glowLevel.animationType = BABYLON.AnimatedInputBlockTypes.None;
  glowLevel.isConstant = false;

  // LerpBlock
  var Lerp1 = new BABYLON.LerpBlock("Lerp");
  Lerp1.visibleInInspector = false;
  Lerp1.visibleOnFrame = false;
  Lerp1.target = 4;

  // InputBlock
  var Color1 = new BABYLON.InputBlock("Color3");
  Color1.visibleInInspector = false;
  Color1.visibleOnFrame = false;
  Color1.target = 1;
  Color1.value = new BABYLON.Color3(1, 1, 1);
  Color1.isConstant = false;

  // LerpBlock
  var Lerp2 = new BABYLON.LerpBlock("Lerp");
  Lerp2.visibleInInspector = false;
  Lerp2.visibleOnFrame = false;
  Lerp2.target = 4;

  // GradientBlock
  var Gradient = new BABYLON.GradientBlock("Gradient");
  Gradient.visibleInInspector = true;
  Gradient.visibleOnFrame = false;
  Gradient.target = 2;
  Gradient.colorSteps = [];
  Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0, new BABYLON.Color3(0.76, 0, 0)));
  Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0.25, new BABYLON.Color3(1, 0.28, 0)));
  Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0.5, new BABYLON.Color3(1, 0.48, 0)));
  Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0.75, new BABYLON.Color3(1, 0.28, 0)));
  Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(1, new BABYLON.Color3(0.76, 0, 0)));

  // TrigonometryBlock
  var Fract = new BABYLON.TrigonometryBlock("Fract");
  Fract.visibleInInspector = false;
  Fract.visibleOnFrame = false;
  Fract.target = 4;
  Fract.operation = BABYLON.TrigonometryBlockOperations.Fract;

  // AddBlock
  var Add = new BABYLON.AddBlock("Add");
  Add.visibleInInspector = false;
  Add.visibleOnFrame = false;
  Add.target = 4;

  // MultiplyBlock
  var Multiply = new BABYLON.MultiplyBlock("Multiply");
  Multiply.visibleInInspector = false;
  Multiply.visibleOnFrame = false;
  Multiply.target = 4;

  // InputBlock
  var Time = new BABYLON.InputBlock("Time");
  Time.visibleInInspector = false;
  Time.visibleOnFrame = false;
  Time.target = 1;
  Time.value = 13.36888000000714;
  Time.min = 0;
  Time.max = 0;
  Time.isBoolean = false;
  Time.matrixMode = 0;
  Time.animationType = BABYLON.AnimatedInputBlockTypes.Time;
  Time.isConstant = false;

  // InputBlock
  var speed = new BABYLON.InputBlock("speed");
  speed.visibleInInspector = true;
  speed.visibleOnFrame = false;
  speed.target = 1;
  speed.value = 1;
  speed.min = 0;
  speed.max = 2;
  speed.isBoolean = false;
  speed.matrixMode = 0;
  speed.animationType = BABYLON.AnimatedInputBlockTypes.None;
  speed.isConstant = false;

  // VectorSplitterBlock
  var VectorSplitter = new BABYLON.VectorSplitterBlock("VectorSplitter");
  VectorSplitter.visibleInInspector = false;
  VectorSplitter.visibleOnFrame = false;
  VectorSplitter.target = 4;

  // InputBlock
  var uv1 = new BABYLON.InputBlock("uv");
  uv1.visibleInInspector = false;
  uv1.visibleOnFrame = false;
  uv1.target = 1;
  uv1.setAsAttribute("uv");

  // ScaleBlock
  var Scale = new BABYLON.ScaleBlock("Scale");
  Scale.visibleInInspector = false;
  Scale.visibleOnFrame = false;
  Scale.target = 4;

  // InputBlock
  var emissiveLevel = new BABYLON.InputBlock("emissiveLevel");
  emissiveLevel.visibleInInspector = true;
  emissiveLevel.visibleOnFrame = false;
  emissiveLevel.target = 1;
  emissiveLevel.value = 1;
  emissiveLevel.min = 0;
  emissiveLevel.max = 1;
  emissiveLevel.isBoolean = false;
  emissiveLevel.matrixMode = 0;
  emissiveLevel.animationType = BABYLON.AnimatedInputBlockTypes.None;
  emissiveLevel.isConstant = false;

  // LerpBlock
  var Lerp3 = new BABYLON.LerpBlock("Lerp");
  Lerp3.visibleInInspector = false;
  Lerp3.visibleOnFrame = false;
  Lerp3.target = 4;

  // PowBlock
  var Pow = new BABYLON.PowBlock("Pow");
  Pow.visibleInInspector = false;
  Pow.visibleOnFrame = false;
  Pow.target = 4;

  // AddBlock
  var specCont = new BABYLON.AddBlock("specCont");
  specCont.visibleInInspector = false;
  specCont.visibleOnFrame = false;
  specCont.target = 4;

  // InputBlock
  var Vector = new BABYLON.InputBlock("Vector3");
  Vector.visibleInInspector = false;
  Vector.visibleOnFrame = false;
  Vector.target = 1;
  Vector.value = new BABYLON.Vector3(0.4545, 0.4545, 0.4545);
  Vector.isConstant = false;

  // MultiplyBlock
  var Multiply1 = new BABYLON.MultiplyBlock("Multiply");
  Multiply1.visibleInInspector = false;
  Multiply1.visibleOnFrame = false;
  Multiply1.target = 4;

  // FragmentOutputBlock
  var FragmentOutput = new BABYLON.FragmentOutputBlock("FragmentOutput");
  FragmentOutput.visibleInInspector = false;
  FragmentOutput.visibleOnFrame = false;
  FragmentOutput.target = 2;
  FragmentOutput.convertToGammaSpace = false;
  FragmentOutput.convertToLinearSpace = false;

  // InputBlock
  var Float = new BABYLON.InputBlock("Float");
  Float.visibleInInspector = false;
  Float.visibleOnFrame = false;
  Float.target = 1;
  Float.value = 0;
  Float.min = 0;
  Float.max = 2;
  Float.isBoolean = false;
  Float.matrixMode = 0;
  Float.animationType = BABYLON.AnimatedInputBlockTypes.None;
  Float.isConstant = false;

  // InputBlock
  var Float1 = new BABYLON.InputBlock("Float");
  Float1.visibleInInspector = false;
  Float1.visibleOnFrame = false;
  Float1.target = 1;
  Float1.value = 1;
  Float1.min = 0;
  Float1.max = 1;
  Float1.isBoolean = false;
  Float1.matrixMode = 0;
  Float1.animationType = BABYLON.AnimatedInputBlockTypes.None;
  Float1.isConstant = false;

  // TransformBlock
  var WorldPosViewProjectionTransform = new BABYLON.TransformBlock("WorldPos * ViewProjectionTransform");
  WorldPosViewProjectionTransform.visibleInInspector = false;
  WorldPosViewProjectionTransform.visibleOnFrame = false;
  WorldPosViewProjectionTransform.target = 1;
  WorldPosViewProjectionTransform.complementZ = 0;
  WorldPosViewProjectionTransform.complementW = 1;

  // InputBlock
  var ViewProjection = new BABYLON.InputBlock("ViewProjection");
  ViewProjection.visibleInInspector = false;
  ViewProjection.visibleOnFrame = false;
  ViewProjection.target = 1;
  ViewProjection.setAsSystemValue(BABYLON.NodeMaterialSystemValues.ViewProjection);

  // VertexOutputBlock
  var VertexOutput = new BABYLON.VertexOutputBlock("VertexOutput");
  VertexOutput.visibleInInspector = false;
  VertexOutput.visibleOnFrame = false;
  VertexOutput.target = 1;

  // Connections
  position.output.connectTo(WorldPos.vector);
  World.output.connectTo(WorldPos.transform);
  WorldPos.output.connectTo(WorldPosViewProjectionTransform.vector);
  ViewProjection.output.connectTo(WorldPosViewProjectionTransform.transform);
  WorldPosViewProjectionTransform.output.connectTo(VertexOutput.vector);
  WorldPos.output.connectTo(PBRMetallicRoughness.worldPosition);
  normal.output.connectTo(Worldnormal.vector);
  World.output.connectTo(Worldnormal.transform);
  Worldnormal.output.connectTo(PBRMetallicRoughness.worldNormal);
  view.output.connectTo(PBRMetallicRoughness.view);
  cameraPosition.output.connectTo(PBRMetallicRoughness.cameraPosition);
  uv.output.connectTo(colorTex.uv);
  colorTex.rgb.connectTo(PBRMetallicRoughness.baseColor);
  Float.output.connectTo(PBRMetallicRoughness.metallic);
  uv.output.connectTo(roughnessTex.uv);
  roughnessTex.r.connectTo(PBRMetallicRoughness.roughness);
  Float1.output.connectTo(PBRMetallicRoughness.indexOfRefraction);
  PBRMetallicRoughness.diffuseDir.connectTo(specCont.left);
  PBRMetallicRoughness.specularDir.connectTo(specCont.right);
  specCont.output.connectTo(Pow.value);
  Vector.output.connectTo(Pow.power);
  Pow.output.connectTo(Lerp3.left);
  Time.output.connectTo(Multiply.left);
  speed.output.connectTo(Multiply.right);
  Multiply.output.connectTo(Add.left);
  uv1.output.connectTo(VectorSplitter.xyIn);
  VectorSplitter.x.connectTo(Add.right);
  Add.output.connectTo(Fract.input);
  Fract.output.connectTo(Gradient.gradient);
  Gradient.output.connectTo(Scale.input);
  emissiveLevel.output.connectTo(Scale.factor);
  Scale.output.connectTo(Lerp3.right);
  Color.output.connectTo(Lerp.left);
  uv.output.connectTo(emissiveTex.uv);
  emissiveTex.rgb.connectTo(Lerp.right);
  glowLevel.output.connectTo(Lerp.gradient);
  Lerp.output.connectTo(Lerp3.gradient);
  Lerp3.output.connectTo(Multiply1.left);
  Color1.output.connectTo(Lerp1.left);
  emissiveTex.rgb.connectTo(Lerp2.left);
  Gradient.output.connectTo(Lerp2.right);
  emissiveTex.r.connectTo(Lerp2.gradient);
  Lerp2.output.connectTo(Lerp1.right);
  glowLevel.output.connectTo(Lerp1.gradient);
  Lerp1.output.connectTo(Multiply1.right);
  Multiply1.output.connectTo(FragmentOutput.rgb);

  // Output nodes
  nodeMaterial.addOutputNode(VertexOutput);
  nodeMaterial.addOutputNode(FragmentOutput);


  // ---------------------------------------
  // ---------------------------------------
  // ---------------------------------------
  // ---------------------------------------


  /*
  // enable glow mask to render only emissive into glow layer, and then disable glow mask
  const al = new BABYLON.GlowLayer('activationLayer', scene)
  al.disableBoundingBoxesFromEffectLayer = true
  al.intensity = 1
  emissiveLevel.value = 2
  speed.value = 0.25
  
  al.onBeforeRenderMeshToEffect.add(() => {
    glowLevel.value = 1.0;
    al.blurKernelSize = 8
  });
  al.onAfterRenderMeshToEffect.add(() => {
    glowLevel.value = 0.0;
  });
  
  Gradient.colorSteps = []
  Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0, new BABYLON.Color3(0.76, 0, 0)))
  Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0.25, new BABYLON.Color3(1, 0.28, 0)))
  Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0.5, new BABYLON.Color3(1, 0.48, 0)))
  Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(0.75, new BABYLON.Color3(1, 0.28, 0)))
  Gradient.colorSteps.push(new BABYLON.GradientBlockColorStep(1, new BABYLON.Color3(0.76, 0, 0)))
  
  
  this.activationLayer = al
  */

  nodeMaterial.build();
  return nodeMaterial
}