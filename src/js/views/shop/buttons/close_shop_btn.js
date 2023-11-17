const { Button } = require("../../../classes/views.js")

class ExitButton extends Button {
    text_size = 20
    color = "green"
    text_color = "white"
    text = "Close"
    sub_text = null
    callback = function() {
        this.gd.view = "game"
        this.gd.paused = false
    }
}

module.exports = ExitButton