#define PI 3.1415926535897932384626433832795

varying vec2 vUv;
varying float vElevation;

void main(){
   float strength = vUv.y;

  gl_FragColor = vec4(vec3(strength ), 1.0);
}
