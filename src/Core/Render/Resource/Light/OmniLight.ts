import {vec3} from "../../../Geometry/Vector/vec";
import {MainController} from "../../../Controller/MainController";

export class OmniLight {
    position: vec3;
    color: vec3;
    limit: vec3;
    amb_factor: vec3;
    diff_factor: vec3;
    spec_factor: vec3;

    readonly scene_light_id: number = MainController.getNextSceneLightId();
}