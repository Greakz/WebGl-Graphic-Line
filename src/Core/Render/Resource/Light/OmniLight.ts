import {vec3} from "../../../Geometry/Vector/vec";
import {MainController} from "../../../Controller/MainController";

export class OmniLight {
    position: vec3 = {x: 0.0, y: 0.0, z: 0.0};
    color: vec3 = {x: 1.0, y: 1.0, z: 1.0};
    constant: number = 1.0;
    linear: number = 0.25;
    quadric: number = 0.18;
    amb_factor: vec3 = {x: 0, y: 0, z: 0};
    diff_factor: vec3 = {x: 1, y: 1, z: 1};
    spec_factor: vec3 = {x: 1, y: 1, z: 1};

    readonly scene_light_id: number = MainController.getNextSceneLightId();

    bulbOpacity(): number {
        return 0.2
    }
}