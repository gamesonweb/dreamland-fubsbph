/*import { Engine, Scene, SceneLoader, PhysicsImpostor, HemisphericLight, Vector3, MeshBuilder, StandardMaterial, Color3, FollowCamera } from "@babylonjs/core";
import "@babylonjs/loaders";
import { Ray } from "@babylonjs/core";
import Character from "./Character";

// Get the canvas and create the engine
const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
const engine = new Engine(canvas, true);

// Create the scene
const scene = new Scene(engine);
scene.enablePhysics();

// Lighting
const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
light.intensity = 0.7;

// Create ground
const groundSize = 20;
const ground = MeshBuilder.CreateGround("ground", { width: groundSize, height: groundSize }, scene);
const groundMaterial = new StandardMaterial("groundMat", scene);
groundMaterial.diffuseColor = new Color3(0.5, 0.5, 0.5);
ground.material = groundMaterial;

// Create character
const character = new Character(scene, new Vector3(0, 0.6, 0), Color3.Red());


// Create pushable cube
const cube = MeshBuilder.CreateBox("pushableCube", { size: 1 }, scene);
cube.position = new Vector3(3, 0.5, 3);
const cubeMaterial = new StandardMaterial("cubeMat", scene);
cubeMaterial.diffuseColor = Color3.Blue();
cube.material = cubeMaterial;
cube.checkCollisions = true;

let donuts: any[] = []; // Array to hold the donut meshes
let donut: any; let donut2 :any; let donut3 : any;
SceneLoader.ImportMesh("", "/donut.glb", "", scene, (meshes) => {
  donut = meshes[0]; // Assigner le premier mesh du modèle
  donut.position = new Vector3(5, 1.3, 0); // Position initiale
  donuts.push(donut);
  donut2 = meshes[0].clone("donut2", null); // Assigner le premier mesh du modèle
  donut2.position = new Vector3(-5, 1.3, 0); // Position initiale
  donuts.push(donut2);
  donut3 = meshes[0].clone("donut3", null); // Assigner le premier mesh du modèle
  donut3.position = new Vector3(0, 1.3, 5); // Position initiale
  donuts.push(donut3);

  donuts.forEach(donut => {
    donut.scaling = new Vector3(5, 5, 5); // Scale each donut
  });

  console.log("Donut chargé !");
}, null, (message) => {
  console.error("Erreur de chargement :", message);
});

// Create follow camera
const camera = new FollowCamera("FollowCam", new Vector3(0, 5, -10), scene);
camera.lockedTarget = character.mesh; // The camera follows the character
camera.radius = 10;
camera.heightOffset = 5;
camera.rotationOffset = 0;

// Disable user camera controls
camera.inputs.clear();

// Movement logic
let speed = 0.1;
const keys: Record<string, boolean> = {}; // Store pressed keys
const boundary = groundSize / 2 - 0.5; // Character movement boundaries

// Gravity and jumping
let velocityY = 0;
const gravity = -0.005;
let jumpStrength = 0.15;
let isJumping = false;
let canJump = true; // Флаг для контроля прыжка
let isGrabbing = false;

const keyMappings: Record<string, string> = {
    "KeyW": "forward",
    "KeyS": "backward",
    "KeyA": "right",
    "KeyD": "left",
    "ArrowUp": "forward",
    "ArrowDown": "backward",
    "ArrowLeft": "right",
    "ArrowRight": "left",
    "ShiftLeft": "crawl",
    "KeyC": "grab"
};

// Handle key press events
window.addEventListener("keydown", (event) => {
    const action = keyMappings[event.code];
    if (action) keys[action] = true;

    // Crawl mechanic
    if (event.code === "ShiftLeft") {
        character.mesh.scaling.y = 0.5; // Flatten the sphere
        character.mesh.position.y = 0.3; // Adjust position to stay grounded
        speed = 0.025;
        jumpStrength = 0.05;
    }

    if (event.code === "KeyC") {
        isGrabbing = true;
    }

    if (event.code === "Space" && !isJumping && character.mesh.scaling.y === 1) {
        velocityY = jumpStrength;
        isJumping = true;
    }

    if (event.code === "Space" && isGrounded() && canJump) {
        velocityY = jumpStrength;
        isJumping = true;
        canJump = false; // Отключаем возможность повторного прыжка

        // Устанавливаем задержку перед следующим прыжком
        setTimeout(() => {
            canJump = true;
        }, 1500); // 1.5 секунды
    }
});

// Handle key release events
window.addEventListener("keyup", (event) => {
    const action = keyMappings[event.code];
    if (action) keys[action] = false;

    // Restore normal size when shift is released
    if (event.code === "ShiftLeft") {
        character.mesh.scaling.y = 1; // Restore original shape
        character.mesh.position.y = 0.6; // Restore original position
        speed = 0.1;
        jumpStrength = 0.15;
    }

    if (event.code === "KeyC") {
        isGrabbing = false;
    }
});

// В игровом цикле:
if (isJumping) {
    character.mesh.moveWithCollisions(new Vector3(0, velocityY, 0));
    velocityY += gravity;
    if (isGrounded()) { // Теперь проверяем не просто высоту, а наличие поверхности
        isJumping = false;
        velocityY = 0;
    }
}

const bounceForce = 0.5;
const moveForce = 0.05;

// Game loop
engine.runRenderLoop(() => {
    let moveDirection = new Vector3(0, 0, 0);

    // Determine movement direction
    if (keys["forward"]) moveDirection.z -= 1;
    if (keys["backward"]) moveDirection.z += 1;
    if (keys["left"]) moveDirection.x -= 1;
    if (keys["right"]) moveDirection.x += 1;

    moveDirection.normalize();

    const movement = moveDirection.scale(speed);
    character.mesh.moveWithCollisions(movement);
    //create boundary for ground
    if (character.mesh.position.x > boundary) character.mesh.position.x = boundary;
    if (character.mesh.position.x < -boundary) character.mesh.position.x = -boundary;
    if (character.mesh.position.z > boundary) character.mesh.position.z = boundary;
    if (character.mesh.position.z < -boundary) character.mesh.position.z = -boundary;

    // Gravity and jumping
    if (isJumping) {
        character.mesh.moveWithCollisions(new Vector3(0, velocityY, 0));
        velocityY += gravity;
        if (character.mesh.position.y <= 0.6) {
            //character.position.y = 0.6;
            isJumping = false;
            velocityY = 0;
        }
    }

    // Check for collisions with any of the donuts
    donuts.forEach(donut => {
      const distance = Vector3.Distance(character.mesh.position, donut.position);
      if (distance < 1) { // Collision threshold
          const direction = character.mesh.position.subtract(donut.position).normalize();
          character.mesh.position.x += direction.x * bounceForce;
          character.mesh.position.z += direction.z * bounceForce;
      }
    });

    const cubeDistance = Vector3.Distance(character.mesh.position, cube.position);
    if (cubeDistance < 1.5 && isGrabbing) {
        speed = 0.025;
        cube.moveWithCollisions(movement);
        cube.position.y = cube.scaling.y * 0.5;
        if (cube.position.x > boundary) cube.position.x = boundary;
        if (cube.position.x < -boundary) cube.position.x = -boundary;
        if (cube.position.z > boundary) cube.position.z = boundary;
        if (cube.position.z < -boundary) cube.position.z = -boundary;
    }
    else if (cubeDistance < 1.5){
        speed = 0.1;
    }

    scene.render();
});

// Функция проверки, стоит ли персонаж на поверхности
function isGrounded() {
    const ray = new Ray(character.mesh.position, new Vector3(0, -1, 0), 1.2); // Луч вниз
    const hit = scene.pickWithRay(ray);
    return hit && hit.pickedMesh; // Если что-то под персонажем, значит он стоит на поверхности
}


// Window resize event listener
window.addEventListener("resize", () => {
    engine.resize();
});

*/