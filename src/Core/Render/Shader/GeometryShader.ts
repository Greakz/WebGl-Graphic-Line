import {ShaderLoader} from "./ShaderLoader";
import {Shader} from "./Shader";

interface GeometryShaderAttributePointer {
    vertex_position: GLint;
    vertex_normal: GLint;
    texture_position: GLint;

    mesh_matrix: GLint;
    model_matrix: GLint;
    material_block_index: GLint;
}

interface GeometryShaderUniformLocations {
    view_matrix: WebGLUniformLocation;
    projection_matrix: WebGLUniformLocation;

    albedo_color: WebGLUniformLocation;
    albedo_texture: WebGLUniformLocation;
    specular_color: WebGLUniformLocation;
    specular_texture: WebGLUniformLocation;
    shininess: WebGLUniformLocation;

}

export class GeometryShader implements Shader {
    public readonly shader_id: string = 'geometry-shader';

    readonly uniform_block_bindings = {
        material: 0
    };
    readonly texture_bindings = {
        albedo_texture: 0,
        specular_texture: 1,
    };

    attribute_pointer: GeometryShaderAttributePointer;
    uniform_locations: GeometryShaderUniformLocations;
    program: WebGLProgram;

    constructor(GL: WebGL2RenderingContext) {
        this.program = ShaderLoader.buildShader('GeometryShader');
        this.attribute_pointer = {
            vertex_position: GL.getAttribLocation(this.program, "VertexPosition"),
            vertex_normal: GL.getAttribLocation(this.program, "VertexNormals"),
            texture_position: GL.getAttribLocation(this.program, "TexturePosition"),

            mesh_matrix: GL.getAttribLocation(this.program, "mesh_matrix"),
            model_matrix: GL.getAttribLocation(this.program, "model_matrix"),
            material_block_index: GL.getUniformBlockIndex(this.program, "mat"),
        };
        this.uniform_locations = {
            view_matrix: GL.getUniformLocation(this.program, "view_matrix"),
            projection_matrix: GL.getUniformLocation(this.program, "projection_matrix"),
            albedo_color: GL.getUniformLocation(this.program, "albedo_color"),
            albedo_texture: GL.getUniformLocation(this.program, "albedo"),
            specular_color: GL.getUniformLocation(this.program, "specular_color"),
            specular_texture: GL.getUniformLocation(this.program, "specular_texture"),
            shininess: GL.getUniformLocation(this.program, "shininess"),
        };
        GL.useProgram(this.program);
        GL.uniformBlockBinding(
            this.program,
            this.attribute_pointer.material_block_index,
            this.uniform_block_bindings.material
        );
        GL.uniform1i(
            this.uniform_locations.albedo_texture,
            this.texture_bindings.albedo_texture
        );
        GL.uniform1i(
            this.uniform_locations.specular_texture,
            this.texture_bindings.specular_texture
        );
    }
}