varying vec3 vPosition;
varying vec3 vNormal;

uniform float uTime;

#include random2D.vert

void main() {
  // Position
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  // Glitch
  float glitchTime = uTime - modelPosition.y;
  float glitchStrength = sin(glitchTime) + sin(glitchTime * 3.45) + sin(glitchTime * 8.76);
  glitchStrength /= 3.0;
  glitchStrength = smoothstep(0.3, 1.0, glitchStrength);
  glitchStrength *= 0.25;

  modelPosition.x += (random2D(modelPosition.xz + uTime) - 0.5) * glitchStrength;
  modelPosition.z += (random2D(modelPosition.zx + uTime) - 0.5) * glitchStrength;

  // Final position
  gl_Position = projectionMatrix * viewMatrix * modelPosition;

  // Normal
  // 4th component is 0.0 because we want to transform only the direction
  // The value isn't homogeneous because we want to avoid skewing the normal
  vec4 modelNormal = modelMatrix * vec4(normal, 0.0);

  // Varyings
  vPosition = modelPosition.xyz;
  vNormal = modelNormal.xyz;
}
