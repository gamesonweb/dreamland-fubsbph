import { Scene, Vector3, MeshBuilder, StandardMaterial, Color3, Color4, Mesh, Ray, SceneLoader, AbstractMesh, TransformNode, AnimationGroup } from "@babylonjs/core";
import TestLevel from "./TestLevel";
import SecondLevel from "./SecondLevel";
import { ParticleSystem, Texture } from "@babylonjs/core";


export default class Character {
    public mesh: TransformNode; // Root node for the character model
    private scene: Scene;
    public speed: number = 0.1;
    public jumpStrength: number = 0;
    public defaultJumpStrength: number = 0.3;
    public gravity: number = -0.005;
    public velocityY: number = 0;
    public isJumping: boolean = false;
    public isCrawling: boolean = false;
    public canJump: boolean = true;
    public isGrabbing: boolean = false;
    public attackCube: Mesh | null = null;
    private isHit: boolean = false;
    private hitDirection: Vector3 = Vector3.Zero();
    private hitTimer: number = 0;
    private readonly hitDuration: number = 10; // Duration of knockback in frames
    private readonly hitBounceForce: number = 0.3; // Knockback force
    public maxHP: number = 10;
    public currentHP: number = 10;
    public isAlive: boolean = true;
    private initialPosition: Vector3;
    private level: TestLevel | SecondLevel;
    public collisionMesh: Mesh; // Invisible mesh for collisions
    private animationGroups: { [key: string]: AnimationGroup } = {};
    private currentAnimation: AnimationGroup | null = null;
    private currentActionState: string = "standing(main)";
    private isPlayingNonLooping: boolean = false;
    private bubbleSystem: ParticleSystem | null = null;
    public isSwimming: boolean = false;


    constructor(scene: Scene, position: Vector3, level: TestLevel | SecondLevel) {
        this.level = level;
        this.scene = scene;
        this.initialPosition = position.clone();

        // Create an invisible collision mesh (box) for simplified collisions
        this.collisionMesh = MeshBuilder.CreateBox("characterCollision", { size: 1.2 }, scene);
        this.collisionMesh.position = position;
        this.collisionMesh.isVisible = false;///////""
        this.collisionMesh.checkCollisions = true;
        this.collisionMesh.showBoundingBox = false; /////////""

        const debugMat = new StandardMaterial("debugMat", this.scene);
        debugMat.alpha = 0.2;
        this.collisionMesh.material = debugMat;


        // Initialize a TransformNode as the root for the character model
        this.mesh = new TransformNode("characterRoot", scene);
        this.mesh.position = position;

        // Load the .glb model
        this.loadCharacterModel(position);

        this.createAttackCube();
    }

    private async loadCharacterModel(position: Vector3) {
        try {
            const result = await SceneLoader.ImportMeshAsync("", "/", "LIZAfinal2.glb", this.scene);
            const rootMesh = result.meshes[0] as AbstractMesh;

            rootMesh.parent = this.mesh;
            rootMesh.position = Vector3.Zero();
            rootMesh.scaling = new Vector3(1, 1, 1);
            rootMesh.rotation = new Vector3(0, Math.PI * 1.5, 0);

            this.collisionMesh.ellipsoid = new Vector3(0.7, 1.2, 0.6);
            this.collisionMesh.ellipsoidOffset = new Vector3(0, 0.6, 0);

            result.animationGroups.forEach((group) => {
                this.animationGroups[group.name.toLowerCase()] = group;
                console.log(`Animation ${group.name}: ${group.to - group.from} frames`);
                console.log(`${group.name}: frames ${group.from} -> ${group.to}`);
            });

            this.animationGroups["jumping"].speedRatio = 1.7; // Slow down if too fast
            this.animationGroups["walking"].speedRatio = 3.5; // Adjust for natural walking pace
            //this.animationGroups["crouching"].speedRatio = 1.0;  // Adjust for natural crouchinging
            this.animationGroups["swimming"].speedRatio = 3.5; // Adjust for natural swimming pace
            this.animationGroups["standing in water"].speedRatio = 1.0; // Adjust

            // Debug: Log available animations
            console.log("Available animations:", Object.keys(this.animationGroups));

            // set default animation in swimming mode
            if (this.isSwimming && this.animationGroups["standing in water"]) {
                this.setAnimation("standing in water", true);
                this.currentActionState = "standing in water";
            } else {
                this.setAnimation("standing(main)");
                this.currentActionState = "standing(main)";
            }

            //this.setAnimation("standing(main)");
            //this.currentActionState = "standing(main)";
        } catch (error) {
            console.error("Failed to load character model:", error);
            const fallbackMesh = MeshBuilder.CreateSphere("characterFallback", { diameter: 1.2 }, this.scene);
            fallbackMesh.parent = this.mesh;
            const material = new StandardMaterial("fallbackMat", this.scene);
            material.diffuseColor = Color3.White();
            material.alpha = 0;
            fallbackMesh.material = material;
        }
    }

    /*private setAnimation(animationName: string, loop: boolean = true) {      ///first one
        //const currentTime = performance.now();

        if (this.currentAnimation === this.animationGroups[animationName.toLowerCase()] && this.currentAnimation.isPlaying) {
            return;
        }

        if (this.currentAnimation) {
            this.currentAnimation.stop();
        }

        const animation = this.animationGroups[animationName.toLowerCase()];
        if (animation) {
            console.log(`Playing animation: ${animationName}, Loop: ${loop}`);
            animation.play(loop);
            this.currentAnimation = animation;
            this.isPlayingNonLooping = !loop;
            this.currentActionState = animationName.toLowerCase();
            //this.lastAnimationStartTime = currentTime;

            // Add observer for non-looping animations to transition back to standing(main)
            if (!loop) {
                animation.onAnimationEndObservable.addOnce(() => {
                    console.log(`Animation ${animationName} ended`);
                    this.isPlayingNonLooping = false;
                    if (this.currentActionState === animationName.toLowerCase()) {
                        //check if its not swimming mode now
                        if (this.isSwimming && this.animationGroups["standing in water"]){
                            this.setAnimation("standing in water");
                            this.currentActionState = "standing in water";
                        } else  {
                            // Fallback to standing(main) animation
                            this.setAnimation("standing(main)");
                            this.currentActionState = "standing(main)";
                        }
                    
                        //this.setAnimation("standing(main)");
                        //this.currentActionState = "standing(main)";
                    }
                });
            }
        } else {
            console.warn(`Animation ${animationName} not found`);

            // Check if the fallback animation exists before calling setAnimation
            if (animationName.toLowerCase() !== "standing(main)" && this.animationGroups["standing(main)"]) {
                this.setAnimation("standing(main)");
                this.currentActionState = "standing(main)";
            } else {
                console.error("Fallback animation 'standing(main)' is also missing. Cannot play any animation.");
                this.currentAnimation = null;
                this.currentActionState = "";
            }
        }
    }

    private setAnimation(animationName: string, loop: boolean = true) {
        const key = animationName.toLowerCase();
        const animation = this.animationGroups[key];

        // Если уже играем нужную анимацию с тем же loop — выходим
        if (this.currentAnimation === animation && this.currentAnimation?.isPlaying && animation?.loopAnimation === loop) {
            return;
        }

        //  Остановить предыдущую
        if (this.currentAnimation) {
            this.currentAnimation.stop();
        }

        if (animation) {
            animation.reset(); // начать с начала
            animation.loopAnimation = loop; // поставить флаг ЗАРАНЕЕ
            animation.play(loop);

            this.currentAnimation = animation;
            this.currentActionState = key;
            this.isPlayingNonLooping = !loop;

            console.log(`Playing ${animation.name} from ${animation.from} to ${animation.to}, loop: ${loop}`);

            if (!loop) {
                animation.onAnimationEndObservable.addOnce(() => {
                    this.isPlayingNonLooping = false;
                    if (this.currentActionState === key) {
                        if (this.isSwimming && this.animationGroups["standing in water"]) {
                            this.setAnimation("standing in water", true);
                            this.currentActionState = "standing in water";
                        } else {
                            this.setAnimation("standing(main)", true);
                            this.currentActionState = "standing(main)";
                        }
                    }
                });
            }
        } else {
            console.warn(`Animation '${animationName}' not found`);
        }
    }*/

    private setAnimation(animationName: string, loop: boolean = true) {
    if (
        this.currentAnimation === this.animationGroups[animationName.toLowerCase()] &&
        this.currentAnimation.isPlaying
    ) {
        return;
    }

    if (this.currentAnimation) {
        this.currentAnimation.stop();
    }

    const animation = this.animationGroups[animationName.toLowerCase()];
    if (animation) {
        console.log(`Playing animation: ${animationName}, Loop: ${loop}`);
        animation.reset();
        animation.loopAnimation = loop; // <— важно!
        animation.play(loop);

        this.currentAnimation = animation;
        this.isPlayingNonLooping = !loop;
        this.currentActionState = animationName.toLowerCase();

        if (!loop) {
            animation.onAnimationEndObservable.addOnce(() => {
                console.log(`Animation ${animationName} ended`);
                this.isPlayingNonLooping = false;

                if (this.currentActionState === animationName.toLowerCase()) {
                    if (this.isSwimming && this.animationGroups["standing in water"]) {
                        this.setAnimation("standing in water", true);
                    } else {
                        this.setAnimation("standing(main)", true);
                    }
                }
            });
        }
    } else {
        console.warn(`Animation ${animationName} not found`);
        if (this.animationGroups["standing(main)"]) {
            this.setAnimation("standing(main)", true);
        }
    }
}



   public move(direction: Vector3, _boundary: number, verticalInput: number = 0) {

        // original movement logic below
        if (this.isPlayingNonLooping) {
            this.collisionMesh.moveWithCollisions(direction.scale(this.speed));
            this.mesh.position = this.collisionMesh.position.clone();
            if (this.attackCube) {
                this.attackCube.position = this.mesh.position.clone();
            }
            this.checkForStepDown();
            return;
        }


       if (this.isSwimming) {
            const swimDirection = new Vector3(direction.x, verticalInput, direction.z);
            const normalizedDirection = swimDirection.length() > 0 ? swimDirection.normalize() : Vector3.Zero();

            this.collisionMesh.moveWithCollisions(normalizedDirection.scale(this.speed));
            this.mesh.position = this.collisionMesh.position.clone();
            if (this.attackCube) this.attackCube.position = this.mesh.position.clone();

            // Rotate in Y (turn left/right)
            if (normalizedDirection.length() > 0.01) {
                const angleY = Math.atan2(-normalizedDirection.x, -normalizedDirection.z);
                this.mesh.rotation.y = angleY + Math.PI * 1.5;
                this.mesh.rotation.z = -verticalInput;
            
                // Play swimming animation if moving
                if (this.currentActionState !== "swimming" && !this.isPlayingNonLooping) {
                    this.setAnimation("swimming", false);
                    this.currentActionState = "swimming";
                }
            } else {
                this.mesh.rotation.x = 0;///$$$$$$$$$$$$$$$$$$$$$$$$$$
                // Idle in water animation
                if (this.currentActionState !== "standing in water" && !this.isPlayingNonLooping) {
                    this.setAnimation("standing in water", true);
                    this.currentActionState = "standing in water";
                }
            }
            return;
        }
        console.log("Current Action:", this.currentActionState, "Is playing non-looping:", this.isPlayingNonLooping);


        if (direction.length() > 0 && this.currentActionState !== "walking") {
            this.setAnimation("walking", false);
            this.currentActionState = "walking";
        } else if (direction.length() === 0 && !this.isPlayingNonLooping) {
            this.setAnimation("standing(main)");
            this.currentActionState = "standing(main)";
        }

        if (direction.x !== 0 || direction.z !== 0) {
            const angle = Math.atan2(-direction.x, -direction.z);
            this.mesh.rotation.y = angle + Math.PI * 1.5;
        }

        this.collisionMesh.moveWithCollisions(direction.scale(this.speed));
        this.mesh.position = this.collisionMesh.position.clone();
        if (this.attackCube) {
            this.attackCube.position = this.mesh.position.clone();
        }
        this.checkForStepDown();
    }


    // Jump method
    public jump() {
        if (this.canJump && !this.isPlayingNonLooping) {
            this.setAnimation("jumping", false); // Start jump animation immediately
            this.currentActionState = "jumping";
            this.velocityY = this.defaultJumpStrength;
            this.isJumping = true;
            this.canJump = false;
            setTimeout(() => (this.canJump = true), 500); // Reset jump ability after a delay
            console.log("Jump initiated, animation started");
        }
    }

    // Apply gravity
    public applyGravity() {
        if (this.isSwimming){
        
            return;
        } else if (this.isJumping) {
            this.collisionMesh.moveWithCollisions(new Vector3(0, this.velocityY, 0));
            this.mesh.position = this.collisionMesh.position.clone(); // Sync model
            this.velocityY += this.gravity;
            if (this.attackCube) {
                this.attackCube.position = this.mesh.position.clone();
            }
            // Reset to standing(main) after jump when grounded
            if (this.isGrounded() && !this.isPlayingNonLooping) {
                this.isJumping = false;
                if (this.currentActionState !== "standing(main)") {
                    this.setAnimation("standing(main)");
                    this.currentActionState = "standing(main)";
                }
            }
        }
    }

    // Check if the character is on the ground
    public isGrounded(): boolean {
        const ray = new Ray(this.collisionMesh.position, new Vector3(0, -1, 0), 999999);
        const hit = this.scene.pickWithRay(ray, (mesh) => {
            return mesh.isPickable && mesh.checkCollisions && mesh !== this.collisionMesh;
        });
        return hit !== null && hit.pickedMesh !== null;
    }

    // Check for step-down when moving
    private checkForStepDown() {
        const ray = new Ray(this.collisionMesh.position, new Vector3(0, -1, 0), 1.5);
        const hit = this.scene.pickWithRay(ray);

        if (hit && hit.pickedPoint) {
            let stepHeight = hit.pickedPoint.y;
            let heightDifference = this.collisionMesh.position.y - stepHeight;

            if (heightDifference > 0.2) {
                this.collisionMesh.moveWithCollisions(new Vector3(0, -0.3, 0));
                this.mesh.position = this.collisionMesh.position.clone();
                if (this.attackCube) {
                    this.attackCube.position = this.mesh.position.clone();
                }
            }
        }
    }

    // Crawling method
    public crawl(start: boolean) {
        if (this.isCrawling !== start) {
            //this.isCrawling = start;
            if (start) {
                //this.mesh.scaling.y = 0.5;
                this.collisionMesh.scaling.y = 0.5;
                this.collisionMesh.ellipsoid = new Vector3(0.6, 0.6, 0.6);
                this.collisionMesh.ellipsoidOffset = new Vector3(0, 0.3, 0);
                if (this.currentActionState !== "crouching") {
                    this.setAnimation("crouching", false); // Play crouching once
                    this.currentActionState = "crouching";
                }
            } else {
                this.mesh.scaling.y = 1;
                this.collisionMesh.scaling.y = 1;
                this.collisionMesh.ellipsoid = new Vector3(0.6, 1.2, 0.6);
                this.collisionMesh.ellipsoidOffset = new Vector3(0, 0.6, 0);
                if (this.currentActionState !== "standing(main)" && !this.isPlayingNonLooping) {
                    this.setAnimation("standing(main)");
                    this.currentActionState = "standing(main)";
                }
            }
        }
    }

    public setSwimmingMode(active: boolean) {
        if (this.isSwimming === active) return;// Prevent redundant calls///////////////////////////////////

        this.isSwimming = active;

        //if (this.currentActionState !== "swimming" && !this.isPlayingNonLooping) {
          //  this.setAnimation("swimming", false); 
           // this.currentActionState = "swimming";
        //}


        if (active) {
            //this.setAnimation("swimming", true);
            //this.currentActionState = "swimming";

            this.createBubbleParticles();
            this.bubbleSystem?.start();
        } else {//if (this.currentActionState !== "standing in water" && !this.isPlayingNonLooping) {
            this.setAnimation("standing in water");
            this.currentActionState = "standing in water";

            this.bubbleSystem?.stop();
        }
    }


    // Interaction with objects (grabbing)
    public grabObject(start: boolean) {
        this.isGrabbing = start;
    }

    // Attack method: creates a red transparent cube around the character
    public createAttackCube() {
        this.attackCube = MeshBuilder.CreateBox("attackCube", { size: 2 }, this.scene);
        this.attackCube.position = this.mesh.position.clone();
        const attackMaterial = new StandardMaterial("attackMaterial", this.scene);
        attackMaterial.diffuseColor = Color3.White();
        attackMaterial.alpha = 0;
        this.attackCube.material = attackMaterial;
    }

    public attack(isAttacking: boolean) {
        if (this.attackCube && this.attackCube.material) {
            if (isAttacking) {
                this.setAnimation("punch", false); // Fixed typo from "punch" to "punch", play once
                this.currentActionState = "punch";
                this.attackCube.material.alpha = 0.2;
            } else {
                //check if the player is swimming
                if (this.isSwimming) {
                    this.setAnimation("standing in water", true);
                    this.currentActionState = "standing in water";
                } else if (this.currentActionState !== "standing(main)" && !this.isPlayingNonLooping) {
                    // Fallback to standing(main) animation
                    this.setAnimation("standing(main)", true);
                    this.currentActionState = "standing(main)";
                }
                
                this.attackCube.material.alpha = 0;
            }
        }
    }

    public getHit(direction: Vector3) {
        if (!this.isAlive) return;
        this.currentHP -= 1;
        console.log(`Player hit! HP remaining: ${this.currentHP}/${this.maxHP}`);

        this.isHit = true;
        this.hitTimer = this.hitDuration;
        this.hitDirection = new Vector3(direction.x, 0, direction.z).normalize();

        if (this.currentHP <= 0) {
            this.die();
        }
    }

    public die() {
        this.isAlive = false;
        console.log("Player died!");
        this.mesh.setEnabled(false);
        this.collisionMesh.setEnabled(false);
        if (this.attackCube) this.attackCube.setEnabled(false);

        setTimeout(() => {
            this.level.resetLevel();
            this.respawn();
        }, 2000);
    }

    public respawn() {
        this.level.resetLevel();
        const newCharacter = new Character(this.level.scene, this.initialPosition, this.level);
        this.level.starting(newCharacter);
    }

    public updateHit() {
        if (this.isHit && this.hitTimer > 0) {
            this.collisionMesh.position.x += this.hitDirection.x * this.hitBounceForce;
            this.collisionMesh.position.z += this.hitDirection.z * this.hitBounceForce;
            this.mesh.position = this.collisionMesh.position.clone();
            if (this.attackCube) {
                this.attackCube.position = this.mesh.position.clone();
            }
            this.hitTimer--;
        } else {
            this.isHit = false;
        }
    }


    private createBubbleParticles() {
        if (this.bubbleSystem) return;

        this.bubbleSystem = new ParticleSystem("bubbles", 200, this.scene);

        // Replace with your bubble texture path or use built-in
        this.bubbleSystem.particleTexture = new Texture("/textures/bubble.png", this.scene);

        this.bubbleSystem.emitter = this.collisionMesh; // Emit from character

        this.bubbleSystem.minEmitBox = new Vector3(0, 0, 0);
        this.bubbleSystem.maxEmitBox = new Vector3(0, 0.5, 0); // Emit upward

        this.bubbleSystem.color1 = new Color4(1, 1, 1);
        this.bubbleSystem.color2 = new Color4(0.8, 0.8, 1);
        this.bubbleSystem.colorDead = new Color4(0.9, 0.9, 1, 1);

        this.bubbleSystem.minSize = 0.05;
        this.bubbleSystem.maxSize = 0.1;

        this.bubbleSystem.minLifeTime = 0.5;
        this.bubbleSystem.maxLifeTime = 1.5;

        this.bubbleSystem.emitRate = 10;

        this.bubbleSystem.direction1 = new Vector3(0, 1, 0);
        this.bubbleSystem.direction2 = new Vector3(0.2, 1, 0.2);

        this.bubbleSystem.minAngularSpeed = 0;
        this.bubbleSystem.maxAngularSpeed = Math.PI;

        this.bubbleSystem.minEmitPower = 0.1;
        this.bubbleSystem.maxEmitPower = 0.2;

        this.bubbleSystem.updateSpeed = 0.02;
    }


}