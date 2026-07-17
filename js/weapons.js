// js/weapons.js
export class WeaponManager {
    constructor() {
        this.weapons = {
            pistol: { name: 'Пистолет', ammo: Infinity, damage: 20, fireRate: 300 },
            shotgun: { name: 'Дробовик', ammo: 30, damage: 55, fireRate: 850 },
            plasma: { name: 'Плазма', ammo: 100, damage: 35, fireRate: 150 }
        };
        this.currentWeapon = 'pistol';
        this.lastFireTime = 0;
        this.recoil = 0;
    }

    reset() {
        this.currentWeapon = 'pistol';
        this.weapons.shotgun.ammo = 30;
        this.weapons.plasma.ammo = 100;
        this.lastFireTime = 0;
        this.recoil = 0;
    }

    switchWeapon(weaponName) {
        if (this.weapons[weaponName]) {
            this.currentWeapon = weaponName;
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
            if (game.audioSystem) game.audioSystem.playSound('shoot');

            const p = game.player;
            let closestEnemy = null;
            let minDistance = 15.0;

            for (let enemy of game.enemies) {
                if (enemy.dead || enemy.state === 'dying') continue;
                const ex = enemy.x - p.x;
                const ey = enemy.y - p.y;
                const dist = Math.hypot(ex, ey);
                if (dist > minDistance) continue;

                const dot = (ex * p.dirX + ey * p.dirY) / dist;
                const threshold = this.currentWeapon === 'shotgun' ? 0.90 : 0.96;

                if (dot >= threshold && enemy.hasLineOfSight(game.map, p)) {
                    closestEnemy = enemy;
                    minDistance = dist;
                }
            }

            if (closestEnemy) {
                closestEnemy.takeDamage(weapon.damage, game);
            } else {
                const hitDist = 4.0;
                game.renderer.addSparkParticles(
                    p.x + p.dirX * hitDist,
                    p.y + p.dirY * hitDist,
                    '#ffff00',
                    3
                );
            }
            return true;
        }
        return false;
    }
}