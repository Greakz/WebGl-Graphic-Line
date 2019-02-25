import {Mesh} from "../../../../Core/Render/Resource/Mesh";
import {ShadowShader} from "../../../../Core/Render/Shader/ShadowShader";
import {GeometryShader} from "../../../../Core/Render/Shader/GeometryShader";
import { Transformation } from '../../../../Core/Geometry/Transformation/Transformation';
import { MainController } from '../../../../Core/Controller/MainController';

export class CubeMesh implements Mesh {
    readonly resource_type: 'mesh';
    readonly resource_id: string = 'cube-mesh';
    readonly draw_count: number = 36;

    transformation: Transformation = new Transformation();

    private vertex_points: number[] = [
        // Position         // Normals          //Textures
        -0.5, -0.5, 0.5,    0.0, 0.0, 1.0,      0.0, 0.0,
        0.5, -0.5, 0.5,     0.0, 0.0, 1.0,      1.0, 0.0,
        0.5, 0.5, 0.5,      0.0, 0.0, 1.0,      1.0, 1.0,
        -0.5, -0.5, 0.5,    0.0, 0.0, 1.0,      0.0, 0.0,
        0.5, 0.5, 0.5,      0.0, 0.0, 1.0,      1.0, 1.0,
        -0.5, 0.5, 0.5,     0.0, 0.0, 1.0,      0.0, 1.0,

        -0.5, -0.5, -0.5,   0.0, 0.0, -1.0,     0.0, 0.0,
        -0.5, 0.5, -0.5,    0.0, 0.0, -1.0,     1.0, 0.0,
        0.5, 0.5, -0.5,     0.0, 0.0, -1.0,     1.0, 1.0,
        -0.5, -0.5, -0.5,   0.0, 0.0, -1.0,     0.0, 0.0,
        0.5, 0.5, -0.5,     0.0, 0.0, -1.0,     1.0, 1.0,
        0.5, -0.5, -0.5,    0.0, 0.0, -1.0,     0.0, 1.0,

        -0.5, 0.5, -0.5,    0.0, 1.0, 0.0,      0.0, 0.0,
        -0.5, 0.5, 0.5,     0.0, 1.0, 0.0,      1.0, 0.0,
        0.5, 0.5, 0.5,      0.0, 1.0, 0.0,      1.0, 1.0,
        -0.5, 0.5, -0.5,    0.0, 1.0, 0.0,      0.0, 0.0,
        0.5, 0.5, 0.5,      0.0, 1.0, 0.0,      1.0, 1.0,
        0.5, 0.5, -0.5,     0.0, 1.0, 0.0,      0.0, 1.0,

        -0.5, -0.5, -0.5,   0.0, -1.0, 0.0,     0.0, 0.0,
        0.5, -0.5, -0.5,    0.0, -1.0, 0.0,     1.0, 0.0,
        0.5, -0.5, 0.5,     0.0, -1.0, 0.0,     1.0, 1.0,
        -0.5, -0.5, -0.5,   0.0, -1.0, 0.0,     0.0, 0.0,
        0.5, -0.5, 0.5,     0.0, -1.0, 0.0,     1.0, 1.0,
        -0.5, -0.5, 0.5,    0.0, -1.0, 0.0,     0.0, 1.0,

        0.5, -0.5, -0.5,    1.0, 0.0, 0.0,      0.0, 0.0,
        0.5, 0.5, -0.5,     1.0, 0.0, 0.0,      1.0, 0.0,
        0.5, 0.5, 0.5,      1.0, 0.0, 0.0,      1.0, 1.0,
        0.5, -0.5, -0.5,    1.0, 0.0, 0.0,      0.0, 0.0,
        0.5, 0.5, 0.5,      1.0, 0.0, 0.0,      1.0, 1.0,
        0.5, -0.5, 0.5,     1.0, 0.0, 0.0,      0.0, 1.0,

        -0.5, -0.5, -0.5,   -1.0, 0.0, 0.0,     0.0, 0.0,
        -0.5, -0.5, 0.5,    -1.0, 0.0, 0.0,     1.0, 0.0,
        -0.5, 0.5, 0.5,     -1.0, 0.0, 0.0,     1.0, 1.0,
        -0.5, -0.5, -0.5,   -1.0, 0.0, 0.0,     0.0, 0.0,
        -0.5, 0.5, 0.5,     -1.0, 0.0, 0.0,     1.0, 1.0,
        -0.5, 0.5, -0.5,    -1.0, 0.0, 0.0,     0.0, 1.0
    ];
    private vertex_buffer: WebGLBuffer;
    private mesh_vao: WebGLVertexArrayObject;

    load(GL: WebGL2RenderingContext, geometry_shader: GeometryShader, shadow_shader: ShadowShader): void {
        this.mesh_vao = GL.createVertexArray();
        GL.bindVertexArray(this.mesh_vao);

        MainController.RenderController.setMeshAndModelAttributePointer(GL);

        // Create & Bind Buffer Position Buffer
        this.vertex_buffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.vertex_buffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.vertex_points), GL.STATIC_DRAW);

        GL.vertexAttribPointer(geometry_shader.attribute_pointer.vertex_position, 3, GL.FLOAT, false, 8 * 4, 0);
        GL.enableVertexAttribArray(geometry_shader.attribute_pointer.vertex_position);

        GL.vertexAttribPointer(geometry_shader.attribute_pointer.vertex_normal, 3, GL.FLOAT, false, 8 * 4, 3 * 4);
        GL.enableVertexAttribArray(geometry_shader.attribute_pointer.vertex_normal);

        GL.vertexAttribPointer(geometry_shader.attribute_pointer.texture_position, 2, GL.FLOAT, false, 8 * 4, 6 * 4);
        GL.enableVertexAttribArray(geometry_shader.attribute_pointer.texture_position);
        GL.bindBuffer(GL.ARRAY_BUFFER, null);

        GL.bindVertexArray(null);
    }
    use(GL: WebGL2RenderingContext): void {
        // Just Bind Buffer
        GL.bindVertexArray(this.mesh_vao);
    }


}