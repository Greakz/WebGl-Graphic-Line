import {vec3} from "../../../Geometry/Vector/vec";
import {MainController} from "../../../Controller/MainController";
import {DeferredLightningShader} from "../../Shader/DeferredLightningShader";
import {flatVec3} from "../../../Geometry/Vector/flatten";

export class DayLight {
    color: vec3 = {x: 0.85, y: 0.85, z: 1.0};
    direction: vec3 = {x: -0.5, y: -0.5, z: -0.5};
    amb_factor: vec3 = {x: 0.28, y: 0.28, z: 0.28};
    diffuse_factor: vec3 = {x: 0.8, y: 0.8, z: 0.8};
    specular_factor: vec3 = {x: 0.4, y: 0.4, z: 0.4};
    update(time: number) {}

    use(GL: WebGL2RenderingContext) {
        const shader: DeferredLightningShader = MainController.ShaderController.getDeferredLightningShader();
        GL.uniform3fv(
            shader.uniform_locations.daylight_color,
            new Float32Array(flatVec3(this.color))
        );
        GL.uniform3fv(
            shader.uniform_locations.daylight_direction,
            new Float32Array(flatVec3(this.direction))
        );
        GL.uniform3fv(
            shader.uniform_locations.daylight_amb_factor,
            new Float32Array(flatVec3(this.amb_factor))
        );
        GL.uniform3fv(
            shader.uniform_locations.daylight_diff_factor,
            new Float32Array(flatVec3(this.diffuse_factor))
        );
        GL.uniform3fv(
            shader.uniform_locations.daylight_spec_factor,
            new Float32Array(flatVec3(this.specular_factor))
        );
    }
}