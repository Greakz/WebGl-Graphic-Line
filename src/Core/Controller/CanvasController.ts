import LogInstance, {LogInterface} from "../Util/LogInstance";

export interface CanvasControllerInterface {
    getGL: () => WebGL2RenderingContext;
    init(): void;
}

var canvas_instance: HTMLCanvasElement;
var canvas_context: WebGL2RenderingContext;

class CanvasController implements CanvasControllerInterface{

    static readonly Log: LogInterface = LogInstance;

    constructor(){}

    init() {
        initDom();
        canvas_instance = (document.querySelector('#canvas') as HTMLCanvasElement);
        canvas_context = canvas_instance.getContext('webgl2') as WebGL2RenderingContext;
        window.addEventListener('resize', () => adjustCanvasSize());
        adjustCanvasSize();
        // Mouse.init();
        CanvasController.Log.info('Canvas', 'Initialised Successfully...');
    }

    getGL(): WebGL2RenderingContext {
        return canvas_context;
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
    const newHeight = document.getElementById('container').clientHeight;
    const newWidth = document.getElementById('container').clientWidth;
    canvas_instance.height = newHeight;
    (canvas_instance as any).width = newWidth;
    canvas_context.viewport(0, 0, newWidth, newHeight);
}


var CanvasControllerInstance: CanvasController = new CanvasController();
export default CanvasControllerInstance;


