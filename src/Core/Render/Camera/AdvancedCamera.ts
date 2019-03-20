import {vec2, vec3} from "../../Geometry/Vector/vec";
import {BaseCamera, Camera} from "./Camera";
import {MouseTracker} from "../../Event/Mouse/MouseTracker";
import {subtractVec2} from "../../Geometry/Vector/subtract";
import {radians} from "../../Geometry/radians";

export class AdvancedCamera extends BaseCamera implements Camera {
    update(time: number) {
        this.freeMovement();
        this.updateMatrices();
    }

    position: vec3 = {x: 0, y: 30, z: 0};

    private last_mouse_pos: vec2 = {x: 0, y: 0};
    private last_mouse_button_primary: boolean = false;
    private last_mouse_button_wheelpress: boolean = false;
    private last_mouse_button_secondary: boolean = false;

    protected freeMovement() {
        const delta: vec2 = subtractVec2(this.last_mouse_pos, MouseTracker.position);
        if(delta.x != 0 || delta.y != 0) {
            if(this.last_mouse_button_primary && MouseTracker.button[0]) {
                // primary drag!
                this.primaryButtonMovementDrag(delta);
            }
            if(this.last_mouse_button_wheelpress && MouseTracker.button[1]) {
                // wheel press!
                this.wheelButtonMovementDrag(delta);
            }
            if(this.last_mouse_button_secondary && MouseTracker.button[2]) {
                // Secondary Button
                this.secondaryButtonMovementDrag(delta);
            }
            const roundRad = radians(this.round_rotation_pos);
            const verticRad = radians(this.vertical_rotation_pos);
            this.position = {
                x: Math.cos(roundRad) * this.distance * Math.sin(verticRad),
                y: -Math.cos(verticRad) * this.distance,
                z: Math.sin(roundRad) * this.distance * Math.sin(verticRad),
            }
        }
        this.last_mouse_button_primary = MouseTracker.button[0];
        this.last_mouse_button_wheelpress = MouseTracker.button[1];
        this.last_mouse_button_secondary = MouseTracker.button[2];
        this.last_mouse_pos = {x: MouseTracker.position.x, y: MouseTracker.position.y};
    }

    protected deadEndDegrees: number = 10;
    protected moveSpeed: number = 0.3;

    private distance: number = 50;
    private round_rotation_pos: number = 45;
    private vertical_rotation_pos: number = 130;

    private primaryButtonMovementDrag(delta: vec2) {
        this.round_rotation_pos = (this.round_rotation_pos - delta.x * this.moveSpeed) % 360;
        this.vertical_rotation_pos -= delta.y * this.moveSpeed;
        this.vertical_rotation_pos = Math.min(Math.max(this.vertical_rotation_pos, this.deadEndDegrees), 180 - this.deadEndDegrees);
        console.log('perform left click drag');
    }
    private wheelButtonMovementDrag(delta: vec2) {
        console.log('perform wheel click drag');
    }
    private secondaryButtonMovementDrag(delta: vec2) {
        console.log('perform right click drag');
    }
}