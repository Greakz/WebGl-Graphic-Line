import LogInstance, {LogInterface} from "../Util/LogInstance";

export interface CanvasControllerInterface {
    getGL: () => WebGL2RenderingContext;
    init(): void;
    getHeight(): number;
    getWidth(): number;
    getAspect(): number;
}

var canvas_instance: HTMLCanvasElement;
var canvas_context: WebGL2RenderingContext;
var canvas_height: number;
var canvas_width: number;

class CanvasController implements CanvasControllerInterface{

    static readonly Log: LogInterface = LogInstance;

    private extensions: {[key: string]: any} = {}

    constructor(){}

    init() {
        initDom();
        canvas_instance = (document.querySelector('#canvas') as HTMLCanvasElement);
        canvas_context = canvas_instance.getContext('webgl2') as WebGL2RenderingContext;
        this.extensions = {
            "drawbuffers": canvas_context.getExtension("GL_EXT_draw_buffers")
        };
        console.log(this.extensions.drawbuffers)

        window.addEventListener('resize', () => adjustCanvasSize());
        adjustCanvasSize();
        // Mouse.init();
        CanvasController.Log.info('Canvas', 'Initialised Successfully...');
    }

    getGL(): WebGL2RenderingContext {
        return canvas_context;
    }
    getAspect(): number {
        return canvas_width / canvas_height;
    }
    getWidth(): number {
        return canvas_width;
    }
    getHeight(): number {
        return canvas_height;
    }
}


function initDom() {
    const content: string = '<div id="container"><canvas id="canvas" /></div><div id="fps"></div><div id="overlay"></div>';
    const root: HTMLElement | null = document.getElementById('root');
    if (root === null) {
        CanvasController.Log.info('Canvas', 'Cant find root node!');
    } else {
        root.innerHTML = content;
    }
}

function adjustCanvasSize() {
    canvas_height = document.getElementById('container').clientHeight;
    canvas_width = document.getElementById('container').clientWidth;
    canvas_instance.height = canvas_height;
    (canvas_instance as any).width = canvas_width;
    // canvas_context.viewport(0, 0, canvas_width, canvas_height);
}


var CanvasControllerInstance: CanvasController = new CanvasController();
export default CanvasControllerInstance;


