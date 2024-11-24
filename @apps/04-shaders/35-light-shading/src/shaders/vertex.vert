varying vec3 vNormal;
varying vec3 vPosition;

void main() {
  // Position
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewMatrix * modelPosition;

  // Apply model matrix to normal to get the correct orientation
  vec4 modelNormal = modelMatrix * vec4(normal, 0.0);

  // Varying
  vNormal = modelNormal.xyz;
  vPosition = modelPosition.xyz;
}