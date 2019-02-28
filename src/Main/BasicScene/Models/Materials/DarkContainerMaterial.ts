import {Texture} from "../../../../Core/Render/Resource/Texture/Texture";
import {ContainerTexture} from "../Textures/ContainerTexture";
import {ContainerSpecTexture} from "../Textures/ContainerSpecTexture";
import {DefaultColorTextureMaterial} from "../../../../Core/Render/Resource/Material/DefaultColorTextureMaterial";
import {vec3} from "../../../../Core/Geometry/Vector/vec";

export class DarkContainerMaterial extends DefaultColorTextureMaterial {
    readonly resource_type: 'material';
    readonly resource_id: string = 'dark-container-material';

    albedo_texture: Texture = new ContainerTexture();
    albedo_color: vec3 = {x: 0.3, y: 0.3, z: 0.3};
    specular_texture: Texture = new ContainerSpecTexture();
    specular_color: vec3 = {x: 0.2, y: 0.2, z: 0.2};
    shininess: number = 8;
    transparency: number = 0;
}