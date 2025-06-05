import { Vector3 } from "@babylonjs/core";
import TestLevel from "./TestLevel";
import SecondLevel from "./SecondLevel";
import Character from "./character";

let currentLevel: TestLevel | SecondLevel;
let mainCharacter: Character;
const popup = document.getElementById('controls-popup');
const button = document.getElementById('open-controls-btn');
async function initGame(): Promise<void> {
    document.getElementById("mainMenu")!.style.display = "none";
    document.getElementById("characterMenu")!.style.display = "none";
    document.getElementById("creditsModal")!.style.display = "none";
    document.getElementById("hud")!.style.display = "block";

    currentLevel = new TestLevel();
    await currentLevel.ready;

    mainCharacter = new Character(currentLevel.scene, new Vector3(-5, 0.6, 0), currentLevel);
    currentLevel.starting(mainCharacter);

    currentLevel.engine.runRenderLoop(() => {
        currentLevel.scene.render();

        const pos = mainCharacter.collisionMesh.position;

        if (
            pos.x >= -143.90 && pos.x <= -141.28 &&
            pos.z >= 16.55 && pos.z <= 17.02
        ) {
            if (!(currentLevel instanceof SecondLevel)) {
                currentLevel.engine.stopRenderLoop();
                currentLevel.scene.dispose();
                loadSecondLevel();
            }
        }
    });
}

async function loadSecondLevel() {
    currentLevel = new SecondLevel();
    await currentLevel.ready;

    mainCharacter = new Character(currentLevel.scene, new Vector3(-5, 0.6, 0), currentLevel);
    currentLevel.starting(mainCharacter);

    currentLevel.engine.runRenderLoop(() => {
        currentLevel.scene.render();
    });
}

window.addEventListener("DOMContentLoaded", () => {
    // Start Game
    document.getElementById("startButton")?.addEventListener("click", () => {
        initGame();
    });

    // Character Select screen
    document.getElementById("characterButton")?.addEventListener("click", () => {
        document.getElementById("mainMenu")!.style.display = "none";
        document.getElementById("characterMenu")!.style.display = "block";
    });

    // Back from Character Select
    document.getElementById("charBack")?.addEventListener("click", () => {
        document.getElementById("characterMenu")!.style.display = "none";
        document.getElementById("mainMenu")!.style.display = "block";
    });

    // Show Credits
    document.getElementById("creditsButton")?.addEventListener("click", () => {
        document.getElementById("creditsModal")!.style.display = "block";
    });

    // Close Credits
    document.getElementById("closeCredits")?.addEventListener("click", () => {
        document.getElementById("creditsModal")!.style.display = "none";
    });
    document.getElementById("controlsButton")?.addEventListener("click", () => {
        document.getElementById("controlsModal")!.style.display = "block";
    });

    // Close Controls
    document.getElementById("closeControls")?.addEventListener("click", () => {
        document.getElementById("controlsModal")!.style.display = "none";
    });
    if (button) {
    button.addEventListener('click', () => {
        popup!.style.display = 'block';
    });
    }

    function closePopup() {
    if (popup) {
        popup.style.display = 'none';
    }
    }

});

window.addEventListener("resize", () => {
    if (currentLevel && currentLevel.engine) {
        currentLevel.engine.resize();
    }
});