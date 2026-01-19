// This file is the entry point of the application. It initializes the Bevy app, sets up the main game loop, and adds plugins and systems.

use bevy::prelude::*;

fn main() {
    App::build()
        .add_plugins(DefaultPlugins)
        .add_startup_system(setup.system())
        .run();
}

fn setup(commands: &mut Commands) {
    // Setup code goes here
}