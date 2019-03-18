import {Model} from "../../../Core/Render/Model";
import {DrawMesh} from "../../../Core/Render/DrawMesh";
import {CubeMesh} from "./Meshes/CubeMesh";
import {BaseMaterial} from "./Materials/BaseMaterial";
import {SceneObject} from "../../../Core/Scene/SceneObject";


export class CubeModelBlank extends Model {
    public draw_meshes: DrawMesh[] = [
        new DrawMesh(this, new CubeMesh(), new BaseMaterial()),
    ];
    constructor(related_scene_object: SceneObject) {
        super(related_scene_object);
    }
}