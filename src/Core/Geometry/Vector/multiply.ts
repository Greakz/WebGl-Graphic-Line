import { vec3, vec4 } from './vec';
import { mat4 } from '../Matrix/mat';
import { flatMat4 } from '../Matrix/flatten';

export function multiplyMat4Vec3(matrixIn: mat4, pointIn: vec3): vec3 {
    const res: vec4 =  multiplyMat4Vec4(matrixIn, {...pointIn, w: 1});
    return {x: res.x, y: res.y, z: res.z};
}

export function multiplyMat4Vec4(matrixIn: mat4, pointIn: vec4): vec4 {

    let matrix = flatMat4(matrixIn);

    let x = pointIn.x, y = pointIn.y, z = pointIn.z, w = pointIn.w;
    let c1r1 = matrix[0], c2r1 = matrix[1], c3r1 = matrix[2], c4r1 = matrix[3],
        c1r2 = matrix[4], c2r2 = matrix[5], c3r2 = matrix[6], c4r2 = matrix[7],
        c1r3 = matrix[8], c2r3 = matrix[9], c3r3 = matrix[10], c4r3 = matrix[11],
        c1r4 = matrix[12], c2r4 = matrix[13], c3r4 = matrix[14], c4r4 = matrix[15];
    return {
        x: x * c1r1 + y * c1r2 + z * c1r3 + w * c1r4,
        y: x * c2r1 + y * c2r2 + z * c2r3 + w * c2r4,
        z: x * c3r1 + y * c3r2 + z * c3r3 + w * c3r4,
        w: x * c4r1 + y * c4r2 + z * c4r3 + w * c4r4
    };
}