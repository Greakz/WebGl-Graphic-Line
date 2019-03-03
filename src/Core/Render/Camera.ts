import { mat4 } from '../Geometry/Matrix/mat'
import { getIdentityMat4 } from '../Geometry/Matrix/identity';
import { flatMat4 } from '../Geometry/Matrix/flatten';
import { lookAtMatrix } from '../Geometry/Matrix/lookAt';
import { getPerspectiveMatrix } from '../Geometry/Matrix/perspective';
import { radians } from '../Geometry/radians';
import { MainController } from '../Controller/MainController';
import {LogInterface} from "../Util/LogInstance";
import LogInstance from "../Util/LogInstance";
import {flatVec3} from "../Geometry/Vector/flatten";
import {vec3} from "../Geometry/Vector/vec";
import {invertMatrix} from "../Geometry/Matrix/inivert";

export interface Camera {
    getProjectionMatrix(): mat4;

    getViewMatrix(): mat4;

    bindCamera(GL: WebGL2RenderingContext): void
    bindForLightningPass(GL: WebGL2RenderingContext): void

    update(time: number): void;
}

export class SimpleCamera implements Camera {
    private static readonly Log: LogInterface = LogInstance;

    position: vec3 = {x: 4, y: 3, z: 8};
    target: vec3 = {x: 0, y: 0, z: 0};

    nearPlane: number = 0.5;
    farPlane: number = 100;
    fovDeg: number = 45;

    protected projection_matrix: mat4;
    protected view_matrix: mat4;
    protected undo_projection_matrix: mat4;
    protected undo_view_matrix: mat4;

    constructor() {
        this.recalculateMatrices();
    }

    recalculateMatrices() {
        this.projection_matrix = getPerspectiveMatrix(
            radians(this.fovDeg),
            1, // MainController.CanvasController.getAspect(),
            this.nearPlane,
            this.farPlane
        );
        this.view_matrix = lookAtMatrix(
            this.position,
            this.target,
            {x: 0, y: 1, z: 0}
        );
        this.undo_projection_matrix = invertMatrix(this.projection_matrix);
        this.undo_view_matrix = invertMatrix(this.view_matrix);
    }

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

    bindForLightningPass(GL: WebGL2RenderingContext) {
        GL.uniformMatrix4fv(
            MainController.ShaderController.getDeferredLightningShader().uniform_locations.undo_view_matrix,
            false,
            new Float32Array(flatMat4(this.undo_view_matrix))
        );
        GL.uniformMatrix4fv(
            MainController.ShaderController.getDeferredLightningShader().uniform_locations.undo_projection_matrix,
            false,
            new Float32Array(flatMat4(this.undo_projection_matrix))
        );
        GL.uniform3fv(
            MainController.ShaderController.getDeferredLightningShader().uniform_locations.camera_position,
            new Float32Array(flatVec3(this.position))
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