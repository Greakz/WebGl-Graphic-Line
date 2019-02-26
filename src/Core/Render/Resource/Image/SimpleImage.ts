import {Image} from "./Image";

export class SimpleImage implements Image {
    public readonly resource_type: 'image';
    public readonly resource_id: string = 'simple-image';
    public readonly image_src: string = 'Resources/default_image.jpg';
    public readonly image_width: number = 128;
    public readonly image_height: number = 128;
    private image: HTMLImageElement;
    private ready: boolean = false;
    readonly load = (GL: WebGL2RenderingContext) => {
        this.image = new Image();
        this.image.src = this.image_src;
        this.image.onload = () => {
            console.log('image loaded');
            this.ready = true;
            if(this.callback !== undefined) {
                this.callback();
            }
        }
    };
    readonly get = () => {
        if (this.ready) {
            return this.image;
        } else {
            throw Error("Should not request Image before loading!")
        }
    };
    private callback: undefined | command;
    readonly runIfReady = (callback: command) => {
        if(this.ready) {
            callback();
        } else {
            this.callback = callback;
        }
    };
}

type command = () => void;