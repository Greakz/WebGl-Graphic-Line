import {StaticSceneObject} from "../../../../Core/Scene/StaticSceneObject";
import {PlaneModel} from "../../Models/PlaneModel";

export class StaticPlaneObject extends StaticSceneObject {
    readonly model: PlaneModel = new PlaneModel(this);
    update(time: number) {
    }
}