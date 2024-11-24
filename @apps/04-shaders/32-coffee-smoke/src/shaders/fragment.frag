// Uniforms
uniform float uTime;
uniform sampler2D uPerlinTexture;

// Varying
varying vec2 vUv;

void main() {
  // Scale and animate
  vec2 smokeUv = vUv; // Cuz varying is read-only we created a new variable
  smokeUv.x *= 0.5;
  smokeUv.y *= 0.3;
  smokeUv.y -= uTime * 0.03;

  // Smoke
  // Because the texture is grayscale and all the channels are the same, 
  // we can use the red channel to get the grayscale value
  float smoke = texture2D(uPerlinTexture, smokeUv).r;

  // Remap
  smoke = smoothstep(0.4, 1.0, smoke); // clamps the value between 0 and 1

  // Edges
  // smoke = 1.0;
  smoke *= smoothstep(0.0, 0.1, vUv.x);
  smoke *= smoothstep(1.0, 0.9, vUv.x);
  smoke *= smoothstep(0.0, 0.1, vUv.y);
  smoke *= smoothstep(1.0, 0.4, vUv.y);

  // Final color
  gl_FragColor = vec4(0.6, 0.3, 0.2, smoke);
  // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

  // Will be taken from the three.js library
  #include <tonemapping_fragment> // Add support for tonemapping
  #include <colorspace_fragment> // Fix the colorspace
}
