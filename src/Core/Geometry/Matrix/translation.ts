import { mat4 } from './mat';

export function getTranslationMatrix(x: number, y: number, z: number): mat4 {
    return [
        [1, 0, 0, 0],
        [0, 1, 0, 0],
        [0, 0, 1, 0],
        [x, y, z, 1]
    ];
}