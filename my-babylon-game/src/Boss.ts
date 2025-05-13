import { Scene, Vector3, MeshBuilder, StandardMaterial, BoundingInfo, Mesh, Quaternion, Axis, Space, Color3 } from "@babylonjs/core";
import { GameObject } from "./GameObject";

export class Boss extends GameObject {
    public collisionCube: Mesh | null = null;
    public hp = 10;
    public attackCube: Mesh | null = null;
    private scene: Scene;
    private attackTimer: number = 0;
    private attackInterval: number = 60;

    constructor(scene: Scene, modelPath: string, fileName: string, position: Vector3, scale: Vector3, speed: number = 0.1) {
        super(scene, modelPath, fileName, position, scale, (mesh) => {
            const min = new Vector3(-0.25, -0.25, -0.4);
            const max = new Vector3(0.25, 0.25, 0.4);
            mesh.setBoundingInfo(new BoundingInfo(min, max));
            mesh.showBoundingBox = true;

            this.createCollisionCube(scene, position, scale, min, max);

            const angle = Math.PI / 2;
            mesh.rotationQuaternion = Quaternion.FromEulerAngles(0, angle, 0);
            if (this.collisionCube) {
                this.collisionCube.rotationQuaternion = Quaternion.FromEulerAngles(0, angle, 0);
            }
            if (this.collisionCube) {
                this.collisionCube.rotation.y = angle;
            }
            //this.createAattackCUbe();
        });
        this.scene = scene;
    }

    private createCollisionCube(scene: Scene, position: Vector3, scale: Vector3, min: Vector3, max: Vector3) {
        const size = max.subtract(min);

        this.collisionCube = MeshBuilder.CreateBox("bossCollisionCube", {
            width: size.x,
            height: size.y,
            depth: size.z
        }, scene);

        this.collisionCube.position = position;
        this.collisionCube.scaling = scale;

        const material = new StandardMaterial("collisionMaterial", scene);
        material.alpha = 0;
        this.collisionCube.material = material;
        this.collisionCube.checkCollisions = true;
    }

    public getHit() {
        this.hp -= 1;
    }

    public createAattackCUbe() {
        // Create the cube around the character
        this.attackCube = MeshBuilder.CreateBox("attackCube", { size: 7 }, this.scene);
        if(this.mesh!=null) this.attackCube.position = this.mesh.position.clone();

        // Create a material for the cube
        const attackMaterial = new StandardMaterial("attackMaterial", this.scene);
        attackMaterial.diffuseColor = Color3.Purple();
        attackMaterial.alpha = 0.8;
        this.attackCube.material = attackMaterial;
    }

    public update() {
        this.attackTimer++;

        if (this.attackTimer >= this.attackInterval) {
            this.createAattackCUbe();
            this.attackTimer = 0;
        }

        // Faire disparaître le cube après 1 seconde
        if (this.attackTimer === 1 && this.attackCube) { // 1 seconde à 60 fps
            this.attackCube.dispose();
            this.attackCube = null;
        }
    }
}