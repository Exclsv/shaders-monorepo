varying vec3 vPosition;
varying vec3 vNormal;

uniform float uTime;
uniform vec3 uColor;

void main() {
  // Normal
  vec3 normal = normalize(vNormal);
  // Inverting the normal if the face is not front facing
  normal *= gl_FrontFacing ? 1.0 : -1.0;

  // Stripes 
  float stripes = mod((vPosition.y - uTime * 0.02) * 20.0, 1.0);
  stripes = pow(stripes, 3.0);

  // Fresnel
  /*
    It’s finally time to compare viewDirection with vNormal and we are going to use a dot product.

    What the dot product does in simple words:
    Considering two vectors of the same length(normalized):

    If they are in the same direction, we get 1  ⬆️ ⬆️
    If they they are perpendicular, we get 0     ⬆️ ⬅️
    If they are opposite, we get -1              ⬆️ ⬇️
    In between values are interpolated 
  */
  vec3 viewDirection = normalize(vPosition - cameraPosition);
  /*
    By default we get -1 if the camera face the opposite site of the normal
    We add 1.0 to get a 0.0 value if camera is opposite to the normal,
    and 1.0 if the camera is perpendicular to the normal.
  */
  float fresnel = dot(viewDirection, normal) + 1.0;
  fresnel = pow(fresnel, 2.0);

  // Falloff (fade out effect)
  float falloff = smoothstep(0.8, 0.0, fresnel);

  // Holographic
  float holographic = stripes * fresnel;
  holographic += fresnel * 1.25;
  holographic *= falloff; // Apply fade out effect

  // Final color
  gl_FragColor = vec4(uColor, holographic);
  // gl_FragColor = vec4(vNormal, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}