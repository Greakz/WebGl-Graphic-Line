export function checkFramebuffer(GL: WebGL2RenderingContext, frameBuffer: WebGLFramebuffer) {
    GL.bindFramebuffer(GL.FRAMEBUFFER, frameBuffer);
    const status = GL.checkFramebufferStatus(GL.FRAMEBUFFER);
    if(status === GL.FRAMEBUFFER_COMPLETE) {
        console.log('FRAMEBUFFER_COMPLETE: The framebuffer is ready to display')
    }else if(status === GL.FRAMEBUFFER_INCOMPLETE_ATTACHMENT) {
        console.log('FRAMEBUFFER_INCOMPLETE_ATTACHMENT: The attachment types are mismatched or not all framebuffer attachment points are framebuffer attachment complete.')
    }else if(status === GL.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT) {
        console.log('FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT: There is no attachment.')
    }else if(status === GL.FRAMEBUFFER_INCOMPLETE_DIMENSIONS) {
        console.log('FRAMEBUFFER_INCOMPLETE_DIMENSIONS: Height and width of the attachment are not the same.')
    }else if(status === GL.FRAMEBUFFER_UNSUPPORTED) {
        console.log('FRAMEBUFFER_UNSUPPORTED: The format of the attachment is not supported or if depth and stencil attachments are not the same renderbuffer.')
    }else if(status === GL.FRAMEBUFFER_INCOMPLETE_MULTISAMPLE || status === GL.RENDERBUFFER_SAMPLES ) {
        console.log('FRAMEBUFFER_INCOMPLETE_MULTISAMPLE / RENDERBUFFER_SAMPLES: The Values of are different among attached renderbuffers, or are non-zero if the attached images are a mix of renderbuffers and textures.')
    } else {
        console.log('Unknown FRAMEBUFFER Error. Could not get any information out of the Status!')

    }

}