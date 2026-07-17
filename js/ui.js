// js/ui.js
export class UI {
    constructor(engine) {
        this.engine = engine;
        this.screens = document.querySelectorAll('.screen');
        this.selectedLevel = 1;
        this.hudHealth = document.querySelector('.health');
        this.hudArmor = document.querySelector('.armor');
        this.hudAmmo = document.querySelector('.ammo');
    }

    init() {
        const btnCampaign = document.getElementById('btn-campaign');
        if (btnCampaign) {
            btnCampaign.addEventListener('click', () => {
                this.showScreen('campaign-menu');
            });
        }

        const btnBackCampaign = document.getElementById('btn-back-campaign');
        if (btnBackCampaign) {
            btnBackCampaign.addEventListener('click', () => {
                this.showScreen('main-menu');
            });
        }

        const missions = document.querySelectorAll('.mission');
        missions.forEach(mission => {
            mission.addEventListener('click', (e) => {
                missions.forEach(m => m.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.selectedLevel = parseInt(e.currentTarget.dataset.level);
            });
        });

        const btnToSaves = document.getElementById('btn-to-saves');
        if (btnToSaves) {
            btnToSaves.addEventListener('click', () => {
                this.updateSaveSlotsDisplay();
                this.showScreen('save-menu');
            });
        }

        const btnBackSave = document.getElementById('btn-back-save');
        if (btnBackSave) {
            btnBackSave.addEventListener('click', () => {
                this.showScreen('campaign-menu');
            });
        }

        const slots = document.querySelectorAll('.slot');
        slots.forEach(slot => {
            slot.addEventListener('click', async (e) => {
                this.engine.startGameplay(this.selectedLevel);
                const canvas = document.getElementById('game-canvas');
                if (canvas) {
                    try {
                        await canvas.requestPointerLock();
                    } catch (err) {
                        console.warn("Pointer lock failed:", err);
                    }
                }
            });
        });

        window.addEventListener('mousedown', (e) => {
            if (this.engine.isRunning && document.pointerLockElement === document.getElementById('game-canvas')) {
                if (e.button === 0) {
                    this.engine.game.fireWeapon();
                }
            } else if (this.engine.isRunning && e.target.id === 'game-canvas') {
                document.getElementById('game-canvas').requestPointerLock();
            }
        });

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.engine.isRunning) {
                if (document.pointerLockElement) {
                    document.exitPointerLock();
                }
                if (this.engine.game.victory || this.engine.game.gameOver) {
                    this.engine.stopGameplay();
                    this.showScreen('campaign-menu');
                }
            }
        });
    }

    updateSaveSlotsDisplay() {
        const saves = this.engine.saveSystem ? this.engine.saveSystem.loadAll() : { 1: null, 2: null, 3: null };
        const slots = document.querySelectorAll('.slot');
        
        slots.forEach(slot => {
            const slotId = slot.dataset.slot;
            const statusText = slot.querySelector('.slot-status');
            if (saves[slotId]) {
                statusText.textContent = "ПРОДОЛЖИТЬ";
                statusText.style.color = "#4caf50";
            } else {
                statusText.textContent = "НОВАЯ ИГРА";
                statusText.style.color = "#aaa";
            }
        });
    }

    showScreen(screenId) {
        this.screens.forEach(s => {
            s.classList.remove('active');
        });
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    updateHUD(game) {
        if (!game || !game.player) return;
        if (this.hudHealth) this.hudHealth.textContent = Math.max(0, Math.floor(game.player.hp));
        if (this.hudArmor) this.hudArmor.textContent = Math.max(0, Math.floor(game.player.armor));
        if (this.hudAmmo) this.hudAmmo.textContent = game.weaponManager.getAmmoString();
    }
}