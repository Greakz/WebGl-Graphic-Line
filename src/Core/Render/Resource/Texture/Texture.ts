import {RenderResource} from "../RenderResource";
import {Image} from "../Image/Image";

export interface Texture extends RenderResource {
    readonly resource_type: 'texture';
    readonly resource_id: string;
    readonly load: (GL: WebGL2RenderingContext) => void;
    readonly use: (GL: WebGL2RenderingContext) => void;
    readonly get: () => WebGLTexture;
}

export interface Texture2DI extends Texture {
    readonly image: Image;
}

export interface TextureCubeMapI extends Texture {
    readonly image_front: Image;
    readonly image_back: Image;
    readonly image_left: Image;
    readonly image_right: Image;
    readonly image_top: Image;
    readonly image_bottom: Image;
}

