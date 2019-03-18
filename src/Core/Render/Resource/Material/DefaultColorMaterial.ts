import {vec3} from "../../../Geometry/Vector/vec";
import {GeometryShader} from "../../Shader/GeometryShader";
import {Material} from "./Material";
import {MainController} from "../../../Controller/MainController";

export abstract class DefaultColorMaterial implements Material {
    readonly resource_type: 'material' = 'material';

    /**
     *
     */
    readonly resource_id: string = 'default-color-material';
    /**
     *
     */
    albedo_color: vec3 = {x: 1.0, y: 1.0, z: 1.0};
    /**
     *
     */
    specular_color: vec3 = {x: 1.0, y: 1.0, z: 1.0};
    /**
     *
     */
    shininess: number = 4;
    /**
     *
     */
    opacity: number = 1.0;


    reflection: number = 0.0;

    private uniform_buffer_object: WebGLBuffer;

    readonly load = (GL: WebGL2RenderingContext) => {
        this.uniform_buffer_object = GL.createBuffer();
        GL.bindBuffer(GL.UNIFORM_BUFFER, this.uniform_buffer_object);
        GL.bufferData(GL.UNIFORM_BUFFER, new Float32Array(12), GL.DYNAMIC_DRAW);
        GL.bindBuffer(GL.UNIFORM_BUFFER, this.uniform_buffer_object);
    };
    readonly use = (GL: WebGL2RenderingContext, geometryShader: GeometryShader) => {
        MainController.RenderController.bindEmptyTexture(GL, GL.TEXTURE0);
        MainController.RenderController.bindEmptyTexture(GL, GL.TEXTURE1);

        GL.bindBuffer(GL.UNIFORM_BUFFER, this.uniform_buffer_object);
        GL.bufferData(
            GL.UNIFORM_BUFFER,
            new Float32Array([
                this.albedo_color.x, this.albedo_color.y, this.albedo_color.z, this.opacity,
                this.specular_color.x, this.specular_color.y, this.specular_color.z, this.reflection,
                this.shininess,
                1.0, // Use Color = true;
                0.0, // Use Texture = false;
                1.0
            ]),
            GL.DYNAMIC_DRAW
        );
        GL.bindBufferBase(GL.UNIFORM_BUFFER, geometryShader.attribute_pointer.material_block_index, this.uniform_buffer_object);
    };
}