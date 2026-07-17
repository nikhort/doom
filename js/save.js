// js/save.js
export class SaveSystem {
    constructor() {
        this.storageKey = 'doom_web_save';
    }

    saveProgress(slot, data) {
        const currentSaves = this.loadAll();
        currentSaves[slot] = data;
        localStorage.setItem(this.storageKey, JSON.stringify(currentSaves));
    }

    loadProgress(slot) {
        return this.loadAll()[slot] || null;
    }

    loadAll() {
        return JSON.parse(localStorage.getItem(this.storageKey)) || { 1: null, 2: null, 3: null };
    }
}