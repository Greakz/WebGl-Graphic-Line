import { mat4 } from './mat4'

export function flatMat4(mat4: mat4) {
    return [
        mat4[0][0], mat4[0][1], mat4[0][2], mat4[0][3],
        mat4[1][0], mat4[1][1], mat4[1][2], mat4[1][3],
        mat4[2][0], mat4[2][1], mat4[2][2], mat4[2][3],
        mat4[3][0], mat4[3][1], mat4[3][2], mat4[3][3],
    ]
}