// Varyings
varying vec3 vColor;

// Uniforms

void main() {
  float distanceToCenter = length(gl_PointCoord - 0.5);
  // Removes the fragment outside the circle(DON'T RENDER)
  if (distanceToCenter > 0.5) 
    discard;

  gl_FragColor = vec4(vColor, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}