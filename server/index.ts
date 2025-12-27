import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

// Types
interface Player {
  id: string;
  x: number;
  y: number;
  health: number;
  armor: number;
  ammo: number;
  weapon: 'GUN' | 'SWORD';
  direction: { x: number; y: number };
}

interface Enemy {
  id: string;
  x: number;
  y: number;
  health: number;
  targetPlayerId: string | null;
}

interface Pickup {
  id: string;
  type: 'ammo' | 'health' | 'armor';
  x: number;
  y: number;
}

interface Room {
  id: string;
  players: Map<string, Player>;
  enemies: Map<string, Enemy>;
  pickups: Map<string, Pickup>;
  score: number;
  scene: 'city' | 'building';
  buildingId?: number;
  enemyCounter: number;
  pickupCounter: number;
  spawnTimer: NodeJS.Timeout | null;
}

const rooms = new Map<string, Room>();
const playerRooms = new Map<string, string>();

function getOrCreateRoom(): Room {
  // Find room with space or create new
  for (const room of rooms.values()) {
    if (room.players.size < 4) return room;
  }

  const room: Room = {
    id: `room-${Date.now()}`,
    players: new Map(),
    enemies: new Map(),
    pickups: new Map(),
    score: 0,
    scene: 'city',
    enemyCounter: 0,
    pickupCounter: 0,
    spawnTimer: null
  };
  rooms.set(room.id, room);
  return room;
}

function startEnemySpawner(room: Room): void {
  if (room.spawnTimer) return;

  const spawn = () => {
    if (room.players.size === 0) {
      room.spawnTimer = null;
      return;
    }

    const difficulty = Math.floor(room.score / 50);
    const maxEnemies = Math.min(10 + difficulty * 2, 30);

    if (room.enemies.size < maxEnemies) {
      // Random spawn position on roads (simplified - actual map logic on client)
      const spawnPoints = [
        { x: 300, y: 200 }, { x: 800, y: 300 }, { x: 500, y: 500 },
        { x: 1000, y: 400 }, { x: 200, y: 600 }, { x: 700, y: 150 }
      ];
      const spawn = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];

      const enemy: Enemy = {
        id: `enemy-${room.enemyCounter++}`,
        x: spawn.x + (Math.random() - 0.5) * 100,
        y: spawn.y + (Math.random() - 0.5) * 100,
        health: 30,
        targetPlayerId: null
      };

      room.enemies.set(enemy.id, enemy);
      io.to(room.id).emit('enemySpawned', enemy);
    }

    const delay = Math.max(1000, 5000 - difficulty * 400);
    room.spawnTimer = setTimeout(spawn, delay);
  };

  spawn();
}

function spawnPickup(room: Room): void {
  const types: Array<'ammo' | 'health' | 'armor'> = ['ammo', 'ammo', 'health', 'armor'];
  const type = types[Math.floor(Math.random() * types.length)];

  const spawnPoints = [
    { x: 400, y: 300 }, { x: 600, y: 400 }, { x: 800, y: 250 },
    { x: 300, y: 500 }, { x: 900, y: 350 }
  ];
  const pos = spawnPoints[Math.floor(Math.random() * spawnPoints.length)];

  const pickup: Pickup = {
    id: `pickup-${room.pickupCounter++}`,
    type,
    x: pos.x + (Math.random() - 0.5) * 50,
    y: pos.y + (Math.random() - 0.5) * 50
  };

  room.pickups.set(pickup.id, pickup);
  io.to(room.id).emit('pickupSpawned', pickup);
}

function updateEnemyAI(room: Room): void {
  room.enemies.forEach((enemy) => {
    if (room.players.size === 0) return;

    // Find closest player
    let closestPlayer: Player | null = null;
    let closestDist = Infinity;

    room.players.forEach((player) => {
      const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
      if (dist < closestDist) {
        closestDist = dist;
        closestPlayer = player;
      }
    });

    if (closestPlayer && closestDist < 300) {
      enemy.targetPlayerId = closestPlayer.id;

      // Move toward player
      const dx = closestPlayer.x - enemy.x;
      const dy = closestPlayer.y - enemy.y;
      const len = Math.hypot(dx, dy);
      if (len > 0) {
        const speed = 1.5; // Move speed per tick
        enemy.x += (dx / len) * speed;
        enemy.y += (dy / len) * speed;
      }
    } else {
      enemy.targetPlayerId = null;
    }
  });

  // Broadcast enemy positions
  if (room.enemies.size > 0) {
    io.to(room.id).emit('enemiesUpdated', Array.from(room.enemies.values()));
  }
}

io.on('connection', (socket: Socket) => {
  console.log(`Player connected: ${socket.id}`);

  const room = getOrCreateRoom();
  socket.join(room.id);
  playerRooms.set(socket.id, room.id);

  const player: Player = {
    id: socket.id,
    x: 580,
    y: 300,
    health: 100,
    armor: 0,
    ammo: 30,
    weapon: 'GUN',
    direction: { x: 1, y: 0 }
  };
  room.players.set(socket.id, player);

  // Send current state to new player
  socket.emit('gameState', {
    playerId: socket.id,
    roomId: room.id,
    players: Array.from(room.players.values()),
    enemies: Array.from(room.enemies.values()),
    pickups: Array.from(room.pickups.values()),
    score: room.score,
    scene: room.scene,
    buildingId: room.buildingId
  });

  // Notify others of new player
  socket.to(room.id).emit('playerJoined', player);

  // Start spawners if first player
  if (room.players.size === 1) {
    startEnemySpawner(room);
    // Spawn initial pickups
    for (let i = 0; i < 3; i++) {
      spawnPickup(room);
    }
  }

  // Player movement updates
  socket.on('playerMove', (data: Partial<Player>) => {
    const p = room.players.get(socket.id);
    if (p) {
      Object.assign(p, data);
      socket.to(room.id).emit('playerMoved', { ...data, id: socket.id });
    }
  });

  // Player attack
  socket.on('playerAttack', (data: { weapon: string; direction: { x: number; y: number }; bulletId?: string }) => {
    socket.to(room.id).emit('playerAttacked', { ...data, id: socket.id });
  });

  // Weapon switch
  socket.on('playerWeaponSwitch', (data: { weapon: 'GUN' | 'SWORD' }) => {
    const p = room.players.get(socket.id);
    if (p) {
      p.weapon = data.weapon;
      socket.to(room.id).emit('playerWeaponSwitched', { id: socket.id, weapon: data.weapon });
    }
  });

  // Hit validation
  socket.on('requestHit', (data: { enemyId: string; damage: number; weapon: string }) => {
    const enemy = room.enemies.get(data.enemyId);
    if (!enemy || enemy.health <= 0) return;

    // Basic validation - could add distance check
    enemy.health -= data.damage;

    if (enemy.health <= 0) {
      room.enemies.delete(data.enemyId);
      room.score += 10;

      io.to(room.id).emit('enemyDied', data.enemyId);
      io.to(room.id).emit('scoreUpdated', room.score);

      // Chance to spawn pickup on kill
      if (Math.random() < 0.3) {
        const pickup: Pickup = {
          id: `pickup-${room.pickupCounter++}`,
          type: Math.random() < 0.7 ? 'ammo' : (Math.random() < 0.5 ? 'health' : 'armor'),
          x: enemy.x,
          y: enemy.y
        };
        room.pickups.set(pickup.id, pickup);
        io.to(room.id).emit('pickupSpawned', pickup);
      }
    } else {
      io.to(room.id).emit('enemyHit', { enemyId: data.enemyId, health: enemy.health });
    }
  });

  // Pickup claim
  socket.on('requestPickup', (data: { pickupId: string }) => {
    const pickup = room.pickups.get(data.pickupId);
    if (!pickup) return;

    room.pickups.delete(data.pickupId);

    // Send pickup to claiming player
    socket.emit('pickupClaimed', pickup);

    // Remove from all clients
    io.to(room.id).emit('pickupRemoved', data.pickupId);
  });

  // Player damaged by enemy
  socket.on('playerDamaged', (data: { damage: number }) => {
    const p = room.players.get(socket.id);
    if (p) {
      // Apply damage to armor first, then health
      if (p.armor > 0) {
        const armorDamage = Math.min(p.armor, data.damage);
        p.armor -= armorDamage;
        const remainingDamage = data.damage - armorDamage;
        p.health -= remainingDamage;
      } else {
        p.health -= data.damage;
      }

      if (p.health <= 0) {
        socket.emit('playerDied');
        socket.to(room.id).emit('otherPlayerDied', socket.id);
      }
    }
  });

  // Building entry request
  socket.on('requestEnterBuilding', (data: { buildingId: number }) => {
    // All players must enter together
    room.scene = 'building';
    room.buildingId = data.buildingId;
    room.enemies.clear();

    io.to(room.id).emit('sceneChange', {
      scene: 'building',
      buildingId: data.buildingId
    });

    // Spawn building enemies
    setTimeout(() => {
      const difficulty = Math.floor(room.score / 50);
      const numEnemies = Math.min(2 + difficulty, 8);
      for (let i = 0; i < numEnemies; i++) {
        const enemy: Enemy = {
          id: `enemy-${room.enemyCounter++}`,
          x: 200 + Math.random() * 400,
          y: 150 + Math.random() * 250,
          health: 30,
          targetPlayerId: null
        };
        room.enemies.set(enemy.id, enemy);
        io.to(room.id).emit('enemySpawned', enemy);
      }
    }, 500);
  });

  // Building exit request
  socket.on('requestExitBuilding', () => {
    room.scene = 'city';
    room.buildingId = undefined;
    room.enemies.clear();

    io.to(room.id).emit('sceneChange', { scene: 'city' });

    // Restart enemy spawner
    startEnemySpawner(room);
  });

  // Disconnect handling
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);

    room.players.delete(socket.id);
    playerRooms.delete(socket.id);
    socket.to(room.id).emit('playerLeft', socket.id);

    // Clean up room if empty
    if (room.players.size === 0) {
      if (room.spawnTimer) {
        clearTimeout(room.spawnTimer);
      }
      rooms.delete(room.id);
      console.log(`Room ${room.id} closed`);
    }
  });
});

// Enemy AI update loop (10Hz)
setInterval(() => {
  rooms.forEach((room) => {
    if (room.players.size > 0 && room.enemies.size > 0) {
      updateEnemyAI(room);
    }
  });
}, 100);

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Game server running on port ${PORT}`);
});
