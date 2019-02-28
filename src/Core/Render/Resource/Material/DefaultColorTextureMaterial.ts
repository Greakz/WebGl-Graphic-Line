import {vec3} from "../../../Geometry/Vector/vec";
import {Texture} from "../Texture/Texture";
import {GeometryShader} from "../../Shader/GeometryShader";
import {Material} from "./Material";
import {MainController} from "../../../Controller/MainController";

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

        this.albedo_texture = MainController.ResourceController.getTexture(this.albedo_texture);
        this.specular_texture = MainController.ResourceController.getTexture(this.specular_texture);
    };
    use(GL: WebGL2RenderingContext, geometryShader: GeometryShader): void {
        GL.activeTexture(GL.TEXTURE0);
        this.albedo_texture.use(GL);
        GL.activeTexture(GL.TEXTURE1);
        this.specular_texture.use(GL);
        GL.bindBuffer(GL.UNIFORM_BUFFER, this.uniform_buffer_object);
        GL.bufferData(
            GL.UNIFORM_BUFFER,
            new Float32Array([
                this.albedo_color.x, this.albedo_color.y, this.albedo_color.z, 0.0,
                this.specular_color.x, this.specular_color.y, this.specular_color.z, 0.0,
                this.shininess,
                1.0, // Use Color = false;
                1.0, // Use Texture = false;
                1.0
            ]),
            GL.DYNAMIC_DRAW
        );
        GL.bindBufferBase(GL.UNIFORM_BUFFER, geometryShader.attribute_pointer.material_block_index, this.uniform_buffer_object);
    };

}