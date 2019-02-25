import {SceneObject} from "../Scene/SceneObject";
import {DrawMesh} from "./DrawMesh";

export class Emitter {

    public readonly related_scene_object: SceneObject;
    public related_meshe: DrawMesh;

    constructor(related_scene_object: SceneObject) {
        this.related_scene_object = related_scene_object;
    }

}