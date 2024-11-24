// Varyings
varying vec3 vColor;

void main() {
  vec2 uv = gl_PointCoord;
  float distanceToCenter = length(uv - 0.5);

  if (distanceToCenter > 0.5) 
    discard; // Removes the pixel if it's outside the circle. It will not be rendered.

  gl_FragColor = vec4(vColor, 1.0);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}