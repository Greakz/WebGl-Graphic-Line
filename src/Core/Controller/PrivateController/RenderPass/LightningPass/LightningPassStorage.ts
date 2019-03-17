import {MainController} from "../../../MainController";

export class LightningPassStorage {
    used_size: number;
    //Base Pass
    light_calculation_framebuffer: WebGLFramebuffer;
    light_calculation_result: WebGLTexture;

    // Bulb Drawing
    light_bulb_framebuffer: WebGLFramebuffer;
    light_bulb_result: WebGLTexture;

    // Combine Base Pass and Buld Drawing plus
    // extract bright values!
    light_combine_framebuffer: WebGLFramebuffer;
    light_combine_result: WebGLTexture;
    light_brightness_result: WebGLTexture;

    // Brightness Blur
    light_blur_horiz_framebuffer: WebGLFramebuffer;
    light_blur_result_framebuffer: WebGLFramebuffer;
    light_blurred_horiz: WebGLTexture;
    light_blurred_result: WebGLTexture;

    // final output
    light_final_framebuffer: WebGLFramebuffer;
    light_final_result: WebGLTexture;

    setViewPort(GL: WebGL2RenderingContext) {
        GL.viewport(0, 0, this.used_size, this.used_size);
    }

    bindLightCalculationFramebufferAndShader(GL: WebGL2RenderingContext) {
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.light_calculation_framebuffer);
        MainController.ShaderController.useDeferredLightningShader();
    }

    bindLightBulbFramebufferAndShader(GL: WebGL2RenderingContext) {
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.light_bulb_framebuffer);
        MainController.ShaderController.useLightBulbShader();
    }

    bindLightCombineFramebufferAndShader(GL: WebGL2RenderingContext) {
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.light_combine_framebuffer);
        MainController.ShaderController.useCombineLightningShader();
    }

    bindBlurHorizFramebufferAndShader(GL: WebGL2RenderingContext) {
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.light_blur_horiz_framebuffer);
        MainController.ShaderController.useBlurShader();
    }

    bindBlurResultFramebufferAndShader(GL: WebGL2RenderingContext) {
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.light_blur_result_framebuffer);
        // MainController.ShaderController.useBlurShader(); // since directly called after horiz!
    }

    bindLightFinalFramebufferAndShader(GL: WebGL2RenderingContext) {
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.light_final_framebuffer);
        MainController.ShaderController.useFinalizeLightningShader();
    }

    constructor(GL: WebGL2RenderingContext, SIZE: number) {
        const INTERN_FORMAT = GL.RGBA32F;
        const FILTER = GL.NEAREST;
        const LEVEL = 1;

        this.used_size = SIZE;

        this.light_calculation_framebuffer = GL.createFramebuffer();
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.light_calculation_framebuffer);

        this.light_calculation_result = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, this.light_calculation_result);

        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, 0);
        GL.texStorage2D(
            GL.TEXTURE_2D,
            LEVEL,
            INTERN_FORMAT,
            SIZE,
            SIZE
        );
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, FILTER);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, FILTER);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.light_calculation_result, 0);

        this.light_bulb_framebuffer = GL.createFramebuffer();
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.light_bulb_framebuffer);

        this.light_bulb_result = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, this.light_bulb_result);

        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, 0);
        GL.texStorage2D(
            GL.TEXTURE_2D,
            LEVEL,
            INTERN_FORMAT,
            SIZE,
            SIZE
        );
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, FILTER);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, FILTER);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.light_bulb_result, 0);


        ////////////////////////////////
        // PREPARE COMBINE AND BRIGHTNESS FRAMEBUFFER AND TEXTURES
        ////////////////////////////////
        this.light_combine_framebuffer = GL.createFramebuffer();
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.light_combine_framebuffer);

        this.light_combine_result = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, this.light_combine_result);

        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, 0);
        GL.texStorage2D(
            GL.TEXTURE_2D,
            LEVEL,
            INTERN_FORMAT,
            SIZE,
            SIZE
        );
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, FILTER);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, FILTER);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.light_combine_result, 0);

        this.light_brightness_result = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, this.light_brightness_result);

        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, 0);
        GL.texStorage2D(
            GL.TEXTURE_2D,
            LEVEL,
            INTERN_FORMAT,
            SIZE,
            SIZE
        );
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, FILTER);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, FILTER);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT1, GL.TEXTURE_2D, this.light_brightness_result, 0);

        GL.drawBuffers([GL.COLOR_ATTACHMENT0, GL.COLOR_ATTACHMENT1]);

        ////////////////////////////////
        // PREPARE BLUR FRAMEBUFFER AND TEXTURES
        ////////////////////////////////
        this.light_blur_horiz_framebuffer = GL.createFramebuffer();
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.light_blur_horiz_framebuffer);

        this.light_blurred_horiz = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, this.light_blurred_horiz);

        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, 0);
        GL.texStorage2D(
            GL.TEXTURE_2D,
            LEVEL,
            INTERN_FORMAT,
            SIZE,
            SIZE
        );
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, FILTER);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, FILTER);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.light_blurred_horiz, 0);

        this.light_blur_result_framebuffer = GL.createFramebuffer();
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.light_blur_result_framebuffer);

        this.light_blurred_result = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, this.light_blurred_result);

        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, 0);
        GL.texStorage2D(
            GL.TEXTURE_2D,
            LEVEL,
            INTERN_FORMAT,
            SIZE,
            SIZE
        );
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, FILTER);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, FILTER);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.light_blurred_result, 0);

        ////////////////////////////////
        // PREPARE FINAL RESULT FRAMEBUFFER AND TEXTURES
        ////////////////////////////////
        this.light_final_framebuffer = GL.createFramebuffer();
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.light_final_framebuffer);

        this.light_final_result = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, this.light_final_result);

        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, 0);
        GL.texStorage2D(
            GL.TEXTURE_2D,
            LEVEL,
            INTERN_FORMAT,
            SIZE,
            SIZE
        );
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, FILTER);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, FILTER);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, this.light_final_result, 0);

        ////////////////////////////////
        // CLEAR BINDINGS AFTER INITIALISATION
        ////////////////////////////////
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
        GL.bindTexture(GL.TEXTURE_2D, null);
    }
}