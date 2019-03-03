import { Camera } from '../Render/Camera'
import {DayLight} from "../Render/Resource/Lights/DayLight";

export interface Scene {
    day_light: DayLight;
    camera: Camera;
    init(): void;
    update(time: number): void;
}