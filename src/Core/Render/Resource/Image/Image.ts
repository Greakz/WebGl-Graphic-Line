import {RenderResource} from "../RenderResource";

export interface Image extends RenderResource {
    readonly resource_type: 'image';
    readonly resource_id: string;
    readonly image_src: string;
    readonly image_width: number;
    readonly image_height: number;
    readonly load: (GL: WebGL2RenderingContext) => void;
    readonly get: () => HTMLImageElement;
    readonly runIfReady: (callback: () => void) => void;
}