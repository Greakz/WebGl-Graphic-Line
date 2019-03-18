import {Model} from "../../../Core/Render/Model";
import {DrawMesh} from "../../../Core/Render/DrawMesh";
import {CubeMesh} from "./Meshes/CubeMesh";
import {SceneObject} from "../../../Core/Scene/SceneObject";
import {TransparentMaterial} from "./Materials/TransparentMaterial";


export class CubeModelTransparent extends Model {
    public draw_meshes: DrawMesh[] = [
        new DrawMesh(this, new CubeMesh(), new TransparentMaterial()),
    ];
    constructor(related_scene_object: SceneObject) {
        super(related_scene_object);
    }
}