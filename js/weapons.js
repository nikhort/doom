export class WeaponManager {
    constructor() {
        this.weapons = {
            pistol: { name: 'Пистолет', ammo: Infinity, damage: 10, fireRate: 400 },
            shotgun: { name: 'Дробовик', ammo: 20, damage: 50, fireRate: 1000 }
        };
        this.currentWeapon = 'pistol';
        this.lastFireTime = 0;
    }

    fire(timestamp) {
        const weapon = this.weapons[this.currentWeapon];
        if (timestamp - this.lastFireTime >= weapon.fireRate && weapon.ammo > 0) {
            this.lastFireTime = timestamp;
            if (weapon.ammo !== Infinity) weapon.ammo--;
            // Здесь будет логика Raycast для проверки попадания по ИИ
            return true; // Выстрел успешен
        }
        return false;
    }
}