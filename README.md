# 🎮 Tetra

**Tetra** is a 3D turn-based game inspired by a physical board game, where two players take turns dropping pearls on one of 16 vertical sticks. The goal: be the first to align four pearls of your color.

Built with **React** and **Babylon.js**, Tetra brings tactile game mechanics to the browser — complete with zooming, rotating the camera, and move-by-move game review.

---

## 🛠️ Setup Instructions

Clone the repo and run it locally:

```bash
git clone https://github.com/your-username/tetra.git
cd tetra
npm install
npm start
```

---

## ✨ Features

- 🧠 Turn-based gameplay: Black vs. White, pearl-drop mechanics through Havok Physic Engine.
- 🎥 Interactive 3D board: zoom, rotate, inspect the play area
- 📜 Timeline slider: review each turn of the game
- 🔗 URL-based game state: play asynchronously by sharing links
- 🎮 "Hot seat" local mode: both players take turns on the same screen

---

## 🚀 Live Demo

[👉 View the Game](#)  
_(Live version coming soon!)_

---

## ⚙️ Tech Stack

- **Frontend**: [React (function components, hooks)](https://fr.react.dev/)
- **3D Engine**: [Babylon.js](https://www.babylonjs.com/)
- **Assets**: Custom-designed using Blender (3D) and Photoshop (textures)

---

## Purpose

- **Showcasing** 3D and interactive UI capabilities in a React-based portfolio project
- **Personal enjoyment** and remote play with a long-distance friend

---

## Lessons & Development Notes

This project marked my transition to the modern **React hooks** API, migrating from class-based to function components. Managing game state — especially in 3D — taught me some insights on `useState` and `useRef`, particularly in syncing UI with visual interactions.

### **Future plans**
- ✅ **WebSocket** back-end for live remote play
- ✅ **Game IDs** and persistent sessions
- ✅ **Improved UI** and mobile-friendly controls
