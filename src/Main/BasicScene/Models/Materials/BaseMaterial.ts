import {vec3} from '../../../../Core/Geometry/Vector/vec';
import {DefaultColorMaterial} from "../../../../Core/Render/Resource/Material/DefaultColorMaterial";

export class BaseMaterial extends DefaultColorMaterial {
    readonly resource_type: 'material';
    readonly resource_id: string = 'base-material';

    albedo_color: vec3 = {x: 0.2, y: 0.4, z: 0.5};

    specular_color: vec3 = {x: 0.2, y: 0.5, z: 0.6};
    shininess: number = 0.2;
    transparency: number = 0;
    reflection: number = 0.5;
}