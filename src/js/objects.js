function check_collision(entity1, entity2) {
    if (entity1.x < entity2.x + entity2.w && entity1.x + entity1.w > entity2.x && entity1.y < entity2.y + entity2.h && entity1.y + entity1.h > entity2.y) {
        return true
    }
    return false
}

function check_collisions(friendly_object) {
    const collisions = []
    for (let i = 0; i < this.gd.enemies.length; i++) {
        obj_name = this.gd.enemies[i]
        for (enemy of this.gd.entities[obj_name]) {
            if (check_collision(friendly_object, enemy)) {
                collisions.push(enemy)
            }
        }
    }
    return collisions
}

function damage(entity, dps) {
    dmg = dps * entity.gd.time_between_ticks()
    entity.health -= dmg
    if (entity.health <= 0) {
        entity.health = 0
        entity.die()
        if (entity.score != null) {
            entity.gd.score += entity.score
        }
    }
}

const Player = {
    gd: null,
    w: 90,
    h: 30,
    x: 10,
    y: 240,
    upgrade_cost: 20,
    score_multiplier: 1,
    regen_rate_ps: 1,
    max_health: 100,
    health: 100,
    dps: 10,
    shoot_delay: 500,
    move_speed: 250,
    img: new Image(),
    src: "assets/nyan.png",
    lastMove: 0,
    lastShoot: 0,
    shoot: function() {
        if (Date.now() - this.lastShoot < this.shoot_delay) return
        const bullet = Object.assign({}, this.gd.Bullet)
        bullet.x = this.gd.Player.x + this.gd.Player.w + 5
        bullet.y = this.gd.Player.y + this.gd.Player.h/2 - bullet.h/2
        this.gd.entities["Bullet"].push(bullet)
        this.lastShoot = Date.now()
    },
    check_collisions: check_collisions,
}
Player.img.src = Player.src

const Laser = {
    gd: null,
    w: 100,
    h: 30,
    x: 0,
    y: 0,
    duration: 3000,
    cooldown: 5000,
    dps: 100,
    img: new Image(),
    src: "assets/Laser.png",
    created: 0,
    inuse: false,
    check_collisions: check_collisions,
}
Laser.img.src = Laser.src

const Bullet = {
    gd: null,
    w: 40,
    h: 20,
    x: 0,
    y: 0,
    dps: 50,
    img: new Image(),
    src: "assets/bullet.png",
    lastMove: 0,
    check_collisions: check_collisions,
}
Bullet.img.src = Bullet.src

const Baddy = {
    gd: null,
    w: 30,
    h: 30,
    x: 0,
    y: 0,
    score: 10,
    lives: 10,
    dps: 100,
    move_speed: 100,
    img: new Image(),
    src: "assets/baddy.png",
    lastMove: 0,
}
Baddy.img.src = Baddy.src

const Boom = {
    gd: null,
    w: 50,
    h: 50,
    x: 0,
    y: 0,
    img: new Image(),
    src: "assets/boom.png",
    created: 0,
}
Boom.img.src = Boom.src

const Objects = {
    "Player": Player,
    "Laser": Laser,
    "Baddy": Baddy,
    "Bullet": Bullet,
    "Boom": Boom,
}

function get_object(name, gd) {
    if (Objects[name] == null) {
        console.log("ERROR: Object '" + name + "' does not exist")
        return
    }
    const object = Object.assign({}, Objects[name])
    object.gd = gd
    return object
}

module.exports = get_object