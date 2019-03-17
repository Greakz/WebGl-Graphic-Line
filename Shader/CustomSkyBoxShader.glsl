//#VERTEX-SHADER#//
#version 300 es
layout (location = 0) in vec3 VertexPosition;

uniform mat4 model_matrix;
uniform mat4 view_matrix_left;
uniform mat4 view_matrix_right;
uniform mat4 view_matrix_top;
uniform mat4 view_matrix_bottom;
uniform mat4 view_matrix_back;
uniform mat4 view_matrix_front;
uniform mat4 projection_matrix;

out vec3 vTexCoordsLeft;
out vec3 vTexCoordsRight;
out vec3 vTexCoordsTop;
out vec3 vTexCoordsBottom;
out vec3 vTexCoordsBack;
out vec3 vTexCoordsFront;

void main(void) {
    vTexCoordsLeft = vec3(view_matrix_left * vec4(VertexPosition, 1.0));
    vTexCoordsRight = vec3(view_matrix_right * vec4(VertexPosition, 1.0));
    vTexCoordsTop = vec3(view_matrix_top * vec4(VertexPosition, 1.0));
    vTexCoordsBottom = vec3(view_matrix_bottom * vec4(VertexPosition, 1.0));
    vTexCoordsBack = vec3(view_matrix_back * vec4(VertexPosition, 1.0));
    vTexCoordsFront = vec3(view_matrix_front * vec4(VertexPosition, 1.0));

    vec4 pos = projection_matrix * view_matrix_back * model_matrix * vec4(VertexPosition, 1.0);
    gl_Position = pos.xyww;
}

//#FRAGMENT-SHADER#//
#version 300 es
precision mediump float;
in vec3 vTexCoordsLeft;
in vec3 vTexCoordsRight;
in vec3 vTexCoordsTop;
in vec3 vTexCoordsBottom;
in vec3 vTexCoordsBack;
in vec3 vTexCoordsFront;

uniform vec3 daylight1_color;
uniform vec3 daylight2_color;
uniform samplerCube cubemap1;
uniform samplerCube cubemap2;
uniform float balance;

layout(location = 0) out vec4 skybox_right;
layout(location = 1) out vec4 skybox_left;
layout(location = 2) out vec4 skybox_top;
layout(location = 3) out vec4 skybox_bottom;
layout(location = 4) out vec4 skybox_back;
layout(location = 5) out vec4 skybox_front;

vec3 getColor(vec3 vTexCoords, bool swap) {
    vec3 tex = swap ? vec3(vTexCoords.x, -1.0 * vTexCoords.y, vTexCoords.z) : vTexCoords;
    return  texture(cubemap1, tex).rgb * daylight1_color * vec3(1.0 - balance)
    + texture(cubemap2, tex).rgb * daylight2_color * vec3(balance);
}

void main(void) {
    float norm_balance = balance * 0.5 + 0.5;
    skybox_left = vec4(getColor(vTexCoordsLeft, true), 1.0);
    skybox_right = vec4(getColor(vTexCoordsRight, true), 1.0);
    skybox_top = vec4(getColor(vTexCoordsTop, true), 1.0);
    skybox_bottom = vec4(getColor(vTexCoordsBottom, true), 1.0);
    skybox_back = vec4(getColor(vTexCoordsBack, true), 1.0);
    skybox_front = vec4(getColor(vTexCoordsFront, true), 1.0);
}