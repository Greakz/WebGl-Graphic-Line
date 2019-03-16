import { Camera } from '../Render/Camera/Camera'
import {DayLight} from "../Render/Resource/Light/DayLight";
import {Skybox} from "../Render/Skybox/Skybox";

export interface Scene {
    day_light: DayLight;
    camera: Camera;
    sky_box: Skybox;
    init(): void;
    update(time: number): void;
}