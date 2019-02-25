import { DrawMesh } from "../Render/DrawMesh";
import LogInstance, { LogInterface } from "../Util/LogInstance";
import { MainController } from "./MainController";
import { Model } from "../Render/Model";

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

        // Set Data for Camera
        MainController.SceneController.getSceneCamera().bindCamera(
            GL,
            MainController.ShaderController.getGeometryShader().uniform_locations.projection_matrix,
            MainController.ShaderController.getGeometryShader().uniform_locations.view_matrix,
        );

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

                        console.log('render now: ' + mesh_to_use.resource_id + '.' + material_to_use.resource_id + ' x' + render_queue_entry.draw_meshes.length);
                        this.geometryPassDrawMeshTasks(render_queue_entry.draw_meshes);

                    }
                );
            }
        );
    }

    private geometryPassDrawMeshTasks(taskList: DrawMesh[]) {
        this.checkAndPrepareMeshMatrixBuffer();

        // Collect Data to buffer
        let bufferData: number[] = taskList.reduce(
            (acc: number[], task: DrawMesh, index: number, list: DrawMesh[]) => {
                // Prepare Current rendering
                return []
            },
            []
        );


        // Buffer Data
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.model_mesh_matrix_buffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array([]), GL.DYNAMIC_DRAW);

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

    private checkAndPrepareMeshMatrixBuffer() {
        if (!this.model_mesh_matrix_buffer_prepared) {
            // do render task

            const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
            this.model_mesh_matrix_buffer = GL.createBuffer();
            GL.bindBuffer(GL.ARRAY_BUFFER, this.model_mesh_matrix_buffer);
            // Prepare Geometry Bindings
            GL.enableVertexAttribArray(MainController.ShaderController.getGeometryShader().attribute_pointer.model_matrix);
            GL.vertexAttribPointer(
                MainController.ShaderController.getGeometryShader().attribute_pointer.model_matrix,
                16,
                GL.FLOAT,
                false,
                32 * 4,
                0
            );
            GL.vertexAttribDivisor( // tell web gl to update the model_matrix every new instance
                MainController.ShaderController.getGeometryShader().attribute_pointer.model_matrix, 1);

            GL.enableVertexAttribArray(MainController.ShaderController.getGeometryShader().attribute_pointer.mesh_matrix);
            GL.vertexAttribPointer(
                MainController.ShaderController.getGeometryShader().attribute_pointer.mesh_matrix,
                16,
                GL.FLOAT,
                false,
                32 * 4,
                16 * 4
            );
            GL.vertexAttribDivisor( // tell web gl to update the model_matrix every new instance
                MainController.ShaderController.getGeometryShader().attribute_pointer.mesh_matrix, 1);

            GL.bindBuffer(GL.ARRAY_BUFFER, null);
            this.model_mesh_matrix_buffer_prepared = true;
        }
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
