uniform float uSliceStart;
uniform float uSliceArc;

varying vec3 vPosition;

void main() {

  float angle = atan(vPosition.y, vPosition.x); // First y then x
  // We remove the slice start offset
  angle -= uSliceStart;
  // We remove the negative part of the angle and continue the circle
  angle = mod(angle, PI2);

  if (angle > 0.0 && angle < uSliceArc) {
    discard;
  }

  // To activate the slice color
  float csm_Slice;

  // csm_FragColor = vec4(vec3(angle), 1.0);
}