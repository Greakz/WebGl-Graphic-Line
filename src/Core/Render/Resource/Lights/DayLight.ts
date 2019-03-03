import {vec3} from "../../../Geometry/Vector/vec";
import {MainController} from "../../../Controller/MainController";
import {DeferredLightningShader} from "../../Shader/DeferredLightningShader";
import {flatVec3} from "../../../Geometry/Vector/flatten";

export class DayLight {
    ambient_color: vec3 = {x: 0.4, y: 0.4, z: 0.4};
    directional_color: vec3 = {x: 0.6, y: 0.6, z: 0.6};
    directional_direction: vec3 = {x: 0.5, y: -1.0, z: -0.5};
    update(time: number) {}

    use(GL: WebGL2RenderingContext) {
        const shader: DeferredLightningShader = MainController.ShaderController.getDeferredLightningShader();
        GL.uniform3fv(
            shader.uniform_locations.amb_color,
            new Float32Array(flatVec3(this.ambient_color))
        );
        GL.uniform3fv(
            shader.uniform_locations.dir_color,
            new Float32Array(flatVec3(this.directional_color))
        );
        GL.uniform3fv(
            shader.uniform_locations.dir_direction,
            new Float32Array(flatVec3(this.directional_direction))
        );

    }
}