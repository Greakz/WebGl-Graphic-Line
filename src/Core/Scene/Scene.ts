import { Camera } from '../Render/Camera/Camera'
import {DayLight} from "../Render/Resource/Light/DayLight";
import {Skybox} from "../Render/Skybox/Skybox";

export interface Scene {
    day_light: DayLight;
    day_light_alt: DayLight | null;
    sky_box: Skybox;
    sky_box_alt: Skybox | null;
    alt_balance: number;
    camera: Camera;
    init(): void;
    update(time: number): void;
}

export abstract class BaseScene {
    day_light_alt: DayLight | null = null;
    sky_box_alt: Skybox | null = null;
    alt_balance: number = 0.0;
}