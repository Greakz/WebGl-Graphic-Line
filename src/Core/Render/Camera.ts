import { mat4 } from '../Geometry/Matrix/mat'
import { getIdentityMat4 } from '../Geometry/Matrix/identity';
import { flatMat4 } from '../Geometry/Matrix/flatten';
import { lookAtMatrix } from '../Geometry/Matrix/lookAt';
import { getPerspectiveMatrix } from '../Geometry/Matrix/perspective';
import { radians } from '../Geometry/radians';
import { MainController } from '../Controller/MainController';
import {LogInterface} from "../Util/LogInstance";
import LogInstance from "../Util/LogInstance";

export interface Camera {
    getProjectionMatrix(): mat4;

    getViewMatrix(): mat4;

    bindCamera(GL: WebGL2RenderingContext): void

    update(time: number): void;
}

export class SimpleCamera implements Camera {
    private static readonly Log: LogInterface = LogInstance;

    protected projection_matrix: mat4 = getPerspectiveMatrix(
        radians(45),
        MainController.CanvasController.getAspect(),
        0.5,
        100
    );
    protected view_matrix: mat4 = lookAtMatrix(
        {x: 0, y: 0, z: 5},
        {x: 0, y: 0, z: 0},
        {x: 0, y: 1, z: 0}
    );

    bindCamera(GL: WebGL2RenderingContext): void {
        // SimpleCamera.Log.info('Camera', 'binding Scene-Camera');
        GL.uniformMatrix4fv(
            MainController.ShaderController.getGeometryShader().uniform_locations.view_matrix,
            false,
            new Float32Array(flatMat4(this.view_matrix))
        );
        GL.uniformMatrix4fv(
            MainController.ShaderController.getGeometryShader().uniform_locations.projection_matrix,
            false,
            new Float32Array(flatMat4(this.projection_matrix))
        );
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