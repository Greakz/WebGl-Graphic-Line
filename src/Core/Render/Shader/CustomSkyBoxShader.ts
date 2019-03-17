import {ShaderLoader} from "./ShaderLoader";
import {Shader} from "./Shader";
import {MainController} from "../../Controller/MainController";

interface CustomSkyBoxShaderAttributePointer {
    vertex_position: GLint;
}

interface CustomSkyBoxShaderUniformLocations {
    model_matrix: WebGLUniformLocation;
    view_matrix_left: WebGLUniformLocation;
    view_matrix_right: WebGLUniformLocation;
    view_matrix_top: WebGLUniformLocation;
    view_matrix_bottom: WebGLUniformLocation;
    view_matrix_back: WebGLUniformLocation;
    view_matrix_front: WebGLUniformLocation;
    projection_matrix: WebGLUniformLocation;

    daylight1_color: WebGLUniformLocation;
    daylight2_color: WebGLUniformLocation;

    cubemap1: WebGLUniformLocation;
    cubemap2: WebGLUniformLocation;

    balance: WebGLUniformLocation;
}

export class CustomSkyBoxShader implements Shader {
    public readonly shader_id: string = 'custom-skybox-shader';

    readonly texture_bindings = {
        cubemap1: 0,
        cubemap2: 1,
    };

    attribute_pointer: CustomSkyBoxShaderAttributePointer;
    uniform_locations: CustomSkyBoxShaderUniformLocations;
    program: WebGLProgram;

    constructor(GL: WebGL2RenderingContext) {
        this.program = ShaderLoader.buildShader('CustomSkyBoxShader');
        GL.useProgram(this.program);
        this.attribute_pointer = {
            vertex_position: GL.getAttribLocation(this.program, "VertexPosition"),
        };
        this.uniform_locations = {
            model_matrix: GL.getUniformLocation(this.program, "model_matrix"),
            view_matrix_left: GL.getUniformLocation(this.program, "view_matrix_left"),
            view_matrix_right: GL.getUniformLocation(this.program, "view_matrix_right"),
            view_matrix_top: GL.getUniformLocation(this.program, "view_matrix_top"),
            view_matrix_bottom: GL.getUniformLocation(this.program, "view_matrix_bottom"),
            view_matrix_back: GL.getUniformLocation(this.program, "view_matrix_back"),
            view_matrix_front: GL.getUniformLocation(this.program, "view_matrix_front"),
            projection_matrix: GL.getUniformLocation(this.program, "projection_matrix"),
            daylight1_color: GL.getUniformLocation(this.program, "daylight1_color"),
            daylight2_color: GL.getUniformLocation(this.program, "daylight2_color"),
            cubemap1: GL.getUniformLocation(this.program, "cubemap1"),
            cubemap2: GL.getUniformLocation(this.program, "cubemap2"),
            balance: GL.getUniformLocation(this.program, "balance"),
        };
        GL.uniform1i(
            this.uniform_locations.cubemap1,
            this.texture_bindings.cubemap1
        );
        GL.uniform1i(
            this.uniform_locations.cubemap2,
            this.texture_bindings.cubemap2
        );
    }
}