mod components;
mod resources;
mod systems;
mod states;
mod plugins;

use bevy::prelude::*;
use plugins::GamePlugin;

fn main() {
    App::new()
        .add_plugins(DefaultPlugins.set(WindowPlugin {
            primary_window: Some(Window {
                title: "NyannBoom - Rust Port".to_string(),
                resolution: (800.0, 600.0).into(),
                ..default()
            }),
            ..default()
        }))
        .add_plugin(GamePlugin)
        .run();
}