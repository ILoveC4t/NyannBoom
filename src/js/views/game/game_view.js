const { View } = require("../../classes/views.js")
const { ShopButton } = require("./buttons.js")

class GameView extends View {
    bg_img_src = "assets/game_bg.png"

    constructor(gd) {
        super(gd)
        this.bg_img.src = this.bg_img_src

        const enter_shop_btn = new ShopButton(gd, this.gd.maxWidth, this.gd.maxHeight)
        enter_shop_btn.x = this.gd.maxWidth-enter_shop_btn.w-10
        enter_shop_btn.y = this.gd.maxHeight-enter_shop_btn.h-10
        this.buttons.push(enter_shop_btn)
    }

    draw() {
        super.draw()
        if (this.gd.laser.inuse) {
            this.gd.ctx.drawImage(this.gd.laser.img,this.gd.laser.x,this.gd.laser.y,this.gd.laser.w,this.gd.laser.h)
        }
        this.gd.ctx.drawImage(this.gd.player.img,this.gd.player.x,this.gd.player.y,this.gd.player.w,this.gd.player.h)

        for (const [entity, entity_arr] of Object.entries(this.gd.entities)) {
            for (let i = 0; i < entity_arr.length; i++) {
                const ent = entity_arr[i]
                this.gd.ctx.drawImage(ent.img,ent.x,ent.y,ent.w,ent.h)
            }
        }

        this.gd.ctx.font = "30px Arial"
        this.gd.ctx.textAlign = "left"
        this.gd.ctx.strokeStyle = "black"
        this.gd.ctx.strokeText("Score: " + Math.floor(this.gd.score), 10, 70)
        
        this.gd.ctx.fillStyle = "black"
        this.gd.ctx.fillRect(10, 10, 200, 30)
        this.gd.ctx.fillStyle = "red"
        this.gd.ctx.fillRect(12, 12, 196 * (this.gd.player.health/100), 26)

        this.gd.ctx.font = "20px Arial"
        this.gd.ctx.fillStyle = "white"
        this.gd.ctx.textAlign = "center"
        if (this.gd.player.health < 0) this.gd.player.health = 0
        const health_text = Math.ceil(this.gd.player.health) + "/" + this.gd.player.max_health
        this.gd.ctx.fillText(health_text, 110, 32)

        this.gd.ctx.textAlign = "right"
        this.gd.ctx.strokeText("Hiscore: " + this.gd.hiscore, this.gd.maxWidth-10, 30)

        this.gd.ctx.textAlign = "left"
        let cd = this.gd.laser.last_shot+this.gd.laser.cooldown+this.gd.laser.duration-Date.now()
        let cd_text = "laser CD: "+ Math.ceil(cd/1000) + "s"
        if (cd < 0) cd_text = "laser Ready"
        if (this.gd.laser.inuse) cd_text = "laser Active"
        if (this.gd.score < 100) cd_text = "laser requires 100 score"
        this.gd.ctx.strokeText(cd_text, 10, this.gd.maxHeight-10)

        if (this.gd.game_over_flag) {
            this.gd.ctx.font = "30px Arial"
            this.gd.ctx.fillStyle = "red"
            this.gd.ctx.textAlign = "center"
            this.gd.ctx.strokeText("Game Over", this.gd.maxWidth/2, this.gd.maxHeight/2)
            this.gd.ctx.fillText("Game Over", this.gd.maxWidth/2, this.gd.maxHeight/2)

            this.gd.ctx.font = "20px Arial"
            this.gd.ctx.fillStyle = "black"
            this.gd.ctx.textAlign = "center"
            this.gd.ctx.fillText("Press space to restart", this.gd.maxWidth/2, this.gd.maxHeight/2 + 30)
            return
        }

        this._draw_buttons()
    }
}

module.exports = GameView