import {Image} from "../../../../Core/Render/Resource/Image/Image";
import {TextureCubeMap} from "../../../../Core/Render/Resource/Texture/TextureCubeMap";
import {SkyboxSpiresFront} from "../Images/Skybox/SkyboxSpiresFront";
import {SkyboxSpiresBack} from "../Images/Skybox/SkyboxSpiresBack";
import {SkyboxSpiresLeft} from "../Images/Skybox/SkyboxSpiresLeft";
import {SkyboxSpiresRight} from "../Images/Skybox/SkyboxSpiresRight";
import {SkyboxSpiresTop} from "../Images/Skybox/SkyboxSpiresTop";
import {SkyboxSpiresBottom} from "../Images/Skybox/SkyboxSpiresBottom";

export class SkyboxSpiresTexture extends TextureCubeMap {
    public readonly resource_id: string = 'skybox-spires-texture';
    constructor() {
        super();
    }
    readonly image_front: Image = new SkyboxSpiresRight();
    readonly image_back: Image = new SkyboxSpiresLeft();
    readonly image_left: Image = new SkyboxSpiresBack();
    readonly image_right: Image = new SkyboxSpiresFront();
    readonly image_top: Image = new SkyboxSpiresTop();
    readonly image_bottom: Image = new SkyboxSpiresBottom();
}