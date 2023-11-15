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
let Baddies = []

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
let Bullets = []

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
let Booms = []

let pressed_keys = {}

let canvas
let ctx
let maxWidth
let maxHeigth

let last_baddy = 0
let next_baddy = 0

let hiscore = 0
let score = 0

let logic_cycle
let game_over_flag = false

let current_tick = Date.now()
let last_tick = Date.now()

let cookies = document.getElementById("cookies")
if (cookies) {
    cookies = cookies.split(";")
    if (cookies[0]) hiscore = cookies[0]
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
    Booms = []
    Baddies = []
    Bullets = []
    Laser.inuse = false
}

function spawnBaddy() {
    const baddy = Object.assign({}, Baddy)
    baddy.w = baddy.w * ((Math.random())+0.8)
    baddy.h = baddy.w
    baddy.x = maxWidth - baddy.w
    baddy.y = Math.floor(Math.random() * (maxHeigth - baddy.h))
    Baddies.push(baddy)
}

function spawnBoom(x,y,w,h) {
    boom = Object.assign({}, Boom)
    boom.x = x
    boom.y = y
    boom.w = w
    boom.h = h
    boom.created = Date.now()
    Booms.push(boom)
}

function check_collision(entity1, entity2) {
    if (entity1.x < entity2.x + entity2.w && entity1.x + entity1.w > entity2.x && entity1.y < entity2.y + entity2.h && entity1.y + entity1.h > entity2.y) {
        return true
    }
    return false
}

function logic() {
    current_tick = Date.now()
    input_handler()
    if (score>hiscore) hiscore = score
    if (score < 0) {
        game_over()
        return
    }
    if (Laser.inuse) {
        Laser.x = Player.x + Player.w + 10
        Laser.y = Player.y + Player.h / 2 - Laser.h /2
        if (Laser.created + Laser.duration < Date.now()) {
            Laser.inuse = false
        }
        for (let i = 0; i < Baddies.length; i++) {
            const baddy = Baddies[i]
            if (check_collision(baddy, Laser)) {
                Baddies.splice(i,1)
                i--
                boom = Object.assign({}, Boom)
                boom.x = baddy.x
                boom.y = baddy.y
                boom.created = Date.now()
                Booms.push(boom)
                score += 10
            }
        }
    }
    for (let i = 0; i < Bullets.length; i++) {
        const bullet = Bullets[i]
        bullet.x += 5
        if (bullet.x > maxWidth) {
            Bullets.splice(i,1)
            i--
        }
        for (let j = 0; j < Baddies.length; j++) {
            const baddy = Baddies[j]
            if (check_collision(baddy, bullet)) {
                Bullets.splice(i,1)
                i--
                Baddies.splice(j,1)
                j--
                wh = baddy.w * (Boom.w/Baddy.w)
                spawnBoom(baddy.x, baddy.y, wh, wh)
                score += 10
            }
        }
    }

    for (let i = 0; i < Baddies.length; i++) {
        const baddy = Baddies[i]
        //Movement
        baddy.x -= baddy.move_speed * ((current_tick-last_tick)/1000)
        //Offscreen check
        if (baddy.x < 0) {
            Baddies.splice(i,1)
            i--
        }
        if (check_collision(baddy, Player)) {
            score -= 100
            Baddies.splice(i,1)
            boom = Object.assign({}, Boom)
            boom.x = baddy.x
            boom.y = baddy.y
            
            boom.created = Date.now()
            Booms.push(boom)
            i--
        }
    }

    for (let i = 0; i < Booms.length; i++) {
        const boom = Booms[i]
        if (boom.created + 1000 < Date.now()) {
            Booms.splice(i,1)
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

function draw() {
    ctx.clearRect(0,0,maxWidth,maxHeigth)
    if (Laser.inuse) {
        ctx.drawImage(Laser.img,Laser.x,Laser.y,Laser.w,Laser.h)
    }
    ctx.drawImage(Player.img,Player.x,Player.y,Player.w,Player.h)

    for (let i = 0; i < Bullets.length; i++) {
        const bullet = Bullets[i]
        ctx.drawImage(bullet.img,bullet.x,bullet.y,bullet.w,bullet.h)
    }

    for (let i = 0; i < Baddies.length; i++) {
        const baddy = Baddies[i]
        ctx.drawImage(baddy.img,baddy.x,baddy.y,baddy.w,baddy.h)
    }

    for (let i = 0; i < Booms.length; i++) {
        const boom = Booms[i]
        ctx.drawImage(boom.img,boom.x,boom.y,boom.w,boom.h)
    }

    ctx.font = "30px Arial"
    ctx.textAlign = "left"
    ctx.strokeText("Score: " + score, 10, 30)

    ctx.textAlign = "right"
    ctx.strokeText("Hiscore: " + hiscore, maxWidth-10, 30)

    ctx.textAlign = "left"
    let cooldown = Laser.created+Laser.cooldown-Date.now()
    if (cooldown < 0) cooldown = 0
    cooldown = Math.ceil(cooldown/1000)
    ctx.strokeText("Laser CD: "+cooldown+"s", 10, maxHeigth-10)

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

    requestAnimationFrame(draw)
}

function input_handler() {
    if (game_over_flag) return
    for (const [key] of Object.entries(pressed_keys)) {
        move_size = Player.move_speed * ((current_tick-last_tick)/1000)
        switch (key.toLowerCase()) {
            case " ":
                if (Player.lastShoot + Player.shoot_delay > Date.now()) return
                bullet = Object.assign({}, Bullet)
                bullet.x = Player.x + Player.w + 5
                bullet.y = Player.y + Player.h/2 - bullet.h/2
                Bullets.push(bullet)
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
                if (Laser.inuse == false && score > 100) {
                    Laser.created = Date.now()
                    Laser.inuse = true
                    score -= 100
                }
        }
    }
    Player.lastMove = Date.now()
}

function keydown_callback(e) {
    pressed_keys[e.key] = true
}

function keyup_callback(e) {
    delete pressed_keys[e.key]
}

function main() {
    document.addEventListener("keyup", keyup_callback)
    document.addEventListener("keydown", keydown_callback)

    canvas = document.getElementById("game")
    ctx = canvas.getContext("2d")
    maxWidth = ctx.canvas.width
    maxHeigth = ctx.canvas.height
    draw()
    logic_cycle = setInterval(logic, 1000/60)
}
