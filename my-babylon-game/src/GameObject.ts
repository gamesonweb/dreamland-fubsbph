import { Scene, SceneLoader, Vector3, Mesh } from "@babylonjs/core";
import "@babylonjs/loaders";

export class GameObject {
    public mesh: Mesh | null = null; // Основная 3D-модель
    public collisionCube: Mesh | null = null;

    constructor(scene: Scene, modelPath: string, fileName: string, position: Vector3, scale: Vector3, onLoad?: (mesh: Mesh) => void) {
        SceneLoader.ImportMesh("", modelPath, fileName, scene, (meshes) => {
            if (meshes.length > 0) {
                this.mesh = meshes[0] as Mesh;
                this.mesh.position = position;
                this.mesh.scaling = scale;
                this.mesh.checkCollisions = true;

                // Вызываем callback, если он передан
                if (onLoad) {
                    onLoad(this.mesh);
                }
            }
        });
    }

    // Метод для перемещения объекта
    public move(direction: Vector3) {
        if (this.mesh) {
            this.mesh.moveWithCollisions(direction);
        }
    }

    // Метод для клонирования объекта
    public clone(scene: Scene, name: string, position: Vector3): GameObject | null {
        if (!this.mesh) return null;
        const newMesh = this.mesh.clone(name);
        if (newMesh) {
            newMesh.position = position;
            return new GameObject(scene, "", "", position, newMesh.scaling);
        }
        return null;
    }

    // Проверка, загружен ли объект
    public isLoaded(): boolean {
        return this.mesh !== null;
    }

}
