import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { CityScene } from './scenes/CityScene';
import { BuildingScene } from './scenes/BuildingScene';
import { UIScene } from './scenes/UIScene';
import { ConversationScene } from './scenes/ConversationScene';
import { NetworkManager } from './network/NetworkManager';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  parent: 'game-container',
  backgroundColor: '#2d2d44',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, CityScene, BuildingScene, UIScene, ConversationScene],
  dom: {
    createContainer: true,
  },
  pixelArt: false,
  antialias: true,
};

// Initialize game with network connection
async function initGame() {
  const networkManager = NetworkManager.getInstance();

  // Show connecting message
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading-overlay';
  loadingDiv.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #2d2d44;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    font-family: Arial, sans-serif;
    color: white;
  `;
  loadingDiv.innerHTML = `
    <h2>Connecting to server...</h2>
    <p style="color: #888;">Multiplayer game session</p>
  `;
  document.body.appendChild(loadingDiv);

  try {
    // Get server URL from environment or default to localhost
    const serverUrl = (import.meta as any).env?.VITE_SERVER_URL || 'http://localhost:3001';

    const gameState = await networkManager.connect(serverUrl);
    console.log('Connected! Game state:', gameState);

    // Store initial game state globally for scenes to access
    (window as any).__INITIAL_GAME_STATE__ = gameState;

    // Remove loading overlay
    loadingDiv.remove();

    // Start game
    new Phaser.Game(config);
  } catch (error) {
    console.error('Failed to connect to server:', error);

    // Show error message with retry option
    loadingDiv.innerHTML = `
      <h2 style="color: #ff6666;">Connection Failed</h2>
      <p style="color: #888;">Could not connect to game server</p>
      <p style="color: #666; font-size: 12px;">Make sure the server is running: npm run server</p>
      <button onclick="location.reload()" style="
        margin-top: 20px;
        padding: 10px 20px;
        font-size: 16px;
        background: #4466ff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      ">Retry Connection</button>
      <button onclick="window.__START_OFFLINE__()" style="
        margin-top: 10px;
        padding: 10px 20px;
        font-size: 14px;
        background: #666;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      ">Play Offline (Single Player)</button>
    `;

    // Allow offline play
    (window as any).__START_OFFLINE__ = () => {
      loadingDiv.remove();
      (window as any).__OFFLINE_MODE__ = true;
      new Phaser.Game(config);
    };
  }
}

initGame();
