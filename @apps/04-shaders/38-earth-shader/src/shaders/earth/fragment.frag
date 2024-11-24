// Uniforms
uniform sampler2D uDayTexture;
uniform sampler2D uNightTexture;
uniform sampler2D uSpecularCloudsTexture;
uniform vec3 uSunDirection;
uniform float uTime;
uniform vec3 uAtmosphereDayColor;
uniform vec3 uAtmosphereTwilightColor;

// Varyings
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main () {
  vec3 viewDirection = normalize(vPosition - cameraPosition);
  vec3 normal = normalize(vNormal);
  vec3 color = vec3(0.0);

  // Sun orientation
  float sunOrientation = dot(uSunDirection, normal);

  // Day/Night color
  float dayMix = smoothstep(-0.25, 0.5, sunOrientation);
  vec3 dayColor = texture2D(uDayTexture, vUv).rgb;
  vec3 nightColor = texture2D(uNightTexture, vUv).rgb;
  color = mix(nightColor, dayColor, dayMix);

  // Animate Clouds
  float speedX = -0.003;
  float speedY = -0.001;
  vec2 animatedUv = vUv + vec2(uTime * speedX, (sin(uTime) * 0.3) * speedY);
  // Specular cloud
  float specularCloudsAnimated = texture2D(uSpecularCloudsTexture, animatedUv).g;
  float specularClouds = texture2D(uSpecularCloudsTexture, vUv).r;

  // Clouds
  float cloudsMix = smoothstep(0.3, 1.0, specularCloudsAnimated);
  cloudsMix *= dayMix;
  color = mix(color, vec3(1.0), cloudsMix);

  // Fresnel
  float fresnel = dot(viewDirection, normal) + 1.0;
  fresnel = pow(fresnel, 2.0);

  // Atmosphere
  float atmosphereDayMix = smoothstep(-0.5, 1.0, sunOrientation);
  vec3 atmosphereColor = mix(uAtmosphereTwilightColor, uAtmosphereDayColor, atmosphereDayMix);
  color = mix(color, atmosphereColor, fresnel * atmosphereDayMix);

  // Specular
  vec3 reflection = reflect(-uSunDirection, normal);
  float specular = -dot(reflection, viewDirection);
  specular = max(specular, 0.0);
  specular = pow(specular, 34.0);
  // Remove specular from continents
  specular *= specularClouds;

  // Mix specular color with atmosphere color based on fresnel
  vec3 specularColor = mix(vec3(1.0), atmosphereColor, fresnel);
  color += specular * specularColor;

  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}