import {Scene} from "../../Core/Scene/Scene";
import {MainController} from "../../Core/Controller/MainController";
import {StaticPlaneObject} from "./SceneObjects/Static/StaticPlaneObject";
import {DynamicCubeObject} from "./SceneObjects/Dynamic/DynamicCubeObject";
import { Camera, SimpleCamera } from '../../Core/Render/Camera'
import {DayLight} from "../../Core/Render/Resource/Light/DayLight";

export class BasicScene implements Scene
{
    camera: Camera = new SimpleCamera();
    day_light: DayLight = new DayLight();


    private groundPlane: StaticPlaneObject = new StaticPlaneObject();
    private exampleCube: DynamicCubeObject = new DynamicCubeObject();
    private exampleCube2: DynamicCubeObject = new DynamicCubeObject();
    private exampleCube3: DynamicCubeObject = new DynamicCubeObject();

    init() {
        this.groundPlane.model.transformation.scale(6).moveY(-3).apply();
        // this.exampleCube.model.transformation.moveX(-0.5).apply();
        this.exampleCube2.model.transformation.scale(0.5).moveX(0.5).moveY(0.5).moveZ(0.5).apply();
        this.exampleCube3.model.transformation.scale(3).moveY(-2).rotateY(45).apply();
        // push some objects
        MainController.pushSceneObject(this.groundPlane);
        MainController.pushSceneObject(this.exampleCube);
        MainController.pushSceneObject(this.exampleCube2);
        MainController.pushSceneObject(this.exampleCube3);

        // make a fail push to test saftyness and no double insert
        MainController.pushSceneObject(this.exampleCube);

        // remove one object
        MainController.removeSceneObject(this.exampleCube);
        MainController.pushSceneObject(this.exampleCube);
    }
    update(time: number) {
        this.exampleCube3.model.transformation.rotateY(-0.5).apply();
    }
}