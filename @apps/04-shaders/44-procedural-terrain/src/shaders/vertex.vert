#include "./includes/simplexNoise2d.glsl"

uniform float uTime;
uniform float uPositionFrequency;
uniform float uStrength;
uniform float uWarpFrequency;
uniform float uWarpStrength;

varying vec3 vPosition;
varying float vUpDot;

float getElevation(vec2 position) {
  // Warp
  vec2 warpedPosition = position;
  warpedPosition += uTime * 0.2;

  warpedPosition += simplexNoise2d(
    // NOTE: To avoid missmatch apply uPositionFrequency
    warpedPosition * uPositionFrequency * uWarpFrequency
  ) * uWarpStrength;

  // Position that will be used is X and Z
  float elevation = 0.0; // initial value

  // Based on the position generate a noise value
  // NOTE: To create variations apply the noise multiple times with different values
  elevation += simplexNoise2d(warpedPosition * uPositionFrequency) / 2.0;
  elevation += simplexNoise2d(warpedPosition * uPositionFrequency * 2.0) / 4.0;
  elevation += simplexNoise2d(warpedPosition * uPositionFrequency * 4.0) / 8.0;

  // Make the terrain more mountainous. The more values will be closer to 0
  // NOTE: It removes all negative values while using pow(). Use sign() to keep the original sign
  float elevationSign = sign(elevation); // Save the sign of the elevation(-1 or 1)
  elevation = pow(abs(elevation), 2.0);
  elevation *= uStrength;

  return elevation * elevationSign; // Multiply by the sign to keep the original sign
}

void main() {
  // Neighbours positions
  float shift = 0.01; // Amount of shift to get neighbours positions

  // We are going to use positive X and negative Z. Otherwise, the normal will be inverted
  // because of use cross product. As a result, terrain will be flipped and look downwards
  // Shifted positions A and B
  vec3 positionA = position + vec3(shift, 0.0, 0.0); // Positive X
  vec3 positionB = position + vec3(0.0, 0.0, -shift); // Negative Z

  // Elevation
  float elevation = getElevation(csm_Position.xz);
  csm_Position.y += elevation;

  // Elevation for neighbours
  positionA.y = getElevation(positionA.xz);
  positionB.y = getElevation(positionB.xz);

  // From the elevation of B and A we get the normals
  vec3 normal = cross(positionA - csm_Position, positionB - csm_Position);
  // Always normalize the normal to get the right direction
  csm_Normal = normalize(normal);
  /*
    NOTE: As we don't use the original normal, we can delete it from geometry in main.ts
   */


  // Vaying
  vPosition = csm_Position;
  vPosition.xz += uTime * 0.2; // Apply time to the position to get the movement sync

  vUpDot = dot(csm_Normal, vec3(0.0, 1.0, 0.0));
}
