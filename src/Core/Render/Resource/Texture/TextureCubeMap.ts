import {Image} from "../Image/Image";
import {MainController} from "../../../Controller/MainController";
import {TextureCubeMapI} from "./Texture";

export abstract class TextureCubeMap implements TextureCubeMapI {
    public readonly resource_type: 'texture';
    public readonly resource_id: string = 'default-cube-map-texture';

    /** image: Image | Implemented by the Texture, which image should get used! */
    readonly image_front: Image;
    readonly image_back: Image;
    readonly image_left: Image;
    readonly image_right: Image;
    readonly image_top: Image;
    readonly image_bottom: Image;

    private readyCounter = 6;
    private texture_buffer: WebGLTexture;

    private ready: boolean = false;

    readonly load = (GL: WebGL2RenderingContext) => {
        this.texture_buffer = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_CUBE_MAP, this.texture_buffer);

        // @ts-ignore
        this.image_front = MainController.ResourceController.getImage(this.image_front);
        // @ts-ignore
        this.image_back = MainController.ResourceController.getImage(this.image_back);
        // @ts-ignore
        this.image_left = MainController.ResourceController.getImage(this.image_left);
        // @ts-ignore
        this.image_right = MainController.ResourceController.getImage(this.image_right);
        // @ts-ignore
        this.image_top = MainController.ResourceController.getImage(this.image_top);
        // @ts-ignore
        this.image_bottom = MainController.ResourceController.getImage(this.image_bottom);

        const height: number = this.image_front.image_height;
        const width: number = this.image_front.image_width;

        this.image_front.runIfReady(() => {
            // Prepare Front
            GL.texImage2D(
                GL.TEXTURE_CUBE_MAP_POSITIVE_Z,
                0, GL.RGB,
                width, height,
                0, GL.RGB,
                GL.UNSIGNED_BYTE,
                this.image_front.get()
            );
            this.finishedPart(GL);
        });
        this.image_back.runIfReady(() => {
            // Prepare Back
            GL.texImage2D(
                GL.TEXTURE_CUBE_MAP_NEGATIVE_Z,
                0, GL.RGB,
                width, height,
                0, GL.RGB,
                GL.UNSIGNED_BYTE,
                this.image_back.get()
            );
            this.finishedPart(GL);
        });
        this.image_left.runIfReady(() => {
            // Prepare Left
            GL.texImage2D(
                GL.TEXTURE_CUBE_MAP_NEGATIVE_X,
                0, GL.RGB,
                width, height,
                0, GL.RGB,
                GL.UNSIGNED_BYTE,
                this.image_left.get()
            );
            this.finishedPart(GL);
        });
        this.image_right.runIfReady(() => {
            // Prepare Right
            GL.texImage2D(
                GL.TEXTURE_CUBE_MAP_POSITIVE_X,
                0, GL.RGB,
                width, height,
                0, GL.RGB,
                GL.UNSIGNED_BYTE,
                this.image_right.get()
            );
            this.finishedPart(GL);
        });
        this.image_top.runIfReady(() => {
            // Prepare Top
            GL.texImage2D(
                GL.TEXTURE_CUBE_MAP_POSITIVE_Y,
                0, GL.RGB,
                width, height,
                0, GL.RGB,
                GL.UNSIGNED_BYTE,
                this.image_top.get()
            );
            this.finishedPart(GL);
        });
        this.image_bottom.runIfReady(() => {
            // Prepare Bottom
            GL.texImage2D(
                GL.TEXTURE_CUBE_MAP_NEGATIVE_Y,
                0, GL.RGB,
                width, height,
                0, GL.RGB,
                GL.UNSIGNED_BYTE,
                this.image_bottom.get()
            );
            this.finishedPart(GL);
        });
    };
    private finishedPart(GL: WebGL2RenderingContext) {
        this.readyCounter--;
        if(this.readyCounter <= 0) {
            GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
            GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
            GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
            GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
            GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_WRAP_R, GL.CLAMP_TO_EDGE);
            this.ready = true;
        }
    }
    readonly use = (GL: WebGL2RenderingContext) => {
        if(this.ready) {
            GL.bindTexture(GL.TEXTURE_CUBE_MAP, this.texture_buffer);
        } else {
            MainController.RenderController.bindEmptyTexture(GL);
        }
    };
    readonly get = () => this.texture_buffer;

}