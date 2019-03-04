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
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();

        GeometryPass.appSetup();

        /**
         * PREPARE LIGHTNING PASS
         */

        /**
         * Prepare planebuffer + vertex buffer;
         */

        this.plane_texture_buffer = GL.createBuffer();
        this.plane_vertex_buffer = GL.createBuffer();
        this.plane_vao = GL.createVertexArray();
        const deferred_lightning_shader: DeferredLightningShader = MainController.ShaderController.getDeferredLightningShader();
        MainController.ShaderController.useDeferredLightningShader();

        GL.bindVertexArray(this.plane_vao);
        GL.bindBuffer(GL.ARRAY_BUFFER, this.plane_vertex_buffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array([
            -1.0, 1.0, 0.0,
            -1.0, -1.0, 0.0,
            1.0, 1.0, 0.0,
            -1.0, -1.0, 0.0,
            1.0, -1.0, 0.0,
            1.0, 1.0, 0.0,
        ]), GL.STATIC_DRAW);
        GL.enableVertexAttribArray(deferred_lightning_shader.attribute_pointer.vertex_position);
        GL.vertexAttribPointer(deferred_lightning_shader.attribute_pointer.vertex_position, 3, GL.FLOAT, false, 0, 0);

        GL.bindBuffer(GL.ARRAY_BUFFER, this.plane_texture_buffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(12), GL.DYNAMIC_DRAW);
        GL.enableVertexAttribArray(deferred_lightning_shader.attribute_pointer.texture_position);
        GL.vertexAttribPointer(deferred_lightning_shader.attribute_pointer.texture_position, 2, GL.FLOAT, false, 0, 0);

        GL.bindBuffer(GL.ARRAY_BUFFER, null);
        GL.bindVertexArray(null);

    }

    public initRenderPassRun() {
        this.frame_info = {
            height: MainController.CanvasController.getHeight(),
            width: MainController.CanvasController.getWidth()
        };
        const aspect = this.frame_info.width / this.frame_info.height;
        let top, bottom, left, right;
        if(aspect > 1) {
            const height = 1 / aspect;
            bottom = (1 - height) / 2;
            top = bottom + height;
            left = 0.0;
            right = 1.0;
        }else {
            left = (1 - aspect) / 2;
            right = left + aspect;
            top = 1.0;
            bottom = 0.0;
        }
        const GL = MainController.CanvasController.getGL();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.plane_texture_buffer);
        const texData = [
            left, top,
            left, bottom,
            right, top,
            left, bottom,
            right, bottom,
            right, top,
        ];
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(texData), GL.DYNAMIC_DRAW);
        GL.bindBuffer(GL.ARRAY_BUFFER, null);

    }

    public framebufferDebugPass() {
        const GL = MainController.CanvasController.getGL();

        MainController.ShaderController.getFramebufferDebugShader().textureDebugPass(
            GL, [
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

    private plane_vertex_buffer: WebGLBuffer;
    private plane_texture_buffer: WebGLBuffer;
    private plane_vao: WebGLVertexArrayObject;

    public lightningPass() {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        MainController.ShaderController.useDeferredLightningShader();

        GL.viewport(0, 0, this.frame_info.width, this.frame_info.height);
        GL.disable(GL.DEPTH_TEST);
        GL.clearColor(0.3, 0.3, 0.3, 1.0);
        GL.clear(GL.COLOR_BUFFER_BIT);

        // Use The PlaneVao
        // Bind Undo Matrices
        MainController.SceneController.getSceneCamera().bindForLightningPass(GL);

        GL.bindVertexArray(this.plane_vao);
        // Bind Geometry Pass Textures
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, GeometryPass.albedo_texture);

        GL.activeTexture(GL.TEXTURE1);
        GL.bindTexture(GL.TEXTURE_2D, GeometryPass.specular_texture);

        GL.activeTexture(GL.TEXTURE2);
        GL.bindTexture(GL.TEXTURE_2D, GeometryPass.position_texture);

        GL.activeTexture(GL.TEXTURE3);
        GL.bindTexture(GL.TEXTURE_2D, GeometryPass.normal_texture);

        // Bind Daylight
        MainController.SceneController.getSceneDayLight().use(GL);

        // Bind Other Light
        GL.drawArrays(GL.TRIANGLES, 0, 6);
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
interface LightQueueEntry {

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