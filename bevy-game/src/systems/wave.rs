use bevy::prelude::*;
use crate::components::*;
use crate::resources::WaveState;
use rand::Rng;

pub fn wave_handler_system(
    mut commands: Commands,
    mut wave_state: ResMut<WaveState>,
    time: Res<Time>,
    windows: Query<&Window>,
) {
    wave_state.next_baddy -= time.delta_seconds();
    
    if wave_state.next_baddy <= 0.0 {
        let window = windows.single();
        let mut rng = rand::thread_rng();
        
        // Randomly spawn Baddy or HomingBaddy
        if rng.gen_bool(0.7) {
            spawn_baddy(&mut commands, window, &time);
        } else {
            spawn_homing_baddy(&mut commands, window, &time);
        }
        
        wave_state.next_baddy = rng.gen_range(0.5..2.0);
    }
}

fn spawn_baddy(commands: &mut Commands, window: &Window, time: &Time) {
    let y = rand::thread_rng().gen_range(-window.height() / 2.0..window.height() / 2.0);
    
    commands.spawn((
        SpriteBundle {
            sprite: Sprite {
                color: Color::rgb(1.0, 0.0, 0.0),
                custom_size: Some(Vec2::new(50.0, 50.0)),
                ..default()
            },
            transform: Transform::from_xyz(window.width() / 2.0, y, 0.0),
            ..default()
        },
        Enemy { score_pts: 10.0 },
        Baddy { last_move: time.elapsed_seconds() },
        Health {
            current: 10.0,
            max: 10.0,
            regen_rate_ps: 0.0,
        },
        Damage {
            dps: 100.0,
            flat: false,
        },
        Velocity {
            speed: 100.0,
            angle: std::f32::consts::PI, // Move left
        },
        ExplodesOnDeath(true),
        EnemyTag,
    ));
}

fn spawn_homing_baddy(commands: &mut Commands, window: &Window, time: &Time) {
    let y = rand::thread_rng().gen_range(-window.height() / 2.0..window.height() / 2.0);
    
    commands.spawn((
        SpriteBundle {
            sprite: Sprite {
                color: Color::rgb(0.8, 0.0, 0.8),
                custom_size: Some(Vec2::new(30.0, 30.0)),
                ..default()
            },
            transform: Transform::from_xyz(window.width() / 2.0, y, 0.0),
            ..default()
        },
        Enemy { score_pts: 20.0 },
        HomingBaddy {
            last_move: time.elapsed_seconds(),
            spawn_time: time.elapsed_seconds(),
        },
        Health {
            current: 20.0,
            max: 20.0,
            regen_rate_ps: 0.0,
        },
        Damage {
            dps: 100.0,
            flat: false,
        },
        Velocity {
            speed: 200.0,
            angle: std::f32::consts::PI,
        },
        ExplodesOnDeath(true),
        EnemyTag,
    ));
}

pub fn baddy_ai_system(
    mut query: Query<(&mut Velocity, &mut Baddy)>,
    time: Res<Time>,
) {
    for (mut velocity, mut baddy) in query.iter_mut() {
        if time.elapsed_seconds() - baddy.last_move > 1.0 {
            let mut rng = rand::thread_rng();
            let angle_degrees = rng.gen_range(170.0_f32..180.0_f32);
            velocity.angle = angle_degrees.to_radians();
            baddy.last_move = time.elapsed_seconds();
        }
    }
}

pub fn homing_baddy_ai_system(
    mut query: Query<(&mut Velocity, &mut HomingBaddy, &Transform)>,
    player_query: Query<&Transform, (With<Player>, Without<HomingBaddy>)>,
    time: Res<Time>,
) {
    if let Ok(player_transform) = player_query.get_single() {
        for (mut velocity, mut homing, transform) in query.iter_mut() {
            if time.elapsed_seconds() - homing.last_move > 0.1 {
                let elapsed = time.elapsed_seconds() - homing.spawn_time;
                
                // After 1.5 seconds or if past player, just move left
                if elapsed > 1.5 || transform.translation.x < player_transform.translation.x {
                    // Keep moving in current direction
                } else {
                    // Home in on player
                    let dx = player_transform.translation.x - transform.translation.x;
                    let dy = player_transform.translation.y - transform.translation.y;
                    velocity.angle = dy.atan2(dx);
                }
                
                homing.last_move = time.elapsed_seconds();
            }
        }
    }
}
