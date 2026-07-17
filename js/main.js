// js/main.js
import { Game } from './game.js';
import { UI } from './ui.js';
import { SaveSystem } from './save.js';
import { AudioSystem } from './audio.js';

class Engine {
    constructor() {
        this.lastTime = 0;
        this.game = new Game();
        this.ui = new UI(this);
        this.saveSystem = new SaveSystem();
        this.audioSystem = new AudioSystem();
        this.game.setAudioSystem(this.audioSystem);
        this.isRunning = false;
    }

    start() {
        this.ui.init();
    }

    initGame(levelId) {
        this.game.initGame(levelId);
    }

    startGameplay(levelId) {
        this.ui.showScreen('game-screen');
        this.initGame(levelId);
        this.startGameLoop();
    }

    stopGameplay() {
        this.isRunning = false;
    }

    startGameLoop() {
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.loop(time));
    }

    loop(timestamp) {
        if (!this.isRunning) return;
        
        const deltaTime = Math.min(50, timestamp - this.lastTime);
        this.lastTime = timestamp;

        this.game.update(deltaTime);
        this.game.render();
        this.ui.updateHUD(this.game);

        requestAnimationFrame((time) => this.loop(time));
    }
}

const engine = new Engine();
engine.start();