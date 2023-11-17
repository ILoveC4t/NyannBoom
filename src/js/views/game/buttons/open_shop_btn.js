const { Button } = require("../../../classes/views.js")

class ShopButton extends Button {
    text_size = 20
    color = "green"
    text_color = "white"
    text = "Shop"
    sub_text = null
    callback = function() {
        this.gd.paused = true
        this.gd.view = "shop"
    }
}

module.exports = ShopButton