import { mat4 } from '../Geometry/Matrix/mat'
import { getIdentityMat4 } from '../Geometry/Matrix/identity';
import { flatMat4 } from '../Geometry/Matrix/flatten';
import { lookAtMatrix } from '../Geometry/Matrix/lookAt';
import { getPerspectiveMatrix } from '../Geometry/Matrix/perspective';
import { radians } from '../Geometry/radians';
import { MainController } from '../Controller/MainController';

export interface Camera {
    getProjectionMatrix(): mat4;

    getViewMatrix(): mat4;

    bindCamera(GL: WebGL2RenderingContext, camera_block_index: WebGLUniformLocation, view_matrix_location: WebGLUniformLocation): void

    update(time: number): void;
}

export class SimpleCamera implements Camera {
    protected projection_matrix: mat4 = getPerspectiveMatrix(
        radians(90),
        MainController.CanvasController.getAspect(),
        0.5,
        50
    );
    protected view_matrix: mat4 = lookAtMatrix(
        {x: 1, y: 0.5, z: 5},
        {x: 0, y: 0, z: 0},
        {x: 0, y: 1, z: 0}
    );

    bindCamera(GL: WebGL2RenderingContext,
               projection_matrix_location: WebGLUniformLocation,
               view_matrix_location: WebGLUniformLocation): void {
        GL.uniformMatrix4fv(projection_matrix_location, false, new Float32Array(flatMat4(this.projection_matrix)));
        GL.uniformMatrix4fv(view_matrix_location, false, new Float32Array(flatMat4(this.view_matrix)));
    }

    setProjectionMatrix(new_matrix: mat4): void {
        this.projection_matrix = new_matrix
    }

    getProjectionMatrix(): mat4 {
        return this.projection_matrix
    }

    setViewMatrix(new_matrix: mat4): void {
        this.view_matrix = new_matrix
    }

    getViewMatrix(): mat4 {
        return this.view_matrix
    }

    update(time: number) {

    }
}