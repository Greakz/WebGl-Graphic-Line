import {ShaderLoader} from "./ShaderLoader";
import {Shader} from "./Shader";

interface GeometryShaderAttributePointer {
    vertex_position: GLint;
    mesh_matrix: GLint;
    model_matrix: GLint;
}

interface GeometryShaderUniformLocations {
    view_matrix: WebGLUniformLocation;
    projection_matrix: WebGLUniformLocation;
}

export class ShadowShader implements Shader {
    public readonly shader_id: string = 'shadow-shader';

    attribute_pointer: GeometryShaderAttributePointer;
    uniform_locations: GeometryShaderUniformLocations;
    program: WebGLProgram;

    constructor(GL: WebGL2RenderingContext) {
        this.program = ShaderLoader.buildShader('ShadowShader');
        this.attribute_pointer = {
            vertex_position: GL.getAttribLocation(this.program, "VertexPosition"),

            mesh_matrix: GL.getAttribLocation(this.program, "mesh_matrix"),
            model_matrix: GL.getAttribLocation(this.program, "model_matrix"),
        };
        this.uniform_locations = {
            view_matrix: GL.getUniformLocation(this.program, "view_matrix"),
            projection_matrix: GL.getUniformLocation(this.program, "projection_matrix"),
        };
    }
}