vec3 pointLight(
  vec3 lightColor,
  float lightIntensity,
  vec3 normal,
  vec3 lightPosition,
  vec3 viewDirection,
  float specularPower,
  vec3 position,
  float lightDecay
) {
  // Light delta vector (from the position to the light)
  vec3 lightDelta = lightPosition - position;

  float lightDistance = length(lightDelta);

  // Light direction
  vec3 lightDirection = normalize(lightDelta);
  vec3 lightReflection = reflect(- lightDirection, normal);

  // Shading
  float shading = dot(normal, lightDirection);
  shading = max(0.0, shading);

  // Specular
  float specular = - dot(lightReflection, viewDirection);
  specular = max(0.0, specular);
  specular = pow(specular, specularPower);

  // Decay (attenuation)
  float decay = 1.0 - lightDistance * lightDecay;
  decay = max(0.0, decay);

  // Apply shading and specular to the light color and intensity
  return lightColor * lightIntensity * decay * (shading + specular);
  // return vec3(decay);
}