import {vec2, vec3} from "../../../Geometry/Vector/vec";
import {MainController} from "../../../Controller/MainController";
import {radians} from "../../../Geometry/radians";

export class SpotLight {
    position: vec3 = {x: 0, y: 0, z: 0};
    color: vec3 = {x: 1.0, y: 1.0, z: 1.0};
    direction: vec3 = {x: 0.0, y: -1.0, z: 0.0};
    constant: number = 1.0;
    linear: number = 0.22;
    quadric: number = 0.2;
    inner_cutoff: number =  Math.cos(radians(20));
    outer_cutoff: number =  Math.cos(radians(32));
    amb_factor: vec3 = {x: 0, y: 0, z: 0};
    diff_factor: vec3 = {x: 1, y: 1, z: 1};
    spec_factor: vec3 = {x: 1, y: 1, z: 1};

    readonly scene_light_id: number = MainController.getNextSceneLightId();
    bulbOpacity(): number {
        return 0.1
    }
}
