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

The portal transports the hero to the second level — an underwater world where the fear of deep water and hidden objects comes to life. This fear stems from a childhood memory: while swimming with friends in a river, the hero's foot touched an unexpected underwater object, causing panic and a feeling of uncertainty. In the game, the player travels through this underwater realm, surrounded by old pipes, fish, crabs and even shark, learning to accept the secrets hidden beneath the surface. Realizing what lies in the depths and already knowing what the underwater world hides, the hero's fear disappears, giving way to strength and confidence in future trials.

## 📽️ Gameplay Demo

[![Watch the video](https://img.youtube.com/vi/L8MAer8B1j8/maxresdefault.jpg)](https://www.youtube.com/watch?v=L8MAer8B1j8)

## 🌌 Project Overview

**Lisani & Nisali** is a 3D adventure game built with **TypeScript** and **Babylon.js**. The story follows a protagonist who enters a dream world to confront their fears. 

## 🚀 Development Approach

- Initialized a new **Vite** project to structure the game environment.
- Designed 3D models in **Blender**, exported as `.glb` files, and imported using **Babylon.js**.
- Game architecture includes separate classes for:
  - **Character** (player controls and actions)
  - **Game Objects** (interactive elements like cubes and donuts)
  - **Levels** (environment, enemies, and boss)
  - **Spider** (enemy AI and combat)
  - **Boss** (final enemy encounter)
  - **Counter** (collect objects)

## 🕹 Gameplay Features

The game takes place in a 3D environment across two levels, each designed to confront a specific fear:

### 🕷 First Level — Fear of Spiders

Players face their fear of spiders in a memory-based setting with shelves and stairs. The player must:

- **Collect 5 Donuts** scattered across the room.
- **Fight spiders** that activate as the player progresses.
- **Defeat a Boss Spider** at the end of the level.
- Only after defeating all spiders and the boss can the player pass through a **mysterious portal** into the second level.

---

### 🌊 Second Level — Fear of Deep Water

The second level places the player underwater, facing the fear of the unknown depths. It features:

- An underwater maze-like environment with **pipes, crabs, and a shark**.
- **Collecting fish** restores air to **100%**, essential for survival.  
  ⚠️ The air bar drains over time and hitting 0% results in drowning.
- **Collecting 5 Donuts** unlocks the **red door** at the far end of the level.
- When all donuts are collected and the red door opens, the player can **exit the underwater nightmare**.


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

- **Cube and throne Interaction**: A pushable objects can be grabbed with `C` and moved to unlock a path to the next area.

### 🏊‍♂️ Character Actions (Second Level)

| Key         | Action                                     |
|-------------|--------------------------------------------|
| `Spacebar`  | Move upward in water                       |
| `ShiftLeft` | Move downward in water                     |
| `C`         | Grab (interact with objects, optional)     |

- **Air System**: A visible air bar depletes over time; collecting **fish** restores air to full.
- **Red Door Unlock**: Find and collect **5 donuts** to open the red door and escape the level.


### ⚔️ Combat System

- **Attack**: Triggered by **Left Click**, creating a red transparent square around the player to indicate attack range.
- **Collectibles and Enemies**:
  - **Donuts (Both Levels)**: 5 collectible donuts per level. Displayed in an on-screen progress bar.
  - **Spiders (First Level)**: Each requires **3 hits** and will chase the player.
  - **Boss Spider (First Level)**: Requires multiple hits and must be defeated to proceed.
  - **Fish (Second Level)**: Touch to collect and refill air to 100%.
  - **Crabs (Second Level)**: Patrol narrow areas but do not attack.
- **Shark (Second Level)**: Activates when the player enters the final underwater room. Moves toward the player.
- **Player Health**: Player has **10 HP**. Taking damage from enemies or losing all air causes death and a level reset.
- **UI Feedback**: HP bar, air percentage, and donut count are always visible.


## 🛠 Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/sachaCast/GamesOnWeb20242025.git
cd /my-babylon-game

# 2. Install dependencies
npm install
npm install @babylonjs/core @babylonjs/loaders
npm install vite

# 3. Start the dev server
npm run dev
```
