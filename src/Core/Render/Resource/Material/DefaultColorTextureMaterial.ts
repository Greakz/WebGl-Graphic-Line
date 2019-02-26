import {vec3} from "../../../Geometry/Vector/vec";
import {Texture} from "../Texture/Texture";
import {GeometryShader} from "../../Shader/GeometryShader";
import {Material} from "./Material";

export abstract class DefaultColorTextureMaterial implements Material {
    readonly resource_type: 'material' = 'material';

    /**
     *
     */
    readonly resource_id: string = 'default-material';
    /**
     *
     */
    albedo_color: vec3;
    /**
     *
     */
    albedo_texture: Texture;
    /**
     *
     */
    specular_color: vec3;
    /**
     *
     */
    specular_texture: Texture;
    /**
     *
     */
    shininess: number;
    /**
     *
     */
    transparency: number;

    private uniform_buffer_object: WebGLBuffer;

    readonly load = (GL: WebGL2RenderingContext) => {
        this.uniform_buffer_object = GL.createBuffer();
        GL.bindBuffer(GL.UNIFORM_BUFFER, this.uniform_buffer_object);
        GL.bufferData(GL.UNIFORM_BUFFER, new Float32Array(12), GL.DYNAMIC_DRAW);
        GL.bindBuffer(GL.UNIFORM_BUFFER, this.uniform_buffer_object);
    };
    use(GL: WebGL2RenderingContext, geometryShader: GeometryShader): void {
        GL.bindBuffer(GL.UNIFORM_BUFFER, this.uniform_buffer_object);
        GL.bufferData(
            GL.UNIFORM_BUFFER,
            new Float32Array([
                this.albedo_color.x, this.albedo_color.y, this.albedo_color.z, 0.0,
                this.specular_color.x, this.specular_color.y, this.specular_color.z, 0.0,
                this.shininess,
                1.0, // Use Color = false;
                0.0, // Use Texture = false;
                0.0
            ]),
            GL.DYNAMIC_DRAW
        );
        GL.bindBufferBase(GL.UNIFORM_BUFFER, geometryShader.attribute_pointer.material_block_index, this.uniform_buffer_object);
    };
}