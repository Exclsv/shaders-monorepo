uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
// if needed
// uniform mat4 modelMatrix;
// uniform mat4 viewMatrix;

attribute vec3 position;
attribute vec2 uv;

// Code Starts Here ---------------------------------------------
varying vec2 vUv;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

  vUv = uv;
}