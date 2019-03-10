import {ShaderLoader} from "./ShaderLoader";
import {Shader} from "./Shader";
import {MainController} from "../../Controller/MainController";

interface OutputShaderAttributePointer {
    vertex_position: GLint;
    texture_position: GLint;
}

interface OutputShaderUniformLocations {
    source: WebGLUniformLocation;
}

export class OutputShader implements Shader {
    public readonly shader_id: string = 'output-shader';

    readonly texture_bindings = {
        source: 0,
    };

    attribute_pointer: OutputShaderAttributePointer;
    uniform_locations: OutputShaderUniformLocations;
    program: WebGLProgram;

    constructor(GL: WebGL2RenderingContext) {
        this.program = ShaderLoader.buildShader('OutputShader');
        GL.useProgram(this.program);
        this.attribute_pointer = {
            vertex_position: GL.getAttribLocation(this.program, "VertexPosition"),
            texture_position: GL.getAttribLocation(this.program, "TexturePosition"),
        };
        this.uniform_locations = {
            source: GL.getUniformLocation(this.program, "source"),
        };
        GL.uniform1i(
            this.uniform_locations.source,
            this.texture_bindings.source
        );
    }
}