class InputHandler {
    constructor(gd) {
        this.gd = gd
        this.pressed_keys = {}
    }

    mouse_position(e, _this) {
        let rect = _this.gd.canvas.getBoundingClientRect()
        let x = e.clientX - rect.left
        let y = e.clientY - rect.top
        return [x,y]
    }

    click_callback(e, _this) {
        if (_this.gd.game_over_flag) return
        if (_this.gd.last_click + 100 > Date.now()) return
        let [x,y] = _this.mouse_position(e, _this)
        const buttons = _this.gd.views[_this.gd.view].buttons
        for (let i = 0; i < buttons.length; i++) {
            const button = buttons[i]
            if (x > button.x && x < button.x + button.w && y > button.y && y < button.y + button.h) {
                button.callback()
                _this.gd.last_click = Date.now()
                return
            }
        }
    }

    death_keydown_callback(e, _this) {
        if (e.key == " ") {
            document.removeEventListener("keydown", this._keydown)
            _this.gd.restart()
        }
    }

    game_keydown_callback(e, _this) {
        _this.pressed_keys[e.key] = true
    }
    
    game_keyup_callback(e, _this) {
        delete _this.pressed_keys[e.key]
    }

    check() {
        let move_angle = 0
        
        let move_x = 0
        let move_y = 0
        for (const key in this.pressed_keys) {
            switch (key) {
                case "w":
                    move_y -= 1
                    break
                case "s":
                    move_y += 1
                    break
                case "a":
                    move_x -= 1
                    break
                case "d":
                    move_x += 1
                    break
                case "q":
                    this.gd.player.laser()
                    break
                case " ":
                    this.gd.player.shoot()
                    break
            }
        }
        if (move_x == 0 && move_y == 0) {
            move_angle = -1
        } else {
            move_angle = Math.atan2(move_y, move_x) * 180 / Math.PI
        }
        this.gd.player.move_angle = move_angle
        this.gd.player.move()
    }

    register() {
        const _this = this
        this._keydown = function (e) { _this.game_keydown_callback(e, _this) }
        this._keyup = function (e) { _this.game_keyup_callback(e, _this) }
        this._click = function (e) { _this.click_callback(e, _this) }
        document.addEventListener("keydown", this._keydown)
        document.addEventListener("keyup", this._keyup)
        document.addEventListener("click", this._click)
    }

    unregister() {
        const _this = this
        this._keydown = function (e) { _this.death_keydown_callback(e, _this) }
        document.addEventListener("keydown", this._keydown)
    }
}

module.exports = InputHandler