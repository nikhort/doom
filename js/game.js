import { Player } from './entities.js';
import { Renderer } from './renderer.js';

export class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.renderer = new Renderer(this.canvas, this.ctx);
        this.player = new Player(2, 2); // Стартовая позиция
        
        // 0 - пустота, 1 - стена
        this.map = [
            [1,1,1,1,1,1,1,1],
            [1,0,0,0,0,0,0,1],
            [1,0,1,0,0,1,0,1],
            [1,0,1,0,0,1,0,1],
            [1,0,0,0,0,0,0,1],
            [1,1,1,1,1,1,1,1]
        ];
    }

    init(levelId) {
        // Загрузка уровня (в будущем из JSON/конфига)
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.bindControls();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    bindControls() {
        window.addEventListener('keydown', (e) => this.player.handleInput(e.key, true));
        window.addEventListener('keyup', (e) => this.player.handleInput(e.key, false));
    }

    update(dt) {
        this.player.update(dt, this.map);
    }

    render() {
        this.renderer.render(this.player, this.map);
    }
}