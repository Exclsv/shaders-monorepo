// Varying
varying vec2 vUv;

// Uniforms
uniform float uTime;
uniform sampler2D uPerlinTexture;

#include ./rotate2D.vert

void main() {
  vec3 newPosition = position;

  // Rotate
  // twistPerlin is used to get the value of the perlin texture to use as a random value
  float twistPerlin = texture2D(
    uPerlinTexture,
    vec2(0.5, uv.y * 0.2 - uTime * 0.005)
  ).r;

  float angle = twistPerlin * 10.0;
  newPosition.xz = rotate2D(newPosition.xz, angle);

  // Wind
  vec2 windOffset = vec2(
    texture2D(uPerlinTexture, vec2(0.25, uTime * 0.01)).r - 0.5, // from 0.5 to -0.5
    texture2D(uPerlinTexture, vec2(0.75, uTime * 0.013)).r - 0.5
  );
  // pow is used to make the wind more intense towards the top of the smoke
  windOffset *= pow(uv.y, 2.0) * 10.0;
  newPosition.xz += windOffset;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);

  vUv = uv;
}