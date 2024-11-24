precision mediump float;

// Code Starts Here...
varying vec3 vColor;

void main() {
  /*
    Because each point is a separate particle, we cann't use the uv coordinates,
    instead we use gl_PointCoord to get the coordinates of the point
  */
  // float strength = length(gl_PointCoord - 0.5); // moving the center to 0.5
  // strength = 1.0 - step(0.5, strength); // inverting the strength (1 to 0, 0 to 1)
  // gl_FragColor = vec4(vec3(strength), 1.0);

  // Diffuse point
  // float strength = length(gl_PointCoord - 0.5); // Moving the coordinate center to 0.5
  // strength *= 2.0; // Make it 2 times bigger
  // strength = 1.0 - strength; // Inverting the strength
  // gl_FragColor = vec4(vec3(strength), 1.0);

  // Light point
  float strength = length(gl_PointCoord - 0.5);
  strength = 1.0 - strength; // Inverting the strength
  strength = pow(strength, 10.0); // Making it more intense

  // Final color
  vec3 color = mix(vec3(0.0), vColor, strength);

  gl_FragColor = vec4(color, 1.0);

}