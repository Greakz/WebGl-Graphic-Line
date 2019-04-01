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
    vec4 albedo_color; // use a component fot reflectiveness todo!
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
flat out float vTransparency;
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
    vColor = albedo_color.rgb;
    vSpecular = specular_color.rgb;
    vReflection = specular_color.a;
    vTransparency = albedo_color.a;
    vShininess = shininess;
    vNormal = normalize(vec3(model_matrix * mesh_matrix * vec4(VertexNormals, 0.0)));
    vPosition = world_pos.xyz;
    vUseCol = (useTex > 0.5 && useColor > 0.5) ? 1 : (useColor > 0.5) ? 2 : (useTex > 0.5) ? 3 : 0;
}
//#FRAGMENT-SHADER#//
#version 300 es
precision mediump float;
#define NR_LIGHTS_PER_PACK 64
const float SHADOW_BIAS = 0.003;

in vec3 vColor;
in vec3 vSpecular;
in vec2 vTexPos;
in vec3 vNormal;
in vec3 vPosition;
flat in float vShininess;
flat in float vTransparency;
flat in float vReflection;
flat in int vUseCol;

uniform float near_plane;
uniform float far_plane;
uniform vec3 camera_position;

uniform sampler2D albedo_texture;
uniform sampler2D specular_texture;

uniform sampler2D position_map;
uniform samplerCube reflection_cubemap;

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

layout(location = 0) out vec4 outColor;
layout(location = 1) out vec4 outTransparency;

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

vec3 calculateDiffuseLight(in vec3 surface_normal_unit, in vec3 mat_diff, in vec3 light_dir_unit, in vec3 light_color, in vec3 diff_factor) {
    float diff_strength = max(dot(light_dir_unit, surface_normal_unit), 0.0);
    return vec3(diff_strength) * light_color * mat_diff * diff_factor;
}

vec3 calculateSpecularLight(in vec3 surface_normal_unit, in vec3 mat_spec, in vec3 view_dir, in vec3 light_dir_unit, in vec3 light_color, in vec3 spec_factor, float mat_shininess) {
    vec3 reflect_dir = reflect(-light_dir_unit, surface_normal_unit);
    float spec_strenght = pow(max(dot(view_dir, reflect_dir), 0.0), mat_shininess * 128.0);
    return vec3(spec_strenght) * light_color * mat_spec * spec_factor;
}

vec3 calculateOmniLight(in OmniLight omni_light,
                        in vec3 frag_world_normal,
                        in vec3 frag_world_position,
                        in vec3 view_to_frag_n,
                        in vec3 frag_diff,
                        in vec3 frag_spec,
                        float frag_shini) {
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

vec3 calculateSpotLight(in SpotLight spot_light,
                        in vec3 frag_world_normal,
                        in vec3 frag_world_position,
                        in vec3 view_to_frag_n,
                        in vec3 frag_diff,
                        in vec3 frag_spec,
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

vec3 calculateDaylight(in DayLight process_daylight,
                        float daylight_factor,
                        in vec3 frag_world_normal,
                        in vec3 view_to_frag_n,
                        in vec3 frag_diff,
                        in vec3 frag_spec,
                        float frag_shini) {
    vec3 frag_to_daylight_n = normalize(-process_daylight.direction.xyz);
    vec3 dir_amb_light_res = process_daylight.color * process_daylight.amb_factor * frag_diff;
    vec3 dir_diff_light_res = calculateDiffuseLight(frag_world_normal, frag_diff, frag_to_daylight_n, process_daylight.color, process_daylight.diff_factor);
    vec3 dir_spec_light_res = calculateSpecularLight(frag_world_normal, frag_spec, view_to_frag_n, frag_to_daylight_n, process_daylight.color, process_daylight.spec_factor, frag_shini);
    return (dir_amb_light_res + dir_diff_light_res + dir_spec_light_res) * vec3(daylight_factor);
}

vec3 calculateReflection(in vec3 view_to_frag_n, in vec3 world_normal, float intensity) {
    // if it doesnt need to get calced...
    if(intensity <= 0.0) { return vec3(0.0); }
    // calc Reflection

    vec3 skybox_reflect_dir = reflect(view_to_frag_n, normalize(world_normal));
    vec3 readout_reflect_map = vec3(skybox_reflect_dir.x, -1.0 * skybox_reflect_dir.y, skybox_reflect_dir.z);
    vec3 skybox_reflection_res = texture(reflection_cubemap, readout_reflect_map).rgb; // * vec3(intensity);
    return skybox_reflection_res * intensity;
}

void main(void) {
    vec2 tex_position = (gl_FragCoord.xy / vec2(textureSize(position_map, 0).xy));

    float back_depth = texture(position_map, tex_position).r;

    float linearizedDepth = linearizeDepth(gl_FragCoord.z) / far_plane;  // convert to linear values
    if(back_depth > 0.0 && back_depth < 1.0 && linearizedDepth > back_depth) {
        discard;
    } else {
        // DAYLIGHT BALANCE
        float daylight_balance = daylight2.direction.w;
        // VIEWDIR + REFLECTIONS SOLID
        vec3 view_to_frag_n = normalize(camera_position - vPosition.xyz);
        // vec3 reflection_result = calculateReflection(view_to_frag_n, world_space_normal, fragment_reflective_intensity);

        vec3 base_diff_color = calculateColor(texture(albedo_texture, vTexPos).rgb, vColor, vUseCol).rgb;
        vec3 base_spec_color = calculateColor(texture(specular_texture, vTexPos).rgb, vSpecular, vUseCol).rgb;
        vec3 reflection_color = calculateReflection(view_to_frag_n, vNormal, vReflection);

        // DAYLIGHT (DIRECTIONAL) FROM SOLID OBJECTS
        vec3 final_daylight_color = vec3(0.0);
        if(daylight_balance < 1.0) {
            final_daylight_color +=
            calculateDaylight(daylight, 1.0 - daylight_balance, normalize(vNormal), view_to_frag_n, base_diff_color, base_spec_color, vShininess);
        }
        if(daylight_balance > 0.0) {
            final_daylight_color +=
            calculateDaylight(daylight2, daylight_balance, normalize(vNormal), view_to_frag_n, base_diff_color, base_spec_color, vShininess);
        }


        // OMNI + SPOT LIGHTS
        int omni_block_count = int(omni_spot_blockcount_lastblockcount.x);
        int omni_count_in_last = int(omni_spot_blockcount_lastblockcount.y);
        int spot_block_count = int(omni_spot_blockcount_lastblockcount.z);
        int spot_count_in_last = int(omni_spot_blockcount_lastblockcount.w);

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
                                vNormal,
                                vPosition,
                                view_to_frag_n,
                                base_diff_color,
                                base_spec_color,
                                vShininess
                            );
                        break;
                        case 2:
                        current_omni_light = omni_lights2[i];
                        omni_light_result +=
                            calculateOmniLight(
                                current_omni_light,
                                vNormal,
                                vPosition,
                                view_to_frag_n,
                                base_diff_color,
                                base_spec_color,
                                vShininess
                            );
                        break;
                        case 3:
                        current_omni_light = omni_lights3[i];
                        omni_light_result +=
                            calculateOmniLight(
                                current_omni_light,
                                vNormal,
                                vPosition,
                                view_to_frag_n,
                                base_diff_color,
                                base_spec_color,
                                vShininess
                            );
                        break;
                        case 4:
                        current_omni_light = omni_lights4[i];
                        omni_light_result +=
                            calculateOmniLight(
                                current_omni_light,
                                vNormal,
                                vPosition,
                                view_to_frag_n,
                                base_diff_color,
                                base_spec_color,
                                vShininess
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
                                vNormal,
                                vPosition,
                                view_to_frag_n,
                                base_diff_color,
                                base_spec_color,
                                vShininess
                            );
                        break;
                        case 2:
                        current_spot_light = spot_lights2[i];
                        spot_light_result +=
                            calculateSpotLight(
                                current_spot_light,
                                vNormal,
                                vPosition,
                                view_to_frag_n,
                                base_diff_color,
                                base_spec_color,
                                vShininess
                            );
                        break;
                        case 3:
                        current_spot_light = spot_lights3[i];
                        spot_light_result +=
                            calculateSpotLight(
                                current_spot_light,
                                vNormal,
                                vPosition,
                                view_to_frag_n,
                                base_diff_color,
                                base_spec_color,
                                vShininess
                            );
                        break;
                        case 4:
                        current_spot_light = spot_lights4[i];
                        spot_light_result +=
                            calculateSpotLight(
                                current_spot_light,
                                vNormal,
                                vPosition,
                                view_to_frag_n,
                                base_diff_color,
                                base_spec_color,
                                vShininess
                            );
                        break;
                        default:
                        break;
                    }
                }
            }
        }

        // CALC SOME LIGHT SHIT
        vec3 light_result = final_daylight_color + omni_light_result + spot_light_result;
        // vec3 light_result = final_daylight_color + omni_light_result + spot_light_result;
        if(vReflection > 0.0) {
            light_result = light_result * vec3(1.0 - vReflection) + reflection_color;
        }

        outColor =  vec4(light_result, vTransparency);
        outTransparency =  vec4(vTransparency, 0.0, 0.0, vTransparency);
    }



}