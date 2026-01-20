use bevy::prelude::*;

#[derive(Resource)]
pub struct GameState {
    pub score: f32,
    pub hiscore: f32,
    pub paused: bool,
    pub game_over: bool,
}

impl Default for GameState {
    fn default() -> Self {
        Self {
            score: 0.0,
            hiscore: 0.0,
            paused: false,
            game_over: false,
        }
    }
}

#[derive(Resource)]
pub struct WaveState {
    pub next_baddy: f32,
}

impl Default for WaveState {
    fn default() -> Self {
        Self {
            next_baddy: 2.0,
        }
    }
}