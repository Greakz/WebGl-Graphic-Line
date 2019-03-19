import {ShaderLoader} from "./ShaderLoader";
import {Shader} from "./Shader";

interface TransparencyShaderAttributePointer {
    vertex_position: GLint;
    vertex_normal: GLint;
    texture_position: GLint;

    mesh_matrix: GLint;
    model_matrix: GLint;
    material_block_index: GLint;

    lights: GLint
}

interface TransparencyShaderUniformLocations {
    view_matrix: WebGLUniformLocation;
    projection_matrix: WebGLUniformLocation;

    albedo_color: WebGLUniformLocation;
    albedo_texture: WebGLUniformLocation;
    specular_color: WebGLUniformLocation;
    specular_texture: WebGLUniformLocation;
    shininess: WebGLUniformLocation;

    near_plane: WebGLUniformLocation;
    far_plane: WebGLUniformLocation;
    camera_position: WebGLUniformLocation;

    position_map: WebGLUniformLocation;
    t_position_map: WebGLUniformLocation;
}

export class TransparencyShader implements Shader {
    public readonly shader_id: string = 'transparency-shader';

    readonly uniform_block_bindings = {
        material: 0,
        lights: 1,
    };
    readonly texture_bindings = {
        albedo_texture: 0,
        specular_texture: 1,
        position_map: 2,
        t_position_map: 3,
    };

    attribute_pointer: TransparencyShaderAttributePointer;
    uniform_locations: TransparencyShaderUniformLocations;
    program: WebGLProgram;

    constructor(GL: WebGL2RenderingContext) {
        this.program = ShaderLoader.buildShader('TransparencyShader');
        this.attribute_pointer = {
            vertex_position: GL.getAttribLocation(this.program, "VertexPosition"),
            vertex_normal: GL.getAttribLocation(this.program, "VertexNormals"),
            texture_position: GL.getAttribLocation(this.program, "TexturePosition"),

            mesh_matrix: GL.getAttribLocation(this.program, "mesh_matrix"),
            model_matrix: GL.getAttribLocation(this.program, "model_matrix"),
            material_block_index: GL.getUniformBlockIndex(this.program, "mat"),

            lights: GL.getUniformBlockIndex(this.program, "lights"),
        };
        this.uniform_locations = {
            view_matrix: GL.getUniformLocation(this.program, "view_matrix"),
            projection_matrix: GL.getUniformLocation(this.program, "projection_matrix"),
            albedo_color: GL.getUniformLocation(this.program, "albedo_color"),
            albedo_texture: GL.getUniformLocation(this.program, "albedo"),
            specular_color: GL.getUniformLocation(this.program, "specular_color"),
            specular_texture: GL.getUniformLocation(this.program, "specular_texture"),
            shininess: GL.getUniformLocation(this.program, "shininess"),
            near_plane: GL.getUniformLocation(this.program, "near_plane"),
            far_plane: GL.getUniformLocation(this.program, "far_plane"),
            camera_position: GL.getUniformLocation(this.program, "camera_position"),
            position_map: GL.getUniformLocation(this.program, "position_map"),
            t_position_map: GL.getUniformLocation(this.program, "t_position_map"),
        };
        GL.useProgram(this.program);
        GL.uniformBlockBinding(
            this.program,
            this.attribute_pointer.material_block_index,
            this.uniform_block_bindings.material
        );
        GL.uniformBlockBinding(
            this.program,
            this.attribute_pointer.lights,
            this.uniform_block_bindings.lights
        );
        GL.uniform1i(
            this.uniform_locations.albedo_texture,
            this.texture_bindings.albedo_texture
        );
        GL.uniform1i(
            this.uniform_locations.specular_texture,
            this.texture_bindings.specular_texture
        );
        GL.uniform1i(
            this.uniform_locations.position_map,
            this.texture_bindings.position_map
        );
        GL.uniform1i(
            this.uniform_locations.t_position_map,
            this.texture_bindings.t_position_map
        );
    }
}