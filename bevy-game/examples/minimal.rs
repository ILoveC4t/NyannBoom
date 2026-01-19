// This is a minimal example of a Bevy application demonstrating basic functionality.

use bevy::prelude::*;

fn main() {
    App::build()
        .add_plugins(DefaultPlugins)
        .add_startup_system(setup.system())
        .run();
}

fn setup(commands: &mut Commands) {
    commands.spawn_bundle(OrthographicCameraBundle::new_2d());
    commands.spawn_bundle(SpriteBundle {
        material: Color::rgb(0.5, 0.5, 0.5).into(),
        ..Default::default()
    });
}