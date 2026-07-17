export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dirX = -1; // Вектор направления
        this.dirY = 0;
        this.planeX = 0; // Плоскость камеры (FOV)
        this.planeY = 0.66;
        
        this.moveSpeed = 0.005;
        this.rotSpeed = 0.003;
        this.keys = {};
    }

    handleInput(key, isPressed) {
        this.keys[key.toLowerCase()] = isPressed;
    }

    update(dt, map) {
        // Движение вперед/назад
        if (this.keys['w']) {
            if (map[Math.floor(this.x + this.dirX * this.moveSpeed * dt)][Math.floor(this.y)] === 0) this.x += this.dirX * this.moveSpeed * dt;
            if (map[Math.floor(this.x)][Math.floor(this.y + this.dirY * this.moveSpeed * dt)] === 0) this.y += this.dirY * this.moveSpeed * dt;
        }
        if (this.keys['s']) {
            if (map[Math.floor(this.x - this.dirX * this.moveSpeed * dt)][Math.floor(this.y)] === 0) this.x -= this.dirX * this.moveSpeed * dt;
            if (map[Math.floor(this.x)][Math.floor(this.y - this.dirY * this.moveSpeed * dt)] === 0) this.y -= this.dirY * this.moveSpeed * dt;
        }
        // Вращение камеры
        if (this.keys['a']) this.rotate(this.rotSpeed * dt);
        if (this.keys['d']) this.rotate(-this.rotSpeed * dt);
    }

    rotate(angle) {
        const oldDirX = this.dirX;
        this.dirX = this.dirX * Math.cos(angle) - this.dirY * Math.sin(angle);
        this.dirY = oldDirX * Math.sin(angle) + this.dirY * Math.cos(angle);
        const oldPlaneX = this.planeX;
        this.planeX = this.planeX * Math.cos(angle) - this.planeY * Math.sin(angle);
        this.planeY = oldPlaneX * Math.sin(angle) + this.planeY * Math.cos(angle);
    }
}