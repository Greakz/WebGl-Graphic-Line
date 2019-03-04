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

vec3 calculateDiffuseLight(vec3 surface_normal_unit, vec3 mat_diff, vec3 light_dir_unit, vec3 light_color) {
    float diff_strength = max(dot(surface_normal_unit, light_dir_unit), 0.0);
    return vec3(diff_strength) * light_color * mat_diff;
}

vec3 calculateSpecularLight(vec3 surface_normal_unit, vec3 mat_spec, vec3 view_dir, vec3 light_dir_unit, vec3 light_color, float mat_shininess) {
    vec3 reflect_dir = reflect(-light_dir_unit, surface_normal_unit);
    float spec_strenght = pow(max(dot(view_dir, reflect_dir), 0.0), 0.1 * 32.0);
    return vec3(spec_strenght) * light_color * mat_spec;
}

void main(void) {
    vec4 world_space_position = undo_view_matrix * undo_projection_matrix * vec4((texture(position_map, vTex).rgb  * vec3(2.0) - vec3(1.0)), 1.0);
    vec3 world_space_normal = normalize(texture(normal_map, vTex).rgb * vec3(2.0) - vec3(1.0));

    vec3 fragment_diffuse_color = texture(albedo_map, vTex).rgb;
    vec3 fragment_specular_intensity = texture(specular_map, vTex).rgb;
    float fragment_shininess_intensity = texture(specular_map, vTex).a;
    // float fragment_reflective_intensity = texture(position_map, vTex).b;

    // float fragment_in_daylight_shadow = texture(specular_map. vTex).b;
    // float custom_stencil_value = texture(position_map, vTex).g;



    // DAYLIGHT (DIRECTIONAL)
    vec3 view_dir = normalize(camera_position - world_space_position.xyz);
    vec3 dir_light_dir_unit = normalize(-dir_direction);
    vec3 dir_amb_light_res = amb_color * fragment_diffuse_color;
    vec3 dir_diff_light_res = calculateDiffuseLight(world_space_normal, fragment_diffuse_color, dir_light_dir_unit, dir_color);
    vec3 dir_spec_light_res = calculateSpecularLight(world_space_normal, fragment_specular_intensity, view_dir, dir_light_dir_unit, dir_color, fragment_shininess_intensity);
    vec3 final_daylight_color = dir_amb_light_res + dir_diff_light_res+ dir_spec_light_res;

    // outColor = vec4(normalize(texture(normal_map, vTex).rgb), 1.0);

    outColor = vec4(final_daylight_color, 1.0);
}