console.log("logic.js loaded")

const get_object = require("./objects.js")

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

    Player: get_object("Player"),
    Laser: get_object("Laser"),
    Baddy: get_object("Baddy"),
    Bullet: get_object("Bullet"),
    Boom: get_object("Boom"),

    entities: {
        "Baddy": [],
        "Bullet": [],
        "Boom": [],
    },

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
}

let logic_cycle
let current_tick = Date.now()
let last_tick = Date.now()
function time_between_ticks() {
    return (current_tick-last_tick)/1000
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
        gd.game_over_flag = false
        gd.score = 0
        gd.Laser = get_object("Laser")
        gd.Player = get_object("Player")
        gd.Bullet = get_object("Bullet")
        main()
    }
}

function game_over() {
    clearInterval(logic_cycle)
    document.addEventListener("keydown", game_over_input_handler)
    document.removeEventListener("keydown", keydown_callback)
    document.removeEventListener("keyup", keyup_callback)
    gd.game_over_flag = true
    document.cookie = gd.hiscore + ";"
    gd.pressed_keys = {}
    for (let entity of Object.entries(gd.entities)) {
        gd.entities[entity] = []
    }
    gd.Laser.inuse = false
}

function spawnBullet() {
    const bullet = Object.assign({}, gd.Bullet)
    bullet.x = gd.Player.x + gd.Player.w + 5
    bullet.y = gd.Player.y + gd.Player.h/2 - bullet.h/2
    gd.entities["Bullet"].push(bullet)
}

function spawnBaddy() {
    const baddy = get_object("Baddy")
    baddy.w = baddy.w * ((Math.random())+0.8)
    baddy.h = baddy.w
    baddy.x = gd.maxWidth - baddy.w
    baddy.y = Math.floor(Math.random() * (gd.maxHeigth - baddy.h))
    baddy.move_speed = baddy.move_speed * ((Math.random())+0.5)
    gd.entities["Baddy"].push(baddy)
}

function spawnBoom(x,y,w,h) {
    boom = get_object("Boom")
    boom.x = x
    boom.y = y
    boom.w = w
    boom.h = h
    boom.created = Date.now()
    gd.entities["Boom"].push(boom)
}

function check_collision(entity1, entity2) {
    if (entity1.x < entity2.x + entity2.w && entity1.x + entity1.w > entity2.x && entity1.y < entity2.y + entity2.h && entity1.y + entity1.h > entity2.y) {
        return true
    }
    return false
}

function input_handler() {
    if (gd.game_over_flag || gd.paused) return
    for (const [key] of Object.entries(gd.pressed_keys)) {
        move_size = gd.Player.move_speed * (time_between_ticks())
        switch (key.toLowerCase()) {
            case " ":
                if (gd.Player.lastShoot + gd.Player.shoot_delay > Date.now()) break
                spawnBullet()
                gd.Player.lastShoot = Date.now()
                break
            case "w":
                if (gd.Player.y - move_size < 0) break
                gd.Player.y -= move_size
                break
            case "s":
                if (gd.Player.y + gd.Player.h + move_size > gd.maxHeigth) break
                gd.Player.y += move_size
                break
        }
    }
}

function input_handler() {
    const move_size = gd.Player.move_speed * (time_between_ticks())
    console.log(move_size)
    for (const key in gd.pressed_keys) {
        switch (key) {
            case "w":
                if (gd.Player.y - move_size < 0) break
                gd.Player.y -= move_size
                break
            case "s":
                if (gd.Player.y + gd.Player.h + move_size > gd.maxHeigth) break
                gd.Player.y += move_size
                break
            case "a":
                if (gd.Player.x - move_size < 0) break
                gd.Player.x -= move_size
                break
            case "d":
                if (gd.Player.x + gd.Player.w + move_size > Math.floor(gd.maxWidth/5*4)) break
                gd.Player.x += move_size
                break
            case "q":
                if (gd.Laser.inuse == false && gd.score > 100 && gd.Laser.created + gd.Laser.duration + gd.Laser.cooldown < Date.now()) {
                    gd.Laser.created = Date.now()
                    gd.Laser.inuse = true
                    gd.score -= 100
                }
        }
    }
    gd.Player.lastMove = Date.now()
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

function add_score(amount) {
    gd.score += Math.floor(amount*gd.Player.score_multiplier)
}

function logic() {
    gd.current_tick = Date.now()

    if (gd.paused) {
        gd.last_tick = gd.current_tick
        return
    }
    if (gd.Player.health <= 0) {
        game_over()
        return
    }
    if (gd.score>gd.hiscore) gd.hiscore = Math.floor(gd.score)

    input_handler()

    //Player regen
    if (gd.Player.health < gd.Player.max_health) {
        gd.Player.health += gd.Player.regen_rate_ps * (time_between_ticks())
        if (gd.Player.health > gd.Player.max_health) gd.Player.health = gd.Player.max_health
    }

    if (gd.Laser.inuse) {
        gd.Laser.x = gd.Player.x + gd.Player.w + 10
        gd.Laser.y = gd.Player.y + gd.Player.h / 2 - gd.Laser.h /2
        if (gd.Laser.created + gd.Laser.duration < Date.now()) {
            gd.Laser.inuse = false
        }
        for (let i = 0; i < gd.entities["Baddy"].length; i++) {
            const baddy = gd.entities["Baddy"][i]
            //Laser collision
            if (check_collision(baddy, gd.Laser)) {
                baddy.lives -= gd.Laser.dps * (time_between_ticks())
                if (baddy.lives <= 0) {
                    wh = baddy.w * (gd.Boom.w/gd.Baddy.w)
                    spawnBoom(baddy.x, baddy.y, wh, wh)
                    add_score(baddy.score)()
                    gd.entities["Baddy"].splice(i,1)
                    i--
                }
            }
        }
    }
    for (let i = 0; i < gd.entities["Bullet"].length; i++) {
        const bullet = gd.entities["Bullet"][i]
        bullet.x += 5
        if (bullet.x > gd.maxWidth) {
            gd.entities["Bullet"].splice(i,1)
            i--
        }
        for (let j = 0; j < gd.entities["Baddy"].length; j++) {
            const baddy = gd.entities["Baddy"][j]
            //Bullet collision
            if (check_collision(baddy, bullet)) {
                gd.entities["Bullet"].splice(i,1)
                i--
                baddy.lives -= bullet.dps
                if (baddy.lives <= 0) {
                    wh = baddy.w * (gd.Boom.w/gd.Baddy.w)
                    spawnBoom(baddy.x, baddy.y, wh, wh)
                    add_score(baddy.score)
                    gd.entities["Baddy"].splice(j,1)
                    j--
                }
            }
        }
    }

    for (let i = 0; i < gd.entities["Baddy"].length; i++) {
        const baddy = gd.entities["Baddy"][i]
        //Movement
        baddy.x -= baddy.move_speed * (time_between_ticks())
        //Offscreen check
        if (baddy.x + baddy.w < 0) {
            gd.entities["Baddy"].splice(i,1)
            i--
        }
        //Player collision
        if (check_collision(baddy, gd.Player)) {
            gd.Player.health -= baddy.dps * (time_between_ticks())
            baddy.lives -= gd.Player.dps * (time_between_ticks())
            if (baddy.lives <= 0) {
                wh = baddy.w * (gd.Boom.w/gd.Baddy.w)
                    spawnBoom(baddy.x, baddy.y, wh, wh)
                    add_score(baddy.score)()
                gd.entities["Baddy"].splice(i,1)
                i--
            }
        }
    }

    for (let i = 0; i < gd.entities["Boom"].length; i++) {
        const boom = gd.entities["Boom"][i]
        if (boom.created + 1000 < Date.now()) {
            gd.entities["Boom"].splice(i,1)
            i--
        }
    }

    if (gd.last_baddy + gd.next_baddy < Date.now()) {
        spawnBaddy()
        gd.last_baddy = Date.now()
        gd.next_baddy = Math.floor(Math.random() * 2000-500-gd.score*3) + 500
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
    "Health": gd.Player.max_health+"HP",
    "Regen": (Math.floor(gd.Player.regen_rate_ps * 100) / 100)+"HP/s",
    "Bullet DMG": Math.floor(gd.Bullet.dps)+"DMG",
    "Speed": (Math.floor(gd.Player.move_speed * 100) / 100)+"px/s",
    "Laser Duration": (Math.floor(gd.Laser.duration*100)/100/1000)+"s",
    "Score Multiplier": (Math.floor(gd.Player.score_multiplier * 100) / 100),
}
function generic_stat_boost_callback() {
    if (gd.score < gd.Player.upgrade_cost) return
    switch(this.text) {
        case "Health":
            gd.Player.max_health *= 1.01
            this.sub_text = Math.floor(gd.Player.max_health)+"HP"
            break
        case "Regen":
            gd.Player.regen_rate_ps *= 1.01
            this.sub_text = (Math.floor(gd.Player.regen_rate_ps * 100) / 100)+"HP/s"
            break
        case "Bullet DMG":
            gd.Bullet.dps *= 1.01
            this.sub_text = Math.floor(gd.Bullet.dps)+"DMG"
            break
        case "Speed":
            gd.Player.move_speed *= 1.01
            this.sub_text = (Math.floor(gd.Player.move_speed * 100) / 100)+"px/s"
            break
        case "Laser Duration":
            gd.Laser.duration *= 1.01
            this.sub_text = (Math.floor(gd.Laser.duration/1000*100)/100)+"s"
            break
        case "Score Multiplier":
            gd.Player.score_multiplier *= 1.01
            this.sub_text = (Math.floor(gd.Player.score_multiplier * 100) / 100)
            break
    }
    gd.score -= gd.Player.upgrade_cost
    gd.Player.upgrade_cost = Math.ceil(gd.Player.upgrade_cost * 1.1)
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

    setup_buttons()

    draw()
    logic_cycle = setInterval(logic, 1000/60)
}
window.main = main