import {MainController} from "../Controller/MainController";
import {Model} from "../Render/Model";

export class SceneObject {
    static readonly scene_object_type: 'static' | 'dynamic' | 'undefined' = 'undefined';
    readonly scene_object_id: number = MainController.getNextSceneObjectId();;
    readonly model: Model;

    update(time: number): void {}
}