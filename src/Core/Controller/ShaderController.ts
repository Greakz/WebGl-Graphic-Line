import {LogInterface} from "../Util/LogInstance";
import LogInstance from "../Util/LogInstance";
import {GeometryShader} from "../Render/Shader/GeometryShader";
import {MainController} from "./MainController";

export interface ShaderControllerInterface {
    loadShader(): void;
    useGeometryShader(): void;
    getGeometryShader(): GeometryShader;
}

class ShaderController implements ShaderControllerInterface{
    private static readonly Log: LogInterface = LogInstance;

    private geometry_shader: GeometryShader;

    constructor(){}

    loadShader(): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        this.geometry_shader = new GeometryShader(GL);
    }

    getGeometryShader(): GeometryShader {
        return this.geometry_shader;
    }

    useGeometryShader(): void {
        // ShaderController.Log.info('RenderController', 'binding Geometry-Shader');
        MainController.CanvasController.getGL().useProgram(this.geometry_shader.program);
    }
}

var ShaderControllerInstance: ShaderController = new ShaderController();
export default ShaderControllerInstance;

