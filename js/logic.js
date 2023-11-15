const game_bg_img = new Image()
game_bg_img.src = "assets/game_bg.png"

const shop_bg_img = new Image()
shop_bg_img.src = "assets/shop_bg.png"
shop_bg_img.style.filter = "blur(8000Px)"

const Player = {
    w: 90,
    h: 30,
    x: 10,
    y: 240,
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
    img: new Image(),
    src: "assets/laser.png",
    created: 0,
    inuse: false,
}
Laser.img.src = Laser.src

const Baddy = {
    w: 30,
    h: 30,
    x: 0,
    y: 0,
    move_speed: 100,
    img: new Image(),
    src: "assets/baddy.png",
    lastMove: 0,
}
Baddy.img.src = Baddy.src

const Bullet = {
    w: 40,
    h: 20,
    x: 0,
    y: 0,
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
    color : "red",
    text_color: "white",
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
            console.log("Clicked button: " + button.text)
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
        Player.y = maxHeigth/2
        Player.x = 10
        score = 0
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
    const baddy = Object.assign({}, Baddy)
    baddy.w = baddy.w * ((Math.random())+0.8)
    baddy.h = baddy.w
    baddy.x = maxWidth - baddy.w
    baddy.y = Math.floor(Math.random() * (maxHeigth - baddy.h))
    baddy.move_speed = baddy.move_speed * ((Math.random())+0.5)
    entities["Baddy"][1].push(baddy)
}

function spawnBoom(x,y,w,h) {
    boom = Object.assign({}, Boom)
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
        move_size = Player.move_speed * ((current_tick-last_tick)/1000)
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
    ctx.strokeText("Score: " + score, 10, 30)

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

    for (let i = 0; i < Buttons.length; i++) {
        const button = Buttons[i]
        if (button.view != view) continue
        ctx.fillStyle = button.color
        ctx.fillRect(button.x, button.y, button.w, button.h)
        ctx.font = "30px Arial"
        ctx.fillStyle = button.text_color
        ctx.textAlign = "center"
        ctx.fillText(button.text, button.x + button.w/2, button.y + button.h/2 + 10)
    }

    requestAnimationFrame(draw)
}

function logic() {
    current_tick = Date.now()

    if (paused) {
        last_tick = current_tick
        return
    }
    if (score < 0) {
        game_over()
        return
    }
    if (score>hiscore) hiscore = score

    input_handler()

    if (Laser.inuse) {
        Laser.x = Player.x + Player.w + 10
        Laser.y = Player.y + Player.h / 2 - Laser.h /2
        if (Laser.created + Laser.duration < Date.now()) {
            Laser.inuse = false
        }
        for (let i = 0; i < entities["Baddy"][1].length; i++) {
            const baddy = entities["Baddy"][1][i]
            if (check_collision(baddy, Laser)) {
                entities["Baddy"][1].splice(i,1)
                i--
                boom = Object.assign({}, Boom)
                boom.x = baddy.x
                boom.y = baddy.y
                boom.created = Date.now()
                entities["Boom"][1].push(boom)
                score += 10
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
            if (check_collision(baddy, bullet)) {
                entities["Bullet"][1].splice(i,1)
                i--
                entities["Baddy"][1].splice(j,1)
                j--
                wh = baddy.w * (Boom.w/Baddy.w)
                spawnBoom(baddy.x, baddy.y, wh, wh)
                score += 10
            }
        }
    }

    for (let i = 0; i < entities["Baddy"][1].length; i++) {
        const baddy = entities["Baddy"][1][i]
        //Movement
        baddy.x -= baddy.move_speed * ((current_tick-last_tick)/1000)
        //Offscreen check
        if (baddy.x < 0) {
            entities["Baddy"][1].splice(i,1)
            i--
        }
        if (check_collision(baddy, Player)) {
            score -= 100
            entities["Baddy"][1].splice(i,1)
            boom = Object.assign({}, Boom)
            boom.x = baddy.x
            boom.y = baddy.y
            
            boom.created = Date.now()
            entities["Boom"][1].push(boom)
            i--
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
