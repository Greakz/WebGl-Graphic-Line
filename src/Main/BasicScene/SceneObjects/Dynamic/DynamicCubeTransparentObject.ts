import {DynamicSceneObject} from "../../../../Core/Scene/DynamicSceneObject";
import {CubeModelTransparent} from "../../Models/CubeModelTransparent";

export class DynamicCubeTransparentObject extends DynamicSceneObject {
    readonly model: CubeModelTransparent = new CubeModelTransparent(this);
    update(time: number) {

    }
}