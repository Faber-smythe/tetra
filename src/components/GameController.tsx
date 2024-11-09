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
import { useNavigate } from 'react-router-dom';
import { GameControllerProps } from "../types/GameControllerTypes";
import { isValidUrlGameData, bindPhysicsBody, encodeBase16, decodeBase16, alignmentVectors, vec2toVec3, vec3toVec2 } from "../utils";
import Pearl from "./Pearl";
import Pile from "./Pile";
import PilesByIndex from "../types/PilesByIndex";
import VictoryCheck from "../types/VictoryCheck";

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
  let sphereSpawning = false;

  let engine: BABYLON.Engine;
  let scene: BABYLON.Scene;
  let camera: BABYLON.ArcRotateCamera;
  let light: BABYLON.Light;

  let pearlPiles: Pile[] = [];
  let blackPearlMat: BABYLON.StandardMaterial
  let whitePearlMat: BABYLON.StandardMaterial
  let victoryCheck: VictoryCheck = { won: null, alignedPearls: [] }

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
    if (!engine) engine = new BABYLON.Engine(canvasRef.current, true, {
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

      const waitForPhysicsEngine = () => {
        if (havokInstance) {
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

          initGameBoard()
          initPiles()
          setTimeout(createGameFromUrl, (250));

        } else {
          setTimeout(waitForPhysicsEngine, 200)
        }
      }
      waitForPhysicsEngine()

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
    return
  };

  const initPiles = async () => {
    pileMeshes = scene.meshes.filter((mesh) =>
      mesh.name.includes("pile")
    ) as BABYLON.Mesh[];

    pileMeshes.forEach((pileMesh, i) => {
      pileMesh.name = `pile-${i}`
      const coordinates = new BABYLON.Vector2(i % 4, Math.floor(i / 4))
      pearlPiles.push(new Pile(coordinates, pileMesh, i, scene))

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
            if (ev.sourceEvent.inputIndex === 2) {
              console.log(victoryCheck.won)
              console.log(sphereSpawning)
              if (sphereSpawning || victoryCheck.won) return
              sphereSpawning = true

              // spawn a new pearl from the pile
              const pile = pearlPiles.find(pile => pile.mesh.name === pileMesh.name)
              if (!pile) { console.error("couldn't find pile for : ", pileMesh.name); return }

              const color = Array.from(gameDataString).length % 2 === 0 ? "W" : "B";
              pile.spawnPearl(`pearl-${gameDataString.length}`, color)

              //
              setTimeout(() => {
                pile.pearlSleep()
                // update gameData, url and check for winning move
                gameDataString += encodeBase16(pile.pileIndex);
                updateUrlGameData();
                sphereSpawning = false
                victoryCheck = checkForWin()
                if (victoryCheck.won) {
                  console.log(victoryCheck)
                  console.log(victoryCheck.won)
                  window.alert(`${victoryCheck.won} has won the game !`)
                }
              }, 1000)


            }
          }
        )
      );
    });
    return
  };


  const createGameFromUrl = () => {
    const queryParameters = new URLSearchParams(window.location.search);
    const urlGameData = queryParameters.get("gameData");

    if (urlGameData && !isValidUrlGameData(urlGameData)) {
      navigate("", { replace: true })
    } else {
      gameDataString = urlGameData ?? "";
    }
    if (gameDataString) loadPearlsFromGameData()
  };

  const updateUrlGameData = () => {
    navigate(`?gameData=${gameDataString}`)
  };

  const loadPearlsFromGameData = () => {
    const moves = Array.from(gameDataString)
    const pilesByIndex: PilesByIndex = {}

    sphereSpawning = true
    pearlPiles.forEach(pile => {
      pilesByIndex[encodeBase16(pile.pileIndex)] = pile
    })

    moves.forEach((moveBase16, i) => {
      const pile = pilesByIndex[moveBase16]
      setTimeout(() => {
        const pearl = pile.spawnPearl(`pearl-${i}`, i % 2 == 0 ? "W" : "B", true)
        setTimeout(() => {
          pearl.mesh.physicsBody?.setMotionType(BABYLON.PhysicsMotionType.STATIC)
          if (!victoryCheck.won) {
            console.log("no win yet")
            victoryCheck = checkForWin(pearl)
          }
          if (moves.length - 1 === i) {
            sphereSpawning = false
            if (victoryCheck.won) {
              window.alert(`${victoryCheck.won} has won the game !`)
              victoryCheck = victoryCheck
            }
          }
        }, 800)
      }, 150 * i)
    })
  }

  const checkForWin = (currentPearl?: Pearl): VictoryCheck => {
    const lastPileIndexPlayed = decodeBase16(gameDataString[gameDataString.length - 1])
    const lastPilePlayed = pearlPiles[lastPileIndexPlayed]
    if (!currentPearl) currentPearl = lastPilePlayed.pearls[lastPilePlayed.pearls.length - 1]
    // check win on each axis
    alignmentVectors.forEach((axis, i) => {
      const alignedPearls = checkAligmentOnAxis(currentPearl!, axis)
      if (alignedPearls.length == 4) {
        victoryCheck.alignedPearls = alignedPearls
        victoryCheck.alignedPearls.forEach(pearl => { pearl.mesh.showBoundingBox = true })
        victoryCheck.won = alignedPearls[0].color === "B" ? "Black" : "White"
      }
    })
    console.log(victoryCheck.alignedPearls)
    console.log(currentPearl, victoryCheck)
    return victoryCheck
  }

  const checkAligmentOnAxis = (currentPearl: Pearl, axis: BABYLON.Vector3): Pearl[] => {
    if (!currentPearl) return []
    const alignment: Pearl[] = [currentPearl]
    // check in the axis direction
    let nextPearl = getNextPearl(currentPearl, axis)
    while (alignment.length < 4 && nextPearl !== null) {
      alignment.push(nextPearl)
      nextPearl = getNextPearl(nextPearl, axis)
    }
    // check in the axis opposite direction
    let previousPearl = getNextPearl(currentPearl, axis.negate())
    while (alignment.length < 4 && previousPearl != null) {
      alignment.push(previousPearl)
      previousPearl = getNextPearl(previousPearl, axis.negate())
    }
    return alignment
  }

  const getNextPearl = (currentPearl: Pearl, axis: BABYLON.Vector3): Pearl | null => {
    const allPearls = pearlPiles.map(pile => pile.pearls).reduce((pileA, pileB) => pileA.concat(pileB))
    const nextPearl = allPearls.find(pearl => (
      pearl.coordinates.equals(currentPearl.coordinates.add(axis)) &&
      pearl.color == currentPearl.color
    ))
    return nextPearl ?? null
  }

  return (
    <canvas id="renderCanvas" ref={canvasRef}>
      {" "}
    </canvas>
  );
}
