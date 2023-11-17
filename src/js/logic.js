const { Player, Laser, Baddy } = require("./objects.js")

const shop_view = require("./views/shop.js")
const game_view = require("./views/game.js")
const views = {
    "shop": shop_view,
    "game": game_view,
}

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

    Button: {
        w: 100,
        h: 50,
        x: 0,
        y: 0,
        text: "BTN",
        text_size: 30,
        sub_text: null,
        text_color: "white",
        color : "red",
        view: "game",
        callback: function() {},
    },
    Buttons: [],

    view: "game",

    pressed_keys: {},

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
}

let cookies = document.getElementById("cookies")
if (cookies) {
    cookies = cookies.split(";")
    if (cookies[0]) gd.hiscore = cookies[0]
}

function mouse_position(e) {
    let rect = gd.canvas.getBoundingClientRect()
    let x = e.clientX - rect.left
    let y = e.clientY - rect.top
    return [x,y]
}

let last_click = 0
function mouse_input_handler(e) {
    if (gd.game_over_flag) return
    if (last_click + 100 > Date.now()) return
    let [x,y] = mouse_position(e)
    for (let i = 0; i < gd.Buttons.length; i++) {
        const button = gd.Buttons[i]
        if (button.view != gd.view) continue
        if (x > button.x && x < button.x + button.w && y > button.y && y < button.y + button.h) {
            button.callback()
            last_click = Date.now()
            return
        }
    }
}


function game_over_input_handler(e) {
    if (e.key == " ") {
        document.removeEventListener("keydown", game_over_input_handler)
        main()
    }
}

function setup_game() {
    gd.game_over_flag = false
    gd.score = 1000

    for (let [entity] of Object.entries(gd.entities)) {
        gd.entities[entity] = []
    }

    gd.player = new Player(gd, 100, 50, 10, gd.maxWidth/2-50/2)
    gd.laser = new Laser(gd, 150, 50, 0, 0)
    draw()
}

function game_over() {
    clearInterval(gd.logic_cycle)
    document.addEventListener("keydown", game_over_input_handler)
    document.removeEventListener("keydown", keydown_callback)
    document.removeEventListener("keyup", keyup_callback)
    gd.game_over_flag = true
    document.cookie = gd.hiscore + ";"
    gd.pressed_keys = {}
    gd.laser.inuse = false
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

function input_handler() {
    let move_angle = 0
    
    let move_x = 0
    let move_y = 0
    for (const key in gd.pressed_keys) {
        switch (key) {
            case "w":
                move_y -= 1
                break
            case "s":
                move_y += 1
                break
            case "a":
                move_x -= 1
                break
            case "d":
                move_x += 1
                break
            case "q":
                gd.player.laser()
                break
            case " ":
                gd.player.shoot()
                break
        }
    }
    if (move_x == 0 && move_y == 0) {
        move_angle = -1
    } else {
        move_angle = Math.atan2(move_y, move_x) * 180 / Math.PI
    }
    gd.player.move_angle = move_angle
    gd.player.move()
}

function draw() {
    gd.ctx.clearRect(0,0,gd.maxWidth,gd.maxHeigth)
    const bg_img = views[gd.view].bg_img
    let img_ratio = bg_img.width / bg_img.height
    gd.ctx.drawImage(bg_img, 0, 0, gd.maxHeigth*img_ratio, gd.maxHeigth)

    views[gd.view].render(gd)

    if (gd.game_over_flag) return
    for (let i = 0; i < gd.Buttons.length; i++) {
        const button = gd.Buttons[i]
        if (button.view != gd.view) continue
        gd.ctx.fillStyle = button.color
        gd.ctx.fillRect(button.x, button.y, button.w, button.h)
        gd.ctx.font = button.text_size + "px Arial"
        gd.ctx.fillStyle = button.text_color
        gd.ctx.textAlign = "center"
        if (!button.sub_text) gd.ctx.fillText(button.text, button.x + button.w/2, button.y + button.h/2 + button.text_size/3)
        else {
            gd.ctx.fillText(button.text, button.x + button.w/2, button.y + button.h/2 - button.text_size/3 + 5)
            gd.ctx.font = button.text_size/3*2 + "px Arial"
            gd.ctx.fillText(button.sub_text, button.x + button.w/2, button.y + button.h/2 + button.text_size/3*2 + 5)
        }
    }

    requestAnimationFrame(draw)
}

function logic() {
    gd.current_tick = Date.now()

    if (gd.paused) {
        gd.last_tick = gd.current_tick
        return
    }
    if (gd.game_over_flag) {
        game_over()
        return
    }
    if (gd.score>gd.hiscore) gd.hiscore = Math.floor(gd.score)

    input_handler()

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

function keydown_callback(e) {
    gd.pressed_keys[e.key] = true
}

function keyup_callback(e) {
    delete gd.pressed_keys[e.key]
}

function toggle_pause() {
    gd.paused = !gd.paused
}

function shop_callback() {
    gd.view = "shop"
    gd.paused = true
    draw()
}

function exit_shop_callback() {
    gd.view = "game"
    gd.paused = false
    draw()
}

const shop_buttons = {
    "Health": "Placeholder",
    "Regen": "Placeholder",
    "Bullet DMG": "Placeholder",
    "Speed": "Placeholder",
    "Laser Duration": "Placeholder",
    "Score Multiplier": "Placeholder",
}
function generic_stat_boost_callback() {

}

function setup_buttons() {
    const shop_btn = Object.assign({}, gd.Button)
    shop_btn.x = gd.maxWidth - shop_btn.w - 10
    shop_btn.y = gd.maxHeigth - shop_btn.h - 10
    shop_btn.text = "Shop"
    shop_btn.view = "game"
    shop_btn.callback = shop_callback
    gd.Buttons.push(shop_btn)

    const exit_shop_btn = Object.assign({}, gd.Button)
    exit_shop_btn.x = gd.maxWidth - shop_btn.w - 10
    exit_shop_btn.y = gd.maxHeigth - shop_btn.h - 10
    exit_shop_btn.text = "Exit"
    exit_shop_btn.view = "shop"
    exit_shop_btn.callback = exit_shop_callback
    gd.Buttons.push(exit_shop_btn)

    const button_offset = 10
    const cols = 3
    const rows = 2
    const btn_w = 200
    const btn_h = 50
    const w = button_offset*(cols-1)+btn_w*cols
    const h = button_offset*(rows-1)+btn_h*rows

    const x = gd.maxWidth/2-w/2
    const y = gd.maxHeigth/2-h/2

    let i = 0
    for (const [button_text, button_subtext] of Object.entries(shop_buttons)) {
        const button = Object.assign({}, gd.Button)
        button.x = x + (button_offset+btn_w)*(i%cols)
        button.y = y + (button_offset+btn_h)*Math.floor(i/cols)
        button.w = btn_w
        button.h = btn_h
        button.text = button_text
        button.sub_text = button_subtext
        button.text_size = 20
        button.color = "red"
        button.text_color = "white"
        button.view = "shop"
        button.callback = generic_stat_boost_callback
        gd.Buttons.push(button)
        i++
    }
}

function main() {
    document.addEventListener("keyup", keyup_callback)
    document.addEventListener("keydown", keydown_callback)
    document.addEventListener("click", mouse_input_handler)

    gd.canvas = document.getElementById("game")
    gd.ctx = gd.canvas.getContext("2d")
    gd.maxWidth = gd.ctx.canvas.width
    gd.maxHeigth = gd.ctx.canvas.height

    setup_game()
    setup_buttons()

    gd.logic_cycle = setInterval(logic, 1000/60)
}
window.main = main