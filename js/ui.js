// js/ui.js
export class UI {
    constructor(engine) {
        this.engine = engine;
        this.screens = document.querySelectorAll('.screen');
        this.selectedLevel = 1;
        this.hudHealth = document.querySelector('.health');
        this.hudArmor = document.querySelector('.armor');
        this.hudAmmo = document.querySelector('.ammo');
        this.isFiring = false;
    }

    init() {
        const btnSettings = document.getElementById('btn-settings');
        if (btnSettings) {
            btnSettings.addEventListener('click', () => {
                let settingsMenu = document.getElementById('settings-menu');
                if (!settingsMenu) {
                    settingsMenu = document.createElement('div');
                    settingsMenu.id = 'settings-menu';
                    settingsMenu.className = 'screen';
                    settingsMenu.innerHTML = `
                        <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; width:100%; height:100%; background:radial-gradient(circle, #2b0000 0%, #000000 100%);">
                            <h2 style="font-size:3rem; color:var(--doom-red); margin-bottom:50px;">НАСТРОЙКИ</h2>
                            <div style="margin-bottom:40px; text-align:center;">
                                <label style="font-size:2rem; display:block; margin-bottom:20px;">Вид оружия</label>
                                <select id="weapon-view-select" style="font-size:1.5rem; background:#000; color:#fff; border:2px solid var(--doom-red); padding:10px; font-family:inherit; cursor:pointer;">
                                    <option value="modern">Современный</option>
                                    <option value="classic">Классический</option>
                                </select>
                            </div>
                            <button id="btn-back-settings" class="doom-btn">НАЗАД</button>
                        </div>
                    `;
                    document.body.appendChild(settingsMenu);
                    this.screens = document.querySelectorAll('.screen');
                    
                    const select = document.getElementById('weapon-view-select');
                    select.value = localStorage.getItem('weapon_view') || 'modern';
                    select.addEventListener('change', (e) => {
                        localStorage.setItem('weapon_view', e.target.value);
                    });
                    
                    document.getElementById('btn-back-settings').addEventListener('click', () => {
                        this.showScreen('main-menu');
                    });
                }
                this.showScreen('settings-menu');
            });
        }

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
                const slotId = parseInt(e.currentTarget.dataset.slot);
                this.engine.saveProgress(slotId, { level: this.selectedLevel });
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
                    this.isFiring = true;
                    this.engine.game.fireWeapon();
                }
            } else if (this.engine.isRunning && e.target.id === 'game-canvas') {
                document.getElementById('game-canvas').requestPointerLock();
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.isFiring = false;
            }
        });

        window.addEventListener('wheel', (e) => {
            if (this.engine.isRunning && document.pointerLockElement === document.getElementById('game-canvas')) {
                if (e.deltaY > 0) {
                    this.engine.game.weaponManager.switchNext(this.engine.game);
                } else if (e.deltaY < 0) {
                    this.engine.game.weaponManager.switchPrev(this.engine.game);
                }
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
        const saves = this.engine.loadAllProgress();
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

        if (this.isFiring && game.weaponManager.weapons[game.weaponManager.currentWeapon].auto) {
            game.fireWeapon();
        }
    }
}