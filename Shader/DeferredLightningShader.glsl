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

// material data
uniform vec3 amb_color;
uniform vec3 dir_color;
uniform vec3 dir_direction;

uniform mat4 undo_projection_matrix;
uniform mat4 undo_view_matrix;
uniform vec3 camera_position;

uniform sampler2D albedo_map;
uniform sampler2D specular_map;
uniform sampler2D position_map;
uniform sampler2D normal_map;

layout(location = 0) out vec4 outColor;

void main(void) {
    vec4 world_space_position = undo_view_matrix * undo_projection_matrix * vec4(gl_FragCoord.x, gl_FragCoord.y, texture(position_map, vTex).r, 1.0);
    vec3 world_space_normal = texture(normal_map, vTex).rgb * vec3(2.0) - vec3(1.0);

    vec3 fragment_diffuse_color = texture(albedo_map, vTex).rgb;
    float fragment_specular_intensity = texture(specular_map, vTex).r;
    float fragment_shininess_intensity = texture(specular_map, vTex).g;
    // float fragment_reflective_intensity = texture(position_map, vTex).b;

    // float fragment_in_daylight_shadow = texture(specular_map. vTex).b;
    float custom_stencil_value = texture(position_map, vTex).g;

    // directional light from daylight
    vec3 surface_normal_unit = normalize(world_space_normal);
    float diff_strength = max(dot(surface_normal_unit, dir_direction), 0.0);
    vec3 diff_light_result = vec3(diff_strength) * fragment_diffuse_color * dir_color;
    vec3 amb_light_result = fragment_diffuse_color * amb_color;

    vec3 multnoprobshit = vec3(0.0) * (camera_position + amb_color + dir_color + diff_light_result + amb_light_result);

    outColor = vec4(diff_light_result + amb_light_result, 1.0);
    //outColor = vec4(fragment_diffuse_color + multnoprobshit, 1.0);
}