const { Player, Laser, Baddy, HomingBaddy } = require("./classes/entities.js")
const WaveHandler = require("./classes/wave.js")
const InputHandler = require("./classes/input.js")
const GameView = require("./views/game/game_view.js")
const ShopView = require("./views/shop/shop_view.js")

const gd = {
    canvas: null,
    ctx: null,
    maxWidth: null,
    maxHeight: null,

    player: null,
    laser: null,
    wave_handler: null,

    entities: {
        "Bullet": [],
        "Boom": [],
    },
    enemies: {
        "Baddy": Baddy,
        "HomingBaddy": HomingBaddy
    },

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
        this.score = 0
    
        for (let [entity] of Object.entries(this.enemies)) {
            this.entities[entity] = []
        }

        for (let [entity] of Object.entries(this.entities)) {
            this.entities[entity] = []
        }
    
        this.player = new Player(gd, 100, 50, 10, this.maxWidth/2-50/2)
        this.laser = new Laser(gd, 150, 50, 0, 0)

        this.wave_handler = new WaveHandler(gd)
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

    gd.wave_handler.tick()
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
    gd.maxHeight = gd.ctx.canvas.height

    for ([view_name, view] of Object.entries(gd.views)) {
        gd.views[view_name] = new gd.views[view_name](gd)
    }
    gd.input_handler = new InputHandler(gd),

    gd.setup()
    gd.logic_cycle = setInterval(logic, 1000/60)
}
window.main = main