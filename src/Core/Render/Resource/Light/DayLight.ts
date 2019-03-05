import {vec3} from "../../../Geometry/Vector/vec";

export class DayLight {
    color: vec3 = {x: 0.85, y: 0.85, z: 1.0};
    direction: vec3 = {x: -0.5, y: -0.5, z: -0.5};
    amb_factor: vec3 = {x: 0.28, y: 0.28, z: 0.28};
    diffuse_factor: vec3 = {x: 0.8, y: 0.8, z: 0.8};
    specular_factor: vec3 = {x: 0.4, y: 0.4, z: 0.4};
    update(time: number) {}
}