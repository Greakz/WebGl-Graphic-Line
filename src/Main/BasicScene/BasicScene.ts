import {Scene} from "../../Core/Scene/Scene";
import {MainController} from "../../Core/Controller/MainController";
import {StaticPlaneObject} from "./SceneObjects/Static/StaticPlaneObject";
import {DynamicCubeObject} from "./SceneObjects/Dynamic/DynamicCubeObject";
import { Camera, SimpleCamera } from '../../Core/Render/Camera'
import {DayLight} from "../../Core/Render/Resource/Light/DayLight";
import {OmniLight} from "../../Core/Render/Resource/Light/OmniLight";

export class BasicScene implements Scene
{
    camera: Camera = new SimpleCamera();
    day_light: DayLight = new DayLight();

    private groundPlane: StaticPlaneObject = new StaticPlaneObject();
    private exampleCube: DynamicCubeObject = new DynamicCubeObject();
    private exampleCube2: DynamicCubeObject = new DynamicCubeObject();
    private exampleCube3: DynamicCubeObject = new DynamicCubeObject();

    private omniLight: OmniLight = new OmniLight();

    init() {

        this.groundPlane.model.transformation.scale(6).moveY(-3).apply();

        // this.exampleCube.model.transformation.moveX(-0.5).apply();
        this.exampleCube2.model.transformation.scale(0.5).moveX(0.5).moveY(0.5).moveZ(0.5).apply();
        this.exampleCube3.model.transformation.scale(3).moveX(0.2).moveY(-2).rotateY(45).apply();

        // push some objects
        MainController.SceneController.pushSceneObject(this.groundPlane);
        MainController.SceneController.pushSceneObject(this.exampleCube);
        MainController.SceneController.pushSceneObject(this.exampleCube2);
        MainController.SceneController.pushSceneObject(this.exampleCube3);

        // make a fail push to test saftyness and no double insert
        MainController.SceneController.pushSceneObject(this.exampleCube);

        // remove one object
        MainController.SceneController.removeSceneObject(this.exampleCube);
        MainController.SceneController.pushSceneObject(this.exampleCube);

        this.omniLight.position = {x: 2.5, y: -1.0, z: 0};
        MainController.SceneController.pushSceneLight(this.omniLight);

        this.alternateInit();
    }

    private altCubes: DynamicCubeObject[] = [];
    private altLights: OmniLight[] = [];
    private alternateInit() {
        let genCubes: number = 500;
        let genLights: number = 5;

        for(let i = 0; i < genCubes; i++) {
            const newCube = new DynamicCubeObject();
            let randomNr: number = Math.random() * 2 * Math.PI;
            newCube.model.transformation.moveX(Math.sin(randomNr) * 15).moveZ(Math.cos(randomNr) * 15).moveY(Math.cos(Math.random() * 2 * Math.PI)).rotateY(Math.random() * 90).apply();
            this.altCubes.push(newCube);
            MainController.SceneController.pushSceneObject(newCube);
        }
        for(let i = 0; i < genLights; i++) {
            const newLight = new OmniLight();
            let randomNr: number = Math.random() * 2 * Math.PI;
            newLight.position = {x: Math.abs(Math.sin(randomNr)) * 16.5, y: Math.abs(Math.cos(randomNr)) * 16.5, z: Math.cos(Math.random() * 2 * Math.PI) + 3};
            this.altLights.push(newLight);
            MainController.SceneController.pushSceneLight(newLight);
        }
    }
    update(time: number) {
        this.camera.update(time);
        this.day_light.update(time);
        // this.exampleCube3.model.transformation.rotateY(-0.5).apply();
    }
}