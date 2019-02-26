import {RenderResource} from "../RenderResource";
import {Image} from "../Image/Image";

export interface Texture extends RenderResource {
    readonly resource_type: 'texture';
    readonly resource_id: string;
    readonly image: Image;
    readonly load: (GL: WebGL2RenderingContext) => void;
    readonly use: (GL: WebGL2RenderingContext) => void;
}

