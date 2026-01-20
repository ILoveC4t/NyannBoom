use bevy::prelude::*;
use crate::components::*;

pub fn player_shoot_system(
    mut commands: Commands,
    keyboard_input: Res<Input<KeyCode>>,
    mut player_query: Query<(&Transform, &mut Player)>,
    time: Res<Time>,
) {
    if keyboard_input.pressed(KeyCode::Space) {
        for (transform, mut player) in player_query.iter_mut() {
            if time.elapsed_seconds() - player.last_shoot >= player.shoot_delay {
                spawn_bullet(&mut commands, transform);
                player.last_shoot = time.elapsed_seconds();
            }
        }
    }
}

fn spawn_bullet(commands: &mut Commands, player_transform: &Transform) {
    commands.spawn((
        SpriteBundle {
            sprite: Sprite {
                color: Color::rgb(1.0, 1.0, 0.0),
                custom_size: Some(Vec2::new(20.0, 20.0)),
                ..default()
            },
            transform: Transform::from_xyz(
                player_transform.translation.x + 50.0,
                player_transform.translation.y,
                0.0,
            ),
            ..default()
        },
        Bullet,
        Ally,
        Health {
            current: 1.0,
            max: 1.0,
            regen_rate_ps: 0.0,
        },
        Damage {
            dps: 50.0,
            flat: true,
        },
        Velocity {
            speed: 500.0,
            angle: 0.0, // Move right
        },
        ExplodesOnDeath(false),
    ));
}

pub fn laser_system(
    _commands: Commands,
    keyboard_input: Res<Input<KeyCode>>,
    mut laser_query: Query<(Entity, &mut Laser, &mut Transform, &mut Visibility)>,
    player_query: Query<&Transform, (With<Player>, Without<Laser>)>,
    time: Res<Time>,
) {
    if let Ok(player_transform) = player_query.get_single() {
        for (_entity, mut laser, mut laser_transform, mut visibility) in laser_query.iter_mut() {
            // Check if laser should be active
            if time.elapsed_seconds() - laser.last_use > laser.duration {
                laser.in_use = false;
            }
            
            if keyboard_input.just_pressed(KeyCode::L) {
                if time.elapsed_seconds() - laser.last_use >= laser.cooldown {
                    laser.last_use = time.elapsed_seconds();
                    laser.in_use = true;
                }
            }
            
            if laser.in_use {
                *visibility = Visibility::Visible;
                laser_transform.translation = player_transform.translation;
                laser_transform.translation.x += 55.0; // Offset from player
            } else {
                *visibility = Visibility::Hidden;
            }
        }
    }
}

pub fn cleanup_offscreen_system(
    mut commands: Commands,
    query: Query<(Entity, &Transform), (Or<(With<Bullet>, With<EnemyTag>)>,)>,
    windows: Query<&Window>,
) {
    let window = windows.single();
    let width = window.width();
    let height = window.height();
    
    for (entity, transform) in query.iter() {
        let pos = transform.translation;
        if pos.x < -width / 2.0 - 100.0
            || pos.x > width / 2.0 + 100.0
            || pos.y < -height / 2.0 - 100.0
            || pos.y > height / 2.0 + 100.0
        {
            commands.entity(entity).despawn();
        }
    }
}
