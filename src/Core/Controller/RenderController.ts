import {DrawMesh} from "../Render/DrawMesh";
import LogInstance, {LogInterface} from "../Util/LogInstance";
import {MainController} from "./MainController";
import {Model} from "../Render/Model";
import {mat4} from '../Geometry/Matrix/mat';
import {flatMat4} from '../Geometry/Matrix/flatten';
import {Texture} from "../Render/Resource/Texture/Texture";
import {Image} from "../Render/Resource/Image/Image";

export interface GraphicOptions {

}

export interface RenderControllerInterface {
    setGraphicOptions(options: GraphicOptions);

    getGraphicOptions(): GraphicOptions;

    shadowPass(): void;

    geometryPass(): void;

    lightningPass(): void;

    postProcessPass(): void;

    addModel(model: Model): void;

    removeModel(model: Model): void;

    setMeshAndModelAttributePointer(GL: WebGL2RenderingContext): void;

    bindEmptyTexture(GL: WebGL2RenderingContext, binding_slot: GLenum): void;
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

    public shadowPass() {

    }

    public geometryPass() {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();

        // Set the active shader
        MainController.ShaderController.useGeometryShader();

        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        GL.clearColor(0.7, 0.7, 0.7, 1.0);
        GL.cullFace(GL.FRONT);
        GL.enable(GL.DEPTH_TEST);

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

                        // there has to be an entry so select from the first
                        const material_to_use = render_queue_entry.draw_meshes[0].related_material;

                        // activate material
                        material_to_use.use(GL, MainController.ShaderController.getGeometryShader());

                        this.geometryPassDrawMeshTasks(render_queue_entry.draw_meshes);
                    }
                );
            }
        );
    }

    private geometryPassDrawMeshTasks(taskList: DrawMesh[]) {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();

        if (!this.model_mesh_matrix_buffer_prepared) {
            this.createMeshModelBuffer();
            this.setMeshAndModelAttributePointer(GL)
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
        GL.bindBuffer(GL.ARRAY_BUFFER, null);

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