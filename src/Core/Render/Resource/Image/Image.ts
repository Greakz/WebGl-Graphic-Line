import {RenderResource} from "../RenderResource";

export interface Image extends RenderResource {
    readonly resource_type: 'image';
    readonly resource_id: string;
    readonly image_src: string;
    readonly load: (GL: WebGL2RenderingContext) => void;
    readonly get: () => HTMLImageElement;
}