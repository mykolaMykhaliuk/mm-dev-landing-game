import { io, Socket } from 'socket.io-client';
import {
  PlayerState,
  PlayerMoveData,
  AttackData,
  EnemyState,
  PickupState,
  GameState,
  SceneChangeData,
  ServerToClientEvents,
  ClientToServerEvents
} from './types';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

type EventCallback<T> = (data: T) => void;

export class NetworkManager {
  private static instance: NetworkManager;
  private socket: TypedSocket | null = null;
  private playerId: string = '';
  private roomId: string = '';
  private connected: boolean = false;

  // Event listeners
  private eventListeners: Map<string, Set<EventCallback<unknown>>> = new Map();

  private constructor() {}

  static getInstance(): NetworkManager {
    if (!NetworkManager.instance) {
      NetworkManager.instance = new NetworkManager();
    }
    return NetworkManager.instance;
  }

  connect(serverUrl: string = 'http://localhost:3001'): Promise<GameState> {
    return new Promise((resolve, reject) => {
      this.socket = io(serverUrl) as TypedSocket;

      this.socket.on('connect', () => {
        this.playerId = this.socket!.id!;
        this.connected = true;
        console.log('Connected to server:', this.playerId);
      });

      this.socket.on('gameState', (data: GameState) => {
        this.roomId = data.roomId;
        console.log('Received game state:', data);
        resolve(data);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });

      // Setup all event forwarding
      this.setupEventForwarding();

      // Timeout
      setTimeout(() => {
        if (!this.connected) {
          reject(new Error('Connection timeout'));
        }
      }, 5000);
    });
  }

  private setupEventForwarding(): void {
    if (!this.socket) return;

    // Player events
    this.socket.on('playerJoined', (data) => this.emit('playerJoined', data));
    this.socket.on('playerLeft', (data) => this.emit('playerLeft', data));
    this.socket.on('playerMoved', (data) => this.emit('playerMoved', data));
    this.socket.on('playerAttacked', (data) => this.emit('playerAttacked', data));
    this.socket.on('playerWeaponSwitched', (data) => this.emit('playerWeaponSwitched', data));
    this.socket.on('playerDied', () => this.emit('playerDied', null));
    this.socket.on('otherPlayerDied', (data) => this.emit('otherPlayerDied', data));

    // Enemy events
    this.socket.on('enemySpawned', (data) => this.emit('enemySpawned', data));
    this.socket.on('enemiesUpdated', (data) => this.emit('enemiesUpdated', data));
    this.socket.on('enemyHit', (data) => this.emit('enemyHit', data));
    this.socket.on('enemyDied', (data) => this.emit('enemyDied', data));

    // Pickup events
    this.socket.on('pickupSpawned', (data) => this.emit('pickupSpawned', data));
    this.socket.on('pickupClaimed', (data) => this.emit('pickupClaimed', data));
    this.socket.on('pickupRemoved', (data) => this.emit('pickupRemoved', data));

    // Game events
    this.socket.on('scoreUpdated', (data) => this.emit('scoreUpdated', data));
    this.socket.on('sceneChange', (data) => this.emit('sceneChange', data));
  }

  // Event system for game scenes to listen
  on<T>(event: string, callback: EventCallback<T>): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback as EventCallback<unknown>);
  }

  off<T>(event: string, callback: EventCallback<T>): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(callback as EventCallback<unknown>);
    }
  }

  private emit(event: string, data: unknown): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => callback(data));
    }
  }

  // Send player position (volatile - can be dropped)
  sendPlayerMove(data: PlayerMoveData): void {
    this.socket?.volatile.emit('playerMove', data);
  }

  // Send attack event
  sendAttack(data: { weapon: string; direction: { x: number; y: number }; bulletId?: string }): void {
    this.socket?.emit('playerAttack', data);
  }

  // Send weapon switch
  sendWeaponSwitch(weapon: 'GUN' | 'SWORD'): void {
    this.socket?.emit('playerWeaponSwitch', { weapon });
  }

  // Request hit validation
  requestHit(enemyId: string, damage: number, weapon: string): void {
    this.socket?.emit('requestHit', { enemyId, damage, weapon });
  }

  // Request pickup
  requestPickup(pickupId: string): void {
    this.socket?.emit('requestPickup', { pickupId });
  }

  // Report damage taken
  reportDamage(damage: number): void {
    this.socket?.emit('playerDamaged', { damage });
  }

  // Request enter building
  requestEnterBuilding(buildingId: number): void {
    this.socket?.emit('requestEnterBuilding', { buildingId });
  }

  // Request exit building
  requestExitBuilding(): void {
    this.socket?.emit('requestExitBuilding');
  }

  // Getters
  getPlayerId(): string {
    return this.playerId;
  }

  getRoomId(): string {
    return this.roomId;
  }

  isConnected(): boolean {
    return this.connected;
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.connected = false;
    this.eventListeners.clear();
  }
}

// Export types for convenience
export type {
  PlayerState,
  PlayerMoveData,
  AttackData,
  EnemyState,
  PickupState,
  GameState,
  SceneChangeData
};
