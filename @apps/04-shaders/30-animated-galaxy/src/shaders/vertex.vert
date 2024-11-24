uniform float uSize;
uniform float uTime;

attribute float aScale;
attribute vec3 aRandomness;
// attribute vec3 color; // This is automatically provided by three.js

varying vec3 vColor;

void main() {
  // Position
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  // Spin animation
  float angle = atan(modelPosition.x, modelPosition.z);
  float distanceToCenter = length(modelPosition.xz);
  float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;
  angle += angleOffset;

  modelPosition.x = cos(angle) * distanceToCenter;
  modelPosition.z = sin(angle) * distanceToCenter;

  // Randomness
  modelPosition.xyz += aRandomness;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  // Applying size attenuation
  gl_PointSize = uSize * aScale;
  /*
    Attenuation Factor:
    viewPosition.z: The distance from the camera in view space (negative values are in front of camera)
    The formula 1.0 / -viewPosition.z creates the attenuation effect 

    Example:
    Example 1: Point close to camera (viewPosition.z = -2)
    - Base size: uSize = 10, aScale = 1
    - Initial gl_PointSize = 10 * 1 = 10
    - Attenuation: 10 * (1.0 / -(-2)) = 10 * 0.5 = 5
    Result: Point appears at size 5

    Example 2: Point far from camera (viewPosition.z = -10)
    - Base size: uSize = 10, aScale = 1
    - Initial gl_PointSize = 10 * 1 = 10
    - Attenuation: 10 * (1.0 / -(-10)) = 10 * 0.1 = 1
    Result: Point appears at size 1
  */
  // Taken from three.js source code(three/src/renderers/shaders/ShaderLib/points.glsl.js)
  gl_PointSize *= (1.0 / -viewPosition.z); 

  vColor = color;
}
