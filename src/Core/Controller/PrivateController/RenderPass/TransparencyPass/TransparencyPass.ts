import {MainController} from "../../../MainController";
import {FrameInfo, RenderQueueMeshEntry} from "../../RenderController";
import {TransparencyPassStorage} from "./TransparencyPassStorage";

export abstract class TransparencyPass {

    static transparent_storage: TransparencyPassStorage;
    
    static appSetup(): void {
       const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        TransparencyPass.transparent_storage = new TransparencyPassStorage(GL, 1920);
    }
    
    static frameSetup(frame_info: FrameInfo): void {
        // const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
    }
    
    static runPass(render_queue: RenderQueueMeshEntry[], frame_info: FrameInfo): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();


    }
}