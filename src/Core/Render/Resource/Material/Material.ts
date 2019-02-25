import {RenderResource} from "../RenderResource";
import {Texture} from "../Texture/Texture";
import {GeometryShader} from "../../Shader/GeometryShader";
import { vec3 } from '../../../Geometry/Vector/vec';

export interface ColorMaterial {

}

/**
 * MATERIAL GETS UNIFORM BLOCK BUFFER BINDING 0
 */
export interface Material extends RenderResource {
    readonly resource_type: 'material';
    readonly resource_id: string;
    readonly load: (GL: WebGL2RenderingContext) => void;
    readonly use: (GL: WebGL2RenderingContext, geometryShader: GeometryShader) => void;
    // All the different infos that an material holds
    shininess: number;
    transparency: number;
    // reflection
    // refraction
}

export class StandardMaterial implements Material {
    readonly resource_type: 'material' = 'material';

    /**
     *
     */
    readonly resource_id: string = 'default-material';
    /**
     *
     */
    albedo_color: vec3;
    /**
     *
     */
    albedo_texture: Texture;
    /**
     *
     */
    specular_color: vec3;
    /**
     *
     */
    specular_texture: Texture;
    /**
     *
     */
    shininess: number;
    /**
     *
     */
    transparency: number;

    load(GL: WebGL2RenderingContext): void {

    };
    use(GL: WebGL2RenderingContext, geometryShader: GeometryShader): void {
        // LogInstance.info("Material", "binding Material");
        GL.uniform3f(
            geometryShader.uniform_locations.albedo_color,
            this.albedo_color.x,
            this.albedo_color.y,
            this.albedo_color.z
        );
        GL.uniform3f(
            geometryShader.uniform_locations.specular_color,
            this.specular_color.x,
            this.specular_color.y,
            this.specular_color.z
        );
        GL.uniform1f(
            geometryShader.uniform_locations.shininess,
            this.shininess
        );
    };
}