import {LogInterface} from "../Util/LogInstance";
import LogInstance from "../Util/LogInstance";
import {GeometryShader} from "../Render/Shader/GeometryShader";
import {MainController} from "./MainController";
import {FramebufferDebugShader} from "../Render/Shader/FramebufferDebugShader";
import {DeferredLightningShader} from "../Render/Shader/DeferredLightningShader";

export interface ShaderControllerInterface {
    loadShader(): void;
    useGeometryShader(): void;
    getGeometryShader(): GeometryShader;
    useFramebufferDebugShader(): void;
    getFramebufferDebugShader(): FramebufferDebugShader;
    useDeferredLightningShader(): void;
    getDeferredLightningShader(): DeferredLightningShader;
}

class ShaderController implements ShaderControllerInterface{
    private static readonly Log: LogInterface = LogInstance;

    private geometry_shader: GeometryShader;
    private deferred_lightning_shader: DeferredLightningShader;
    private fragment_debug_shader: FramebufferDebugShader;

    constructor(){}

    loadShader(): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        this.geometry_shader = new GeometryShader(GL);
        this.fragment_debug_shader = new FramebufferDebugShader(GL);
        this.deferred_lightning_shader = new DeferredLightningShader(GL);
    }

    getGeometryShader(): GeometryShader {
        return this.geometry_shader;
    }

    useGeometryShader(): void {
        MainController.CanvasController.getGL().useProgram(this.geometry_shader.program);
    }
    getDeferredLightningShader(): DeferredLightningShader {
        return this.deferred_lightning_shader;
    }

    useDeferredLightningShader(): void {
        MainController.CanvasController.getGL().useProgram(this.deferred_lightning_shader.program);
    }
    getFramebufferDebugShader(): FramebufferDebugShader {
        return this.fragment_debug_shader;
    }

    useFramebufferDebugShader(): void {
        MainController.CanvasController.getGL().useProgram(this.fragment_debug_shader.program);
    }
}

var ShaderControllerInstance: ShaderController = new ShaderController();
export default ShaderControllerInstance;

