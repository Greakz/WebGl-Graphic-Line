import {ShaderLoader} from "./ShaderLoader";
import {Shader} from "./Shader";
import { MainController } from '../../Controller/MainController';

interface FramebufferDebugShaderAttributePointer {
    vertex_position: GLint;
    texture_position: GLint;
}

interface FramebufferDebugShaderUniformLocations {
    texture: WebGLUniformLocation;
}

export class FramebufferDebugShader implements Shader {
    public readonly shader_id: string = 'framebuffer-debug-shader';

    attribute_pointer: FramebufferDebugShaderAttributePointer;
    uniform_locations: FramebufferDebugShaderUniformLocations;
    program: WebGLProgram;

    private planebuffer: WebGLBuffer[] = [];
    private planevao: WebGLVertexArrayObject[] = [];

    constructor(GL: WebGL2RenderingContext) {
        this.program = ShaderLoader.buildShader('FramebufferDebugShader');
        this.attribute_pointer = {
            vertex_position: GL.getAttribLocation(this.program, "VertexPosition"),
            texture_position: GL.getAttribLocation(this.program, "TexturePosition"),
        };
        this.uniform_locations = {
            texture: GL.getUniformLocation(this.program, "input_texture"),
        };
        GL.useProgram(this.program);
        GL.uniform1i(
            this.uniform_locations.texture,
            0
        );

        this.planebuffer = [];
        this.planevao = [];
        // Prepare shit for Debug Pass!
        for (let i = 0; i < 4; i++) {
            const newVao = GL.createVertexArray();
            const newBuffer = GL.createBuffer();

            GL.bindVertexArray(newVao);
            GL.bindBuffer(GL.ARRAY_BUFFER, newBuffer);
            GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.getVertexData(i)), GL.STATIC_DRAW);

            GL.vertexAttribPointer(this.attribute_pointer.vertex_position, 3, GL.FLOAT, false, 5 * 4, 0);
            GL.enableVertexAttribArray(this.attribute_pointer.vertex_position);

            GL.vertexAttribPointer(this.attribute_pointer.texture_position, 2, GL.FLOAT, false, 5 * 4, 3 * 4);
            GL.enableVertexAttribArray(this.attribute_pointer.texture_position);

            this.planebuffer.push(newBuffer);
            this.planevao.push(newVao);
        }
        GL.bindBuffer(GL.ARRAY_BUFFER, null);
        GL.bindVertexArray(null);

    }

    private getVertexData(pos: number) {
        const xOffset = (pos === 1 || pos === 3) ? 1 : 0;
        const yOffset = (pos === 2 || pos === 3) ? -1 : 0;

        const aspect = MainController.CanvasController.getAspect();
        const height = 1 / aspect;


        const bottom = (1 - height) / 2;
        const top = bottom + height;

        return [
            -1.0 + xOffset, 1.0 + yOffset, 0.0, 0.0, top,
            -1.0 + xOffset, 0.0 + yOffset, 0.0, 0.0, bottom,
            0.0 + xOffset, 1.0 + yOffset, 0.0, 1.0, top,

            0.0 + xOffset, 1.0 + yOffset, 0.0, 1.0, top,
            -1.0 + xOffset, 0.0 + yOffset, 0.0, 0.0, bottom,
            0.0 + xOffset, 0.0 + yOffset, 0.0, 1.0, bottom
        ];
    }

    textureDebugPass(textures: WebGLTexture[]) {
        const GL = MainController.CanvasController.getGL();
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
        GL.useProgram(this.program);
        GL.viewport(0, 0, MainController.RenderController.getFrameInfo().width, MainController.RenderController.getFrameInfo().height);
        GL.clearColor(0.9, 0.9, 0.9, 1.0);
        GL.clear(GL.COLOR_BUFFER_BIT);
        const run = Math.min(textures.length, Math.min(this.planevao.length, 4));
        for (let i = 0; i < run; i++) {
            GL.bindVertexArray(this.planevao[i]);
            GL.activeTexture(GL.TEXTURE0);
            GL.bindTexture(GL.TEXTURE_2D, textures[i]);
            GL.drawArrays(GL.TRIANGLES, 0, 6);
        }
    }
}