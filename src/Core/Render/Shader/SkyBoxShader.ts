import {ShaderLoader} from "./ShaderLoader";
import {Shader} from "./Shader";

interface SkyBoxShaderAttributePointer {
    vertex_position: GLint;
}

interface SkyBoxShaderUniformLocations {
    projection_matrix: WebGLUniformLocation;
    view_matrix: WebGLUniformLocation;
    model_matrix: WebGLUniformLocation;
    cubemap: WebGLUniformLocation;
}

export class SkyBoxShader implements Shader {
    public readonly shader_id: string = 'skybox-shader';

    attribute_pointer: SkyBoxShaderAttributePointer;
    uniform_locations: SkyBoxShaderUniformLocations;
    program: WebGLProgram;

    texture_bindings = {
        cubemap: 0,
        position_map: 1
    };

    constructor(GL: WebGL2RenderingContext) {
        this.program = ShaderLoader.buildShader('SkyBoxShader');
        GL.useProgram(this.program);
        this.attribute_pointer = {
            vertex_position: GL.getAttribLocation(this.program, "VertexPosition")
        };
        this.uniform_locations = {
            projection_matrix: GL.getUniformLocation(this.program, "projection_matrix"),
            view_matrix: GL.getUniformLocation(this.program, "view_matrix"),
            model_matrix: GL.getUniformLocation(this.program, "model_matrix"),
            cubemap: GL.getUniformLocation(this.program, "cubemap"),
        };
        GL.uniform1i(
            this.uniform_locations.cubemap,
            this.texture_bindings.cubemap
        );
    }
}