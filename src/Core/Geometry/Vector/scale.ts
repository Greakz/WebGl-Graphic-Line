import { vec3, vec4 } from './vec';

export function scaleVec3(a: vec3, scalar: number): vec3 {
    return {
        x: a.x * scalar,
        y: a.y * scalar,
        z: a.z * scalar
    }
}
export function scaleVec4(a: vec4, scalar: number): vec4 {
    return {
        x: a.x * scalar,
        y: a.y * scalar,
        z: a.z * scalar,
        w: a.w * scalar
    }
}