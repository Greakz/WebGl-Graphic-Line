import {CubeMapSkybox} from "../../Core/Render/Skybox/CubeMapSkybox";
import {TextureCubeMap} from "../../Core/Render/Resource/Texture/TextureCubeMap";
import {SkyboxSpiresTexture} from "./Models/Textures/SkyboxSpiresTexture";

export class BasicSkybox extends CubeMapSkybox {
    cube_map: TextureCubeMap = new SkyboxSpiresTexture();


}