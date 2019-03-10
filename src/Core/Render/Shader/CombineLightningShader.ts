import {ShaderLoader} from "./ShaderLoader";
import {Shader} from "./Shader";

interface CombineLightningShaderAttributePointer {
    vertex_position: GLint;
    texture_position: GLint;
}

interface CombineLightningShaderUniformLocations {
    light_calculation_results: WebGLUniformLocation;
    light_bulb_results: WebGLUniformLocation;
}

export class CombineLightningShader implements Shader {
    public readonly shader_id: string = 'deferred-lightning-shader';

    readonly texture_bindings = {
        light_calculation_results: 0,
        light_bulb_results: 1,
    };

    attribute_pointer: CombineLightningShaderAttributePointer;
    uniform_locations: CombineLightningShaderUniformLocations;
    program: WebGLProgram;

    constructor(GL: WebGL2RenderingContext) {
        this.program = ShaderLoader.buildShader('CombineLightningShader');
        GL.useProgram(this.program);
        this.attribute_pointer = {
            vertex_position: GL.getAttribLocation(this.program, "VertexPosition"),
            texture_position: GL.getAttribLocation(this.program, "TexturePosition"),
        };
        this.uniform_locations = {
            light_calculation_results: GL.getUniformLocation(this.program, "light_calculation_results"),
            light_bulb_results: GL.getUniformLocation(this.program, "light_bulb_results"),

        };
        GL.uniform1i(
            this.uniform_locations.light_calculation_results,
            this.texture_bindings.light_calculation_results
        );
        GL.uniform1i(
            this.uniform_locations.light_bulb_results,
            this.texture_bindings.light_bulb_results
        );
    }
}