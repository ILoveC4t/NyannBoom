const Player = {
    w: 90,
    h: 30,
    x: 10,
    y: 240,
    shoot_delay: 1000,
    move_delay: 5,
    __move_size: 10,
    img: new Image(),
    src: "/assets/nyan.png",
    lastMove: 0,
    lastShoot: 0,
}
Player.img.src = Player.src

const Baddy = {
    w: 30,
    h: 30,
    x: 0,
    y: 0,
    img: new Image(),
    src: "/assets/baddy.png",
    lastMove: 0,
}
Baddy.img.src = Baddy.src
const Baddies = []

const Bullet = {
    w: 40,
    h: 20,
    x: 0,
    y: 0,
    img: new Image(),
    src: "/assets/bullet.png",
    lastMove: 0,
}
Bullet.img.src = Bullet.src
const Bullets = []

const Boom = {
    w: 50,
    h: 50,
    x: 0,
    y: 0,
    img: new Image(),
    src: "/assets/boom.png",
    created: 0,
}
Boom.img.src = Boom.src
const Booms = []

let canvas
let ctx
let maxWidth
let maxHeigth

let last_baddy = 0
let next_baddy = 0

let score = 0

let logic_cycle
let game_over_flag = false

function game_over_input_handler(e) {
    if (e.key == " ") {
        location.reload()
    }
}

function game_over() {
    clearInterval(logic_cycle)
    document.removeEventListener("keydown", input_handler)
    document.addEventListener("keydown", game_over_input_handler)
    game_over_flag = true
}

function spawnBaddy() {
    const baddy = Object.assign({}, Baddy)
    baddy.x = maxWidth - baddy.w
    baddy.y = Math.floor(Math.random() * (maxHeigth - baddy.h))
    Baddies.push(baddy)
}


function logic() {
    if (score < 0) game_over()
    for (let i = 0; i < Bullets.length; i++) {
        const bullet = Bullets[i]
        bullet.x += 5
        if (bullet.x > maxWidth) {
            Bullets.splice(i,1)
            i--
        }
        for (let j = 0; j < Baddies.length; j++) {
            const baddy = Baddies[j]
            if (baddy.x < bullet.x + bullet.w && baddy.x + baddy.w > bullet.x && baddy.y < bullet.y + bullet.h && baddy.y + baddy.h > bullet.y) {
                Bullets.splice(i,1)
                i--
                Baddies.splice(j,1)
                j--
                boom = Object.assign({}, Boom)
                boom.x = baddy.x
                boom.y = baddy.y
                boom.created = Date.now()
                Booms.push(boom)
                score += 10
            }
        }
    }

    for (let i = 0; i < Baddies.length; i++) {
        const baddy = Baddies[i]
        baddy.x -= 2
        if (baddy.x < 0) {
            Baddies.splice(i,1)
            i--
        }
        if (baddy.x < Player.x + Player.w && baddy.x + baddy.w > Player.x && baddy.y < Player.y + Player.h && baddy.y + baddy.h > Player.y) {
            score -= 100
            Baddies.splice(i,1)
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
        next_baddy = Math.floor(Math.random() * 2000-500-Math.floor(score)) + 500
    }
}

function draw() {
    ctx.clearRect(0,0,maxWidth,maxHeigth)
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
    }

    requestAnimationFrame(draw)
}

function input_handler(e) {
    if (e.key == " ") {
        if (Player.lastShoot + Player.shoot_delay > Date.now()) return
        bullet = Object.assign({}, Bullet)
        bullet.x = Player.x + Player.w + 5
        bullet.y = Player.y + Player.h/2 - bullet.h/2
        Bullets.push(bullet)
        Player.lastShoot = Date.now()
    }
    if (Player.lastMove + Player.move_delay > Date.now()) return
    switch(e.key) {
        case "ArrowUp":
            if (Player.y - Player.__move_size < 0) return
            Player.y -= Player.__move_size
            break
        case "ArrowDown":
            if (Player.y + Player.h + Player.__move_size > maxHeigth) return
            Player.y += Player.__move_size
            break
        case "ArrowLeft":
            if (Player.x - Player.__move_size < 0) return
            Player.x -= Player.__move_size
            break
        case "ArrowRight":
            if (Player.x + Player.w + Player.__move_size > Math.floor(maxWidth/2)) return
            Player.x += Player.__move_size
            break
    }
    Player.lastMove = Date.now()
}

function main() {
    document.addEventListener("keydown", input_handler)

    canvas = document.getElementById("game")
    ctx = canvas.getContext("2d")
    maxWidth = ctx.canvas.width
    maxHeigth = ctx.canvas.height
    draw()
    logic_cycle = setInterval(logic, 1000/60)
}