import {MainController} from "../../../MainController";
import {LightBulbShader} from "../../../../Render/Shader/LightBulbShader";

export class LightBulbMeshVao {
    light_bulb_vertex_buffer: WebGLBuffer;
    light_bulb_u_buffer: WebGLBuffer;
    light_bulb_vao: WebGLVertexArrayObject;

    constructor(GL: WebGL2RenderingContext) {
        this.light_bulb_vao = GL.createVertexArray();
        this.light_bulb_vertex_buffer = GL.createBuffer();
        this.light_bulb_u_buffer = GL.createBuffer();

        const lightBulbShader: LightBulbShader = MainController.ShaderController.getLightBulbShader();
        GL.useProgram(lightBulbShader.program);

        GL.bindVertexArray(this.light_bulb_vao);
        GL.bindBuffer(GL.ARRAY_BUFFER, this.light_bulb_vertex_buffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array([
            // top pyramid
            0.0, 0.2, 0.0,      -0.2, 0.0, 0.0,         0.0, 0.0, 0.2,
            0.0, 0.2, 0.0,      0.0, 0.0, 0.2,          0.2, 0.0, 0.0,
            0.0, 0.2, 0.0,      0.2, 0.0, 0.0,          0.0, 0.0, -0.2,
            0.0, 0.2, 0.0,      0.0, 0.0, -0.2,         -0.2, 0.0, 0.0,

            // bottom pyramid
            0.0, -0.2, 0.0,     0.0, 0.0, 0.2,      -0.2, 0.0, 0.0,
            0.0, -0.2, 0.0,     0.2, 0.0, 0.0,      0.0, 0.0, 0.2,
            0.0, -0.2, 0.0,     0.0, 0.0, -0.2,     0.2, 0.0, 0.0,
            0.0, -0.2, 0.0,     -0.2, 0.0, 0.0,     0.0, 0.0, -0.2,
        ]), GL.STATIC_DRAW);
        GL.enableVertexAttribArray(lightBulbShader.attribute_pointer.vertex_position);
        GL.vertexAttribPointer(lightBulbShader.attribute_pointer.vertex_position, 3, GL.FLOAT, false, 0, 0);

        GL.bindBuffer(GL.ARRAY_BUFFER, this.light_bulb_u_buffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(28), GL.DYNAMIC_DRAW);

        GL.enableVertexAttribArray(lightBulbShader.attribute_pointer.bulb_color);
        GL.vertexAttribPointer(lightBulbShader.attribute_pointer.bulb_color, 4, GL.FLOAT, false, 7 * 4, 0);
        GL.vertexAttribDivisor(lightBulbShader.attribute_pointer.bulb_color, 1);

        GL.enableVertexAttribArray(lightBulbShader.attribute_pointer.bulb_position);
        GL.vertexAttribPointer(lightBulbShader.attribute_pointer.bulb_position, 3, GL.FLOAT, false, 7 * 4, 4 * 4);
        GL.vertexAttribDivisor(lightBulbShader.attribute_pointer.bulb_position, 1);

        GL.bindBuffer(GL.ARRAY_BUFFER, null);
        GL.bindVertexArray(null);
    }
    
}