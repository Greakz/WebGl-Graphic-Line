import {vec3} from '../../../../Core/Geometry/Vector/vec';
import {DefaultColorMaterial} from "../../../../Core/Render/Resource/Material/DefaultColorMaterial";

export class TransparentMaterial extends DefaultColorMaterial {
    readonly resource_type: 'material';
    readonly resource_id: string = 'transparent-material';

    albedo_color: vec3 = {x: 0.1, y: 0.2, z: 0.3};
    specular_color: vec3 = {x: 0.2, y: 0.25, z: 0.3};
    shininess: number = 0.4;
    opacity: number = 0.8;
    reflection: number = 0.3;
}