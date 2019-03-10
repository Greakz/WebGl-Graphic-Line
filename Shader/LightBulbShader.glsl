//#VERTEX-SHADER#//
#version 300 es
// mesh Data
layout(location = 0) in vec3 VertexPosition;
layout(location = 1) in vec4 BulbColor;
layout(location = 2) in vec3 BulbPosition;

uniform mat4 view_matrix;
uniform mat4 projection_matrix;

out vec4 vColor;

void main(void) {
    mat4 model_matrix = mat4(
        vec4(1.0, 0.0, 0.0, 0.0),
        vec4(0.0, 1.0, 0.0, 0.0),
        vec4(0.0, 0.0, 1.0, 0.0),
        vec4(BulbPosition, 1.0)
       );

    gl_Position = projection_matrix * view_matrix * model_matrix * vec4(VertexPosition, 1.0);
    vColor = BulbColor;
}
//#FRAGMENT-SHADER#//
#version 300 es
precision mediump float;
in vec4 vColor;

uniform float near_plane;
uniform float far_plane;

uniform sampler2D position_map;

layout(location = 0) out vec4 outColor;

float linearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0; // back to NDC
    return (2.0 * near_plane * far_plane) / (far_plane + near_plane - z * (far_plane - near_plane));
}

void main(void) {
    float selfDepth = linearizeDepth(gl_FragCoord.z);
    ivec2 texPos = ivec2(gl_FragCoord.xy);
    float texFetch = texelFetch(position_map, texPos, 0).w;
    float fragmentScreenDepth = linearizeDepth(texFetch);

    if(selfDepth > fragmentScreenDepth) {
        discard;
    }

    outColor = vec4(vec3(1.0), 1.0);
}