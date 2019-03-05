import {vec2, vec3} from "../../../Geometry/Vector/vec";
import {MainController} from "../../../Controller/MainController";

export class SpotLight {
    position: vec3;
    color: vec3;
    direction: vec3;
    limit: vec3;
    cutoff: vec2;
    amb_factor: vec3;
    diff_factor: vec3;
    spec_factor: vec3;

    readonly scene_light_id: number = MainController.getNextSceneLightId();
}
