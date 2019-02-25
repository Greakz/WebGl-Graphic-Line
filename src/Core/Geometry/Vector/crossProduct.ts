import { vec3 } from './vec';

export function crossProductVec3(vector_one: vec3, vector_two: vec3): vec3 {
    return {
        x: vector_one.y * vector_two.z - vector_one.z * vector_two.y,
        y: vector_one.z * vector_two.x - vector_one.x * vector_two.z,
        z: vector_one.x * vector_two.y - vector_one.y * vector_two.x
    }
}