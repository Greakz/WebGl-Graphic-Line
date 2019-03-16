import {TextureCubeMap} from "../Resource/Texture/TextureCubeMap";
import {MainController} from "../../Controller/MainController";

export interface Skybox {
    readonly cube_map: TextureCubeMap;
    /**
     * BINDS THE SKYMAP FOR USAGE!
     */
    readonly use: (GL: WebGL2RenderingContext) => void;
}

export abstract class BaseSkybox {
    readonly cube_map: TextureCubeMap;
    private ready: boolean = false;
    readonly use = (GL: WebGL2RenderingContext) => {
        if(!this.ready) {
            // @ts-ignore
            this.cube_map = MainController.ResourceController.getTexture(this.cube_map);
        }
        this.cube_map.use(GL);
    };
}