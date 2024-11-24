uniform vec3 uDepthColor;
uniform vec3 uSurfaceColor;
uniform float uColorOffset;
uniform float uColorMultiplier;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

#include ../lights/directionalLight.frag
#include ../lights/pointLight.frag

void main () {
  // View direction, camera to the position
  vec3 viewDirection = normalize(vPosition - cameraPosition);
  // Make the length of the normal vector 1
  vec3 normal = normalize(vNormal);

  // Base color
  float mixStrength = (vElevation + uColorOffset) * uColorMultiplier;
  mixStrength = smoothstep(0.0, 1.0, mixStrength);
  vec3 color = mix(uDepthColor, uSurfaceColor, mixStrength);

  // Light
  vec3 light = vec3(0.0);
  // light += directionalLight(
  //   vec3(1.0),            // Light color
  //   1.0,                  // Light intensity
  //   normal,               // Normal
  //   vec3(-1.0, 0.5, 0.0), // Light position
  //   viewDirection,        // View direction
  //   30.0                  // Specular power
  // );

  // Point light
  light += pointLight(
    vec3(1.0),
    10.0,
    normal,
    vec3(0.0, 0.25, 0.0),
    viewDirection,
    30.0,
    vPosition,
    0.65
  );

  color *= light;

  // Final color
  gl_FragColor = vec4(color, 1.0);

  // Debugging
  // gl_FragColor = vec4(normal, 1.0); // green color for normal means Y-axis. Used for debugging
  /*
    We have used plane geometry to create the water. And play with vertices to create the waves.
    But all the normal of the plane are in the same direction (Y-axis).
    So we need to calculate the normal for each vertex based on the wave height.
  */

  // Three js color management
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}