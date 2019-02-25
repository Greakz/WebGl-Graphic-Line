import {StaticSceneObject} from "../Scene/StaticSceneObject";
import {DynamicSceneObject} from "../Scene/DynamicSceneObject";
import {SceneObject} from "../Scene/SceneObject";
import {LogInterface} from "../Util/LogInstance";
import LogInstance from "../Util/LogInstance";
import {SceneCamera} from "../Scene/SceneCamera";

export interface SceneControllerInterface {
    updateSceneCamera(time: number): void
    updateStaticSceneObjects(time: number): void
    updateDynamicSceneObjects(time: number): void

    pushSceneObject(sceneObject: SceneObject): void
    removeSceneObject(sceneObject: SceneObject): void

    setSceneCamera(scene_camera: SceneCamera): void
    getSceneCamera(): SceneCamera;
}

class SceneController implements SceneControllerInterface {
    private static readonly Log: LogInterface = LogInstance;

    constructor() {
    }

    private scene_camera: SceneCamera = new SceneCamera();
    private static_scene_objects: StaticSceneObject[] = [];
    private dynamic_scene_objects: DynamicSceneObject[] = [];

    updateSceneCamera(time: number) {
        this.scene_camera.update();
    }

    updateStaticSceneObjects(time: number): void {
        // SceneController.Log.info("SceneController", "Updating Static Objects");
        this.static_scene_objects.forEach(
            (staticSceneObject: StaticSceneObject) => {
                staticSceneObject.update(time);
            }
        );
    }

    updateDynamicSceneObjects(time: number): void {
        // SceneController.Log.info("SceneController", "Updating Dynamic Objects");
        this.dynamic_scene_objects.forEach(
            (dynamicSceneObject: DynamicSceneObject) => {
                dynamicSceneObject.update(time);
            }
        );
    }

    pushSceneObject(sceneObject: SceneObject) {
        if (sceneObject instanceof StaticSceneObject) {
            this.static_scene_objects.push(sceneObject);
        } else if (sceneObject instanceof DynamicSceneObject) {
            this.dynamic_scene_objects.push(sceneObject);
        } else {
            throw Error('cant push a SceneObject from the SceneController' +
                ' that\'s not an instance of DynamicSceneObject or StaticSceneObject!');
        }
    }

    removeSceneObject(sceneObject: SceneObject) {
        if (sceneObject instanceof StaticSceneObject) {
            this.static_scene_objects = this.static_scene_objects.filter(
                (staticSceneObject: StaticSceneObject) => {
                    return staticSceneObject.scene_object_id !== sceneObject.scene_object_id;
                }
            );
        } else if (sceneObject instanceof DynamicSceneObject) {
            this.dynamic_scene_objects = this.dynamic_scene_objects.filter(
                (dynamicSceneObject: DynamicSceneObject) => {
                    return dynamicSceneObject.scene_object_id !== sceneObject.scene_object_id;
                }
            );
        } else {
            throw Error('cant remove a SceneObject from the SceneController' +
                ' that\'s not an instance of DynamicSceneObject or StaticSceneObject!');
        }
    }

    setSceneCamera(scene_camera: SceneCamera) {
        this.scene_camera = scene_camera;
    }
    getSceneCamera(): SceneCamera {
        return this.scene_camera;
    }
}

var SceneControllerInstance: SceneController = new SceneController();
export default SceneControllerInstance;

