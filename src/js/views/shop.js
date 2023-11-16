const bg_img = new Image()
bg_img.src = "assets/shop_bg.png"

function render(gd) {
    gd.ctx.font = "30px Arial"
    gd.ctx.fillStyle = "white"
    gd.ctx.strokeStyle = "red"
    gd.ctx.textAlign = "center"
    gd.ctx.fillText("Shop", gd.maxWidth/2, 50)
    gd.ctx.strokeText("Shop", gd.maxWidth/2, 50)
    gd.ctx.font = "20px Arial"
    gd.ctx.fillText("All Upgrades cost "+ gd.Player.upgrade_cost +" Score", gd.maxWidth/2, 80)
    gd.ctx.fillText("All Upgrades add +1%", gd.maxWidth/2, 100)

    gd.ctx.textAlign = "left"
    gd.ctx.font = "30px Arial"
    gd.ctx.fillText("Score: " + Math.floor(score), 10, 40)
    gd.ctx.strokeText("Score: " + Math.floor(score), 10, 40)
}

module.exports = { render, bg_img }
