import {StaticSceneObject} from "../../../../Core/Scene/StaticSceneObject";
import {Model} from "../../../../Core/Render/Model";
import {CubeModel} from "../../Models/CubeModel";
import {DynamicSceneObject} from "../../../../Core/Scene/DynamicSceneObject";

export class DynamicCubeObject extends DynamicSceneObject {
    readonly model: CubeModel = new CubeModel(this);
    update(time: number) {

    }
}