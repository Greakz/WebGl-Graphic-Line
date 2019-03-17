import {DeferredLightningShader} from "../../../../Render/Shader/DeferredLightningShader";
import {MainController} from "../../../MainController";

export class PreClipScreenPlaneVao {
    plane_vertex_buffer: WebGLBuffer;
    plane_texture_buffer: WebGLBuffer;
    plane_vao: WebGLVertexArrayObject;

    constructor(GL: WebGL2RenderingContext) {
        this.plane_texture_buffer = GL.createBuffer();
        this.plane_vertex_buffer = GL.createBuffer();
        this.plane_vao = GL.createVertexArray();
        ////////////////////////////////
        // BIND PLANE VAO STUFF FOR DEFERRED LIGHTNING SHADER
        ////////////////////////////////
        const deferred_lightning_shader: DeferredLightningShader = MainController.ShaderController.getDeferredLightningShader();
        MainController.ShaderController.useDeferredLightningShader();

        GL.bindVertexArray(this.plane_vao);

        GL.bindBuffer(GL.ARRAY_BUFFER, this.plane_vertex_buffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array([
            -1.0, 1.0, 0.0,
            -1.0, -1.0, 0.0,
            1.0, 1.0, 0.0,
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,
            1.0, 1.0, 0.0,
        ]), GL.STATIC_DRAW);

        GL.enableVertexAttribArray(deferred_lightning_shader.attribute_pointer.vertex_position);
        GL.vertexAttribPointer(deferred_lightning_shader.attribute_pointer.vertex_position, 3, GL.FLOAT, false, 0, 0);

        GL.bindBuffer(GL.ARRAY_BUFFER, this.plane_texture_buffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(12), GL.DYNAMIC_DRAW);
        GL.enableVertexAttribArray(deferred_lightning_shader.attribute_pointer.texture_position);
        GL.vertexAttribPointer(deferred_lightning_shader.attribute_pointer.texture_position, 2, GL.FLOAT, false, 0, 0);


        ////////////////////////////////
        // BIND PLANE VAO STUFF FOR COMBINE SHADER
        ////////////////////////////////
        MainController.ShaderController.useCombineLightningShader();
        const combine_lightning_shader = MainController.ShaderController.getCombineLightningShader();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.plane_vertex_buffer);
        GL.enableVertexAttribArray(combine_lightning_shader.attribute_pointer.vertex_position);
        GL.vertexAttribPointer(combine_lightning_shader.attribute_pointer.vertex_position, 3, GL.FLOAT, false, 0, 0);
        GL.bindBuffer(GL.ARRAY_BUFFER, this.plane_texture_buffer);
        GL.enableVertexAttribArray(combine_lightning_shader.attribute_pointer.texture_position);
        GL.vertexAttribPointer(combine_lightning_shader.attribute_pointer.texture_position, 2, GL.FLOAT, false, 0, 0);


        ////////////////////////////////
        // BIND PLANE VAO STUFF FOR BLUR SHADER
        ////////////////////////////////
        MainController.ShaderController.useBlurShader();
        const blur_shader = MainController.ShaderController.getBlurShader();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.plane_vertex_buffer);
        GL.enableVertexAttribArray(blur_shader.attribute_pointer.vertex_position);
        GL.vertexAttribPointer(blur_shader.attribute_pointer.vertex_position, 3, GL.FLOAT, false, 0, 0);
        GL.bindBuffer(GL.ARRAY_BUFFER, this.plane_texture_buffer);
        GL.enableVertexAttribArray(blur_shader.attribute_pointer.texture_position);
        GL.vertexAttribPointer(blur_shader.attribute_pointer.texture_position, 2, GL.FLOAT, false, 0, 0);


        ////////////////////////////////
        // BIND PLANE VAO STUFF FOR FINAL LIGHTNING SHADER
        ////////////////////////////////
        MainController.ShaderController.useFinalizeLightningShader();
        const finalize_light_shader = MainController.ShaderController.getFinalizeLightningShader();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.plane_vertex_buffer);
        GL.enableVertexAttribArray(finalize_light_shader.attribute_pointer.vertex_position);
        GL.vertexAttribPointer(finalize_light_shader.attribute_pointer.vertex_position, 3, GL.FLOAT, false, 0, 0);
        GL.bindBuffer(GL.ARRAY_BUFFER, this.plane_texture_buffer);
        GL.enableVertexAttribArray(finalize_light_shader.attribute_pointer.texture_position);
        GL.vertexAttribPointer(finalize_light_shader.attribute_pointer.texture_position, 2, GL.FLOAT, false, 0, 0);

        ////////////////////////////////
        // PLANE ARRAY SHIT FOR TEXTURES
        ////////////////////////////////
        GL.bindBuffer(GL.ARRAY_BUFFER, this.plane_texture_buffer);
        const texData = [
            0.0, 1.0,
            0.0, 0.0,
            1.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
        ];
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(texData), GL.DYNAMIC_DRAW);
        GL.bindBuffer(GL.ARRAY_BUFFER, null);

        GL.bindBuffer(GL.ARRAY_BUFFER, null);
        GL.bindVertexArray(null);

    }
    
}