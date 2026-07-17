export class AudioSystem {
    constructor() {
        this.sounds = {}; // Будущий кэш AudioContext
        this.bgm = null;
    }

    playSound(id) {
        // Web Audio API logic
        console.log(`Играет звук: ${id}`);
    }

    playMusic(trackId) {
        // Остановка текущей и запуск новой
    }
}