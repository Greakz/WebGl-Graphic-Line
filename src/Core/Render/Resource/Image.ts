import {RenderResource} from "./RenderResource";

export class Image implements RenderResource {
    public readonly resource_type: 'image';
    public readonly resource_id: 'default-image';
    public load(GL: WebGL2RenderingContext) {
        /*
            LOAD THE IMAGE!
         */
    }

}