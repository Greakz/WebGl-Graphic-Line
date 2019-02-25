import {RenderResource} from "./RenderResource";
import {Texture} from "./Texture";
import {GeometryShader} from "../Shader/GeometryShader";
import { vec3 } from '../../Geometry/Vector/vec';

export interface Material extends RenderResource {
    readonly resource_type: 'material';
    readonly resource_id: string;
    load(GL: WebGL2RenderingContext): void;
    use(GL: WebGL2RenderingContext, geometryShader: GeometryShader): void;

    // All the different infos that an material holds
    albedo: Texture | vec3;
    specular: Texture | vec3;
    shininess: number;
    transparency: number;
    // reflection
    // refraction
}