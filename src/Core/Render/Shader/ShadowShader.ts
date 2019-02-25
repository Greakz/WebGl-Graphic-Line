import {Shader} from "./Shader";

export class ShadowShader implements Shader {
    public readonly shader_id: string = 'shadow-shader';
    attribute_pointer: {};
    uniform_locations: {};

    constructor(GL: WebGL2RenderingContext, shader: WebGLProgram) {
        this.attribute_pointer = {};
        this.uniform_locations = {};
    }
}