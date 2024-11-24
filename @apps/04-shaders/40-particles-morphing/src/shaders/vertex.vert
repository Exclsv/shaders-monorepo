// Uniforms
uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

// Attributes
attribute vec3 aPositionTarget;
attribute float aSize;

// Varyings
varying vec3 vColor;

#include "includes/simplexNoise.vert"

void main() {
  // Mixed position
  float noiseOrigin = simplexNoise3d(position * 0.2);
  float noiseTarget = simplexNoise3d(aPositionTarget * 0.2);
  float noise = mix(noiseOrigin, noiseTarget, uProgress);
  noise = smoothstep(-1.0, 1.0, noise); // from (-1, 1) to (0, 1)

  float duration = 0.4;
  float delay = (1.0 - duration) * noise; // delay = 0.6 * noise. Range from 0 to 0.6
  float end = delay + duration; // end = 0.6 + 0.4 = 1.0

  float progress = smoothstep(delay, end, uProgress);
  vec3 mixedPosition = mix(position, aPositionTarget, progress);

  // Final position
  vec4 modelPosition = modelMatrix * vec4(mixedPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  gl_PointSize = uSize * uResolution.y * aSize;
  gl_PointSize *= (1.0 / - viewPosition.z);

  // Varying
  vColor = vec3(noise);
}
