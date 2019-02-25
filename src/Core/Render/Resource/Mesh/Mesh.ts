import {RenderResource} from "../RenderResource";
import {Transformation} from '../../../Geometry/Transformation/Transformation';
import {GeometryShader} from "../../Shader/GeometryShader";
import {ShadowShader} from "../../Shader/ShadowShader";

export interface Mesh extends RenderResource {
    readonly resource_type: 'mesh';

    /** resource_id: string | should be set by a Mesh. Must be an unique identifier for a Mesh */
    readonly resource_id: string;

    /** draw_count: number | should be set by an Mesh. Specifies how many Vertices should be drawn by the Mesh! */
    readonly draw_count: number;

    transformation: Transformation;
    readonly load: (GL: WebGL2RenderingContext, geometry_shader: GeometryShader, shadow_shader: ShadowShader) => void
    readonly use: (GL: WebGL2RenderingContext) => void
}