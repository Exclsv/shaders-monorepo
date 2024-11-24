#include "./includes/simplexNoise2d.glsl"

uniform vec3 uColorWaterDeep;
uniform vec3 uColorWaterSurface;
uniform vec3 uColorSand;
uniform vec3 uColorGrass;
uniform vec3 uColorSnow;
uniform vec3 uColorRock;

varying vec3 vPosition;
varying float vUpDot;

void main() {
  // Color
  vec3 color = vec3(1.0);

  // Water
  float surfaceWaterMix = smoothstep(-1.0, -0.1, vPosition.y);
  color = mix(uColorWaterDeep, uColorWaterSurface, surfaceWaterMix);

  // Sand
  float sandMix = step(-0.1, vPosition.y);
  color = mix(color, uColorSand, sandMix);

  // Grass
  float grassMix = step(-0.06, vPosition.y);
  color = mix(color, uColorGrass, grassMix);

  // Rock
  // vUpDot is 1 when the vertex is facing up and 0 when it's facing sideways
  float rockMix = vUpDot;
  rockMix = 1.0 - step(0.8, rockMix);
  rockMix *= step(-0.06, vPosition.y); // Same as grassMix
  color = mix(color, uColorRock, rockMix);

  // Snow
  float snowThreshold = 0.45;
  snowThreshold += simplexNoise2d(vPosition.xz * 10.0) * 0.1;
  float snowMix = step(snowThreshold, vPosition.y);
  color = mix(color, uColorSnow, snowMix);

  csm_DiffuseColor = vec4(color, 1.0);
}