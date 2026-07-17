// js/game.js
import { Player, Enemy, Item } from './entities.js';
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
        this.items = [];
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
        this.items = [];
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
        this.spawnItems();
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

    spawnItems() {
        this.items = [];
        const emptySpots = [];
        
        // Поиск пустых ячеек вдали от стен
        for (let x = 1; x < this.map.length - 1; x++) {
            for (let y = 1; y < this.map[0].length - 1; y++) {
                if (this.map[x][y] === 0) {
                    let nearWall = false;
                    for (let dx = -1; dx <= 1; dx++) {
                        for (let dy = -1; dy <= 1; dy++) {
                            const tile = this.map[x + dx][y + dy];
                            if (tile !== 0 && tile !== 3 && tile !== 4) {
                                nearWall = true;
                            }
                        }
                    }
                    if (!nearWall) {
                        emptySpots.push({ x: x + 0.5, y: y + 0.5 });
                    }
                }
            }
        }
        
        // Перемешивание мест спавна
        emptySpots.sort(() => Math.random() - 0.5);

        const addItems = (type, min, max) => {
            const count = Math.floor(Math.random() * (max - min + 1)) + min;
            for (let i = 0; i < count; i++) {
                if (emptySpots.length > 0) {
                    const spot = emptySpots.pop();
                    this.items.push(new Item(spot.x, spot.y, type));
                }
            }
        };

        addItems('medkit', 6, 10);
        addItems('armor', 6, 10);
        addItems('ammo', 4, 8);
        addItems('sphere', 1, 2);
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

        for (let i = this.items.length - 1; i >= 0; i--) {
            this.items[i].update(dt, this);
            if (this.items[i].dead) {
                this.items.splice(i, 1);
            }
        }

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