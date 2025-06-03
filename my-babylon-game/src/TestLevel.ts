import { Scene, Texture, Engine, HemisphericLight, Vector3, MeshBuilder, StandardMaterial, Color3, SceneLoader, Mesh, Camera, FollowCamera, TransformNode, Tools } from "@babylonjs/core";
import "@babylonjs/loaders";
import Character from "./character";
//import { GameObject } from "./GameObject";
//import { CSG } from "@babylonjs/core/Meshes/csg";
import { PhotoDome } from "@babylonjs/core";
import { BoundingBox } from "@babylonjs/core/Culling/boundingBox";
import { Spider } from "./Spider";
import { GameObject } from "./GameObject";
import { Boss } from "./Boss";

export default class TestLevel {
    public ready: Promise<void>;
    public scene: Scene;
    private groundSize: number = 20;
    public ground: any;
    public cube: any;
    public donuts: GameObject[] = []; // USE GameObject INSTEAD OF Mesh[]
    public spiders: Spider[] = []; // USE GameObject INSTEAD OF Mesh[]
    public canvas: HTMLCanvasElement;
    public engine: Engine;
    public boundary = this.groundSize / 2 - 1; // Character movement boundaries
    public isAttacking = false;
    private healthDisplay: HTMLElement | undefined;
    private donutsDisplay: HTMLElement | undefined;
    //private initialCharacterPosition: Vector3 = new Vector3(0, 0.6, 0);
    private positionDisplay: HTMLElement | undefined;
    private finishDisplay: HTMLElement | undefined;
    private donutsFound: number;
    private boss: Boss | undefined;
    private levelFinished: boolean = false;

    constructor() {
        //this.mainCharacter = mainCharacter;
        this.canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);
        this.donutsFound = 0;
        const loadingDiv = document.getElementById("loadingScreen");
        if (loadingDiv) loadingDiv.style.display = "flex";
        this.ready = this.createLevel().then(() => {
            if (loadingDiv) {
                loadingDiv.classList.add("fade-out");
                setTimeout(() => loadingDiv.remove(), 1000);
            }
        });
    }

    public async createLevel() {
        this.donutsFound = 0;
        this.spiders = [];
        this.donuts = [];
        this.createLighting();
        this.createGround();
        //this.scene.collisionsEnabled = true;
        this.createCube();
        this.createBorders();
        this.healthDisplay = document.getElementById("healthDisplay")!;
        this.positionDisplay = document.getElementById("positionDisplay")!;
        this.donutsDisplay = document.getElementById("donutsDisplay")!;
        this.finishDisplay = document.getElementById("finishDisplay")!;
        this.scene.collisionsEnabled = true;
        await Promise.all([
            this.loadBoss(),
            this.loadLevel(),
            this.loadSpiders(),
            this.loadDonuts()
        ]);
    }

    public async resetLevel() {
        this.scene.dispose();
        this.scene = new Scene(this.engine);
        //this.createLevel();
        const loadingDiv = document.getElementById("loadingScreen");
        if (loadingDiv) loadingDiv.style.display = "flex";
        this.ready = this.createLevel().then(() => {
            if (loadingDiv) {
                loadingDiv.classList.add("fade-out");
                setTimeout(() => loadingDiv.remove(), 1000);
            }
        });
    }


    private createLighting() {
        const light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
        light.intensity = 0.7;
    }

    private createGround() {
        this.ground = MeshBuilder.CreateGround("ground", { width: 30.38, height: 14.7 }, this.scene);
        this.ground.position = new Vector3(-14.81, 0, -1.9);
        const groundMaterial = new StandardMaterial("groundMat", this.scene);
        const groundTexture = new Texture("/textures/floor11.jpg", this.scene);
        groundMaterial.diffuseTexture = groundTexture;
        this.ground.material = groundMaterial;
        this.ground.checkCollisions = true;

        // Dimensions
        const wallThickness = 0.2;
        const wallHeight = 5;

        // Back Wall (Z- side)
        const backWall = MeshBuilder.CreateBox("backWall", {
            width: 30.5, // same as ground width
            height: wallHeight,
            depth: wallThickness
        }, this.scene);

        backWall.position = new Vector3(
            -14.7,
            wallHeight / 2, // elevate so it's on top of the ground
            -1 - (15 / 2) // push to back edge
        );

        backWall.isVisible = false;
        backWall.checkCollisions = true;
        backWall.freezeWorldMatrix();

        // Front Wall (Z+ side)
        const frontWall = MeshBuilder.CreateBox("frontWall", {
            width: 30.5,
            height: wallHeight,
            depth: wallThickness
        }, this.scene);

        frontWall.position = new Vector3(
            -14.7,
            wallHeight / 2,
            -1.9 + (15 / 2)
        );

        frontWall.isVisible = false;
        frontWall.checkCollisions = true;
        frontWall.freezeWorldMatrix();

    }


    //private loadLevel(): void {
    public async loadLevel(): Promise<void> {
        return new Promise((resolve) => {
            SceneLoader.ImportMesh(null, "/", "no_stairs_1lvl.glb", this.scene, (meshes) => {
                console.log("Level loaded!", meshes);

                meshes.forEach(mesh => {
                mesh.checkCollisions = true;
                mesh.receiveShadows = true;
                });
                meshes[0].position = new Vector3(-50.5, -10.50, 0);
                meshes[0].rotation = new Vector3(0, Tools.ToRadians(-90), 0);

                //Add invisible ground under the model !!!!!!!!! IF WE NEED IT !!!!!!!
                //11111111111111111111111111111111111111
                const invisibleGround1 = MeshBuilder.CreateGround("invisibleGround", {
                    width: 200,
                    height: 50
                }, this.scene);

                invisibleGround1.position = new Vector3(-51.2, -10.51, 0); // Just below the level
                invisibleGround1.isVisible = false; // Make it invisible
                invisibleGround1.checkCollisions = true; // Enable collision
                const groundMaterial1 = new StandardMaterial("groundMat", this.scene);
                const groundTexture1 = new Texture("/textures/Metal027_1K-JPG_Color.jpg", this.scene);
                groundMaterial1.diffuseTexture = groundTexture1;
                invisibleGround1.material = groundMaterial1;


                ///222222222222222222222222222222222222
                const invisibleGround2 = MeshBuilder.CreateGround("invisibleGround", {
                    width: 48,
                    height: 100
                }, this.scene);

                invisibleGround2.position = new Vector3(-82, -8.3, 0); // Just below the level
                invisibleGround2.isVisible = false; // Make it invisible
                invisibleGround2.checkCollisions = true; // Enable collision
                const groundMaterial2 = new StandardMaterial("groundMat", this.scene);
                const groundTexture2 = new Texture("/textures/Metal027_1K-JPG_Color.jpg", this.scene);
                groundMaterial2.diffuseTexture = groundTexture2;
                invisibleGround2.material = groundMaterial2;

                const wallThickness = 0.5; // thin box wall
                const wallHeight = 100;      // height of the wall
                const groundWidth = 65;
                const groundDepth = 8.8;
                const groundCenter = new Vector3(-63.2, -10.51, 0);

                // Back wall
                const backWall = MeshBuilder.CreateBox("backWall", {
                    width: groundWidth,
                    height: wallHeight,
                    depth: wallThickness
                }, this.scene);

                backWall.position = new Vector3(
                    groundCenter.x,
                    groundCenter.y + wallHeight / 2,
                    groundCenter.z - groundDepth / 2
                );
                backWall.isVisible = false;
                backWall.checkCollisions = true;
                backWall.freezeWorldMatrix();

                // Front wall
                const frontWall = MeshBuilder.CreateBox("frontWall", {
                    width: groundWidth,
                    height: wallHeight,
                    depth: wallThickness
                }, this.scene);

                frontWall.position = new Vector3(
                    groundCenter.x,
                    groundCenter.y + wallHeight / 2,
                    groundCenter.z + groundDepth / 2
                );
                frontWall.isVisible = false;
                frontWall.checkCollisions = true;
                frontWall.freezeWorldMatrix();
            });

            SceneLoader.ImportMesh(null, "/", "bedroomm.glb", this.scene, (meshes) => {
                console.log("Level loaded!", meshes);

                meshes.forEach(mesh => {
                mesh.checkCollisions = true;
                mesh.receiveShadows = true;
                });
                meshes[0].position = new Vector3(-4.65, 0, -1.95);
                meshes[0].rotation = new Vector3(0, Math.PI*2, 0);
                resolve();

            });
        });

    }

    private createCube() {
        this.cube = MeshBuilder.CreateBox("pushableCube", { size: 3 }, this.scene);
        this.cube.position = new Vector3(-47, -9, 0.14);
        const cubeMaterial = new StandardMaterial("cubeMat", this.scene);
        const texturePath = "/textures/Metal029_1K-JPG_Color.jpg"; // Adjust path if needed
        const texture = new Texture(texturePath, this.scene);
        cubeMaterial.diffuseTexture = texture;
        this.cube.material = cubeMaterial;
        this.cube.checkCollisions = true;
    }


    private loadDonuts() {
        const donutPositions = [
            new Vector3(-41, -9, -4),
            new Vector3(-60, -5.5, 0),
            new Vector3(-76, -7.5, -2.64),
            new Vector3(-110, -6.59, 5.27),
            new Vector3(-111.16, -6.59, -2.22)
        ];

        donutPositions.forEach((pos, index) => {
            const donut = new GameObject(this.scene, "/", "donut.glb", pos, new Vector3(5, 5, 5));
            this.donuts.push(donut);
        });

        console.log("Donuts are being loaded...");
    }

    private loadSpiders(){
        const spidersPositions = [
            new Vector3(-75, -8, 0.36),
            new Vector3(-80, -8, 0.36),
            new Vector3(-85, -8, 0.36),
        ];
        spidersPositions.forEach((pos, index) => {
            let spider = new Spider(this.scene, "/", "spider.glb", pos, new Vector3(5, 5, 5));
            this.spiders.push(spider);
        });

    }

    private loadBoss(){
        const bossPositions = new Vector3(-108, -5.83, 0);
        this.boss = new Boss(this.scene, "/", "spider.glb", bossPositions, new Vector3(7, 7, 7));
    }

    checkBoundaries(object: any){
        if (object.position.x > this.boundary) object.position.x = this.boundary;
        //if (object.position.x < -this.boundary) object.position.x = -this.boundary;
        if (object.position.z > this.boundary) object.position.z = this.boundary;
        if (object.position.z < -this.boundary) object.position.z = -this.boundary;
    }

    private checkCollisionWithSpiders(mainCharacter: Character, bounceForce: number) {
        if (!mainCharacter.isAlive) return;
        const spidersToCheck = [...this.spiders];

        spidersToCheck.forEach(spider => {
            if (spider.collisionCube) {
                const distance = Vector3.Distance(mainCharacter.collisionMesh.position, spider.collisionCube.position);
                const distanceCube = Vector3.Distance(this.cube.position, spider.collisionCube.position);

                if (distance < 2) {
                    const direction = mainCharacter.collisionMesh.position.subtract(spider.collisionCube.position).normalize();
                    mainCharacter.getHit(direction);
                    mainCharacter.collisionMesh.position.x += direction.x * bounceForce;
                    mainCharacter.collisionMesh.position.z += direction.z * bounceForce;
                    mainCharacter.mesh.position = mainCharacter.collisionMesh.position.clone(); // Sync model position
                }

                if (distanceCube < 2 && !mainCharacter.isGrabbing) {
                    const direction = mainCharacter.collisionMesh.position.subtract(spider.collisionCube.position).normalize();
                }

                if ((distance < 2 && mainCharacter.isGrabbing) || (distanceCube < 2 && mainCharacter.isGrabbing)) {
                    const direction = mainCharacter.collisionMesh.position.subtract(spider.collisionCube.position).normalize();
                    mainCharacter.collisionMesh.position.x += direction.x * bounceForce;
                    mainCharacter.collisionMesh.position.z += direction.z * bounceForce;
                    mainCharacter.mesh.position = mainCharacter.collisionMesh.position.clone();
                }
            }
        });
    }

    private checkCollisionWithBoss(mainCharacter: Character) {
        if (!mainCharacter.isAlive) return;

        if (this.boss?.attackCube) {
            const distance = Vector3.Distance(mainCharacter.collisionMesh.position, this.boss?.attackCube.position);
            if (distance < 5) {
                mainCharacter.getHit(new Vector3(0));
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

    starting(mainCharacter: Character) : Character{
        const bounceForce = 0.5;
        const camera = new FollowCamera("FollowCam", new Vector3(0, 5, -10), this.scene);
        camera.lockedTarget = mainCharacter.collisionMesh; // The camera follows the character
        camera.radius = 10;
        camera.heightOffset = 5;
        camera.rotationOffset = 0;
        // Disable user camera controls
        camera.inputs.clear();

        const keys: Record<string, boolean> = {}; // Store pressed keys

        new PhotoDome("sky", "/textures/Metal027_1K-JPG_Color.jpg", {
            resolution: 32,
            size: 1000
        }, this.scene);

        const keyMappings: Record<string, string> = {
            "KeyW": "forward",
            "KeyS": "backward",
            "KeyA": "right",
            "KeyD": "left",
            // AZERTY movement
            "KeyZ": "forward",
            "KeyQ": "left",
            "ArrowUp": "forward",
            "ArrowDown": "backward",
            "ArrowLeft": "right",
            "ArrowRight": "left",
            "ShiftLeft": "crawl",
            "KeyC": "grab",
        };

        this.scene.onPointerDown = (evt, pickInfo) => {
            if (evt.button === 0) { // Clic gauche
                this.isAttacking = true;
                console.log("Attaque avec clic gauche !");

                // Vérifier la collision PHYSIQUE entre attackCube et les araignées
                this.spiders.forEach(spider => {
                    if (spider.collisionCube && mainCharacter.attackCube) {
                        const spiderBox = spider.collisionCube.getBoundingInfo().boundingBox;
                        const attackBox = mainCharacter.attackCube.getBoundingInfo().boundingBox;

                        if (BoundingBox.Intersects(spiderBox, attackBox)) {
                            // Calculer la direction du coup (du personnage vers l'araignée)
                            const direction = spider.collisionCube.position.subtract(mainCharacter.collisionMesh.position).normalize();

                            // Infliger des dégâts avec la direction
                            spider.getHit(direction);

                            console.log("Araignée touchée ! HP restant :", spider.hp);

                            if (spider.hp <= 0) {
                                spider.mesh?.dispose();
                                spider.collisionCube?.dispose();
                                const index = this.spiders.indexOf(spider);
                                if (index !== -1) {
                                    this.spiders.splice(index, 1);
                                }
                            }
                        }
                    }
                });

                if(this.boss!=null){
                    if (this.boss.collisionCube && mainCharacter.attackCube) {
                        const bossBox = this.boss.collisionCube.getBoundingInfo().boundingBox;
                        const attackBox = mainCharacter.attackCube.getBoundingInfo().boundingBox;

                        if (BoundingBox.Intersects(bossBox, attackBox)) {

                            this.boss.getHit();

                            console.log("Boss touchée ! HP restant :", this.boss.hp);

                            if (this.boss.hp <= 0) {
                                this.boss.mesh?.dispose();
                                this.boss.collisionCube?.dispose();
                                this.boss.attackCube?.dispose;
                                /*if(this.finishDisplay!=null) this.finishDisplay.textContent = `LEVEL FINISHED`;
                                setTimeout(() => {
                                    this.levelFinished = true;
                                }, 1000);*/
                            }
                        }
                    }
                }
            }
        };

        this.scene.onPointerUp = (evt) => {
            if (evt.button === 0) {
                this.isAttacking = false;
            }
        };

        window.addEventListener("keydown", (event) => {
            const action = keyMappings[event.code];
            if (action) keys[action] = true;

            // Crawl mechanic
            if (event.code === "ShiftLeft") {
                mainCharacter.crawl(true);
            }

            if (event.code === "KeyC") {
                mainCharacter.isGrabbing = true;
            }

            if (event.code === "Space" && !mainCharacter.isJumping && mainCharacter.mesh.scaling.y === 1) {
                mainCharacter.velocityY = mainCharacter.jumpStrength;
                mainCharacter.isJumping = true;
            }

            if (event.code === "Space" && mainCharacter.isGrounded() && mainCharacter.canJump) {
                mainCharacter.jump();
            }
        });

        // Handle key release events
        window.addEventListener("keyup", (event) => {
            const action = keyMappings[event.code];
            if (action) keys[action] = false;

            // Restore normal size when shift is released
            if (event.code === "ShiftLeft") {
                mainCharacter.crawl(false);
            }

            if (event.code === "KeyC") {
                mainCharacter.isGrabbing = false;
            }
        });

        this.engine.runRenderLoop(() => {
            //if (!mainCharacter.isAlive || !mainCharacter.isLoaded) return;
            if( this.healthDisplay!=null) this.healthDisplay.textContent = `HP: ${mainCharacter.currentHP}/${mainCharacter.maxHP}`;
            if( this.donutsDisplay!=null) this.donutsDisplay.textContent = `donuts: ${this.donutsFound}/5`;
            const pos = mainCharacter.collisionMesh.position;
            if(this.positionDisplay!=null) this.positionDisplay.textContent = `Position: (x: ${pos.x.toFixed(2)}, y: ${pos.y.toFixed(2)}, z: ${pos.z.toFixed(2)})`;
            if(this.finishDisplay!=null && this.boss!=null && this.boss.hp>0) this.finishDisplay.textContent = ``;

            if (!mainCharacter.isAlive || this.levelFinished) return;


            let moveDirection = new Vector3(0, 0, 0);
            // Determine movement direction
            if (keys["forward"]) moveDirection.z -= 1;
            if (keys["backward"]) moveDirection.z += 1;
            if (keys["left"]) moveDirection.x -= 1;
            if (keys["right"]) moveDirection.x += 1;
            mainCharacter.attack(this.isAttacking);
            // Mettre à jour le recul du personnage
            mainCharacter.updateHit();

            moveDirection.normalize();
            mainCharacter.move(moveDirection, this.boundary);
            // Gravity
            mainCharacter.applyGravity();
            mainCharacter.applyGravity();
            //mainCharacter.applyGravity();

            // Check for collisions with any of the donuts
            this.checkCollisionWithDonuts(mainCharacter);
            if(mainCharacter.collisionMesh.position._x<-60){
                this.spiders.forEach(spider => {
                    spider.crawl(mainCharacter, this.spiders);
                    spider.update(); // Ajoutez cette ligne
                });
            }
            //this.checkBoundaries(mainCharacter.collisionMesh);
            this.checkCollisionWithSpiders(mainCharacter,bounceForce);

            if(this.boss!=null && this.boss.hp>0) this.boss?.update();
            this.checkCollisionWithBoss(mainCharacter);

            const cubeDistance = Vector3.Distance(mainCharacter.collisionMesh.position, this.cube.position);
            //console.log(cubeDistance)
            if (cubeDistance < 2.8 && mainCharacter.isGrabbing) {
                mainCharacter.speed = 0.025;
                this.cube.moveWithCollisions(moveDirection.scale(mainCharacter.speed));
                //this.cube.position.y = this.cube.scaling.y * 0.5;
                this.checkBoundaries(this.cube);
                console.log("grab");
            }
            else if (cubeDistance > 1.5){
                mainCharacter.speed = 0.1;
            }

            this.scene.render();
        });
        return mainCharacter;
    }

    private createBorders() {
        const wallMaterial = new StandardMaterial("wallMat", this.scene);
        const wallHeight = 9.8;
        const wallThickness = 0.2;
        const groundSize = this.groundSize ?? 15; // default fallback if undefined

        // LEFT WALL (No Door, Goes Under Ground)
        const leftWall = MeshBuilder.CreateBox("leftWall", {
            width: wallThickness,
            height: wallHeight,
            depth: groundSize
        }, this.scene);

        // Drop wall underground by aligning bottom to ground level
        leftWall.position.x = -groundSize * 1.5;
        leftWall.position.y = wallHeight / 2 - 10; // 10 units below ground
        leftWall.material = wallMaterial;
        leftWall.checkCollisions = true;
        leftWall.isVisible = false;
        leftWall.freezeWorldMatrix();

        // **Create Stairs Descending from the Door**
        this.createStairs();
    }


    private createStairs(xPos: number = -30.5, width: number = 4) {
        const stairMaterial = new StandardMaterial("stairMat", this.scene);
        const woodTexture = new Texture("/textures/Metal029_1K-JPG_Roughness.jpg", this.scene);
        stairMaterial.diffuseTexture = woodTexture;

        const stairDepth = width;
        const stairWidth = 1; // Thickness of each step
        const stairHeight = 1;
        const stairCount = 10; // Number of steps

        for (let i = 0; i < stairCount; i++) {
            const step = MeshBuilder.CreateBox(`stair${i}`, {
                width: stairWidth,
                height: stairHeight,
                depth: stairDepth
            }, this.scene);

            step.position.x = xPos - stairWidth * i; // Move steps further from the door
            step.position.y = stairHeight * (stairCount - i - 10.5); // Lower each step
            step.position.z = 0; // Center with door

            step.material = stairMaterial;
            step.checkCollisions = true;
        }
    }

}
