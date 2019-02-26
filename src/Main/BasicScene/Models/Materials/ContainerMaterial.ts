import {DefaultTextureMaterial} from "../../../../Core/Render/Resource/Material/DefaultTextureMaterial";
import {Texture} from "../../../../Core/Render/Resource/Texture/Texture";
import {ContainerTexture} from "../Textures/ContainerTexture";
import {ContainerSpecTexture} from "../Textures/ContainerSpecTexture";

export class ContainerMaterial extends DefaultTextureMaterial {
    readonly resource_type: 'material';
    readonly resource_id: string = 'container-material';

    albedo_texture: Texture = new ContainerTexture();
    specular_texture: Texture = new ContainerSpecTexture();
    shininess: number = 8;
    transparency: number = 0;
}