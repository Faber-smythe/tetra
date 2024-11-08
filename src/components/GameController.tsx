"use client"; // This is a client component

import React from "react";
import * as BABYLON from "@babylonjs/core";
import { PhysicsViewer } from "@babylonjs/core/Debug/physicsViewer";
import { Inspector } from "@babylonjs/inspector";
import "@babylonjs/core/Debug/physicsViewer";

import HavokPhysics from "@babylonjs/havok";
import "@babylonjs/loaders";
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";
import { useEffect, useRef } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { GameControllerProps } from "../types/GameControllerTypes";
import { isValidUrlGameData, bindPhysicsBody, encodeBase16 } from "../utils";
import Pearl from "./Pearl";

export default function GameController({ debug }: GameControllerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  let physicsDebugViewer: BABYLON.PhysicsViewer;
  let gameDataString = "";
  let loading = true;
  let glbImportPrommise: Promise<BABYLON.ISceneLoaderAsyncResult>;
  let envHelper: BABYLON.EnvironmentHelper;
  let skybox: BABYLON.Mesh;
  let gameBoardMesh: BABYLON.Mesh;
  let pileMeshes: BABYLON.Mesh[];
  let havokInstance: any;

  let engine: BABYLON.Engine;
  let scene: BABYLON.Scene;
  let camera: BABYLON.ArcRotateCamera;
  let light: BABYLON.Light;

  let pearlPiles: Pearl[][] = [];
  for (let i = 0; i < 16; i++) pearlPiles[i] = [];
  let blackPearlMat: BABYLON.StandardMaterial
  let whitePearlMat: BABYLON.StandardMaterial

  useEffect(() => {
    if (!canvasRef.current) return;
    setUp();
  }, [canvasRef]);

  registerBuiltInLoaders();

  const setUp = async () => {
    await babylonSetUp();
    createGameFromUrl()
  };

  const babylonSetUp = async () => {
    let havokPlugin;
    // initialize
    if (!engine) engine = new BABYLON.Engine(canvasRef.current, false, {
      deterministicLockstep: true,
    })
    if (!scene) {
      scene = new BABYLON.Scene(engine);
      havokInstance = await HavokPhysics();
      havokPlugin = new BABYLON.HavokPlugin(true, havokInstance);
      physicsDebugViewer = new PhysicsViewer();
      scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), havokPlugin);
    }

    if (debug) Inspector.Show(scene, {});

    // import assets
    if (!glbImportPrommise) {
      glbImportPrommise = BABYLON.SceneLoader.ImportMeshAsync(
        "",
        // "assets/Tetra.glb",
        "assets/TetraLight.glb",
        undefined,
        scene
      );
      await glbImportPrommise;

      // disable specimen assets
      const pearlSpecimen = scene.getMeshByName(
        "pearl-specimen"
      ) as BABYLON.Mesh;
      const pearlColliderSpecimen = scene.getMeshByName(
        "pearl-collider"
      ) as BABYLON.Mesh;
      pearlSpecimen.setEnabled(false);
      // if (!pearlColliderSpecimen) { console.error("no pearlSpecimen found"); return; }
      pearlColliderSpecimen.setEnabled(false);

      if (!blackPearlMat) {
        blackPearlMat = new BABYLON.StandardMaterial("black-pearls", scene)
        blackPearlMat.diffuseColor = new BABYLON.Color3(.05, .05, .05)
        blackPearlMat.roughness = 1
        blackPearlMat.specularPower = 128
      }
      if (!whitePearlMat) {
        whitePearlMat = new BABYLON.StandardMaterial("white-pearls", scene)
        whitePearlMat.diffuseColor = new BABYLON.Color3(.95, .95, .95)
        blackPearlMat.roughness = 1
        blackPearlMat.specularPower = 128
      }
      console.log(whitePearlMat)
      console.log(blackPearlMat)
      // add collider to the pearl
      const pearlshape = new BABYLON.PhysicsShapeMesh(
        pearlColliderSpecimen, // mesh from which to calculate the collisions
        scene // scene of the shape
      );
      bindPhysicsBody(
        pearlSpecimen as BABYLON.TransformNode,
        pearlshape,
        { mass: 1, restitution: 0.5 },
        scene
      );

      initGameBoard();
      initPiles();
    }

    // camera
    if (!camera)
      camera = new BABYLON.ArcRotateCamera(
        "myCamera",
        -2.6,
        1.2,
        5.5,
        new BABYLON.Vector3(0, 0.8, 0),
        scene
      );
    camera.wheelDeltaPercentage = 0.035;
    camera.attachControl(canvasRef.current);
    const resize = () => {
      scene.getEngine().resize();
    };
    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    if (!light) {
      light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
      light.intensity = 2.5;
    }
    // helper will generate
    if (!envHelper) {
      envHelper = new BABYLON.EnvironmentHelper({}, scene);
      envHelper.ground?.dispose();
    }
    // set skybox background
    if (!skybox) {
      const skybox = scene.getMeshByName("BackgroundSkybox")!;
      const backgroundMat = new BABYLON.BackgroundMaterial(
        "customSkybox",
        scene
      );
      backgroundMat.reflectionTexture = new BABYLON.CubeTexture(
        "https://raw.githubusercontent.com/Faber-smythe/magic-reflect/master/environment.env",
        scene
      );
      backgroundMat.reflectionTexture.coordinatesMode =
        BABYLON.Texture.SKYBOX_MODE;
      backgroundMat.reflectionBlur = 0.6;
      skybox.material = backgroundMat;
    }
    // add resize listener
    if (window) {
      window.addEventListener("resize", resize);
    }
    // start up the engine rendering
    engine.runRenderLoop(() => {
      scene.render();
    });
    console.log(scene);
    console.log(pearlPiles);
  };

  const initGameBoard = () => {
    // add box collider to the ground of the gameboard
    const gameBoardNode = scene.getNodeByName("game-board");
    if (!gameBoardMesh) gameBoardMesh = scene.getMeshByName("game-board_primitive0") as BABYLON.Mesh;
    if (!gameBoardMesh || !gameBoardNode) {
      console.error("no gameboard found");
      return;
    }
    const gameBoardShape = new BABYLON.PhysicsShapeBox(
      gameBoardMesh.position, // center of the box
      new BABYLON.Quaternion(), // rotation of the box
      new BABYLON.Vector3(2, 0.27, 2),
      scene
    );
    bindPhysicsBody(
      gameBoardMesh as BABYLON.TransformNode,
      gameBoardShape,
      { mass: 0, restitution: 0.5 },
      scene
    );


    // add capsule colliders for each pile
    const piles = gameBoardNode
      ?.getChildren()
      .filter((node) => node.name.includes("pile")) as BABYLON.Mesh[];
    if (piles.length != 16) return;
    const pileShape = new BABYLON.PhysicsShapeCapsule(
      new BABYLON.Vector3(0, -0.965, 0), // starting point of the capsule segment
      new BABYLON.Vector3(0, 1, 0), // ending point of the capsule segment
      0.05, // radius of the capsule
      scene // scene of the shape
    );
    piles.forEach((pileMesh, i) => {
      const transformNode = pileMesh as BABYLON.TransformNode;
      bindPhysicsBody(
        transformNode,
        pileShape,
        { mass: 0, restitution: 0.5 },
        scene
      );
    });

  };

  const initPiles = () => {
    pileMeshes = scene.meshes.filter((mesh) =>
      mesh.name.includes("pile")
    ) as BABYLON.Mesh[];

    pileMeshes.forEach((pileMesh) => {
      pileMesh.actionManager = new BABYLON.ActionManager(scene);
      pileMesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPointerOverTrigger,
          (ev) => {
            // pileMesh.showBoundingBox = true
            // TODO glowLayer
          }
        )
      );
      pileMesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPointerOverTrigger,
          (ev) => {
            // pileMesh.showBoundingBox = true
            // TODO glowLayer
          }
        )
      );
      pileMesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
          BABYLON.ActionManager.OnPickUpTrigger,
          (ev) => {
            // check for left mouse button
            if (ev.sourceEvent.inputIndex == 2) {
              spawnPearlOnPile(pileMesh as BABYLON.Mesh);
            }
          }
        )
      );
    });
  };

  const spawnPearlOnPile = (pile: BABYLON.Mesh) => {
    const pileIndex = pileMeshes.indexOf(pile);
    const color = Array.from(gameDataString).length % 2 == 0 ? "W" : "B";
    console.log(pearlPiles);
    if (typeof pileIndex != "number") console.error("pileIndex NaN");
    const newPearl = new Pearl(`pearl-${gameDataString.length}`, color, pile, scene)
    if (newPearl.color == "B") newPearl.mesh.material = blackPearlMat
    if (newPearl.color == "W") newPearl.mesh.material = whitePearlMat


    /* setting constraints and repositionning after 1000ms to workaround pearl glitching */
    setTimeout(() => {
      newPearl.mesh.physicsBody?.setMotionType(BABYLON.PhysicsMotionType.STATIC)
      newPearl.mesh.position.y = .33 + ((pearlPiles[pileIndex].length - 1) * 0.38)
    }, 1000)
    const pileConstraint = new BABYLON.SliderConstraint(
      new BABYLON.Vector3(0, 0, 0),
      new BABYLON.Vector3(0, 0, 0),
      new BABYLON.Vector3(0, 1, 0),
      new BABYLON.Vector3(0, 1, 0),
      scene
    )
    pile.physicsBody?.addConstraint(newPearl.mesh.physicsBody!, pileConstraint);

    pearlPiles[pileIndex].push(newPearl);
    gameDataString += encodeBase16(pileIndex);
    console.log(gameDataString)
    updateUrlGameData();

    checkForWin()
  };

  const createGameFromUrl = () => {
    const queryParameters = new URLSearchParams(window.location.search);
    const urlGameData = queryParameters.get("gameData");

    if (urlGameData && !isValidUrlGameData(urlGameData)) {
      window.alert("The gameData in the url is not valid /!\\")
      navigate("")
    } else {
      gameDataString = urlGameData ?? "";
    }
  };

  const updateUrlGameData = () => {
    navigate(`?gameData=${gameDataString}`)
  };

  const checkForWin = () => {

  }

  return (
    <canvas id="renderCanvas" ref={canvasRef}>
      {" "}
    </canvas>
  );
}
