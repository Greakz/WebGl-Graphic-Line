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
    vNormal = vec3(model_matrix * mesh_matrix * vec4(VertexNormals, 0.0));
    vPosition = world_pos.xyz;
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
flat in float vShininess;
flat in float vTransparency;
flat in int vUseCol;

uniform float near_plane;
uniform float far_plane;
uniform vec3 camera_position;

uniform sampler2D albedo_texture;
uniform sampler2D specular_texture;

uniform sampler2D position_map;
uniform sampler2D t_position_map;

struct DayLight {
    vec4 direction;
    vec3 color;
    vec3 amb_factor;
    vec3 diff_factor;
    vec3 spec_factor;
};

uniform lights {
    vec4 same_space_as_d_pass;
    DayLight daylight;
    DayLight daylight2;
};

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

float linearizeDepth(float depth)
{
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

vec3 calculateDaylight( DayLight process_daylight,
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

void main(void) {
    vec2 tex_position = (gl_FragCoord.xy / vec2(textureSize(position_map, 0).xy));

    float back_depth = texture(position_map, tex_position).r;
    float front_depth = texture(t_position_map, tex_position).r;

    float linearizedDepth = linearizeDepth(gl_FragCoord.z) / far_plane;  // convert to linear values
    if(front_depth > 0.0 && front_depth < 1.0 && linearizedDepth < front_depth) {
        // discard;
    }
    if(back_depth > 0.0 && back_depth < 1.0 && linearizedDepth > back_depth) {
        outColor =  vec4(0.0, 0.0, 0.0, 1.0);
    } else {

        vec3 base_diff_color = calculateColor(texture(albedo_texture, vTexPos).rgb, vColor, vUseCol).rgb;
        vec3 base_spec_color = calculateColor(texture(specular_texture, vTexPos).rgb, vSpecular, vUseCol).rgb;

        // DAYLIGHT BALANCE
        float daylight_balance = daylight2.direction.w;
        // VIEWDIR + REFLECTIONS SOLID
        vec3 view_to_frag_n = normalize(camera_position - vPosition.xyz);
        // vec3 reflection_result = calculateReflection(view_to_frag_n, world_space_normal, fragment_reflective_intensity);

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

        // CALC SOME LIGHT SHIT
        vec3 final_color = final_daylight_color;
        outColor =  vec4(final_color, vTransparency);
    }



}