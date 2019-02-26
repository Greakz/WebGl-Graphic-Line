import {ImageTexture} from "../../../../Core/Render/Resource/Texture/ImageTexture";
import {ContainerImage} from "../Images/ContainerImage";
import {Image} from "../../../../Core/Render/Resource/Image/Image";
import {ContainerSpecImage} from "../Images/ContainerSpecImage";

export class ContainerSpecTexture extends ImageTexture {
    public readonly resource_id: string = 'container-spec-texture';
    public image: Image = new ContainerSpecImage();
}