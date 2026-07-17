// js/renderer.js
import { Particle } from './entities.js';

export class Renderer {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.zBuffer = [];
        this.damageFlashTimer = 0;
        this.pickupFlashTimer = 0;
        this.initTextures();
    }

    initTextures() {
        this.textures = {
            wall1: this.createWallTexture('#4a5568', '#2d3748', true),
            wall2: this.createWallTexture('#742a2a', '#9b2c2c', false),
            door: this.createDoorTexture(),
            grate: this.createGrateTexture(),
            possessed: this.createEnemyTexture('#b7791f', '#744210', false),
            imp: this.createEnemyTexture('#dd6b20', '#c53030', true),
            soldier: this.createEnemyTexture('#2f855a', '#276749', false),
            soldierShield: this.createEnemyTexture('#2f855a', '#00ffff', true),
            revenant: this.createEnemyTexture('#e2e8f0', '#a0aec0', true),
            boss: this.createBossTexture(),
            fireball: this.createProjectileTexture('#ff4500', '#ff8c00'),
            rocket: this.createProjectileTexture('#a0aec0', '#cbd5e0'),
            plasma: this.createProjectileTexture('#00ffff', '#3182ce'),
            medkit: this.createItemTexture('#00aaff'),
            armorItem: this.createItemTexture('#00ff00'),
            blueSphere: this.createItemTexture('#0000ff'),
            ammoItem: this.createItemTexture('#ffaa00')
        };
    }

    createItemTexture(color) {
        const c = document.createElement('canvas');
        c.width = 64;
        c.height = 64;
        const ctx = c.getContext('2d');
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(32, 32, 24, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(32, 32, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.fillRect(16, 0, 8, 64);
        ctx.fillRect(40, 0, 8, 64);
        return c;
    }

    createWallTexture(baseColor, accentColor, isTech) {
        const c = document.createElement('canvas');
        c.width = 64;
        c.height = 64;
        const ctx = c.getContext('2d');
        ctx.fillStyle = baseColor;
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = accentColor;
        if (isTech) {
            ctx.fillRect(0, 0, 64, 4);
            ctx.fillRect(0, 30, 64, 4);
            ctx.fillRect(0, 60, 64, 4);
            ctx.fillRect(30, 0, 4, 30);
            ctx.fillRect(10, 34, 4, 26);
        } else {
            for (let i = 0; i < 64; i += 16) {
                ctx.fillRect(i, 0, 2, 64);
                ctx.fillRect(0, i, 64, 2);
            }
        }
        return c;
    }

    createDoorTexture() {
        const c = document.createElement('canvas');
        c.width = 64;
        c.height = 64;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#d69e2e';
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = '#000000';
        for (let i = 0; i < 64; i += 16) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + 8, 0);
            ctx.lineTo(0, i + 8);
            ctx.lineTo(0, i);
            ctx.fill();
        }
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(28, 0, 8, 64);
        return c;
    }

    createGrateTexture() {
        const c = document.createElement('canvas');
        c.width = 64;
        c.height = 64;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#2d3748';
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = '#1a202c';
        for (let x = 4; x < 64; x += 12) {
            for (let y = 4; y < 64; y += 12) {
                ctx.fillRect(x, y, 8, 8);
            }
        }
        return c;
    }

    createEnemyTexture(bodyColor, detailColor, hasGlow) {
        const c = document.createElement('canvas');
        c.width = 64;
        c.height = 64;
        const ctx = c.getContext('2d');
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.arc(32, 24, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(20, 36, 24, 24);
        ctx.fillStyle = detailColor;
        ctx.fillRect(16, 36, 8, 20);
        ctx.fillRect(40, 36, 8, 20);
        if (hasGlow) {
            ctx.fillStyle = '#ffff00';
            ctx.fillRect(26, 20, 4, 4);
            ctx.fillRect(34, 20, 4, 4);
        } else {
            ctx.fillStyle = '#000000';
            ctx.fillRect(26, 20, 4, 4);
            ctx.fillRect(34, 20, 4, 4);
        }
        return c;
    }

    createBossTexture() {
        const c = document.createElement('canvas');
        c.width = 64;
        c.height = 64;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#9b2c2c';
        ctx.fillRect(12, 16, 40, 44);
        ctx.beginPath();
        ctx.arc(32, 16, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f6e05e';
        ctx.beginPath();
        ctx.moveTo(16, 12); ctx.lineTo(6, 2); ctx.lineTo(22, 8);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(48, 12); ctx.lineTo(58, 2); ctx.lineTo(42, 8);
        ctx.fill();
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(24, 14, 6, 6);
        ctx.fillRect(34, 14, 6, 6);
        return c;
    }

    createProjectileTexture(innerColor, outerColor) {
        const c = document.createElement('canvas');
        c.width = 32;
        c.height = 32;
        const ctx = c.getContext('2d');
        ctx.fillStyle = outerColor;
        ctx.beginPath();
        ctx.arc(16, 16, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = innerColor;
        ctx.beginPath();
        ctx.arc(16, 16, 6, 0, Math.PI * 2);
        ctx.fill();
        return c;
    }

    triggerDamageFlash() {
        this.damageFlashTimer = 200;
    }

    triggerPickupFlash() {
        this.pickupFlashTimer = 150;
    }

    addBloodParticles(x, y, count = 12) {
        if (!this.game) return;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.001 + Math.random() * 0.003;
            this.game.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                '#9b2c2c',
                4 + Math.random() * 6,
                300 + Math.random() * 400
            ));
        }
    }

    addSparkParticles(x, y, color, count = 8) {
        if (!this.game) return;
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.001 + Math.random() * 0.004;
            this.game.particles.push(new Particle(
                x, y,
                Math.cos(angle) * speed,
                Math.sin(angle) * speed,
                color,
                3 + Math.random() * 4,
                200 + Math.random() * 200
            ));
        }
    }

    render(game) {
        this.game = game;
        const w = this.canvas.width;
        const h = this.canvas.height;
        if (w === 0 || h === 0) return;

        if (this.zBuffer.length !== w) {
            this.zBuffer = new Array(w);
        }

        this.drawFloor();
        this.drawWalls(game.player, game.map);
        this.drawEnemies(game);
        this.drawSprites(game);
        this.drawPlayerWeapon(game);
        this.drawOverlays(game);
    }

    drawFloor() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        this.ctx.fillStyle = '#111115';
        this.ctx.fillRect(0, 0, w, h / 2);
        this.ctx.fillStyle = '#231f1c';
        this.ctx.fillRect(0, h / 2, w, h / 2);
    }

    drawWalls(player, map) {
        const w = this.canvas.width;
        const h = this.canvas.height;

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
            let hit = 0, side = 0;

            if (rayDirX < 0) {
                stepX = -1;
                sideDistX = (player.x - mapX) * deltaDistX;
            } else {
                stepX = 1;
                sideDistX = (mapX + 1.0 - player.x) * deltaDistX;
            }
            if (rayDirY < 0) {
                stepY = -1;
                sideDistY = (player.y - mapY) * deltaDistY;
            } else {
                stepY = 1;
                sideDistY = (mapY + 1.0 - player.y) * deltaDistY;
            }

            while (hit === 0) {
                if (sideDistX < sideDistY) {
                    sideDistX += deltaDistX;
                    mapX += stepX;
                    side = 0;
                } else {
                    sideDistY += deltaDistY;
                    mapY += stepY;
                    side = 1;
                }
                if (mapX >= 0 && mapX < map.length && mapY >= 0 && mapY < map[0].length) {
                    if (map[mapX][mapY] > 0) hit = map[mapX][mapY];
                } else {
                    hit = 1;
                    break;
                }
            }

            if (side === 0) {
                perpWallDist = (mapX - player.x + (1 - stepX) / 2) / rayDirX;
            } else {
                perpWallDist = (mapY - player.y + (1 - stepY) / 2) / rayDirY;
            }

            perpWallDist = Math.max(0.1, perpWallDist);
            this.zBuffer[x] = perpWallDist;

            const lineHeight = Math.floor(h / perpWallDist);
            let drawStart = -lineHeight / 2 + h / 2;
            if (drawStart < 0) drawStart = 0;
            let drawEnd = lineHeight / 2 + h / 2;
            if (drawEnd >= h) drawEnd = h - 1;

            let tex = this.textures.wall1;
            if (hit === 2) tex = this.textures.wall2;
            if (hit === 3) tex = this.textures.door;
            if (hit === 4) tex = this.textures.grate;

            let wallX;
            if (side === 0) wallX = player.y + perpWallDist * rayDirY;
            else wallX = player.x + perpWallDist * rayDirX;
            wallX -= Math.floor(wallX);

            let texX = Math.floor(wallX * tex.width);
            if ((side === 0 && rayDirX > 0) || (side === 1 && rayDirY < 0)) {
                texX = tex.width - texX - 1;
            }

            this.ctx.drawImage(tex, texX, 0, 1, tex.height, x, drawStart, 1, drawEnd - drawStart);

            if (side === 1) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
                this.ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
            }
            const fog = Math.min(0.8, perpWallDist / 16);
            if (fog > 0) {
                this.ctx.fillStyle = `rgba(0, 0, 0, ${fog})`;
                this.ctx.fillRect(x, drawStart, 1, drawEnd - drawStart);
            }
        }
    }

    drawEnemies(game) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const player = game.player;

        const renderList = [];
        for (let enemy of game.enemies) {
            if (enemy.dead) continue;
            const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
            renderList.push({ type: 'enemy', entity: enemy, dist: dist });
        }
        for (let proj of game.projectiles) {
            if (proj.dead) continue;
            const dist = Math.hypot(player.x - proj.x, player.y - proj.y);
            renderList.push({ type: 'proj', entity: proj, dist: dist });
        }
        for (let item of game.items) {
            if (item.dead) continue;
            const dist = Math.hypot(player.x - item.x, player.y - item.y);
            renderList.push({ type: 'item', entity: item, dist: dist });
        }

        renderList.sort((a, b) => b.dist - a.dist);

        for (let item of renderList) {
            const ent = item.entity;
            const spriteX = ent.x - player.x;
            const spriteY = ent.y - player.y;

            const invDet = 1.0 / (player.planeX * player.dirY - player.dirX * player.planeY);
            const transformX = invDet * (player.dirY * spriteX - player.dirX * spriteY);
            const transformY = invDet * (-player.planeY * spriteX + player.planeX * spriteY);

            if (transformY <= 0.1) continue;

            const spriteScreenX = Math.floor((w / 2) * (1 + transformX / transformY));
            const spriteHeight = Math.abs(Math.floor(h / transformY));
            const spriteWidth = Math.abs(Math.floor(h / transformY));

            let scale = 1.0;
            let vOffset = 0;

            let tex = this.textures.possessed;
            if (item.type === 'enemy') {
                if (ent.type === 'imp') tex = this.textures.imp;
                if (ent.type === 'soldier') tex = ent.shieldActive ? this.textures.soldierShield : this.textures.soldier;
                if (ent.type === 'revenant') tex = this.textures.revenant;
                if (ent.type === 'boss') tex = this.textures.boss;
            } else if (item.type === 'proj') {
                if (ent.type === 'fireball') tex = this.textures.fireball;
                if (ent.type === 'rocket') tex = this.textures.rocket;
                if (ent.type === 'plasma') tex = this.textures.plasma;
            } else if (item.type === 'item') {
                scale = 0.35; // Предметы небольшие: 35% от роста
                vOffset = (spriteHeight * 0.4) + (Math.sin(ent.bobTimer) * spriteHeight * 0.1);
                
                if (ent.type === 'medkit') tex = this.textures.medkit;
                if (ent.type === 'armor') tex = this.textures.armorItem;
                if (ent.type === 'sphere') tex = this.textures.blueSphere;
                if (ent.type === 'ammo') tex = this.textures.ammoItem;
            }

            const drawHeight = spriteHeight * scale;
            const drawWidth = spriteWidth * scale;

            let drawStartY = -drawHeight / 2 + h / 2 + vOffset;
            let drawEndY = drawStartY + drawHeight;
            let drawStartX = -drawWidth / 2 + spriteScreenX;
            let drawEndX = drawStartX + drawWidth;

            const clipStartY = Math.max(0, drawStartY);
            const clipEndY = Math.min(h - 1, drawEndY);
            const clipStartX = Math.max(0, drawStartX);
            const clipEndX = Math.min(w - 1, drawEndX);

            for (let stripe = Math.floor(clipStartX); stripe < clipEndX; stripe++) {
                if (stripe >= 0 && stripe < w && transformY < this.zBuffer[stripe]) {
                    let texX = Math.floor((stripe - drawStartX) * tex.width / drawWidth);
                    
                    // Плавное вращение для подбираемых предметов
                    if (item.type === 'item') {
                        texX = (texX + Math.floor(ent.bobTimer * 20)) % tex.width;
                    }

                    texX = Math.max(0, Math.min(tex.width - 1, texX));
                    this.ctx.drawImage(tex, texX, 0, 1, tex.height, stripe, clipStartY, 1, clipEndY - clipStartY);
                    
                    if (item.type === 'enemy' && ent.state === 'dying') {
                        this.ctx.fillStyle = 'rgba(155, 44, 44, 0.6)';
                        this.ctx.fillRect(stripe, clipStartY, 1, clipEndY - clipStartY);
                    }
                }
            }
        }
    }

    drawSprites(game) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const player = game.player;

        for (let p of game.particles) {
            const spriteX = p.x - player.x;
            const spriteY = p.y - player.y;

            const invDet = 1.0 / (player.planeX * player.dirY - player.dirX * player.planeY);
            const transformX = invDet * (player.dirY * spriteX - player.dirX * spriteY);
            const transformY = invDet * (-player.planeY * spriteX + player.planeX * spriteY);

            if (transformY <= 0.1) continue;

            const screenX = Math.floor((w / 2) * (1 + transformX / transformY));
            const screenY = Math.floor(h / 2 + (h / transformY) * 0.2);

            if (screenX >= 0 && screenX < w && transformY < this.zBuffer[screenX]) {
                const size = Math.max(2, Math.floor((p.size / transformY) * (h / 600)));
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
                this.ctx.fillRect(screenX - size / 2, screenY - size / 2, size, size);
                this.ctx.globalAlpha = 1.0;
            }
        }
    }

    drawPlayerWeapon(game) {
        const w = this.canvas.width;
        const h = this.canvas.height;
        const wm = game.weaponManager;
        const recoilOffset = Math.floor(wm.recoil * 35);

        this.ctx.save();
        // Оружие уменьшено примерно на 35%
        const gunWidth = Math.floor(w * 0.23);
        const gunHeight = Math.floor(h * 0.33);
        
        // Размещено в правом нижнем углу с небольшим отступом
        const gunX = Math.floor(w - gunWidth - w * 0.02);
        const gunY = h - gunHeight + recoilOffset;

        if (wm.currentWeapon === 'pistol') {
            this.ctx.fillStyle = '#4a5568';
            this.ctx.fillRect(gunX + gunWidth * 0.38, gunY, gunWidth * 0.24, gunHeight);
            this.ctx.fillStyle = '#2b6cb0';
            this.ctx.fillRect(gunX + gunWidth * 0.44, gunY + 20, gunWidth * 0.12, gunHeight * 0.5);
        } else if (wm.currentWeapon === 'assault') {
            this.ctx.fillStyle = '#2d3748';
            this.ctx.fillRect(gunX + gunWidth * 0.3, gunY, gunWidth * 0.4, gunHeight);
            this.ctx.fillStyle = '#4a5568';
            this.ctx.fillRect(gunX + gunWidth * 0.4, gunY, gunWidth * 0.2, gunHeight * 0.8);
            this.ctx.fillStyle = '#c53030';
            this.ctx.fillRect(gunX + gunWidth * 0.45, gunY + 30, gunWidth * 0.1, 10);
        } else if (wm.currentWeapon === 'chaingun') {
            this.ctx.fillStyle = '#1a202c';
            this.ctx.fillRect(gunX + gunWidth * 0.25, gunY, gunWidth * 0.5, gunHeight);
            this.ctx.fillStyle = '#4a5568';
            this.ctx.fillRect(gunX + gunWidth * 0.3, gunY, gunWidth * 0.1, gunHeight);
            this.ctx.fillRect(gunX + gunWidth * 0.45, gunY, gunWidth * 0.1, gunHeight);
            this.ctx.fillRect(gunX + gunWidth * 0.6, gunY, gunWidth * 0.1, gunHeight);
        } else if (wm.currentWeapon === 'shotgun') {
            this.ctx.fillStyle = '#2d3748';
            this.ctx.fillRect(gunX + gunWidth * 0.25, gunY, gunWidth * 0.22, gunHeight);
            this.ctx.fillRect(gunX + gunWidth * 0.53, gunY, gunWidth * 0.22, gunHeight);
            this.ctx.fillStyle = '#742a2a';
            this.ctx.fillRect(gunX + gunWidth * 0.2, gunY + gunHeight * 0.4, gunWidth * 0.6, gunHeight * 0.6);
        }

        // Вспышка выстрела отцентрована по текущей позиции оружия
        if (wm.recoil > 0.6) {
            this.ctx.fillStyle = 'rgba(255, 200, 0, 0.85)';
            this.ctx.beginPath();
            this.ctx.arc(gunX + gunWidth * 0.5, gunY + gunHeight * 0.1, gunWidth * 0.28, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();
    }

    drawOverlays(game) {
        const w = this.canvas.width;
        const h = this.canvas.height;

        if (this.damageFlashTimer > 0) {
            this.ctx.fillStyle = `rgba(255, 0, 0, ${0.35 * (this.damageFlashTimer / 200)})`;
            this.ctx.fillRect(0, 0, w, h);
            this.damageFlashTimer -= 16;
        }

        if (this.pickupFlashTimer > 0) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${0.4 * (this.pickupFlashTimer / 150)})`;
            this.ctx.fillRect(0, 0, w, h);
            this.pickupFlashTimer -= 16;
        }

        if (game.victory) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
            this.ctx.fillRect(0, 0, w, h);
            this.ctx.fillStyle = '#4caf50';
            this.ctx.font = 'bold 64px Impact, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("ПОБЕДА!", w / 2, h / 2 - 40);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '32px Impact, sans-serif';
            this.ctx.fillText("БОСС ПОВЕРЖЕН! МИССИЯ ВЫПОЛНЕНА", w / 2, h / 2 + 30);
            this.ctx.font = '24px sans-serif';
            this.ctx.fillText("Нажмите ESC для выхода в меню", w / 2, h / 2 + 80);
        } else if (game.gameOver) {
            this.ctx.fillStyle = 'rgba(150, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, w, h);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 64px Impact, sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText("ВЫ ПОГИБЛИ", w / 2, h / 2 - 20);
            this.ctx.font = '24px sans-serif';
            this.ctx.fillText("Нажмите ESC для выхода в меню", w / 2, h / 2 + 40);
        }
    }
}