
#ifdef VERTEX_SHADER
// ------------------------------------------------------//
// ----------------- VERTEX SHADER ----------------------//
// ------------------------------------------------------//

attribute vec3 a_position; // the position of each vertex
attribute vec3 a_normal;   // the surface normal of each vertex

//TODO: Add a_texcoord attribute
attribute vec2 a_texcoord;

uniform mat4 u_matrixM; // the model matrix of this object
uniform mat4 u_matrixV; // the view matrix of the camera
uniform mat4 u_matrixP; // the projection matrix of the camera
uniform mat3 u_matrixInvTransM;
varying vec3 v_normal;    // normal to forward to the fragment shader

//TODO: Add v_texcoord varying
varying vec2 v_texcoord;

uniform vec3 u_lightWorldPosition; 
uniform vec3 u_viewWorldPosition;
uniform mat4 u_world;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;
uniform float u_shininess;

void main() {
    v_normal = normalize(u_matrixInvTransM * a_normal); // set normal data for fragment shader

    //TODO: Transfer texCoord attribute value to varying
    v_texcoord = a_texcoord;
    gl_Position = u_matrixP * u_matrixV * u_matrixM * vec4 (a_position, 1);

    vec3 surfaceWorldPosition = (u_world * vec4 (a_position, 1)).xyz;
    v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
    v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;
}

#endif
#ifdef FRAGMENT_SHADER
// ------------------------------------------------------//
// ----------------- Fragment SHADER --------------------//
// ------------------------------------------------------//

precision highp float; //float precision settings
uniform vec3 u_tint;            // the tint color of this object
uniform vec3 u_directionalLight;// directional light in world space
uniform vec3 u_directionalColor;// light color
uniform vec3 u_ambientColor;    // intensity of ambient light
varying vec3 v_normal;  // normal from the vertex shader

//TODO: Add v_texcoord varying
varying vec2 v_texcoord;
//TODO: Add u_mainTex sampler (main texture)
uniform sampler2D u_mainTex;

varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToView;
uniform float u_shininess;

void main(void){

    //TODO: Add texture color sampling
    vec3 textureColor = texture2D(u_mainTex, v_texcoord).rgb;
    //TODO: Blend texture color with tint color for new baseColor
    vec3 baseColor = textureColor * u_tint;

    //gl_FragColor = vec4(finalColor, 1);
//----------------------
    // TODO: normalize normal (not normalized because of interpolation over triangle)
    vec3 normal = normalize(v_normal);
    // TODO: calculate diffuse value from normal and light direction
    vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
    float diffuseIntensity = max(0.0, dot(normal, surfaceToLightDirection));
    vec3 diffuseColor = u_directionalColor * diffuseIntensity;
    // TODO: apply light color and ambient color
    vec3 result = u_ambientColor + diffuseColor;
    // TODO: clamp light color (r,g,b) to range of 0-1
    // (there can not be any color value smaller than 0 or bigger than 1)
    result = clamp(result, vec3(0.0,0.0,0.0), vec3(1.0,1.0,1.0));
    // TODO: apply tint color using multiplicative color blending
    result *= u_tint.rgb;

    //specular
    vec3 surfaceToViewDirection = normalize(v_surfaceToView);
    vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);
    float light = dot(normal, surfaceToLightDirection);
    float specular = 0.0;
    if (light > 0.0) {
        specular = pow(dot(normal, halfVector), u_shininess);
    }

    vec3 finalColor = result * baseColor; // apply lighting to color
    gl_FragColor = vec4(finalColor, 1);

    gl_FragColor.rgb += specular;
}

#endif
