import {RenderResource} from "./RenderResource";
import {GeometryShader} from "../Shader/GeometryShader";
import {ShadowShader} from "../Shader/ShadowShader";

export interface Mesh extends RenderResource {
    readonly resource_type: 'mesh';
    readonly resource_id: string;
    load(GL: WebGL2RenderingContext, geometry_shader: GeometryShader, shadow_shader: ShadowShader): void;
    use(GL: WebGL2RenderingContext): void;
}