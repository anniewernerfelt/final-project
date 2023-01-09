"use strict";

class DirLightRenderer extends Renderer{

    setVertexAttributeArrays(model){
        super.setVertexAttributeArrays(model);

        // TODO: add normal attribute (enable attribute array and setup attribute pointer)
        gl.bindBuffer(gl.ARRAY_BUFFER, model.mesh.normalBuffer);
        let normalAttribLoc = gl.getAttribLocation(this.program, "a_normal");
        gl.enableVertexAttribArray(normalAttribLoc);
        gl.vertexAttribPointer(normalAttribLoc,3,gl.FLOAT,false,0,0);

        gl.bindBuffer(gl.ARRAY_BUFFER, model.mesh.texcoordBuffer);
        let textureAttribLoc = gl.getAttribLocation(this.program, "a_texcoord");
        gl.enableVertexAttribArray(textureAttribLoc);
        gl.vertexAttribPointer(textureAttribLoc,2,gl.FLOAT,false,0,0);
    }

    /**
    * Sets ALL uniforms for the vertex and fragment shader of this renderers shader program before drawing.
    * @param {ModelTransform} model the model to draw.
    * @param {Object} shaderData whatever other data the Shader needs for drawing.
    */
    setUniformData(model, camera, shaderData){
        let viewMatrix = camera.viewMatrix;
        let projectionMatrix = camera.projectionMatrix;

        // set model, view and projection matrices in the vertex shader
        let modelMatrixLoc = gl.getUniformLocation(this.program, "u_matrixM");
        gl.uniformMatrix4fv(modelMatrixLoc, false, model.modelMatrix.toFloat32());
        let viewMatrixLoc = gl.getUniformLocation(this.program, "u_matrixV");
        gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix.toFloat32());
        let projMatrixLoc = gl.getUniformLocation(this.program, "u_matrixP");
        gl.uniformMatrix4fv(projMatrixLoc, false, projectionMatrix.toFloat32());

        // set tint color data
        let colorLoc = gl.getUniformLocation(this.program, "u_tint");
        gl.uniform3fv(colorLoc, model.material.tint.toFloat32());

        // set model inverse transpose to enable lighting calulations using normals
        let invtransLoc = gl.getUniformLocation(this.program, "u_matrixInvTransM");
        gl.uniformMatrix3fv(invtransLoc, false, M4.inverseTranspose3x3(model.modelMatrix).toFloat32());

        // directional and ambient lighting lighting
        let lightDirLoc = gl.getUniformLocation(this.program, "u_directionalLight");
        gl.uniform3fv(lightDirLoc, shaderData.lightingData.directionalLight.toFloat32());

        let lightColLoc = gl.getUniformLocation(this.program, "u_directionalColor");
        gl.uniform3fv(lightColLoc, shaderData.lightingData.directionalColor.toFloat32());

        let ambColLoc = gl.getUniformLocation(this.program, "u_ambientColor");
        gl.uniform3fv(ambColLoc, shaderData.lightingData.ambientColor.toFloat32());

        // texturing

        //TODO: Link texture information to sampler2D uniform in the fragment shader.
        // 1. Set active Texture Unit (gl.TEXTURE0)
        gl.activeTexture(gl.TEXTURE0);
        // 2. Bind texture from TextureCache (TextureCache[model.material.mainTexture])
        let mainTexture = TextureCache[model.material.mainTexture];
        gl.bindTexture(gl.TEXTURE_2D, mainTexture);
        // 3. Get uniform location of u_mainTex texture sampler2D
        // 4. Link to Texture Unit 0 (see 1., with bound texture from 2.) to uniform sampler2D
        //      - this is equivalent to setting the uniform from location 3. to
        //      an integer with value 0! -> gl.uniform1i(...)
        let maintexLoc = gl.getUniformLocation(this.program, "u_mainTex");
        gl.uniform1i(maintexLoc, 0);

        super.setUniformData(model, camera, shaderData);

        // TODO: set data for inverse transpose 3x3 matrix uniform
        let invTransLoc = gl.getUniformLocation(this.program, "u_matrixInvTransM");
        gl.uniformMatrix3fv(invTransLoc, false, M4.inverseTranspose3x3(model.modelMatrix).toFloat32());
        // make some local variables for the lighting data to avoid spagetti code
        let directionalLight = shaderData.lightingData.directionalLight;
        let directionalColor = shaderData.lightingData.directionalColor;
        let ambientColor = shaderData.lightingData.ambientColor;

        // TODO: add uniform data for directional lighting
        let lightWorldPositionLocation = gl.getUniformLocation(this.program, "u_lightWorldPosition");
        gl.uniform3fv(lightWorldPositionLocation, [0,3,0]);
        let worldLoc = gl.getUniformLocation(this.program, "u_world");
        gl.uniformMatrix4fv(worldLoc, false, model.modelMatrix.toFloat32());
        
        // let u_directionalLight = gl.getUniformLocation(this.program, "u_directionalLight");
        // gl.uniform3fv(u_directionalLight, directionalLight.toFloat32());
        let viewWorldPositionLocation = gl.getUniformLocation(this.program, "u_viewWorldPosition");
        gl.uniform3fv(viewWorldPositionLocation, directionalLight);
        
        let u_directionalColor = gl.getUniformLocation(this.program, "u_directionalColor");
       gl.uniform3fv(u_directionalColor, directionalColor.toFloat32());
        let u_ambientColor = gl.getUniformLocation(this.program, "u_ambientColor");
        gl.uniform3fv(u_ambientColor, ambientColor.toFloat32());

        let shininessLocation = gl.getUniformLocation(this.program, "u_shininess");
        gl.uniform1f(shininessLocation, model.material.shininess);
    }
}
