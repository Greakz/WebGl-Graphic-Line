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

    bingForGeometryShader(GL: WebGL2RenderingContext): void
    bindForDeferredLightningShader(GL: WebGL2RenderingContext): void
    bindForLightBulbShader(GL: WebGL2RenderingContext): void

    update(time: number): void;

    position: vec3;
    target: vec3;

    nearPlane: number;
    farPlane: number;
    fovDeg: number;
}

export class SimpleCamera implements Camera {
    private static readonly Log: LogInterface = LogInstance;

    position: vec3 = {x: 4, y: 8, z: 4};
    target: vec3 = {x: 0, y: 0.0, z: 0};

    nearPlane: number = 0.5;
    farPlane: number = 200;
    fovDeg: number = 45;

    protected proj_mat_a_1: mat4;
    protected proj_mat_a_v: mat4;
    protected view_matrix: mat4;
    protected undo_projection_matrix: mat4;
    protected undo_view_matrix: mat4;

    private calced_aspect: number = 0;

    constructor() {
        this.recalculateMatrices();
    }

    recalculateMatrices() {
        this.recalculatePerspective();
        this.recalculateViewMatrix();

    }
    recalculatePerspective() {
        this.calced_aspect = MainController.CanvasController.getAspect();
        this.proj_mat_a_1 = getPerspectiveMatrix(
            radians(this.fovDeg),
            1,
            this.nearPlane,
            this.farPlane
        );
        let fovY;
        if (this.calced_aspect > 1) {
            const height = 1 / this.calced_aspect;
            fovY = this.fovDeg * height;
        } else {
            fovY = this.fovDeg;
        }
        this.proj_mat_a_v = getPerspectiveMatrix(
            radians(fovY),
            this.calced_aspect,
            this.nearPlane,
            this.farPlane
        );
        this.undo_projection_matrix = invertMatrix(this.proj_mat_a_1);
    }
    recalculateViewMatrix() {
        this.view_matrix = lookAtMatrix(
            this.position,
            this.target,
            {x: 0, y: 1, z: 0}
        );
        this.undo_view_matrix = invertMatrix(this.view_matrix);
    }

    bingForGeometryShader(GL: WebGL2RenderingContext): void {
        // SimpleCamera.Log.info('Camera', 'binding Scene-Camera');
        GL.uniformMatrix4fv(
            MainController.ShaderController.getGeometryShader().uniform_locations.view_matrix,
            false,
            new Float32Array(flatMat4(this.view_matrix))
        );
        GL.uniformMatrix4fv(
            MainController.ShaderController.getGeometryShader().uniform_locations.projection_matrix,
            false,
            new Float32Array(flatMat4(this.proj_mat_a_1))
        );
        GL.uniform1f(
            MainController.ShaderController.getGeometryShader().uniform_locations.near_plane,
            this.nearPlane
        );
        GL.uniform1f(
            MainController.ShaderController.getGeometryShader().uniform_locations.far_plane,
            this.farPlane
        );
    }

    bindForDeferredLightningShader(GL: WebGL2RenderingContext) {
        GL.uniform3fv(
            MainController.ShaderController.getDeferredLightningShader().uniform_locations.camera_position,
            new Float32Array(flatVec3(this.position))
        );
    }

    bindForLightBulbShader(GL: WebGL2RenderingContext) {
        GL.uniformMatrix4fv(
            MainController.ShaderController.getLightBulbShader().uniform_locations.view_matrix,
            false,
            new Float32Array(flatMat4(this.view_matrix))
        );
        GL.uniformMatrix4fv(
            MainController.ShaderController.getLightBulbShader().uniform_locations.projection_matrix,
            false,
            new Float32Array(flatMat4(this.proj_mat_a_1))
        );
        GL.uniform1f(
            MainController.ShaderController.getLightBulbShader().uniform_locations.near_plane,
            this.nearPlane
        );
        GL.uniform1f(
            MainController.ShaderController.getLightBulbShader().uniform_locations.far_plane,
            this.farPlane
        );
    }

    setProjectionMatrix(new_matrix: mat4): void {
        this.proj_mat_a_1 = new_matrix
    }

    getProjectionMatrix(): mat4 {
        return this.proj_mat_a_1;
    }

    setViewMatrix(new_matrix: mat4): void {
        this.view_matrix = new_matrix
    }

    getViewMatrix(): mat4 {
        return this.view_matrix
    }

    update(time: number) {
        const position: number = (time * 0.0001) % (2 * Math.PI);

        this.position = {
            x: Math.sin(position) * 50,
            y: 34,
            z: Math.cos(position) * 50
        };
        this.recalculateViewMatrix();
        if(this.calced_aspect !== MainController.CanvasController.getAspect()) {
            this.recalculatePerspective();
        }
    }
}