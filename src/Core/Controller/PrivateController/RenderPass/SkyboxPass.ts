import {MainController} from "../../MainController";
import {FrameInfo} from "../RenderController";
import {getScalingMatrix} from "../../../Geometry/Matrix/scaling";
import {flatMat4} from "../../../Geometry/Matrix/flatten";
import {GeometryPass} from "./GeometryPass";
import {checkFramebuffer} from "../../../Util/FramebufferCheck";


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
    static screen_gen_framebuffer: WebGLFramebuffer;
    static screen_gen_result: WebGLTexture;

    /**
     * SINGE SETUP AT THE APPLICATION START
     */
    static appSetup(): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();

        const SIZEX = 1920;
        const SIZEY = 1920;
        const INTERN_FORMAT = GL.RGBA32F;
        const FILTER = GL.NEAREST;
        const LEVEL = 1;

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
            SIZEX,
            SIZEY
        );
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, FILTER);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, FILTER);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, SkyboxPass.screen_gen_result, 0);

        GL.drawBuffers([GL.COLOR_ATTACHMENT0]);

        checkFramebuffer(GL, this.screen_gen_framebuffer);

        ////////////////////////////////
        // CLEAR BINDINGS AFTER INITIALISATION
        ////////////////////////////////
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
        GL.bindTexture(GL.TEXTURE_2D, null);

        SkyboxPass.appSetupPrepareVao(GL);
    }

    /**
     * SETUP before each Frame
     * @param frame_info
     */
    static frameSetup(frame_info: FrameInfo): void {
        // const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
    }

    /**
     * GENEREATES the skybox that is later used for the screen version and for reflections!
     */
    static runGenerateCubemapSkyboxPass(): void {
        // const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        // SkyboxPass.cubemap_gen_result = MainController.SceneController.getSceneSkybox().cube_map.get();
    }

    private static model_mat: Float32Array = new Float32Array(flatMat4(getScalingMatrix(150,150,150)));
    /**
     * GENERATES A 2D version of the visible fragments for the screen.
     */
    static runGenerateOutputSkyboxPass(): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        MainController.ShaderController.useSkyBoxShader();
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.screen_gen_framebuffer);
        GL.viewport(0, 0, 1920, 1920);
        GL.clearColor(0.0, 0.0, 0.0, 1.0);
        GL.disable(GL.CULL_FACE);
        GL.bindVertexArray(this.cube_vao);
        GL.uniformMatrix4fv(MainController.ShaderController.getSkyBoxShader().uniform_locations.model_matrix, false, SkyboxPass.model_mat);
        MainController.SceneController.getSceneCamera().bindForSkyBox(
            GL,
            MainController.ShaderController.getSkyBoxShader().uniform_locations.view_matrix,
            MainController.ShaderController.getSkyBoxShader().uniform_locations.projection_matrix
        );
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_CUBE_MAP, MainController.SceneController.getSceneSkybox().cube_map.get());

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
}