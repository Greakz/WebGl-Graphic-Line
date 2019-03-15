import {vec2, vec3, vec4} from './vec';

export function subtractVec2(a: vec2, b: vec2): vec2 {
    return {
        x: a.x - b.x,
        y: a.y - b.y,
    }
}
export function subtractVec3(a: vec3, b: vec3): vec3 {
    return {
        x: a.x - b.x,
        y: a.y - b.y,
        z: a.z - b.z
    }
}
export function subtractVec4(a: vec4, b: vec4): vec4 {
    return {
        x: a.x - b.x,
        y: a.y - b.y,
        z: a.z - b.z,
        w: a.w - b.w
    }
}