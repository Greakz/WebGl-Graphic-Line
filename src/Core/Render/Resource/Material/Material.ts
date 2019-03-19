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
    readonly useTransparency: (GL: WebGL2RenderingContext, transparencyShader) => void;
    // All the different infos that an material holds
    shininess: number;
    opacity: number;
    reflection: number;
    // refraction
}