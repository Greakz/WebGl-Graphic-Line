import {MainController} from "../../../MainController";
import {checkFramebuffer} from "../../../../Util/FramebufferCheck";
import {FrameInfo, RenderQueueMaterialEntry, RenderQueueMeshEntry} from "../../RenderController";
import {DrawMesh} from "../../../../Render/DrawMesh";
import {DayLight} from "../../../../Render/Resource/Light/DayLight";
import {flatMat4} from "../../../../Geometry/Matrix/flatten";
import {getOrthographicMatrix} from "../../../../Geometry/Matrix/orthographic";
import {lookAtMatrix} from "../../../../Geometry/Matrix/lookAt";
import {Camera} from "../../../../Render/Camera/Camera";
import {addVec3} from "../../../../Geometry/Vector/add";
import {scaleVec3} from "../../../../Geometry/Vector/scale";
import {LightningPass} from "./LightningPass";
import {RenderOptions} from "../../../../Scene/RenderOptions";
import {BlurShader} from "../../../../Render/Shader/BlurShader";

export abstract class LightningPassBloomExtension {

    static appSetup(): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
    }

    static frameSetup(frame_info: FrameInfo, newRenderOptions: RenderOptions): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        const blur_shader: BlurShader = MainController.ShaderController.getBlurShader();
        GL.useProgram(blur_shader.program);
        GL.uniform1i(
            blur_shader.uniform_locations.range,
            newRenderOptions.bloom_blur_precision
        );
    }

    private static view_matrix: number[];
    private static proj_matrix: number[];

    static runPass() {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        LightningPass.lightning_storage.bindBlurHorizFramebufferAndShader(GL);
        const blur_shader = MainController.ShaderController.getBlurShader();

        GL.bindVertexArray(LightningPass.pre_clip_screen_plane_vao.plane_vao);
        // Perform Horizontal Blur
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, LightningPass.lightning_storage.light_brightness_result);
        GL.uniform1i(
            blur_shader.uniform_locations.vertical,
            0
        );
        GL.drawArrays(GL.TRIANGLES, 0, 6);

        LightningPass.lightning_storage.bindBlurResultFramebufferAndShader(GL);
        GL.bindVertexArray(LightningPass.pre_clip_screen_plane_vao.plane_vao);
        // Perform Vertical Blur
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, LightningPass.lightning_storage.light_blurred_horiz);
        GL.uniform1i(
            blur_shader.uniform_locations.vertical,
            1
        );
        GL.drawArrays(GL.TRIANGLES, 0, 6);

        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
    }
}