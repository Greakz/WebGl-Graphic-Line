import {ShaderLoader} from "./ShaderLoader";
import {Shader} from "./Shader";
import {MainController} from "../../Controller/MainController";

interface BlurShaderAttributePointer {
    vertex_position: GLint;
    texture_position: GLint;
}

interface BlurShaderUniformLocations {
    source: WebGLUniformLocation;
    vertical: WebGLUniformLocation;
    range: WebGLUniformLocation;
}

export class BlurShader implements Shader {
    public readonly shader_id: string = 'blur-shader';

    readonly texture_bindings = {
        source: 0,
    };

    attribute_pointer: BlurShaderAttributePointer;
    uniform_locations: BlurShaderUniformLocations;
    program: WebGLProgram;

    constructor(GL: WebGL2RenderingContext) {
        this.program = ShaderLoader.buildShader('BlurShader');
        GL.useProgram(this.program);
        this.attribute_pointer = {
            vertex_position: GL.getAttribLocation(this.program, "VertexPosition"),
            texture_position: GL.getAttribLocation(this.program, "TexturePosition"),
        };
        this.uniform_locations = {
            source: GL.getUniformLocation(this.program, "source"),
            vertical: GL.getUniformLocation(this.program, "vertical"),
            range: GL.getUniformLocation(this.program, "range"),
        };
        GL.uniform1i(
            this.uniform_locations.source,
            this.texture_bindings.source
        );
    }
}