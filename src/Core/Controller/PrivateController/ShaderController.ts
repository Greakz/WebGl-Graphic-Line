import {LogInterface} from "../../Util/LogInstance";
import LogInstance from "../../Util/LogInstance";
import {GeometryShader} from "../../Render/Shader/GeometryShader";
import {MainController} from "../MainController";
import {FramebufferDebugShader} from "../../Render/Shader/FramebufferDebugShader";
import {DeferredLightningShader} from "../../Render/Shader/DeferredLightningShader";
import {LightBulbShader} from "../../Render/Shader/LightBulbShader";
import {CombineLightningShader} from "../../Render/Shader/CombineLightningShader";
import {BlurShader} from "../../Render/Shader/BlurShader";
import {FinalizeLightningShader} from "../../Render/Shader/FinalizeLightningShader";
import {OutputShader} from "../../Render/Shader/OutputShader";
import {ShadowShader} from "../../Render/Shader/ShadowShader";
import {SkyBoxShader} from "../../Render/Shader/SkyBoxShader";
import {CustomSkyBoxShader} from "../../Render/Shader/CustomSkyBoxShader";
import {CubeMapDebugShader} from "../../Render/Shader/CubeMapDebugShader";

export interface ShaderControllerInterface {
    loadShader(): void;

    useGeometryShader(): void;
    getGeometryShader(): GeometryShader;

    useFramebufferDebugShader(): void;
    getFramebufferDebugShader(): FramebufferDebugShader;

    useDeferredLightningShader(): void;
    getDeferredLightningShader(): DeferredLightningShader;

    useLightBulbShader(): void;
    getLightBulbShader(): LightBulbShader;

    useCombineLightningShader(): void;
    getCombineLightningShader(): CombineLightningShader;

    useBlurShader(): void;
    getBlurShader(): BlurShader;

    useFinalizeLightningShader(): void;
    getFinalizeLightningShader(): FinalizeLightningShader;

    useOutputShader(): void;
    getOutputShader(): OutputShader;

    useShadowShader(): void;
    getShadowShader(): ShadowShader;

    useSkyBoxShader(): void;
    getSkyBoxShader(): SkyBoxShader;

    useCustomSkyBoxShader(): void;
    getCustomSkyBoxShader(): CustomSkyBoxShader;

    useCubeMapDebugShader(): void;
    getCubeMapDebugShader(): CubeMapDebugShader;
}

class ShaderController implements ShaderControllerInterface{
    private static readonly Log: LogInterface = LogInstance;

    private geometry_shader: GeometryShader;
    private fragment_debug_shader: FramebufferDebugShader;
    private deferred_lightning_shader: DeferredLightningShader;
    private light_bulb_shader: LightBulbShader;
    private combine_lightning_shader: CombineLightningShader;
    private blur_shader: BlurShader;
    private finalize_lightning_shader: FinalizeLightningShader;
    private output_shader: OutputShader;
    private shadow_shader: ShadowShader;
    private skybox_shader: SkyBoxShader;
    private custom_skybox_shader: CustomSkyBoxShader;
    private cubemap_debug_shader: CubeMapDebugShader;

    constructor(){}

    loadShader(): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        this.geometry_shader = new GeometryShader(GL);
        this.fragment_debug_shader = new FramebufferDebugShader(GL);
        this.deferred_lightning_shader = new DeferredLightningShader(GL);
        this.light_bulb_shader = new LightBulbShader(GL);
        this.combine_lightning_shader = new CombineLightningShader(GL);
        this.blur_shader = new BlurShader(GL);
        this.finalize_lightning_shader = new FinalizeLightningShader(GL);
        this.output_shader = new OutputShader(GL);
        this.shadow_shader = new ShadowShader(GL);
        this.skybox_shader = new SkyBoxShader(GL);
        this.custom_skybox_shader = new CustomSkyBoxShader(GL);
        this.cubemap_debug_shader = new CubeMapDebugShader(GL);
    }

    getGeometryShader(): GeometryShader {
        return this.geometry_shader;
    }

    useGeometryShader(): void {
        MainController.CanvasController.getGL().useProgram(this.geometry_shader.program);
    }
    getFramebufferDebugShader(): FramebufferDebugShader {
        return this.fragment_debug_shader;
    }

    useFramebufferDebugShader(): void {
        MainController.CanvasController.getGL().useProgram(this.fragment_debug_shader.program);
    }

    getDeferredLightningShader(): DeferredLightningShader {
        return this.deferred_lightning_shader;
    }
    useDeferredLightningShader(): void {
        MainController.CanvasController.getGL().useProgram(this.deferred_lightning_shader.program);
    }

    getLightBulbShader(): LightBulbShader{
        return this.light_bulb_shader;
    }
    useLightBulbShader(): void {
        MainController.CanvasController.getGL().useProgram(this.light_bulb_shader.program);
    }

    getCombineLightningShader(): CombineLightningShader{
        return this.combine_lightning_shader;
    }
    useCombineLightningShader(): void {
        MainController.CanvasController.getGL().useProgram(this.combine_lightning_shader.program);
    }

    getBlurShader(): BlurShader{
        return this.blur_shader;
    }
    useBlurShader(): void {
        MainController.CanvasController.getGL().useProgram(this.blur_shader.program);
    }

    getFinalizeLightningShader(): FinalizeLightningShader{
        return this.finalize_lightning_shader;
    }
    useFinalizeLightningShader(): void {
        MainController.CanvasController.getGL().useProgram(this.finalize_lightning_shader.program);
    }

    getOutputShader(): OutputShader{
        return this.output_shader;
    }
    useOutputShader(): void {
        MainController.CanvasController.getGL().useProgram(this.output_shader.program);
    }

    getShadowShader(): ShadowShader{
        return this.shadow_shader;
    }
    useShadowShader(): void {
        MainController.CanvasController.getGL().useProgram(this.shadow_shader.program);
    }

    getSkyBoxShader(): SkyBoxShader{
        return this.skybox_shader;
    }
    useSkyBoxShader(): void {
        MainController.CanvasController.getGL().useProgram(this.skybox_shader.program);
    }

    getCustomSkyBoxShader(): CustomSkyBoxShader{
        return this.custom_skybox_shader;
    }
    useCustomSkyBoxShader(): void {
        MainController.CanvasController.getGL().useProgram(this.custom_skybox_shader.program);
    }

    useCubeMapDebugShader(): void {
        MainController.CanvasController.getGL().useProgram(this.cubemap_debug_shader.program);
    }
    getCubeMapDebugShader(): CubeMapDebugShader {
        return this.cubemap_debug_shader;
    }
}

var ShaderControllerInstance: ShaderController = new ShaderController();
export default ShaderControllerInstance;

