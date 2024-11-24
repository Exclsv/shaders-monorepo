uniform float uSize;
uniform vec2 uResolution;
uniform float uProgress;

attribute float aSize;
attribute float aTimeMultiplier;
#include 'remap.vert'

void main() {
  float progress = uProgress * aTimeMultiplier;
  vec3 newPosition = position;

  // *** Explosion ***
  float explodingProgress = remap(progress, 0.0, 0.1, 0.0, 1.0);
  // ^ Clamp the value between 0 and 1
  explodingProgress = clamp(explodingProgress, 0.0, 1.0);
  // ^ Make it more dramatic
  explodingProgress = 1.0 - pow(1.0 - explodingProgress, 3.0);
  // ^ Apply the progress to the position
  newPosition *= explodingProgress;

  // *** Fallinig ***
  float fallingProgress = remap(progress, 0.1, 1.0, 0.0, 1.0);
  fallingProgress = clamp(fallingProgress, 0.0, 1.0);
  fallingProgress = 1.0 - pow(1.0 - fallingProgress, 3.0);
  newPosition.y -= fallingProgress * 0.2;

  // *** Scaling ***
  float sizeOpeningProgress = remap(progress, 0.0, 0.125, 0.0, 1.0);
  float sizeClosingProgress = remap(progress, 0.125, 1.0, 1.0, 0.0);
  float sizeProgress = min(sizeOpeningProgress, sizeClosingProgress);
  sizeProgress = clamp(sizeProgress, 0.0, 1.0);

  // *** Twinkling ***
  float twinklingProgress = remap(progress, 0.2, 0.8, 0.0, 1.0);
  twinklingProgress = clamp(twinklingProgress, 0.0, 1.0);
  float sizeTwinkling = sin(progress * 30.0) * 0.5 + 0.5;
  sizeTwinkling = 1.0 - sizeTwinkling * twinklingProgress;


  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;

  // Final position
  gl_Position = projectionMatrix * viewPosition;

  // Point size
  gl_PointSize = uSize * uResolution.y * aSize * sizeProgress * sizeTwinkling;
  // Fix size attenuation
  gl_PointSize *= 1.0 / -viewPosition.z;

  // Fix the particles that are too small but still get rendered as 1 pixel
  if (gl_PointSize < 1.0) {
    gl_Position = vec4(9999.0);
  }
}