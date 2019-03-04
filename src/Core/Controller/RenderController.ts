import {DrawMesh} from "../Render/DrawMesh";
import LogInstance, {LogInterface} from "../Util/LogInstance";
import {MainController} from "./MainController";
import {Model} from "../Render/Model";
import {mat4} from '../Geometry/Matrix/mat';
import {flatMat4} from '../Geometry/Matrix/flatten';
import {Texture} from "../Render/Resource/Texture/Texture";
import {Image} from "../Render/Resource/Image/Image";
import {checkFramebuffer} from "../Util/FramebufferCheck";
import {DeferredLightningShader} from "../Render/Shader/DeferredLightningShader";
import {GeometryPass} from "./RenderPass/GeometryPass";
import {LightningPass} from "./RenderPass/LightningPass";

export interface GraphicOptions {

}

export interface RenderControllerInterface {
    setGraphicOptions(options: GraphicOptions);

    getGraphicOptions(): GraphicOptions;

    shadowPass(): void;

    geometryPass(): void;

    framebufferDebugPass(): void;

    lightningPass(): void;

    postProcessPass(): void;

    addModel(model: Model): void;

    removeModel(model: Model): void;

    bindEmptyTexture(GL: WebGL2RenderingContext, binding_slot: GLenum): void;

    prepareRenderPasses(): void;

    initRenderPassRun(): void;
}

class RenderController implements RenderControllerInterface {
    private static readonly Log: LogInterface = LogInstance;

    private graphic_options: GraphicOptions = {};

    constructor() {
    }

    /**
     * RenderQueue for the geometry Pass
     */
    private render_queue: RenderQueueMeshEntry[] = [];

    /**
     * RenderQueue for the Lightning Pass
     */
    private light_queue: { [key: string]: LightQueueEntry; } = {};

    private frame_info: FrameInfo = {
        height: 0,
        width: 0
    };

    public prepareRenderPasses() {
        GeometryPass.appSetup();
        LightningPass.appSetup();
    }

    public initRenderPassRun() {
        this.frame_info = {
            height: MainController.CanvasController.getHeight(),
            width: MainController.CanvasController.getWidth()
        };
        GeometryPass.frameSetup(this.frame_info);
        LightningPass.frameSetup(this.frame_info);
    }

    public framebufferDebugPass() {
        MainController.ShaderController.getFramebufferDebugShader().textureDebugPass(
            [
                GeometryPass.position_texture,
                GeometryPass.albedo_texture,
                GeometryPass.specular_texture,
                GeometryPass.normal_texture
            ]
        );
    }

    public shadowPass() {
    }

    public geometryPass() {
        GeometryPass.runPass(this.render_queue, this.frame_info);
    }

    public lightningPass() {
        LightningPass.runPass([], this.frame_info);
    }

    public postProcessPass() {

    }

    public setGraphicOptions(options: GraphicOptions) {
        this.graphic_options = options;
    }

    public getGraphicOptions(): GraphicOptions {
        return this.graphic_options;
    }

    public addModel(model: Model) {
        model.draw_meshes.forEach(
            (draw_mesh: DrawMesh) => {
                this.addMesh(draw_mesh);
            }
        );
    }

    private addMesh(draw_mesh: DrawMesh) {

        let meshAllReadyIn: boolean = false;

        this.render_queue = this.render_queue.map(
            (render_queue_entry: RenderQueueMeshEntry) => {
                let materialAllReadyIn: boolean = false;
                if (render_queue_entry.mesh_id === draw_mesh.related_mesh.resource_id) {
                    meshAllReadyIn = true;
                    const new_render_queue_entry = {
                        ...render_queue_entry,
                        render_queue_material_entries: render_queue_entry.render_queue_material_entries.map(
                            (render_queue_material_entry: RenderQueueMaterialEntry) => {
                                materialAllReadyIn = true;
                                if (render_queue_material_entry.material_id === draw_mesh.related_material.resource_id) {
                                    // if all ready type of mesh-material in, push another "draw mesh"...
                                    return {
                                        ...render_queue_material_entry,
                                        draw_meshes: [...render_queue_material_entry.draw_meshes, draw_mesh]
                                    };
                                }
                                return render_queue_material_entry;
                            }
                        )
                    };
                    // if mesh was all ready in, but material was'nt...
                    if (!materialAllReadyIn) {
                        return {
                            ...new_render_queue_entry,
                            render_queue_material_entries: [
                                ...new_render_queue_entry.render_queue_material_entries,
                                {
                                    material_id: draw_mesh.related_material.resource_id,
                                    draw_meshes: [draw_mesh]
                                }
                            ]
                        };
                    }
                    return new_render_queue_entry;
                }
                return render_queue_entry;
            }
        );

        // if mesh was'nt in yet
        if (!meshAllReadyIn) {
            this.render_queue.push({
                mesh_id: draw_mesh.related_mesh.resource_id,
                render_queue_material_entries: [{
                    material_id: draw_mesh.related_material.resource_id,
                    draw_meshes: [draw_mesh]
                }]
            });
        }
    }

    public removeModel(model: Model) {
        const delete_id = model.related_scene_object.scene_object_id;
        this.render_queue = this.render_queue.filter(
            (render_queue_entry: RenderQueueMeshEntry) => {
                const new_render_queue_material_entries = render_queue_entry.render_queue_material_entries.filter(
                    (render_queue_material_entry: RenderQueueMaterialEntry) => {
                        render_queue_material_entry.draw_meshes = render_queue_material_entry.draw_meshes.filter(
                            (exist_draw_mesh: DrawMesh) => {
                                return (exist_draw_mesh.related_model.related_scene_object.scene_object_id !== delete_id);
                            }
                        );
                        return render_queue_material_entry.draw_meshes.length > 0;
                    }
                );
                render_queue_entry.render_queue_material_entries = new_render_queue_material_entries;
                return new_render_queue_material_entries.length > 0;
            }
        );
    }

    private empty_texture: Texture | null = null;

    bindEmptyTexture(GL: WebGL2RenderingContext, binding_slot: GLenum) {
        if (this.empty_texture === null) {
            this.empty_texture = MainController.ResourceController.getTexture(new EmptyTexture());
        }
        GL.activeTexture(binding_slot);
        this.empty_texture.use(GL);
    }
}

export interface FrameInfo {
    height: number;
    width: number;
}

export interface RenderQueueMeshEntry {
    mesh_id: string;
    render_queue_material_entries: RenderQueueMaterialEntry[];
}

export interface RenderQueueMaterialEntry {
    material_id: string;
    draw_meshes: DrawMesh[];
}

/**
 * Represents a LightSource, but in the Lightning Pass all of them should be rendered at the same time
 */
export interface LightQueueEntry {

}

var RenderControllerInstance: RenderController = new RenderController();
export default RenderControllerInstance;

class EmptyTexture implements Texture {
    public readonly resource_type: 'texture';
    public readonly resource_id: string = 'def-t-';
    private texture_buffer: WebGLTexture;
    image: Image;
    readonly load = (GL: WebGL2RenderingContext) => {
        this.texture_buffer = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, this.texture_buffer);
        GL.pixelStorei(GL.UNPACK_ALIGNMENT, 1);
        GL.texImage2D(GL.TEXTURE_2D,
            0,
            GL.R8,
            2,
            2,
            0,
            GL.RED,
            GL.UNSIGNED_BYTE,
            new Uint8Array([
                128, 64,
                0, 192,
            ]));
        // base settings, make it editable with texture options
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    };
    readonly use = (GL: WebGL2RenderingContext) => {
        GL.bindTexture(GL.TEXTURE_2D, this.texture_buffer);
    };
}