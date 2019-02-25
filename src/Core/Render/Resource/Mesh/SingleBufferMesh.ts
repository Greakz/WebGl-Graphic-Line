import {GeometryShader} from "../../Shader/GeometryShader";
import {ShadowShader} from "../../Shader/ShadowShader";
import {Transformation} from '../../../Geometry/Transformation/Transformation';
import {MainController} from "../../../Controller/MainController";
import {Mesh} from "./Mesh";

export class SingleBufferMesh implements Mesh {
    readonly resource_type: 'mesh' = 'mesh';
    /**
     * resource_id: string | should be set by a Mesh. Must be an unique identifier for a Mesh
     */
    readonly resource_id: string = "default-mesh";
    /**
     * draw_count: number | should be set by an Mesh. Specifies how many Vertices should be drawn by the Mesh!
     */
    readonly draw_count: number = 0;
    /**
     * vertices: number[] | the vertices to set in format ...|xPos|yPos|zPos|xNorm|yNorm|zNorm|xTex|yTex|...
     * Pos is the Position of the Vertex with x,y,z
     * Norm is the Normal-Vector of the Vertex with x,y,z
     * Tex is the Texture-Position of the Vertex with x,y
     */
    readonly vertices: number[] = [];

    /**
     * can be used to transform a mesh relative to its model.
     * (useful for simple animations!)
     */
    transformation: Transformation = new Transformation();

    private vertex_buffer: WebGLBuffer;
    private mesh_vao: WebGLVertexArrayObject;

    /**
     * This function handles the WebGL calls and should not be overwritten!
     * @param GL WebGL2RenderingContext
     * @param geometry_shader GeometryShader
     * @param shadow_shader ShadowShader
     */
    readonly load = (GL: WebGL2RenderingContext, geometry_shader: GeometryShader, shadow_shader: ShadowShader) => {
        this.mesh_vao = GL.createVertexArray();
        GL.bindVertexArray(this.mesh_vao);

        // Create & Bind Buffer Position Buffer
        this.vertex_buffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.vertex_buffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.vertices), GL.STATIC_DRAW);

        GL.vertexAttribPointer(geometry_shader.attribute_pointer.vertex_position, 3, GL.FLOAT, false, 8 * 4, 0);
        GL.enableVertexAttribArray(geometry_shader.attribute_pointer.vertex_position);

        GL.vertexAttribPointer(geometry_shader.attribute_pointer.vertex_normal, 3, GL.FLOAT, false, 8 * 4, 3 * 4);
        GL.enableVertexAttribArray(geometry_shader.attribute_pointer.vertex_normal);

        GL.vertexAttribPointer(geometry_shader.attribute_pointer.texture_position, 2, GL.FLOAT, false, 8 * 4, 6 * 4);
        GL.enableVertexAttribArray(geometry_shader.attribute_pointer.texture_position);
        GL.bindBuffer(GL.ARRAY_BUFFER, null);

        MainController.RenderController.setMeshAndModelAttributePointer(GL);

        GL.bindVertexArray(null);
    };
    /**
     * This function handles the WebGL calls and should not be overwritten!
     * @param GL WebGL2RenderingContext
     */
    readonly use = (GL: WebGL2RenderingContext) => {
        GL.bindVertexArray(this.mesh_vao);
    };
}
