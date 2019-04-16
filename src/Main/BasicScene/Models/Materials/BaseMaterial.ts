import {vec3} from '../../../../Core/Geometry/Vector/vec';
import {DefaultColorMaterial} from "../../../../Core/Render/Resource/Material/DefaultColorMaterial";

export class BaseMaterial extends DefaultColorMaterial {
    readonly resource_type: 'material';
    readonly resource_id: string = 'base-material';

    albedo_color: vec3 = {x: 0.6, y: 0.2, z: 0.2};
    specular_color: vec3 = {x: 0.5, y: 0.2, z: 0.2};
    shininess: number = 0.7;
    opacity: number = 1.0;
    reflection: number = 0.6;
}