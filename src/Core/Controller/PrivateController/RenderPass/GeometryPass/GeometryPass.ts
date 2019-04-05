import {MainController} from "../../../MainController";
import {checkFramebuffer} from "../../../../Util/FramebufferCheck";
import {FrameInfo, RenderQueueMaterialEntry, RenderQueueMeshEntry} from "../../RenderController";
import {DrawMesh, DrawMeshesWithBufferedData} from "../../../../Render/DrawMesh";
import {GeometryPassShadowExtension} from "./GeometryPassShadowExtension";
import {GeometryPassStorage} from "./GeometryPassStorage";
import {TransparencyPass} from "../TransparencyPass/TransparencyPass";
import {RenderOptions} from "../../../../Scene/RenderOptions";

export abstract class GeometryPass {

    static model_mesh_buffer_prepared: boolean = false;
    static model_mesh_matrix_buffer: WebGLBuffer;

    static solid_storage: GeometryPassStorage;

    static appSetup(): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        GeometryPass.solid_storage = new GeometryPassStorage(GL, 1920);
        GeometryPassShadowExtension.appSetup();
    }

    static frameSetup(frame_info: FrameInfo, oldRenderOptions: RenderOptions, newRenderOptions: RenderOptions): void {
        // const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();

        // clear the task list for this frame
        GeometryPass.solid_storage.clearTransparancyTaskList();

        GeometryPassShadowExtension.frameSetup(frame_info, oldRenderOptions, newRenderOptions);
    }

    static runPass(render_queue: RenderQueueMeshEntry[], frame_info: FrameInfo): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();

        GL.clearColor(0.0, 0.0, 0.0, 1.0);
        GL.viewport(0, 0, 1920, 1920);
        GL.enable(GL.DEPTH_TEST);
        GL.depthFunc(GL.LEQUAL);

        GeometryPass.solid_storage.bindFramebufferAndShader(GL);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        // used by both shaders!
        MainController.SceneController.getSceneCamera().bingForGeometryShader(GL);

        render_queue.forEach(
            (render_queue_mesh_entry: RenderQueueMeshEntry) => {
                // there has to be an entry so select from the first
                const mesh_to_use = render_queue_mesh_entry.render_queue_material_entries[0].draw_meshes[0].related_mesh;
                // activate mesh
                mesh_to_use.use(GL);

                render_queue_mesh_entry.render_queue_material_entries.forEach(
                    (render_queue_entry: RenderQueueMaterialEntry) => {

                        const material_to_use = render_queue_entry.draw_meshes[0].related_material;

                        if (material_to_use.opacity < 1) {
                            // transparency pass!
                            material_to_use.use(GL, MainController.ShaderController.getGeometryShader());
                            const transparancyWithDataTask = GeometryPass.geometryPassPrepareUniformMeshData(render_queue_entry.draw_meshes);

                            GeometryPass.solid_storage.addToTransparancyTaskList(transparancyWithDataTask);
                        } else {
                            // solid pass!
                            GeometryPass.solid_storage.bindFramebufferAndShader(GL);
                            GeometryPass.geometryPassPrepareUniformMeshData(render_queue_entry.draw_meshes);
                            material_to_use.use(GL, MainController.ShaderController.getGeometryShader());
                            GeometryPass.geometryPassDrawMeshTasks(render_queue_entry.draw_meshes);

                            // SHADOW PASS
                            GeometryPassShadowExtension.bindForDrawShadow();
                            GeometryPass.geometryPassDrawMeshTasks(render_queue_entry.draw_meshes);
                        }
                    }
                );
            }
        );
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
        GL.viewport(0, 0, frame_info.width, frame_info.height);
    }

    private static geometryPassPrepareUniformMeshData(taskList: DrawMesh[], preventBuffer: boolean = false): DrawMeshesWithBufferedData {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();

        if (!GeometryPass.model_mesh_buffer_prepared) {
            GeometryPass.setMeshAndModelAttributePointer(GL);
        }

        let bufferData: number[] = [];
        // Collect Data to buffer
        taskList.forEach(
            (task: DrawMesh, index: number, list: DrawMesh[]) => {
                // Prepare Current rendering
                for (let i = 0; i < 16; i++) {
                    bufferData.push(task.related_mesh.transformation.getMatrix()[i]);
                }
                for (let i = 0; i < 16; i++) {
                    bufferData.push(task.related_model.transformation.getMatrix()[i]);
                }
            }
        );

        const draw_meshes_with_buffer_data: DrawMeshesWithBufferedData = {
            draw_mesh: taskList,
            bufferData: new Float32Array(bufferData)
        };

        // Buffer Data
        if(!preventBuffer) {
            GL.bindBuffer(GL.ARRAY_BUFFER, GeometryPass.model_mesh_matrix_buffer);
            GL.bufferData(GL.ARRAY_BUFFER, draw_meshes_with_buffer_data.bufferData, GL.DYNAMIC_DRAW);
        }
        return draw_meshes_with_buffer_data;
    }

    private static geometryPassDrawMeshTasks(taskList: DrawMesh[]) {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        GL.drawArraysInstanced(GL.TRIANGLES, 0, taskList[0].related_mesh.draw_count, taskList.length);
    }

    private static createMeshModelBuffer() {
        // do render task
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        GeometryPass.model_mesh_matrix_buffer = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, GeometryPass.model_mesh_matrix_buffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(32), GL.DYNAMIC_DRAW);
        GL.bindBuffer(GL.ARRAY_BUFFER, null);
        GeometryPass.model_mesh_buffer_prepared = true;

    }

    static setMeshAndModelAttributePointer(GL: WebGL2RenderingContext) {

        if (!GeometryPass.model_mesh_buffer_prepared) {
            GeometryPass.createMeshModelBuffer();
        }

        // Prepare Geometry Bindings
        const geom_model_matrix_location: number = MainController.ShaderController.getGeometryShader().attribute_pointer.model_matrix;
        const geom_mesh_matrix_location: number = MainController.ShaderController.getGeometryShader().attribute_pointer.mesh_matrix;

        GL.bindBuffer(GL.ARRAY_BUFFER, GeometryPass.model_mesh_matrix_buffer);
        MainController.ShaderController.useGeometryShader();
        // Define Attribute Matrix Pointer
        GL.enableVertexAttribArray(geom_model_matrix_location);
        GL.vertexAttribPointer(geom_model_matrix_location, 4, GL.FLOAT, false, 32 * 4, 0);
        GL.vertexAttribDivisor(geom_model_matrix_location, 1);

        GL.enableVertexAttribArray(geom_model_matrix_location + 1);
        GL.vertexAttribPointer(geom_model_matrix_location + 1, 4, GL.FLOAT, false, 32 * 4, 4 * 4);
        GL.vertexAttribDivisor(geom_model_matrix_location + 1, 1);

        GL.enableVertexAttribArray(geom_model_matrix_location + 2);
        GL.vertexAttribPointer(geom_model_matrix_location + 2, 4, GL.FLOAT, false, 32 * 4, 8 * 4);
        GL.vertexAttribDivisor(geom_model_matrix_location + 2, 1);

        GL.enableVertexAttribArray(geom_model_matrix_location + 3);
        GL.vertexAttribPointer(geom_model_matrix_location + 3, 4, GL.FLOAT, false, 32 * 4, 12 * 4);
        GL.vertexAttribDivisor(geom_model_matrix_location + 3, 1);

        GL.enableVertexAttribArray(geom_mesh_matrix_location);
        GL.vertexAttribPointer(geom_mesh_matrix_location, 4, GL.FLOAT, false, 32 * 4, 16 * 4);
        GL.vertexAttribDivisor(geom_mesh_matrix_location, 1);

        GL.enableVertexAttribArray(geom_mesh_matrix_location + 1);
        GL.vertexAttribPointer(geom_mesh_matrix_location + 1, 4, GL.FLOAT, false, 32 * 4, 20 * 4);
        GL.vertexAttribDivisor(geom_mesh_matrix_location + 1, 1);

        GL.enableVertexAttribArray(geom_mesh_matrix_location + 2);
        GL.vertexAttribPointer(geom_mesh_matrix_location + 2, 4, GL.FLOAT, false, 32 * 4, 24 * 4);
        GL.vertexAttribDivisor(geom_mesh_matrix_location + 2, 1);

        GL.enableVertexAttribArray(geom_mesh_matrix_location + 3);
        GL.vertexAttribPointer(geom_mesh_matrix_location + 3, 4, GL.FLOAT, false, 32 * 4, 28 * 4);
        GL.vertexAttribDivisor(geom_mesh_matrix_location + 3, 1);

        // Prepare Geometry Bindings
        const shadow_model_matrix_location: number = MainController.ShaderController.getShadowShader().attribute_pointer.model_matrix;
        const shadow_mesh_matrix_location: number = MainController.ShaderController.getShadowShader().attribute_pointer.mesh_matrix;
        MainController.ShaderController.useShadowShader();

        // Define Attribute Matrix Pointer
        GL.enableVertexAttribArray(shadow_model_matrix_location);
        GL.vertexAttribPointer(shadow_model_matrix_location, 4, GL.FLOAT, false, 32 * 4, 0);
        GL.vertexAttribDivisor(shadow_model_matrix_location, 1);

        GL.enableVertexAttribArray(shadow_model_matrix_location + 1);
        GL.vertexAttribPointer(shadow_model_matrix_location + 1, 4, GL.FLOAT, false, 32 * 4, 4 * 4);
        GL.vertexAttribDivisor(shadow_model_matrix_location + 1, 1);

        GL.enableVertexAttribArray(shadow_model_matrix_location + 2);
        GL.vertexAttribPointer(shadow_model_matrix_location + 2, 4, GL.FLOAT, false, 32 * 4, 8 * 4);
        GL.vertexAttribDivisor(shadow_model_matrix_location + 2, 1);

        GL.enableVertexAttribArray(shadow_model_matrix_location + 3);
        GL.vertexAttribPointer(shadow_model_matrix_location + 3, 4, GL.FLOAT, false, 32 * 4, 12 * 4);
        GL.vertexAttribDivisor(shadow_model_matrix_location + 3, 1);

        GL.enableVertexAttribArray(shadow_mesh_matrix_location);
        GL.vertexAttribPointer(shadow_mesh_matrix_location, 4, GL.FLOAT, false, 32 * 4, 16 * 4);
        GL.vertexAttribDivisor(shadow_mesh_matrix_location, 1);

        GL.enableVertexAttribArray(shadow_mesh_matrix_location + 1);
        GL.vertexAttribPointer(shadow_mesh_matrix_location + 1, 4, GL.FLOAT, false, 32 * 4, 20 * 4);
        GL.vertexAttribDivisor(shadow_mesh_matrix_location + 1, 1);

        GL.enableVertexAttribArray(shadow_mesh_matrix_location + 2);
        GL.vertexAttribPointer(shadow_mesh_matrix_location + 2, 4, GL.FLOAT, false, 32 * 4, 24 * 4);
        GL.vertexAttribDivisor(shadow_mesh_matrix_location + 2, 1);

        GL.enableVertexAttribArray(shadow_mesh_matrix_location + 3);
        GL.vertexAttribPointer(shadow_mesh_matrix_location + 3, 4, GL.FLOAT, false, 32 * 4, 28 * 4);
        GL.vertexAttribDivisor(shadow_mesh_matrix_location + 3, 1);

        MainController.ShaderController.useTransparencyShader();

        const t_geom_model_matrix_location: number = MainController.ShaderController.getTransparencyShader().attribute_pointer.model_matrix;
        const t_geom_mesh_matrix_location: number = MainController.ShaderController.getTransparencyShader().attribute_pointer.mesh_matrix;


        // Define Attribute Matrix Pointer
        GL.enableVertexAttribArray(t_geom_model_matrix_location);
        GL.vertexAttribPointer(t_geom_model_matrix_location, 4, GL.FLOAT, false, 32 * 4, 0);
        GL.vertexAttribDivisor(t_geom_model_matrix_location, 1);

        GL.enableVertexAttribArray(t_geom_model_matrix_location + 1);
        GL.vertexAttribPointer(t_geom_model_matrix_location + 1, 4, GL.FLOAT, false, 32 * 4, 4 * 4);
        GL.vertexAttribDivisor(t_geom_model_matrix_location + 1, 1);

        GL.enableVertexAttribArray(t_geom_model_matrix_location + 2);
        GL.vertexAttribPointer(t_geom_model_matrix_location + 2, 4, GL.FLOAT, false, 32 * 4, 8 * 4);
        GL.vertexAttribDivisor(t_geom_model_matrix_location + 2, 1);

        GL.enableVertexAttribArray(t_geom_model_matrix_location + 3);
        GL.vertexAttribPointer(t_geom_model_matrix_location + 3, 4, GL.FLOAT, false, 32 * 4, 12 * 4);
        GL.vertexAttribDivisor(t_geom_model_matrix_location + 3, 1);

        GL.enableVertexAttribArray(t_geom_mesh_matrix_location);
        GL.vertexAttribPointer(t_geom_mesh_matrix_location, 4, GL.FLOAT, false, 32 * 4, 16 * 4);
        GL.vertexAttribDivisor(t_geom_mesh_matrix_location, 1);

        GL.enableVertexAttribArray(t_geom_mesh_matrix_location + 1);
        GL.vertexAttribPointer(t_geom_mesh_matrix_location + 1, 4, GL.FLOAT, false, 32 * 4, 20 * 4);
        GL.vertexAttribDivisor(t_geom_mesh_matrix_location + 1, 1);

        GL.enableVertexAttribArray(t_geom_mesh_matrix_location + 2);
        GL.vertexAttribPointer(t_geom_mesh_matrix_location + 2, 4, GL.FLOAT, false, 32 * 4, 24 * 4);
        GL.vertexAttribDivisor(t_geom_mesh_matrix_location + 2, 1);

        GL.enableVertexAttribArray(t_geom_mesh_matrix_location + 3);
        GL.vertexAttribPointer(t_geom_mesh_matrix_location + 3, 4, GL.FLOAT, false, 32 * 4, 28 * 4);
        GL.vertexAttribDivisor(t_geom_mesh_matrix_location + 3, 1);


        GL.bindBuffer(GL.ARRAY_BUFFER, null);
    }
}