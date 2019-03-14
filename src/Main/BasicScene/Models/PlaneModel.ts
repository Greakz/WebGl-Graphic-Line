import {Model} from "../../../Core/Render/Model";
import {SceneObject} from "../../../Core/Scene/SceneObject";
import {DrawMesh} from "../../../Core/Render/DrawMesh";
import {BaseMaterial} from "./Materials/BaseMaterial";
import {PlaneMesh} from "./Meshes/PlaneMesh";
import {ContainerMaterial} from "./Materials/ContainerMaterial";
import {DarkContainerMaterial} from "./Materials/DarkContainerMaterial";

export class PlaneModel extends Model {
    public draw_meshes: DrawMesh[] = [
        new DrawMesh(this, new PlaneMesh(), new DarkContainerMaterial()),
    ];
    constructor(related_scene_object: SceneObject) {
        super(related_scene_object);
    }
}