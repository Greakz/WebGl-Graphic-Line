import {DrawMesh} from "../Render/DrawMesh";
import LogInstance, {LogInterface} from "../Util/LogInstance";
import {MainController} from "./MainController";
import {Model} from "../Render/Model";
import {mat4} from '../Geometry/Matrix/mat';
import {flatMat4} from '../Geometry/Matrix/flatten';
import {Texture} from "../Render/Resource/Texture/Texture";
import {Image} from "../Render/Resource/Image/Image";
import {checkFramebuffer} from "../Util/FramebufferCheck";

export interface GraphicOptions {

}

export interface RenderControllerInterface {
    setGraphicOptions(options: GraphicOptions);

    getGraphicOptions(): GraphicOptions;

    shadowPass(): void;

    geometryPass(): void;

    frambufferDebugPass(): void;

    lightningPass(): void;

    postProcessPass(): void;

    addModel(model: Model): void;

    removeModel(model: Model): void;

    setMeshAndModelAttributePointer(GL: WebGL2RenderingContext): void;

    bindEmptyTexture(GL: WebGL2RenderingContext, binding_slot: GLenum): void;

    prepareRenderPasses(): void;

    initRenderPassRun(): void;
}

class RenderController implements RenderControllerInterface {
    private static readonly Log: LogInterface = LogInstance;
    private graphic_options: GraphicOptions = {};
    private model_mesh_matrix_buffer_prepared: boolean = false;
    private model_mesh_matrix_buffer: WebGLBuffer;

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

    private frame_info: {
        height: number;
        width: number;
    } = {
        height: 0,
        width: 0
    };

    public prepareRenderPasses() {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();

        /**
         * ALBEDO FRAMEBUFFER
         */
        this.albedo_framebuffer = GL.createFramebuffer();
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.albedo_framebuffer);

        this.albedo_texture = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, this.albedo_texture);
        GL.texImage2D(
            GL.TEXTURE_2D,
            0,
            GL.RGB,
            1920,
            1920,
            0,
            GL.RGB,
            GL.UNSIGNED_BYTE,
            null
        );
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.albedo_texture, 0);

        this.albedo_depth_rbuffer = GL.createRenderbuffer();
        GL.bindRenderbuffer(GL.RENDERBUFFER, this.albedo_depth_rbuffer);
        GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH24_STENCIL8, 1920, 1920);
        GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_STENCIL_ATTACHMENT, GL.RENDERBUFFER, this.albedo_depth_rbuffer);

        checkFramebuffer(GL, this.albedo_framebuffer);


        /**
         * SPECULAR FRAMEBUFFER
         */
        this.specular_framebuffer = GL.createFramebuffer();
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.specular_framebuffer);

        this.specular_texture = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, this.specular_texture);
        GL.texImage2D(
            GL.TEXTURE_2D,
            0,
            GL.RGB,
            1920,
            1920,
            0,
            GL.RGB,
            GL.UNSIGNED_BYTE,
            null
        );
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.specular_texture, 0);

        this.specular_depth_rbuffer = GL.createRenderbuffer();
        GL.bindRenderbuffer(GL.RENDERBUFFER, this.specular_depth_rbuffer);
        GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH24_STENCIL8, 1920, 1920);
        GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_STENCIL_ATTACHMENT, GL.RENDERBUFFER, this.specular_depth_rbuffer);

        checkFramebuffer(GL, this.specular_framebuffer);

        /**
         * NORMAL FRAMEBUFFER
         */
        this.normal_framebuffer = GL.createFramebuffer();
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.normal_framebuffer);

        this.normal_texture = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, this.normal_texture);
        GL.texImage2D(
            GL.TEXTURE_2D,
            0,
            GL.RGB,
            1920,
            1920,
            0,
            GL.RGB,
            GL.UNSIGNED_BYTE,
            null
        );
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.LINEAR);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.LINEAR);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.normal_texture, 0);

        this.normal_depth_rbuffer = GL.createRenderbuffer();
        GL.bindRenderbuffer(GL.RENDERBUFFER, this.normal_depth_rbuffer);
        GL.renderbufferStorage(GL.RENDERBUFFER, GL.DEPTH24_STENCIL8, 1920, 1920);
        GL.framebufferRenderbuffer(GL.FRAMEBUFFER, GL.DEPTH_STENCIL_ATTACHMENT, GL.RENDERBUFFER, this.normal_depth_rbuffer);

        checkFramebuffer(GL, this.normal_framebuffer);

        // reset used bindings
        GL.bindRenderbuffer(GL.RENDERBUFFER, null);
        GL.bindTexture(GL.TEXTURE_2D, null);


        GL.bindFramebuffer(GL.FRAMEBUFFER,null);
    }

    public initRenderPassRun() {
        this.frame_info =  {
            height: MainController.CanvasController.getHeight(),
            width: MainController.CanvasController.getWidth()
        };
    }

    public frambufferDebugPass() {
        const GL = MainController.CanvasController.getGL();

        MainController.ShaderController.getFramebufferDebugShader().textureDebugPass(
            GL, [
                this.albedo_texture,
                this.specular_texture,
                this.normal_texture
            ]
        );
    }

    public shadowPass() {
    }

    // Generated By Geometry Pass!
    private albedo_framebuffer: WebGLFramebuffer;
    private albedo_depth_rbuffer: WebGLRenderbuffer;
    private albedo_texture: WebGLTexture;

    private specular_framebuffer: WebGLFramebuffer;
    private specular_depth_rbuffer: WebGLRenderbuffer;
    private specular_texture: WebGLTexture;

    private normal_framebuffer: WebGLFramebuffer;
    private normal_depth_rbuffer: WebGLRenderbuffer;
    private normal_texture: WebGLTexture;

    public geometryPass() {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();

        MainController.ShaderController.useGeometryShader();

        GL.bindFramebuffer(GL.FRAMEBUFFER, this.albedo_framebuffer);
        GL.clearColor(0.7, 0.5, 0.5, 1.0);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        GL.enable(GL.DEPTH_TEST);
        GL.depthFunc(GL.LESS);

        GL.bindFramebuffer(GL.FRAMEBUFFER, this.specular_framebuffer);
        GL.clearColor(0.5, 0.7, 0.5, 1.0);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        GL.enable(GL.DEPTH_TEST);
        GL.depthFunc(GL.LESS);

        GL.bindFramebuffer(GL.FRAMEBUFFER, this.normal_framebuffer);
        GL.clearColor(0.5, 0.5, 0.7, 1.0);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        GL.enable(GL.DEPTH_TEST);
        GL.depthFunc(GL.LESS);

        // Set Data for Camera
        MainController.SceneController.getSceneCamera().bindCamera(GL);

        this.render_queue.forEach(
            (render_queue_mesh_entry: RenderQueueMeshEntry) => {
                // there has to be an entry so select from the first
                const mesh_to_use = render_queue_mesh_entry.render_queue_material_entries[0].draw_meshes[0].related_mesh;
                // activate mesh
                mesh_to_use.use(GL);

                render_queue_mesh_entry.render_queue_material_entries.forEach(
                    (render_queue_entry: RenderQueueMaterialEntry) => {

                        // first, bind mesh transformation matrix
                        this.geometryPassPrepareUniformMeshData(render_queue_entry.draw_meshes);

                        // second activate material
                        const material_to_use = render_queue_entry.draw_meshes[0].related_material;
                        material_to_use.use(GL, MainController.ShaderController.getGeometryShader());


                        // Buffer Albedo Task Number
                        this.bufferSubDataTask(GL, 1);
                        GL.bindFramebuffer(GL.FRAMEBUFFER, this.albedo_framebuffer);
                        this.geometryPassDrawMeshTasks(render_queue_entry.draw_meshes);


                        // Buffer Albedo Task Number
                        this.bufferSubDataTask(GL, 2);
                        GL.bindFramebuffer(GL.FRAMEBUFFER, this.specular_framebuffer);
                        this.geometryPassDrawMeshTasks(render_queue_entry.draw_meshes);


                        // Buffer Albedo Task Number
                        this.bufferSubDataTask(GL, 3);
                        GL.bindFramebuffer(GL.FRAMEBUFFER, this.normal_framebuffer);
                        this.geometryPassDrawMeshTasks(render_queue_entry.draw_meshes);

                    }
                );
            }
        );

        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
    }

    private bufferSubDataTask(GL: WebGL2RenderingContext, task: number) {
        GL.bufferSubData(GL.UNIFORM_BUFFER, 11 * 4, new Float32Array([task]));
    }

    private geometryPassPrepareUniformMeshData(taskList: DrawMesh[]) {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();

        if (!this.model_mesh_matrix_buffer_prepared) {
            this.createMeshModelBuffer();
            this.setMeshAndModelAttributePointer(GL);
        }

        // Collect Data to buffer
        let bufferData: number[] = taskList.reduce(
            (acc: number[], task: DrawMesh, index: number, list: DrawMesh[]) => {
                // Prepare Current rendering
                let mesh_matrix: mat4 = task.related_mesh.transformation.getMatrix();
                let model_matrix: mat4 = task.related_model.transformation.getMatrix();
                return acc.concat(flatMat4(model_matrix).concat(flatMat4(mesh_matrix)));
            },
            []
        );

        // Buffer Data
        GL.bindBuffer(GL.ARRAY_BUFFER, this.model_mesh_matrix_buffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(bufferData), GL.DYNAMIC_DRAW);
    }

    private geometryPassDrawMeshTasks(taskList: DrawMesh[]) {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        GL.drawArraysInstanced(GL.TRIANGLES, 0, taskList[0].related_mesh.draw_count, taskList.length);
    }

    public lightningPass() {

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

    private createMeshModelBuffer() {
        // do render task
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        this.model_mesh_matrix_buffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.model_mesh_matrix_buffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(32), GL.DYNAMIC_DRAW);
        GL.bindBuffer(GL.ARRAY_BUFFER, null);
    }

    public setMeshAndModelAttributePointer(GL: WebGL2RenderingContext) {
        if (!this.model_mesh_matrix_buffer_prepared) {
            this.createMeshModelBuffer();
        }
        GL.bindBuffer(GL.ARRAY_BUFFER, this.model_mesh_matrix_buffer);
        // Prepare Geometry Bindings
        const model_matrix_location: number = MainController.ShaderController.getGeometryShader().attribute_pointer.model_matrix;
        const mesh_matrix_location: number = MainController.ShaderController.getGeometryShader().attribute_pointer.mesh_matrix;

        // Define Attribute Matrix Pointer
        GL.enableVertexAttribArray(model_matrix_location);
        GL.vertexAttribPointer(model_matrix_location, 4, GL.FLOAT, false, 32 * 4, 0);
        GL.vertexAttribDivisor(model_matrix_location, 1);

        GL.enableVertexAttribArray(model_matrix_location + 1);
        GL.vertexAttribPointer(model_matrix_location + 1, 4, GL.FLOAT, false, 32 * 4, 4 * 4);
        GL.vertexAttribDivisor(model_matrix_location + 1, 1);

        GL.enableVertexAttribArray(model_matrix_location + 2);
        GL.vertexAttribPointer(model_matrix_location + 2, 4, GL.FLOAT, false, 32 * 4, 8 * 4);
        GL.vertexAttribDivisor(model_matrix_location + 2, 1);

        GL.enableVertexAttribArray(model_matrix_location + 3);
        GL.vertexAttribPointer(model_matrix_location + 3, 4, GL.FLOAT, false, 32 * 4, 12 * 4);
        GL.vertexAttribDivisor(model_matrix_location + 3, 1);

        GL.enableVertexAttribArray(mesh_matrix_location);
        GL.vertexAttribPointer(mesh_matrix_location, 4, GL.FLOAT, false, 32 * 4, 16 * 4);
        GL.vertexAttribDivisor(mesh_matrix_location, 1);

        GL.enableVertexAttribArray(mesh_matrix_location + 1);
        GL.vertexAttribPointer(mesh_matrix_location + 1, 4, GL.FLOAT, false, 32 * 4, 20 * 4);
        GL.vertexAttribDivisor(mesh_matrix_location + 1, 1);

        GL.enableVertexAttribArray(mesh_matrix_location + 2);
        GL.vertexAttribPointer(mesh_matrix_location + 2, 4, GL.FLOAT, false, 32 * 4, 24 * 4);
        GL.vertexAttribDivisor(mesh_matrix_location + 2, 1);

        GL.enableVertexAttribArray(mesh_matrix_location + 3);
        GL.vertexAttribPointer(mesh_matrix_location + 3, 4, GL.FLOAT, false, 32 * 4, 28 * 4);
        GL.vertexAttribDivisor(mesh_matrix_location + 3, 1);

        GL.bindBuffer(GL.ARRAY_BUFFER, null);
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

interface RenderQueueMeshEntry {
    mesh_id: string;
    render_queue_material_entries: RenderQueueMaterialEntry[];
}

interface RenderQueueMaterialEntry {
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
                128,  64,
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