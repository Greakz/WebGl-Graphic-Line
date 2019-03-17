import {MainController} from "../../../MainController";
import {FrameInfo, LightQueueEntry} from "../../RenderController";
import {DeferredLightningShader} from "../../../../Render/Shader/DeferredLightningShader";
import {GeometryPass} from "../GeometryPass/GeometryPass";
import {SceneLightInfo} from "../../../SceneController";
import {DayLight} from "../../../../Render/Resource/Light/DayLight";
import {LightBulbShader} from "../../../../Render/Shader/LightBulbShader";
import {GeometryPassShadowExtension} from "../GeometryPass/GeometryPassShadowExtension";
import {SkyboxPass} from "../SkyboxPass";
import {LightningPassStorage} from "./LightningPassStorage";
import {LightningPassBloomExtension} from "./LightningPassBloomExtension";
import {PreClipScreenPlaneVao} from "./PreClipScreenPlaneVao";
import {LightBulbMeshVao} from "./LightBulbMeshVao";
import {LightningPassDeferredAndBulbs} from "./LightningPassDeferredAndBulbs";
import {LightningPassFinalize} from "./LightningPassFinalize";

export const MAXIMUM_OMNI_LIGHT_BLOCKS: number = 4;
export const MAXIMUM_SPOT_LIGHT_BLOCKS: number = 4;
export const MAXIMUM_LIGHTS_PER_BLOCK: number = 64;

export abstract class LightningPass {
    //////////////////////////////
    //  INPUT TO LIGHTNING PASS
    /////////////////////////////
    static pre_clip_screen_plane_vao: PreClipScreenPlaneVao;
    static light_bulb_mesh_vao: LightBulbMeshVao;

    static lightning_storage: LightningPassStorage;

    static appSetup(): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();

        LightningPass.lightning_storage = new LightningPassStorage(GL, 1920);
        LightningPass.pre_clip_screen_plane_vao = new PreClipScreenPlaneVao(GL);
        LightningPass.light_bulb_mesh_vao = new LightBulbMeshVao(GL);

        LightningPassDeferredAndBulbs.appSetup();
        LightningPassBloomExtension.appSetup();
        LightningPassFinalize.appSetup();
    }

    static frameSetup(frame_info: FrameInfo): void {
        LightningPassDeferredAndBulbs.frameSetup(frame_info);
        LightningPassBloomExtension.frameSetup(frame_info);
        LightningPassFinalize.frameSetup(frame_info);
    }

    static runPass(): void {
        // generates: LightingPassStorage.light_combine_framebuffer,
        //            LightingPassStorage.light_brightness_result
        LightningPassDeferredAndBulbs.runPass();

        // generates: LightingPassStorage.light_blurred_result
        LightningPassBloomExtension.runPass();

        // generates: LightingPassStorage.light_final_result
        LightningPassFinalize.runPass();
    }
}