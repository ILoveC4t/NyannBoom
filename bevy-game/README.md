# Bevy Game - NyannBoom Rust Port

This project is a Rust port of the NyannBoom game using the Bevy game engine. It converts the original JavaScript/HTML5 game into a native application built with Rust and Bevy.

## Game Description

NyannBoom is a space shooter game where you control a player (Nyan Cat) and defend against waves of enemies. The game features:

- **Player Controls**: Use WASD or Arrow keys to move, Space to shoot, L to activate laser
- **Enemies**: 
  - Baddy: Red enemies that move in random patterns
  - HomingBaddy: Purple enemies that home in on the player
- **Combat**: Shoot bullets and use a powerful laser with cooldown
- **Scoring**: Defeat enemies to earn points

## Getting Started

To get started with this project, ensure you have Rust and Cargo installed on your machine. You can install Rust by following the instructions at [rust-lang.org](https://www.rust-lang.org/).

### Prerequisites

- Rust (version 1.56 or higher)
- Cargo (comes with Rust)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd bevy-game
   ```

2. Build the project:
   ```
   cargo build --release
   ```

3. Run the project:
   ```
   cargo run --release
   ```

## Project Structure

- **Cargo.toml**: Configuration file for the Rust project with Bevy dependencies.
- **.gitignore**: Lists files and directories to be ignored by version control.
- **README.md**: Documentation for the project.
- **src/**: Contains the source code for the game.
  - **main.rs**: Entry point of the application.
  - **lib.rs**: Library root with module exports.
  - **components/**: ECS components representing game entities (Player, Enemies, etc.)
  - **systems/**: Game logic systems (movement, combat, collision, wave spawning)
  - **resources/**: Global game state (score, wave state)
  - **states/**: Game states (Playing, GameOver)
  - **plugins/**: Bevy plugins that tie everything together
- **examples/**: Contains example applications demonstrating Bevy functionality.
- **tests/**: Integration tests for the project.

## Implementation Details

The Rust port translates the JavaScript game architecture to Bevy's Entity Component System (ECS):

- **JavaScript Classes → Bevy Components**: Entity classes like `Player`, `Baddy`, etc. are now ECS components
- **Game Loop → Bevy Systems**: The tick-based game loop is now handled by Bevy systems
- **Collision Detection**: Implemented using AABB (Axis-Aligned Bounding Box) collision detection
- **Wave Spawning**: Enemy waves are managed by the wave system with random spawning
- **Input Handling**: Keyboard input is handled through Bevy's input system

## Controls

- **Arrow Keys / WASD**: Move the player
- **Space**: Shoot bullets
- **L**: Activate laser (with cooldown)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features you would like to add.

## License

This project is licensed under the MIT License. See the LICENSE file for details.