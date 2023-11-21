class Entity {
    gd = null;
    id = this.constructor.name;
    w = 0;
    h = 0;
    x = 0;
    y = 0;
    img = null;
    src = "";
    max_health = 0;
    health = 0;
    regen_rate_ps = 0;
    dps = 0;
    flat_dmg = false;
    move_speed = 0;
    move_angle = 0;
    explodes_on_death = true;

    _move_left = Math.PI
    _move_right = 0
    _move_up = Math.PI*1.5
    _move_down = Math.PI*0.5

    dead = false;
    
    constructor(gd, w, h, x, y) {
        this.gd = gd
        if (w) this.w = w
        if (h) this.h = h
        if (x) this.x = x
        if (y) this.y = y

        this.spawn_time = Date.now()

        this.img = new Image()
    }

    move(limited_to_canvas=false) {
        if (this.move_angle == -1) return
        const radians = this.move_angle * Math.PI / 180
        let x_offset = this.move_speed * this.gd.time_between_ticks() * Math.cos(radians)
        let y_offset = this.move_speed * this.gd.time_between_ticks() * Math.sin(radians)
        if (limited_to_canvas) {
            if (this.x + x_offset < 0 || this.x + this.w + x_offset > this.gd.canvas.width*(4/5)) x_offset = 0
            if (this.y + y_offset < 0 || this.y + this.h + y_offset > this.gd.canvas.height) y_offset = 0
        }
        this.x += x_offset
        this.y += y_offset
    }

    tick() {
        this.move()
        if (this.health < this.max_health) {
            this.health += this.regen_rate_ps * this.gd.time_between_ticks()
        }
    }

    die(explodes=true) {
        if (this.dead) return
        if (explodes) {
            let size = this.w
            if (this.w < this.h) size = this.h
            size = size * 1.5
            const boom_x = this.x + this.w/2 - size/2
            const boom_y = this.y + this.h/2 - size/2
            const boom = new Boom(this.gd, size, size, boom_x, boom_y)
            this.gd.entities["Boom"].push(boom)
        }
        if (this.gd.entities[this.id] == null) return
        const index = this.gd.entities[this.id].indexOf(this)
        if (index > -1) this.gd.entities[this.id].splice(this.gd.entities[this.id].indexOf(this), 1)
        this.dead = true
    }

    _damage(entity, damage) {
        entity.health -= damage
        if (entity.health <= 0) {
            entity.die(entity.explodes_on_death)
        }
    }
}

class Ally extends Entity {
    constructor(gd, w, h, x, y) {
        super(gd, w, h, x, y)
    }

    tick() {
        super.tick()
        const collisions = this.check_collisions()
        for (const enemy of collisions) {
            if (this.flat_dmg) {
                this._damage(enemy, this.dps)
            } else {
                this._damage(enemy, this.dps * this.gd.time_between_ticks())
            }
            if (enemy.flat_dmg) {
                this._damage(this, enemy.dps)
            } else {
                this._damage(this, enemy.dps * enemy.gd.time_between_ticks())
            }
        }
    }

    check_collisions() {
        const collisions = []
        for (const [obj_name, obj] of Object.entries(this.gd.entities)) {
            if (this.gd.enemies[obj_name] == null) continue
            for (const enemy of this.gd.entities[obj_name]) {
                if (this._check_collision(this, enemy)) {
                    collisions.push(enemy)
                }
            }
        }
        return collisions
    }

    _check_collision(entity1, entity2) {
        if (entity1.x < entity2.x + entity2.w && entity1.x + entity1.w > entity2.x && entity1.y < entity2.y + entity2.h && entity1.y + entity1.h > entity2.y) {
            return true
        }
        return false
    }
}

class Enemy extends Entity {
    score_pts = 0;

    constructor(gd) {
        super(gd)
    }

    tick() {
        super.tick()
        if (this.x + this.w < 0 || this.x > this.gd.canvas.width || this.y + this.h < 0 || this.y > this.gd.canvas.height) {
            this.die(false)
        }
    }

    die(explodes=true) {
        super.die(explodes)
        if (explodes) this.gd.score += this.score_pts * this.gd.player.score_multiplier
    }
}

class Boom extends Entity {
    duration = 1000;
    created = null;
    src = "assets/boom.png";
    explodes_on_death = false;
    health = 100000000

    constructor(gd, w, h, x, y) {
        super(gd, w, h, x, y)
        this.created = Date.now()
        this.img.src = this.src
    }

    tick() {
        if (Date.now() - this.created > this.duration) {
            this.die(false)
        }
    }
}

class Player extends Ally {
    upgrade_cost = 20;
    score_multiplier = 1;
    shoot_delay = 500;
    max_health = 100;
    health = 100;
    regen_rate_ps = 1;
    dps = 10;
    move_speed = 250;

    lastMove = 0;
    lastShoot = 0;

    src = "assets/nyan.png";

    constructor(gd, w, h, x, y) {
        super(gd, w, h, x, y)
        this.img.src = this.src
    }

    move() {
        super.move(true)
    }

    shoot() {
        if (Date.now() - this.lastShoot < this.shoot_delay) return
        const bullet = new Bullet(this.gd, 20, 20, 0, 0)
        bullet.x = this.x + this.w + 5
        bullet.y = this.y + this.h/2 - bullet.h/2
        console.log(bullet)
        this.gd.entities["Bullet"].push(bullet)
        this.lastShoot = Date.now()
    }

    laser() {
        this.gd.laser.use()
    }

    die() {
        this.gd.game_over_flag = true
        let size = this.w
        if (this.w < this.h) size = this.h
        size = size * 5
        const boom_x = this.x + this.w/2 - size/2
        const boom_y = this.y + this.h/2 - size/2
        const boom = new Boom(this.gd, size, size, boom_x, boom_y)
        this.gd.entities["Boom"].push(boom)
    }
}

class Laser extends Ally {
    duration = 3000;
    cooldown = 5000;
    dps = 100;
    move_angle = -1;

    last_shot = 0;

    inuse = false;
    explodes_on_death = false;

    src = "assets/Laser.png";

    constructor(gd, w, h, x, y) {
        super(gd, w, h, x, y)
        this.img.src = this.src
    }

    tick() {
        if (Date.now() - this.lastUse > this.duration) {
            this.inuse = false
        }
        if (!this.inuse) return
        this.x = this.gd.player.x + this.gd.player.w + 5
        this.y = this.gd.player.y + this.gd.player.h/2 - this.h/2
        super.tick()
    }

    use() {
        if (Date.now() - this.lastUse < this.cooldown) return
        this.lastUse = Date.now()
        this.inuse = true
    }
}

class Bullet extends Ally {
    dps = 50;
    move_speed = 500;
    flat_dmg = true;
    explodes_on_death = false;
    health = 1

    src = "assets/bullet.png";

    constructor(gd, w, h, x, y) {
        super(gd, w, h, x, y)
        this.img.src = this.src
    }

    tick() {
        super.tick()
        if (this.x + this.w < 0 || this.x > this.gd.canvas.width || this.y + this.h < 0 || this.y > this.gd.canvas.height) {
            this.die(this.explodes_on_death)
        }
    }
}

class Baddy extends Enemy {
    score_pts = 10;
    max_health = 10;
    health = 10;
    dps = 100;
    move_speed = 100;
    src = "assets/baddy.png";

    w = 50;
    h = 50;

    lastMove = 0;

    constructor(gd) {
        super(gd)
        this.img.src = this.src
    }

    tick() {
        if (Date.now() - this.lastMove > 1000) {
            this.move_angle = (Math.random() * 10) + 170
            this.lastMove = Date.now()
        }
        super.tick()
    }
}

class HomingBaddy extends Enemy {
    score_pts = 20;
    max_health = 20;
    health = 20;
    dps = 100;
    move_speed = 200;
    src = "assets/homing_baddy.png";

    move_angle = 180;

    w = 30;
    h = 30;

    lastMove = 0;

    constructor(gd) {
        super(gd)
        this.img.src = this.src
    }

    tick() {
        if (Date.now() - this.lastMove > 100) {
            const player_y = this.gd.player.y + this.gd.player.h/2
            const player_x = this.gd.player.x + this.gd.player.w/2 - 1

            const me_y = this.y + this.h/2
            const me_x = this.x + this.w/2

            if (me_x < player_x  || this.spawn_time + 1500 < Date.now()) {
                super.tick()
                return
            }

            const radians = Math.atan2(player_y - me_y, player_x - me_x)
            this.move_angle = radians * 180 / Math.PI
            this.lastMove = Date.now()
        }
        super.tick()
    }
}

module.exports = {
    Boom,
    Player,
    Bullet,
    Laser,
    Baddy,
    HomingBaddy
}