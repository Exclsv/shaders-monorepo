float waveElevation(vec3 position) {
  float elevation = sin(position.x * uBigWavesFrequency.x + (uTime * uBigWavesSpeed)) *
                    sin(position.z * uBigWavesFrequency.y + (uTime * uBigWavesSpeed)) *
                    uBigWavesElevation;

  // Small Waves
  for (float i = 1.0; i <= uSmallWavesIterations; i++) {
    elevation -= abs(
      perlinClassic3D(
        vec3(
          position.xz * uSmallWavesFrequency * i,
          uTime * uSmallWavesSpeed)
      ) * uSmallWavesElevation / i
    );
  }
  // perlinClassic3D creates a wave pattern
  // abs() makes the wave pattern more extreme by cutting off the negative values
  // So in order to make the waves more sharp we subtract the absolute value of the noise instead of adding it.
  // modelPosition.xz * 3.0 is used to make the waves more frequent
  // uTime * 0.2 is used to make the waves move slower
  // elevation -= abs(perlinClassic3D(vec3(modelPosition.xz * 3.0, uTime * 0.2)) * 0.15);

  return elevation;
}
