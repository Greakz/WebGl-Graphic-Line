import {MainController} from "../Controller/MainController";
import {Model} from "../Render/Model";

export class SceneObject {
    static readonly scene_object_type: 'static' | 'dynamic' | 'undefined' = 'undefined';
    readonly scene_object_id: number;
    readonly model: Model;

    constructor() {
        this.scene_object_id = MainController.getNextSceneObjectId();
    }

    update(time: number): void {}
}