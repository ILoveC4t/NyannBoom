const { View } = require("../../classes/views.js")
const { ExitButton } = require("./buttons.js")

class ShopView extends View {
    bg_img_src = "assets/shop_bg.png"

    constructor(gd) {
        super(gd)
        this.bg_img.src = this.bg_img_src

        const exit_btn = new ExitButton(gd)
        exit_btn.x = this.gd.maxWidth - exit_btn.w - 10
        exit_btn.y = this.gd.maxHeight - exit_btn.h - 10
        this.buttons.push(exit_btn)
    }

    draw() {
        super.draw()
        this.gd.ctx.font = "30px Arial"
        this.gd.ctx.fillStyle = "white"
        this.gd.ctx.strokeStyle = "red"
        this.gd.ctx.textAlign = "center"
        this.gd.ctx.fillText("Shop", this.gd.maxWidth/2, 50)
        this.gd.ctx.strokeText("Shop", this.gd.maxWidth/2, 50)
        this.gd.ctx.font = "20px Arial"
        this.gd.ctx.fillText("All Upgrades cost "+ this.gd.player.upgrade_cost +" Score", this.gd.maxWidth/2, 80)
        this.gd.ctx.fillText("All Upgrades add +1%", this.gd.maxWidth/2, 100)

        this.gd.ctx.textAlign = "left"
        this.gd.ctx.font = "30px Arial"
        this.gd.ctx.fillText("Score: " + Math.floor(this.gd.score), 10, 40)
        this.gd.ctx.strokeText("Score: " + Math.floor(this.gd.score), 10, 40)

        this._draw_buttons()
    }
}

module.exports = ShopView