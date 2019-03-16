import {ShaderLoader} from "./ShaderLoader";
import {Shader} from "./Shader";
import {MainController} from "../../Controller/MainController";

interface BlurShaderAttributePointer {
    vertex_position: GLint;
}

interface BlurShaderUniformLocations {
    model_matrix: WebGLUniformLocation;
    view_matrix: WebGLUniformLocation;
    projection_matrix: WebGLUniformLocation;
    debug_sample: WebGLUniformLocation;
}

export class BlurShader implements Shader {
    public readonly shader_id: string = 'blur-shader';

    readonly texture_bindings = {
        debug_sample: 0,
    };

    attribute_pointer: BlurShaderAttributePointer;
    uniform_locations: BlurShaderUniformLocations;
    program: WebGLProgram;

    constructor(GL: WebGL2RenderingContext) {
        this.program = ShaderLoader.buildShader('BlurShader');
        GL.useProgram(this.program);
        this.attribute_pointer = {
            vertex_position: GL.getAttribLocation(this.program, "VertexPosition"),
        };
        this.uniform_locations = {
            debug_sample: GL.getUniformLocation(this.program, "debug_sample"),
            projection_matrix: GL.getUniformLocation(this.program, "projection_matrix"),
            view_matrix: GL.getUniformLocation(this.program, "view_matrix"),
            model_matrix: GL.getUniformLocation(this.program, "model_matrix"),
        };
        GL.uniform1i(
            this.uniform_locations.debug_sample,
            this.texture_bindings.debug_sample
        );
    }

    cubeMapDebugPass(cubemap: WebGLTexture[]) {
        const GL = MainController.CanvasController.getGL();
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
        GL.useProgram(this.program);
        GL.viewport(0, 0, MainController.RenderController.getFrameInfo().width, MainController.RenderController.getFrameInfo().height);
        GL.clearColor(0.9, 0.9, 0.9, 1.0);
        GL.clear(GL.COLOR_BUFFER_BIT);
        /*
        IMPLEMENT RENDER A SINGLE CUBEMAP
        const run = Math.min(textures.length, Math.min(this.planevao.length, 4));
        for (let i = 0; i < run; i++) {
            GL.bindVertexArray(this.planevao[i]);
            GL.activeTexture(GL.TEXTURE0);
            GL.bindTexture(GL.TEXTURE_2D, textures[i]);
            GL.drawArrays(GL.TRIANGLES, 0, 6);
        }
        */
    }
}