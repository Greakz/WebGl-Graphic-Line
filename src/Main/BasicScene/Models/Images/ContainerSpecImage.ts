import {SimpleImage} from "../../../../Core/Render/Resource/Image/SimpleImage";

export class ContainerSpecImage extends SimpleImage {
    public readonly resource_id: string = 'container-spec-image';
    public readonly image_src: string = 'Resources/container_specular.png';
    public readonly image_width: number = 500;
    public readonly image_height: number = 500;
}