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
    vec3 albedo_color; // use a component fot reflectiveness todo!
    vec4 specular_color; // use a component for transparancy
    vec4 shini_ucolor_utex;
};

// Camera Matrices
uniform mat4 view_matrix;
uniform mat4 projection_matrix;

out vec3 vColor;
out vec3 vSpecular;
out vec2 vTexPos;
out vec3 vNormal;
out vec3 vPosition;
out float vFragDepth;
flat out float vShininess;
flat out float vReflection;
flat out int vUseCol;

void main(void) {

    // Depearse shit
    float shininess = shini_ucolor_utex.x;
    float useColor = shini_ucolor_utex.y;
    float useTex = shini_ucolor_utex.z;
    float passTask = shini_ucolor_utex.w;

    // calc world and screen space pos
    vec4 world_pos =  model_matrix * mesh_matrix * vec4(VertexPosition, 1.0);
    vec4 screen_pos = projection_matrix * view_matrix * world_pos;
    gl_Position = screen_pos;

    // Perform Z-Linearization

    // give relevant data to fragment shader
    vTexPos = TexturePosition;
    vColor = albedo_color;
    vSpecular = specular_color.rgb;
    vReflection = specular_color.a;
    vShininess = shininess;
    vNormal = vec3(model_matrix * mesh_matrix * vec4(VertexNormals, 0.0));
    vPosition = world_pos.xyz;
    vFragDepth = screen_pos.z;
    vUseCol = (useTex > 0.5 && useColor > 0.5) ? 1 : (useColor > 0.5) ? 2 : (useTex > 0.5) ? 3 : 0;
}
//#FRAGMENT-SHADER#//
#version 300 es
precision mediump float;
in vec3 vColor;
in vec3 vSpecular;
in vec2 vTexPos;
in vec3 vNormal;
in vec3 vPosition;
in float vFragDepth;
flat in float vShininess;
flat in float vReflection;
flat in int vUseCol;

uniform float near_plane;
uniform float far_plane;

uniform sampler2D albedo_texture;
uniform sampler2D specular_texture;

layout(location = 0) out vec4 outPosition;
layout(location = 1) out vec4 outNormal;
layout(location = 2) out vec4 outAlbedo;
layout(location = 3) out vec4 outSpecular;
layout(location = 4) out vec4 outMaterial;

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

float linearizeDepth(float depth)
{
    float z = depth * 2.0 - 1.0; // back to NDC
    return (2.0 * near_plane * far_plane) / (far_plane + near_plane - z * (far_plane - near_plane));
}

void main(void) {
    float linearizedDepth = linearizeDepth(gl_FragCoord.z) / far_plane;  // convert to linear values
    outPosition = vec4(vPosition, linearizedDepth);
    outNormal = vec4(vNormal, 1.0);
    outAlbedo =  vec4(calculateColor(texture(albedo_texture, vTexPos).rgb, vColor, vUseCol).rgb, 1.0);
    outSpecular = vec4(calculateColor(texture(specular_texture, vTexPos).rgb, vSpecular, vUseCol).rgb, 1.0);
    outMaterial = vec4(vShininess, vReflection, 0.0, 1.0);
}