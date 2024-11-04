
"use client"; // This is a client component

import React from "react";
import * as BABYLON from "@babylonjs/core";
import { PhysicsViewer } from "@babylonjs/core/Debug/physicsViewer"
import { Inspector } from '@babylonjs/inspector';
import "@babylonjs/core/Debug/physicsViewer"

import HavokPhysics from "@babylonjs/havok";
import "@babylonjs/loaders";
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";
import { useState, useEffect, useRef } from "react";
import { GameControllerProps } from '../types/GameControllerTypes';
import { isValidUrlGameData, bindPhysicsBody } from '../utils'



export default function GameController({ debug }: GameControllerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  let physicsDebugViewer: BABYLON.PhysicsViewer
  let gameDataString = ""
  let loading = true
  let glbImportPrommise: Promise<BABYLON.ISceneLoaderAsyncResult>
  let envHelper: BABYLON.EnvironmentHelper
  let skybox: BABYLON.Mesh
  let havokInstance: any

  let engine: BABYLON.Engine
  let scene: BABYLON.Scene
  let camera: BABYLON.ArcRotateCamera
  let light: BABYLON.Light

  useEffect(() => {
    if (!canvasRef.current) return
    setUp();
  }, [canvasRef])



  registerBuiltInLoaders();


  const setUp = async () => {
    createGameFromUrl()
    await babylonInit();

  };

  const babylonInit = async () => {
    let havokPlugin
    // initialize
    if (!engine) engine = new BABYLON.Engine(canvasRef.current);
    if (!scene) {
      scene = new BABYLON.Scene(engine);
      havokInstance = await HavokPhysics();
      havokPlugin = new BABYLON.HavokPlugin(true, havokInstance);
      physicsDebugViewer = new PhysicsViewer();

      scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), havokPlugin)
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
      await glbImportPrommise
      scene.getMeshByName("pearl-specimen")?.setEnabled(false)
      scene.getMeshByName("pearl-collider")?.setEnabled(false)
      addPhysicsToGameBoard()
      addPileListeners()
    }

    // camera
    if (!camera) camera = new BABYLON.ArcRotateCamera("myCamera", -2.6, 1.2, 5.5, new BABYLON.Vector3(0, .8, 0), scene)
    camera.wheelDeltaPercentage = 0.035
    camera.attachControl(canvasRef.current)
    const resize = () => {
      scene.getEngine().resize();
    };
    // helper will generate 
    if (!envHelper) {
      envHelper = new BABYLON.EnvironmentHelper({}, scene)
      envHelper.ground?.dispose()
    }
    // set skybox background
    if (!skybox) {
      const skybox = scene.getMeshByName('BackgroundSkybox')!
      const backgroundMat = new BABYLON.BackgroundMaterial('customSkybox', scene)
      backgroundMat.reflectionTexture = new BABYLON.CubeTexture(
        'https://raw.githubusercontent.com/Faber-smythe/magic-reflect/master/environment.env',
        scene
      )
      backgroundMat.reflectionTexture.coordinatesMode =
        BABYLON.Texture.SKYBOX_MODE
      backgroundMat.reflectionBlur = 0.6
      skybox.material = backgroundMat

    }
    // add resize listener
    if (window) {
      window.addEventListener("resize", resize);
    }
    // start up the engine rendering
    engine.runRenderLoop(() => { scene.render() })
    console.log(scene)
  }

  const addPhysicsToGameBoard = () => {

    // add box collider to the ground of the gameboard
    const gameBoardNode = scene.getNodeByName('game-board')
    const gameBoardMesh = scene.getMeshByName('game-board_primitive0')
    if (!gameBoardMesh || !gameBoardNode) { console.error("no gameboard found"); return; }
    const gameBoardShape = new BABYLON.PhysicsShapeBox(
      gameBoardMesh.position,        // center of the box
      new BABYLON.Quaternion(),  // rotation of the box
      new BABYLON.Vector3(2, .27, 2),
      scene
    )
    bindPhysicsBody(gameBoardMesh as BABYLON.TransformNode, gameBoardShape, { mass: 0, restitution: 0.5 }, scene);

    // add capsule colliders for each pile
    const piles = gameBoardNode?.getChildren().filter(node => node.name.includes("pile")) as BABYLON.Mesh[]
    if (piles.length != 16) return
    piles.forEach((pileMesh, i) => {
      const pileShape = new BABYLON.PhysicsShapeCapsule(
        new BABYLON.Vector3(0, -.965, 0),    // starting point of the capsule segment
        new BABYLON.Vector3(0, 1, 0),    // ending point of the capsule segment
        .05,                                  // radius of the capsule
        scene                               // scene of the shape
      );
      const transformNode = pileMesh as BABYLON.TransformNode
      bindPhysicsBody(transformNode, pileShape, { mass: 0, restitution: 0.5 }, scene);
    })


  }

  const addPileListeners = () => {
    const pileMeshes = scene.meshes.filter(mesh => mesh.name.includes("pile"))
    pileMeshes.forEach(pile => {

      pile.actionManager = new BABYLON.ActionManager(scene)
      pile.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, (ev) => {
        // pile.showBoundingBox = true
        // TODO glowLayer
      }));
      pile.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, (ev) => {
        // pile.showBoundingBox = true
        // TODO glowLayer
      }));
      pile.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickUpTrigger, (ev) => {
        console.log(ev.sourceEvent.inputIndex)
        // check for left mouse button
        if (ev.sourceEvent.inputIndex == 2) spawnPearlOnPile(pile as BABYLON.Mesh)
      }));
    })
  }

  const spawnPearlOnPile = (pile: BABYLON.Mesh) => {
    const pearlSpecimen = scene.getMeshByName("pearl-specimen") as BABYLON.Mesh;
    const pearlColliderSpecimen = scene.getMeshByName("pearl-collider") as BABYLON.Mesh;
    if (!pearlSpecimen) { console.error("no pearlSpecimen found"); return; }
    if (!pearlColliderSpecimen) { console.error("no pearlSpecimen found"); return; }
    const newPearl = pearlSpecimen.clone()
    newPearl.position = new BABYLON.Vector3(pile.position.x, 2, pile.position.z)
    // add collider to the pearl
    const pearlshape = new BABYLON.PhysicsShapeMesh(
      pearlColliderSpecimen,   // mesh from which to calculate the collisions
      scene   // scene of the shape
    );
    bindPhysicsBody(newPearl as BABYLON.TransformNode, pearlshape, { mass: 1, restitution: 0.5 }, scene);
    newPearl.setEnabled(true)
  }

  const createGameFromUrl = () => {
    const queryParameters = new URLSearchParams(window.location.search)
    const urlGameData = queryParameters.get("gameData")
    if (!urlGameData || isValidUrlGameData(urlGameData)) {
      gameDataString = ""
    } else {
      gameDataString = urlGameData
    }

  }

  return (
    <canvas id="renderCanvas" ref={canvasRef}> </canvas>
  )
}
