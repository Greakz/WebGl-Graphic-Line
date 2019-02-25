import {Material} from "../../../../Core/Render/Resource/Material";
import {vec3} from "../../../../Core/Geometry/Vector/vec3";
import {GeometryShader} from "../../../../Core/Render/Shader/GeometryShader";

export class BaseMaterial implements Material {
    readonly resource_type: 'material';
    readonly resource_id: string = 'base-material';
    load(GL: WebGL2RenderingContext): void {

    };
    use(GL: WebGL2RenderingContext, geometryShader: GeometryShader): void {
        GL.uniform3f(
            geometryShader.uniform_locations.albedo_color,
            this.albedo.x,
            this.albedo.y,
            this.albedo.z
        );
        GL.uniform3f(
            geometryShader.uniform_locations.specular_color,
            this.specular.x,
            this.specular.y,
            this.specular.z
        );
        GL.uniform1f(
            geometryShader.uniform_locations.shininess,
            this.shininess
        );
    };
    albedo: vec3 = {x: 0.8, y: 0.4, z: 0.5};
    specular: vec3 = {x: 0.9, y: 0.5, z: 0.6};
    shininess: number = 8;
    transparency: number = 0;
}