import {FrameInfo} from "../Controller/PrivateController/RenderController";

export interface RenderOptions {

    render_texture_precision: number | 'auto' // 512 - 2048

    enable_shadow: boolean
    enable_shadow_blur: boolean
    shadow_texture_precision: number // 128 - 2048

    enable_bloom: boolean
    bloom_blur_precision: number // 1-3

    enable_reflections: boolean
    enable_transparency: boolean
}

export function getRenderOptionsUltra(): RenderOptions {
    return {
        render_texture_precision: 'auto',

        enable_shadow: true,
        enable_shadow_blur: true,
        shadow_texture_precision: 1920,

        enable_bloom: true,
        bloom_blur_precision: 3,

        enable_reflections: true,
        enable_transparency: true
    }
}
export function getRenderOptionsHigh(): RenderOptions {
    return {
        render_texture_precision: 1600,

        enable_shadow: true,
        enable_shadow_blur: false,
        shadow_texture_precision: 1024,

        enable_bloom: true,
        bloom_blur_precision: 2,

        enable_reflections: true,
        enable_transparency: true
    }
}
export function getRenderOptionsMedium(): RenderOptions {
    return {
        render_texture_precision: 1377,

        enable_shadow: true,
        enable_shadow_blur: false,
        shadow_texture_precision: 512,

        enable_bloom: true,
        bloom_blur_precision: 2,

        enable_reflections: true,
        enable_transparency: false
    }
}
export function getRenderOptionsLow(): RenderOptions {
    return {
        render_texture_precision: 1024,

        enable_shadow: false,
        enable_shadow_blur: false,
        shadow_texture_precision: 1,

        enable_bloom: false,
        bloom_blur_precision: 0,

        enable_reflections: false,
        enable_transparency: false
    }
}