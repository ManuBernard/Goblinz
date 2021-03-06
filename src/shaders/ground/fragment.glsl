#define PI 3.1415926535897932384626433832795

uniform float u_hillsShadow;

uniform vec3 u_grassColor;
uniform vec3 u_grassShadowColor;
uniform vec3 u_sandColor;

uniform float u_pathPosition;
uniform float u_pathSize;
uniform float u_pathSinusoid;
uniform float u_pathSinusoidStrength;

varying vec2 v_uv;
varying float v_elevation;

float cubicPulse( float c, float w, float x ){
    x = abs(x - c);
    if( x>w ) return 0.0;
    x /= w;
    return 1.0 - x*x*(3.0-2.0*x);
}

void main(){
   vec3 grassLight = u_grassColor;
   vec3 grassShadow = u_grassShadowColor;

   vec3 grass = mix(grassShadow, grassLight, v_elevation / u_hillsShadow);

   vec3 sand = u_sandColor;

   float pathSinusoid = sin(v_uv.x * u_pathSinusoid) / (100.0 - u_pathSinusoidStrength);
   float path = cubicPulse(u_pathPosition, u_pathSize, v_uv.y + pathSinusoid) * 2.0;

   path = clamp(path, 0.0, 1.0);

   vec3 color = mix( grass,sand, path);

   gl_FragColor = vec4(color, 1.0);
}
