import {ShaderLoader} from "./ShaderLoader";
import {Shader} from "./Shader";
import {MainController} from "../../Controller/MainController";

interface GeometryShaderAttributePointer {
    vertex_position: GLint;
    texture_position: GLint;
}

interface GeometryShaderUniformLocations {
    scene_result: WebGLUniformLocation;
    brightness_result: WebGLUniformLocation;
}

export class FinalizeLightningShader implements Shader {
    public readonly shader_id: string = 'finalize-lightning-shader';

    readonly texture_bindings = {
        scene_result: 0,
        brightness_result: 1,
    };

    attribute_pointer: GeometryShaderAttributePointer;
    uniform_locations: GeometryShaderUniformLocations;
    program: WebGLProgram;

    constructor(GL: WebGL2RenderingContext) {
        this.program = ShaderLoader.buildShader('FinalizeLightningShader');
        GL.useProgram(this.program);
        this.attribute_pointer = {
            vertex_position: GL.getAttribLocation(this.program, "VertexPosition"),
            texture_position: GL.getAttribLocation(this.program, "TexturePosition"),
        };
        this.uniform_locations = {
            scene_result: GL.getUniformLocation(this.program, "scene_result"),
            brightness_result: GL.getUniformLocation(this.program, "brightness_result"),
        };
        GL.uniform1i(
            this.uniform_locations.scene_result,
            this.texture_bindings.scene_result
        );
        GL.uniform1i(
            this.uniform_locations.brightness_result,
            this.texture_bindings.brightness_result
        );
    }
}