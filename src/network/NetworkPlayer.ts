import Phaser from 'phaser';
import { PlayerMoveData } from './types';

export class NetworkPlayer extends Phaser.Physics.Arcade.Sprite {
  private playerId: string;
  private targetX: number;
  private targetY: number;
  private nameLabel: Phaser.GameObjects.Text;
  private healthBar: Phaser.GameObjects.Graphics;
  private currentHealth: number = 100;
  private lastDirection: { x: number; y: number } = { x: 1, y: 0 };

  constructor(scene: Phaser.Scene, id: string, x: number, y: number) {
    super(scene, x, y, 'player_right');

    this.playerId = id;
    this.targetX = x;
    this.targetY = y;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Set up physics body
    this.setSize(20, 10);
    this.setOffset(6, 22);

    // Tint to differentiate from local player
    this.setTint(0x88ff88);

    // Create name label
    this.nameLabel = scene.add.text(x, y - 45, `P-${id.slice(0, 4)}`, {
      fontSize: '11px',
      color: '#00ff00',
      stroke: '#000000',
      strokeThickness: 2
    });
    this.nameLabel.setOrigin(0.5);
    this.nameLabel.setDepth(1000);

    // Create health bar
    this.healthBar = scene.add.graphics();
    this.updateHealthBar();

    this.setDepth(y + 10);
  }

  update(_time: number, _delta: number): void {
    // Smooth interpolation to target position
    const lerp = 0.15;
    this.x += (this.targetX - this.x) * lerp;
    this.y += (this.targetY - this.y) * lerp;

    // Update label position
    this.nameLabel.setPosition(this.x, this.y - 45);

    // Update health bar position
    this.updateHealthBar();

    // Update depth for isometric sorting
    this.setDepth(this.y + 10);
    this.nameLabel.setDepth(this.y + 1000);
  }

  setTargetPosition(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
  }

  updateFromServer(data: PlayerMoveData & { id: string }): void {
    this.setTargetPosition(data.x, data.y);

    if (data.direction) {
      this.lastDirection = data.direction;
      this.updateTexture();
    }

    if (data.health !== undefined) {
      this.currentHealth = data.health;
      this.updateHealthBar();
    }
  }

  private updateTexture(): void {
    const dir = this.lastDirection;

    // Determine texture based on direction
    let texture = 'player_right';

    if (Math.abs(dir.x) > Math.abs(dir.y)) {
      texture = dir.x > 0 ? 'player_right' : 'player_left';
    } else {
      texture = dir.y > 0 ? 'player_down' : 'player_up';
    }

    // Handle diagonals
    if (Math.abs(dir.x) > 0.3 && Math.abs(dir.y) > 0.3) {
      if (dir.x > 0 && dir.y > 0) texture = 'player_downRight';
      else if (dir.x > 0 && dir.y < 0) texture = 'player_upRight';
      else if (dir.x < 0 && dir.y > 0) texture = 'player_downLeft';
      else if (dir.x < 0 && dir.y < 0) texture = 'player_upLeft';
    }

    if (this.texture.key !== texture) {
      this.setTexture(texture);
    }
  }

  private updateHealthBar(): void {
    this.healthBar.clear();

    const barWidth = 30;
    const barHeight = 4;
    const x = this.x - barWidth / 2;
    const y = this.y - 38;

    // Background
    this.healthBar.fillStyle(0x000000, 0.6);
    this.healthBar.fillRect(x - 1, y - 1, barWidth + 2, barHeight + 2);

    // Health fill
    const healthPercent = this.currentHealth / 100;
    const fillColor = healthPercent > 0.5 ? 0x00ff00 : (healthPercent > 0.25 ? 0xffff00 : 0xff0000);
    this.healthBar.fillStyle(fillColor, 1);
    this.healthBar.fillRect(x, y, barWidth * healthPercent, barHeight);

    this.healthBar.setDepth(this.y + 999);
  }

  showAttack(weapon: 'GUN' | 'SWORD', direction: { x: number; y: number }): void {
    if (weapon === 'SWORD') {
      this.showSwordSwing(direction);
    } else {
      this.showGunShot(direction);
    }
  }

  private showSwordSwing(direction: { x: number; y: number }): void {
    // Create sword swing visual
    const angle = Math.atan2(direction.y, direction.x);

    const graphics = this.scene.add.graphics();
    graphics.lineStyle(3, 0xaaaaaa, 0.8);

    const startAngle = angle - Math.PI / 4;
    const endAngle = angle + Math.PI / 4;

    graphics.beginPath();
    graphics.arc(this.x, this.y, 50, startAngle, endAngle);
    graphics.strokePath();

    graphics.setDepth(this.y + 5);

    // Fade out
    this.scene.tweens.add({
      targets: graphics,
      alpha: 0,
      duration: 200,
      onComplete: () => graphics.destroy()
    });
  }

  private showGunShot(_direction: { x: number; y: number }): void {
    // Muzzle flash effect
    const flash = this.scene.add.circle(this.x + 10, this.y, 8, 0xffff00, 0.8);
    flash.setDepth(this.y + 5);

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      scale: 0.5,
      duration: 100,
      onComplete: () => flash.destroy()
    });
  }

  getPlayerId(): string {
    return this.playerId;
  }

  destroy(fromScene?: boolean): void {
    this.nameLabel?.destroy();
    this.healthBar?.destroy();
    super.destroy(fromScene);
  }
}
