// actual file

import LogInstance, {LogInterface} from "../../Util/LogInstance";
import {MainController} from "../../Controller/MainController";

export abstract class ShaderLoader {
    static Log : LogInterface = LogInstance;

    static buildShader(id: string): WebGLProgram {
        let rawFile = new XMLHttpRequest();
        rawFile.open(
            'GET',
            '/Shader/' + id + '.glsl',
            false
        );
        let shader: WebGLProgram;
        ShaderLoader.Log.info('ShaderLoader', 'Read in Shader: ' + id + '.glsl');
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4) {
                if (rawFile.status === 200 || rawFile.status == 0) {
                    let allText = rawFile.responseText;

                    shader = ShaderLoaderUtil.parseShader(id, allText);

                } else {
                    ShaderLoader.Log.info('ShaderLoader', 'Could not load Shader into Dom: ' + id)
                }
            } else {
                ShaderLoader.Log.info('ShaderLoader', 'Could not load Shader into Dom: ' + id)
            }
        };
        rawFile.send(null);
        return shader;
    }
}


abstract class ShaderLoaderUtil {

    static parseShader(id: string,
                       source: string): WebGLProgram {
        let vertexParsed = source.split('//#VERTEX-SHADER#//');
        let vertexSource = vertexParsed[1];
        let fragSource = '';
        let fragParsed = vertexSource.split('//#FRAGMENT-SHADER#//');
        if (fragParsed.length > 1) {
            vertexSource = fragParsed[0];
            fragSource = fragParsed[1];
        } else {
            fragParsed = vertexParsed[0].split('//#FRAGMENT-SHADER#//');
            fragSource = fragParsed[1];
        }
        fragSource = ShaderLoaderUtil.killEmptyLines(fragSource);
        vertexSource = ShaderLoaderUtil.killEmptyLines(vertexSource);
        const vs = ShaderLoaderUtil.buildVertexShaderWithSource(id, vertexSource);
        const fs = ShaderLoaderUtil.buildFragmentShaderWithSource(id, fragSource);
        const compiledProgram = ShaderLoaderUtil.buildShaderProgram(id, vs, fs);
        return compiledProgram
    }

    static killEmptyLines(value: string): string {
        const parts = value.split('\n');
        let result: string = '';
        for(let i = 0; i < parts.length; i++) {
            if(parts[i].trim() !== '') {
                result += parts[i] + '\n';
            }
        }
        return result;
    }

    static buildShaderProgram(id: string, vs_shader: WebGLShader, fs_shader: WebGLShader): WebGLProgram {
        const gl = MainController.CanvasController.getGL();

        let shaderProgram: WebGLProgram = gl.createProgram();
        if (shaderProgram !== null) {
            const compiledProgram = shaderProgram;
            gl.attachShader(compiledProgram, vs_shader);
            gl.attachShader(compiledProgram, fs_shader);
            gl.linkProgram(compiledProgram);
            return compiledProgram;
        } else {
            ShaderLoader.Log.info('ShaderLoader', 'Could not create WebGl-Program: ' + id + '.glsl');
        }
    }

    static buildFragmentShaderWithSource(id: string, source: string): WebGLShader {
        const gl = MainController.CanvasController.getGL();
        let shader: WebGLShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            ShaderLoader.Log.info('ShaderLoader', 'info while compiling Fragment-Shader: ' + id + '.glsl');
            ShaderLoader.Log.info('ShaderLoader', gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }

    static buildVertexShaderWithSource(id: string, source: string): WebGLShader {
        const gl = MainController.CanvasController.getGL();
        let shader: WebGLShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            ShaderLoader.Log.info('ShaderLoader', 'info while compiling Vertex-Shader: ' + id + '.glsl');
            ShaderLoader.Log.info('ShaderLoader', gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }
}