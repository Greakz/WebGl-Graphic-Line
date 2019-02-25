import { mat4 } from './mat';

export function getScalingMatrix(w: number, h: number, d: number): mat4 {
    return [
        [w, 0, 0, 0],
        [0, h, 0, 0],
        [0, 0, d, 0],
        [0, 0, 0, 1]
    ]
}