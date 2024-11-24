// Uniforms
uniform vec2 uResolution;
uniform sampler2D uPictureTexture;
uniform sampler2D uDisplacementTexture;

// Attributes
attribute float aIntensity;
attribute float aAngle;

// Varyings
varying vec3 vColor;

void main () {
  // Displacement
  vec3 newPosition = position;
  float displacementIntensity = texture2D(uDisplacementTexture, uv).r;
  displacementIntensity = smoothstep(0.1, 0.4, displacementIntensity);
  
  // newPosition.z += displacementIntensity * 3.0;
  vec3 displacement = vec3(
    cos(aAngle) * 0.2,
    sin(aAngle) * 0.2,
    1.0
  );
  displacement = normalize(displacement);
  displacement *= displacementIntensity;
  displacement *= 3.0;
  displacement *= aIntensity;
  newPosition += displacement;

  // Final position
  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  gl_Position = projectedPosition;

  // Picture
  float pictureIntensity = texture2D(uPictureTexture, uv).r;

  // Point size
  // More intensity, more size
  gl_PointSize = 0.15 * pictureIntensity * uResolution.y;
  gl_PointSize *= (1.0 / - viewPosition.z);

  // Varying
  vColor = vec3(pow(pictureIntensity, 2.0));
}
