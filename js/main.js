// js/main.js
import { Game } from './game.js';
import { UI } from './ui.js';
import { AudioSystem } from './audio.js';

class Engine {
    constructor() {
        this.storageKey = 'doom_web_save';
        this.lastTime = 0;
        this.game = new Game();
        this.ui = new UI(this);
        this.audioSystem = new AudioSystem();
        this.game.setAudioSystem(this.audioSystem);
        this.isRunning = false;
    }

    saveProgress(slot, data) {
        const currentSaves = this.loadAllProgress();
        currentSaves[slot] = data;
        localStorage.setItem(this.storageKey, JSON.stringify(currentSaves));
    }

    loadProgress(slot) {
        return this.loadAllProgress()[slot] || null;
    }

    loadAllProgress() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || { 1: null, 2: null, 3: null };
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