// This file contains the movement system for handling entity movement logic in the Bevy game engine.

use bevy::prelude::*;

pub struct Velocity {
    pub x: f32,
    pub y: f32,
}

pub struct Player;

pub fn movement_system(
    keyboard_input: Res<Input<KeyCode>>,
    mut query: Query<(&Player, &mut Velocity)>,
) {
    for (_, mut velocity) in query.iter_mut() {
        velocity.x = 0.0;
        velocity.y = 0.0;

        if keyboard_input.pressed(KeyCode::Left) {
            velocity.x -= 1.0;
        }
        if keyboard_input.pressed(KeyCode::Right) {
            velocity.x += 1.0;
        }
        if keyboard_input.pressed(KeyCode::Up) {
            velocity.y += 1.0;
        }
        if keyboard_input.pressed(KeyCode::Down) {
            velocity.y -= 1.0;
        }
    }
}