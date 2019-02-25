import {SingleBufferMesh} from "../../../../Core/Render/Resource/Mesh/SingleBufferMesh";

export class PlaneMesh extends SingleBufferMesh {
    public readonly resource_type: 'mesh';
    public readonly resource_id: string = 'plane-mesh';
    public readonly draw_count: number = 6;

    readonly vertices: number[] = [
        // Position         // Normals          //Textures
        -0.5, 0.0, -0.5,    0.0, 1.0, 0.0,      0.0, 0.0,
        -0.5, 0.0, 0.5,     0.0, 1.0, 0.0,      1.0, 0.0,
        0.5,  0.0, 0.5,     0.0, 1.0, 0.0,      1.0, 1.0,
        -0.5, 0.0, -0.5,    0.0, 1.0, 0.0,      0.0, 0.0,
        0.5,  0.0, 0.5,     0.0, 1.0, 0.0,      1.0, 1.0,
        0.5,  0.0, -0.5,    0.0, 1.0, 0.0,      0.0, 1.0,
    ];
}