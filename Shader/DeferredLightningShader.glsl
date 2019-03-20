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
const float SHADOW_BIAS = 0.003;
// vertex shader input
in vec2 vTex;

// world space transform
uniform mat4 daylight_view_matrix;
uniform mat4 daylight_projection_matrix;

// camera data
uniform vec3 camera_position;

// geometry pass data
uniform sampler2D albedo_map;
uniform sampler2D specular_map;
uniform sampler2D position_map;
uniform sampler2D normal_map;
uniform sampler2D material_map;

uniform sampler2D shadow_map;

// transparancy mainpass data
uniform sampler2D t_transparency_map;
uniform sampler2D t_albedo_blend_map;


struct SpotLight {
    vec4 position;
    vec3 direction;
    vec3 cutoff;
    vec3 limit;
    vec3 color;
    vec3 amb_factor;
    vec3 diff_factor;
    vec3 spec_factor;
};


struct OmniLight {
    vec4 position;
    vec3 limit;
    vec3 color;
    vec3 amb_factor;
    vec3 diff_factor;
    vec3 spec_factor;
};

struct DayLight {
    vec4 direction;
    vec3 color;
    vec3 amb_factor;
    vec3 diff_factor;
    vec3 spec_factor;
};

uniform lights {
    vec4 omni_spot_blockcount_lastblockcount;
    DayLight daylight;
    DayLight daylight2;

    OmniLight omni_lights1[NR_LIGHTS_PER_PACK];
    OmniLight omni_lights2[NR_LIGHTS_PER_PACK];
    OmniLight omni_lights3[NR_LIGHTS_PER_PACK];
    OmniLight omni_lights4[NR_LIGHTS_PER_PACK];

    SpotLight spot_lights1[NR_LIGHTS_PER_PACK];
    SpotLight spot_lights2[NR_LIGHTS_PER_PACK];
    SpotLight spot_lights3[NR_LIGHTS_PER_PACK];
    SpotLight spot_lights4[NR_LIGHTS_PER_PACK];
};

uniform samplerCube reflection_cubemap;

// output
layout(location = 0) out vec4 outColor;

float linearizeDepth(float depth) {
    float near_plane = 0.5;
    float far_plane = 200.0;
    float z = depth * 2.0 - 1.0; // back to NDC
    return (2.0 * near_plane * far_plane) / (far_plane + near_plane - z * (far_plane - near_plane));
}

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
    float point_distance = length(omni_light.position.xyz - frag_world_position);
    if(point_distance > omni_light.position.w) {
        return vec3(0.0);
    }
    vec3 attenuation_factor = vec3((1.0 / (omni_light.limit.x + (omni_light.limit.y * point_distance) + (omni_light.limit.z * (point_distance * point_distance)))));
    vec3 light_direction = normalize(omni_light.position.xyz - frag_world_position);
    // if(attenuation_factor.x < 0.001) {
    //     return vec3(0.0);
    // }
    vec3 result = vec3(0.0);
    // result += omni_light.color * omni_light.amb_factor * frag_diff;
    result += calculateDiffuseLight(frag_world_normal, frag_diff, light_direction, omni_light.color, omni_light.diff_factor);
    result += calculateSpecularLight(frag_world_normal, frag_spec, view_to_frag_n, light_direction, omni_light.color, omni_light.spec_factor, frag_shini);
    return result * attenuation_factor;
}

vec3 calculateSpotLight(SpotLight spot_light,
                        vec3 frag_world_normal,
                        vec3 frag_world_position,
                        vec3 view_to_frag_n,
                        vec3 frag_diff,
                        vec3 frag_spec,
                        float frag_shini) {
    float spot_distance = length(spot_light.position.xyz - frag_world_position);
    if(spot_distance > spot_light.position.w) {
        return vec3(0.0);
    }
    vec3 light_dir_unit = normalize(spot_light.position.xyz - frag_world_position);
    float theta = dot(light_dir_unit, normalize(-spot_light.direction)); // Theta = winkel zum fragementhit vom spotinneren
    if(theta > spot_light.cutoff.y) {
        float epsilon = spot_light.cutoff.x - spot_light.cutoff.y;
        float intensity = clamp((theta - spot_light.cutoff.y) / epsilon, 0.0, 1.0);
        float attenuation = 1.0 / (spot_light.limit.x + spot_light.limit.y * spot_distance + spot_light.limit.z * (spot_distance * spot_distance));

        vec3 result = vec3(0.0);
        // amb could also be calced
        result += vec3(intensity * attenuation) * calculateDiffuseLight(frag_world_normal, frag_diff, light_dir_unit, spot_light.color, spot_light.diff_factor);
        result += vec3(intensity * attenuation) * calculateSpecularLight(frag_world_normal, frag_spec, view_to_frag_n, light_dir_unit, spot_light.color, spot_light.spec_factor, frag_shini);
        return result;
    }
    return vec3(0.0);
}

vec3 calculateDaylight(DayLight process_daylight,
                       float daylight_factor,
                       vec3 frag_world_normal,
                       vec3 view_to_frag_n,
                       vec3 frag_diff,
                       vec3 frag_spec,
                       float frag_shini) {
    vec3 frag_to_daylight_n = normalize(-process_daylight.direction.xyz);
    vec3 dir_amb_light_res = process_daylight.color * process_daylight.amb_factor * frag_diff;
    vec3 dir_diff_light_res = calculateDiffuseLight(frag_world_normal, frag_diff, frag_to_daylight_n, process_daylight.color, process_daylight.diff_factor);
    vec3 dir_spec_light_res = calculateSpecularLight(frag_world_normal, frag_spec, view_to_frag_n, frag_to_daylight_n, process_daylight.color, process_daylight.spec_factor, frag_shini);
    return (dir_amb_light_res + dir_diff_light_res + dir_spec_light_res) * vec3(daylight_factor);
}

float daylightShadowFactor(vec3 world_space_position, float balance) {
    if(balance < 0.5) {
        return 1.0;
    }
    vec4 fragment_daylight_space_res = daylight_projection_matrix * daylight_view_matrix * vec4(world_space_position, 1.0);
    vec3 fragment_daylight_space = fragment_daylight_space_res.xyz;
    fragment_daylight_space = fragment_daylight_space * 0.5 + 0.5;

    ivec2 textureSize = textureSize(shadow_map, 0);
    vec2 texelSize = 1.0 / vec2(float(textureSize.x), float(textureSize.y));

    float shadow = 0.0;
    for(int x = -1; x <= 1; ++x)
    {
        for(int y = -1; y <= 1; ++y)
        {
            float pcfDepth = texture(shadow_map, fragment_daylight_space.xy + vec2(x, y) * texelSize).r;
            float add = x == 0 && y == 0 ? 3.0 : 1.0;
            shadow += fragment_daylight_space.z - SHADOW_BIAS > pcfDepth ? add : 0.0;
        }
    }
    shadow /= 11.0;
    return (1.0 - (shadow * ((balance - 0.5) * 2.0)));
}

vec3 calculateReflection(vec3 view_to_frag_n, vec3 world_normal, float intensity) {
    // if it doesnt need to get calced...
    if(intensity <= 0.0) { return vec3(0.0); }
    // calc Reflection

    vec3 skybox_reflect_dir = reflect(view_to_frag_n, normalize(world_normal));
    vec3 readout_reflect_map = vec3(skybox_reflect_dir.x, -1.0 * skybox_reflect_dir.y, skybox_reflect_dir.z);
    vec3 skybox_reflection_res = texture(reflection_cubemap, readout_reflect_map).rgb; // * vec3(intensity);
    return skybox_reflection_res;
}

void main(void) {
    // FROM SOLID PASS
    vec3 world_space_position = texture(position_map, vTex).rgb;
    vec3 world_space_normal = normalize(texture(normal_map, vTex).rgb);
    vec3 fragment_diffuse_color = texture(albedo_map, vTex).rgb;
    float f_depth = texture(position_map, vTex).a;
    vec3 fragment_specular_color = texture(specular_map, vTex).rgb;
    float fragment_shininess_intensity = texture(material_map, vTex).r;
    float fragment_reflective_intensity = texture(material_map, vTex).g;

    vec3 t_result = texture(t_albedo_blend_map, vTex).rgb;
    float t_transparency = texture(t_transparency_map, vTex).r;

    // DAYLIGHT BALANCE
    float daylight_balance = daylight2.direction.w;

    // VIEWDIR + REFLECTIONS SOLID
    vec3 view_to_frag_n = normalize(camera_position - world_space_position.xyz);
    vec3 reflection_result = calculateReflection(view_to_frag_n, world_space_normal, fragment_reflective_intensity);

    // DAYLIGHT (DIRECTIONAL) FROM SOLID OBJECTS
    vec3 final_daylight_color = vec3(0.0);
    if(daylight_balance < 1.0) {
        final_daylight_color +=
            calculateDaylight(daylight, 1.0 - daylight_balance, world_space_normal, view_to_frag_n, fragment_diffuse_color, fragment_specular_color, fragment_shininess_intensity)
            * daylightShadowFactor(world_space_position, 1.0 - daylight_balance);
    }
    if(daylight_balance > 0.0) {
        final_daylight_color +=
            calculateDaylight(daylight2, daylight_balance, world_space_normal, view_to_frag_n, fragment_diffuse_color, fragment_specular_color, fragment_shininess_intensity)
            * daylightShadowFactor(world_space_position, daylight_balance);
    }

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
                    case 4:
                        current_omni_light = omni_lights4[i];
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

    // CALCULATE SPOT LIGHT
    // Do this stuff inline because its fast as fuck boii
    vec3 spot_light_result = vec3(0.0);
    for(int block_number = 1; block_number <= spot_block_count; block_number++) {
        if(spot_block_count >= block_number) {
            int calc_spot_lights_count = (spot_block_count == block_number) ? spot_count_in_last : NR_LIGHTS_PER_PACK;
            for(int i = 0; i < calc_spot_lights_count; i++) {
                SpotLight current_spot_light;
                switch(block_number) {
                    case 1:
                        current_spot_light = spot_lights1[i];
                        spot_light_result +=
                            calculateSpotLight(
                                current_spot_light,
                                world_space_normal.xyz,
                                world_space_position.xyz,
                                view_to_frag_n,
                                fragment_diffuse_color,
                                fragment_specular_color,
                                fragment_shininess_intensity
                            );
                        break;
                    case 2:
                        current_spot_light = spot_lights2[i];
                        spot_light_result +=
                            calculateSpotLight(
                                current_spot_light,
                                world_space_normal.xyz,
                                world_space_position.xyz,
                                view_to_frag_n,
                                fragment_diffuse_color,
                                fragment_specular_color,
                                fragment_shininess_intensity
                            );
                        break;
                    case 3:
                        current_spot_light = spot_lights3[i];
                        spot_light_result +=
                            calculateSpotLight(
                                current_spot_light,
                                world_space_normal.xyz,
                                world_space_position.xyz,
                                view_to_frag_n,
                                fragment_diffuse_color,
                                fragment_specular_color,
                                fragment_shininess_intensity
                            );
                        break;
                    case 4:
                        current_spot_light = spot_lights4[i];
                        spot_light_result +=
                            calculateSpotLight(
                                current_spot_light,
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

    vec3 light_result = final_daylight_color + omni_light_result + spot_light_result;
    if(fragment_reflective_intensity > 0.0) {
        light_result = fragment_diffuse_color * vec3(1.0 - fragment_reflective_intensity) + reflection_result;
    }

    vec3 final_fragment = vec3(0.0);
    if(fragment_diffuse_color.x > 0.0 || fragment_diffuse_color.y > 0.0 || fragment_diffuse_color.z > 0.0) {
        final_fragment = (vec3(t_transparency) * t_result) + (vec3(1.0 - t_transparency) * light_result);
    } else {
        final_fragment = texture(t_albedo_blend_map, vTex).rgb;
    }

    outColor = vec4(final_fragment, 1.0);
}