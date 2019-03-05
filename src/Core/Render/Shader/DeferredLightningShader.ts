import {ShaderLoader} from "./ShaderLoader";
import {Shader} from "./Shader";

interface GeometryShaderAttributePointer {
    vertex_position: GLint;
    texture_position: GLint;
    lights: GLint
}

interface GeometryShaderUniformLocations {
    undo_projection_matrix: WebGLUniformLocation;
    undo_view_matrix: WebGLUniformLocation;
    camera_position: WebGLUniformLocation;

    albedo_map: WebGLUniformLocation;
    specular_map: WebGLUniformLocation;
    position_map: WebGLUniformLocation;
    normal_map: WebGLUniformLocation;
    material_map: WebGLUniformLocation;
}

export class DeferredLightningShader implements Shader {
    public readonly shader_id: string = 'deferred-lightning-shader';

    readonly block_bindings = {
        light: 1,
    };

    readonly texture_bindings = {
        albedo_map: 0,
        specular_map: 1,
        position_map: 2,
        normal_map: 3,
        material_map: 4,
    };

    attribute_pointer: GeometryShaderAttributePointer;
    uniform_locations: GeometryShaderUniformLocations;
    program: WebGLProgram;

    constructor(GL: WebGL2RenderingContext) {
        this.program = ShaderLoader.buildShader('DeferredLightningShader');
        GL.useProgram(this.program);
        this.attribute_pointer = {
            vertex_position: GL.getAttribLocation(this.program, "VertexPosition"),
            texture_position: GL.getAttribLocation(this.program, "TexturePosition"),

            lights: GL.getUniformBlockIndex(this.program, "lights"),
            // omni_lights_two_block_index: GL.getUniformBlockIndex(this.program, "omni_lights_two"),
        };
        this.uniform_locations = {
            undo_projection_matrix: GL.getUniformLocation(this.program, "undo_projection_matrix"),
            undo_view_matrix: GL.getUniformLocation(this.program, "undo_view_matrix"),
            camera_position: GL.getUniformLocation(this.program, "camera_position"),

            albedo_map: GL.getUniformLocation(this.program, "albedo_map"),
            specular_map: GL.getUniformLocation(this.program, "specular_map"),
            position_map: GL.getUniformLocation(this.program, "position_map"),
            normal_map: GL.getUniformLocation(this.program, "normal_map"),
            material_map: GL.getUniformLocation(this.program, "material_map"),
        };
        console.log(this.uniform_locations);
        console.log(this.attribute_pointer);
        GL.uniform1i(
            this.uniform_locations.albedo_map,
            this.texture_bindings.albedo_map
        );
        GL.uniform1i(
            this.uniform_locations.specular_map,
            this.texture_bindings.specular_map
        );
        GL.uniform1i(
            this.uniform_locations.position_map,
            this.texture_bindings.position_map
        );
        GL.uniform1i(
            this.uniform_locations.normal_map,
            this.texture_bindings.normal_map
        );
        GL.uniform1i(
            this.uniform_locations.material_map,
            this.texture_bindings.material_map
        );
        GL.uniformBlockBinding(
            this.program,
            this.attribute_pointer.lights,
            this.block_bindings.light
        );
    }
}