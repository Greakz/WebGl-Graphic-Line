import {Model} from "../../../Core/Render/Model";
import {SceneObject} from "../../../Core/Scene/SceneObject";
import {DrawMesh} from "../../../Core/Render/DrawMesh";
import {CubeMesh} from "./Meshes/CubeMesh";
import {ContainerMaterial} from "./Materials/ContainerMaterial";

export class CubeModel extends Model {
    public draw_meshes: DrawMesh[] = [
        new DrawMesh(this, new CubeMesh(), new ContainerMaterial()),
    ];
    constructor(related_scene_object: SceneObject) {
        super(related_scene_object);
    }
}