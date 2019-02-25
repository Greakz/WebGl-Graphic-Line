import { vec3, vec4 } from './vec';

export function compareVec3AGreaterB(a: vec3, b: vec3) {
    return (
        a.x * a.x
        + a.y * a.y
        + a.z * a.z
        >
        b.x * b.x
        + b.y * b.y
        + b.z * b.z
    );
}
export function compareVec4AGreaterB(a: vec4, b: vec4) {
    return (
        a.x * a.x
        + a.y * a.y
        + a.z * a.z
        + a.w * a.w
        >
        b.x * b.x
        + b.y * b.y
        + b.z * b.z
        + b.w * b.w
    );
}