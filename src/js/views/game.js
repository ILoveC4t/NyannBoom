const bg_img = new Image()
bg_img.src = "assets/game_bg.png"

function render(gd) {
    if (gd.laser.inuse) {
        gd.ctx.drawImage(gd.laser.img,gd.laser.x,gd.laser.y,gd.laser.w,gd.laser.h)
    }
    gd.ctx.drawImage(gd.player.img,gd.player.x,gd.player.y,gd.player.w,gd.player.h)

    for (const [entity, entity_arr] of Object.entries(gd.entities)) {
        for (let i = 0; i < entity_arr.length; i++) {
            const ent = entity_arr[i]
            gd.ctx.drawImage(ent.img,ent.x,ent.y,ent.w,ent.h)
        }
    }

    gd.ctx.font = "30px Arial"
    gd.ctx.textAlign = "left"
    gd.ctx.strokeStyle = "black"
    gd.ctx.strokeText("Score: " + Math.floor(gd.score), 10, 70)
    
    gd.ctx.fillStyle = "black"
    gd.ctx.fillRect(10, 10, 200, 30)
    gd.ctx.fillStyle = "red"
    gd.ctx.fillRect(12, 12, 196 * (gd.player.health/100), 26)

    gd.ctx.font = "20px Arial"
    gd.ctx.fillStyle = "white"
    gd.ctx.textAlign = "center"
    if (gd.player.health < 0) gd.player.health = 0
    const health_text = Math.ceil(gd.player.health) + "/" + gd.player.max_health
    gd.ctx.fillText(health_text, 110, 32)

    gd.ctx.textAlign = "right"
    gd.ctx.strokeText("Hiscore: " + gd.hiscore, gd.maxWidth-10, 30)

    gd.ctx.textAlign = "left"
    let cd = gd.laser.created+gd.laser.cooldown+gd.laser.duration-Date.now()
    let cd_text = "laser CD: "+ Math.ceil(cd/1000) + "s"
    if (cd < 0) cd_text = "laser Ready"
    if (gd.laser.inuse) cd_text = "laser Active"
    if (gd.score < 100) cd_text = "laser requires 100 score"
    gd.ctx.strokeText(cd_text, 10, gd.maxHeigth-10)

    if (gd.game_over_flag) {
        gd.ctx.drawImage(gd.Boom.img,gd.player.x-gd.player.h,gd.player.y-gd.player.w/2,gd.player.w+50,gd.player.w+50)
        gd.ctx.font = "30px Arial"
        gd.ctx.fillStyle = "red"
        gd.ctx.textAlign = "center"
        gd.ctx.strokeText("Game Over", gd.maxWidth/2, gd.maxHeigth/2)
        gd.ctx.fillText("Game Over", gd.maxWidth/2, gd.maxHeigth/2)

        gd.ctx.font = "20px Arial"
        gd.ctx.fillStyle = "black"
        gd.ctx.textAlign = "center"
        gd.ctx.fillText("Press space to restart", gd.maxWidth/2, gd.maxHeigth/2 + 30)
        return
    }
}

module.exports = { render, bg_img }