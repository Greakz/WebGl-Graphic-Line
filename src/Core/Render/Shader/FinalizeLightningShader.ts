import {ShaderLoader} from "./ShaderLoader";
import {Shader} from "./Shader";

interface GeometryShaderAttributePointer {
    vertex_position: GLint;
    texture_position: GLint;
}

interface GeometryShaderUniformLocations {
    scene_result: WebGLUniformLocation;
    brightness_result: WebGLUniformLocation;
    position_map: WebGLUniformLocation;
    t_transparency_map: WebGLUniformLocation;
    skybox: WebGLUniformLocation;
}

export class FinalizeLightningShader implements Shader {
    public readonly shader_id: string = 'finalize-lightning-shader';

    readonly texture_bindings = {
        scene_result: 0,
        brightness_result: 1,
        position_map: 2,
        t_transparency_map: 3,
        skybox: 4,
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
            position_map: GL.getUniformLocation(this.program, "position_map"),
            t_transparency_map: GL.getUniformLocation(this.program, "t_transparency_map"),
            skybox: GL.getUniformLocation(this.program, "skybox"),
        };
        GL.uniform1i(
            this.uniform_locations.scene_result,
            this.texture_bindings.scene_result
        );
        GL.uniform1i(
            this.uniform_locations.brightness_result,
            this.texture_bindings.brightness_result
        );
        GL.uniform1i(
            this.uniform_locations.position_map,
            this.texture_bindings.position_map
        );
        GL.uniform1i(
            this.uniform_locations.t_transparency_map,
            this.texture_bindings.t_transparency_map
        );
        GL.uniform1i(
            this.uniform_locations.skybox,
            this.texture_bindings.skybox
        );
    }
}