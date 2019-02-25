import { Camera } from '../Render/Camera'

export interface Scene {
    camera: Camera;
    init(): void;
    update(time: number): void;
}