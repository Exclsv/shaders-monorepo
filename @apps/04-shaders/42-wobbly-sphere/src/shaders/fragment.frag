uniform vec3 uColorA;
uniform vec3 uColorB;

// varying vec2 vUv;
varying float vWobble;

void main() {
  float colorMix = smoothstep(-1.0, 1.0, vWobble);
  csm_DiffuseColor.rgb = mix(uColorA, uColorB, colorMix);

  // Mirror step
  // csm_Metalness = step(0.25, vWobble);
  // csm_Roughness = 1.0 - step(0.25, vWobble);

  // Shiny tip
  csm_Roughness = smoothstep(0.1, 0.8, 1.0 - colorMix);
  csm_Metalness = min(0.5, colorMix);

  // csm_Metalness = step(0.0, sin(vUv.x * 100.0 + 0.5));
  // csm_Roughness = step(0.0, sin(vUv.y * 100.0));
}