use bevy::prelude::*;

// Base entity components
#[derive(Component)]
pub struct Health {
    pub current: f32,
    pub max: f32,
    pub regen_rate_ps: f32,
}

#[derive(Component)]
pub struct Damage {
    pub dps: f32,
    pub flat: bool,
}

#[derive(Component)]
pub struct Velocity {
    pub speed: f32,
    pub angle: f32, // in radians
}

#[derive(Component)]
pub struct ExplodesOnDeath(pub bool);

// Entity type markers
#[derive(Component)]
pub struct Player {
    pub score_multiplier: f32,
    pub shoot_delay: f32,
    pub last_shoot: f32,
    pub upgrade_cost: f32,
}

#[derive(Component)]
pub struct Bullet;

#[derive(Component)]
pub struct Laser {
    pub duration: f32,
    pub cooldown: f32,
    pub last_use: f32,
    pub in_use: bool,
}

#[derive(Component)]
pub struct Enemy {
    pub score_pts: f32,
}

#[derive(Component)]
pub struct Baddy {
    pub last_move: f32,
}

#[derive(Component)]
pub struct HomingBaddy {
    pub last_move: f32,
    pub spawn_time: f32,
}

#[derive(Component)]
pub struct Boom {
    pub duration: f32,
    pub created: f32,
}

// Tags
#[derive(Component)]
pub struct Ally;

#[derive(Component)]
pub struct EnemyTag;