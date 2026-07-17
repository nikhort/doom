export class UI {
    constructor(engine) {
        this.engine = engine;
        this.screens = document.querySelectorAll('.screen');
        this.selectedLevel = 1;
    }

    init() {
        // --- ГЛАВНОЕ МЕНЮ ---
        const btnCampaign = document.getElementById('btn-campaign');
        if (btnCampaign) {
            btnCampaign.addEventListener('click', () => {
                this.showScreen('campaign-menu');
            });
        }

        // --- МЕНЮ КАМПАНИИ ---
        // Кнопка "Назад"
        const btnBackCampaign = document.getElementById('btn-back-campaign');
        if (btnBackCampaign) {
            btnBackCampaign.addEventListener('click', () => {
                this.showScreen('main-menu');
            });
        }

        // Выбор миссии (подсветка активной)
        const missions = document.querySelectorAll('.mission');
        missions.forEach(mission => {
            mission.addEventListener('click', (e) => {
                missions.forEach(m => m.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.selectedLevel = parseInt(e.currentTarget.dataset.level);
            });
        });

        // Кнопка "Играть" -> Переход к сохранениям
        const btnToSaves = document.getElementById('btn-to-saves');
        if (btnToSaves) {
            btnToSaves.addEventListener('click', () => {
                this.updateSaveSlotsDisplay();
                this.showScreen('save-menu');
            });
        }

        // --- ЭКРАН СОХРАНЕНИЙ ---
        // Кнопка "Назад"
        const btnBackSave = document.getElementById('btn-back-save');
        if (btnBackSave) {
            btnBackSave.addEventListener('click', () => {
                this.showScreen('campaign-menu');
            });
        }

        // Выбор слота и старт игры
        const slots = document.querySelectorAll('.slot');
        slots.forEach(slot => {
            slot.addEventListener('click', async (e) => {
                const slotId = parseInt(e.currentTarget.dataset.slot);
                // Начинаем игру на выбранном уровне
                this.engine.startGameplay(this.selectedLevel);
                
                // Захват курсора мыши (Pointer Lock API)
                try {
                    await document.body.requestPointerLock();
                } catch (err) {
                    console.warn("Pointer lock failed. Please interact with the document first.", err);
                }
            });
        });
    }

    updateSaveSlotsDisplay() {
        // Читаем сохранения (если система сохранений уже реализована в engine)
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
        } else {
            console.error(`Screen with id "${screenId}" not found in DOM.`);
        }
    }
}