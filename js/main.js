import { Game } from './game.js';
import { UI } from './ui.js';
import { SaveSystem } from './save.js';

class Engine {
    constructor() {
        this.lastTime = 0;
        this.game = new Game();
        this.ui = new UI(this);
        this.saveSystem = new SaveSystem();
        this.isRunning = false;
    }

    start() {
        this.ui.init();
    }

    startGameplay(levelId) {
        this.ui.showScreen('game-screen');
        this.game.init(levelId);
        this.isRunning = true;
        requestAnimationFrame((time) => this.loop(time));
    }

    loop(timestamp) {
        if (!this.isRunning) return;
        
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.game.update(deltaTime);
        this.game.render();

        requestAnimationFrame((time) => this.loop(time));
    }
}

const engine = new Engine();
engine.start();