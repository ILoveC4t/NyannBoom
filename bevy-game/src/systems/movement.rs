use bevy::prelude::*;
use crate::components::*;

pub fn player_input_system(
    keyboard_input: Res<Input<KeyCode>>,
    mut query: Query<&mut Velocity, With<Player>>,
    time: Res<Time>,
) {
    for mut velocity in query.iter_mut() {
        let mut x = 0.0;
        let mut y = 0.0;

        if keyboard_input.pressed(KeyCode::Left) || keyboard_input.pressed(KeyCode::A) {
            x -= 1.0;
        }
        if keyboard_input.pressed(KeyCode::Right) || keyboard_input.pressed(KeyCode::D) {
            x += 1.0;
        }
        if keyboard_input.pressed(KeyCode::Up) || keyboard_input.pressed(KeyCode::W) {
            y += 1.0;
        }
        if keyboard_input.pressed(KeyCode::Down) || keyboard_input.pressed(KeyCode::S) {
            y -= 1.0;
        }

        if x != 0.0 || y != 0.0 {
            velocity.angle = (y as f32).atan2(x as f32);
        } else {
            velocity.angle = -1.0; // No movement
        }
    }
}

pub fn movement_system(
    mut query: Query<(&mut Transform, &Velocity)>,
    time: Res<Time>,
    windows: Query<&Window>,
) {
    let window = windows.single();
    let width = window.width() * 0.8; // 4/5 of canvas width like JS version
    let height = window.height();
    
    for (mut transform, velocity) in query.iter_mut() {
        if velocity.angle == -1.0 {
            continue;
        }

        let x_offset = velocity.speed * time.delta_seconds() * velocity.angle.cos();
        let y_offset = velocity.speed * time.delta_seconds() * velocity.angle.sin();

        let new_x = transform.translation.x + x_offset;
        let new_y = transform.translation.y + y_offset;

        // Keep within bounds
        if new_x >= -width / 2.0 && new_x <= width / 2.0 {
            transform.translation.x = new_x;
        }
        if new_y >= -height / 2.0 && new_y <= height / 2.0 {
            transform.translation.y = new_y;
        }
    }
}

pub fn health_regen_system(
    mut query: Query<&mut Health>,
    time: Res<Time>,
) {
    for mut health in query.iter_mut() {
        if health.current < health.max {
            health.current += health.regen_rate_ps * time.delta_seconds();
            health.current = health.current.min(health.max);
        }
    }
}