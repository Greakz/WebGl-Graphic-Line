//#VERTEX-SHADER#//
#version 300 es
// mesh Data
layout(location = 0) in vec3 VertexPosition;
layout(location = 1) in vec3 VertexNormals;
layout(location = 2) in vec2 TexturePosition;


layout(location = 3) in mat4 mesh_matrix;
layout(location = 7) in mat4 model_matrix;

// material data
uniform mat
{
    vec3 albedo_color;
    vec3 specular_color;
    vec4 shini_ucolor_utex;
};

// Camera Matrices
uniform mat4 view_matrix;
uniform mat4 projection_matrix;

out vec3 vColor;
out float vShininess;
out vec2 vTexPos;
flat out int vUseCol;
flat out int vTask;

void main(void) {

    float shininess = shini_ucolor_utex.x;
    float useColor = shini_ucolor_utex.y;
    float useTex = shini_ucolor_utex.z;
    float passTask = shini_ucolor_utex.w;

    // position!
    vec4 resultPos = projection_matrix * view_matrix * model_matrix * mesh_matrix * vec4(VertexPosition, 1.0);
    gl_Position = resultPos;
    vTexPos = TexturePosition;
    vTask =
            (passTask > 3.5) ? 4 : // Normal Pass
            (passTask > 2.5) ? 3 : // Normal Pass
            (passTask > 1.5) ? 2 : // Specular Pass
            (passTask > 0.5) ? 1 : // Albedo Pass
            0;
    vColor = (vTask == 1)
        ? albedo_color
        : (vTask == 2)
            ? specular_color
            : (vTask == 3)
                ? vec3(projection_matrix * view_matrix * model_matrix * mesh_matrix * vec4(VertexNormals, 0.0))
                : vec3(resultPos.rgb);

    vShininess = shininess;
    vUseCol = (useTex > 0.5 && useColor > 0.5) ? 1 : (useColor > 0.5) ? 2 : (useTex > 0.5) ? 3 : 0;




}
//#FRAGMENT-SHADER#//
#version 300 es
precision mediump float;
in vec3 vColor;
in vec2 vTexPos;
in float vShininess;
flat in int vUseCol;
flat in int vTask;

uniform sampler2D albedo_texture;
uniform sampler2D specular_texture;

layout(location = 0) out vec4 outColor;

vec3 calculateColor(vec3 texel, vec3 color, int useCol) {
    if(useCol == 1) {
       return color * texel;
    } else if (useCol == 2) {
       return color;
    } else if (useCol == 3) {
       return texel;
    }
    return vec3(0.0);
}

void main(void) {
    vec3 final_color = vec3(0.0);
    if(vTask == 1) {
        // Albedo Pass
        final_color = calculateColor(texture(albedo_texture, vTexPos).rgb, vColor, vUseCol);
    } else if (vTask == 2) {
        // Specular Pass
        final_color = vec3(calculateColor(texture(specular_texture, vTexPos).rgb, vColor, vUseCol).r, vShininess, 0.0);
   } else if (vTask == 3 || vTask == 4) {
        final_color = vec3(0.5) * normalize(vColor) + vec3(0.5);
    }
    outColor = vec4(final_color, 1.0);
}