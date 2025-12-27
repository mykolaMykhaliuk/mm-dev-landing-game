// Shared network types for multiplayer

export interface PlayerState {
  id: string;
  x: number;
  y: number;
  health: number;
  armor: number;
  ammo: number;
  weapon: 'GUN' | 'SWORD';
  direction: { x: number; y: number };
}

export interface PlayerMoveData {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  direction: { x: number; y: number };
  health?: number;
  armor?: number;
  weapon?: 'GUN' | 'SWORD';
}

export interface AttackData {
  id: string;
  weapon: 'GUN' | 'SWORD';
  direction: { x: number; y: number };
  bulletId?: string;
}

export interface EnemyState {
  id: string;
  x: number;
  y: number;
  health: number;
  targetPlayerId: string | null;
}

export interface PickupState {
  id: string;
  type: 'ammo' | 'health' | 'armor';
  x: number;
  y: number;
}

export interface GameState {
  playerId: string;
  roomId: string;
  players: PlayerState[];
  enemies: EnemyState[];
  pickups: PickupState[];
  score: number;
  scene: 'city' | 'building';
  buildingId?: number;
}

export interface SceneChangeData {
  scene: 'city' | 'building';
  buildingId?: number;
}

// Server -> Client events
export interface ServerToClientEvents {
  gameState: (data: GameState) => void;
  playerJoined: (player: PlayerState) => void;
  playerLeft: (playerId: string) => void;
  playerMoved: (data: PlayerMoveData & { id: string }) => void;
  playerAttacked: (data: AttackData) => void;
  playerWeaponSwitched: (data: { id: string; weapon: 'GUN' | 'SWORD' }) => void;
  enemySpawned: (enemy: EnemyState) => void;
  enemiesUpdated: (enemies: EnemyState[]) => void;
  enemyHit: (data: { enemyId: string; health: number }) => void;
  enemyDied: (enemyId: string) => void;
  pickupSpawned: (pickup: PickupState) => void;
  pickupClaimed: (pickup: PickupState) => void;
  pickupRemoved: (pickupId: string) => void;
  scoreUpdated: (score: number) => void;
  sceneChange: (data: SceneChangeData) => void;
  playerDied: () => void;
  otherPlayerDied: (playerId: string) => void;
}

// Client -> Server events
export interface ClientToServerEvents {
  playerMove: (data: PlayerMoveData) => void;
  playerAttack: (data: { weapon: string; direction: { x: number; y: number }; bulletId?: string }) => void;
  playerWeaponSwitch: (data: { weapon: 'GUN' | 'SWORD' }) => void;
  requestHit: (data: { enemyId: string; damage: number; weapon: string }) => void;
  requestPickup: (data: { pickupId: string }) => void;
  playerDamaged: (data: { damage: number }) => void;
  requestEnterBuilding: (data: { buildingId: number }) => void;
  requestExitBuilding: () => void;
}
