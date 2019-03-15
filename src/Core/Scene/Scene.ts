import { Camera } from '../Render/Camera/Camera'
import {DayLight} from "../Render/Resource/Light/DayLight";

export interface Scene {
    day_light: DayLight;
    camera: Camera;
    init(): void;
    update(time: number): void;
}