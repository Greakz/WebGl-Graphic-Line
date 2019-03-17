import {BaseScene, Scene} from "../../Core/Scene/Scene";
import {MainController} from "../../Core/Controller/MainController";
import {StaticPlaneObject} from "./SceneObjects/Static/StaticPlaneObject";
import {DynamicCubeObject} from "./SceneObjects/Dynamic/DynamicCubeObject";
import { Camera } from '../../Core/Render/Camera/Camera'
import {DayLight} from "../../Core/Render/Resource/Light/DayLight";
import {OmniLight} from "../../Core/Render/Resource/Light/OmniLight";
import {SpotLight} from "../../Core/Render/Resource/Light/SpotLight";
import {AdvancedCamera} from "../../Core/Render/Camera/AdvancedCamera";
import {Skybox} from "../../Core/Render/Skybox/Skybox";
import {BasicSkybox} from "./BasicSkybox";
import {DynamicCubeBlankObject} from "./SceneObjects/Dynamic/DynamicCubeBlankObject";

export class BasicScene extends BaseScene implements Scene
{
    camera: Camera = new AdvancedCamera();
    day_light: DayLight = new DayLight();
    sky_box: Skybox = new BasicSkybox();

    private groundPlane: StaticPlaneObject = new StaticPlaneObject();
    private exampleCube: DynamicCubeObject = new DynamicCubeObject();
    private exampleCube2: DynamicCubeObject = new DynamicCubeObject();
    private exampleCube3: DynamicCubeObject = new DynamicCubeObject();

    private omniLight: OmniLight = new OmniLight();

    init() {
        this.sky_box.use(MainController.CanvasController.getGL());
        this.groundPlane.model.transformation.scale(60).moveY(-3).apply();

        // this.exampleCube.model.transformation.moveX(-0.5).apply();
        this.exampleCube2.model.transformation.scale(0.5).moveX(0.8).moveY(0.4).moveZ(-0.5).apply();
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
        let genCubesBlank: number = 100;
        let genOmniLights: number = 50;
        let genSpotLights: number = 192;

        for(let i = 0; i < genCubes; i++) {
            const newCube = new DynamicCubeObject();
            let randomNr: number = Math.random() * 2 * Math.PI;
            newCube.model.transformation
                .moveX(Math.sin(randomNr) * (Math.random() * 20 + 5))
                .moveZ(Math.cos(randomNr) * (Math.random() * 20 + 5))
                .moveY(Math.cos(Math.random() * 2 * Math.PI) * 0.1 - 2)
                .rotateY(Math.random() * 90)
                .apply();
            this.altCubes.push(newCube);
            MainController.SceneController.pushSceneObject(newCube);
        }
        for(let i = 0; i < genCubesBlank; i++) {
            const newCube = new DynamicCubeBlankObject();
            let randomNr: number = Math.random() * 2 * Math.PI;
            newCube.model.transformation
                .moveX(Math.sin(randomNr) * (Math.random() * 20 + 5))
                .moveZ(Math.cos(randomNr) * (Math.random() * 20 + 5))
                .moveY(Math.cos(Math.random() * 2 * Math.PI) * 0.1  - 1)
                .rotateY(Math.random() * 90)
                .apply();
            this.altCubes.push(newCube);
            MainController.SceneController.pushSceneObject(newCube);
        }
        for(let i = 0; i < genOmniLights; i++) {
            const newLight = new OmniLight();
            let randomNr: number = Math.random() * 2 * Math.PI;
            newLight.position = {
                x: Math.sin(randomNr) * (Math.random() * 5 + 10),
                y: Math.cos(Math.random() * 2 * Math.PI) * 0.5,
                z: Math.abs(Math.cos(randomNr)) * (Math.random() * 5 + 10)
            };
            newLight.color = {x: Math.random() * 0.5 + 0.5, y: Math.random() * 0.5 + 0.5, z: Math.random() * 0.5 + 0.5};
            this.altOmniLights.push(newLight);
            MainController.SceneController.pushSceneLight(newLight);
        }
        for(let i = 0; i < genSpotLights; i++) {
            const newLight = new SpotLight();
            let randomNr: number = Math.random() * 2 * Math.PI;
            newLight.position = {
                x: Math.sin(randomNr) * (Math.random() * 5 + 10),
                y: Math.cos(Math.random() * 2 * Math.PI) * 0.5,
                z: Math.abs(Math.cos(randomNr)) * -(Math.random() * 5 + 10)
            };
            newLight.color = {x: Math.random() * 0.6 + 0.5, y: Math.random() * 0.6 + 0.5, z: Math.random() * 0.6 + 0.5};
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