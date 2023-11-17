const { Player, Laser, Baddy } = require("./classes/entities.js")
const InputHandler = require("./classes/input.js")
const GameView = require("./views/game/game_view.js")
const ShopView = require("./views/shop/shop_view.js")

const gd = {
    canvas: null,
    ctx: null,
    maxWidth: null,
    maxHeigth: null,

    player: null,
    laser: null,

    entities: {
        "Baddy": [],
        "Bullet": [],
        "Boom": [],
    },
    enemies: ["Baddy"],

    view: "game",
    views: {
        "game": GameView,
        "shop": ShopView,
    },

    last_baddy: 0,
    next_baddy: 0,

    hiscore: 0,
    score: 0,

    paused: false,
    game_over_flag: false,

    logic_cycle: null,
    current_tick: Date.now(),
    last_tick: Date.now(),
    time_between_ticks: function() {
        return (gd.current_tick-gd.last_tick)/1000
    },

    setup() {
        this.input_handler.register()
        this.game_over_flag = false
        this.score = 1000
    
        for (let [entity] of Object.entries(this.entities)) {
            this.entities[entity] = []
        }
    
        this.player = new Player(gd, 100, 50, 10, this.maxWidth/2-50/2)
        this.laser = new Laser(gd, 150, 50, 0, 0)
        draw()
    },
    restart() {
        this.paused = false
        this.view = "game"
        this.setup()
        this.logic_cycle = setInterval(logic, 1000/60)
    },
    game_over() {
        clearInterval(this.logic_cycle)
        this.game_over_flag = true
        this.input_handler.unregister()
        this.pressed_keys = {}
        document.cookie = gd.hiscore + ";"
        this.laser.inuse = false
        this.paused = false
    }
}

let cookies = document.getElementById("cookies")
if (cookies) {
    cookies = cookies.split(";")
    if (cookies[0]) gd.hiscore = cookies[0]
}

function spawnBaddy() {
    const baddy = new Baddy(gd, 50, 50, 0, 0)
    baddy.w = baddy.w * ((Math.random())+0.8)
    baddy.h = baddy.w
    baddy.x = gd.maxWidth - baddy.w
    baddy.y = Math.floor(Math.random() * (gd.maxHeigth - baddy.h))
    baddy.move_speed = baddy.move_speed * ((Math.random())+0.5)

    gd.entities["Baddy"].push(baddy)
}

function draw() {
    gd.views[gd.view].draw(gd)
    requestAnimationFrame(draw)
}

function logic() {
    gd.current_tick = Date.now()

    if (gd.paused) {
        gd.last_tick = gd.current_tick
        return
    }
    if (gd.game_over_flag) {
        gd.game_over()
        return
    }
    if (gd.score>gd.hiscore) gd.hiscore = Math.floor(gd.score)

    gd.input_handler.check()

    if (gd.next_baddy < gd.current_tick) {
        spawnBaddy()
        gd.next_baddy = gd.current_tick + (Math.random() * 2000-500)+500
    }

    gd.player.tick()
    gd.laser.tick()

    for (let [entity, entity_arr] of Object.entries(gd.entities)) {
        for (let i = 0; i < entity_arr.length; i++) {
            entity_arr[i].tick()
        }
    }


    gd.last_tick = gd.current_tick
}

function main() {
    gd.canvas = document.getElementById("game")
    gd.ctx = gd.canvas.getContext("2d")
    gd.maxWidth = gd.ctx.canvas.width
    gd.maxHeigth = gd.ctx.canvas.height

    for ([view_name, view] of Object.entries(gd.views)) {
        gd.views[view_name] = new gd.views[view_name](gd)
    }
    gd.input_handler = new InputHandler(gd),

    gd.setup()
    gd.logic_cycle = setInterval(logic, 1000/60)
}
window.main = main