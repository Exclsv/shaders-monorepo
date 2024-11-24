#include <begin_vertex>

float angle2 = (sin(position.y + uTime)) * 0.4;

mat2 rotateMatrix2 = get2dRotateMatrix(angle2);

transformed.xz = rotateMatrix2 * transformed.xz;