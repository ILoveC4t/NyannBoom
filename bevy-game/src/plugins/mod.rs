use bevy::prelude::*;
use crate::components::*;
use crate::systems::*;
use crate::resources::*;
use crate::states::AppState;

pub struct GamePlugin;

impl Plugin for GamePlugin {
    fn build(&self, app: &mut App) {
        app
            .add_state::<AppState>()
            .init_resource::<GameState>()
            .init_resource::<WaveState>()
            .add_startup_system(setup_game)
            .add_systems((
                player_input_system,
                movement_system,
                health_regen_system,
                player_shoot_system,
                laser_system,
                wave_handler_system,
                baddy_ai_system,
                homing_baddy_ai_system,
                collision_detection_system,
                boom_cleanup_system,
                cleanup_offscreen_system,
                game_over_system,
            ).in_set(OnUpdate(AppState::Playing)));
    }
}

fn setup_game(mut commands: Commands) {
    // Spawn camera
    commands.spawn(Camera2dBundle::default());
    
    // Spawn player
    commands.spawn((
        SpriteBundle {
            sprite: Sprite {
                color: Color::rgb(0.0, 0.5, 1.0),
                custom_size: Some(Vec2::new(100.0, 50.0)),
                ..default()
            },
            transform: Transform::from_xyz(0.0, 0.0, 0.0),
            ..default()
        },
        Player {
            score_multiplier: 1.0,
            shoot_delay: 0.5,
            last_shoot: 0.0,
            upgrade_cost: 20.0,
        },
        Ally,
        Health {
            current: 100.0,
            max: 100.0,
            regen_rate_ps: 1.0,
        },
        Damage {
            dps: 10.0,
            flat: false,
        },
        Velocity {
            speed: 250.0,
            angle: -1.0,
        },
        ExplodesOnDeath(true),
    ));
    
    // Spawn laser (initially hidden)
    commands.spawn((
        SpriteBundle {
            sprite: Sprite {
                color: Color::rgb(1.0, 0.0, 0.0),
                custom_size: Some(Vec2::new(150.0, 50.0)),
                ..default()
            },
            transform: Transform::from_xyz(0.0, 0.0, 0.0),
            visibility: Visibility::Hidden,
            ..default()
        },
        Laser {
            duration: 3.0,
            cooldown: 5.0,
            last_use: -10.0,
            in_use: false,
        },
        Ally,
        Damage {
            dps: 100.0,
            flat: false,
        },
        ExplodesOnDeath(false),
    ));
}

fn game_over_system(
    mut game_state: ResMut<GameState>,
    mut next_state: ResMut<NextState<AppState>>,
    player_query: Query<&Health, With<Player>>,
) {
    if let Ok(health) = player_query.get_single() {
        if health.current <= 0.0 {
            game_state.game_over = true;
            next_state.set(AppState::GameOver);
        }
    }
}