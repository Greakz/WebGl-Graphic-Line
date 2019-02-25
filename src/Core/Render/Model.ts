import {SceneObject} from "../Scene/SceneObject";
import {DrawMesh} from "./DrawMesh";

/**
 * Class Model
 * A Model just puts diffrent meshes together and handles any
 * animations updates on them. BasicScene based changes
 * should be performed in the related BasicScene Object.
 *
 * Needs:
 * SceneObject related_scene_object - A Reference to the SceneObject
 * DrawMesh[] draw_meshes - An Array with the related meshes that combine
 *                                the models. These RelatedMeshes get used by the
 *                                Resource Controller later, to bind the Related
 *                                Mesh!
 */
export class Model {

    public readonly related_scene_object: SceneObject;
    public draw_meshes: DrawMesh[] = [];

    constructor(related_scene_object: SceneObject) {
        this.related_scene_object = related_scene_object;
    }

}