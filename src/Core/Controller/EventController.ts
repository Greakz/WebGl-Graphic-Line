import {DynamicSceneObject} from "../Scene/DynamicSceneObject";
import {SceneObject} from "../Scene/SceneObject";
import {StaticSceneObject} from "../Scene/StaticSceneObject";
import LogInstance, {LogInterface} from "../Util/LogInstance";

export interface EventControllerInterface {
    checkMouseIntersection(): void;
    checkPeriodicEvents(): void;
    pushSceneObject(sceneObject: SceneObject): void;
    removeSceneObject(sceneObject: SceneObject): void;
}
class EventController implements EventControllerInterface {

    private static readonly Log: LogInterface = LogInstance;
    private dynamic_scene_objects: DynamicSceneObject[] = [];

    constructor(){}

    checkMouseIntersection() {
        // EventController.Log.info("EventController", "Check Intersections");
    }

    checkPeriodicEvents() {
        // EventController.Log.info("EventController", "Check Periodic Events");
    }

    pushSceneObject(sceneObject: SceneObject) {
        if(sceneObject instanceof StaticSceneObject) {
            /* STATIC OBJECTS HAS NO EVENTS => DO NOTHING */
        } else if(sceneObject instanceof DynamicSceneObject ) {
            this.dynamic_scene_objects.push(sceneObject);
        } else {
            throw Error('cant push a SceneObject to the EventController' +
                ' that\'s not an instance of DynamicSceneObject!');
        }
    }

    removeSceneObject(sceneObject: SceneObject) {
        if(sceneObject instanceof StaticSceneObject) {
            /* STATIC OBJECTS HAS NO EVENTS => DO NOTHING */
        } else if(sceneObject instanceof DynamicSceneObject ) {
            this.dynamic_scene_objects = this.dynamic_scene_objects.filter(
                (dynamicSceneObject: DynamicSceneObject) => {
                    return dynamicSceneObject.scene_object_id !== sceneObject.scene_object_id;
                }
            );
        } else {
            throw Error('cant remove a SceneObject from the EventController' +
                ' that\'s not an instance of DynamicSceneObject!');
        }
    }

}
var EventControllerInstance: EventController = new EventController();
export default EventControllerInstance;

