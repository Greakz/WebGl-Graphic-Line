// idee: sammeln alles was der ausspuckt, weil dann für solid shit und für transparenz und son müll
import {checkFramebuffer} from "../../../../Util/FramebufferCheck";
import {MainController} from "../../../MainController";
import {DrawMesh, DrawMeshesWithBufferedData} from "../../../../Render/DrawMesh";


export class GeometryPassStorage {

    // Generated By Geometry Pass!
    geometry_framebuffer: WebGLFramebuffer;

    position_texture: WebGLTexture;
    albedo_texture: WebGLTexture;
    specular_texture: WebGLTexture;
    normal_texture: WebGLTexture;
    material_texture: WebGLTexture;
    depth_texture: WebGLTexture;

    collected_transparency_tasks: DrawMeshesWithBufferedData[];

    clearTransparancyTaskList(): void {
        this.collected_transparency_tasks = [];
    }

    addToTransparancyTaskList(draw_mesh: DrawMeshesWithBufferedData) {
        this.collected_transparency_tasks.push(draw_mesh);
    }

    getTransparancyTaskList(): DrawMeshesWithBufferedData[] {
        return this.collected_transparency_tasks;
    }

    setupFrame() {

    }

    bindFramebufferAndShader(GL: WebGL2RenderingContext) {
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.geometry_framebuffer);
        MainController.ShaderController.useGeometryShader();
    }
    bindGeometryFramebuffer(GL: WebGL2RenderingContext) {
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.geometry_framebuffer);
    }

    constructor(GL: WebGL2RenderingContext, SIZE: number) {

        const INTERN_FORMAT: GLint = GL.RGBA32F;
        const FILTER = GL.NEAREST;

        ////////////////////////////////////////////
        // BASE GEOMETRY PASS
        ////////////////////////////////////////////
        this.geometry_framebuffer = GL.createFramebuffer();
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.geometry_framebuffer);

        this.depth_texture = this.createTexture(GL, GL.DEPTH_COMPONENT32F, FILTER, SIZE);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.TEXTURE_2D, this.depth_texture, 0);

        this.position_texture = this.createTexture(GL, INTERN_FORMAT, FILTER, SIZE);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.position_texture, 0);

        this.normal_texture = this.createTexture(GL, INTERN_FORMAT, FILTER, SIZE);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT1, GL.TEXTURE_2D, this.normal_texture, 0);

        this.albedo_texture = this.createTexture(GL, INTERN_FORMAT, FILTER, SIZE);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT2, GL.TEXTURE_2D, this.albedo_texture, 0);

        this.specular_texture = this.createTexture(GL, INTERN_FORMAT, FILTER, SIZE);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT3, GL.TEXTURE_2D, this.specular_texture, 0);

        this.material_texture = this.createTexture(GL, INTERN_FORMAT, FILTER, SIZE);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT4, GL.TEXTURE_2D, this.material_texture, 0);

        ////////////////////////////////////////////
        // TRANSPARENCY GEOMETRY PASS
        ////////////////////////////////////////////


        ////////////////////////////////////////////
        // TRANSPARENCY BLEND PASS
        ////////////////////////////////////////////


        ////////////////////////////////////////////
        // SETUP DRAW BUFFER
        // CHECK STATUS
        // & UNBIND THE SHIT
        ////////////////////////////////////////////
        GL.drawBuffers([
            GL.COLOR_ATTACHMENT0,
            GL.COLOR_ATTACHMENT1,
            GL.COLOR_ATTACHMENT2,
            GL.COLOR_ATTACHMENT3,
            GL.COLOR_ATTACHMENT4
        ]);

        //  MainController.Log.info("PassStorage", "finished: GeometryPassStorage");
        checkFramebuffer(GL, this.geometry_framebuffer);

        // reset used bindings
        GL.bindTexture(GL.TEXTURE_2D, null);
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);

    }

    private createTexture(GL: WebGL2RenderingContext, internal_format: GLint, filter: GLint, size: number) {
        const LEVEL = 1;
        const texture = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, texture);
        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, 0);
        GL.texStorage2D(
            GL.TEXTURE_2D,
            LEVEL,
            internal_format,
            size,
            size
        );
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, filter);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, filter);
        return texture;
    }

}