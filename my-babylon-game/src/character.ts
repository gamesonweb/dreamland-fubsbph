import {
    Scene,
    Vector3,
    SceneLoader,
    AbstractMesh,
    StandardMaterial,
    Color3,
    Mesh,
    MeshBuilder,
    Ray
} from "@babylonjs/core";
import TestLevel from "./TestLevel";

export default class Character {
    public mesh!: Mesh; // Заменим позже на AbstractMesh если надо
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
    private readonly hitDuration: number = 10;
    private readonly hitBounceForce: number = 0.3;
    public maxHP: number = 10;
    public currentHP: number = 10;
    public isAlive: boolean = true;
    private initialPosition: Vector3;
    private level: TestLevel;
    public isLoaded: boolean = false; 
    constructor(scene: Scene, position: Vector3, color: Color3, level: TestLevel) {
        this.level = level;
        this.scene = scene;
        this.initialPosition = position.clone();

        SceneLoader.ImportMesh(
            null,
            "/", 
            "CHARACTAR.glb", 
            this.scene,
            (meshes) => {
                this.mesh = meshes[0] as Mesh;
                this.mesh.position = new Vector3(position.x, position.y, position.z);
                this.mesh.scaling = new Vector3(1, 1, 1);
                this.mesh.checkCollisions = true;
                this.mesh.showBoundingBox = true;
                //this.mesh.rotation.x -= Math.PI;

                const material = new StandardMaterial("characterMat", this.scene);
                material.diffuseColor = color;
                this.mesh.material = material;

                //this.mesh.ellipsoid = new Vector3(0.5, 0.9, 0.5);
                //this.mesh.ellipsoidOffset = new Vector3(0, 0.9, 0);

                this.createAattackCUbe();

                this.isLoaded = true; 
            }
        );
    }

    public move(direction: Vector3, _boundary: number) {
        if (!this.isLoaded) return;

        if (this.isCrawling) {
            direction.scaleInPlace(0.3);
        }

        this.mesh.moveWithCollisions(direction.scale(this.speed));

        if (this.attackCube) {
            this.attackCube.position = this.mesh.position.clone();
        }

        this.checkForStepDown();
    }

    public jump() {
        if (!this.isLoaded) return;
        if (this.canJump) {
            this.velocityY = this.defaultJumpStrength;
            this.isJumping = true;
            this.canJump = false;
            setTimeout(() => this.canJump = true, 500);
        }
    }

    public applyGravity() {
        if (!this.isLoaded) return;

        if (this.isJumping) {
            this.mesh.moveWithCollisions(new Vector3(0, this.velocityY, 0));
            this.velocityY += this.gravity;
        }
    }

    public isGrounded(): boolean {
        if (!this.isLoaded) return false;

        const ray = new Ray(this.mesh.position, new Vector3(0, -1, 0), 1.5);
        const hit = this.scene.pickWithRay(ray, (mesh) => {
            return mesh.isPickable && mesh.checkCollisions && mesh !== this.mesh;
        });

        return hit !== null && hit.pickedMesh !== null;
    }

    private checkForStepDown() {
        if (!this.isLoaded) return;

        const ray = new Ray(this.mesh.position, new Vector3(0, -1, 0), 1.5);
        const hit = this.scene.pickWithRay(ray);

        if (hit && hit.pickedMesh) {
            let stepHeight = hit.pickedPoint ? hit.pickedPoint.y : 0;
            let heightDifference = this.mesh.position.y - stepHeight;

            if (heightDifference > 0.2) {
                this.mesh.moveWithCollisions(new Vector3(0, -0.3, 0));
            }
        }
    }

    public crawl(start: boolean) {
        this.isCrawling = start;

        if (!this.isLoaded) return;

        if (start) {
            this.mesh.scaling.y = 0.5;
        } else {
            this.mesh.scaling.y = 1;
            this.jumpStrength = this.defaultJumpStrength;
        }
    }

    public grabObject(start: boolean) {
        this.isGrabbing = start;
    }

    public createAattackCUbe() {
        this.attackCube = MeshBuilder.CreateBox("attackCube", { size: 2.5 }, this.scene);
        this.attackCube.position = this.mesh?.position.clone() ?? new Vector3(0, 0, 0);

        const attackMaterial = new StandardMaterial("attackMaterial", this.scene);
        attackMaterial.diffuseColor = Color3.Red();
        attackMaterial.alpha = 0;
        this.attackCube.material = attackMaterial;
    }

    public attack(isAttacking: boolean) {
        if (this.attackCube && this.attackCube.material) {
            this.attackCube.material.alpha = isAttacking ? 0.2 : 0;
        }
    }

    public getHit(direction: Vector3) {
        if (!this.isAlive || !this.isLoaded) return;

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
        if (this.attackCube) this.attackCube.setEnabled(false);

        setTimeout(() => {
            this.level.resetLevel();
            this.respawn();
        }, 2000);
    }

    public respawn() {
        this.level.resetLevel();
        const newCharacter = new Character(this.level.scene, this.initialPosition, Color3.Red(), this.level);
        this.level.starting(newCharacter);
    }

    public updateHit() {
        if (!this.isLoaded) return;

        if (this.isHit && this.hitTimer > 0) {
            this.mesh.position.x += this.hitDirection.x * this.hitBounceForce;
            this.mesh.position.z += this.hitDirection.z * this.hitBounceForce;

            if (this.attackCube) {
                this.attackCube.position.x = this.mesh.position.x;
                this.attackCube.position.z = this.mesh.position.z;
            }

            this.hitTimer--;
        } else {
            this.isHit = false;
        }
    }
}
