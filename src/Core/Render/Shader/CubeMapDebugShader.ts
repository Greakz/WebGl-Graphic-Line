import {ShaderLoader} from "./ShaderLoader";
import {Shader} from "./Shader";
import {MainController} from "../../Controller/MainController";
import {flatMat4} from "../../Geometry/Matrix/flatten";
import {getScalingMatrix} from "../../Geometry/Matrix/scaling";

interface CubeMapDebugShaderAttributePointer {
    vertex_position: GLint;
}

interface CubeMapDebugShaderUniformLocations {
    model_matrix: WebGLUniformLocation;
    view_matrix: WebGLUniformLocation;
    projection_matrix: WebGLUniformLocation;
    debug_sample: WebGLUniformLocation;
}

export class CubeMapDebugShader implements Shader {
    public readonly shader_id: string = 'cube-map-debug-shader';

    readonly texture_bindings = {
        debug_sample: 0,
    };

    attribute_pointer: CubeMapDebugShaderAttributePointer;
    uniform_locations: CubeMapDebugShaderUniformLocations;
    program: WebGLProgram;

    constructor(GL: WebGL2RenderingContext) {
        this.program = ShaderLoader.buildShader('CubeMapDebugShader');
        GL.useProgram(this.program);
        this.attribute_pointer = {
            vertex_position: GL.getAttribLocation(this.program, "VertexPosition"),
        };
        this.uniform_locations = {
            debug_sample: GL.getUniformLocation(this.program, "debug_sample"),
            projection_matrix: GL.getUniformLocation(this.program, "projection_matrix"),
            view_matrix: GL.getUniformLocation(this.program, "view_matrix"),
            model_matrix: GL.getUniformLocation(this.program, "model_matrix"),
        };
        GL.uniform1i(
            this.uniform_locations.debug_sample,
            this.texture_bindings.debug_sample
        );
        this.setupVertexData();
    }

    private scaling_model_mat = getScalingMatrix(150, 150, 150);
    cubeMapDebugPass(cubemap: WebGLTexture) {
        const GL = MainController.CanvasController.getGL();
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
        GL.useProgram(this.program);
        GL.viewport(0, 0, MainController.RenderController.getFrameInfo().width, MainController.RenderController.getFrameInfo().height);
        GL.clearColor(0.9, 0.9, 0.9, 1.0);
        GL.clear(GL.COLOR_BUFFER_BIT);
        GL.disable(GL.CULL_FACE);
        GL.bindVertexArray(this.cube_vao);
        GL.uniformMatrix4fv(
            MainController.ShaderController.getCubeMapDebugShader().uniform_locations.model_matrix,
            false,
            new Float32Array(flatMat4(this.scaling_model_mat))
        );
        GL.uniformMatrix4fv(
            MainController.ShaderController.getCubeMapDebugShader().uniform_locations.view_matrix,
            false,
            new Float32Array(flatMat4(MainController.SceneController.getSceneCamera().getViewMatrix()))
        );
        GL.uniformMatrix4fv(
            MainController.ShaderController.getCubeMapDebugShader().uniform_locations.projection_matrix,
            false,
            new Float32Array(flatMat4(MainController.SceneController.getSceneCamera().getProjectionMatrixPreClip()))
        );
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_CUBE_MAP, cubemap);
        GL.drawArrays(GL.TRIANGLES, 0, 36);
    }
    private cube_buffer: WebGLBuffer;
    private cube_vao: WebGLVertexArrayObject;
    private setupVertexData () {
        const GL = MainController.CanvasController.getGL();

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

        this.cube_buffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.cube_buffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(data), GL.STATIC_DRAW);
        GL.vertexAttribPointer(0, 3, GL.FLOAT, false, 0, 0);
        GL.enableVertexAttribArray(0);
        GL.bindBuffer(GL.ARRAY_BUFFER, null);
        GL.bindVertexArray(null);
    }
}