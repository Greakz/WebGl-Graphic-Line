import {Mesh} from "../../Render/Resource/Mesh/Mesh";
import {Material} from "../../Render/Resource/Material/Material";
import {Texture} from "../../Render/Resource/Texture/Texture";
import {Image} from "../../Render/Resource/Image/Image";
import {MainController} from "../MainController";
import {LogInterface} from "../../Util/LogInstance";
import LogInstance from "../../Util/LogInstance";

export interface ResourceControllerInterface {
    getMesh: <T extends Mesh>(mesh: T) => T;
    getMaterial: <T extends Material>(material: T) => T;
    getTexture: <T extends Texture>(texture: T) => T;
    getImage: <T extends Image>(image: T) => T;
}

class ResourceController implements ResourceControllerInterface {
    private static readonly Log: LogInterface = LogInstance;
    constructor(){}

    private instanced_resources: {
        meshes: {
            [key: string]: Mesh
        },
        materials: {
            [key: string]: Material
        },
        textures: {
            [key: string]: Texture
        },
        images: {
            [key: string]: Image
        }
    } = {
        meshes: {},
        materials: {},
        textures: {},
        images: {}
    };

    getMesh<T extends Mesh>(mesh: T): T {
        if(this.instanced_resources.meshes.hasOwnProperty(mesh.resource_id)) {
            const foundMesh: Mesh = this.instanced_resources.meshes[mesh.resource_id];
            // make sure they are from the same class!
            if(foundMesh.constructor === mesh.constructor) {
                return (foundMesh as T);
            } else {
                console.log(foundMesh.resource_id, mesh.resource_id)
            }
        } else {
            mesh.load(
                MainController.CanvasController.getGL(),
                MainController.ShaderController.getGeometryShader(),
                MainController.ShaderController.getGeometryShader(),
            );
            this.instanced_resources.meshes[mesh.resource_id] = mesh;
            return mesh;
        }
        throw Error('The requested Mesh with id ' + mesh.resource_id + ' was' +
            ' not from the same Type as the stored Mesh on this Key!');
    }

    getMaterial<T extends Material>(material: T): T {
        if(this.instanced_resources.materials.hasOwnProperty(material.resource_id)) {
            const foundMaterial: Material = this.instanced_resources.materials[material.resource_id];
            // make sure they are from the same class!
            if(foundMaterial.constructor === material.constructor) {
                return (foundMaterial as T);
            }
        } else {
            material.load(MainController.CanvasController.getGL());
            this.instanced_resources.materials[material.resource_id] = material;
            return material;
        }
        throw Error('The requested Material with id ' + material.resource_id + ' was' +
            ' not from the same Type as the stored Material on this Key!');
    }

    getTexture<T extends Texture>(texture: T): T {
        if(this.instanced_resources.textures.hasOwnProperty(texture.resource_id)) {
            const foundTexture: Texture = this.instanced_resources.textures[texture.resource_id];
            // make sure they are from the same class!
            if(foundTexture.constructor === texture.constructor) {
                return (foundTexture as T);
            }
        } else {
            texture.load(MainController.CanvasController.getGL());
            this.instanced_resources.textures[texture.resource_id] = texture;
            return texture;
        }
        throw Error('The requested Texture with id ' + texture.resource_id + ' was' +
            ' not from the same Type as the stored Texture on this Key!');
    }

    getImage<T extends Image>(image: T): T {
        if(this.instanced_resources.images.hasOwnProperty(image.resource_id)) {
            const foundImage: Image = this.instanced_resources.images[image.resource_id];
            // make sure they are from the same class!
            if(foundImage.constructor === image.constructor) {
                return (foundImage as T);
            }
        } else {
            image.load(MainController.CanvasController.getGL());
            this.instanced_resources.images[image.resource_id] = image;
            return image;
        }
        throw Error('The requested Image with id ' + image.resource_id + ' was' +
            ' not from the same Type as the stored Image on this Key!');
    }
}

var ResourceControllerInstance: ResourceControllerInterface = new ResourceController();
export default ResourceControllerInstance;

