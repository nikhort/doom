// js/weapons.js
export class WeaponManager {
    constructor() {
        this.weapons = {
            pistol: { name: 'Пистолет', ammo: Infinity, damage: 20, fireRate: 350, sound: 'pistol_shot', auto: false, pellets: 1, spread: 0 },
            assault: { name: 'Автомат', ammo: 120, damage: 14, fireRate: 140, sound: 'assault_shot', auto: true, pellets: 1, spread: 0.05 },
            chaingun: { name: 'Пулемет', ammo: 200, damage: 16, fireRate: 80, sound: 'chaingun_shot', auto: true, pellets: 1, spread: 0.08 },
            shotgun: { name: 'Дробовик', ammo: 30, damage: 12, fireRate: 900, sound: 'shotgun_shot', auto: false, pellets: 7, spread: 0.15 }
        };
        this.weaponOrder = ['pistol', 'assault', 'chaingun', 'shotgun'];
        this.currentWeaponIndex = 0;
        this.currentWeapon = 'pistol';
        this.lastFireTime = 0;
        this.recoil = 0;
    }

    reset() {
        this.currentWeaponIndex = 0;
        this.currentWeapon = 'pistol';
        this.weapons.assault.ammo = 120;
        this.weapons.chaingun.ammo = 200;
        this.weapons.shotgun.ammo = 30;
        this.lastFireTime = 0;
        this.recoil = 0;
    }

    switchWeapon(weaponName, game) {
        if (this.weapons[weaponName] && this.currentWeapon !== weaponName) {
            this.currentWeapon = weaponName;
            this.currentWeaponIndex = this.weaponOrder.indexOf(weaponName);
            if (game && game.audioSystem) {
                game.audioSystem.playSound('weapon_switch');
            }
        }
    }

    switchNext(game) {
        this.currentWeaponIndex = (this.currentWeaponIndex + 1) % this.weaponOrder.length;
        this.currentWeapon = this.weaponOrder[this.currentWeaponIndex];
        if (game && game.audioSystem) {
            game.audioSystem.playSound('weapon_switch');
        }
    }

    switchPrev(game) {
        this.currentWeaponIndex = (this.currentWeaponIndex - 1 + this.weaponOrder.length) % this.weaponOrder.length;
        this.currentWeapon = this.weaponOrder[this.currentWeaponIndex];
        if (game && game.audioSystem) {
            game.audioSystem.playSound('weapon_switch');
        }
    }

    getAmmoString() {
        const w = this.weapons[this.currentWeapon];
        return w.ammo === Infinity ? "INF" : w.ammo.toString();
    }

    update(dt) {
        if (this.recoil > 0) {
            this.recoil = Math.max(0, this.recoil - dt * 0.005);
        }
    }

    fire(game, timestamp) {
        const weapon = this.weapons[this.currentWeapon];
        if (timestamp - this.lastFireTime >= weapon.fireRate && weapon.ammo > 0) {
            this.lastFireTime = timestamp;
            if (weapon.ammo !== Infinity) {
                weapon.ammo--;
            }
            this.recoil = 1.0;
            if (game.audioSystem) game.audioSystem.playSound(weapon.sound);

            const p = game.player;

            for (let i = 0; i < weapon.pellets; i++) {
                let rayDirX = p.dirX;
                let rayDirY = p.dirY;

                if (weapon.spread > 0) {
                    const angleOffset = (Math.random() - 0.5) * weapon.spread;
                    const cos = Math.cos(angleOffset);
                    const sin = Math.sin(angleOffset);
                    rayDirX = p.dirX * cos - p.dirY * sin;
                    rayDirY = p.dirX * sin + p.dirY * cos;
                }

                let closestEnemy = null;
                let minDistance = 15.0;

                for (let enemy of game.enemies) {
                    if (enemy.dead || enemy.state === 'dying') continue;
                    const ex = enemy.x - p.x;
                    const ey = enemy.y - p.y;
                    const dist = Math.hypot(ex, ey);
                    if (dist > minDistance) continue;

                    const dot = (ex * rayDirX + ey * rayDirY) / dist;
                    const threshold = weapon.pellets > 1 ? 0.88 : 0.95;

                    if (dot >= threshold && enemy.hasLineOfSight(game.map, p)) {
                        closestEnemy = enemy;
                        minDistance = dist;
                    }
                }

                if (closestEnemy) {
                    closestEnemy.takeDamage(weapon.damage, game);
                } else if (i === 0) {
                    const hitDist = 4.0;
                    game.renderer.addSparkParticles(
                        p.x + rayDirX * hitDist,
                        p.y + rayDirY * hitDist,
                        '#ffff00',
                        3
                    );
                }
            }
            return true;
        }
        return false;
    }
}