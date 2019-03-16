//#VERTEX-SHADER#//
#version 300 es
// mesh Data
layout(location = 0) in vec3 VertexPosition;
layout(location = 1) in vec2 TexturePosition;

out vec2 vTex;

void main(void) {
    // position!
    gl_Position = vec4(VertexPosition, 1.0);
    vTex = TexturePosition;
}
//#FRAGMENT-SHADER#//
#version 300 es
precision mediump float;
in vec2 vTex;

uniform sampler2D scene_result;
uniform sampler2D brightness_result;

uniform sampler2D position_map;

uniform sampler2D skybox;
// uniform sampler2D codiertemapblamitstencilinfos;

// output
layout(location = 0) out vec4 outColor;

void main(void) {
    vec3 scene_pixel = texture(scene_result, vTex).rgb;
    float pixel_depth = texture(position_map, vTex).w;
    vec3 brightness_pixel = texture(brightness_result, vTex).rgb;

    vec3 combine_pixel = vec3(0.0);

    if(pixel_depth < 1.0) {
        // use Scene Pixel
        combine_pixel = scene_pixel;
    } else {
        // use Skybox Pixel
        vec3 skymap_pixel = texture(skybox, vTex).rgb;
        combine_pixel = skymap_pixel;
    }
    //vec3 combine_pixel = (getAddedComponents(light_bulb_pixel) == 0) ? light_calc_pixel : light_bulb_pixel;
    combine_pixel = min(max(combine_pixel, vec3(0.0)) + max(brightness_pixel, vec3(0.0)), 1.0);
    outColor = vec4(combine_pixel, 1.0);
}