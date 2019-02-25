import { vec3, vec4 } from './vec';

export function flatVec3(vec3: vec3): Float32Array {
    return new Float32Array([vec3.x, vec3.y, vec3.z]);
}
export function flatVec4(vec4: vec4): Float32Array {
    return new Float32Array([vec4.x, vec4.y, vec4.z, vec4.w]);
}