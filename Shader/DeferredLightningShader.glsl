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
#define NR_LIGHTS_PER_PACK 64
// vertex shader input
in vec2 vTex;

// world space transform
uniform mat4 undo_projection_matrix;
uniform mat4 undo_view_matrix;

// camera data
uniform vec3 camera_position;

// geometry pass data
uniform sampler2D albedo_map;
uniform sampler2D specular_map;
uniform sampler2D position_map;
uniform sampler2D normal_map;
uniform sampler2D material_map;


struct SpotLight {
    vec3 position;
    vec3 direction;
    vec3 cutoff;
    vec3 limit;
    vec3 color;
    vec3 amb_factor;
    vec3 diff_factor;
    vec3 spec_factor;
};


struct OmniLight {
    vec3 position;
    vec3 limit;  
    vec3 color;
    vec3 amb_factor;
    vec3 diff_factor;
    vec3 spec_factor;
};

struct DayLight {
    vec3 direction;
    vec3 color;
    vec3 amb_factor;
    vec3 diff_factor;
    vec3 spec_factor;
};

uniform lights {
    vec4 omni_spot_blockcount_lastblockcount;
    DayLight daylight;

    OmniLight omni_lights1[NR_LIGHTS_PER_PACK];
    OmniLight omni_lights2[NR_LIGHTS_PER_PACK];
    OmniLight omni_lights3[NR_LIGHTS_PER_PACK];
    OmniLight omni_lights4[NR_LIGHTS_PER_PACK];

    SpotLight spot_lights1[NR_LIGHTS_PER_PACK];
    SpotLight spot_lights2[NR_LIGHTS_PER_PACK];
    SpotLight spot_lights3[NR_LIGHTS_PER_PACK];
    SpotLight spot_lights4[NR_LIGHTS_PER_PACK];
};

// output
layout(location = 0) out vec4 outColor;

vec3 calculateDiffuseLight(vec3 surface_normal_unit, vec3 mat_diff, vec3 light_dir_unit, vec3 light_color, vec3 diff_factor) {
    float diff_strength = max(dot(light_dir_unit, surface_normal_unit), 0.0);
    return vec3(diff_strength) * light_color * mat_diff * diff_factor;
}

vec3 calculateSpecularLight(vec3 surface_normal_unit, vec3 mat_spec, vec3 view_dir, vec3 light_dir_unit, vec3 light_color, vec3 spec_factor, float mat_shininess) {
    vec3 reflect_dir = reflect(-light_dir_unit, surface_normal_unit);
    float spec_strenght = pow(max(dot(view_dir, reflect_dir), 0.0), mat_shininess * 128.0);
    return vec3(spec_strenght) * light_color * mat_spec * spec_factor;
}

vec3 calculateOmniLight(
    OmniLight omni_light,
    vec3 frag_world_normal,
    vec3 frag_world_position,
    vec3 view_to_frag_n,
    vec3 frag_diff,
    vec3 frag_spec,
    float frag_shini
) {
    float point_distance = length(omni_light.position - frag_world_position);
    vec3 attenuation_factor = vec3((1.0 / (omni_light.limit.x + (omni_light.limit.y * point_distance) + (omni_light.limit.z * (point_distance * point_distance)))));
    vec3 light_direction = normalize(omni_light.position - frag_world_position);
    // if(attenuation_factor.x < 0.001) {
    //     return vec3(0.0);
    // }
    vec3 result = vec3(0.0);
    // result += omni_light.color * omni_light.amb_factor * frag_diff;
    result += calculateDiffuseLight(frag_world_normal, frag_diff, light_direction, omni_light.color, omni_light.diff_factor);
    result += calculateSpecularLight(frag_world_normal, frag_spec, view_to_frag_n, light_direction, omni_light.color, omni_light.spec_factor, frag_shini);
    return result * attenuation_factor;
}

void main(void) {
    vec3 world_space_position = texture(position_map, vTex).rgb;
    vec3 world_space_normal = normalize(texture(normal_map, vTex).rgb);

    vec3 fragment_diffuse_color = texture(albedo_map, vTex).rgb;
    vec3 fragment_specular_color = texture(specular_map, vTex).rgb;
    float fragment_shininess_intensity = texture(material_map, vTex).r;
    // float fragment_reflective_intensity = texture(position_map, vTex).b;

    // float fragment_in_daylight_shadow = texture(specular_map. vTex).b;
    // float custom_stencil_value = texture(position_map, vTex).g;

    // VIEWDIR TP FRAGMEMT
    vec3 view_to_frag_n = normalize(camera_position - world_space_position.xyz);

    // DAYLIGHT (DIRECTIONAL)
    vec3 frag_to_daylight_n = normalize(-daylight.direction);
    vec3 dir_amb_light_res = daylight.color * daylight.amb_factor * fragment_diffuse_color;
    vec3 dir_diff_light_res = calculateDiffuseLight(world_space_normal, fragment_diffuse_color, frag_to_daylight_n, daylight.color, daylight.diff_factor);
    vec3 dir_spec_light_res = calculateSpecularLight(world_space_normal, fragment_specular_color, view_to_frag_n, frag_to_daylight_n, daylight.color, daylight.spec_factor, fragment_shininess_intensity);
    vec3 final_daylight_color = dir_amb_light_res + dir_diff_light_res + dir_spec_light_res;

    // OMNI AND SPOT LIGHT SETTINGS
    int omni_block_count = int(omni_spot_blockcount_lastblockcount.x);
    int omni_count_in_last = int(omni_spot_blockcount_lastblockcount.y);
    int spot_block_count = int(omni_spot_blockcount_lastblockcount.z);
    int spot_count_in_last = int(omni_spot_blockcount_lastblockcount.w);

    // CALCULATE OMNI LIGHT
    // Do this stuff inline because its fast as fuck boii
    vec3 omni_light_result = vec3(0.0);
    for(int block_number = 1; block_number <= omni_block_count; block_number++) {
        if(omni_block_count >= block_number) {
            int calc_omni_lights_count = (omni_block_count == block_number) ? omni_count_in_last : NR_LIGHTS_PER_PACK;
            for(int i = 0; i < calc_omni_lights_count; i++) {
                OmniLight current_omni_light;
                switch(block_number) {
                    case 1:
                        current_omni_light = omni_lights1[i];
                        omni_light_result +=
                            calculateOmniLight(
                                current_omni_light,
                                world_space_normal.xyz,
                                world_space_position.xyz,
                                view_to_frag_n,
                                fragment_diffuse_color,
                                fragment_specular_color,
                                fragment_shininess_intensity
                            );
                        break;
                    case 2:
                        current_omni_light = omni_lights2[i];
                        omni_light_result +=
                            calculateOmniLight(
                                current_omni_light,
                                world_space_normal.xyz,
                                world_space_position.xyz,
                                view_to_frag_n,
                                fragment_diffuse_color,
                                fragment_specular_color,
                                fragment_shininess_intensity
                            );
                        break;
                    case 3:
                        current_omni_light = omni_lights3[i];
                        omni_light_result +=
                            calculateOmniLight(
                                current_omni_light,
                                world_space_normal.xyz,
                                world_space_position.xyz,
                                view_to_frag_n,
                                fragment_diffuse_color,
                                fragment_specular_color,
                                fragment_shininess_intensity
                            );
                        break;
                    default:
                        break;
                }
            }
        }
    }
    outColor = vec4(omni_light_result, 1.0);
}