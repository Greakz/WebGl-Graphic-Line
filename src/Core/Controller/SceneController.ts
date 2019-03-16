import {StaticSceneObject} from "../Scene/StaticSceneObject";
import {DynamicSceneObject} from "../Scene/DynamicSceneObject";
import {SceneObject} from "../Scene/SceneObject";
import {LogInterface} from "../Util/LogInstance";
import LogInstance from "../Util/LogInstance";
import { Scene } from '../Scene/Scene'
import { Camera } from '../Render/Camera/Camera'
import {DayLight} from "../Render/Resource/Light/DayLight";
import {OmniLight} from "../Render/Resource/Light/OmniLight";
import {SceneLight} from "../Render/Resource/Light/SceneLight";
import {SpotLight} from "../Render/Resource/Light/SpotLight";
import {MainController} from "./MainController";
import {Skybox} from "../Render/Skybox/Skybox";

export interface SceneControllerInterface {
    pushSceneObject(sceneObject: SceneObject): void
    removeSceneObject(sceneObject: SceneObject): void
    pushSceneLight(sceneLight: SceneLight): void
    removeSceneLight(sceneLight: SceneLight): void
    setScene(scene: Scene): void
}

export interface SceneLightInfo {
    omni_lights: OmniLight[];
    spot_lights: SpotLight[];
}

class SceneController implements PrivateSceneControllerInterface {
    constructor() {}

    private scene: Scene;
    private static_scene_objects: StaticSceneObject[] = [];
    private dynamic_scene_objects: DynamicSceneObject[] = [];
    private omni_lights: OmniLight[] = [];
    private spot_lights: SpotLight[] = [];

    setScene(scene: Scene): void {
        scene.init();
        this.scene = scene;
    }

    /**
     * Adding and Removing Scene Objects to and from the Scene!
     */

    pushSceneObject(sceneObject: SceneObject) {
        if (sceneObject instanceof StaticSceneObject) {
            this.pushStaticSceneObject(sceneObject);
        } else if (sceneObject instanceof DynamicSceneObject) {
            this.pushDynamicSceneObject(sceneObject);
        } else {
            throw Error('cant push a SceneObject from the SceneController' +
                ' that\'s not an instance of DynamicSceneObject or StaticSceneObject!');
        }
    }

    removeSceneObject(sceneObject: SceneObject) {

        if (sceneObject instanceof StaticSceneObject) {
            MainController.RenderController.removeModel(sceneObject.model);
            MainController.EventController.removeSceneObject(sceneObject);
            this.static_scene_objects = this.static_scene_objects.filter(
                (staticSceneObject: StaticSceneObject) => {
                    return staticSceneObject.scene_object_id !== sceneObject.scene_object_id;
                }
            );
        } else if (sceneObject instanceof DynamicSceneObject) {
            MainController.RenderController.removeModel(sceneObject.model);
            MainController.EventController.removeSceneObject(sceneObject);
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

    /**
     *
     */

    pushSceneLight(sceneLight: SceneLight) {
        if (sceneLight instanceof OmniLight) {
            this.pushOmniLight(sceneLight);
        } else if (sceneLight instanceof SpotLight) {
            this.pushSpotight(sceneLight)
        } else {
            throw Error('cant push a SceneLight to the SceneController' +
                ' that\'s not an instance of SpotLight or OmniLight!');
        }
    }

    removeSceneLight(sceneLight: SceneLight) {
        if (sceneLight instanceof OmniLight) {
            this.omni_lights = this.omni_lights.filter(
                (omniLight: OmniLight) => {
                    return omniLight.scene_light_id !== sceneLight.scene_light_id;
                }
            );
        } else if (sceneLight instanceof SpotLight) {
            this.spot_lights = this.spot_lights.filter(
                (spotLight: SpotLight) => {
                    return spotLight.scene_light_id !== sceneLight.scene_light_id;
                }
            );
        } else {
            throw Error('cant remove a SceneLight from the SceneController' +
                ' that\'s not an instance of OmniLight or SpotLight!');
        }
    }

    /**
     * Update Methods of the SceneController
     * Called every FPS!
     */

    updateScene(time: number) {
        if(this.scene !== undefined) {
            this.scene.update(time);
        }
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

    hasActiveScene(): boolean {
        return this.scene !== undefined
    }

    getSceneCamera(): Camera {
        return this.scene.camera;
    }
    getSceneDayLight(): DayLight{
        return this.scene.day_light;
    }

    getSceneLightInfo(): SceneLightInfo {
        return {
            omni_lights: this.omni_lights,
            spot_lights: this.spot_lights
        }
    }
    getSceneSkybox(): Skybox {
        return this.scene.sky_box;
    }

    private pushStaticSceneObject(object: StaticSceneObject) {
        let canBeAdded: boolean = true;
        this.static_scene_objects.forEach(
            (scene_object: SceneObject) => {
                if (scene_object.scene_object_id === object.scene_object_id) {
                    canBeAdded = false;
                }
            }
        );
        if (canBeAdded) {
            // maybe static not needed in event controller
           // MainController.EventController.pushSceneObject(object);
            MainController.RenderController.addModel(object.model);
            this.static_scene_objects.push(object);
        }
    }

    private pushDynamicSceneObject(object: DynamicSceneObject) {
        let canBeAdded: boolean = true;
        this.dynamic_scene_objects.forEach(
            (scene_object: SceneObject) => {
                if (scene_object.scene_object_id === object.scene_object_id) {
                    canBeAdded = false;
                }
            }
        );
        if (canBeAdded) {
            MainController.EventController.pushSceneObject(object);
            MainController.RenderController.addModel(object.model);
            this.dynamic_scene_objects.push(object);
        }
    }

    private pushOmniLight(object: OmniLight) {
        let canBeAdded: boolean = true;
        this.omni_lights.forEach(
            (light: OmniLight) => {
                if (light.scene_light_id === object.scene_light_id) {
                    canBeAdded = false;
                }
            }
        );
        if (canBeAdded) {
            this.omni_lights.push(object);
        }
    }

    private pushSpotight(object: SpotLight) {
        let canBeAdded: boolean = true;
        this.spot_lights.forEach(
            (light: SpotLight) => {
                if (light.scene_light_id === object.scene_light_id) {
                    canBeAdded = false;
                }
            }
        );
        if (canBeAdded) {
            this.spot_lights.push(object);
        }
    }
}

export interface PrivateSceneControllerInterface extends SceneControllerInterface{
    updateScene(time: number): void
    updateStaticSceneObjects(time: number): void
    updateDynamicSceneObjects(time: number): void
    hasActiveScene(): boolean
    getSceneCamera(): Camera
    getSceneDayLight(): DayLight
    getSceneLightInfo(): SceneLightInfo
    getSceneSkybox(): Skybox
}

var SceneControllerInstance: SceneController = new SceneController();
export default SceneControllerInstance;

