import {MainController} from "../../MainController";
import {checkFramebuffer} from "../../../Util/FramebufferCheck";
import {FrameInfo, RenderQueueMaterialEntry, RenderQueueMeshEntry} from "../RenderController";
import {DrawMesh} from "../../../Render/DrawMesh";
import {DayLight} from "../../../Render/Resource/Light/DayLight";
import {flatMat4} from "../../../Geometry/Matrix/flatten";
import {getOrthographicMatrix} from "../../../Geometry/Matrix/orthographic";
import {lookAtMatrix} from "../../../Geometry/Matrix/lookAt";
import {Camera} from "../../../Render/Camera";
import {addVec3} from "../../../Geometry/Vector/add";
import {scaleVec3} from "../../../Geometry/Vector/scale";

export abstract class GeometryPassShadowExtension {

    // Generated By Geometry Pass!
    static shadow_framebuffer: WebGLFramebuffer;

    static depth_texture: WebGLTexture;
    static shadow_texture: WebGLTexture;

    static appSetup(): void {
       const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        /**
         * Position FRAMEBUFFER
         * RGB = XYZ from ScreenSpace pressed
         */

        const SIZEX = 1920;
        const SIZEY = 1920;
        const INTERN_FORMAT = GL.RGBA32F;
        const FILTER = GL.NEAREST;
        const LEVEL = 1;

        ////////////////////////////////////////////
        // BIND FRAMEBUFFER
        ////////////////////////////////////////////
        GeometryPassShadowExtension.shadow_framebuffer = GL.createFramebuffer();
        GL.bindFramebuffer(GL.FRAMEBUFFER, GeometryPassShadowExtension.shadow_framebuffer);
        GL.activeTexture(GL.TEXTURE0);

        ////////////////////////////////////////////
        // BIND DEPTH Texture
        ////////////////////////////////////////////
        GeometryPassShadowExtension.depth_texture = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, GeometryPassShadowExtension.depth_texture);
        // GL.texImage2D(GL.TEXTURE_2D, 0, GL.DEPTH_COMPONENT32F, SIZEX, SIZEY, 0, GL.DEPTH_COMPONENT, GL.FLOAT, null);
        GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, 0);
        GL.texStorage2D(
            GL.TEXTURE_2D,
            LEVEL,
            GL.DEPTH_COMPONENT32F,
            SIZEX,
            SIZEY
        );
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, FILTER);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, FILTER);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.TEXTURE_2D, GeometryPassShadowExtension.depth_texture, 0);

        ////////////////////////////////////////////
        // CREATE POSITION TEXTURE
        ////////////////////////////////////////////
        GeometryPassShadowExtension.shadow_texture = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, GeometryPassShadowExtension.shadow_texture);
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
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, GeometryPassShadowExtension.shadow_texture, 0);

        ////////////////////////////////////////////
        // SETUP DRAW BUFFER
        // CHECK STATUS
        // & UNBIND THE SHIT
        ////////////////////////////////////////////
        GL.drawBuffers([GL.COLOR_ATTACHMENT0]);

        checkFramebuffer(GL, GeometryPassShadowExtension.shadow_framebuffer);

        // reset used bindings
        GL.bindRenderbuffer(GL.RENDERBUFFER, null);
        GL.bindTexture(GL.TEXTURE_2D, null);
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
    }
    
    static frameSetup(frame_info: FrameInfo): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        GL.bindFramebuffer(GL.FRAMEBUFFER, GeometryPassShadowExtension.shadow_framebuffer);
        GL.clearColor(0.0, 0.0, 0.0, 1.0);
        GL.viewport(0, 0, 1920, 1920);
        GL.enable(GL.DEPTH_TEST);
        GL.depthFunc(GL.LEQUAL);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        const daylight: DayLight = MainController.SceneController.getSceneDayLight();
        const cam: Camera = MainController.SceneController.getSceneCamera();
        this.proj_matrix = flatMat4(getOrthographicMatrix(
            -(cam.farPlane / 4),
            (cam.farPlane / 4),
            -(cam.farPlane / 4),
            (cam.farPlane / 4),
            5.0,
            (cam.farPlane)
        ));
        this.view_matrix = flatMat4(lookAtMatrix(
            addVec3(cam.target, scaleVec3(daylight.direction, -30)),
            cam.target,
            {x: 0.0, y: 1.0, z: 0.0}
        ));
        MainController.ShaderController.useShadowShader();
        GeometryPassShadowExtension.bindDayLightMatrix(
            MainController.ShaderController.getShadowShader().uniform_locations.view_matrix,
            MainController.ShaderController.getShadowShader().uniform_locations.projection_matrix,
        );
        MainController.ShaderController.useDeferredLightningShader();
        GeometryPassShadowExtension.bindDayLightMatrix(
            MainController.ShaderController.getDeferredLightningShader().uniform_locations.daylight_view_matrix,
            MainController.ShaderController.getDeferredLightningShader().uniform_locations.daylight_projection_matrix,
        );
    }

    private static view_matrix: number[];
    private static proj_matrix: number[];

    static bindForDrawShadow(): void {
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        GL.bindFramebuffer(GL.FRAMEBUFFER, GeometryPassShadowExtension.shadow_framebuffer);
        MainController.ShaderController.useShadowShader();
    }

    static bindDayLightMatrix(
        view_matrix_uniform: WebGLUniformLocation,
        projection_matrix_uniform: WebGLUniformLocation,
    ){
        const GL: WebGL2RenderingContext = MainController.CanvasController.getGL();
        GL.uniformMatrix4fv(
            view_matrix_uniform,
            false,
            new Float32Array(GeometryPassShadowExtension.view_matrix)
        );
        GL.uniformMatrix4fv(
            projection_matrix_uniform,
            false,
            new Float32Array(GeometryPassShadowExtension.proj_matrix)
        );
    }
}