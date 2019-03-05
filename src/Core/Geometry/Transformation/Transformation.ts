import { mat4 } from '../Matrix/mat';
import { vec3 } from '../Vector/vec';
import { multiplyArrayOfMatrices } from '../Matrix/multiply';
import { getTranslationMatrix } from '../Matrix/translation';
import { getRotationXMatrix, getRotationYMatrix, getRotationZMatrix } from '../Matrix/rotation';
import { getScalingMatrix } from '../Matrix/scaling';
import { radians } from '../radians';
import { scaleVec3 } from '../Vector/scale';

export class Transformation {

    static zeroVec() {return {x: 0, y: 0, z: 0}}
    static oneVec() {return {x: 1, y: 1, z: 1}}

    private translation: vec3;
    private rotation: vec3;
    private scaling: vec3;
    private generated_matrix: mat4;

    constructor() {
        this.translation = Transformation.zeroVec();
        this.rotation = Transformation.zeroVec();
        this.scaling = Transformation.oneVec();
        this.apply();
    }

    moveX(offset: number) {this.translation.x += offset; return this;}
    moveY(offset: number) {this.translation.y += offset; return this;}
    moveZ(offset: number) {this.translation.z += offset; return this;}

    rotateX(degree: number) {this.rotation.x = (this.rotation.x + degree) % 360; return this;}
    rotateY(degree: number) {this.rotation.y = (this.rotation.y + degree) % 360; return this;}
    rotateZ(degree: number) {this.rotation.z = (this.rotation.z + degree) % 360; return this;}

    // scaleX(scale: number) {this.scaling.x *= scale; return this;}
    // scaleY(scale: number) {this.scaling.y *= scale; return this;}
    // scaleZ(scale: number) {this.scaling.y *= scale; return this;}
    scale(scale: number) {this.scaling = scaleVec3(this.scaling, scale); return this;}

    setTranslation(t: vec3) {this.translation = t; return this;}
    getTranslation(): vec3 {return this.translation}
    setRotation(r: vec3) {this.rotation = r; return this;}
    getRotation(): vec3 {return this.rotation}
    setScaling(s: vec3) {this.scaling = s; return this;}
    getScaling(): vec3 {return this.scaling}
    
    apply(): void {
        this.generated_matrix = multiplyArrayOfMatrices([
            getTranslationMatrix(this.translation.x, this.translation.y, this.translation.z),
            getRotationZMatrix(radians(this.rotation.z)),
            getRotationXMatrix(radians(this.rotation.x)),
            getRotationYMatrix(radians(this.rotation.y)),
            getScalingMatrix(this.scaling.x, this.scaling.y, this.scaling.z),
        ]);
    }
    getMatrix(): mat4 {
        return this.generated_matrix;
    }
}