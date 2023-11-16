const get_object = require("./objects.js")

const game_bg_img = new Image()
game_bg_img.src = "assets/game_bg.png"

const shop_bg_img = new Image()
shop_bg_img.src = "assets/shop_bg.png"

let Player = get_object("Player")
let Laser = get_object("Laser")
let Baddy = get_object("Baddy")
let Bullet = get_object("Bullet")
let Boom = get_object("Boom")

const entities = {
    "Baddy": [Baddy, []],
    "Bullet": [Bullet, []],
    "Boom": [Boom, []],
}

const Button = {
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
}
let Buttons = []

let view = "game"
bg_imgs = {
    "game": game_bg_img,
    "shop": shop_bg_img,
}


let pressed_keys = {}

let canvas
let ctx
let maxWidth
let maxHeigth

let last_baddy = 0
let next_baddy = 0

let hiscore = 0
let score = 0

let paused = false
let logic_cycle
let game_over_flag = false

let current_tick = Date.now()
let last_tick = Date.now()
function time_between_ticks() {
    return (current_tick-last_tick)/1000
}

let cookies = document.getElementById("cookies")
if (cookies) {
    cookies = cookies.split(";")
    if (cookies[0]) hiscore = cookies[0]
}

function mouse_position(e) {
    let rect = canvas.getBoundingClientRect()
    let x = e.clientX - rect.left
    let y = e.clientY - rect.top
    return [x,y]
}

let last_click = 0
function mouse_input_handler(e) {
    if (game_over_flag) return
    if (last_click + 100 > Date.now()) return
    let [x,y] = mouse_position(e)
    for (let i = 0; i < Buttons.length; i++) {
        const button = Buttons[i]
        if (button.view != view) continue
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
        game_over_flag = false
        score = 0
        Laser = get_object("Laser")
        Player = get_object("Player")
        Bullet = get_object("Bullet")
        main()
    }
}

function game_over() {
    clearInterval(logic_cycle)
    document.addEventListener("keydown", game_over_input_handler)
    document.removeEventListener("keydown", keydown_callback)
    document.removeEventListener("keyup", keyup_callback)
    game_over_flag = true
    document.cookie = hiscore + ";"
    pressed_keys = {}
    for (let [entity] of Object.entries(entities)) {
        entities[entity][1] = []
    }
    Laser.inuse = false
}

function spawnBullet() {
    const bullet = Object.assign({}, Bullet)
    bullet.x = Player.x + Player.w + 5
    bullet.y = Player.y + Player.h/2 - bullet.h/2
    entities["Bullet"][1].push(bullet)
}

function spawnBaddy() {
    const baddy = get_object("Baddy")
    baddy.w = baddy.w * ((Math.random())+0.8)
    baddy.h = baddy.w
    baddy.x = maxWidth - baddy.w
    baddy.y = Math.floor(Math.random() * (maxHeigth - baddy.h))
    baddy.move_speed = baddy.move_speed * ((Math.random())+0.5)
    entities["Baddy"][1].push(baddy)
}

function spawnBoom(x,y,w,h) {
    boom = get_object("Boom")
    boom.x = x
    boom.y = y
    boom.w = w
    boom.h = h
    boom.created = Date.now()
    entities["Boom"][1].push(boom)
}

function check_collision(entity1, entity2) {
    if (entity1.x < entity2.x + entity2.w && entity1.x + entity1.w > entity2.x && entity1.y < entity2.y + entity2.h && entity1.y + entity1.h > entity2.y) {
        return true
    }
    return false
}

function input_handler() {
    if (game_over_flag || paused) return
    for (const [key] of Object.entries(pressed_keys)) {
        move_size = Player.move_speed * (time_between_ticks())
        switch (key.toLowerCase()) {
            case " ":
                if (Player.lastShoot + Player.shoot_delay > Date.now()) break
                spawnBullet()
                Player.lastShoot = Date.now()
                break
            case "w":
                if (Player.y - move_size < 0) break
                Player.y -= move_size
                break
            case "s":
                if (Player.y + Player.h + move_size > maxHeigth) break
                Player.y += move_size
                break
            case "a":
                if (Player.x - move_size < 0) break
                Player.x -= move_size
                break
            case "d":
                if (Player.x + Player.w + move_size > Math.floor(maxWidth/5*4)) break
                Player.x += move_size
                break
            case "q":
                if (Laser.inuse == false && score > 100 && Laser.created + Laser.duration + Laser.cooldown < Date.now()) {
                    Laser.created = Date.now()
                    Laser.inuse = true
                    score -= 100
                }
        }
    }
    Player.lastMove = Date.now()
}

function shop_view() {
    ctx.font = "30px Arial"
    ctx.fillStyle = "white"
    ctx.strokeStyle = "red"
    ctx.textAlign = "center"
    ctx.fillText("Shop", maxWidth/2, 50)
    ctx.strokeText("Shop", maxWidth/2, 50)
    ctx.font = "20px Arial"
    ctx.fillText("All Upgrades cost "+ Player.upgrade_cost +" Score", maxWidth/2, 80)
    ctx.fillText("All Upgrades add +1%", maxWidth/2, 100)

    ctx.textAlign = "left"
    ctx.font = "30px Arial"
    ctx.fillText("Score: " + Math.floor(score), 10, 40)
    ctx.strokeText("Score: " + Math.floor(score), 10, 40)
}

function game_view() {
    if (Laser.inuse) {
        ctx.drawImage(Laser.img,Laser.x,Laser.y,Laser.w,Laser.h)
    }
    ctx.drawImage(Player.img,Player.x,Player.y,Player.w,Player.h)

    for (const [entity, [entity_obj, entity_arr]] of Object.entries(entities)) {
        for (let i = 0; i < entity_arr.length; i++) {
            const ent = entity_arr[i]
            ctx.drawImage(ent.img,ent.x,ent.y,ent.w,ent.h)
        }
    }

    ctx.font = "30px Arial"
    ctx.textAlign = "left"
    ctx.strokeStyle = "black"
    ctx.strokeText("Score: " + Math.floor(score), 10, 70)
    
    ctx.fillStyle = "black"
    ctx.fillRect(10, 10, 200, 30)
    ctx.fillStyle = "red"
    ctx.fillRect(12, 12, 196 * (Player.health/100), 26)

    ctx.font = "20px Arial"
    ctx.fillStyle = "white"
    ctx.textAlign = "center"
    if (Player.health < 0) Player.health = 0
    const health_text = Math.ceil(Player.health) + "/" + Player.max_health
    ctx.fillText(health_text, 110, 32)

    ctx.textAlign = "right"
    ctx.strokeText("Hiscore: " + hiscore, maxWidth-10, 30)

    ctx.textAlign = "left"
    let cd = Laser.created+Laser.cooldown+Laser.duration-Date.now()
    let cd_text = "Laser CD: "+ Math.ceil(cd/1000) + "s"
    if (cd < 0) cd_text = "Laser Ready"
    if (Laser.inuse) cd_text = "Laser Active"
    if (score < 100) cd_text = "Laser requires 100 score"
    ctx.strokeText(cd_text, 10, maxHeigth-10)

    if (game_over_flag) {
        ctx.drawImage(Boom.img,Player.x-Player.h,Player.y-Player.w/2,Player.w+50,Player.w+50)
        ctx.font = "30px Arial"
        ctx.fillStyle = "red"
        ctx.textAlign = "center"
        ctx.strokeText("Game Over", maxWidth/2, maxHeigth/2)
        ctx.fillText("Game Over", maxWidth/2, maxHeigth/2)

        ctx.font = "20px Arial"
        ctx.fillStyle = "black"
        ctx.textAlign = "center"
        ctx.fillText("Press space to restart", maxWidth/2, maxHeigth/2 + 30)
        return
    }
}

function draw() {
    ctx.clearRect(0,0,maxWidth,maxHeigth)
    let img_ratio = bg_imgs[view].width / bg_imgs[view].height
    ctx.drawImage(bg_imgs[view], 0, 0, maxHeigth*img_ratio, maxHeigth)

    switch (view) {
        case "game":
            game_view()
            break
        case "shop":
            shop_view()
            break
    }

    if (game_over_flag) return
    for (let i = 0; i < Buttons.length; i++) {
        const button = Buttons[i]
        if (button.view != view) continue
        ctx.fillStyle = button.color
        ctx.fillRect(button.x, button.y, button.w, button.h)
        ctx.font = button.text_size + "px Arial"
        ctx.fillStyle = button.text_color
        ctx.textAlign = "center"
        if (!button.sub_text) ctx.fillText(button.text, button.x + button.w/2, button.y + button.h/2 + button.text_size/3)
        else {
            ctx.fillText(button.text, button.x + button.w/2, button.y + button.h/2 - button.text_size/3 + 5)
            ctx.font = button.text_size/3*2 + "px Arial"
            ctx.fillText(button.sub_text, button.x + button.w/2, button.y + button.h/2 + button.text_size/3*2 + 5)
        }
    }

    requestAnimationFrame(draw)
}

function add_score(amount) {
    score += Math.floor(amount*Player.score_multiplier)
}

function logic() {
    current_tick = Date.now()

    if (paused) {
        last_tick = current_tick
        return
    }
    if (Player.health <= 0) {
        game_over()
        return
    }
    if (score>hiscore) hiscore = Math.floor(score)

    input_handler()

    //Player regen
    if (Player.health < Player.max_health) {
        Player.health += Player.regen_rate_ps * (time_between_ticks())
        if (Player.health > Player.max_health) Player.health = Player.max_health
    }

    if (Laser.inuse) {
        Laser.x = Player.x + Player.w + 10
        Laser.y = Player.y + Player.h / 2 - Laser.h /2
        if (Laser.created + Laser.duration < Date.now()) {
            Laser.inuse = false
        }
        for (let i = 0; i < entities["Baddy"][1].length; i++) {
            const baddy = entities["Baddy"][1][i]
            //Laser collision
            if (check_collision(baddy, Laser)) {
                baddy.lives -= Laser.dps * (time_between_ticks())
                if (baddy.lives <= 0) {
                    baddy.die()
                    entities["Baddy"][1].splice(i,1)
                    i--
                }
            }
        }
    }
    for (let i = 0; i < entities["Bullet"][1].length; i++) {
        const bullet = entities["Bullet"][1][i]
        bullet.x += 5
        if (bullet.x > maxWidth) {
            entities["Bullet"][1].splice(i,1)
            i--
        }
        for (let j = 0; j < entities["Baddy"][1].length; j++) {
            const baddy = entities["Baddy"][1][j]
            //Bullet collision
            if (check_collision(baddy, bullet)) {
                entities["Bullet"][1].splice(i,1)
                i--
                baddy.lives -= bullet.dps
                if (baddy.lives <= 0) {
                    baddy.die()             
                    entities["Baddy"][1].splice(j,1)
                    j--
                }
            }
        }
    }

    for (let i = 0; i < entities["Baddy"][1].length; i++) {
        const baddy = entities["Baddy"][1][i]
        //Movement
        baddy.x -= baddy.move_speed * (time_between_ticks())
        //Offscreen check
        if (baddy.x + baddy.w < 0) {
            entities["Baddy"][1].splice(i,1)
            i--
        }
        //Player collision
        if (check_collision(baddy, Player)) {
            Player.health -= baddy.dps * (time_between_ticks())
            baddy.lives -= Player.dps * (time_between_ticks())
            if (baddy.lives <= 0) {
                baddy.die()
                entities["Baddy"][1].splice(i,1)
                i--
            }
        }
    }

    for (let i = 0; i < entities["Boom"][1].length; i++) {
        const boom = entities["Boom"][1][i]
        if (boom.created + 1000 < Date.now()) {
            entities["Boom"][1].splice(i,1)
            i--
        }
    }

    if (last_baddy + next_baddy < Date.now()) {
        spawnBaddy()
        last_baddy = Date.now()
        next_baddy = Math.floor(Math.random() * 2000-500-score*3) + 500
    }
    last_tick = current_tick
}

function keydown_callback(e) {
    pressed_keys[e.key] = true
}

function keyup_callback(e) {
    delete pressed_keys[e.key]
}

function toggle_pause() {
    paused = !paused
}

function shop_callback() {
    view = "shop"
    paused = true
    draw()
}

function exit_shop_callback() {
    view = "game"
    paused = false
    draw()
}

const shop_buttons = {
    "Health": Player.max_health+"HP",
    "Regen": (Math.floor(Player.regen_rate_ps * 100) / 100)+"HP/s",
    "Bullet DMG": Math.floor(Bullet.dps)+"DMG",
    "Speed": (Math.floor(Player.move_speed * 100) / 100)+"px/s",
    "Laser Duration": (Math.floor(Laser.duration*100)/100/1000)+"s",
    "Score Multiplier": (Math.floor(Player.score_multiplier * 100) / 100),
}
function generic_stat_boost_callback() {
    if (score < Player.upgrade_cost) return
    switch(this.text) {
        case "Health":
            Player.max_health *= 1.01
            this.sub_text = Math.floor(Player.max_health)+"HP"
            break
        case "Regen":
            Player.regen_rate_ps *= 1.01
            this.sub_text = (Math.floor(Player.regen_rate_ps * 100) / 100)+"HP/s"
            break
        case "Bullet DMG":
            Bullet.dps *= 1.01
            this.sub_text = Math.floor(Bullet.dps)+"DMG"
            break
        case "Speed":
            Player.move_speed *= 1.01
            this.sub_text = (Math.floor(Player.move_speed * 100) / 100)+"px/s"
            break
        case "Laser Duration":
            Laser.duration *= 1.01
            this.sub_text = (Math.floor(Laser.duration/1000*100)/100)+"s"
            break
        case "Score Multiplier":
            Player.score_multiplier *= 1.01
            this.sub_text = (Math.floor(Player.score_multiplier * 100) / 100)
            break
    }
    score -= Player.upgrade_cost
    Player.upgrade_cost = Math.ceil(Player.upgrade_cost * 1.1)
}

function setup_buttons() {
    const shop_btn = Object.assign({}, Button)
    shop_btn.x = maxWidth - shop_btn.w - 10
    shop_btn.y = maxHeigth - shop_btn.h - 10
    shop_btn.text = "Shop"
    shop_btn.view = "game"
    shop_btn.callback = shop_callback
    Buttons.push(shop_btn)

    const exit_shop_btn = Object.assign({}, Button)
    exit_shop_btn.x = maxWidth - shop_btn.w - 10
    exit_shop_btn.y = maxHeigth - shop_btn.h - 10
    exit_shop_btn.text = "Exit"
    exit_shop_btn.view = "shop"
    exit_shop_btn.callback = exit_shop_callback
    Buttons.push(exit_shop_btn)

    const button_offset = 10
    const cols = 3
    const rows = 2
    const btn_w = 200
    const btn_h = 50
    const w = button_offset*(cols-1)+btn_w*cols
    const h = button_offset*(rows-1)+btn_h*rows

    const x = maxWidth/2-w/2
    const y = maxHeigth/2-h/2

    let i = 0
    for (const [button_text, button_subtext] of Object.entries(shop_buttons)) {
        const button = Object.assign({}, Button)
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
        Buttons.push(button)
        i++
    }
}

function main() {
    document.addEventListener("keyup", keyup_callback)
    document.addEventListener("keydown", keydown_callback)
    document.addEventListener("click", mouse_input_handler)

    canvas = document.getElementById("game")
    ctx = canvas.getContext("2d")
    maxWidth = ctx.canvas.width
    maxHeigth = ctx.canvas.height

    setup_buttons()

    draw()
    logic_cycle = setInterval(logic, 1000/60)
}
window.main = main