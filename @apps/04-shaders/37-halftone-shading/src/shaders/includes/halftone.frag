vec3 halftone(
  vec3 color,
  float repetition,
  vec3 direction,
  float low,
  float high,
  vec3 pointColor,
  vec3 normal
) {
  float intensity = dot(normal, direction); // -1 to 1
  intensity = smoothstep(low, high, intensity);

  // Grid
  vec2 uv = gl_FragCoord.xy / uResolution.y;  // Make the square shape
  uv *= repetition;
  uv = mod(uv, 1.0);

  // circle shape
  float point = length(uv - 0.5);
  point = 1.0 - step(0.5 * intensity, point);

  return mix(color, pointColor, point);
}