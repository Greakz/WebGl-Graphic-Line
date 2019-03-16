import {TextureCubeMap} from "../Resource/Texture/TextureCubeMap";
import {BaseSkybox, Skybox} from "./Skybox";

export abstract class CubeMapSkybox extends BaseSkybox implements Skybox {
    cube_map: TextureCubeMap;
}