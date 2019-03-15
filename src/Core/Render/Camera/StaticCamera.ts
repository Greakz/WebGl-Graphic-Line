import {BaseCamera, Camera} from "./Camera";
import {vec3} from "../../Geometry/Vector/vec";

export class StaticCamera extends BaseCamera implements Camera {
    position: vec3 = {x: 4, y: 8, z: 4};
    target: vec3 = {x: 0, y: 0.0, z: 0};
}