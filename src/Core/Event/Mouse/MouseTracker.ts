import {vec2} from "../../Geometry/Vector/vec";

export class MouseTracker {

    static position: vec2 = {x: 0, y: 0};
    static button: boolean[] = [false, false, false, false, false];

    constructor() {

    }

    setUp() {
        const overlay = document.getElementById('overlay');
        if(overlay !== null) {
            overlay.addEventListener('mousemove', (event: MouseEvent) => {
               MouseTracker.position = {
                   x: event.clientX,
                   y: event.clientY
               }
            });
            overlay.addEventListener('mousedown', (event: MouseEvent) => {
                if(event.button === 3 || event.button === 4) {
                    event.preventDefault();
                }
                MouseTracker.button[event.button] = true;
            });
            overlay.addEventListener('mouseup', (event: MouseEvent) => {
                MouseTracker.button[event.button] = false;
                console.log(MouseTracker.button);
            });
            overlay.addEventListener('contextmenu', (event: MouseEvent) => {
                event.preventDefault();
            });
        }
    }


}