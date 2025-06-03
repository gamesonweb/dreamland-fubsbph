import { Color3, Scene, Vector3 } from "@babylonjs/core";
import TestLevel from "./TestLevel";
import SecondLevel from "./SecondLevel";
import Character from "./character";

let currentLevel: TestLevel | SecondLevel;
let mainCharacter: Character;

async function initGame(): Promise<void> {
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
                console.log("Transition vers SecondLevel");

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

initGame();

window.addEventListener("resize", () => {
    if (currentLevel && currentLevel.engine) {
        currentLevel.engine.resize();
    }
});
