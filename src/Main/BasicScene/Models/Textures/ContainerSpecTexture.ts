import {Texture2D} from "../../../../Core/Render/Resource/Texture/Texture2D";
import {ContainerImage} from "../Images/ContainerImage";
import {Image} from "../../../../Core/Render/Resource/Image/Image";
import {ContainerSpecImage} from "../Images/ContainerSpecImage";

export class ContainerSpecTexture extends Texture2D {
    public readonly resource_id: string = 'container-spec-texture';
    public image: Image = new ContainerSpecImage();
}