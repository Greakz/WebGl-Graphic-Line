import {MainController} from "../../MainController";
import {FrameInfo, LightQueueEntry} from "../RenderController";
import {DeferredLightningShader} from "../../../Render/Shader/DeferredLightningShader";
import {GeometryPass} from "./GeometryPass";
import {SceneLightInfo} from "../../SceneController";
import {DayLight} from "../../../Render/Resource/Light/DayLight";
import {LightBulbShader} from "../../../Render/Shader/LightBulbShader";

export const MAXIMUM_OMNI_LIGHT_BLOCKS: number = 4;
export const MAXIMUM_SPOT_LIGHT_BLOCKS: number = 4;
export const MAXIMUM_LIGHTS_PER_BLOCK: number = 64;

export abstract class LightningPass {
    //////////////////////////////
    //  INPUT TO LIGHTNING PASS
    //////////////////////////////
    static plane_vertex_buffer: WebGLBuffer;
    static plane_texture_buffer: WebGLBuffer;
    static plane_vao: WebGLVertexArrayObject;

    static light_buffer: WebGLBuffer;

    //////////////////////////////
    //  GENERATED IN LIGHTNING PASS
    //////////////////////////////
    // todo use brightness result to add bloom effect later
    // static light_brightness_result: WebGLTexture;
    static light_calculation_framebuffer: WebGLFramebuffer;
    static light_calculation_result: WebGLTexture;
    static light_bulb_framebuffer: WebGLFramebuffer;
    static light_bulb_result: WebGLTexture;

    /////////////////////////////
    //  OUTPUT OF LIGHTNING PASS
    //  Combine = Bulbs, Light Calculation, Stencil Borders
    //  todo Brightness = every screen fragment that hits a brightness level over an threshold
    /////////////////////////////
    static light_combine_framebuffer: WebGLFramebuffer;
    static light_combine_result: WebGLTexture;
    static light_brightness_result: WebGLTexture;

    static appSetup(): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        GL.clearColor(0.0, 0.0, 0.0, 1.0);

        // console.log('MAX_VERTEX_UNIFORM_BLOCKS', GL.getParameter(GL.MAX_VERTEX_UNIFORM_BLOCKS));
        // console.log('MAX_FRAGMENT_UNIFORM_BLOCKS', GL.getParameter(GL.MAX_FRAGMENT_UNIFORM_BLOCKS));
        // console.log('MAX_UNIFORM_BLOCK_SIZE', GL.getParameter(GL.MAX_UNIFORM_BLOCK_SIZE));

        ////////////////////////////////
        // PREPARE RENDER PLANE
        ////////////////////////////////
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


        ////////////////////////////////
        // BIND PLANE VAO STUFF FOR COMBINE SHADER
        ////////////////////////////////
        MainController.ShaderController.useCombineLightningShader();
        const combine_lightning_shader = MainController.ShaderController.getCombineLightningShader();
        GL.bindBuffer(GL.ARRAY_BUFFER, LightningPass.plane_vertex_buffer);
        GL.enableVertexAttribArray(combine_lightning_shader.attribute_pointer.vertex_position);
        GL.vertexAttribPointer(combine_lightning_shader.attribute_pointer.vertex_position, 3, GL.FLOAT, false, 0, 0);
        GL.bindBuffer(GL.ARRAY_BUFFER, LightningPass.plane_texture_buffer);
        GL.enableVertexAttribArray(combine_lightning_shader.attribute_pointer.texture_position);
        GL.vertexAttribPointer(combine_lightning_shader.attribute_pointer.texture_position, 2, GL.FLOAT, false, 0, 0);

        GL.bindBuffer(GL.ARRAY_BUFFER, null);
        GL.bindVertexArray(null);

        ////////////////////////////////
        // PREPARE UNIFORM BUFFER
        ////////////////////////////////
        const allocateLightUniformSize =
            4           // Flag = 1 * vec4
        +   4 * 5       // DayLight = 5 * vec4
        +   MAXIMUM_LIGHTS_PER_BLOCK * MAXIMUM_OMNI_LIGHT_BLOCKS * 6 * 4 // OmniLight = 6 * vec4
        +   MAXIMUM_LIGHTS_PER_BLOCK * MAXIMUM_OMNI_LIGHT_BLOCKS * 8 * 4; // SpotLight = 8 * vec4
        LightningPass.light_buffer = GL.createBuffer();
        GL.bindBuffer(GL.UNIFORM_BUFFER, LightningPass.light_buffer);
        GL.bufferData(GL.UNIFORM_BUFFER, new Float32Array(allocateLightUniformSize), GL.DYNAMIC_DRAW);
        GL.bindBuffer(GL.UNIFORM_BUFFER, null);

        LightningPass.lightBulbsAppSetup(GL);

        ////////////////////////////////
        // PREPARE INITIAL CALCULATION FRAMEBUFFER AND TEXTURES
        ////////////////////////////////
        const SIZEX = 1920;
        const SIZEY = 1920;
        const INTERN_FORMAT = GL.RGBA32F;
        const FILTER = GL.NEAREST;
        const LEVEL = 1;

        LightningPass.light_calculation_framebuffer = GL.createFramebuffer();
        GL.bindFramebuffer(GL.FRAMEBUFFER, LightningPass.light_calculation_framebuffer);

        LightningPass.light_calculation_result = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, LightningPass.light_calculation_result);

        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, 0);
        GL.texStorage2D(
            GL.TEXTURE_2D,
            LEVEL,
            INTERN_FORMAT,
            SIZEX,
            SIZEY
        );
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, FILTER);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, FILTER);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, LightningPass.light_calculation_result, 0);

        LightningPass.light_bulb_framebuffer = GL.createFramebuffer();
        GL.bindFramebuffer(GL.FRAMEBUFFER, LightningPass.light_bulb_framebuffer);

        LightningPass.light_bulb_result = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, LightningPass.light_bulb_result);

        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, 0);
        GL.texStorage2D(
            GL.TEXTURE_2D,
            LEVEL,
            INTERN_FORMAT,
            SIZEX,
            SIZEY
        );
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, FILTER);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, FILTER);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, LightningPass.light_bulb_result, 0);


        ////////////////////////////////
        // PREPARE COMBINE AND BRIGHTNESS FRAMEBUFFER AND TEXTURES
        ////////////////////////////////
        LightningPass.light_combine_framebuffer = GL.createFramebuffer();
        GL.bindFramebuffer(GL.FRAMEBUFFER, LightningPass.light_combine_framebuffer);

        LightningPass.light_combine_result = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, LightningPass.light_combine_result);

        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, 0);
        GL.texStorage2D(
            GL.TEXTURE_2D,
            LEVEL,
            INTERN_FORMAT,
            SIZEX,
            SIZEY
        );
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, FILTER);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, FILTER);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, LightningPass.light_combine_result, 0);

        LightningPass.light_brightness_result = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, LightningPass.light_brightness_result);

        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, 0);
        GL.texStorage2D(
            GL.TEXTURE_2D,
            LEVEL,
            INTERN_FORMAT,
            SIZEX,
            SIZEY
        );
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, FILTER);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, FILTER);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT1, GL.TEXTURE_2D, LightningPass.light_brightness_result, 0);

        GL.drawBuffers([GL.COLOR_ATTACHMENT0, GL.COLOR_ATTACHMENT1]);

        ////////////////////////////////
        // CLEAR BINDINGS AFTER INITIALISATION
        ////////////////////////////////
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
        GL.bindTexture(GL.TEXTURE_2D, null);
    }

    static frameSetup(frame_info: FrameInfo): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        GL.bindBuffer(GL.ARRAY_BUFFER, LightningPass.plane_texture_buffer);
        const texData = [
            0.0, 1.0,
            0.0, 0.0,
            1.0, 1.0,
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
        ];
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(texData), GL.DYNAMIC_DRAW);
        GL.bindBuffer(GL.ARRAY_BUFFER, null);
    }

    static runPass(light_queue: LightQueueEntry[], frame_info: FrameInfo): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();

        GL.bindFramebuffer(GL.FRAMEBUFFER, LightningPass.light_calculation_framebuffer);
        GL.clearColor(0.0, 0.0, 0.0, 1.0);
        GL.viewport(0, 0, 1920, 1920);
        GL.clear(GL.COLOR_BUFFER_BIT);

        MainController.ShaderController.useDeferredLightningShader();

        // Use The PlaneVao
        // Bind Undo Matrices
        MainController.SceneController.getSceneCamera().bindForDeferredLightningShader(GL);

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

        // Light Bulbs
        GL.bindFramebuffer(GL.FRAMEBUFFER, LightningPass.light_bulb_framebuffer);
        GL.clearColor(0.0, 0.0, 0.0, 1.0);
        GL.viewport(0, 0, 1920, 1920);
        GL.clear(GL.COLOR_BUFFER_BIT);

        if(LightningPass.draw_light_bulbs > 0) {
            LightningPass.drawLightBulbs();
        }
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);

        LightningPass.combineBulbAndCalcResult();
    }

    private static bindSceneLights() {
        const scene_light_info: SceneLightInfo = MainController.SceneController.getSceneLightInfo();

        let light_bulb_data: number[] = [];
        LightningPass.draw_light_bulbs = 0;

        let rawOmniData: number[] = [];
        let overflow: number = 0;
        let needOmniUniformBlocks: number = 0;
        for(let i = 0; i < scene_light_info.omni_lights.length; i++) {
            needOmniUniformBlocks = Math.floor(i / MAXIMUM_LIGHTS_PER_BLOCK) + 1;
            if(needOmniUniformBlocks <= MAXIMUM_OMNI_LIGHT_BLOCKS) {
                const l = scene_light_info.omni_lights[i];
                rawOmniData.push(
                    l.position.x, l.position.y, l.position.z, 0.0,
                    l.constant, l.linear, l.quadric, 0.0,
                    l.color.x, l.color.y, l.color.z, 0.0,
                    l.amb_factor.x, l.amb_factor.y, l.amb_factor.z, 0.0,
                    l.diff_factor.x, l.diff_factor.y, l.diff_factor.z, 0.0,
                    l.spec_factor.x, l.spec_factor.y, l.spec_factor.z, 0.0
                );
                light_bulb_data.push(
                    l.color.x, l.color.y, l.color.z, l.bulbOpacity(),
                    l.position.x, l.position.y, l.position.z
                );
                LightningPass.draw_light_bulbs++;
            } else {
                overflow++;
            }
        }
        if(overflow > 0) {
            console.warn("REACHED OMNI LIGHT LIMIT OF " + (MAXIMUM_OMNI_LIGHT_BLOCKS * MAXIMUM_LIGHTS_PER_BLOCK) + ". Light Requests OVERFLOW: " + overflow);
            // overflow = 0;
        }
        let rawSpotData: number[] = [];
        overflow = 0;
        let needSpotUniformBlocks = 0;
        for(let i = 0; i < scene_light_info.spot_lights.length; i++) {
           needSpotUniformBlocks = Math.floor(i / MAXIMUM_LIGHTS_PER_BLOCK) + 1;
           if(needSpotUniformBlocks < MAXIMUM_SPOT_LIGHT_BLOCKS) {
               const l = scene_light_info.spot_lights[i];
               rawSpotData.push(
                   l.position.x, l.position.y, l.position.z, 0.0,
                   l.direction.x, l.direction.y, l.direction.z, 0.0,
                   l.inner_cutoff, l.outer_cutoff, 0.0, 0.0,
                   l.constant, l.linear, l.quadric, 0.0,
                   l.color.x, l.color.y, l.color.z, 0.0,
                   l.amb_factor.x, l.amb_factor.y, l.amb_factor.z, 0.0,
                   l.diff_factor.x, l.diff_factor.y, l.diff_factor.z, 0.0,
                   l.spec_factor.x, l.spec_factor.y, l.spec_factor.z, 0.0,
               );
               light_bulb_data.push(
                   l.color.x, l.color.y, l.color.z, l.bulbOpacity(),
                   l.position.x, l.position.y, l.position.z
               );
               LightningPass.draw_light_bulbs++;
           } else {
               overflow++;
           }
        }
        if(overflow > 0) {
           console.warn("REACHED SPOT LIGHT LIMIT OF " + (MAXIMUM_OMNI_LIGHT_BLOCKS * MAXIMUM_LIGHTS_PER_BLOCK) + ". Light Requests: " + overflow);
        }
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();

        if(LightningPass.draw_light_bulbs > 0) {
            LightningPass.bufferLightBulbsData(GL, light_bulb_data);
        }

        const dl: DayLight = MainController.SceneController.getSceneDayLight();
        const settingsDaylightData: number[] = [
            needOmniUniformBlocks,
            (rawOmniData.length / (6 * 4)) % (MAXIMUM_LIGHTS_PER_BLOCK),
            needSpotUniformBlocks,
            (rawSpotData.length / (8 * 4)) % (MAXIMUM_LIGHTS_PER_BLOCK),
            dl.direction.x, dl.direction.y, dl.direction.z, 0.0,
            dl.color.x, dl.color.y, dl.color.z, 0.0,
            dl.amb_factor.x, dl.amb_factor.y, dl.amb_factor.z, 0.0,
            dl.diffuse_factor.x, dl.diffuse_factor.y, dl.diffuse_factor.z, 0.0,
            dl.specular_factor.x, dl.specular_factor.y, dl.specular_factor.z, 0.0
        ];
        GL.bindBuffer(GL.UNIFORM_BUFFER, LightningPass.light_buffer);
        LightningPass.bufferDayLightAndSettingsData(GL, settingsDaylightData);
        LightningPass.bufferOmniLightData(GL, rawOmniData);
        LightningPass.bufferSpotLightData(GL, rawSpotData);
        GL.bindBufferBase(GL.UNIFORM_BUFFER, MainController.ShaderController.getDeferredLightningShader().block_bindings.light, LightningPass.light_buffer);
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
            +   MAXIMUM_LIGHTS_PER_BLOCK * MAXIMUM_OMNI_LIGHT_BLOCKS * 6 * 4; // Omni = 6 * vec4
        GL.bufferSubData(GL.UNIFORM_BUFFER, floatOffsets * 4, new Float32Array(data));
    }

    /**
     * METHODS for showing light_bulb meshes!
     */
    private static light_bulb_vertex_buffer: WebGLBuffer;
    private static light_bulb_u_buffer: WebGLBuffer;
    private static light_bulb_vao: WebGLVertexArrayObject;
    private static draw_light_bulbs: number = 0;

    private static lightBulbsAppSetup(GL: WebGL2RenderingContext) {
        LightningPass.light_bulb_vao = GL.createVertexArray();
        LightningPass.light_bulb_vertex_buffer = GL.createBuffer();
        LightningPass.light_bulb_u_buffer = GL.createBuffer();

        const lightBulbShader: LightBulbShader = MainController.ShaderController.getLightBulbShader();
        GL.useProgram(lightBulbShader.program);

        GL.bindVertexArray(LightningPass.light_bulb_vao);
        GL.bindBuffer(GL.ARRAY_BUFFER, LightningPass.light_bulb_vertex_buffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array([
            // top pyramid
            0.0, 0.2, 0.0,      -0.2, 0.0, 0.0,         0.0, 0.0, 0.2,
            0.0, 0.2, 0.0,      0.0, 0.0, 0.2,          0.2, 0.0, 0.0,
            0.0, 0.2, 0.0,      0.2, 0.0, 0.0,          0.0, 0.0, -0.2,
            0.0, 0.2, 0.0,      0.0, 0.0, -0.2,         -0.2, 0.0, 0.0,

            // bottom pyramid
            0.0, -0.2, 0.0,     0.0, 0.0, 0.2,      -0.2, 0.0, 0.0,
            0.0, -0.2, 0.0,     0.2, 0.0, 0.0,      0.0, 0.0, 0.2,
            0.0, -0.2, 0.0,     0.0, 0.0, -0.2,     0.2, 0.0, 0.0,
            0.0, -0.2, 0.0,     -0.2, 0.0, 0.0,     0.0, 0.0, -0.2,
        ]), GL.STATIC_DRAW);
        GL.enableVertexAttribArray(lightBulbShader.attribute_pointer.vertex_position);
        GL.vertexAttribPointer(lightBulbShader.attribute_pointer.vertex_position, 3, GL.FLOAT, false, 0, 0);

        GL.bindBuffer(GL.ARRAY_BUFFER, LightningPass.light_bulb_u_buffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(28), GL.DYNAMIC_DRAW);

        GL.enableVertexAttribArray(lightBulbShader.attribute_pointer.bulb_color);
        GL.vertexAttribPointer(lightBulbShader.attribute_pointer.bulb_color, 4, GL.FLOAT, false, 7 * 4, 0);
        GL.vertexAttribDivisor(lightBulbShader.attribute_pointer.bulb_color, 1);

        GL.enableVertexAttribArray(lightBulbShader.attribute_pointer.bulb_position);
        GL.vertexAttribPointer(lightBulbShader.attribute_pointer.bulb_position, 3, GL.FLOAT, false, 7 * 4, 4 * 4);
        GL.vertexAttribDivisor(lightBulbShader.attribute_pointer.bulb_position, 1);

        GL.bindBuffer(GL.ARRAY_BUFFER, null);
        GL.bindVertexArray(null);
    }

    private static bufferLightBulbsData(GL: WebGL2RenderingContext, omni_data: number[]) {
        GL.bindBuffer(GL.ARRAY_BUFFER, LightningPass.light_bulb_u_buffer);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(omni_data), GL.DYNAMIC_DRAW);
        GL.bindBuffer(GL.ARRAY_BUFFER, null);
    }

    public static drawLightBulbs() {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        MainController.ShaderController.useLightBulbShader();
        GL.bindVertexArray(LightningPass.light_bulb_vao);
        MainController.SceneController.getSceneCamera().bindForLightBulbShader(GL);
        GL.drawArraysInstanced(GL.TRIANGLES, 0, 24, LightningPass.draw_light_bulbs);
    }

    /**
     * COMBINATION
     *  AND
     *   BRIGHTNESS
     *
     *      PASS!
     */
    private static combineBulbAndCalcResult() {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        GL.bindFramebuffer(GL.FRAMEBUFFER, LightningPass.light_combine_framebuffer);
        MainController.ShaderController.useCombineLightningShader();
        GL.bindVertexArray(LightningPass.plane_vao);

        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, LightningPass.light_calculation_result);

        GL.activeTexture(GL.TEXTURE1);
        GL.bindTexture(GL.TEXTURE_2D, LightningPass.light_bulb_result);

        GL.drawArrays(GL.TRIANGLES, 0, 6);
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
    }
}