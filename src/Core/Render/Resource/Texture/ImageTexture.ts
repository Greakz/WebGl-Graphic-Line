import {Image} from "../Image/Image";
import {MainController} from "../../../Controller/MainController";
import {Texture} from "./Texture";

export abstract class ImageTexture implements Texture {
    public readonly resource_type: 'texture';
    public readonly resource_id: string = 'default-texture';

    /** image: Image | Implemented by the Texture, which image should get used! */
    readonly image: Image;
    private use_image: Image;

    private texture_buffer: WebGLTexture;

    readonly load = (GL: WebGL2RenderingContext) => {
        this.texture_buffer = GL.createTexture();

        this.use_image = MainController.ResourceController.getImage(this.image);
        this.use_image.runIfReady(() => {
            GL.bindTexture(GL.TEXTURE_2D, this.texture_buffer);
            GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, this.use_image.image_width, this.use_image.image_height, 0, GL.RGBA, GL.UNSIGNED_BYTE, this.use_image.get());
            // base settings, make it editable with texture options
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
        });
    };
    readonly use = (GL: WebGL2RenderingContext) => {
        GL.bindTexture(GL.TEXTURE_2D, this.texture_buffer);
    };
}