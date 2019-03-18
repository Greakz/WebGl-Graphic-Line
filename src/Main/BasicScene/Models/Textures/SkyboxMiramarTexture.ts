import {Image} from "../../../../Core/Render/Resource/Image/Image";
import {TextureCubeMap} from "../../../../Core/Render/Resource/Texture/TextureCubeMap";
import {SkyboxMiramarFront} from "../Images/Skybox/SkyboxMiramarFront";
import {SkyboxMiramarBack} from "../Images/Skybox/SkyboxMiramarBack";
import {SkyboxMiramarLeft} from "../Images/Skybox/SkyboxMiramarLeft";
import {SkyboxMiramarRight} from "../Images/Skybox/SkyboxMiramarRight";
import {SkyboxMiramarTop} from "../Images/Skybox/SkyboxMiramarTop";
import {SkyboxMiramarBottom} from "../Images/Skybox/SkyboxMiramarBottom";

export class SkyboxMiramarTexture extends TextureCubeMap {
    public readonly resource_id: string = 'skybox-miramar-texture';
    constructor() {
        super();
    }
    readonly image_front: Image = new SkyboxMiramarRight();
    readonly image_back: Image = new SkyboxMiramarLeft();
    readonly image_left: Image = new SkyboxMiramarBack();
    readonly image_right: Image = new SkyboxMiramarFront();
    readonly image_top: Image = new SkyboxMiramarTop();
    readonly image_bottom: Image = new SkyboxMiramarBottom();
}