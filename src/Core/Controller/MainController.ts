import {SceneObject} from "../Scene/SceneObject";
import {LogInterface} from "../Util/LogInstance";
import LogInstance from "../Util/LogInstance";
import CanvasControllerInstance, {CanvasControllerInterface} from "./PrivateController/CanvasController";
import ResourceControllerInstance, {ResourceControllerInterface} from "./PrivateController/ResourceController";
import RenderControllerInstance, {RenderControllerInterface} from "./PrivateController/RenderController";
import ShaderControllerInstance, {ShaderControllerInterface} from "./PrivateController/ShaderController";
import EventControllerInstance, {EventControllerInterface} from "./EventController";
import SceneControllerInstance, {PrivateSceneControllerInterface as SceneControllerInterface} from "./SceneController";

/**
 * MainController
 * --------------
 * Simple Class that is the Top Controll of the Application.
 * Mainly the holder for the Specific Logic Controller!
 */
export class MainController {
    public static readonly Log: LogInterface = LogInstance;
    public static readonly CanvasController: CanvasControllerInterface = CanvasControllerInstance;
    public static readonly ResourceController: ResourceControllerInterface = ResourceControllerInstance;
    public static readonly RenderController: RenderControllerInterface = RenderControllerInstance;
    public static readonly ShaderController: ShaderControllerInterface = ShaderControllerInstance;
    public static readonly EventController: EventControllerInterface = EventControllerInstance;
    public static readonly SceneController: SceneControllerInterface = SceneControllerInstance;

    private static next_scene_object_id: number = 0;
    private static next_scene_light_id: number = 0;

    private static frame_start_time: number = (new Date()).getTime();
    private static frame_finish_time: number = (new Date()).getTime();
    private static frame_interval: number = 1000 / 60;
    
    private static scene_objects: SceneObject[] = [];


    static startApplication() {
        MainController.CanvasController.init();
        MainController.ShaderController.loadShader();
        MainController.RenderController.prepareRenderPasses();
        MainController.EventController.prepareEvents();
        MainController.setFps(60);
        MainController.loop();
    }

    static setFps(newFps: number) {
        MainController.frame_interval = 1000 / newFps;
    }

    static getNextSceneObjectId() {
        MainController.next_scene_object_id++;
        return MainController.next_scene_object_id;
    }
    static getNextSceneLightId() {
        MainController.next_scene_light_id++;
        return MainController.next_scene_light_id;
    }

    private static loop() {
        // MainController.Log.info("MainController", "RequestAnimationFrame");

        window.requestAnimationFrame(MainController.loop);
        MainController.frame_start_time = (new Date()).getTime();
        let delta = (MainController.frame_start_time - MainController.frame_finish_time);

        if (delta > MainController.frame_interval) {

            // Check if the Scene is Ready to be rendered!
            if (MainController.SceneController.hasActiveScene()) {
                MainController.renderFrame(MainController.frame_start_time);
            }

            MainController.frame_finish_time = MainController.frame_start_time - (delta % MainController.frame_interval);
        }
    }

    private static renderFrame(currentTime: number): void {
        // MainController.Log.info("MainController", "Starting Frame");

        /*
            CHECK FOR EVENTS
         */
        MainController.EventController.checkMouseIntersection();
        MainController.EventController.checkPeriodicEvents();

        /*
            UPDATE SCENE
         */
        MainController.SceneController.updateScene(currentTime);
        MainController.SceneController.updateStaticSceneObjects(currentTime);
        MainController.SceneController.updateDynamicSceneObjects(currentTime);

        /*
            RENDER SCENE
         */
        MainController.RenderController.initRenderPassRun();
        // MainController.RenderController.shadowPass();
        MainController.RenderController.geometryPass();
        MainController.RenderController.lightningPass();
        MainController.RenderController.framebufferDebugPass();
        // MainController.RenderController.cubemapDebugPass();
        // MainController.RenderController.outputPass();
        // MainController.RenderController.postProcessPass();

        // MainController.Log.info("MainController", "Finishing Frame")

    }

}
