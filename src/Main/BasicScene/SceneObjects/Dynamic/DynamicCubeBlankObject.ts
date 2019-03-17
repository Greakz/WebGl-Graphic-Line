import {DynamicSceneObject} from "../../../../Core/Scene/DynamicSceneObject";
import {CubeModelBlank} from "../../Models/Textures/CubeModelBlank";

export class DynamicCubeBlankObject extends DynamicSceneObject {
    readonly model: CubeModelBlank = new CubeModelBlank(this);
    update(time: number) {

    }
}