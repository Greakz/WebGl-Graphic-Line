import {MainController} from "../../MainController";
import {FrameInfo, LightQueueEntry} from "../RenderController";
import {DeferredLightningShader} from "../../../Render/Shader/DeferredLightningShader";
import {GeometryPass} from "./GeometryPass";
import {SceneLightInfo} from "../../SceneController";
import {DayLight} from "../../../Render/Resource/Light/DayLight";

export const MAXIMUM_LIGHT_BLOCKS: number = 4;
export const MAXIMUM_LIGHTS_PER_BLOCK: number = 64;

export abstract class LightningPass {

    static plane_vertex_buffer: WebGLBuffer;
    static plane_texture_buffer: WebGLBuffer;
    static plane_vao: WebGLVertexArrayObject;

    static light_buffer: WebGLBuffer;

    static appSetup(): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();

        // console.log('MAX_VERTEX_UNIFORM_BLOCKS', GL.getParameter(GL.MAX_VERTEX_UNIFORM_BLOCKS));
        // console.log('MAX_FRAGMENT_UNIFORM_BLOCKS', GL.getParameter(GL.MAX_FRAGMENT_UNIFORM_BLOCKS));
        // console.log('MAX_UNIFORM_BLOCK_SIZE', GL.getParameter(GL.MAX_UNIFORM_BLOCK_SIZE));

        /**
         * PREPARE RENDER PLANE
         */
        LightningPass.plane_texture_buffer = GL.createBuffer();
        LightningPass.plane_vertex_buffer = GL.createBuffer();
        LightningPass.plane_vao = GL.createVertexArray();
        const deferred_lightning_shader: DeferredLightningShader = MainController.ShaderController.getDeferredLightningShader();
        MainController.ShaderController.useDeferredLightningShader();

        GL.bindVertexArray(LightningPass.plane_vao);
        GL.bindBuffer(GL.ARRAY_BUFFER, LightningPass.plane_vertex_buffer);
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

        GL.bindBuffer(GL.ARRAY_BUFFER, LightningPass.plane_texture_buffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(12), GL.DYNAMIC_DRAW);
        GL.enableVertexAttribArray(deferred_lightning_shader.attribute_pointer.texture_position);
        GL.vertexAttribPointer(deferred_lightning_shader.attribute_pointer.texture_position, 2, GL.FLOAT, false, 0, 0);

        GL.bindBuffer(GL.ARRAY_BUFFER, null);
        GL.bindVertexArray(null);

        /**
         * PREPARE UNIFORM BUFFER
         */
        const allocateLightUniformSize =
            4           // Flag = 1 * vec4
        +   4 * 5       // DayLight = 5 * vec4
        +   MAXIMUM_LIGHTS_PER_BLOCK * MAXIMUM_LIGHT_BLOCKS * 6 * 4 // OmniLight = 6 * vec4
        +   MAXIMUM_LIGHTS_PER_BLOCK * MAXIMUM_LIGHT_BLOCKS * 8 * 4; // SpotLight = 8 * vec4
        LightningPass.light_buffer = GL.createBuffer();
        GL.bindBuffer(GL.UNIFORM_BUFFER, LightningPass.light_buffer);
        GL.bufferData(GL.UNIFORM_BUFFER, new Float32Array(allocateLightUniformSize), GL.DYNAMIC_DRAW);
        GL.bindBuffer(GL.UNIFORM_BUFFER, null);
    }

    static frameSetup(frame_info: FrameInfo): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        const aspect = frame_info.width / frame_info.height;
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
        GL.bindBuffer(GL.ARRAY_BUFFER, LightningPass.plane_texture_buffer);
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

    static runPass(light_queue: LightQueueEntry[], frame_info: FrameInfo): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        MainController.ShaderController.useDeferredLightningShader();

        GL.viewport(0, 0, frame_info.width, frame_info.height);
        GL.disable(GL.DEPTH_TEST);
        GL.clearColor(0.3, 0.3, 0.3, 1.0);
        GL.clear(GL.COLOR_BUFFER_BIT);

        // Use The PlaneVao
        // Bind Undo Matrices
        MainController.SceneController.getSceneCamera().bindForLightningPass(GL);

        GL.bindVertexArray(LightningPass.plane_vao);

        // Bind Geometry Pass Textures
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, GeometryPass.albedo_texture);

        GL.activeTexture(GL.TEXTURE1);
        GL.bindTexture(GL.TEXTURE_2D, GeometryPass.specular_texture);

        GL.activeTexture(GL.TEXTURE2);
        GL.bindTexture(GL.TEXTURE_2D, GeometryPass.position_texture);

        GL.activeTexture(GL.TEXTURE3);
        GL.bindTexture(GL.TEXTURE_2D, GeometryPass.normal_texture);

        GL.activeTexture(GL.TEXTURE4);
        GL.bindTexture(GL.TEXTURE_2D, GeometryPass.material_texture);

        // Bind Daylight
        LightningPass.bindSceneLights();

        // Bind Other Light
        GL.drawArrays(GL.TRIANGLES, 0, 6);
    }

    private static bindSceneLights() {
        const scene_light_info: SceneLightInfo = MainController.SceneController.getSceneLightInfo();

        let rawOmniData: number[] = [];
        let overflow: number = 0;
        let needUniformBlocks: number = 0;
        for(let i = 0; i < scene_light_info.omni_lights.length; i++) {
            needUniformBlocks = Math.floor(i / MAXIMUM_LIGHTS_PER_BLOCK);
            if(needUniformBlocks < MAXIMUM_LIGHT_BLOCKS) {
                const l = scene_light_info.omni_lights[i];
                rawOmniData.concat([
                    l.position.x, l.position.y, l.position.z, 0.0,
                    l.limit.x, l.limit.y, l.limit.z, 0.0,
                    l.color.x, l.color.y, l.color.z, 0.0,
                    l.amb_factor.x, l.amb_factor.y, l.amb_factor.z, 0.0,
                    l.diff_factor.x, l.diff_factor.y, l.diff_factor.z, 0.0,
                    l.spec_factor.x, l.spec_factor.y, l.spec_factor.z, 0.0,
                ]);
            } else {
                overflow++;
            }
        }
        if(overflow > 0) {
            console.warn("REACHED OMNI LIGHT LIMIT OF " + (MAXIMUM_LIGHT_BLOCKS * MAXIMUM_LIGHTS_PER_BLOCK) + ". Light Requests: " + overflow);
            // overflow = 0;
        }
        let rawSpotData: number[][] = [];
        /*
        ACTIVATE SPOT LIGHTS LATER

        for(let i = 0; i < scene_light_info.spot_lights.length; i++) {
           const block = Math.floor(i / MAXIMUM_LIGHTS_PER_BLOCK);
           if(rawSpotData.length <= block) {
               rawSpotData.push([]);
           }
           if(block < 8) {
               const l = scene_light_info.spot_lights[i];
               rawSpotData[block].concat([
                   l.position.x, l.position.y, l.position.z, 0.0,
                   l.direction.x, l.direction.y, l.direction.z, 0.0,
                   l.cutoff.x, l.cutoff.y, 0.0, 0.0,
                   l.limit.x, l.limit.y, l.limit.z, 0.0,
                   l.color.x, l.color.y, l.color.z, 0.0,
                   l.amb_factor.x, l.amb_factor.y, l.amb_factor.z, 0.0,
                   l.diff_factor.x, l.diff_factor.y, l.diff_factor.z, 0.0,
                   l.spec_factor.x, l.spec_factor.y, l.spec_factor.z, 0.0,
               ]);
           } else {
               overflow++;
           }
        }
        if(overflow > 0) {
           console.warn("REACHED SPOT LIGHT LIMIT OF " + (MAXIMUM_LIGHT_BLOCKS * MAXIMUM_LIGHTS_PER_BLOCK) + ". Light Requests: " + overflow);
        }
        */
        const settingsData: number[] = [
            needUniformBlocks,
            (rawOmniData.length / (6 * 4)) % (MAXIMUM_LIGHTS_PER_BLOCK),
            0.0,
            0.0
        ];
        const dl: DayLight = MainController.SceneController.getSceneDayLight();
        const daylightData: number[] = [
            dl.direction.x, dl.direction.y, dl.direction.z, 0.0,
            dl.color.x, dl.color.y, dl.color.z, 0.0,
            dl.amb_factor.x, dl.amb_factor.y, dl.amb_factor.z, 0.0,
            dl.diffuse_factor.x, dl.diffuse_factor.y, dl.diffuse_factor.z, 0.0,
            dl.specular_factor.x, dl.specular_factor.y, dl.specular_factor.z, 0.0
        ];
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        GL.bindBuffer(GL.UNIFORM_BUFFER, this.light_buffer);
        LightningPass.bufferDayLightAndSettingsData(GL, settingsData.concat(daylightData));
        LightningPass.bufferOmniLightData(GL, rawOmniData);
        LightningPass.bufferSpotLightData(GL, []);
        GL.bindBufferBase(GL.UNIFORM_BUFFER, MainController.ShaderController.getDeferredLightningShader().block_bindings.light, this.light_buffer);
    }

    private static bufferDayLightAndSettingsData(GL: WebGL2RenderingContext, data: number[]) {
        GL.bufferSubData(GL.UNIFORM_BUFFER, 0, new Float32Array(data));
    }

    private static bufferOmniLightData(GL, data: number[]) {
        GL.bufferSubData(GL.UNIFORM_BUFFER, 96, new Float32Array(data));
    }

    private static bufferSpotLightData(GL, data: number[]) {
        const floatOffsets = 4    // Flag = 1 * vec4
            +   4 * 5       // DayLight = 5 * vec4
            +   MAXIMUM_LIGHTS_PER_BLOCK * MAXIMUM_LIGHT_BLOCKS * 6 * 4; // Omni = 6 * vec4
        GL.bufferSubData(GL.UNIFORM_BUFFER, floatOffsets * 4, new Float32Array(data));
    }
}