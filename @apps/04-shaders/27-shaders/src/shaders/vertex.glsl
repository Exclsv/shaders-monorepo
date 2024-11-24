varying vec2 vUv;
varying float vElevation;

uniform vec2 uFrequency;
uniform float uTime;

void main() {
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  float elevation = sin(modelPosition.x * uFrequency.x - uTime) * 0.1;
  elevation += sin(modelPosition.y * uFrequency.y - uTime) * 0.1;
  // modelPosition.y += 1.0;
  // Add wave effect
  modelPosition.z += elevation;
  // modelPosition.x += sin(modelPosition.y * 7.0) * 0.1;
  // modelPosition.z += aRandom * 0.1;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  vUv = uv;
  vElevation = elevation;
  // vRandom = aRandom; // Pass the random value to the fragment shader

  /*
  gl_Position is vec4 - (
    x - left/right,
    y - top/bottom,
    z - near/far,
    w - perspective
  )
  */ 
  // gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}