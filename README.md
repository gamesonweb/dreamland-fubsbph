# 🎮 GamesOnWeb2024–2025 — *Lisani & Nisali*

## 👥 About the Team

- Mikita Sidarenka
- Sacha Castillejos
- Yelyzaveta Ploskonos

## Link
Play the game at [https://sachacast.github.io/GamesOnWeb20242025/](https://sachacast.github.io/GamesOnWeb20242025/)

## 🕸️🌊 The game's story

**Listani & Nisali** is not just a game, but a reflection of the idea that fears can be overcome by facing them head-on. The team drew inspiration from real stories: each member of the team recalled their own fears and how they overcame them. This gave the game emotional depth, making it not just entertainment, but a story about courage and self-discovery.

In **Listani & Nisali**, the player falls into a dream trap, where each level is a room in which fears from the past come to life. The first level immerses the player in a memory associated with a fear of spiders: as a child, the hero reached for a donut on a shelf, but suddenly a spider fell on his hand, causing him to develop a persistent fear that spiders could appear at any moment. In the game, this fear materializes when the player collects donuts and suddenly encounters a swarm of spiders. Fighting them with his fists and courage, the hero overcomes this fear. The level ends with a mysterious portal, a flickering entrance symbolizing a way out of fear into the unknown. Passing through it signifies the hero's readiness for the next challenge.

The portal transports the hero to the second level — an underwater world where the fear of deep water and hidden objects comes to life. This fear stems from a childhood memory: while swimming with friends in a river, the hero's foot touched an unexpected underwater object, causing panic and a feeling of uncertainty. In the game, the player travels through this underwater realm, surrounded by old pipes and cute fish, learning to accept the secrets hidden beneath the surface. Realizing what lies in the depths and already knowing what the underwater world hides, the hero's fear disappears, giving way to strength and confidence in future trials.

## 📽️ Gameplay Demo

[![Watch the video](https://img.youtube.com/vi/L8MAer8B1j8/maxresdefault.jpg)](https://www.youtube.com/watch?v=L8MAer8B1j8)

## 🌌 Project Overview

**Lisani & Nisali** is a 3D adventure game built with **TypeScript** and **Babylon.js**. The story follows a protagonist who enters a dream world to confront their fears. At the beginning of the game, players choose between two characters:
- **Lisani** (female)
- **Nisali** (male)

## 🚀 Development Approach

- Initialized a new **Vite** project to structure the game environment.
- Designed 3D models in **Blender**, exported as `.glb` files, and imported using **Babylon.js**.
- Game architecture includes separate classes for:
  - **Character** (player controls and actions)
  - **Game Objects** (interactive elements like cubes and donuts)
  - **Level** (environment, enemies, and boss)
  - **Spider** (enemy AI and combat)
  - **Boss** (final enemy encounter)

## 🕹 Gameplay Features

The game takes place in a 3D environment across two levels, each designed to confront a specific fear. In the first level, players face their fear of spiders in a room with stairs and a path leading to a boss arena. Players must navigate the level, collect objects, and defeat all spiders to progress. Only after defeating all spiders can players advance to the second level, where they are immersed directly in water, confronting their fear of water in an aquatic maze environment with fish and bubble effects.

### 🎮 Movement Controls

| Key (QWERTY)       | Key (AZERTY)       | Action         |
|--------------------|--------------------|----------------|
| `W` / `ArrowUp`    | `Z` / `ArrowUp`    | Move forward   |
| `S` / `ArrowDown`  | `S` / `ArrowDown`  | Move backward  |
| `A` / `ArrowLeft`  | `Q` / `ArrowLeft`  | Move left      |
| `D` / `ArrowRight` | `D` / `ArrowRight` | Move right     |

### 🏃‍♂️ Character Actions (First Level)

| Key         | Action                                     |
|-------------|--------------------------------------------|
| `Spacebar`  | Jump (only if not crawling)                |
| `ShiftLeft` | Crawl (reduces height and movement speed)  |
| `C`         | Grab (interact with objects like the cube) |

### 🏊‍♂️ Character Actions (Second Level)

| Key         | Action                                     |
|-------------|--------------------------------------------|
| `Spacebar`  | Move upward in water                       |
| `ShiftLeft` | Move downward in water                     |
| `C`         | Grab (interact with objects, optional)     |

- **Cube Interaction**: A pushable cube can be grabbed with `C` and moved to unlock a path to the next area.
- **Collectibles**: 5 donuts are scattered across the level. Collecting a donut updates the on-screen UI (e.g., "donuts: 2/5").

## ⚔️ Combat System

- **Attack**: Triggered by **Left Click**, creating a red transparent square around the player to indicate attack range.
- **Collectibles and Enemies**:
  - **Donuts (First Level)**: 5 collectible donuts are scattered throughout the level. Collecting them updates the on-screen counter (e.g., "donuts: 2/5").
  - **Spiders (First Level)**: Each spider requires **3 hits** to defeat and crawls toward the player when nearby.
  - **Boss Spider (First Level)**: A larger enemy at the end of the level requires multiple hits to defeat. Upon defeating the boss.
  - **Fish (Second Level)**: Fish are present in the water environment, adding to the immersive aquatic setting (no combat with fish currently).
- **Player Health**: The player has **10 HP**, displayed on-screen. Taking **10 hits** from spiders or the boss causes the player to die, triggering a respawn after a 2-second delay with the level reset.
- **UI Feedback**: The on-screen display shows the player's current HP (e.g., "HP: 8/10") and the number of donuts collected (e.g., "donuts: 2/5").
- **Spider AI**: Spiders activate after passing the cube area, they **crawl toward the player** by default.

## 🛠 Installation & Setup

```bash
# 1. Clone the repository
git clone <your-repo-link>
cd <your-project-folder>

# 2. Install dependencies
npm install
npm install @babylonjs/core @babylonjs/loaders

# 3. Start the dev server
npm run dev
```
