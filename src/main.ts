import LogInstance, {LogInterface} from "./Core/Util/LogInstance";
import {MainController} from "./Core/Controller/MainController";
import {BasicScene} from "./Main/BasicScene/BasicScene";

document.addEventListener('DOMContentLoaded', () => {
    const Log: LogInterface = LogInstance;
    Log.set_show_logs(true);
    Log.info('main', 'Starting the application...!')

    MainController.startApplication();
    /* CREATE YOUR SCENE */
    const scene: BasicScene = new BasicScene();

    // add scene to SceneController
    MainController.SceneController.setScene(scene);
});
