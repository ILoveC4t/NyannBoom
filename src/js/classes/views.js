class Button {
    text = ""
    sub_text = null
    text_size = 30
    text_color = "white"
    color = "red"

    w=90
    h=30

    constructor(gd, x, y, w, h) {
        this.gd = gd
        this.x = x
        this.y = y
        this.w = w || this.w
        this.h = h || this.h
    }
}

class View {
    id = this.constructor.name;

    bg_img = new Image()
    buttons = []
    
    constructor(gd) {
        this.gd = gd
    }

    draw() {
        this.gd.ctx.clearRect(0,0,this.gd.maxWidth,this.gd.maxHeigth)
        const ratio = this.bg_img.width/this.bg_img.height
        this.gd.ctx.drawImage(this.bg_img,0,0,this.gd.maxHeigth*ratio,this.gd.maxHeigth)
    }

    _draw_buttons() {
        for (let i = 0; i < this.buttons.length; i++) {
            const button = this.buttons[i]
            this.gd.ctx.fillStyle = button.color
            this.gd.ctx.fillRect(button.x, button.y, button.w, button.h)
            this.gd.ctx.font = button.text_size + "px Arial"
            this.gd.ctx.fillStyle = button.text_color
            this.gd.ctx.textAlign = "center"
            if (!button.sub_text) this.gd.ctx.fillText(button.text, button.x + button.w/2, button.y + button.h/2 + button.text_size/3)
            else {
                this.gd.ctx.fillText(button.text, button.x + button.w/2, button.y + button.h/2 - button.text_size/3 + 5)
                this.gd.ctx.font = button.text_size/3*2 + "px Arial"
                this.gd.ctx.fillText(button.sub_text, button.x + button.w/2, button.y + button.h/2 + button.text_size/3*2 + 5)
            }
        }
    }
}

module.exports = { Button, View }