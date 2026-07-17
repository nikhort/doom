// js/entities.js
export class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dirX = -1;
        this.dirY = 0;
        this.planeX = 0;
        this.planeY = 0.66;
        
        this.walkSpeed = 0.004;
        this.runSpeed = 0.0065;
        this.moveSpeed = this.walkSpeed;
        this.rotSpeed = 0.003;
        this.keys = {};
        
        this.hp = 100;
        this.maxHp = 100;
        this.armor = 50;
        this.maxArmor = 100;
        this.radius = 0.3;
    }

    handleInput(key, isPressed) {
        this.keys[key.toLowerCase()] = isPressed;
    }

    update(dt, map, game) {
        if (game.victory || game.gameOver) return;

        this.moveSpeed = (this.keys['shift'] || this.keys['shiftleft'] || this.keys['shiftright']) ? this.runSpeed : this.walkSpeed;
        const moveStep = this.moveSpeed * dt;
        const rotStep = this.rotSpeed * dt;

        let moveX = 0;
        let moveY = 0;

        if (this.keys['w'] || this.keys['ц']) {
            moveX += this.dirX * moveStep;
            moveY += this.dirY * moveStep;
        }
        if (this.keys['s'] || this.keys['ы']) {
            moveX -= this.dirX * moveStep;
            moveY -= this.dirY * moveStep;
        }
        if (this.keys['d'] || this.keys['в']) {
            moveX += this.dirY * moveStep;
            moveY -= this.dirX * moveStep;
        }
        if (this.keys['a'] || this.keys['ф']) {
            moveX -= this.dirY * moveStep;
            moveY += this.dirX * moveStep;
        }
        if (this.keys['arrowleft']) {
            this.rotate(rotStep);
        }
        if (this.keys['arrowright']) {
            this.rotate(-rotStep);
        }

        if (this.keys['e'] || this.keys['у']) {
            this.tryOpenDoor(map);
        }

        if (this.keys['1']) game.weaponManager.switchWeapon('pistol', game);
        if (this.keys['2']) game.weaponManager.switchWeapon('assault', game);
        if (this.keys['3']) game.weaponManager.switchWeapon('chaingun', game);
        if (this.keys['4']) game.weaponManager.switchWeapon('shotgun', game);

        if (this.keys[' '] || this.keys['enter']) {
            game.fireWeapon();
        }

        this.checkCollisionAndMove(moveX, moveY, map);
        this.autoOpenDoors(map);
    }

    rotate(angle) {
        const oldDirX = this.dirX;
        this.dirX = this.dirX * Math.cos(angle) - this.dirY * Math.sin(angle);
        this.dirY = oldDirX * Math.sin(angle) + this.dirY * Math.cos(angle);
        const oldPlaneX = this.planeX;
        this.planeX = this.planeX * Math.cos(angle) - this.planeY * Math.sin(angle);
        this.planeY = oldPlaneX * Math.sin(angle) + this.planeY * Math.cos(angle);
    }

    checkCollisionAndMove(dx, dy, map) {
        const newX = this.x + dx;
        const newY = this.y + dy;

        if (this.isWalkable(newX + Math.sign(dx) * this.radius, this.y, map)) {
            this.x = newX;
        }
        if (this.isWalkable(this.x, newY + Math.sign(dy) * this.radius, map)) {
            this.y = newY;
        }
    }

    isWalkable(x, y, map) {
        const gridX = Math.floor(x);
        const gridY = Math.floor(y);
        if (gridX < 0 || gridX >= map.length || gridY < 0 || gridY >= map[0].length) return false;
        return map[gridX][gridY] === 0;
    }

    tryOpenDoor(map) {
        const checkDist = 1.2;
        const targetX = Math.floor(this.x + this.dirX * checkDist);
        const targetY = Math.floor(this.y + this.dirY * checkDist);
        if (targetX >= 0 && targetX < map.length && targetY >= 0 && targetY < map[0].length) {
            if (map[targetX][targetY] === 3) {
                map[targetX][targetY] = 0;
            }
        }
    }

    autoOpenDoors(map) {
        const dirs = [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
        for (let d of dirs) {
            const tx = Math.floor(this.x + d[0] * 0.8);
            const ty = Math.floor(this.y + d[1] * 0.8);
            if (tx >= 0 && tx < map.length && ty >= 0 && ty < map[0].length) {
                if (map[tx][ty] === 3) {
                    map[tx][ty] = 0;
                }
            }
        }
    }

    takeDamage(amount, game) {
        if (game.victory || game.gameOver) return;

        if (this.armor > 0) {
            const armorAbsorb = Math.min(this.armor, amount * 0.5);
            this.armor -= armorAbsorb;
            amount -= armorAbsorb;
        }
        this.hp -= amount;
        game.renderer.triggerDamageFlash();
        if (game.audioSystem) game.audioSystem.playSound('hit');

        if (this.hp <= 0) {
            this.hp = 0;
            game.gameOver = true;
        }
    }
}

export class Enemy {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.radius = 0.35;
        this.dead = false;
        this.state = 'idle';
        this.dyingTimer = 0;
        this.attackTimer = 0;
        this.shieldTimer = 0;
        this.shieldActive = false;
        this.burstCount = 0;
        this.burstTimer = 0;

        switch (type) {
            case 'possessed':
                this.hp = 30;
                this.maxHp = 30;
                this.speed = 0.0018;
                this.damage = 8;
                this.attackRange = 0.8;
                this.attackCooldown = 1200;
                break;
            case 'imp':
                this.hp = 50;
                this.maxHp = 50;
                this.speed = 0.0038;
                this.damage = 15;
                this.attackRange = 8.0;
                this.attackCooldown = 1600;
                break;
            case 'soldier':
                this.hp = 80;
                this.maxHp = 80;
                this.speed = 0.0022;
                this.damage = 8; // Снижено на 20%
                this.attackRange = 10.0;
                this.attackCooldown = 2200;
                break;
            case 'revenant':
                this.hp = 120;
                this.maxHp = 120;
                this.speed = 0.0032;
                this.damage = 20; // Снижено на 20%
                this.attackRange = 12.0;
                this.attackCooldown = 2600;
                break;
            case 'boss':
                this.hp = 500;
                this.maxHp = 500;
                this.speed = 0.0025;
                this.damage = 24; // Снижено на 20%
                this.attackRange = 14.0;
                this.attackCooldown = 1800;
                this.radius = 0.6;
                break;
        }
    }

    update(dt, game) {
        if (this.dead || game.victory || game.gameOver) return;

        if (this.state === 'dying') {
            this.dyingTimer -= dt;
            if (this.dyingTimer <= 0) {
                this.dead = true;
                if (this.type === 'boss') {
                    game.victory = true;
                }
            }
            return;
        }

        const dist = Math.hypot(game.player.x - this.x, game.player.y - this.y);

        if (this.type === 'soldier') {
            this.shieldTimer += dt;
            if (this.shieldTimer >= 6000) this.shieldTimer = 0;
            this.shieldActive = (this.shieldTimer < 2500);
        }

        if (this.burstCount > 0) {
            this.burstTimer -= dt;
            if (this.burstTimer <= 0) {
                this.fireProjectile(game, 'plasma', 10, 0.008, false);
                this.burstCount--;
                this.burstTimer = 150;
            }
        }

        if (this.attackTimer > 0) {
            this.attackTimer -= dt;
        }

        const canSee = this.hasLineOfSight(game.map, game.player);

        if (canSee && dist <= this.attackRange && this.attackTimer <= 0) {
            this.attack(game, dist);
            this.attackTimer = this.attackCooldown;
        }

        if (canSee) {
            if (this.type === 'imp' && dist < 3.5) {
                this.moveAway(game, dt);
            } else if (this.type === 'revenant' && dist < 5.0) {
                this.moveAway(game, dt);
            } else if (dist > (this.type === 'possessed' ? 0.6 : 3.0)) {
                this.moveTowards(game, dt);
            }
        }
    }

    attack(game, dist) {
        switch (this.type) {
            case 'possessed':
                if (dist <= 1.0) {
                    game.player.takeDamage(this.damage, game);
                }
                break;
            case 'imp':
                this.fireProjectile(game, 'fireball', this.damage, 0.007, false);
                break;
            case 'soldier':
                this.burstCount = 3;
                this.burstTimer = 0;
                break;
            case 'revenant':
                this.fireProjectile(game, 'rocket', this.damage, 0.0055, true);
                break;
            case 'boss':
                this.fireProjectile(game, 'rocket', 20, 0.006, true); // Снижено с 25
                setTimeout(() => {
                    if (!this.dead && !game.victory) {
                        this.fireProjectile(game, 'plasma', 12, 0.009, false); // Снижено с 15
                    }
                }, 400);
                break;
        }
    }

    fireProjectile(game, projType, dmg, spd, isHoming) {
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const len = Math.hypot(dx, dy);
        if (len === 0) return;
        const dirX = dx / len;
        const dirY = dy / len;
        game.projectiles.push(new Projectile(
            this.x + dirX * 0.5,
            this.y + dirY * 0.5,
            dirX,
            dirY,
            projType,
            dmg,
            spd,
            isHoming
        ));
        if (game.audioSystem) game.audioSystem.playSound('shoot');
    }

    moveTowards(game, dt) {
        const dx = game.player.x - this.x;
        const dy = game.player.y - this.y;
        const len = Math.hypot(dx, dy);
        if (len === 0) return;

        let dirX = dx / len;
        let dirY = dy / len;

        const step = this.speed * dt;
        this.attemptMove(dirX * step, dirY * step, game.map);
    }

    moveAway(game, dt) {
        const dx = this.x - game.player.x;
        const dy = this.y - game.player.y;
        const len = Math.hypot(dx, dy);
        if (len === 0) return;

        let dirX = dx / len;
        let dirY = dy / len;

        const step = this.speed * dt;
        this.attemptMove(dirX * step, dirY * step, game.map);
    }

    attemptMove(mx, my, map) {
        const canFly = (this.type === 'revenant' || this.type === 'boss');
        const newX = this.x + mx;
        const newY = this.y + my;

        if (this.canMoveTo(newX, this.y, map, canFly)) {
            this.x = newX;
        } else if (this.type === 'imp') {
            const sideX = -my * 1.5;
            if (this.canMoveTo(this.x + sideX, this.y, map, canFly)) this.x += sideX;
        }

        if (this.canMoveTo(this.x, newY, map, canFly)) {
            this.y = newY;
        } else if (this.type === 'imp') {
            const sideY = mx * 1.5;
            if (this.canMoveTo(this.x, this.y + sideY, map, canFly)) this.y += sideY;
        }
    }

    canMoveTo(x, y, map, canFly) {
        const gx = Math.floor(x);
        const gy = Math.floor(y);
        if (gx < 0 || gx >= map.length || gy < 0 || gy >= map[0].length) return false;
        const tile = map[gx][gy];
        if (tile === 0 || tile === 3) return true;
        if (tile === 4 && canFly) return true;
        return false;
    }

    hasLineOfSight(map, player) {
        let x0 = this.x;
        let y0 = this.y;
        const x1 = player.x;
        const y1 = player.y;
        const dist = Math.hypot(x1 - x0, y1 - y0);
        const steps = Math.floor(dist * 4);
        if (steps === 0) return true;
        const dx = (x1 - x0) / steps;
        const dy = (y1 - y0) / steps;
        for (let i = 0; i < steps; i++) {
            x0 += dx;
            y0 += dy;
            const gx = Math.floor(x0);
            const gy = Math.floor(y0);
            if (gx >= 0 && gx < map.length && gy >= 0 && gy < map[0].length) {
                const tile = map[gx][gy];
                if (tile === 1 || tile === 2) return false;
            }
        }
        return true;
    }

    takeDamage(amount, game) {
        if (this.dead || this.state === 'dying') return;

        if (this.type === 'soldier' && this.shieldActive) {
            amount *= 0.25;
            game.renderer.addSparkParticles(this.x, this.y, '#00ffff');
        } else {
            game.renderer.addBloodParticles(this.x, this.y);
        }

        this.hp -= amount;
        if (this.hp <= 0) {
            this.state = 'dying';
            this.dyingTimer = 500;
            game.renderer.addBloodParticles(this.x, this.y, 25);
            if (game.audioSystem) game.audioSystem.playSound('explosion');
        }
    }
}

export class Projectile {
    constructor(x, y, dirX, dirY, type, damage, speed, homing) {
        this.x = x;
        this.y = y;
        this.dirX = dirX;
        this.dirY = dirY;
        this.type = type;
        this.damage = damage;
        this.speed = speed;
        this.homing = homing;
        this.dead = false;
        this.life = 4000;
    }

    update(dt, game) {
        if (this.dead) return;

        this.life -= dt;
        if (this.life <= 0) {
            this.dead = true;
            return;
        }

        if (this.homing && game.player) {
            const dx = game.player.x - this.x;
            const dy = game.player.y - this.y;
            const len = Math.hypot(dx, dy);
            if (len > 0) {
                const targetDirX = dx / len;
                const targetDirY = dy / len;
                const turnRate = 0.003 * dt;
                this.dirX += (targetDirX - this.dirX) * turnRate;
                this.dirY += (targetDirY - this.dirY) * turnRate;
                const newLen = Math.hypot(this.dirX, this.dirY);
                this.dirX /= newLen;
                this.dirY /= newLen;
            }
        }

        const step = this.speed * dt;
        const newX = this.x + this.dirX * step;
        const newY = this.y + this.dirY * step;

        const gx = Math.floor(newX);
        const gy = Math.floor(newY);
        if (gx < 0 || gx >= game.map.length || gy < 0 || gy >= game.map[0].length || game.map[gx][gy] === 1 || game.map[gx][gy] === 2) {
            this.dead = true;
            game.renderer.addSparkParticles(this.x, this.y, '#ff6600', 10);
            if (game.audioSystem) game.audioSystem.playSound('explosion');
            return;
        }

        this.x = newX;
        this.y = newY;

        const distToPlayer = Math.hypot(game.player.x - this.x, game.player.y - this.y);
        if (distToPlayer < 0.4) {
            game.player.takeDamage(this.damage, game);
            this.dead = true;
            game.renderer.addSparkParticles(this.x, this.y, '#ff0000', 15);
            if (game.audioSystem) game.audioSystem.playSound('explosion');
        }
    }
}

export class Particle {
    constructor(x, y, vx, vy, color, size, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.size = size;
        this.life = life;
        this.maxLife = life;
    }

    update(dt) {
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        this.life -= dt;
    }
}

export class Item {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.dead = false;
        this.bobTimer = Math.random() * Math.PI * 2;
    }

    update(dt, game) {
        if (this.dead) return;
        this.bobTimer += dt * 0.003;

        // Синяя сфера испускает небольшие частицы
        if (this.type === 'sphere' && Math.random() < 0.05) {
            game.particles.push(new Particle(
                this.x + (Math.random() - 0.5) * 0.3,
                this.y + (Math.random() - 0.5) * 0.3,
                (Math.random() - 0.5) * 0.001, 
                (Math.random() - 0.5) * 0.001,
                '#00ffff',
                2, 400
            ));
        }

        const dist = Math.hypot(game.player.x - this.x, game.player.y - this.y);
        if (dist < 0.6) {
            this.pickup(game);
        }
    }

    pickup(game) {
        this.dead = true;
        if (game.audioSystem) game.audioSystem.playSound('pickup');
        game.renderer.triggerPickupFlash();
        const p = game.player;

        if (this.type === 'medkit') {
            p.hp = Math.min(100, p.hp + 25);
        } else if (this.type === 'armor') {
            p.armor = Math.min(100, p.armor + 15);
        } else if (this.type === 'sphere') {
            p.hp = 100;
            p.armor = 100;
        } else if (this.type === 'ammo') {
            game.weaponManager.addAmmo(game.weaponManager.currentWeapon);
        }
    }
}