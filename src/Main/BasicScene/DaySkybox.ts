import {CubeMapSkybox} from "../../Core/Render/Skybox/CubeMapSkybox";
import {TextureCubeMap} from "../../Core/Render/Resource/Texture/TextureCubeMap";
import {SkyboxSpiresTexture} from "./Models/Textures/SkyboxSpiresTexture";

export class DaySkybox extends CubeMapSkybox {
    cube_map: TextureCubeMap = new SkyboxSpiresTexture();


}