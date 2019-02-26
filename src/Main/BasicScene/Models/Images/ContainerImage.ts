import {SimpleImage} from "../../../../Core/Render/Resource/Image/SimpleImage";

export class ContainerImage extends SimpleImage {
    public readonly resource_id: string = 'container-image';
    public readonly image_src: string = 'Resources/container_diffuse.png';
    public readonly image_width: number = 500;
    public readonly image_height: number = 500;
}