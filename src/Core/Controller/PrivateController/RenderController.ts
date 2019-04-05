import {DrawMesh} from "../../Render/DrawMesh";
import LogInstance, {LogInterface} from "../../Util/LogInstance";
import {MainController} from "../MainController";
import {Model} from "../../Render/Model";
import {Texture, Texture2DI, TextureCubeMapI} from "../../Render/Resource/Texture/Texture";
import {Image} from "../../Render/Resource/Image/Image";
import {GeometryPass} from "./RenderPass/GeometryPass/GeometryPass";
import {LightningPass} from "./RenderPass/LightningPass/LightningPass";
import {OutputPass} from "./RenderPass/OutputPass";
import {SkyboxPass} from "./RenderPass/SkyboxPass";
import {TransparencyPass} from "./RenderPass/TransparencyPass/TransparencyPass";
import {getRenderOptionsHigh, RenderOptions} from "../../Scene/RenderOptions";


export interface RenderControllerInterface {
    geometryPass(): void;

    framebufferDebugPass(): void;

    cubemapDebugPass(): void;

    lightningPass(): void;

    outputPass(): void;

    addModel(model: Model): void;

    removeModel(model: Model): void;

    bindEmptyTexture(GL: WebGL2RenderingContext, binding_slot?: GLenum): void;
    bindEmptyCubeMap(GL: WebGL2RenderingContext, binding_slot?: GLenum): void;

    prepareRenderPasses(): void;

    initRenderPassRun(): void;

    getFrameInfo(): FrameInfo;
}

class RenderController implements RenderControllerInterface {
    private static readonly Log: LogInterface = LogInstance;

    private render_options: RenderOptions = getRenderOptionsHigh();

    constructor() {
    }

    /**
     * RenderQueue for the geometry Pass
     */
    private render_queue: RenderQueueMeshEntry[] = [];

    private frame_info: FrameInfo = {
        height: 0,
        width: 0,
        tex_bottom: 0,
        tex_left: 0,
        tex_right: 0,
        tex_top: 0,
        shadows: true,
        bloom: true,
        reflections: true,
        transparency: true,
    };

    public getFrameInfo(): FrameInfo {
        return this.frame_info;
    }

    public prepareRenderPasses() {
        GeometryPass.appSetup();
        TransparencyPass.appSetup();
        SkyboxPass.appSetup();
        LightningPass.appSetup();
        OutputPass.appSetup();
    }

    public initRenderPassRun() {
        const aspect = MainController.CanvasController.getAspect();
        let top, bottom, left, right;
        if (aspect > 1) {
            const height = 1 / aspect;
            bottom = (1 - height) / 2;
            top = bottom + height;
            left = 0.0;
            right = 1.0;
        } else {
            left = (1 - aspect) / 2;
            right = left + aspect;
            top = 1.0;
            bottom = 0.0;
        }
        const sceneRenderOptions: RenderOptions = MainController.SceneController.getSceneRenderOptions()
        this.frame_info = {
            height: MainController.CanvasController.getHeight(),
            width: MainController.CanvasController.getWidth(),
            tex_bottom: bottom,
            tex_left: left,
            tex_right: right,
            tex_top: top,
            shadows: sceneRenderOptions.enable_shadow,
            bloom: sceneRenderOptions.enable_bloom,
            reflections: sceneRenderOptions.enable_reflections,
            transparency: sceneRenderOptions.enable_transparency,
        };
        GeometryPass.frameSetup(this.frame_info, this.render_options, sceneRenderOptions);
        TransparencyPass.frameSetup(this.frame_info, this.render_options, sceneRenderOptions);
        SkyboxPass.frameSetup(this.frame_info, this.render_options, sceneRenderOptions);
        LightningPass.frameSetup(this.frame_info, this.render_options, sceneRenderOptions);
        OutputPass.frameSetup(this.frame_info, this.render_options, sceneRenderOptions);
        this.render_options = sceneRenderOptions
    }

    public framebufferDebugPass() {
        MainController.ShaderController.getFramebufferDebugShader().textureDebugPass(
            [
                LightningPass.lightning_storage.light_blurred_result,
                TransparencyPass.transparent_storage.blend_texture,
                LightningPass.lightning_storage.light_calculation_result,
                LightningPass.lightning_storage.light_final_result,
            ]
        );
    }
    public cubemapDebugPass() {
        MainController.ShaderController.getCubeMapDebugShader().cubeMapDebugPass(
            MainController.SceneController.getSceneSkyboxAlt().cube_map.get()
        );
    }

    public geometryPass() {
        SkyboxPass.runGenerateCubemapSkyboxPass();
        GeometryPass.runPass(this.render_queue, this.frame_info);
        SkyboxPass.runGenerateOutputSkyboxPass();
        TransparencyPass.runPass();
    }

    public lightningPass() {
        LightningPass.runPass();
    }

    public outputPass() {
        OutputPass.runPass(this.frame_info);
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
                                if (render_queue_material_entry.material_id === draw_mesh.related_material.resource_id) {
                                    materialAllReadyIn = true;
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
    private empty_cm_texture: Texture | null = null;

    bindEmptyTexture(GL: WebGL2RenderingContext, binding_slot?: GLenum) {
        if (this.empty_texture === null) {
            this.empty_texture = MainController.ResourceController.getTexture(new EmptyTexture());
        }
        if(binding_slot !== undefined) {
            GL.activeTexture(binding_slot);
        }
        this.empty_texture.use(GL);
    }
    bindEmptyCubeMap(GL: WebGL2RenderingContext, binding_slot?: GLenum) {
        if (this.empty_cm_texture === null) {
            this.empty_cm_texture = MainController.ResourceController.getTexture(new EmptyCubeMap());
        }
        if(binding_slot !== undefined) {
            GL.activeTexture(binding_slot);
        }
        this.empty_cm_texture.use(GL);
    }
}

export interface FrameInfo {
    height: number;
    width: number;
    tex_left: number;
    tex_right: number;
    tex_top: number;
    tex_bottom: number;
    shadows: boolean;
    bloom: boolean;
    reflections: boolean;
    transparency: boolean;
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

class EmptyTexture implements Texture2DI {
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
            GL.RGB,
            2,
            2,
            0,
            GL.RGB,
            GL.UNSIGNED_BYTE,
            new Uint8Array([
                80, 80, 80,     50, 50, 50,
                50, 50, 50,     80, 80, 80,
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
    readonly get = () => this.texture_buffer;
}
class EmptyCubeMap implements TextureCubeMapI {
    public readonly resource_type: 'texture';
    public readonly resource_id: string = 'def-cm-t-';
    private texture_buffer: WebGLTexture;
    readonly load = (GL: WebGL2RenderingContext) => {
        const data = new Uint8Array([
            80, 80, 80,     50, 50, 50,
            50, 50, 50,     80, 80, 80,
        ]);
        this.texture_buffer = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_CUBE_MAP, this.texture_buffer);

        GL.pixelStorei(GL.UNPACK_ALIGNMENT, 1);

        GL.texImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_X, 0, GL.RGB, 2, 2, 0, GL.RGB, GL.UNSIGNED_BYTE, data);
        GL.texImage2D(GL.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, GL.RGB, 2, 2, 0, GL.RGB, GL.UNSIGNED_BYTE, data);

        GL.texImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, GL.RGB, 2, 2, 0, GL.RGB, GL.UNSIGNED_BYTE, data);
        GL.texImage2D(GL.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, GL.RGB, 2, 2, 0, GL.RGB, GL.UNSIGNED_BYTE, data);

        GL.texImage2D(GL.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, GL.RGB, 2, 2, 0, GL.RGB, GL.UNSIGNED_BYTE, data);
        GL.texImage2D(GL.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, GL.RGB, 2, 2, 0, GL.RGB, GL.UNSIGNED_BYTE, data);

        // base settings, make it editable with texture options
        GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_WRAP_R, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
        GL.texParameteri(GL.TEXTURE_CUBE_MAP, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
    };
    readonly use = (GL: WebGL2RenderingContext) => {
        GL.bindTexture(GL.TEXTURE_CUBE_MAP, this.texture_buffer);
    };
    readonly get = () => this.texture_buffer;
    readonly image_back: Image;
    readonly image_bottom: Image;
    readonly image_front: Image;
    readonly image_left: Image;
    readonly image_right: Image;
    readonly image_top: Image;
}