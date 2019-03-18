import {CubeMapSkybox} from "../../Core/Render/Skybox/CubeMapSkybox";
import {TextureCubeMap} from "../../Core/Render/Resource/Texture/TextureCubeMap";
import {SkyboxMiramarTexture} from "./Models/Textures/SkyboxMiramarTexture";

export class NightSkybox extends CubeMapSkybox {
    cube_map: TextureCubeMap = new SkyboxMiramarTexture();
}