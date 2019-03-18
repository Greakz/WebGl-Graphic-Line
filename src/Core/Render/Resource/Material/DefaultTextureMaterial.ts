import {Texture} from "../Texture/Texture";
import {GeometryShader} from "../../Shader/GeometryShader";
import {Material} from "./Material";
import {MainController} from "../../../Controller/MainController";

export abstract class DefaultTextureMaterial implements Material {
    readonly resource_type: 'material' = 'material';

    /**
     *
     */
    readonly resource_id: string = 'default-texture-material';
    /**
     *
     */
    albedo_texture: Texture;
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
    opacity: number = 1.0;


    reflection: number = 0.0;

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
                0, 0, 0, this.opacity,
                0, 0, 0, this.reflection,
                this.shininess,
                0.0, // Use Color = false;
                1.0, // Use Texture = true;
                1.0
            ]),
            GL.DYNAMIC_DRAW
        );
        GL.bindBufferBase(GL.UNIFORM_BUFFER, geometryShader.attribute_pointer.material_block_index, this.uniform_buffer_object);
    };

}