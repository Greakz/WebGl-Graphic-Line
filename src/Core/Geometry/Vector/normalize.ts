import { lengthVec3, lengthVec4 } from './length';
import { vec3, vec4 } from './vec';

export function normalizeVec3(vec: vec3): vec3 {
    const length = lengthVec3(vec);
    return {
        x: vec.x / length,
        y: vec.y / length,
        z: vec.z / length
    }
}
export function normalizeVec4(vec: vec4): vec4 {
    const length = lengthVec4(vec);
    return {
        x: vec.x / length,
        y: vec.y / length,
        z: vec.z / length,
        w: vec.w / length
    }
}