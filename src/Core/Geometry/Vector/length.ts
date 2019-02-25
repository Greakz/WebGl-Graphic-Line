import { vec3, vec4 } from './vec';

export function lengthVec3(vec: vec3): number {
    return Math.sqrt(
        Math.pow(vec.x, 2)
        + Math.pow(vec.y, 2)
        + Math.pow(vec.z, 2)
    );
}
export function lengthVec4(vec: vec4): number {
    return Math.sqrt(
        Math.pow(vec.x, 2)
        + Math.pow(vec.y, 2)
        + Math.pow(vec.z, 2)
        + Math.pow(vec.w, 2)
    );
}