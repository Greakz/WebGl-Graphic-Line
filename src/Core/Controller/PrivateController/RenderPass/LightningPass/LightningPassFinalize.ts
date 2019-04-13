import {MainController} from "../../../MainController";
import {LightningPass} from "./LightningPass";
import {GeometryPass} from "../GeometryPass/GeometryPass";
import {SkyboxPass} from "../SkyboxPass";
import {FrameInfo} from "../../RenderController";
import {TransparencyPass} from "../TransparencyPass/TransparencyPass";
import {RenderOptions} from "../../../../Scene/RenderOptions";

export abstract class LightningPassFinalize {

    static runPass(frame_info: FrameInfo) {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();

        LightningPass.lightning_storage.bindLightFinalFramebufferAndShader(GL);

        GL.bindVertexArray(LightningPass.pre_clip_screen_plane_vao.plane_vao);

        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, LightningPass.lightning_storage.light_calculation_result);

        if(frame_info.bloom) {
            GL.activeTexture(GL.TEXTURE1);
            GL.bindTexture(GL.TEXTURE_2D, LightningPass.lightning_storage.light_blurred_result);
        } else {
            GL.activeTexture(GL.TEXTURE1);
            GL.bindTexture(GL.TEXTURE_2D, LightningPass.lightning_storage.light_bulb_result);
        }

        GL.activeTexture(GL.TEXTURE2);
        GL.bindTexture(GL.TEXTURE_2D, GeometryPass.solid_storage.position_texture);
        GL.activeTexture(GL.TEXTURE3);
        GL.bindTexture(GL.TEXTURE_2D, TransparencyPass.transparent_storage.blend_transparency_texture);
        GL.activeTexture(GL.TEXTURE4);
        GL.bindTexture(GL.TEXTURE_2D, SkyboxPass.screen_gen_result);

        GL.drawArrays(GL.TRIANGLES, 0, 6);

        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
    }

    static appSetup() {

    }

    static frameSetup(frame_info: FrameInfo, newRenderOptions: RenderOptions) {

    }
}