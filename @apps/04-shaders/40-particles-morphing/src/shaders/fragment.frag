// Varyings
varying vec3 vColor;

// Uniforms
uniform vec3 uColorA;
uniform vec3 uColorB;

void main() {
  vec2 uv = gl_PointCoord;
  float distanceToCenter = length(uv - 0.5);
  float alpha = 0.05 / distanceToCenter - 0.1;

  vec3 color = mix(uColorA, uColorB, vColor);

  gl_FragColor = vec4(color, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}