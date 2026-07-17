// js/game.js
import { Player, Enemy } from './entities.js';
import { Renderer } from './renderer.js';
import { WeaponManager } from './weapons.js';
import { LEVELS } from './levels.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.renderer = new Renderer(this.canvas, this.ctx);
        this.weaponManager = new WeaponManager();
        this.player = null;
        this.map = [];
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.victory = false;
        this.gameOver = false;
        this.currentLevel = 1;
        this.audioSystem = null;
    }

    setAudioSystem(audio) {
        this.audioSystem = audio;
    }

    initGame(levelId) {
        this.currentLevel = levelId;
        this.victory = false;
        this.gameOver = false;
        this.projectiles = [];
        this.particles = [];
        this.resize();
        window.removeEventListener('resize', this.resizeHandler);
        this.resizeHandler = () => this.resize();
        window.addEventListener('resize', this.resizeHandler);
        this.bindControls();
        this.loadLevel(levelId);
    }

    loadLevel(levelId) {
        const levelData = LEVELS[levelId] || LEVELS[1];
        this.map = JSON.parse(JSON.stringify(levelData.map));
        this.createPlayer(levelData);
        this.spawnEnemies(levelData);
    }

    createPlayer(levelData) {
        this.player = new Player(levelData.startX, levelData.startY);
        this.weaponManager.reset();
    }

    spawnEnemies(levelData) {
        this.enemies = [];
        if (levelData.enemies) {
            levelData.enemies.forEach(e => {
                this.enemies.push(new Enemy(e.x, e.y, e.type));
            });
        }
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    bindControls() {
        window.removeEventListener('keydown', this.keyDownHandler);
        window.removeEventListener('keyup', this.keyUpHandler);
        window.removeEventListener('mousemove', this.mouseMoveHandler);

        this.keyDownHandler = (e) => {
            if (this.player) this.player.handleInput(e.key, true);
        };
        this.keyUpHandler = (e) => {
            if (this.player) this.player.handleInput(e.key, false);
        };
        this.mouseMoveHandler = (e) => {
            if (document.pointerLockElement === this.canvas && this.player && !this.victory && !this.gameOver) {
                this.player.rotate(e.movementX * -0.0025);
            }
        };

        window.addEventListener('keydown', this.keyDownHandler);
        window.addEventListener('keyup', this.keyUpHandler);
        window.addEventListener('mousemove', this.mouseMoveHandler);
    }

    fireWeapon() {
        if (this.victory || this.gameOver || !this.player) return;
        this.weaponManager.fire(this, performance.now());
    }

    update(dt) {
        if (this.victory || this.gameOver || !this.player) return;

        this.player.update(dt, this.map, this);
        this.weaponManager.update(dt);

        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].update(dt, this);
            if (this.enemies[i].dead) {
                this.enemies.splice(i, 1);
            }
        }

        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            this.projectiles[i].update(dt, this);
            if (this.projectiles[i].dead) {
                this.projectiles.splice(i, 1);
            }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].update(dt);
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    render() {
        if (!this.player) return;
        this.renderer.render(this);
    }
}