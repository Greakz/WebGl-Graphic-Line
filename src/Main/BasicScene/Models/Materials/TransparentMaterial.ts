import {vec3} from '../../../../Core/Geometry/Vector/vec';
import {DefaultColorMaterial} from "../../../../Core/Render/Resource/Material/DefaultColorMaterial";

export class TransparentMaterial extends DefaultColorMaterial {
    readonly resource_type: 'material';
    readonly resource_id: string = 'transparent-material';

    albedo_color: vec3 = {x: 0.2, y: 0.4, z: 0.6};
    specular_color: vec3 = {x: 0.5, y: 0.4, z: 0.4};
    shininess: number = 0.4;
    opacity: number = 0.5;
    reflection: number = 0.4;
}