export class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
    }

    render(player, map) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Очистка экрана (Пол и Потолок)
        this.ctx.fillStyle = '#111'; // Потолок
        this.ctx.fillRect(0, 0, w, h / 2);
        this.ctx.fillStyle = '#300000'; // Пол (лавовый оттенок)
        this.ctx.fillRect(0, h / 2, w, h / 2);

        // Raycasting DDA Algorithm
        for (let x = 0; x < w; x++) {
            const cameraX = 2 * x / w - 1;
            const rayDirX = player.dirX + player.planeX * cameraX;
            const rayDirY = player.dirY + player.planeY * cameraX;

            let mapX = Math.floor(player.x);
            let mapY = Math.floor(player.y);

            let sideDistX, sideDistY;
            const deltaDistX = Math.abs(1 / rayDirX);
            const deltaDistY = Math.abs(1 / rayDirY);
            let perpWallDist;

            let stepX, stepY;
            let hit = 0, side;

            if (rayDirX < 0) { stepX = -1; sideDistX = (player.x - mapX) * deltaDistX; } 
            else { stepX = 1; sideDistX = (mapX + 1.0 - player.x) * deltaDistX; }
            
            if (rayDirY < 0) { stepY = -1; sideDistY = (player.y - mapY) * deltaDistY; } 
            else { stepY = 1; sideDistY = (mapY + 1.0 - player.y) * deltaDistY; }

            // DDA
            while (hit === 0) {
                if (sideDistX < sideDistY) { sideDistX += deltaDistX; mapX += stepX; side = 0; } 
                else { sideDistY += deltaDistY; mapY += stepY; side = 1; }
                if (map[mapX][mapY] > 0) hit = 1;
            }

            if (side === 0) perpWallDist = (mapX - player.x + (1 - stepX) / 2) / rayDirX;
            else perpWallDist = (mapY - player.y + (1 - stepY) / 2) / rayDirY;

            const lineHeight = Math.floor(h / perpWallDist);
            let drawStart = -lineHeight / 2 + h / 2;
            if (drawStart < 0) drawStart = 0;
            let drawEnd = lineHeight / 2 + h / 2;
            if (drawEnd >= h) drawEnd = h - 1;

            // Цвет стены (зависит от стороны для "объемности")
            let color = side === 1 ? '#8b0000' : '#a52a2a'; // Красные тона базы UAC
            
            // Эффект тумана / затемнения вдалеке
            this.ctx.fillStyle = color;
            this.ctx.globalAlpha = Math.max(0, 1 - (perpWallDist / 10)); // Туман
            this.ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
            this.ctx.globalAlpha = 1.0;
        }
    }
}