// Uniforms
uniform vec3 uColor;
uniform vec2 uResolution;

uniform vec3 uShadowColor;
uniform float uShadowRepetition;
uniform float uShadowLow;
uniform float uShadowHigh;

uniform vec3 uLightColor;
uniform float uLightRepetition;
uniform float uLightLow;
uniform float uLightHigh;

// Varyings
varying vec3 vNormal;
varying vec3 vPosition;

#include "./lights/ambientLight.frag"
#include "./lights/directionalLight.frag"
#include "./includes/halftone.frag"

void main () {
  vec3 viewDirection = normalize(vPosition - cameraPosition);
  vec3 normal = normalize(vNormal);
  vec3 color = uColor;

  // Lights
  vec3 light = vec3(0.0);
  light += ambientLight(
    vec3(1.0),
    1.0
  );

  light += directionalLight(
    vec3(1.0, 1.0, 1.0),    // Light color
    1.0,                    // Light intensity
    normal,                 // Normal
    vec3(1.0, 1.0, 0.0),    // Light position
    viewDirection,          // View direction
    1.0                     // Specular power
  );

  color *= light;

  // Halftone shading
  /*
    1 - same direction
    0 - perpendicular
   -1 - opposite direction
  */
  color = halftone(
    color,
    uShadowRepetition,
    vec3(0.0, -1.0, 0.0),
    uShadowLow,
    uShadowHigh,
    uShadowColor,
    normal
  );

  color = halftone(
    color,
    uLightRepetition,
    vec3(1.0, 1.0, 0.0),
    uLightLow,
    uLightHigh,
    uLightColor,
    normal
  );
  

  // Final color
  gl_FragColor = vec4(color, 1.0);
  // gl_FragColor = vec4(point, point, point, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}