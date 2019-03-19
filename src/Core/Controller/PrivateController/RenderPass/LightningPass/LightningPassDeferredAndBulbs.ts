import {MainController} from "../../../MainController";
import {checkFramebuffer} from "../../../../Util/FramebufferCheck";
import {FrameInfo, RenderQueueMaterialEntry, RenderQueueMeshEntry} from "../../RenderController";
import {DrawMesh} from "../../../../Render/DrawMesh";
import {DayLight} from "../../../../Render/Resource/Light/DayLight";
import {flatMat4} from "../../../../Geometry/Matrix/flatten";
import {getOrthographicMatrix} from "../../../../Geometry/Matrix/orthographic";
import {lookAtMatrix} from "../../../../Geometry/Matrix/lookAt";
import {Camera} from "../../../../Render/Camera/Camera";
import {addVec3} from "../../../../Geometry/Vector/add";
import {scaleVec3} from "../../../../Geometry/Vector/scale";
import {GeometryPass} from "../GeometryPass/GeometryPass";
import {GeometryPassShadowExtension} from "../GeometryPass/GeometryPassShadowExtension";
import {SkyboxPass} from "../SkyboxPass";
import {
    LightningPass,
    MAXIMUM_LIGHTS_PER_BLOCK,
    MAXIMUM_OMNI_LIGHT_BLOCKS,
    MAXIMUM_SPOT_LIGHT_BLOCKS
} from "./LightningPass";
import {SceneLightInfo} from "../../../SceneController";
import {TransparencyPass} from "../TransparencyPass/TransparencyPass";

export abstract class LightningPassDeferredAndBulbs {

    private static rawDaylightSetData: number[];
    private static rawOmniData: number[];
    private static rawSpotData: number[];
    private static light_bulb_data: number[];
    private static draw_light_bulbs: number;

    static light_buffer: WebGLBuffer;
    
    static appSetup(): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();

        const allocateLightUniformSize =
            4           // Flag = 1 * vec4
            +   4 * 5 * 2       // 2x DayLight = 5 * vec4 * 2
            +   MAXIMUM_LIGHTS_PER_BLOCK * MAXIMUM_OMNI_LIGHT_BLOCKS * 6 * 4 // OmniLight = 6 * vec4
            +   MAXIMUM_LIGHTS_PER_BLOCK * MAXIMUM_OMNI_LIGHT_BLOCKS * 8 * 4; // SpotLight = 8 * vec4
        LightningPassDeferredAndBulbs.light_buffer = GL.createBuffer();
        GL.bindBuffer(GL.UNIFORM_BUFFER, LightningPassDeferredAndBulbs.light_buffer);
        GL.bufferData(GL.UNIFORM_BUFFER, new Float32Array(allocateLightUniformSize), GL.DYNAMIC_DRAW);
        GL.bindBuffer(GL.UNIFORM_BUFFER, null);
    }

    static frameSetup(frame_info: FrameInfo): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        LightningPassDeferredAndBulbs.generateLightningData();

    }

    static runPass() {
        LightningPassDeferredAndBulbs.bindSceneLightUniformBuffer();
        LightningPassDeferredAndBulbs.deferredShadingPass();
        LightningPassDeferredAndBulbs.lightBulbPass();
        LightningPassDeferredAndBulbs.combineBulbAndCalcResult();
    }

    /**
     *
     */
    private static deferredShadingPass() {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();

        LightningPass.lightning_storage.bindLightCalculationFramebufferAndShader(GL);
        GL.clearColor(0.0, 0.0, 0.0, 1.0);
        GL.viewport(0, 0, 1920, 1920);
        GL.clear(GL.COLOR_BUFFER_BIT);

        // Use The PlaneVao
        // Bind Undo Matrices
        MainController.SceneController.getSceneCamera().bindForDeferredLightningShader(GL);

        GL.bindVertexArray(LightningPass.pre_clip_screen_plane_vao.plane_vao);

        // Bind Geometry Pass Textures
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, GeometryPass.solid_storage.albedo_texture);

        GL.activeTexture(GL.TEXTURE1);
        GL.bindTexture(GL.TEXTURE_2D, GeometryPass.solid_storage.specular_texture);

        GL.activeTexture(GL.TEXTURE2);
        GL.bindTexture(GL.TEXTURE_2D, GeometryPass.solid_storage.position_texture);

        GL.activeTexture(GL.TEXTURE3);
        GL.bindTexture(GL.TEXTURE_2D, GeometryPass.solid_storage.normal_texture);

        GL.activeTexture(GL.TEXTURE4);
        GL.bindTexture(GL.TEXTURE_2D, GeometryPass.solid_storage.material_texture);

        GL.activeTexture(GL.TEXTURE5);
        GL.bindTexture(GL.TEXTURE_2D, GeometryPassShadowExtension.shadow_texture);

        GL.activeTexture(GL.TEXTURE6);
        GL.bindTexture(GL.TEXTURE_CUBE_MAP, SkyboxPass.cubemap_gen_result);

        GL.activeTexture(GL.TEXTURE7);
        GL.bindTexture(GL.TEXTURE_2D, TransparencyPass.transparent_storage.blend_transparency_texture);

        GL.activeTexture(GL.TEXTURE8);
        GL.bindTexture(GL.TEXTURE_2D, TransparencyPass.transparent_storage.blend_texture);


        // create and buffer light data!
        LightningPassDeferredAndBulbs.bufferDayLightAndSettingsData();
        LightningPassDeferredAndBulbs.bufferOmniLightData();
        LightningPassDeferredAndBulbs.bufferSpotLightData();

        // Bind Other Light
        GL.drawArrays(GL.TRIANGLES, 0, 6);
    }

    private static bufferDayLightAndSettingsData() {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        GL.bufferSubData(GL.UNIFORM_BUFFER, 0, new Float32Array(this.rawDaylightSetData));
    }

    private static bufferOmniLightData() {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        const floatOffsets = 4    // Flag = 1 * vec4
            +   4 * 5 * 2;       // DayLight = 5 * vec4
        GL.bufferSubData(GL.UNIFORM_BUFFER, floatOffsets * 4, new Float32Array(this.rawOmniData));
    }

    private static bufferSpotLightData() {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        const floatOffsets = 4    // Flag = 1 * vec4
            +   4 * 5 * 2       // DayLight = 5 * vec4
            +   MAXIMUM_LIGHTS_PER_BLOCK * MAXIMUM_OMNI_LIGHT_BLOCKS * 6 * 4; // Omni = 6 * vec4
        GL.bufferSubData(GL.UNIFORM_BUFFER, floatOffsets * 4, new Float32Array(this.rawSpotData));
    }


    /**
     *
     */
    private static lightBulbPass() {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        if(LightningPassDeferredAndBulbs.draw_light_bulbs > 0) {
            LightningPassDeferredAndBulbs.bufferLightBulbsData(GL);
        }

        LightningPass.lightning_storage.bindLightBulbFramebufferAndShader(GL);
        LightningPass.lightning_storage.setViewPort(GL);

        GL.clearColor(0.0, 0.0, 0.0, 1.0);
        GL.clear(GL.COLOR_BUFFER_BIT);

        if(LightningPassDeferredAndBulbs.draw_light_bulbs > 0) {
            GL.bindVertexArray(LightningPass.light_bulb_mesh_vao.light_bulb_vao);
            MainController.SceneController.getSceneCamera().bindForLightBulbShader(GL);
            GL.drawArraysInstanced(GL.TRIANGLES, 0, 24, LightningPassDeferredAndBulbs.draw_light_bulbs);
        }
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
    }
    private static bufferLightBulbsData(GL: WebGL2RenderingContext) {
        GL.bindBuffer(GL.ARRAY_BUFFER, LightningPass.light_bulb_mesh_vao.light_bulb_u_buffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(LightningPassDeferredAndBulbs.light_bulb_data), GL.DYNAMIC_DRAW);
        GL.bindBuffer(GL.ARRAY_BUFFER, null);
    }


    /**
     *
     */
    private static combineBulbAndCalcResult() {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        LightningPass.lightning_storage.bindLightCombineFramebufferAndShader(GL);
        GL.bindVertexArray(LightningPass.pre_clip_screen_plane_vao.plane_vao);

        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, LightningPass.lightning_storage.light_calculation_result);

        GL.activeTexture(GL.TEXTURE1);
        GL.bindTexture(GL.TEXTURE_2D, LightningPass.lightning_storage.light_bulb_result);

        GL.drawArrays(GL.TRIANGLES, 0, 6);
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
    }

    /**
     *
     */
    private static bindSceneLightUniformBuffer() {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        GL.bindBuffer(GL.UNIFORM_BUFFER, LightningPassDeferredAndBulbs.light_buffer);
        GL.bindBufferBase(GL.UNIFORM_BUFFER, MainController.ShaderController.getDeferredLightningShader().block_bindings.light, LightningPassDeferredAndBulbs.light_buffer);
    }

    private static generateLightningData() {
        const scene_light_info: SceneLightInfo = MainController.SceneController.getSceneLightInfo();

        this.light_bulb_data = [];
        LightningPassDeferredAndBulbs.draw_light_bulbs = 0;

        LightningPassDeferredAndBulbs.rawOmniData = [];
        let overflow: number = 0;
        let needOmniUniformBlocks: number = 0;
        for(let i = 0; i < scene_light_info.omni_lights.length; i++) {
            needOmniUniformBlocks = Math.floor(i / MAXIMUM_LIGHTS_PER_BLOCK) + 1;
            if(needOmniUniformBlocks <= MAXIMUM_OMNI_LIGHT_BLOCKS) {
                const l = scene_light_info.omni_lights[i];
                LightningPassDeferredAndBulbs.rawOmniData.push(
                    l.position.x, l.position.y, l.position.z, 0.0,
                    l.constant, l.linear, l.quadric, 0.0,
                    l.color.x, l.color.y, l.color.z, 0.0,
                    l.amb_factor.x, l.amb_factor.y, l.amb_factor.z, 0.0,
                    l.diff_factor.x, l.diff_factor.y, l.diff_factor.z, 0.0,
                    l.spec_factor.x, l.spec_factor.y, l.spec_factor.z, 0.0
                );
                LightningPassDeferredAndBulbs.light_bulb_data.push(
                    l.color.x, l.color.y, l.color.z, l.bulbOpacity(),
                    l.position.x, l.position.y, l.position.z
                );
                LightningPassDeferredAndBulbs.draw_light_bulbs++;
            } else {
                overflow++;
            }
        }
        if(overflow > 0) {
            console.warn("REACHED OMNI LIGHT LIMIT OF " + (MAXIMUM_OMNI_LIGHT_BLOCKS * MAXIMUM_LIGHTS_PER_BLOCK) + ". Light Requests OVERFLOW: " + overflow);
            // overflow = 0;
        }
        LightningPassDeferredAndBulbs.rawSpotData = [];
        overflow = 0;
        let needSpotUniformBlocks = 0;
        for(let i = 0; i < scene_light_info.spot_lights.length; i++) {
            needSpotUniformBlocks = Math.floor(i / MAXIMUM_LIGHTS_PER_BLOCK) + 1;
            if(needSpotUniformBlocks <= MAXIMUM_SPOT_LIGHT_BLOCKS) {
                const l = scene_light_info.spot_lights[i];
                LightningPassDeferredAndBulbs.rawSpotData.push(
                    l.position.x, l.position.y, l.position.z, 0.0,
                    l.direction.x, l.direction.y, l.direction.z, 0.0,
                    l.inner_cutoff, l.outer_cutoff, 0.0, 0.0,
                    l.constant, l.linear, l.quadric, 0.0,
                    l.color.x, l.color.y, l.color.z, 0.0,
                    l.amb_factor.x, l.amb_factor.y, l.amb_factor.z, 0.0,
                    l.diff_factor.x, l.diff_factor.y, l.diff_factor.z, 0.0,
                    l.spec_factor.x, l.spec_factor.y, l.spec_factor.z, 0.0,
                );
                LightningPassDeferredAndBulbs.light_bulb_data.push(
                    l.color.x, l.color.y, l.color.z, l.bulbOpacity(),
                    l.position.x, l.position.y, l.position.z
                );
                LightningPassDeferredAndBulbs.draw_light_bulbs++;
            } else {
                overflow++;
            }
        }
        if(overflow > 0) {
            console.warn("REACHED SPOT LIGHT LIMIT OF " + (MAXIMUM_OMNI_LIGHT_BLOCKS * MAXIMUM_LIGHTS_PER_BLOCK) + ". Light Requests: " + overflow);
        }
        const dl: DayLight = MainController.SceneController.getSceneDayLight();
        const dl2: DayLight | null = MainController.SceneController.getSceneDayLightAlt();
        this.rawDaylightSetData = [
            needOmniUniformBlocks,
            (this.rawOmniData.length / (6 * 4)) % (MAXIMUM_LIGHTS_PER_BLOCK),
            needSpotUniformBlocks,
            (this.rawSpotData.length / (8 * 4)) % (MAXIMUM_LIGHTS_PER_BLOCK),
            // daylight 1
            dl.direction.x, dl.direction.y, dl.direction.z, 0.0,
            dl.color.x, dl.color.y, dl.color.z, 0.0,
            dl.amb_factor.x, dl.amb_factor.y, dl.amb_factor.z, 0.0,
            dl.diffuse_factor.x, dl.diffuse_factor.y, dl.diffuse_factor.z, 0.0,
            dl.specular_factor.x, dl.specular_factor.y, dl.specular_factor.z, 0.0,
        ];
        if(dl2 === null){
            this.rawDaylightSetData.push(
                0.0, 0.0, 0.0, 0.0,
                0.0, 0.0, 0.0, 0.0,
                0.0, 0.0, 0.0, 0.0,
                0.0, 0.0, 0.0, 0.0,
                0.0, 0.0, 0.0, 0.0
            )
        } else {
            // Daylight 2
            this.rawDaylightSetData.push(
                dl2.direction.x, dl2.direction.y, dl2.direction.z, MainController.SceneController.getSceneAltBalance(),
                dl2.color.x, dl2.color.y, dl2.color.z, 0.0,
                dl2.amb_factor.x, dl2.amb_factor.y, dl2.amb_factor.z, 0.0,
                dl2.diffuse_factor.x, dl2.diffuse_factor.y, dl2.diffuse_factor.z, 0.0,
                dl2.specular_factor.x, dl2.specular_factor.y, dl2.specular_factor.z, 0.0
            )
        }
    }




}