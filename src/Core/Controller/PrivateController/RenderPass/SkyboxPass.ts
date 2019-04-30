import {MainController} from "../../MainController";
import {FrameInfo} from "../RenderController";
import {getScalingMatrix} from "../../../Geometry/Matrix/scaling";
import {flatMat4} from "../../../Geometry/Matrix/flatten";
import {checkFramebuffer} from "../../../Util/FramebufferCheck";
import {getPerspectiveMatrix} from "../../../Geometry/Matrix/perspective";
import {radians} from "../../../Geometry/radians";
import {lookAtMatrix} from "../../../Geometry/Matrix/lookAt";
import {CustomSkyBoxShader} from "../../../Render/Shader/CustomSkyBoxShader";
import {getRotationYMatrix} from "../../../Geometry/Matrix/rotation";
import {Skybox} from "../../../Render/Skybox/Skybox";
import {DayLight} from "../../../Render/Resource/Light/DayLight";
import {RenderOptions} from "../../../Scene/RenderOptions";


export abstract class SkyboxPass {
    //////////////////////////////
    //  INPUT TO LIGHTNING PASS
    //////////////////////////////
    static cube_vertex_buffer: WebGLBuffer;
    static cube_vao: WebGLVertexArrayObject;

    /////////////////////////////
    //  OUTPUT OF SKYBOX PASS
    /////////////////////////////
    static cubemap_gen_framebuffer: WebGLFramebuffer;
    static cubemap_gen_result: WebGLTexture;
    static cubemap_matrices: Float32Array[] = [];
    static projection_matrix: Float32Array;
    static screen_gen_framebuffer: WebGLFramebuffer;
    static screen_gen_result: WebGLTexture;

    static used_size: number = 1024

    /**
     * SINGE SETUP AT THE APPLICATION START
     */
    static appSetup(): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        //const camera: Camera = MainController.SceneController.getSceneCamera();

        const farplane = 100;
        this.model_mat = new Float32Array(flatMat4(getScalingMatrix(farplane,farplane,farplane)));
        SkyboxPass.projection_matrix = new Float32Array(flatMat4(getPerspectiveMatrix(radians(90), 1, 5.0, farplane)));
        SkyboxPass.cubemap_matrices = [
            new Float32Array(flatMat4(lookAtMatrix({x: 0, y: 0, z: 0}, {x: -1.0, y: 0.0, z: 0.0}, {x: 0.0, y: 1.0, z: 0.0}))),
            new Float32Array(flatMat4(lookAtMatrix({x: 0, y: 0, z: 0}, {x: 1.0, y: 0.0, z: 0.0}, {x: 0.0, y: 1.0, z: 0.0}))),
            new Float32Array(flatMat4(lookAtMatrix({x: 0, y: 0, z: 0}, {x: 0.0, y: 1.0, z: 0.0}, {x: 0.0, y: 0.0, z: 1.0}))),
            new Float32Array(flatMat4(lookAtMatrix({x: 0, y: 0, z: 0}, {x: 0.0, y: -1.0, z: 0.0}, {x: 0.0, y: 0.0, z: -1.0}))),
            new Float32Array(flatMat4(lookAtMatrix({x: 0, y: 0, z: 0}, {x: 0.0, y: 0.0, z: -1.0}, {x: 0.0, y: 1.0, z: 0.0}))),
            new Float32Array(flatMat4(lookAtMatrix({x: 0, y: 0, z: 0}, {x: 0.0, y: 0.0, z: 1.0}, {x: 0.0, y: 1.0, z: 0.0}))),
        ];
        GL.enable(GL.DEPTH_TEST);
        ////////////////////////////////
        // SKYBOX GENERATION
        ////////////////////////////////
        SkyboxPass.recreateStorage(GL, SkyboxPass.used_size);

        SkyboxPass.appSetupPrepareVao(GL);
    }

    /**
     * SETUP before each Frame
     * @param frame_info
     */
    static frameSetup(frame_info: FrameInfo): void {
        if(frame_info.rend_size != this.used_size) {
            this.recreateStorage(
                MainController.CanvasController.getGL(),
                frame_info.rend_size
            );
            SkyboxPass.used_size = frame_info.rend_size;
        }
    }

    /**
     * GENEREATES the skybox that is later used for the screen version and for reflections!
     */
    static runGenerateCubemapSkyboxPass(): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();

        MainController.ShaderController.useCustomSkyBoxShader();
        const cstmShader: CustomSkyBoxShader = MainController.ShaderController.getCustomSkyBoxShader();
        GL.bindFramebuffer(GL.FRAMEBUFFER, SkyboxPass.cubemap_gen_framebuffer);
        GL.viewport(0, 0, 1024, 1024);
        GL.clearColor(0.0, 0.0, 0.0, 1.0);
        GL.disable(GL.CULL_FACE);

        GL.bindVertexArray(this.cube_vao);

        GL.uniformMatrix4fv(cstmShader.uniform_locations.model_matrix, false, SkyboxPass.model_mat);
        GL.uniformMatrix4fv(cstmShader.uniform_locations.view_matrix_right, false, SkyboxPass.cubemap_matrices[0]);
        GL.uniformMatrix4fv(cstmShader.uniform_locations.view_matrix_left, false, SkyboxPass.cubemap_matrices[1]);
        GL.uniformMatrix4fv(cstmShader.uniform_locations.view_matrix_top, false, SkyboxPass.cubemap_matrices[2]);
        GL.uniformMatrix4fv(cstmShader.uniform_locations.view_matrix_bottom, false, SkyboxPass.cubemap_matrices[3]);
        GL.uniformMatrix4fv(cstmShader.uniform_locations.view_matrix_back, false, SkyboxPass.cubemap_matrices[4]);
        GL.uniformMatrix4fv(cstmShader.uniform_locations.view_matrix_front, false, SkyboxPass.cubemap_matrices[5]);
        GL.uniformMatrix4fv(cstmShader.uniform_locations.projection_matrix, false, SkyboxPass.projection_matrix);

        const alt_daylight: DayLight | null = MainController.SceneController.getSceneDayLightAlt();
        const daylight: DayLight | null = MainController.SceneController.getSceneDayLight();

        const amb_diff_balance: number = 0.2;

        GL.uniform3fv(cstmShader.uniform_locations.daylight1_color, new Float32Array([
            (((1.0 - amb_diff_balance) * daylight.diffuse_factor.x) + (amb_diff_balance * daylight.amb_factor.x)) * daylight.color.x,
            (((1.0 - amb_diff_balance) * daylight.diffuse_factor.y) + (amb_diff_balance * daylight.amb_factor.y)) * daylight.color.y,
            (((1.0 - amb_diff_balance) * daylight.diffuse_factor.z) + (amb_diff_balance * daylight.amb_factor.z)) * daylight.color.z,
        ]));
        if(alt_daylight !== null) {
            GL.uniform3fv(cstmShader.uniform_locations.daylight2_color, new Float32Array([
                (((1.0 - amb_diff_balance) * alt_daylight.diffuse_factor.x) + (amb_diff_balance * alt_daylight.amb_factor.x)) * alt_daylight.color.x,
                (((1.0 - amb_diff_balance) * alt_daylight.diffuse_factor.y) + (amb_diff_balance * alt_daylight.amb_factor.y)) * alt_daylight.color.y,
                (((1.0 - amb_diff_balance) * alt_daylight.diffuse_factor.z) + (amb_diff_balance * alt_daylight.amb_factor.z)) * alt_daylight.color.z,
            ]));
        } else {
            GL.uniform3fv(cstmShader.uniform_locations.daylight2_color, new Float32Array([1.0, 1.0, 1.0]));
        }

        GL.uniform1f(cstmShader.uniform_locations.balance, MainController.SceneController.getSceneAltBalance());

        GL.activeTexture(GL.TEXTURE0);
        MainController.SceneController.getSceneSkybox().use(GL);
        GL.activeTexture(GL.TEXTURE1);
        const alt_skybox: Skybox | null = MainController.SceneController.getSceneSkyboxAlt();
        if(alt_skybox !== null) {
            alt_skybox.use(GL);
        }else {
            MainController.RenderController.bindEmptyCubeMap(GL);
        }
        GL.drawArrays(GL.TRIANGLES, 0, 36);
    }

    private static model_mat: Float32Array;
    /**
     * GENERATES A 2D version of the visible fragments for the screen.
     */
    static runGenerateOutputSkyboxPass(): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        const farplane = MainController.SceneController.getSceneCamera().farPlane;
        const model_mat = new Float32Array(flatMat4(getScalingMatrix(farplane,farplane,farplane)));
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.screen_gen_framebuffer);
        MainController.ShaderController.useSkyBoxShader();
        GL.viewport(0, 0, SkyboxPass.used_size, SkyboxPass.used_size);
        GL.clearColor(0.0, 0.0, 0.0, 1.0);
        GL.clear(GL.COLOR_BUFFER_BIT);
        GL.disable(GL.CULL_FACE);
        GL.bindVertexArray(this.cube_vao);
        GL.uniformMatrix4fv(
            MainController.ShaderController.getSkyBoxShader().uniform_locations.model_matrix,
            false,
            model_mat
        );
        GL.uniformMatrix4fv(
            MainController.ShaderController.getSkyBoxShader().uniform_locations.view_matrix,
            false,
            new Float32Array(flatMat4(MainController.SceneController.getSceneCamera().getViewMatrix()))
        );
        GL.uniformMatrix4fv(
            MainController.ShaderController.getSkyBoxShader().uniform_locations.projection_matrix,
            false,
            new Float32Array(flatMat4(MainController.SceneController.getSceneCamera().getProjectionMatrixPreClip()))
        );

        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_CUBE_MAP, SkyboxPass.cubemap_gen_result);
        GL.drawArrays(GL.TRIANGLES, 0, 36);
    }

    private static appSetupPrepareVao(GL: WebGL2RenderingContext) {
        const data = [
            // Position
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,

            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,
            -1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,

            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,

            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,

            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, -1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,

            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, -1.0, -1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0,
        ];
        this.cube_vao = GL.createVertexArray();
        GL.bindVertexArray(this.cube_vao);

        this.cube_vertex_buffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.cube_vertex_buffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(data), GL.STATIC_DRAW);
        GL.vertexAttribPointer(0, 3, GL.FLOAT, false, 0, 0);
        GL.enableVertexAttribArray(0);
        GL.bindBuffer(GL.ARRAY_BUFFER, null);
        GL.bindVertexArray(null);
    }

    private static recreateStorage(GL: WebGL2RenderingContext, SIZE: number) {
        const INTERN_FORMAT = GL.RGBA32F;
        const FILTER = GL.NEAREST;
        const LEVEL = 1;
        SkyboxPass.cubemap_gen_framebuffer = GL.createFramebuffer();
        GL.bindFramebuffer(GL.FRAMEBUFFER, SkyboxPass.cubemap_gen_framebuffer);


        SkyboxPass.cubemap_gen_result = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_CUBE_MAP,  SkyboxPass.cubemap_gen_result);

        const cube_map_size: number = 1024;

        // GL.pixelStorei(GL.UNPACK_ALIGNMENT, 1);
        GL.texImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_X, 0, GL.RGB, cube_map_size, cube_map_size, 0, GL.RGB, GL.UNSIGNED_BYTE, null);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_CUBE_MAP_POSITIVE_X, SkyboxPass.cubemap_gen_result, 0);

        GL.texImage2D(GL.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, GL.RGB, cube_map_size, cube_map_size, 0, GL.RGB, GL.UNSIGNED_BYTE, null);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT1, GL.TEXTURE_CUBE_MAP_NEGATIVE_X, SkyboxPass.cubemap_gen_result, 0);

        GL.texImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, GL.RGB, cube_map_size, cube_map_size, 0, GL.RGB, GL.UNSIGNED_BYTE, null);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT2, GL.TEXTURE_CUBE_MAP_POSITIVE_Y, SkyboxPass.cubemap_gen_result, 0);

        GL.texImage2D(GL.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, GL.RGB, cube_map_size, cube_map_size, 0, GL.RGB, GL.UNSIGNED_BYTE, null);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT3, GL.TEXTURE_CUBE_MAP_NEGATIVE_Y, SkyboxPass.cubemap_gen_result, 0);

        GL.texImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, GL.RGB, cube_map_size, cube_map_size, 0, GL.RGB, GL.UNSIGNED_BYTE, null);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT4, GL.TEXTURE_CUBE_MAP_POSITIVE_Z, SkyboxPass.cubemap_gen_result, 0);

        GL.texImage2D(GL.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, GL.RGB, cube_map_size, cube_map_size, 0, GL.RGB, GL.UNSIGNED_BYTE, null);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT5, GL.TEXTURE_CUBE_MAP_NEGATIVE_Z, SkyboxPass.cubemap_gen_result, 0);


        GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
        GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
        GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_WRAP_R, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);

        GL.drawBuffers([
            GL.COLOR_ATTACHMENT0,
            GL.COLOR_ATTACHMENT1,
            GL.COLOR_ATTACHMENT2,
            GL.COLOR_ATTACHMENT3,
            GL.COLOR_ATTACHMENT4,
            GL.COLOR_ATTACHMENT5,
        ]);
        GL.bindTexture(GL.TEXTURE_CUBE_MAP,  null);

        checkFramebuffer(GL, SkyboxPass.cubemap_gen_framebuffer);

        ////////////////////////////////
        // SCREEN GENERATION
        ////////////////////////////////
        SkyboxPass.screen_gen_framebuffer = GL.createFramebuffer();
        GL.bindFramebuffer(GL.FRAMEBUFFER, SkyboxPass.screen_gen_framebuffer);
        GL.activeTexture(GL.TEXTURE0);

        SkyboxPass.screen_gen_result = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, SkyboxPass.screen_gen_result);
        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, 0);
        GL.texStorage2D(
            GL.TEXTURE_2D,
            LEVEL,
            INTERN_FORMAT,
            SIZE,
            SIZE
        );
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, FILTER);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, FILTER);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, SkyboxPass.screen_gen_result, 0);

        GL.drawBuffers([GL.COLOR_ATTACHMENT0]);

        checkFramebuffer(GL, SkyboxPass.screen_gen_framebuffer);

        ////////////////////////////////
        // CLEAR BINDINGS AFTER INITIALISATION
        ////////////////////////////////
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
        GL.bindTexture(GL.TEXTURE_2D, null);

    }
}