import {Image} from "../Image/Image";
import {MainController} from "../../../Controller/MainController";
import {Texture2DI} from "./Texture";

export abstract class Texture2D implements Texture2DI {
    public readonly resource_type: 'texture';
    public readonly resource_id: string = 'default-texture';

    /** image: Image | Implemented by the Texture, which image should get used! */
    readonly image: Image;

    private texture_buffer: WebGLTexture;

    private ready: boolean = false;

    readonly load = (GL: WebGL2RenderingContext) => {
        this.texture_buffer = GL.createTexture();

        // @ts-ignore
        this.image = MainController.ResourceController.getImage(this.image);

        this.image.runIfReady(() => {
            GL.bindTexture(GL.TEXTURE_2D, this.texture_buffer);
            GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGBA, this.image.image_width, this.image.image_height, 0, GL.RGBA, GL.UNSIGNED_BYTE, this.image.get());
            // base settings, make it editable with texture options
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
            GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
            this.ready = true;
        });
    };
    readonly use = (GL: WebGL2RenderingContext) => {
        if(this.ready) {
            GL.bindTexture(GL.TEXTURE_2D, this.texture_buffer);
        } else {
            MainController.RenderController.bindEmptyTexture(GL);
        }
    };
    readonly get = () => this.texture_buffer;
}