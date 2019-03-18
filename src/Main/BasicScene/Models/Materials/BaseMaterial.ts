import {vec3} from '../../../../Core/Geometry/Vector/vec';
import {DefaultColorMaterial} from "../../../../Core/Render/Resource/Material/DefaultColorMaterial";

export class BaseMaterial extends DefaultColorMaterial {
    readonly resource_type: 'material';
    readonly resource_id: string = 'base-material';

    albedo_color: vec3 = {x: 0.01, y: 0.01, z: 0.01};
    specular_color: vec3 = {x: 0.1, y: 0.1, z: 0.1};
    shininess: number = 0.2;
    transparency: number = 0;
    reflection: number = 0.6;
}