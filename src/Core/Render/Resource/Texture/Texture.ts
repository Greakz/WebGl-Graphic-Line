import {Image} from "../Image/Image";
import {RenderResource} from "../RenderResource";

export interface Texture extends RenderResource {
    readonly resource_type: 'texture';
    readonly resource_id: 'default-texture';
    readonly load: (GL: WebGL2RenderingContext) => void;
    readonly use: (GL: WebGL2RenderingContext) => void;
}
export class ImageTexture {
    public readonly resource_type: 'texture';
    public readonly resource_id: 'default-texture';

    /** image: Image | Implemented by the Texture, which image should get used! */
    protected readonly image: Image;

    private texture_buffer: WebGLTexture;

    readonly load = (GL: WebGL2RenderingContext) => {
        GL.createTexture();
        this.image.load(GL);
        console.log("texture continues after image load call");
    };
    readonly use = (GL: WebGL2RenderingContext) => {

    };
}