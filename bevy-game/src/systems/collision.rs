use bevy::prelude::*;
use crate::components::*;
use crate::resources::GameState;

pub fn collision_detection_system(
    mut commands: Commands,
    mut game_state: ResMut<GameState>,
    ally_query: Query<(Entity, &Transform, &Sprite, &Ally, Option<&Damage>), Without<EnemyTag>>,
    mut enemy_query: Query<(Entity, &Transform, &Sprite, &Enemy, &mut Health, Option<&Damage>), With<EnemyTag>>,
    time: Res<Time>,
) {
    for (_ally_entity, ally_transform, ally_sprite, _, ally_damage) in ally_query.iter() {
        let ally_size = ally_sprite.custom_size.unwrap_or(Vec2::new(50.0, 50.0));
        
        for (enemy_entity, enemy_transform, enemy_sprite, enemy, mut enemy_health, _enemy_damage) in enemy_query.iter_mut() {
            let enemy_size = enemy_sprite.custom_size.unwrap_or(Vec2::new(50.0, 50.0));
            
            // Check collision using AABB
            if check_collision(
                ally_transform.translation.truncate(),
                ally_size,
                enemy_transform.translation.truncate(),
                enemy_size,
            ) {
                // Apply damage from ally to enemy
                if let Some(damage) = ally_damage {
                    if damage.flat {
                        enemy_health.current -= damage.dps;
                    } else {
                        enemy_health.current -= damage.dps * time.delta_seconds();
                    }
                    
                    if enemy_health.current <= 0.0 {
                        // Enemy dies
                        game_state.score += enemy.score_pts;
                        spawn_boom(&mut commands, enemy_transform.translation, enemy_size);
                        commands.entity(enemy_entity).despawn();
                    }
                }
            }
        }
    }
}

fn check_collision(pos1: Vec2, size1: Vec2, pos2: Vec2, size2: Vec2) -> bool {
    pos1.x < pos2.x + size2.x
        && pos1.x + size1.x > pos2.x
        && pos1.y < pos2.y + size2.y
        && pos1.y + size1.y > pos2.y
}

fn spawn_boom(commands: &mut Commands, position: Vec3, size: Vec2) {
    let boom_size = size.max_element() * 1.5;
    commands.spawn((
        SpriteBundle {
            sprite: Sprite {
                color: Color::rgb(1.0, 0.5, 0.0),
                custom_size: Some(Vec2::new(boom_size, boom_size)),
                ..default()
            },
            transform: Transform::from_translation(position),
            ..default()
        },
        Boom {
            duration: 1.0,
            created: 0.0,
        },
    ));
}

pub fn boom_cleanup_system(
    mut commands: Commands,
    mut query: Query<(Entity, &mut Boom)>,
    time: Res<Time>,
) {
    for (entity, mut boom) in query.iter_mut() {
        boom.created += time.delta_seconds();
        if boom.created >= boom.duration {
            commands.entity(entity).despawn();
        }
    }
}
