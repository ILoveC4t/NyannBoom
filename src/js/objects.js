const Player = {
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
}
Player.img.src = Player.src

const Laser = {
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
}
Laser.img.src = Laser.src

const Baddy = {
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
    die: function() {
        wh = this.w * (Boom.w/Baddy.w)
        spawnBoom(this.x, this.y, wh, wh)
        add_score(this.score)
    }
}
Baddy.img.src = Baddy.src

const Bullet = {
    w: 40,
    h: 20,
    x: 0,
    y: 0,
    dps: 50,
    img: new Image(),
    src: "assets/bullet.png",
    lastMove: 0,
}
Bullet.img.src = Bullet.src

const Boom = {
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

function get_object(name) {
    if (Objects[name] == null) {
        console.log("ERROR: Object '" + name + "' does not exist")
        return
    }
    return Object.assign({}, Objects[name])
}

module.exports = {
    getObject: get_object
}