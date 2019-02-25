import {Scene} from "../../Core/Scene/Scene";
import {MainController} from "../../Core/Controller/MainController";
import {StaticPlaneObject} from "./SceneObjects/Static/StaticPlaneObject";
import {DynamicCubeObject} from "./SceneObjects/Dynamic/DynamicPlaneObject";
import { Camera, SimpleCamera } from '../../Core/Render/Camera'

export class BasicScene implements Scene
{
    camera: Camera = new SimpleCamera();

    private groundPlane: StaticPlaneObject = new StaticPlaneObject();
    private exampleCube: DynamicCubeObject = new DynamicCubeObject();
    private exampleCube2: DynamicCubeObject = new DynamicCubeObject();

    init() {
        // push some objects
        MainController.pushSceneObject(this.groundPlane);
        MainController.pushSceneObject(this.exampleCube);
        MainController.pushSceneObject(this.exampleCube2);

        // make a fail push to test saftyness and no double insert
        MainController.pushSceneObject(this.exampleCube);

        // remove one object
        MainController.removeSceneObject(this.exampleCube)
    }
    update(time: number) {

    }
}