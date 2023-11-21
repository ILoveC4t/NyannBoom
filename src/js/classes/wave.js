class Wave {
    probabilities = []
    constructor(duration, spawn_delay, probabilities) {
        this.duration = duration
        this.spawn_delay = spawn_delay
        for (const [key, value] of Object.entries(probabilities)) {
            this.probabilities.push([key, value])
        }
        this.probabilities.sort((a,b) => b[1] - a[1])
        for (let i = 1; i < this.probabilities.length; i++) {
            this.probabilities[i][1] += this.probabilities[i-1][1]
        }
    }
}
class WaveHandler {
    _wave = 0
    wave_start = Date.now()
    waves = []
    last_spawn = Date.now()
    constructor(gd) {
        this.gd = gd
        this.setup_waves()
    }
    spawned = 0
    tick() {
        if (this.wave_start + this.waves[this._wave].duration < Date.now()) {
            if (this._wave < this.waves.length-1) this._wave++
            this.wave_start = Date.now()
        }
        if (this.last_spawn + this.waves[this._wave].spawn_delay < Date.now()) {
            this.spawn()
            this.last_spawn = Date.now()
        }
    }

    setup_waves() {
        this.waves.push(new Wave(10000, 2000, {Baddy: 1}))
        this.waves.push(new Wave(10000, 1700, {Baddy: 0.95, HomingBaddy: 0.05}))
        this.waves.push(new Wave(10000, 1400, {Baddy: 0.9, HomingBaddy: 0.1}))
        this.waves.push(new Wave(10000, 1100, {Baddy: 0.8, HomingBaddy: 0.2}))
        this.waves.push(new Wave(10000, 800, {Baddy: 0.7, HomingBaddy: 0.3}))
        this.waves.push(new Wave(10000, 500, {Baddy: 0.6, HomingBaddy: 0.4}))
    }

    spawn() {
        const wave = this.waves[this._wave]
        const r = Math.random()
        let entity = null
        for (let i = 0; i < wave.probabilities.length; i++) {
            if (r < wave.probabilities[i][1]) {
                entity = wave.probabilities[i][0]
                break
            }
        }
        const new_entity = new this.gd.enemies[entity](this.gd)
        new_entity.x = this.gd.maxWidth
        new_entity.y = Math.random() * (this.gd.maxHeight - new_entity.h)
        this.gd.entities[entity].push(new_entity)
    }
}

module.exports = WaveHandler