import {ShaderLoader} from "./ShaderLoader";
import {Shader} from "./Shader";

interface GeometryShaderAttributePointer {
    vertex_position: GLint;
    texture_position: GLint;
    lights: GLint
}

interface GeometryShaderUniformLocations {
    camera_position: WebGLUniformLocation;

    daylight_view_matrix: WebGLUniformLocation;
    daylight_projection_matrix: WebGLUniformLocation;

    albedo_map: WebGLUniformLocation;
    specular_map: WebGLUniformLocation;
    position_map: WebGLUniformLocation;
    normal_map: WebGLUniformLocation;
    material_map: WebGLUniformLocation;

    shadow_map: WebGLUniformLocation;
    reflection_cubemap: WebGLUniformLocation;

    t_transparency_map: WebGLUniformLocation;
    t_albedo_blend_map: WebGLUniformLocation;

    enable_shad_shadblur_refl_trans: WebGLUniformLocation;
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
        shadow_map: 5,
        reflection_cubemap: 6,
        t_transparency_map: 7,
        t_albedo_blend_map: 8,
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
            camera_position: GL.getUniformLocation(this.program, "camera_position"),

            daylight_view_matrix: GL.getUniformLocation(this.program, "daylight_view_matrix"),
            daylight_projection_matrix: GL.getUniformLocation(this.program, "daylight_projection_matrix"),

            albedo_map: GL.getUniformLocation(this.program, "albedo_map"),
            specular_map: GL.getUniformLocation(this.program, "specular_map"),
            position_map: GL.getUniformLocation(this.program, "position_map"),
            normal_map: GL.getUniformLocation(this.program, "normal_map"),
            material_map: GL.getUniformLocation(this.program, "material_map"),

            shadow_map: GL.getUniformLocation(this.program, "shadow_map"),
            reflection_cubemap: GL.getUniformLocation(this.program, "reflection_cubemap"),

            t_transparency_map: GL.getUniformLocation(this.program, "t_transparency_map"),
            t_albedo_blend_map: GL.getUniformLocation(this.program, "t_albedo_blend_map"),

            enable_shad_shadblur_refl_trans: GL.getUniformLocation(this.program, "enable_shad_shadblur_refl_trans"),
        };
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
        GL.uniform1i(
            this.uniform_locations.shadow_map,
            this.texture_bindings.shadow_map
        );
        GL.uniform1i(
            this.uniform_locations.reflection_cubemap,
            this.texture_bindings.reflection_cubemap
        );
        GL.uniform1i(
            this.uniform_locations.t_transparency_map,
            this.texture_bindings.t_transparency_map
        );
        GL.uniform1i(
            this.uniform_locations.t_albedo_blend_map,
            this.texture_bindings.t_albedo_blend_map
        );
        GL.uniformBlockBinding(
            this.program,
            this.attribute_pointer.lights,
            this.block_bindings.light
        );
    }
}