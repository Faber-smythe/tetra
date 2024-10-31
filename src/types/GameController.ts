"use client"; // This is a client component

import React from "react";
import * as BABYLON from "@babylonjs/core";
import "@babylonjs/loaders";
import { registerBuiltInLoaders } from "@babylonjs/loaders/dynamic";
// import { Inspector } from '@babylonjs/inspector';
import { useState, useEffect } from "react";
import GameControllerProps from '../propTypes/GameControllerProps';


const GameController: React.FC<GameControllerProps> = ({ debug, canvas }) => {

  let gameDataString: ""
  let loading: true
  let engine: undefined
  let scene: undefined
  let camera: undefined
  let lights: undefined
  let gameBoard: undefined

  useEffect(() => {
    console.log(debug, canvas)
    setUp();
  }, [])



  registerBuiltInLoaders();


  const setUp = async () => {
    await babylonInit();

    createGameFromUrl()
  };

  const babylonInit = async () => {
    // initialize
    this.engine = new BABYLON.Engine(this.canvas);
    this.scene = new BABYLON.Scene(this.enging);
    //
    // import assets
    await BABYLON.SceneLoader.ImportMeshAsync(
      "",
      "Tetra.glb",
      undefined,
      this.scene
    );

    // environment
  }

  const createGameFromUrl = () => {
    const queryParameters = new URLSearchParams(window.location.search)
    const urlGameData = queryParameters.get("gameData")
  }

  return (<></>)
}


export default GameController