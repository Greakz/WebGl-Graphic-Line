import {BaseScene, Scene} from "../../Core/Scene/Scene";
import {MainController} from "../../Core/Controller/MainController";
import {StaticPlaneObject} from "./SceneObjects/Static/StaticPlaneObject";
import {DynamicCubeObject} from "./SceneObjects/Dynamic/DynamicCubeObject";
import {Camera} from '../../Core/Render/Camera/Camera';
import {DayLight} from "../../Core/Render/Resource/Light/DayLight";
import {OmniLight} from "../../Core/Render/Resource/Light/OmniLight";
import {SpotLight} from "../../Core/Render/Resource/Light/SpotLight";
import {AdvancedCamera} from "../../Core/Render/Camera/AdvancedCamera";
import {Skybox} from "../../Core/Render/Skybox/Skybox";
import {DaySkybox} from "./DaySkybox";
import {DynamicCubeBlankObject} from "./SceneObjects/Dynamic/DynamicCubeBlankObject";
import {scaleVec3} from "../../Core/Geometry/Vector/scale";
import {NightSkybox} from "./NightSkybox";

export class BasicScene extends BaseScene implements Scene {
    camera: Camera = new AdvancedCamera();
    day_light: DayLight = new DayLight();
    day_light_alt: DayLight = new DayLight();
    sky_box: Skybox = new NightSkybox();
    sky_box_alt: Skybox = new NightSkybox();

    private groundPlane: StaticPlaneObject = new StaticPlaneObject();
    private exampleCube: DynamicCubeObject = new DynamicCubeBlankObject();
    private exampleCubeX: DynamicCubeObject = new DynamicCubeBlankObject();
    private exampleCube2: DynamicCubeObject = new DynamicCubeObject();
    private exampleCube3: DynamicCubeObject = new DynamicCubeObject();

    private omniLight: OmniLight = new OmniLight();

    init() {

        this.day_light_alt.color = {x: 0.7, y: 0.8, z: 0.9};
        this.day_light_alt.amb_factor = {x: 0.3, y: 0.3, z: 0.3};
        this.day_light_alt.diffuse_factor = {x: 0.2, y: 0.2, z: 0.2};


        this.groundPlane.model.transformation.scale(60).moveY(-3).apply();

        // this.exampleCube.model.transformation.moveX(-0.5).apply();
        this.exampleCube2.model.transformation.scale(0.5).moveX(0.8).moveY(0.4).moveZ(-0.5).apply();
        this.exampleCube3.model.transformation.scale(3).moveX(0.2).moveY(-2).rotateY(45).apply();

        // push some objects
        MainController.SceneController.pushSceneObject(this.groundPlane);
        MainController.SceneController.pushSceneObject(this.exampleCube);
        MainController.SceneController.pushSceneObject(this.exampleCubeX);
        MainController.SceneController.pushSceneObject(this.exampleCube2);
        MainController.SceneController.pushSceneObject(this.exampleCube3);

        // make a fail push to test saftyness and no double insert
        MainController.SceneController.pushSceneObject(this.exampleCube);

        // remove one object
        // MainController.SceneController.removeSceneObject(this.exampleCube);
        // MainController.SceneController.pushSceneObject(this.exampleCube);

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

        for (let i = 0; i < genCubes; i++) {
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
        for (let i = 0; i < genCubesBlank; i++) {
            const newCube = new DynamicCubeBlankObject();
            let randomNr: number = Math.random() * 2 * Math.PI;
            newCube.model.transformation
                .moveX(Math.sin(randomNr) * (Math.random() * 20 + 5))
                .moveZ(Math.cos(randomNr) * (Math.random() * 20 + 5))
                .moveY(Math.cos(Math.random() * 2 * Math.PI) * 0.1 - 1)
                .rotateY(Math.random() * 90)
                .apply();
            this.altCubes.push(newCube);
            MainController.SceneController.pushSceneObject(newCube);
        }
        for (let i = 0; i < genOmniLights; i++) {
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
        for (let i = 0; i < genSpotLights; i++) {
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

    private day_cyclus_lenght: number = 10;
    private day_cyclus: number = 0;
    private last_frame_time: number = (new Date()).getTime();

    update(time: number) {
        this.camera.update(time);
        this.day_light.update(time);

        this.calcDayLight(time);

        // this.exampleCube3.model.transformation.rotateY(-0.5).apply();
    }

    calcDayLight(time: number) {
        const deltaTenthSeconds = (time - this.last_frame_time) / 1000;
        this.day_cyclus = (this.day_cyclus + deltaTenthSeconds) % this.day_cyclus_lenght;
        // this.day_cyclus = 7.5;
        const day_cyclus_status = (this.day_cyclus / this.day_cyclus_lenght);
        const inRadians = ((day_cyclus_status + 0.25) % 1) * 2 * Math.PI;

        const cosBalance = Math.max(Math.min((Math.cos(inRadians) * 1.5), 1.0), -1.0);
        this.alt_balance = (cosBalance * 0.5 + 0.5);

        if (day_cyclus_status <= 0.6 || day_cyclus_status >= 0.9) {
            const day1_time = (((day_cyclus_status + 0.1) % 1.0) * (5 / 7) * 2);
            this.day_light.direction = {
                x: -Math.cos(day1_time * Math.PI),
                y: Math.min(Math.max(((0.5 * Math.cos(day1_time * 2 * Math.PI) - 0.5) * 1.3), -1.0), -0.05),
                z: -Math.cos(day1_time * 2 * Math.PI) * 0.35,
            };
        } else {
            if (day_cyclus_status <= 0.75) {
                this.day_light.direction = {
                    x: 1.0,
                    y: -0.05,
                    z: -0.35,
                };
            } else {
                this.day_light.direction = {
                    x: -1.0,
                    y: -0.05,
                    z: -0.35,
                };
            }
        }
        if (day_cyclus_status <= 0.1 || day_cyclus_status >= 0.4) {
            const night1_time = (((day_cyclus_status + 0.6) % 1.0) * (5 / 7) * 2);
            this.day_light_alt.direction = {
                x: -Math.cos(night1_time * Math.PI),
                y:  Math.min(Math.max(((0.5 * Math.cos(night1_time * 2 * Math.PI) - 0.5) * 1.3), -1.0), -0.05),
                z: -Math.cos(night1_time * 2 * Math.PI) * 0.35,
            };
        } else {
            if (day_cyclus_status <= 0.25) {
                this.day_light_alt.direction = {
                    x: 1.0,
                    y: -0.05,
                    z: -0.35,
                };
            } else {
                this.day_light_alt.direction = {
                    x: -1.0,
                    y: -0.05,
                    z: -0.35,
                };
            }
        }
        this.exampleCubeX.model.transformation.setTranslation(
            scaleVec3(this.day_light.direction, -5)
        ).apply();
        this.exampleCube.model.transformation.setTranslation(
            scaleVec3(this.day_light_alt.direction, -5)
        ).apply();


        this.last_frame_time = time;
    }
}