import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
  private healthBar!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;
  private ammoText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private score: number = 0;
  private gameOverContainer!: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'UIScene' });
  }

  create(): void {
    this.createHealthBar();
    this.createAmmoDisplay();
    this.createScoreDisplay();
    this.createControls();
    this.createGameOverScreen();
    this.setupEvents();
  }

  private createHealthBar(): void {
    const x = 20;
    const y = 20;

    // Background
    this.add.rectangle(x + 75, y + 10, 160, 24, 0x333333).setOrigin(0, 0.5);

    // Health bar
    this.healthBar = this.add.graphics();
    this.updateHealthBar(100, 100);

    // Label
    this.add.text(x, y, 'HP', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold',
    });

    // Health text
    this.healthText = this.add.text(x + 155, y, '100/100', {
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5, 0);
  }

  private updateHealthBar(current: number, max: number): void {
    const x = 95;
    const y = 14;
    const width = 150;
    const height = 16;
    const percentage = current / max;

    this.healthBar.clear();

    // Background
    this.healthBar.fillStyle(0x222222, 1);
    this.healthBar.fillRect(x, y, width, height);

    // Health fill
    const color = percentage > 0.5 ? 0x00ff00 : percentage > 0.25 ? 0xffff00 : 0xff0000;
    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(x + 2, y + 2, (width - 4) * percentage, height - 4);

    // Border
    this.healthBar.lineStyle(2, 0xffffff, 0.8);
    this.healthBar.strokeRect(x, y, width, height);

    this.healthText?.setText(`${current}/${max}`);
  }

  private createAmmoDisplay(): void {
    const x = 20;
    const y = 50;

    this.add.text(x, y, 'AMMO', {
      fontSize: '14px',
      color: '#aaaaaa',
    });

    this.ammoText = this.add.text(x + 60, y, '30/30', {
      fontSize: '16px',
      color: '#ffff00',
      fontStyle: 'bold',
    });
  }

  private updateAmmoDisplay(current: number, max: number): void {
    this.ammoText.setText(`${current}/${max}`);
    if (current <= 5) {
      this.ammoText.setColor('#ff0000');
    } else {
      this.ammoText.setColor('#ffff00');
    }
  }

  private createScoreDisplay(): void {
    const x = this.cameras.main.width - 20;
    const y = 20;

    this.add.text(x, y, 'SCORE', {
      fontSize: '14px',
      color: '#aaaaaa',
    }).setOrigin(1, 0);

    this.scoreText = this.add.text(x, y + 20, '0', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(1, 0);
  }

  private updateScore(points: number): void {
    this.score += points;
    this.scoreText.setText(this.score.toString());

    // Score pop effect
    this.tweens.add({
      targets: this.scoreText,
      scale: 1.3,
      duration: 100,
      yoyo: true,
    });
  }

  private createControls(): void {
    const x = 20;
    const y = this.cameras.main.height - 100;

    const controlsText = [
      'Controls:',
      'WASD / Arrows - Move',
      'Mouse - Aim & Shoot',
      'E - Enter/Exit Buildings',
    ].join('\n');

    this.add.text(x, y, controlsText, {
      fontSize: '12px',
      color: '#888888',
      lineSpacing: 4,
    });
  }

  private createGameOverScreen(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    const bg = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.8);
    bg.setOrigin(0.5);

    const gameOverText = this.add.text(0, -60, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const scoreLabel = this.add.text(0, 0, 'Final Score:', {
      fontSize: '20px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const finalScore = this.add.text(0, 30, '0', {
      fontSize: '36px',
      color: '#ffff00',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    const restartText = this.add.text(0, 80, 'Press R to Restart', {
      fontSize: '18px',
      color: '#aaaaaa',
    }).setOrigin(0.5);

    this.gameOverContainer = this.add.container(centerX, centerY, [
      bg,
      gameOverText,
      scoreLabel,
      finalScore,
      restartText,
    ]);

    this.gameOverContainer.setVisible(false);
    this.gameOverContainer.setDepth(1000);
  }

  private showGameOver(): void {
    const finalScoreText = this.gameOverContainer.list[3] as Phaser.GameObjects.Text;
    finalScoreText.setText(this.score.toString());

    this.gameOverContainer.setVisible(true);

    // Setup restart key
    this.input.keyboard!.once('keydown-R', () => {
      this.score = 0;
      this.scoreText.setText('0');
      this.gameOverContainer.setVisible(false);
      this.updateHealthBar(100, 100);
      this.updateAmmoDisplay(30, 30);

      // Restart the game
      this.scene.stop('CityScene');
      this.scene.stop('BuildingScene');
      this.scene.start('CityScene');
    });
  }

  private setupEvents(): void {
    // Listen to game scene events
    const cityScene = this.scene.get('CityScene');
    const buildingScene = this.scene.get('BuildingScene');

    [cityScene, buildingScene].forEach((gameScene) => {
      gameScene.events.on('healthChanged', (current: number, max: number) => {
        this.updateHealthBar(current, max);
      });

      gameScene.events.on('ammoChanged', (current: number, max: number) => {
        this.updateAmmoDisplay(current, max);
      });
    });

    // UI scene events
    this.events.on('addScore', (points: number) => {
      this.updateScore(points);
    });

    this.events.on('showGameOver', () => {
      this.showGameOver();
    });
  }
}
