import {vec3} from "../../../Geometry/Vector/vec";

export class DayLight {
    color: vec3 = {x: 0.85, y: 0.85, z: 1.0};
    direction: vec3 = {x: -0.8, y: -0.4, z: 0.5};
    amb_factor: vec3 = {x: 0.1, y: 0.1, z: 0.1};
    diffuse_factor: vec3 = {x: 0.9, y: 0.9, z: 0.9};
    specular_factor: vec3 = {x: 0.2, y: 0.2, z: 0.2};
    update(time: number) {}
}