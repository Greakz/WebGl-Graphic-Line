import {ShaderLoader} from "./ShaderLoader";
import {Shader} from "./Shader";

interface GeometryShaderAttributePointer {
    vertex_position: GLint;
    bulb_color: GLint;
    bulb_position: GLint;
}

interface GeometryShaderUniformLocations {
    projection_matrix: WebGLUniformLocation;
    view_matrix: WebGLUniformLocation;
}

export class LightBulbShader implements Shader {
    public readonly shader_id: string = 'light-bulb-shader';

    attribute_pointer: GeometryShaderAttributePointer;
    uniform_locations: GeometryShaderUniformLocations;
    program: WebGLProgram;

    constructor(GL: WebGL2RenderingContext) {
        this.program = ShaderLoader.buildShader('LightBulbShader');
        GL.useProgram(this.program);
        this.attribute_pointer = {
            vertex_position: GL.getAttribLocation(this.program, "VertexPosition"),
            bulb_color: GL.getAttribLocation(this.program, "BulbColor"),
            bulb_position: GL.getAttribLocation(this.program, "BulbPosition"),
        };
        this.uniform_locations = {
            projection_matrix: GL.getUniformLocation(this.program, "projection_matrix"),
            view_matrix: GL.getUniformLocation(this.program, "view_matrix"),
        };
    }
}