import {MainController} from "../../../MainController";
import {FrameInfo} from "../../RenderController";
import {TransparencyPassStorage} from "./TransparencyPassStorage";
import {flatMat4} from "../../../../Geometry/Matrix/flatten";
import {Camera} from "../../../../Render/Camera/Camera";
import {GeometryPass} from "../GeometryPass/GeometryPass";
import {DrawMeshesWithBufferedData} from "../../../../Render/DrawMesh";
import {TransparencyShader} from "../../../../Render/Shader/TransparencyShader";
import {LightningPassDeferredAndBulbs} from "../LightningPass/LightningPassDeferredAndBulbs";
import {flatVec3} from "../../../../Geometry/Vector/flatten";
import {SkyboxPass} from "../SkyboxPass";

export abstract class TransparencyPass {

    static transparent_storage: TransparencyPassStorage;
    
    static appSetup(): void {
       const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        TransparencyPass.transparent_storage = new TransparencyPassStorage(GL, 1920);
    }
    
    static frameSetup(frame_info: FrameInfo): void {
        // const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
    }
    
    static runPass(): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();

        GL.clearColor(0.0, 0.0, 0.0, 1.0);
        GL.viewport(0, 0, 1920, 1920);
        GL.enable(GL.BLEND);
        GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);

        GL.enable(GL.CULL_FACE);

        GL.enable(GL.DEPTH_TEST);
        // GL.depthFunc(GL.ALWAYS);

        TransparencyPass.transparent_storage.bindTransparencyFramebufferAndShader(GL);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        GL.activeTexture(GL.TEXTURE2);
        GL.bindTexture(GL.TEXTURE_2D, GeometryPass.solid_storage.misc_texture);
        GL.activeTexture(GL.TEXTURE3);
        GL.bindTexture(GL.TEXTURE_CUBE_MAP, SkyboxPass.cubemap_gen_result);


        const cam: Camera = MainController.SceneController.getSceneCamera();
        const t_shader: TransparencyShader = MainController.ShaderController.getTransparencyShader();
        // bind Camera
        GL.uniformMatrix4fv(
            t_shader.uniform_locations.view_matrix,
            false,
            new Float32Array(flatMat4(cam.getViewMatrix()))
        );
        GL.uniformMatrix4fv(
            t_shader.uniform_locations.projection_matrix,
            false,
            new Float32Array(flatMat4(cam.getProjectionMatrixPreClip()))
        );
        GL.uniform3fv(
            t_shader.uniform_locations.camera_position,
            new Float32Array(flatVec3(cam.position))
        );
        GL.uniform1f(
            t_shader.uniform_locations.near_plane,
            cam.nearPlane
        );
        GL.uniform1f(
            t_shader.uniform_locations.far_plane,
            cam.farPlane
        );
        GL.bindBuffer(GL.UNIFORM_BUFFER, LightningPassDeferredAndBulbs.light_buffer);
        GL.bindBufferBase(GL.UNIFORM_BUFFER, MainController.ShaderController.getTransparencyShader().uniform_block_bindings.lights, LightningPassDeferredAndBulbs.light_buffer);

        for(let i = 0; i < GeometryPass.solid_storage.collected_transparency_tasks.length; i++) {
            const current: DrawMeshesWithBufferedData = GeometryPass.solid_storage.collected_transparency_tasks[i];
            const mat = current.draw_mesh[0].related_material;
            const mesh = current.draw_mesh[0].related_mesh;

            mat.useTransparency(GL, t_shader);
            mesh.use(GL);

            GL.bindBuffer(GL.ARRAY_BUFFER, GeometryPass.model_mesh_matrix_buffer);
            GL.bufferData(GL.ARRAY_BUFFER, current.bufferData, GL.DYNAMIC_DRAW);

            GL.cullFace(GL.BACK);
            GL.drawArraysInstanced(GL.TRIANGLES, 0, current.draw_mesh[0].related_mesh.draw_count, current.draw_mesh.length);
            GL.cullFace(GL.FRONT);
            GL.drawArraysInstanced(GL.TRIANGLES, 0, current.draw_mesh[0].related_mesh.draw_count, current.draw_mesh.length);
        }

        GL.disable(GL.BLEND);
        GL.disable(GL.CULL_FACE);
    }
}