float random2D(vec2 value) {
  // Always returns a number between 0.0 and 1.0
  return fract(sin(dot(value, vec2(12.9898, 78.233))) * 43758.5453);
}