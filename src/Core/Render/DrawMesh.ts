import {Transformation} from "../Geometry/Transformation/Transformation";
import {Model} from "./Model";
import {Mesh} from "./Resource/Mesh";
import {Material} from "./Resource/Material";
import {MainController} from "../Controller/MainController";

export class DrawMesh {
    transformation: Transformation = new Transformation();
    readonly related_model: Model;
    readonly related_mesh: Mesh;
    readonly related_material: Material;

    constructor(related_model: Model, related_mesh: Mesh, related_material: Material) {
        this.related_model = related_model;
        this.related_mesh = MainController.ResourceController.getMesh(related_mesh);
        this.related_material = MainController.ResourceController.getMaterial(related_material);
    }
}