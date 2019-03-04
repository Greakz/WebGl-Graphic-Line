import {MainController} from "../MainController";
import {FrameInfo, LightQueueEntry} from "../RenderController";
import {DeferredLightningShader} from "../../Render/Shader/DeferredLightningShader";
import {GeometryPass} from "./GeometryPass";

export abstract class LightningPass {

    static plane_vertex_buffer: WebGLBuffer;
    static plane_texture_buffer: WebGLBuffer;
    static plane_vao: WebGLVertexArrayObject;

    static appSetup(): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        LightningPass.plane_texture_buffer = GL.createBuffer();
        LightningPass.plane_vertex_buffer = GL.createBuffer();
        LightningPass.plane_vao = GL.createVertexArray();
        const deferred_lightning_shader: DeferredLightningShader = MainController.ShaderController.getDeferredLightningShader();
        MainController.ShaderController.useDeferredLightningShader();

        GL.bindVertexArray(LightningPass.plane_vao);
        GL.bindBuffer(GL.ARRAY_BUFFER, LightningPass.plane_vertex_buffer);
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

        GL.bindBuffer(GL.ARRAY_BUFFER, LightningPass.plane_texture_buffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(12), GL.DYNAMIC_DRAW);
        GL.enableVertexAttribArray(deferred_lightning_shader.attribute_pointer.texture_position);
        GL.vertexAttribPointer(deferred_lightning_shader.attribute_pointer.texture_position, 2, GL.FLOAT, false, 0, 0);

        GL.bindBuffer(GL.ARRAY_BUFFER, null);
        GL.bindVertexArray(null);
    }

    static frameSetup(frame_info: FrameInfo): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        const aspect = frame_info.width / frame_info.height;
        let top, bottom, left, right;
        if (aspect > 1) {
            const height = 1 / aspect;
            bottom = (1 - height) / 2;
            top = bottom + height;
            left = 0.0;
            right = 1.0;
        } else {
            left = (1 - aspect) / 2;
            right = left + aspect;
            top = 1.0;
            bottom = 0.0;
        }
        GL.bindBuffer(GL.ARRAY_BUFFER, LightningPass.plane_texture_buffer);
        const texData = [
            left, top,
            left, bottom,
            right, top,
            left, bottom,
            right, bottom,
            right, top,
        ];
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(texData), GL.DYNAMIC_DRAW);
        GL.bindBuffer(GL.ARRAY_BUFFER, null);
    }

    static runPass(light_queue: LightQueueEntry[], frame_info: FrameInfo): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        MainController.ShaderController.useDeferredLightningShader();

        GL.viewport(0, 0, frame_info.width, frame_info.height);
        GL.disable(GL.DEPTH_TEST);
        GL.clearColor(0.3, 0.3, 0.3, 1.0);
        GL.clear(GL.COLOR_BUFFER_BIT);

        // Use The PlaneVao
        // Bind Undo Matrices
        MainController.SceneController.getSceneCamera().bindForLightningPass(GL);

        GL.bindVertexArray(LightningPass.plane_vao);

        // Bind Geometry Pass Textures
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, GeometryPass.albedo_texture);

        GL.activeTexture(GL.TEXTURE1);
        GL.bindTexture(GL.TEXTURE_2D, GeometryPass.specular_texture);

        GL.activeTexture(GL.TEXTURE2);
        GL.bindTexture(GL.TEXTURE_2D, GeometryPass.position_texture);

        GL.activeTexture(GL.TEXTURE3);
        GL.bindTexture(GL.TEXTURE_2D, GeometryPass.normal_texture);

        GL.activeTexture(GL.TEXTURE4);
        GL.bindTexture(GL.TEXTURE_2D, GeometryPass.material_texture);

        // Bind Daylight
        MainController.SceneController.getSceneDayLight().use(GL);

        // Bind Other Light
        GL.drawArrays(GL.TRIANGLES, 0, 6);
    }
}