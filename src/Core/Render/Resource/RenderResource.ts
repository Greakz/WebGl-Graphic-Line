export interface RenderResource {
    readonly resource_type: 'mesh' | 'material' | 'texture' | 'image'
    readonly resource_id: string
}