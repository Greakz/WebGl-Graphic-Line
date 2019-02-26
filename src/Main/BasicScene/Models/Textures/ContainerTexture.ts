import {ImageTexture} from "../../../../Core/Render/Resource/Texture/ImageTexture";
import {ContainerImage} from "../Images/ContainerImage";
import {Image} from "../../../../Core/Render/Resource/Image/Image";

export class ContainerTexture extends ImageTexture {
    public readonly resource_id: string = 'container-texture';
    public image: Image = new ContainerImage();
}