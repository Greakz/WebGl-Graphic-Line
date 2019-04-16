import {MainController} from "../../MainController";
import {FrameInfo} from "../RenderController";
import {LightningPass} from "./LightningPass/LightningPass";
import {RenderOptions} from "../../../Scene/RenderOptions";

export abstract class OutputPass {
    //////////////////////////////
    //  INPUT TO LIGHTNING PASS
    //////////////////////////////
    static plane_vertex_buffer: WebGLBuffer;
    static plane_texture_buffer: WebGLBuffer;
    static plane_vao: WebGLVertexArrayObject;

    static appSetup(): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();

        ////////////////////////////////
        // PREPARE RENDER PLANE
        ////////////////////////////////
        OutputPass.plane_texture_buffer = GL.createBuffer();
        OutputPass.plane_vertex_buffer = GL.createBuffer();
        OutputPass.plane_vao = GL.createVertexArray();

        ////////////////////////////////
        // BIND PLANE VAO STUFF
        ////////////////////////////////
        GL.bindVertexArray(OutputPass.plane_vao);

        GL.bindBuffer(GL.ARRAY_BUFFER, OutputPass.plane_vertex_buffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array([
            -1.0, 1.0, 0.0,
            -1.0, -1.0, 0.0,
            1.0, 1.0, 0.0,
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,
            1.0, 1.0, 0.0,
        ]), GL.STATIC_DRAW);
        GL.bindBuffer(GL.ARRAY_BUFFER, OutputPass.plane_texture_buffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(12), GL.DYNAMIC_DRAW);

        MainController.ShaderController.useOutputShader();
        const output_shader = MainController.ShaderController.getOutputShader();
        GL.bindBuffer(GL.ARRAY_BUFFER, OutputPass.plane_vertex_buffer);
        GL.enableVertexAttribArray(output_shader.attribute_pointer.vertex_position);
        GL.vertexAttribPointer(output_shader.attribute_pointer.vertex_position, 3, GL.FLOAT, false, 0, 0);
        GL.bindBuffer(GL.ARRAY_BUFFER, OutputPass.plane_texture_buffer);
        GL.enableVertexAttribArray(output_shader.attribute_pointer.texture_position);
        GL.vertexAttribPointer(output_shader.attribute_pointer.texture_position, 2, GL.FLOAT, false, 0, 0);
    }

    static frameSetup(frame_info: FrameInfo): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        GL.bindBuffer(GL.ARRAY_BUFFER, OutputPass.plane_texture_buffer);
        const texData = [
            frame_info.tex_left, frame_info.tex_top,
            frame_info.tex_left, frame_info.tex_bottom,
            frame_info.tex_right, frame_info.tex_top,
            frame_info.tex_left, frame_info.tex_bottom,
            frame_info.tex_right, frame_info.tex_bottom,
            frame_info.tex_right, frame_info.tex_top,
        ];
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(texData), GL.DYNAMIC_DRAW);
        GL.bindBuffer(GL.ARRAY_BUFFER, null);
    }

    static runPass(frame_info: FrameInfo): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
        GL.viewport(0,0, frame_info.width, frame_info.height);

        MainController.ShaderController.useOutputShader();
        GL.bindVertexArray(this.plane_vao);

        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, LightningPass.lightning_storage.light_final_result);

        GL.drawArrays(GL.TRIANGLES, 0, 6);
    }
}