import {Scene} from "../../Core/Scene/Scene";
import {MainController} from "../../Core/Controller/MainController";
import {StaticPlaneObject} from "./SceneObjects/Static/StaticPlaneObject";
import {DynamicCubeObject} from "./SceneObjects/Dynamic/DynamicCubeObject";
import { Camera, SimpleCamera } from '../../Core/Render/Camera'
import {DayLight} from "../../Core/Render/Resource/Light/DayLight";
import {OmniLight} from "../../Core/Render/Resource/Light/OmniLight";
import {SpotLight} from "../../Core/Render/Resource/Light/SpotLight";

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

        this.omniLight.position = {x: 5, y: 7, z: 5};
        MainController.SceneController.pushSceneLight(this.omniLight);

        this.alternateInit();
    }

    private altCubes: DynamicCubeObject[] = [];
    private altOmniLights: OmniLight[] = [];
    private altSpotLights: SpotLight[] = [];
    private alternateInit() {
        let genCubes: number = 400;
        let genOmniLights: number = 25;
        let genSpotLights: number = 25;

        for(let i = 0; i < genCubes; i++) {
            const newCube = new DynamicCubeObject();
            let randomNr: number = Math.random() * 2 * Math.PI;
            newCube.model.transformation.moveX(Math.sin(randomNr) * 14).moveZ(Math.cos(randomNr) * 18).moveY(Math.cos(Math.random() * 2 * Math.PI)).rotateY(Math.random() * 90).apply();
            this.altCubes.push(newCube);
            MainController.SceneController.pushSceneObject(newCube);
        }
        for(let i = 0; i < genOmniLights; i++) {
            const newLight = new OmniLight();
            let randomNr: number = Math.random() * 2 * Math.PI;
            newLight.position = {x: Math.sin(randomNr) * 16, y: Math.cos(Math.random() * 2 * Math.PI) + 1, z: Math.abs(Math.cos(randomNr)) * 16 };
            this.altOmniLights.push(newLight);
            MainController.SceneController.pushSceneLight(newLight);
        }
        for(let i = 0; i < genSpotLights; i++) {
            const newLight = new SpotLight();
            let randomNr: number = Math.random() * 2 * Math.PI;
            newLight.position = {x: Math.sin(randomNr) * 16, y: Math.cos(Math.random() * 2 * Math.PI) + 3, z: Math.abs(Math.cos(randomNr)) * -16 };
            this.altSpotLights.push(newLight);
            MainController.SceneController.pushSceneLight(newLight);
        }
    }
    update(time: number) {
        this.camera.update(time);
        this.day_light.update(time);
        // this.exampleCube3.model.transformation.rotateY(-0.5).apply();
    }
}