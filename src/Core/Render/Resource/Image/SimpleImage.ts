import {Image} from "./Image";

export class SimpleImage implements Image {
    public readonly resource_type: 'image';
    public readonly resource_id: string = 'simple-image';
    public readonly image_src: string = 'Resources/default_image.jpg';
    private image: HTMLImageElement;
    private ready: boolean = false;
    readonly load = (GL: WebGL2RenderingContext) => {
        this.image = new HTMLImageElement();
        this.image.src = this.image_src;
        this.image.onload = () => {
            console.log('image loaded');
            this.ready = true;
        }
    };
    readonly get = () => {
        if (this.ready) {
            return this.image;
        }
    };
}