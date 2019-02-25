import {Texture} from "../Texture/Texture";
import {GeometryShader} from "../../Shader/GeometryShader";
import {Material} from "./Material";

export class DefaultTextureMaterial implements Material {
    readonly resource_type: 'material' = 'material';

    /**
     *
     */
    readonly resource_id: string = 'default-texture-material';
    /**
     *
     */
    albedo_texture: Texture;
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

    };
}