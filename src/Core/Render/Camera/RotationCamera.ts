import {BaseCamera, Camera} from "./Camera";

export class RotationCamera extends BaseCamera implements Camera {

    update(time: number) {
        const position: number = (time * 0.0001) % (2 * Math.PI);

        this.position = {
            x: Math.sin(position) * 50,
            y: 34,
            z: Math.cos(position) * 50
        };
        this.updateMatrices();
    }
}