import {
    Engine,
    Scene,
    MeshBuilder,
    Vector3,
    StandardMaterial,
    Color3,
    Color4,
    HemisphericLight,
    ArcRotateCamera,
    AbstractMesh,
    FollowCamera,
    PhotoDome,
    SceneLoader,
    Tools,
    Texture,
    Scene as BabylonScene, // Ensure this is imported for fog mode constants
    AnimationGroup,
    TransformNode,
    Mesh,
} from "@babylonjs/core";

import Character from "./character";
import { Boss } from "./Boss";
import { GameObject } from "./GameObject";

export default class SecondLevel {
    private followCamera: FollowCamera | undefined;
    public scene: Scene;
    public engine: Engine;
    public canvas: HTMLCanvasElement;
    public ready: Promise<void>;
    public mainCharacter!: Character;
    public isAttacking = false;
    private healthDisplay: HTMLElement | undefined;
    private donutsDisplay: HTMLElement | undefined;
    private positionDisplay: HTMLElement | undefined;
    private finishDisplay: HTMLElement | undefined;
    public donuts: GameObject[] = [];
    private donutsFound: number;
    private boss: Boss | undefined;
    private levelFinished: boolean = false;
    private groundSize: number = 20;
    private fishes: TransformNode[] = [];
    private fishAnimations: AnimationGroup[] = [];
    private fishSwimRadius = 5;
    private fishSwimSpeed = 0.5;
    private fishTime = 0;
    public boundary: number = this.groundSize / 2 - 1;
    private air: number = 100;
    private maxAir: number = 100;
    private airDisplay: HTMLElement | undefined;
    private airDrainRate: number = 1;
    private airDrainInterval: number = 500;
    private shark!: TransformNode;
    private sharkActive: boolean = false;
    private door: Mesh | null = null;

    constructor() {
        this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);
        this.donutsFound = 0;
        const loadingDiv = document.getElementById("loadingScreen");
        this.setupCamera();
        if (loadingDiv) loadingDiv.style.display = "flex";
        this.ready = this.createLevel().then(() => {
            if (loadingDiv) {
                loadingDiv.classList.add("fade-out");
                setTimeout(() => loadingDiv.remove(), 1000);
            }
        });
    }

    public async createLevel(): Promise<void> {
        this.donutsFound = 0;
        this.donuts = [];
        this.createLighting();
        this.healthDisplay = document.getElementById("healthDisplay")!;
        this.positionDisplay = document.getElementById("positionDisplay")!;
        this.donutsDisplay = document.getElementById("donutsDisplay")!;
        this.finishDisplay = document.getElementById("finishDisplay")!;
        this.airDisplay = document.getElementById("airDisplay")!;
        this.air = this.maxAir;
        this.door = MeshBuilder.CreateBox("sharkCube", { size: 10 }, this.scene);
        this.door.position = new Vector3(-128, 0.60, -4);
        this.door.checkCollisions = true;

        const cubeMaterial = new StandardMaterial("cubeMat", this.scene);
        cubeMaterial.diffuseColor = new Color3(1, 0, 0); // rouge
        this.door.material = cubeMaterial;

        await Promise.all([
            this.loadLevel(),
            this.loadFishes(),
            this.loadShark(),
            this.loadKeys()
        ]);
        this.createUnderwaterEffect(); //  Underwater visuals
    }

    private createLighting(): void {
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
        light.intensity = 0.9;
    }

    private createUnderwaterEffect(): void {
        this.scene.fogMode = BabylonScene.FOGMODE_EXP; // Use constant from Scene
        this.scene.fogColor = new Color3(0.0, 0.4, 0.7); // Blue tint
        this.scene.fogDensity = 0.01;

        this.scene.clearColor = new Color4(0.0, 0.2, 0.3, 1.0); // Background color for underwater feel
    }

    public async resetLevel(): Promise<void> {
        this.scene.meshes.forEach((mesh: AbstractMesh) => mesh.dispose());
        this.scene.materials.forEach(mat => mat.dispose());
        this.scene.lights.forEach(light => light.dispose());
        const loadingDiv = document.getElementById("loadingScreen");
        if (loadingDiv) loadingDiv.style.display = "flex";
        this.ready = this.createLevel().then(() => {
            if (loadingDiv) {
                loadingDiv.classList.add("fade-out");
                setTimeout(() => loadingDiv.remove(), 1000);
            }
        });
        this.air = this.maxAir;
        if (this.airDisplay) {`
            this.airDisplay.textContent = Air: ${this.air}%`;
        }

    }

    public async loadLevel(): Promise<void> {
        return new Promise((resolve) => {
            SceneLoader.ImportMesh(null, "/", "2nd level.glb", this.scene, (meshes) => {
                console.log("Level loaded!", meshes);

                meshes.forEach(mesh => {
                    mesh.checkCollisions = true;
                    mesh.receiveShadows = true;
                });
                meshes[0].scaling = new Vector3(2, 2, -2);
                meshes[0].position = new Vector3(-80, -1, -30);

                const invisibleGround1 = MeshBuilder.CreateGround("invisibleGround", {
                    width: 200,
                    height: 50
                }, this.scene);

                invisibleGround1.position = new Vector3(-51.2, 0, 0);
                invisibleGround1.isVisible = false;
                invisibleGround1.checkCollisions = true;
                const groundMaterial1 = new StandardMaterial("groundMat", this.scene);
                const groundTexture1 = new Texture("/textures/Metal027_1K-JPG_Color.jpg", this.scene);
                groundMaterial1.diffuseTexture = groundTexture1;
                invisibleGround1.material = groundMaterial1;

                const invisibleGround2 = MeshBuilder.CreateGround("invisibleGround", {
                    width: 48,
                    height: 100
                }, this.scene);

                invisibleGround2.position = new Vector3(-82, -8.3, 0);
                invisibleGround2.isVisible = false;
                invisibleGround2.checkCollisions = true;
                const groundMaterial2 = new StandardMaterial("groundMat", this.scene);
                const groundTexture2 = new Texture("/textures/Metal027_1K-JPG_Color.jpg", this.scene);
                groundMaterial2.diffuseTexture = groundTexture2;
                invisibleGround2.material = groundMaterial2;

                const wallThickness = 0.5;
                const wallHeight = 100;
                const groundWidth = 65;
                const groundDepth = 8.8;
                const groundCenter = new Vector3(-63.2, -10.51, 0);

                const backWall = MeshBuilder.CreateBox("backWall", {
                    width: groundWidth,
                    height: wallHeight,
                    depth: wallThickness
                }, this.scene);

                backWall.position = new Vector3(
                    groundCenter.x,
                    groundCenter.y + wallHeight / 2,
                    groundCenter.z - (groundDepth / 2) - 5
                );
                backWall.isVisible = false;
                backWall.checkCollisions = true;
                backWall.freezeWorldMatrix();

                const frontWall = MeshBuilder.CreateBox("frontWall", {
                    width: groundWidth,
                    height: wallHeight,
                    depth: wallThickness
                }, this.scene);

                frontWall.position = new Vector3(
                    groundCenter.x,
                    groundCenter.y + wallHeight / 2,
                    groundCenter.z + (groundDepth / 2) + 3
                );
                frontWall.isVisible = false;
                frontWall.checkCollisions = true;
                frontWall.freezeWorldMatrix();

                resolve();
            });
        });

    }

    private async loadFishes(): Promise<void> {
        const fishPositions: Vector3[] = [
            new Vector3(-71.54, 25.14, 4.85),
            new Vector3(-64.97, 9.86, -2.66),
            new Vector3(-77.47, 8.00, -5.08),
            new Vector3(-81.77, 4.65, 6.07),
            new Vector3(-91.36, 17.46, -8.17),
            new Vector3(-106.82, 21.68, 12.44),
            new Vector3(-103.50, 7.57, 12.44),
            new Vector3(-117.87, 11.03, 12.44),
            new Vector3(-120.80, 18.59, -3.44),
            new Vector3(-113.21, 11.30, -3.44)
        ];

        const fishPath = "/";
        const fishFile = "fish_-_low_poly_-_rigged_-_animated.glb";

        for (let i = 0; i < fishPositions.length; i++) {
            const result = await SceneLoader.ImportMeshAsync("", fishPath, fishFile, this.scene);

            const root = result.meshes[0] as TransformNode;
            const fish = root;

            fish.scaling = new Vector3(5, 5, 5); // test scale
            fish.position = fishPositions[i];
            fish.rotation = new Vector3(0, Math.random() * Math.PI * 2, 0); // Optional random Y rotation

            this.fishes.push(fish);

            result.animationGroups.forEach(group => {
                group.start(true); // loop the swim animation
                this.fishAnimations.push(group);
            });


            //show fish
            result.meshes.forEach(mesh => {
                mesh.isVisible = true;
                mesh.alwaysSelectAsActiveMesh = true;
                //mesh.showBoundingBox = true;
                mesh.checkCollisions = true;
            });


        }

        console.log(`${fishPositions.length} fishes loaded at fixed positions.`);
    }

    private async loadShark(): Promise<void> {
        const sharkPath = "/";
        const sharkFile = "shark.glb";

        const result = await SceneLoader.ImportMeshAsync("", sharkPath, sharkFile, this.scene);

        const root = result.meshes[0] as TransformNode;
        this.shark = root;

        this.shark.scaling = new Vector3(2, 2, 2);
        this.shark.position = new Vector3(-107, 1, 0);
        this.shark.rotation = new Vector3(0, Math.PI, 0); // Pour le faire regarder vers la droite

        result.meshes.forEach(mesh => {
            mesh.isVisible = true;
            mesh.checkCollisions = true;
        });

        result.animationGroups.forEach(group => group.start(true)); // boucle animation
    }

    private async loadKeys(): Promise<void> {
        const donutPositions = [
            new Vector3(-110, 19, -6),
            new Vector3(-93, 8, -8),
            new Vector3(-94, 2, 5.5),
            new Vector3(-110, 4, 1.5),
            new Vector3(-122, 21, 1.5),
        ];

        donutPositions.forEach((pos, index) => {
            const donut = new GameObject(this.scene, "/", "donut.glb", pos, new Vector3(5, 5, 5));
            this.donuts.push(donut);
        });

        console.log("Donuts are being loaded...");
    }


    private setupCamera(): void {
        this.followCamera = new FollowCamera("FollowCam", new Vector3(0, 5, -10), this.scene);
        this.followCamera.radius = 10;
        this.followCamera.heightOffset = 5;
        this.followCamera.rotationOffset = 0;
        this.followCamera.inputs.clear();

        this.scene.activeCamera = this.followCamera;
        //this.followCamera.attachControl(this.canvas, true);
    }

    private checkCollisionWithShark(mainCharacter: Character) {
        if (!mainCharacter.isAlive) return;

        if (this.shark) {
            const distance = Vector3.Distance(mainCharacter.collisionMesh.position, this.shark.position);
            if (distance < 2) {
                const direction = mainCharacter.collisionMesh.position.subtract(this.shark.position).normalize();
                mainCharacter.getHit(direction);
            }
        }
    }

        private checkCollisionWithDonuts(mainCharacter: Character) {
            const donutsToCheck = [...this.donuts];

            donutsToCheck.forEach((donut, index) => {
                if (donut.mesh) {
                    const distance = Vector3.Distance(mainCharacter.collisionMesh.position, donut.mesh.position);

                    if (distance < 1) {
                        donut.mesh.dispose();

                        // Supprime le donut du tableau
                        const originalIndex = this.donuts.indexOf(donut);
                        if (originalIndex !== -1) {
                            this.donuts.splice(originalIndex, 1);
                        }

                        this.donutsFound += 1;
                        console.log("Donut collected! Total:", this.donutsFound);

                        // Met à jour l'affichage immédiatement
                        if (this.donutsDisplay != null) {
                            this.donutsDisplay.textContent = `donuts: ${this.donutsFound}/${this.donuts.length + this.donutsFound}`;
                        }
                    }
                }
            });
        }

    public starting(character: Character): void {
        this.mainCharacter = character;
        this.mainCharacter.setSwimmingMode(true);

        if (this.followCamera) {
            this.followCamera.lockedTarget = this.mainCharacter.collisionMesh;
        }

        setInterval(() => {
            if (!this.mainCharacter.isAlive || this.levelFinished) return;

            this.air -= this.airDrainRate;
            if (this.air < 0) this.air = 0;

            if (this.airDisplay) {
                this.airDisplay.textContent = `Air: ${Math.floor(this.air)}%`;
            }

            if (this.air <= 0) {
                this.mainCharacter.currentHP = 0;
                this.mainCharacter.isAlive = false;
                this.mainCharacter.die();
                console.log("Le personnage s'est noyé !");
            }
        }, this.airDrainInterval);

        //const bounceForce = 0.5;
        //let isInSecondLevel = true; // only allow swimming here


        const keys: Record<string, boolean> = {};

        new PhotoDome("sky", "/textures/Metal027_1K-JPG_Color.jpg", {
            resolution: 32,
            size: 1000
        }, this.scene);

       const keyMappings: Record<string, string> = {
            // QWERTY movement
            "KeyW": "forward",
            "KeyA": "right",
            "KeyS": "backward",
            "KeyD": "left",

            // AZERTY movement
            "KeyZ": "forward",
            "KeyQ": "right",

            // Arrow keys
            "ArrowUp": "forward",
            "ArrowDown": "backward",
            "ArrowLeft": "right",
            "ArrowRight": "left",

            //"ShiftLeft": "crawl",
            "KeyC": "grab",
            "Space": "up",
            "ShiftLeft": "down"
        };

        let verticalInput = 0;

        window.addEventListener("keydown", (event) => {
            const action = keyMappings[event.code];
            if (action) keys[action] = true;

            if (event.code === "Space") verticalInput = 1;
            if (event.code === "ShiftLeft") verticalInput = -1;
        });

        window.addEventListener("keyup", (event) => {
            const action = keyMappings[event.code];
            if (action) keys[action] = false;

            if (event.code === "Space" || event.code === "ShiftLeft") verticalInput = 0;
        });


        this.scene.onPointerDown = (evt, pickInfo) => {
            if (evt.button === 0) {
                this.isAttacking = true;
                console.log("Attaque avec clic gauche !");
            }
        };

        this.scene.onPointerUp = (evt) => {
            if (evt.button === 0) {
                this.isAttacking = false;
            }
        };


        this.engine.runRenderLoop(() => {
            if (this.healthDisplay != null) this.healthDisplay.textContent = `HP: ${this.mainCharacter.currentHP}/${this.mainCharacter.maxHP}`;
            if (this.donutsDisplay != null) this.donutsDisplay.textContent = `Donuts to open the red door: ${this.donutsFound}/5`;
            const pos = this.mainCharacter.collisionMesh.position;
            if (this.positionDisplay != null) this.positionDisplay.textContent = `Position: (x: ${pos.x.toFixed(2)}, y: ${pos.y.toFixed(2)}, z: ${pos.z.toFixed(2)})`;
            if(this.finishDisplay!=null && this.mainCharacter.collisionMesh.position.x>-162 && this.donutsFound!=5) this.finishDisplay.textContent = ``;
            if(this.finishDisplay!=null && this.mainCharacter.collisionMesh.position.x<=-162 && this.donutsFound==5) {
                this.finishDisplay.textContent = `COMING SOON...`;
                setTimeout(() => {
                    this.levelFinished = true;
                }, 1000);
            }
            if (!this.mainCharacter.isAlive || this.levelFinished) return;
            if(this.donutsFound==5) this.door?.dispose();

            let moveDirection = new Vector3(0, 0, 0);
            if (keys["forward"]) moveDirection.z -= 1;
            if (keys["backward"]) moveDirection.z += 1;
            if (keys["left"]) moveDirection.x -= 1;
            if (keys["right"]) moveDirection.x += 1;

            this.mainCharacter.attack(this.isAttacking);
            this.mainCharacter.updateHit();

            moveDirection.normalize();
            this.mainCharacter.move(moveDirection, this.boundary, verticalInput);
            /*if (this.mainCharacter.isSwimming) {
                this.mainCharacter.move(moveDirection, this.boundary, verticalInput);
            } else {
                // Apply gravity only when not swimming
                this.mainCharacter.applyGravity();
            }*/
            this.checkCollisionWithDonuts(this.mainCharacter);
            this.mainCharacter.applyGravity();
            this.mainCharacter.applyGravity();

            // Activer le requin quand le personnage approche
            if (!this.sharkActive && this.mainCharacter.collisionMesh.position.x <= -97) {
                this.sharkActive = true;
                console.log("Le requin est activé !");
            }

            // Si actif, fait le bouger vers le personnage
            if (this.sharkActive && this.shark && this.mainCharacter.isAlive) {
                const sharkPos = this.shark.position;
                const playerPos = this.mainCharacter.collisionMesh.position;

                const direction = playerPos.subtract(sharkPos).normalize().scale(0.05); // vitesse
                this.shark.position.addInPlace(direction);

                // Faire tourner le requin vers le joueur
                const dx = playerPos.x - sharkPos.x;
                const dz = playerPos.z - sharkPos.z;
                this.shark.rotation.y = Math.atan2(dx, dz);
            }

            this.checkCollisionWithShark(this.mainCharacter);

            this.scene.render();


            this.fishTime += this.engine.getDeltaTime() * 0.001; // Convert to seconds

            this.fishes.forEach((fish, i) => {
                const angle = this.fishTime * this.fishSwimSpeed + i;
                const radius = this.fishSwimRadius + (i % 3); // Vary radii
                const yOscillation = Math.sin(angle * 2) * 0.5;

                fish.position.x += Math.sin(angle) * 0.02;
                fish.position.z += Math.cos(angle) * 0.02;
                fish.position.y += yOscillation * 0.002;

                // Face forward
                fish.rotation.y = Math.atan2(
                    Math.cos(angle),
                    -Math.sin(angle)
                );
            });

            // Détection de proximité avec les poissons
            for (const fish of this.fishes) {
                const fishPos = fish.getAbsolutePosition();
                const playerPos = this.mainCharacter.collisionMesh.getAbsolutePosition();

                const distance = Vector3.Distance(fishPos, playerPos);

                if (distance < 3) {
                    // Supprime le mesh du poisson
                    fish.dispose();

                    // Supprime le poisson du tableau
                    const index = this.fishes.indexOf(fish);
                    if (index !== -1) {
                        this.fishes.splice(index, 1);
                    }

                    // Réinitialise l'air
                    if (this.air < this.maxAir) {
                        this.air = this.maxAir;
                        if (this.airDisplay) {
                            this.airDisplay.textContent = `Air: ${this.air}%`;
                        }
                    }

                    console.log("Fish collected! Air replenished.");

                    break;
                }
            }


        });
    }
}
