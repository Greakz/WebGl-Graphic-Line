import {Mesh} from "../../../../Core/Render/Resource/Mesh";
import {GeometryShader} from "../../../../Core/Render/Shader/GeometryShader";
import {ShadowShader} from "../../../../Core/Render/Shader/ShadowShader";

export class PlaneMesh implements Mesh {
    public readonly resource_type: 'mesh';
    public readonly resource_id: string = 'plane-mesh';

    private vertex_points: number[] = [
        // Position         // Normals          //Textures
        -0.5, -0.5, 0.5,    0.0, 0.0, 1.0,      0.0, 0.0,
        0.5, -0.5, 0.5,     0.0, 0.0, 1.0,      1.0, 0.0,
        0.5, 0.5, 0.5,      0.0, 0.0, 1.0,      1.0, 1.0,
        -0.5, -0.5, 0.5,    0.0, 0.0, 1.0,      0.0, 0.0,
        0.5, 0.5, 0.5,      0.0, 0.0, 1.0,      1.0, 1.0,
        -0.5, 0.5, 0.5,     0.0, 0.0, 1.0,      0.0, 1.0,
    ];
    private vertex_buffer: WebGLBuffer;

    load(GL: WebGL2RenderingContext, geometry_shader: GeometryShader, shadow_shader: ShadowShader): void {
        // Create & Bind Buffer
        this.vertex_buffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.vertex_buffer);
        // Buffer Data
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.vertex_points), GL.STATIC_DRAW);
        // Bind Geometry Shader Pointer
        GL.vertexAttribPointer(geometry_shader.attribute_pointer.vertex_position, 3, GL.FLOAT, false, 8 * 4, 0);
        GL.enableVertexAttribArray(geometry_shader.attribute_pointer.vertex_position);

        GL.vertexAttribPointer(geometry_shader.attribute_pointer.vertex_normal, 3, GL.FLOAT, false, 8 * 4, 3 * 4);
        GL.enableVertexAttribArray(geometry_shader.attribute_pointer.vertex_normal);

        GL.vertexAttribPointer(geometry_shader.attribute_pointer.texture_position, 2, GL.FLOAT, false, 8 * 4, 6 * 4);
        GL.enableVertexAttribArray(geometry_shader.attribute_pointer.texture_position);

        // Bind Shadow Shader Pointer
        // ...

        // Unbind Created Buffer
        GL.bindBuffer(GL.ARRAY_BUFFER, null);
    }
    use(GL: WebGL2RenderingContext): void {
        // Just Bind Buffer
        GL.bindBuffer(GL.ARRAY_BUFFER, this.vertex_buffer);
    }

}