uniform float uTime;
uniform float uPositionFrequency;
uniform float uTimeFrequency;
uniform float uStrength;

uniform float uWarpPositionFrequency;
uniform float uWarpTimeFrequency;
uniform float uWarpStrength;

attribute vec4 tangent;

#include "./includes/simplexNoise4d.glsl"

float getWobble(vec3 position) {
  vec3 warpedPosition = position;
  warpedPosition += simplexNoise4d(
    vec4(
      position * uWarpPositionFrequency,
      uTime * uWarpTimeFrequency
    )
  ) * uWarpStrength;

  return simplexNoise4d(vec4(
    warpedPosition * uPositionFrequency, // XYZ
    uTime * uTimeFrequency        // Time
  )) * uStrength;
}

// varying vec2 vUv;
varying float vWobble;

void main() {
  // 1. Get perpendicular vectors
  vec3 biTangent = cross(normal, tangent.xyz);

  // 2. Calculate offset positions
  float shift = 0.01;
  vec3 positionA = csm_Position + tangent.xyz * shift;
  vec3 positionB = csm_Position + biTangent * shift;

  // Wobble
  // 3. Apply displacement
  float wobble = getWobble(csm_Position);
  csm_Position += wobble * normal;
  positionA += getWobble(positionA) * normal;
  positionB += getWobble(positionB) * normal;

  // 4. Calculate new normal
  vec3 toA = normalize(positionA - csm_Position);
  vec3 toB = normalize(positionB - csm_Position);

  // 5. Return new normal perpendicular to positionA and positionB
  csm_Normal = cross(toA, toB);

  // Varyings
  // vUv = uv;
  vWobble = wobble / uStrength; // Remove the strength from the wobble
}
