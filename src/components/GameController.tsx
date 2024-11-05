"use client"; // This is a client component

import React from "react";
import * as BABYLON from "@babylonjs/core";
import { PhysicsViewer } from "@babylonjs/core/Debug/physicsViewer";
import { Inspector } from "@babylonjs/inspector";
import "@babylonjs/core/Debug/physicsViewer";

import HavokPhysics from "@babylonjs/havok";
import "@babylonjs/loaders";
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";
import { useState, useEffect, useRef } from "react";
import { GameControllerProps } from "../types/GameControllerTypes";
import { isValidUrlGameData, bindPhysicsBody, encodeBase16 } from "../utils";
import Pearl from "./Pearl";

export default function GameController({ debug }: GameControllerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  let physicsDebugViewer: BABYLON.PhysicsViewer;
  let gameDataString = "";
  let loading = true;
  let glbImportPrommise: Promise<BABYLON.ISceneLoaderAsyncResult>;
  let envHelper: BABYLON.EnvironmentHelper;
  let skybox: BABYLON.Mesh;
  let pileMeshes: BABYLON.Mesh[];
  let havokInstance: any;

  let engine: BABYLON.Engine;
  let scene: BABYLON.Scene;
  let camera: BABYLON.ArcRotateCamera;
  let light: BABYLON.Light;

  let pearlPiles: Pearl[][] = [];
  for (let i = 0; i < 16; i++) pearlPiles[i] = [];

  useEffect(() => {
    if (!canvasRef.current) return;
    setUp();
  }, [canvasRef]);

  registerBuiltInLoaders();

  const setUp = async () => {
    await babylonSetUp();
  };

  const babylonSetUp = async () => {
    let havokPlugin;
    // initialize
    if (!engine) engine = new BABYLON.Engine(canvasRef.current);
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
        "assets/Tetra.glb",
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
  };

  const initGameBoard = () => {
    // add box collider to the ground of the gameboard
    const gameBoardNode = scene.getNodeByName("game-board");
    const gameBoardMesh = scene.getMeshByName("game-board_primitive0");
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
    piles.forEach((pileMesh, i) => {
      const pileShape = new BABYLON.PhysicsShapeCapsule(
        new BABYLON.Vector3(0, -0.965, 0), // starting point of the capsule segment
        new BABYLON.Vector3(0, 1, 0), // ending point of the capsule segment
        0.05, // radius of the capsule
        scene // scene of the shape
      );
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
    console.log(pile.name);
    console.log(pileIndex);
    console.log(pearlPiles);
    if (typeof pileIndex != "number") console.error("pileIndex NaN");
    pearlPiles[pileIndex].push(
      new Pearl(`pearl-${gameDataString.length}`, color, pile, scene)
    );
    gameDataString += encodeBase16(pileIndex);
    updateUrlGameData();
  };

  const createGameFromUrl = () => {
    const queryParameters = new URLSearchParams(window.location.search);
    const urlGameData = queryParameters.get("gameData");
    if (!urlGameData || isValidUrlGameData(urlGameData)) {
      gameDataString = "";
    } else {
      gameDataString = urlGameData;
    }
  };

  const updateUrlGameData = () => {
    const queryParameters = new URLSearchParams(window.location.search);
    queryParameters.set("gameData", gameDataString);
  };

  return (
    <canvas id="renderCanvas" ref={canvasRef}>
      {" "}
    </canvas>
  );
}
