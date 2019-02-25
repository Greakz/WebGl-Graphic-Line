import { SceneObject } from "../Scene/SceneObject"
import { LogInterface } from "../Util/LogInstance"
import LogInstance from "../Util/LogInstance"
import CanvasControllerInstance, { CanvasControllerInterface } from "./CanvasController"
import ResourceControllerInstance, { ResourceControllerInterface } from "./ResourceController"
import RenderControllerInstance, { RenderControllerInterface } from "./RenderController"
import ShaderControllerInstance, { ShaderControllerInterface } from "./ShaderController"
import EventControllerInstance, { EventControllerInterface } from "./EventController"
import SceneControllerInstance, { SceneControllerInterface } from "./SceneController"

/**
 * MainController
 * --------------
 * Simple Class that is the Top Controll of the Application.
 * Mainly the holder for the Specific Logic Controller!
 */

var scene_objects: SceneObject[] = []
var next_scene_object_id: number = 0
var frame_start_time: number
var frame_finish_time: number = (new Date()).getTime()
var frame_interval: number = 1000 / 60

export class MainController {
    private static readonly Log: LogInterface = LogInstance
    public static readonly CanvasController: CanvasControllerInterface = CanvasControllerInstance
    public static readonly ResourceController: ResourceControllerInterface = ResourceControllerInstance
    public static readonly RenderController: RenderControllerInterface = RenderControllerInstance
    public static readonly ShaderController: ShaderControllerInterface = ShaderControllerInstance
    public static readonly EventController: EventControllerInterface = EventControllerInstance
    public static readonly SceneController: SceneControllerInterface = SceneControllerInstance

    static startApplication() {
        MainController.CanvasController.init()
        MainController.ShaderController.loadShader()
        MainController.setFps(1)
        MainController.loop()
    }

    static setFps(newFps: number) {
        frame_interval = 1000 / newFps
    }

    static pushSceneObject(sceneObject: SceneObject) {
        let canBeAdded: boolean = true
        scene_objects.forEach(
            (scene_object: SceneObject) => {
                if (scene_object.scene_object_id === sceneObject.scene_object_id) {
                    canBeAdded = false
                }
            }
        )
        if (canBeAdded) {
            scene_objects.push(sceneObject)
            MainController.EventController.pushSceneObject(sceneObject)
            MainController.SceneController.pushSceneObject(sceneObject)
            MainController.RenderController.addModel(sceneObject.model)
        }
    }

    static removeSceneObject(sceneObject: SceneObject) {
        MainController.RenderController.removeModel(sceneObject.model)
        MainController.EventController.removeSceneObject(sceneObject)
        MainController.SceneController.removeSceneObject(sceneObject)
        scene_objects = scene_objects.filter(
            (sceneObjectCheck: SceneObject) => {
                return sceneObjectCheck.scene_object_id !== sceneObject.scene_object_id
            }
        )
    }

    static getNextSceneObjectId() {
        next_scene_object_id++
        return next_scene_object_id
    }

    private static loop() {
        // MainController.Log.info("MainController", "RequestAnimationFrame");

        window.requestAnimationFrame(MainController.loop)
        let currentTime = (new Date()).getTime()
        let delta = (currentTime - frame_finish_time)

        if (delta > frame_interval) {

            // Check if the Scene is Ready to be rendered!
            if (MainController.SceneController.hasActiveScene()) {
                MainController.renderFrame(currentTime)
            }

            frame_finish_time = currentTime - (delta % frame_interval)
        }
    }

    private static renderFrame(currentTime: number): void {
        // MainController.Log.info("MainController", "Starting Frame");

        /*
            CHECK FOR EVENTS
         */
        MainController.EventController.checkMouseIntersection()
        MainController.EventController.checkPeriodicEvents()

        /*
            UPDATE SCENE
         */
        MainController.SceneController.updateScene(currentTime)
        MainController.SceneController.updateStaticSceneObjects(currentTime)
        MainController.SceneController.updateDynamicSceneObjects(currentTime)

        /*
            RENDER SCENE
         */
        MainController.RenderController.shadowPass()
        MainController.RenderController.geometryPass()
        MainController.RenderController.lightningPass()
        MainController.RenderController.postProcessPass()

        // MainController.Log.info("MainController", "Finishing Frame")

    }

}
