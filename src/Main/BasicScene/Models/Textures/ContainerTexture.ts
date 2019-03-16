import {Texture2D} from "../../../../Core/Render/Resource/Texture/Texture2D";
import {ContainerImage} from "../Images/ContainerImage";
import {Image} from "../../../../Core/Render/Resource/Image/Image";

export class ContainerTexture extends Texture2D {
    public readonly resource_id: string = 'container-texture';
    public image: Image = new ContainerImage();
}