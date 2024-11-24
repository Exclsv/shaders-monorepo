// Code Starts Here...

// Big Waves
uniform float uTime;
uniform float uBigWavesSpeed;
uniform float uBigWavesElevation;
uniform vec2 uBigWavesFrequency;

// Small Waves
uniform float uSmallWavesElevation;
uniform float uSmallWavesFrequency;
uniform float uSmallWavesSpeed;
uniform float uSmallWavesIterations;

varying float vElevation;
varying vec3 vNormal;
varying vec3 vPosition;

uniform float uShift;

#include "../includes/perlin-noise.vert"
#include "./waveElevation.vert"

void main() {
  // Base Position
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);

  // Shift
  vec3 modelPositionA = modelPosition.xyz;
  modelPositionA.x += uShift;
  vec3 modelPositionB = modelPosition.xyz;
  modelPositionB.z -= uShift;

  // Elevation
  float elevation = waveElevation(modelPosition.xyz);
  modelPosition.y += elevation;
  // Neighbors Elevation
  modelPositionA.y += waveElevation(modelPositionA);
  modelPositionB.y += waveElevation(modelPositionB);

  // Compute Normal
  vec3 toA = normalize(modelPositionA - modelPosition.xyz);
  vec3 toB = normalize(modelPositionB - modelPosition.xyz);
  vec3 computedNormal = cross(toA, toB);

  // Final Position
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  // Varyings
  vElevation = elevation;
  // vNormal = (modelMatrix * vec4(normal, 0.0)).xyz;
  vNormal = computedNormal;
  vPosition = modelPosition.xyz;
}