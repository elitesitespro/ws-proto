// The night globe, drawn per pixel on one full-canvas triangle (no 3D
// library). A ray hits a unit sphere; the hit point is turned by the spin
// and tilt, mapped to longitude and latitude, and NASA's Black Marble
// image is read there. The image's warm pixels are the city lights, its
// faint ones the land: the land is re-coloured a neutral charcoal (so the
// gold over it stays gold), the lights into uLight (gold unless the page
// picks a platform's colour).
// The sun sits behind the planet's upper right, so a thin gold crescent
// lights that limb, the atmosphere glows off it and sparks stream away.
//
// The same planet also does the day. As uDaylight rises the sun swings
// round to the front, the terminator sweeps across the disc and the
// Earth comes up in its own colours (NASA's Blue Marble), graded warm so
// it keeps the gold. uClouds lays real cloud cover over it on a layer a
// little above the ground. The camera can be a perspective one (uDist),
// and come right down: the air thickens, and at the cloud deck the clouds
// are marched through as a volume, so the dive ends inside sunlit cloud.

export const VERTEX_SHADER = /* glsl */ `#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export const FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
precision highp sampler3D;

uniform sampler2D uEarth;
uniform sampler2D uDay;       // the Blue Marble, by day
uniform sampler2D uCloudMap;  // cloud cover in red: 0 clear sky, 1 thick cloud
uniform sampler2D uWater;     // in red: 1 water, 0 land
uniform sampler3D uNoise;     // tiling noise made at start: r, b smooth; g, a Worley billows
uniform vec2 uResolution;   // canvas size, device pixels
uniform vec2 uCenter;       // globe centre, device pixels from bottom left
uniform float uRadius;      // globe radius on screen, device pixels
uniform float uFocal;       // perspective: the camera's focal length, device pixels
uniform float uDist;        // perspective: the camera's distance from the centre, radii; 0 for the flat view
uniform float uTime;        // seconds
uniform float uSpin;        // longitude turned, radians
uniform float uTilt;        // tilt towards the viewer, radians
uniform float uReady;       // 0 until the image has loaded, then 1
uniform vec3 uLight;        // the city lights' colour; the crescent, rim, sparks and dust stay gold
uniform vec2 uPointer;      // the pointer, device pixels from bottom left
uniform float uTorch;       // 0 to 1: how much the pointer's torch is lit (it's over the planet)
uniform float uDim;         // 0 to 1: the city lights held down, e.g. while one card has focus
uniform vec3 uSun;          // towards the sun, in view space
uniform float uDaylight;    // 0 the night look, 1 full day
uniform float uClouds;      // 0 no clouds, 1 full cover (held at 0 until the map arrives)
uniform float uDayReady;    // 0 to 1: the Blue Marble faded in
uniform float uWaterReady;  // 0 to 1: the water mask faded in
uniform float uNoiseReady;  // 0 to 1: the noise volume faded in
uniform float uDrift;       // how far the clouds have drifted east of the ground, radians
uniform float uDeep;        // 0 to 1: the camera at the cloud deck, marched through as a volume
uniform float uHaze;        // 0 to 1: the air thickening as the camera comes down
uniform float uGather;      // 0 to 1: more cloud forming below as the camera comes down

out vec4 outColor;

const float PI = 3.14159265359;
const vec3 STONE = vec3(0.047, 0.039, 0.035);      // #0C0A09
const vec3 GOLD = vec3(0.918, 0.702, 0.031);       // #EAB308
const vec3 GOLD_HI = vec3(0.980, 0.800, 0.082);    // #FACC15
const vec3 GOLD_PALE = vec3(0.992, 0.902, 0.541);  // #FDE68A
const vec3 GOLD_DEEP = vec3(0.631, 0.384, 0.027);  // #A16207

// The night's ground and cloud: neutral charcoal, a touch cool, so the gold
// laid over it stays gold (over a warm grey it would go brown)
const vec3 NIGHT_SEA = vec3(0.019, 0.019, 0.022);
const vec3 NIGHT_LAND = vec3(0.071, 0.073, 0.079);
const vec3 NIGHT_CLOUD = vec3(0.060, 0.062, 0.068);

// The day, graded warm so it sits with the gold
const vec3 SUNLIGHT = vec3(1.0, 0.95, 0.87);   // the full sun, a touch warm
const vec3 LOW_SUN = vec3(1.0, 0.68, 0.30);    // the sun low over the terminator
const vec3 OCEAN = vec3(0.012, 0.05, 0.13);    // open sea, before the Blue Marble arrives

// Gold light of strength k, to add over the dark: the gold's own hue where
// it's faint, paling towards white gold only where it's bright, so it reads
// as light at any strength. (Faint pale gold, or the deep gold, over the
// dark reads as brown.)
vec3 goldLight(float k) {
  return mix(GOLD_HI, GOLD_PALE, 0.65 * smoothstep(0.7, 1.5, k)) * k;
}

// The clouds, as heights above the ground in planet radii: the layer seen
// from afar, and the deck the camera comes down through
const float CLOUD_H = 0.012;
const float DECK_HI = 0.0145;      // the highest tops
const float BILLOW = 0.0007;       // how far the tops rise and fall over their billows
const float HOLE = 0.0014;         // how deep the gaps between clouds go
const float DECK_LO = DECK_HI - BILLOW - HOLE - 0.0004;
const float FOG_LO = 0.004;        // inside, the fog reaches down to here
const float TROUGH = 0.0009;       // how far the tops sink between clusters of cloud
const float DECK_SIGMA = 1400.0;   // how thick the fog inside the deck is, per planet radius
// Cloud shadows are cast from lower than the layer sits, so they fall
// beside their clouds as they would from real cloud heights
const float SHADOW_H = 0.0025;

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }

float sq(float x) { return x * x; }
float remap(float v, float lo, float hi) { return clamp((v - lo) / (hi - lo), 0.0, 1.0); }

// Each octave of noise is read turned against the last, so the volume's
// tiles never line up into a visible repeat
const mat3 TURN = mat3(0.0, 0.8, 0.6, -0.8, 0.36, -0.48, -0.6, -0.48, 0.64);

// A point on the sphere as image coordinates: longitude across, north up
vec2 lonLat(vec3 w) {
  return vec2(atan(w.x, w.z) / (2.0 * PI) + 0.5, 0.5 - asin(clamp(w.y, -1.0, 1.0)) / PI);
}

// The same with its screen gradients, for reading the images without a
// seam where longitude wraps: the gradient of u is taken from whichever of
// two wrapped copies is continuous. Takes derivatives, so it's never
// called inside a branch; the reads after it pass these gradients along.
vec2 sphereUv(vec3 w, out vec4 grad) {
  vec2 uv = lonLat(w);
  vec2 dx = dFdx(uv), dy = dFdy(uv);
  float u2 = fract(uv.x + 0.5);
  float dx2 = dFdx(u2), dy2 = dFdy(u2);
  if (abs(dx2) < abs(dx.x)) dx.x = dx2;
  if (abs(dy2) < abs(dy.x)) dy.x = dy2;
  grad = vec4(dx, dy);
  return uv;
}

// The night image, blurred by 2^lodBias
vec3 earthAt(vec2 uv, vec4 g, float lodBias) {
  float k = exp2(lodBias);
  return textureGrad(uEarth, uv, g.xy * k, g.zw * k).rgb;
}

// One channel of a map, blurred by 2^lodBias
float mapAt(sampler2D map, vec2 uv, vec4 g, float lodBias) {
  float k = exp2(lodBias);
  return textureGrad(map, uv, g.xy * k, g.zw * k).r;
}

// The camera's ray through a pixel (device pixels from the planet's centre
// on screen). c is the ray's nearest point to the planet's centre, h2 its
// distance from it squared, d the ray's direction and tc the distance from
// the camera to c. Flat view: rays run straight into the screen. With
// perspective they fan out from a camera on +z; written from c, so the
// sums stay exact however far off the camera is.
struct Ray { vec3 c; vec3 d; float h2; float tc; };

Ray rayAt(vec2 px) {
  Ray r;
  if (uDist > 0.0) {
    float oo = dot(px, px);
    float l2 = oo + uFocal * uFocal;
    float il = inversesqrt(l2);
    r.d = vec3(px, -uFocal) * il;
    r.c = vec3(px * (uDist * uFocal / l2), uDist * oo / l2);
    r.h2 = uDist * uDist * oo / l2;
    r.tc = uDist * uFocal * il;
  } else {
    vec2 p = px / uRadius;
    r.d = vec3(0.0, 0.0, -1.0);
    r.c = vec3(p, 0.0);
    r.h2 = dot(p, p);
    r.tc = 1e4;
  }
  return r;
}

// Where a ray first meets the sphere of radius s round the centre; past
// its outline, the ray's nearest point, so what's read there stays smooth
vec3 hitSphere(Ray r, float s) {
  return r.c - sqrt(max(s * s - r.h2, 0.0)) * r.d;
}

// How much of an octave of the noise volume to use where a pixel spans
// texels of it: none once its billows are finer than a couple of pixels,
// as they'd only shimmer
float octaveWeight(float texels) {
  return smoothstep(2.2, 0.9, log2(max(texels, 1e-6)));
}

// The noise volume at q, read at the mip level for how many of its texels
// a pixel spans; w is how much of it to use (octaveWeight)
vec4 detailAt(vec3 q, float texels, out float w) {
  w = octaveWeight(texels);
  return w > 0.0 ? textureLod(uNoise, q, max(log2(max(texels, 1e-6)), 0.0)) : vec4(0.5);
}

// The noise's octaves, in noise tiles per planet radius
const float S0 = 90.0, S1 = 330.0, S2 = 1180.0, S3 = 4100.0;

// Close in, where the images' texels grow past a pixel or two, detail from
// the noise volume takes over: four octaves, each bending the next (domain
// warping), each faded out once it's finer than a couple of pixels. q is
// the point (world space), fp the world size of a pixel there. Returns x,
// a billowy shape (smooth noise rounded by Worley billows) about 0.15 to
// 0.85 round 0.5; y, a mottling about -0.5 to 0.5; z, the shape from its
// two coarsest octaves alone, and w, the rounded lumps of their billows
// alone (see coarseShape). warp is a sideways nudge for an image read, in
// texels.
vec4 detail(vec3 q, float fp, out vec2 warp) {
  float w0, w1, w2, w3;
  vec4 n0 = detailAt(q * S0, fp * S0 * 64.0, w0);
  vec3 bend = (n0.rbr - 0.5) * 0.7;
  vec4 n1 = detailAt(TURN * q * S1 + bend, fp * S1 * 64.0, w1);
  bend = (n1.rbr - 0.5) * 0.7;
  vec4 n2 = detailAt(TURN * TURN * q * S2 + bend, fp * S2 * 64.0, w2);
  bend = (n2.rbr - 0.5) * 0.45;
  vec4 n3 = detailAt(TURN * q * S3 + bend, fp * S3 * 64.0, w3);
  warp = (n1.rb - 0.5) * w1 * 2.0 + (n2.rb - 0.5) * w2 * 1.0 + (n3.rb - 0.5) * w3 * 0.5;
  float coarse = 0.5
    + ((n0.r - 0.5) * 0.65 + (n0.g - 0.5) * 0.35) * w0 * 0.6
    + ((n1.r - 0.5) * 0.6 + (n1.g - 0.5) * 0.4) * w1 * 0.45;
  float shape = coarse
    + ((n2.r - 0.5) * 0.55 + (n2.g - 0.5) * 0.45) * w2 * 0.24
    + ((n3.r - 0.5) * 0.5 + (n3.g - 0.5) * 0.5) * w3 * 0.08;
  float mottle = (n0.r - 0.5) * w0 * 0.5 + (n1.r - 0.5) * w1 * 0.4 + (n2.b - 0.5) * w2 * 0.35 + (n3.r - 0.5) * w3 * 0.3;
  float lumps = (n0.g - 0.5) * w0 * 0.6 + (n1.g - 0.5) * w1 * 0.15;
  return vec4(shape, mottle, coarse, lumps);
}

// The clouds read the same octaves their own way. Each is bent by the last
// less than the ground's (CLOUD_SWIRL), so their billows don't smear into
// hair, and is less Worley billows (CLOUD_BILLOW: cut into cloud, the
// billows' cells leave straight edges and corners). Each comes in only
// once its billows are CLOUD_GRAIN times larger on screen than the ground
// takes them (and is read that much softer), as cut into cloud, billows a
// few pixels across break into specks: the coarsest later still, as for a
// while on the way down it's the finest in, and taken in small it scatters
// the cover into confetti. (Until it's in, the broad fields, cloudFields,
// gather the cover.) And the coarsest is read twice, turned and scaled
// against itself, so the volume's repeat (every 1/90 of a radius) never
// shows as a lattice of the same puffs.
const float CLOUD_SWIRL = 0.5;
const float CLOUD_BILLOW = 0.25;
const vec4 CLOUD_GRAIN = vec4(6.0, 2.5, 2.5, 2.5);
// How much of each octave's shape is Worley billows, as the ground takes them
const vec4 BILLOWS = vec4(0.35, 0.4, 0.45, 0.5);
// How far each octave spreads the clouds' shape, fully in: its standard
// deviation, measured from the volume. The shape comes out close to normal
// round 0.5, spread by these together.
const vec4 SPREAD = vec4(0.110, 0.081, 0.043, 0.014);
// The least the cut of the clouds' shape blends over (see cloudAt)
const float CLOUD_EDGE = 0.05;

// One octave of the clouds' shape: smooth noise rounded by a share of billows
float cloudOctave(vec4 n, float billows) {
  return (n.r - 0.5) * (1.0 - billows) + (n.g - 0.5) * billows;
}

// The clouds' coarsest octave at q: two reads, turned and scaled against
// each other, averaged (and spread back out), so it never repeats
vec4 cloudBase(vec3 q, float texels, out float w) {
  vec4 a = detailAt(q * S0, texels, w);
  vec4 b = detailAt(TURN * TURN * q * (S0 * 1.29) + vec3(0.37, 0.11, 0.73), texels, w);
  return 0.5 + (a + b - 1.0) * 0.7071;
}

// How much of each of the clouds' octaves is in where a pixel is fp across
vec4 cloudWeights(float fp) {
  vec4 texels = fp * 64.0 * vec4(S0, S1, S2, S3) * CLOUD_GRAIN;
  return vec4(octaveWeight(texels.x), octaveWeight(texels.y), octaveWeight(texels.z), octaveWeight(texels.w));
}

// The clouds' broad fields: a slow octave, SL tiles a radius, that gathers
// the cover into large clusters with open sea between rather than an even
// scatter of puffs. Taken in from where its tiles are about 230 pixels
// across (fully by about 460), ahead of the finer octaves, and kept in all
// the way down, so the clusters only grow as the camera falls. Read twice
// and averaged, like cloudBase, so it never repeats. Returns its part of
// the shape (FIELDS of it, fully in); w is how much of it is in.
const float SL = 12.0;
const float FIELDS = 0.8;
// How far the fields spread the shape, fully in (as SPREAD)
const float SPREAD_L = 0.147;
float cloudFields(vec3 q, float fp, out float w) {
  float texels = fp * SL * 64.0;
  w = smoothstep(0.28, 0.14, texels);
  if (w <= 0.0) return 0.0;
  float lod = max(log2(texels), 0.0);
  vec4 a = textureLod(uNoise, TURN * TURN * q * SL + vec3(0.53, 0.29, 0.81), lod);
  vec4 b = textureLod(uNoise, TURN * q * (SL * 1.29) + vec3(0.17, 0.62, 0.38), lod);
  return cloudOctave(0.5 + (a + b - 1.0) * 0.7071, 0.1) * FIELDS * w;
}

// The clouds' detail at q (world space), fp the world size of a pixel
// there, over their broad fields there (fields, from cloudFields): x, their
// billowy shape, about normal round 0.5 (see SPREAD); y, the shape from the
// fields and its two coarsest octaves alone, and z, the rounded lumps of
// their billows alone (see coarseShape). warp is a sideways nudge for the
// map's read, in texels.
vec3 cloudDetail(vec3 q, float fp, float fields, out vec2 warp) {
  float w0, w1, w2, w3;
  vec4 texels = fp * 64.0 * vec4(S0, S1, S2, S3) * CLOUD_GRAIN;
  vec4 n0 = cloudBase(q, texels.x, w0);
  vec4 n1 = detailAt(TURN * q * S1 + (n0.rbr - 0.5) * 0.7 * CLOUD_SWIRL, texels.y, w1);
  vec4 n2 = detailAt(TURN * TURN * q * S2 + (n1.rbr - 0.5) * 0.7 * CLOUD_SWIRL, texels.z, w2);
  vec4 n3 = detailAt(TURN * q * S3 + (n2.rbr - 0.5) * 0.45 * CLOUD_SWIRL, texels.w, w3);
  warp = (n1.rb - 0.5) * w1 * 2.0 + (n2.rb - 0.5) * w2 * 1.0 + (n3.rb - 0.5) * w3 * 0.5;
  vec4 b = BILLOWS * CLOUD_BILLOW;
  float coarse = 0.5 + fields + cloudOctave(n0, b.x) * w0 * 0.6 + cloudOctave(n1, b.y) * w1 * 0.45;
  float shape = coarse + cloudOctave(n2, b.z) * w2 * 0.24 + cloudOctave(n3, b.w) * w3 * 0.08;
  float lumps = (n0.g - 0.5) * w0 * 0.6 + (n1.g - 0.5) * w1 * 0.15;
  return vec3(shape, coarse, lumps);
}

// The billowy shape from the fields and cloudDetail()'s two coarsest
// octaves alone, read the same way (x), and the rounded lumps of their
// billows alone (y): for where only the clouds' larger forms matter (their
// relief to the sun, and their shadows)
vec2 coarseShape(vec3 q, float fp, float fields) {
  float w0, w1;
  vec2 texels = fp * 64.0 * vec2(S0, S1) * CLOUD_GRAIN.xy;
  vec4 n0 = cloudBase(q, texels.x, w0);
  vec4 n1 = detailAt(TURN * q * S1 + (n0.rbr - 0.5) * 0.7 * CLOUD_SWIRL, texels.y, w1);
  vec4 b = BILLOWS * CLOUD_BILLOW;
  float shape = 0.5 + fields + cloudOctave(n0, b.x) * w0 * 0.6 + cloudOctave(n1, b.y) * w1 * 0.45;
  return vec2(shape, (n0.g - 0.5) * w0 * 0.6 + (n1.g - 0.5) * w1 * 0.15);
}

// How much of the sky is cloud, 0 to 1, from the map's cover m. The map's
// middling cloud is broken cloud too fine for it to show, so it counts for
// more than it reads (its faintest, haze, doesn't). As the camera comes
// down (uGather) the cloud there thickens, and more forms in clusters
// (cluster, a large slow noise) with clear sky between, most where the
// region round it (mr, the map read wide) is cloudy already; nearing the
// deck (uDeep) it closes over.
float cloudCoverAt(float m, float mr, float cluster) {
  float c = smoothstep(0.05, 0.6, m);
  c += (1.0 - c) * uGather * 0.9 * pow(c, 0.75);
  c += (1.0 - c) * uGather * (0.06 + 0.55 * cluster) * (0.4 + 0.6 * smoothstep(0.04, 0.3, mr));
  c += (1.0 - c) * smoothstep(0.0, 0.6, uDeep) * (0.35 + 0.55 * cluster);
  return c;
}

// Where to cut a shape spread about normally round 0.5 (by spread) so that
// it's above the cut over a share cover of the sky: the normal's inverse,
// near enough, from the logistic
float coverCut(float cover, float spread) {
  float c = clamp(cover, 0.004, 0.996);
  return 0.5 - spread * log(c / (1.0 - c)) * 0.5876;
}

// Close in, cloud fills as much of the shape as its cover allows: thin
// cover breaks into scattered puffs, thick cover into whole cloud with a
// few holes. The shape is cut where its spread (how far the octaves in at
// this zoom spread it) puts that share of it above the cut, so there's as
// much cloud however much detail is in, and the edges blend over soft.
// Thin puffs are a little translucent; the cut lets a little more through
// to make up for it.
float cloudBody(float shape, float cover, float spread, float soft) {
  float opacity = mix(0.8, 1.0, smoothstep(0.15, 0.75, cover));
  float cut = coverCut(cover / opacity, sqrt(spread * spread + soft * soft / 3.0));
  return smoothstep(cut - soft, cut + soft, shape) * opacity;
}

// The cloud layer at a point (world space, on the drifted map; fields, its
// broad fields there): x its density, y its cover, z its shape's fields and
// coarse octaves alone (uncut), w the rounded lumps of its billows; m
// comes back with the map's own cover. From
// afar the density is the cover. Close in, as the noise's detail comes in
// (shows; spread is how far its octaves spread the shape), it's the noise's
// shapes cut to the cover (cloudBody), and the map, magnified, is read soft
// (soft, the gradients' scale) so its texels don't show as steps. The
// cut's edges blend over a share of the spread, and never over less than
// CLOUD_EDGE of the shape: so as the first octave comes in it only mottles
// the cover, then gathers it into soft puffs as it grows, and the cloud
// never breaks into specks or shows a jagged edge. (As the octaves only come
// in once their billows are large on screen, see CLOUD_GRAIN, no octave
// moves the shape by more than about half its spread from one pixel to the
// next, so that edge is always several pixels wide: smooth at any zoom.)
vec4 cloudAt(vec3 wc, float fields, vec2 uv, vec4 gc, float soft, float fp, float shows, float spread, float mr, float cluster, out float m) {
  vec2 warp;
  vec3 dt = cloudDetail(wc, fp, fields, warp);
  float texel = 1.0 / float(textureSize(uCloudMap, 0).x);
  m = textureGrad(uCloudMap, uv + warp * shows * texel, gc.xy * soft, gc.zw * soft).r;
  float cover = cloudCoverAt(m, mr, cluster);
  float edge = max(0.8 * spread, CLOUD_EDGE);
  return vec4(mix(cover, cloudBody(dt.x, cover, spread, edge), shows), cover, dt.y, dt.z);
}

// The billowy shape the clouds take close in: the fields and the first
// three of cloudDetail()'s octaves, read the same way, so the deck below
// matches the layer it takes over from (the finest only lightly, or the
// deck's tops would crumple). The fields change so slowly that the pixel's
// own (fields) serve for every point the deck is read at.
float cloudShape(vec3 q, float fields) {
  float w;
  vec4 n0 = cloudBase(q, 0.0, w);
  vec4 n1 = textureLod(uNoise, TURN * q * S1 + (n0.rbr - 0.5) * 0.7 * CLOUD_SWIRL, 0.0);
  vec4 n2 = textureLod(uNoise, TURN * TURN * q * S2 + (n1.rbr - 0.5) * 0.7 * CLOUD_SWIRL, 0.0);
  vec4 b = BILLOWS * CLOUD_BILLOW;
  return 0.5 + fields + cloudOctave(n0, b.x) * 0.6 + cloudOctave(n1, b.y) * 0.45 + cloudOctave(n2, b.z) * 0.16;
}
// How far cloudShape() spreads (the fields and its three octaves together,
// see SPREAD and SPREAD_L)
const float DECK_SPREAD = 0.203;

// The height of the deck's tops above the ground at a point of the sphere
// (world space, unit length; fields, see cloudShape), for a cover: they
// rise and fall over the billows of the shape, sink a little in the
// troughs between clusters, and where the cover doesn't let the shape
// through (cut as the layer's is, so the deck has as much cloud as the
// layer it takes over from) sink away into gaps
float deckTop(vec3 u, float fields, float cover, float cluster) {
  float shape = cloudShape(u, fields);
  float cut = coverCut(cover, DECK_SPREAD);
  float k = remap(shape, cut - 0.125, cut + 0.125);
  return DECK_HI - BILLOW * (1.0 - smoothstep(0.2, 0.8, shape)) - HOLE * (1.0 - sqrt(k)) - TROUGH * (1.0 - cluster);
}

// Wisps of the fog inside the deck, 0 to 1, drifting on the wind
float wispAt(vec3 q, vec3 wind) {
  vec4 a = textureLod(uNoise, TURN * q * 240.0 + wind, 0.0);
  vec4 b = textureLod(uNoise, q * 760.0 + (a.rbr - 0.5) * 0.8 + wind * 2.5, 0.0);
  return smoothstep(0.3, 0.72, a.r * 0.65 + b.r * 0.35);
}

// Sparks that leave the lit limb and drift outward, fading as they go.
// Cells in polar space: each fragment checks only its own cell and the
// two beside it, so the cost doesn't grow with the number of sparks.
float sparks(vec2 p) {
  float r = length(p);
  if (r < 0.98 || r > 1.9) return 0.0;
  float a = atan(p.y, p.x);
  float sunA = atan(uSun.y, uSun.x);
  float arc = cos(a - sunA);                         // 1 facing the sun
  if (arc < 0.0) return 0.0;
  const float CELLS = 220.0;
  float cellW = 2.0 * PI / CELLS;
  float id = floor(a / cellW);
  float total = 0.0;
  for (int i = -1; i <= 1; i++) {
    float c = id + float(i);
    float seed = hash12(vec2(c, 7.31));
    if (seed > 0.55) continue;                        // most cells are empty
    float speed = 0.035 + 0.06 * hash12(vec2(c, 1.7));
    float life = fract(uTime * speed + seed * 9.0);
    float pr = 1.0 + life * (0.35 + 0.55 * hash12(vec2(c, 3.9)));
    float pa = (c + 0.5 + (hash12(vec2(c, 5.2)) - 0.5) * 0.8) * cellW + life * 0.05;
    vec2 pos = pr * vec2(cos(pa), sin(pa));
    vec2 d = p - pos;
    // A short streak along the way it's travelling
    vec2 dir = vec2(cos(pa), sin(pa));
    float along = dot(d, dir), across = dot(d, vec2(-dir.y, dir.x));
    float size = 0.0035 + 0.004 * hash12(vec2(c, 8.8));
    float s = exp(-(across * across) / (size * size) - (along * along) / (size * size * 9.0));
    float fade = smoothstep(0.0, 0.08, life) * (1.0 - life) * (1.0 - life);
    total += s * fade * pow(max(arc, 0.0), 1.6);
  }
  return total;
}

// Fine gold dust in the space around the planet
float dust(vec2 frag) {
  vec2 cell = floor(frag / 26.0);
  float h = hash12(cell);
  if (h > 0.06) return 0.0;
  vec2 pos = (cell + vec2(hash12(cell + 3.1), hash12(cell + 8.7))) * 26.0;
  float d = length(frag - pos);
  float tw = 0.55 + 0.45 * sin(uTime * (0.6 + 2.0 * h * 16.0) + h * 60.0);
  return smoothstep(1.6, 0.0, d) * tw * (0.35 + 0.65 * hash12(cell + 1.3));
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 px = frag - uCenter;
  vec2 p = px / uRadius;                             // the planet's outline is the unit circle
  float r = length(p);
  float aa = 1.5 / uRadius;                          // one device pixel, in disc units

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  Ray ray = rayAt(px);
  vec3 toCam = -ray.d;
  // How far the look has gone from the night's gold crescent to the Earth's own colours
  float dayMix = smoothstep(0.08, 0.75, uDaylight);

  // Space: gold dust, sparks, and the glow of the atmosphere off the limb
  vec2 sunDir2 = normalize(uSun.xy);
  float facing = max(dot(normalize(p + 1e-5), sunDir2), 0.0);
  if (r > 1.0 - aa) {
    float t = max(r - 1.0, 0.0);
    // Gold all the way round: bright on the sun's side, round the night
    // side a fine thread hugging the limb, never a broad, dim (brown) band
    float halo = exp(-t * 9.0) * (0.06 + 0.94 * pow(facing, 2.2));
    float haze = exp(-t * 2.6) * 0.16 * pow(facing, 1.5);
    float thread = exp(-t * 60.0) * 0.16 * (1.0 - facing);
    col += goldLight(halo + haze + thread) * (1.0 - 0.35 * dayMix);
    col += GOLD_PALE * sparks(p) * 1.6;
    col += GOLD_HI * dust(frag) * 0.55;
    if (dayMix > 0.0) {
      // By day the sunlit limb's air shows as a thin bright line
      float sunOn = smoothstep(-0.2, 0.5, dot(p / max(r, 1e-5), uSun.xy));
      float ring = exp(-t * 110.0) * 0.45 + exp(-t * 30.0) * 0.08;
      col += mix(GOLD_PALE, vec3(0.86, 0.92, 1.0), 0.35) * ring * sunOn * dayMix;
    }
  }

  // The planet and its clouds, worked out for every pixel (and blended at
  // the edge): the image reads use screen derivatives, which mustn't sit in
  // a branch. Past the outline the rays are held to it.
  vec3 n = normalize(hitSphere(ray, 1.0));
  mat3 toWorld = rotX(uTilt);
  vec3 w = rotY(uSpin) * (toWorld * n);
  vec4 g;
  vec2 uv = sphereUv(w, g);
  float fp = max(length(dFdx(w)), length(dFdy(w)));  // the world size of a pixel on the ground
  // The cloud layer, CLOUD_H up, so it slides against the ground under
  // perspective and stands a hair proud of the limb. Its map has drifted east.
  mat3 toCloud = rotY(uSpin - uDrift) * toWorld;
  vec3 nc = normalize(hitSphere(ray, 1.0 + CLOUD_H));
  vec3 wc = toCloud * nc;
  vec4 gc;
  vec2 uvc = sphereUv(wc, gc);
  float fpc = max(length(dFdx(wc)), length(dFdy(wc)));
  float nv = dot(n, toCam);                          // 1 facing the camera, 0 on the limb
  float ndl = dot(n, uSun);                          // 1 under the sun, below 0 at night

  // The cloud layer's cover and colour, laid over the planet below
  vec3 cloudCol = vec3(0.0);
  float cloudA = 0.0;
  float cloudLit = 0.0;
  float cloudCover = 0.0;
  // How close in the cloud map is: its texels a pixel or more across. Past
  // that it's read soft, so its texels never show as steps, and softer
  // still once the noise's detail is in, which then draws the edges (the
  // map, magnified, has only its texels and its JPEG blocks to give).
  float cloudMag = 2.0 * PI / float(textureSize(uCloudMap, 0).x) / fpc;
  float cloudNear = smoothstep(0.7, 2.5, cloudMag) * uNoiseReady;
  // How far the noise's octaves in at this zoom spread the clouds' shape,
  // all of them and the two coarsest, and how much each shows: the detail
  // takes over only as it comes in (until then the cloud is the map's)
  vec4 octaves = cloudWeights(fpc);
  float fieldsIn = 0.0;
  float fields = uClouds > 0.0 ? cloudFields(wc, fpc, fieldsIn) : 0.0;
  float spread = length(vec2(length(SPREAD * octaves), SPREAD_L * fieldsIn));
  float spreadC = length(vec3(SPREAD.xy * octaves.xy, SPREAD_L * fieldsIn));
  float shows = smoothstep(0.01, 0.045, spread) * uNoiseReady;
  float showsC = smoothstep(0.01, 0.045, spreadC) * uNoiseReady;
  float soft = max(1.0, cloudMag * mix(1.5, 3.0, smoothstep(0.03, 0.1, spread) * uNoiseReady));
  // The region's cover: the map read wide (a degree and a half or more)
  float mr = textureLod(uCloudMap, uvc, max(4.0, 1.0 - log2(cloudMag))).r;
  // Fading out over the poles, where the map reads the ice as cloud
  float polar = 1.0 - smoothstep(1.12, 1.24, abs(0.5 - uvc.y) * PI);
  // Clusters: where more cloud gathers as the camera comes down, and where
  // the deck's tops stand highest (so only wanted on the way down). Only
  // once they're broad on screen (their tiles 300 pixels or so): smaller,
  // they'd mottle the thin cover like camouflage.
  float cluster = 0.0;
  if (uClouds > 0.0 && (uGather > 0.0 || uDeep > 0.0)) {
    vec3 qc = TURN * wc * 28.0;
    float texels = fpc * 28.0 * 64.0;
    cluster = smoothstep(0.35, 0.65, textureLod(uNoise, qc, max(log2(texels), 0.0)).r);
    cluster *= smoothstep(-1.0, -2.5, log2(texels));
  }
  // (Once the deck has closed over, none of the planet below it shows, and
  // none of it is worked out)
  if (uClouds > 0.0 && uDeep >= 0.6 && uDeep < 1.0) {
    // Faded out under the deck: only its cover still counts, for the deck's
    cloudCover = cloudCoverAt(textureGrad(uCloudMap, uvc, gc.xy * soft, gc.zw * soft).r, mr, cluster) * polar;
  }
  if (uClouds > 0.0 && uDeep < 0.6) {
    float m;
    vec4 dc = cloudAt(wc, fields, uvc, gc, soft, fpc, shows, spread, mr, cluster, m);
    float d = dc.x;
    cloudCover = dc.y * polar;
    // As uClouds rises the thicker cloud forms first, then the thin; once
    // it's all in, every cloud shows at its own density
    float forming = smoothstep(1.0 - 1.4 * uClouds, 1.4 - 1.4 * uClouds, d);
    cloudA = d * forming * polar * smoothstep(0.0, 0.25, uClouds);
    // Relief: the cloud a little way towards the sun. Where it thins that
    // way this is the sunward side of a cloud, catching the light; where it
    // thickens, the far side, in its own shade. From afar the map's say;
    // close in, the shapes' larger forms, a few pixels off.
    vec3 sunW = toCloud * uSun;
    vec3 along = sunW - wc * dot(sunW, wc);
    vec3 wr = normalize(wc + along * mix(0.004, max(fpc * 14.0, 0.0005) / max(length(along), 1e-4), cloudNear));
    float mR = textureGrad(uCloudMap, lonLat(wr), gc.xy * soft * 2.0, gc.zw * soft * 2.0).r;
    float coverR = cloudCoverAt(mR, mr, cluster);
    float relief = clamp((d - coverR) * 3.0, -1.0, 1.0);
    if (cloudNear > 0.0) {
      // Close in, from three slopes: of the cut cloud (its edges, once the
      // detail's in), of the rounded lumps of its billows (once they're big
      // enough on screen to read as billows, not grain), and at every scale
      // of the map's own cover. Gently, so a cloud reads as soft and round,
      // not streaked; the far side greys less than the sunward side brightens.
      // (the edges' slope from the cut taken soft, so it shades the cloud
      // round towards its edge rather than in hard-edged bands)
      // (the fields read again there, so a cluster's own slope shades it)
      float fieldsInR;
      vec2 sR = coarseShape(wr, fpc, cloudFields(wr, fpc, fieldsInR));
      float edgeSoft = 1.6 * spreadC + 0.03;
      float edge = (cloudBody(dc.z, dc.y, spreadC, edgeSoft) - cloudBody(sR.x, coverR, spreadC, edgeSoft)) * showsC;
      float billows = smoothstep(14.0, 50.0, 0.0028 / fpc);
      float r = edge * 1.6 + (dc.w - sR.y) * 4.0 * billows + (m - mR) * 3.0 * (1.0 - 0.5 * billows);
      relief = mix(relief, clamp(r < 0.0 ? r * 0.6 : r, -1.0, 1.0), cloudNear);
      // (thin cloud, a veil the ground shows through, lit flatter: shaded
      // like a thick one it reads as smog)
      relief *= mix(1.0, smoothstep(0.15, 0.6, d), cloudNear);
    }
    float cdl = dot(nc, uSun);
    cloudLit = smoothstep(-0.12, 0.25, cdl);
    // Cloud takes the sunlight whiter than the ground does, and the low
    // sun's warmth only in a narrow band at the terminator
    vec3 sunCol = mix(LOW_SUN, mix(GOLD_PALE, mix(SUNLIGHT, vec3(1.0), 0.4), dayMix), smoothstep(0.0, 0.24, cdl));
    float high = 0.58 + 0.46 * pow(max(cdl, 0.0), 0.5);
    // From afar: white, a touch shaded by the relief
    vec3 lit = vec3(0.99, 0.98, 0.97) * sunCol * (0.86 + 0.14 * relief) * high;
    if (cloudNear > 0.0) {
      // Close in, lit as the deck's tops are: by their slope to the sun,
      // cool in their shade, the thick of a cloud brighter than its thin edges
      float lam = clamp(0.68 + 0.36 * relief, 0.42, 1.0);
      // (thin cover's puffs a touch greyer than a closed field; not the
      // thin cover itself before the puffs show, which would go to smog)
      float ao = mix(0.82, 1.0, smoothstep(0.15, 0.85, d)) * mix(0.88, 1.0, smoothstep(0.3, 0.9, dc.y));
      ao = mix(1.0, ao, shows);
      vec3 close = sunCol * (0.54 + 0.44 * lam) * ao * high / 0.95;
      close += vec3(0.04, 0.08, 0.15) * (1.0 - lam) + vec3(1.0, 0.68, 0.26) * pow(lam, 4.0) * 0.1;
      lit = mix(lit, close, cloudNear);
    }
    // Where the sun is low on them, cloud tops catch it in gold
    lit += vec3(1.0, 0.72, 0.24) * exp(-sq((cdl - 0.05) / 0.08)) * 0.2;
    // On the night side, cloud is a neutral dark grey, the cities' glow through it
    cloudCol = mix(NIGHT_CLOUD, lit, cloudLit);
    // At the deck, the marched volume takes over from the layer, once the
    // field has all but closed
    cloudA *= 1.0 - smoothstep(0.25, 0.6, uDeep);
  }

  if (uDeep < 1.0) {
    // Where full day has the ground well lit, the night image doesn't show
    // (its lights are out, the day's images have its land): it isn't read
    bool sunlit = dayMix >= 1.0 && uDayReady >= 1.0 && uWaterReady >= 1.0 && ndl > 0.25;
    vec3 tex = vec3(0.0), texNear = vec3(0.0), texBlur = vec3(0.0), texWide = vec3(0.0);
    if (!sunlit) {
      tex = earthAt(uv, g, 0.0);
      texNear = earthAt(uv, g, 1.6);                 // each city a little larger
      texBlur = earthAt(uv, g, 3.0);                 // a soft halo round each city
      texWide = earthAt(uv, g, 5.0);                 // and the glow of a whole region
    }
    float lum = dot(tex, vec3(0.299, 0.587, 0.114));
    float warm = tex.r - tex.b;
    float lights = smoothstep(0.008, 0.16, warm) * smoothstep(0.07, 0.42, lum);
    float lightsBlur = smoothstep(0.0, 0.08, texBlur.r - texBlur.b) * smoothstep(0.04, 0.24, dot(texBlur, vec3(0.299, 0.587, 0.114)));
    float lightsNear = smoothstep(0.004, 0.11, texNear.r - texNear.b) * smoothstep(0.05, 0.32, dot(texNear, vec3(0.299, 0.587, 0.114)));
    float lightsWide = smoothstep(-0.01, 0.05, texWide.r - texWide.b) * smoothstep(0.03, 0.16, dot(texWide, vec3(0.299, 0.587, 0.114)));
    float land = smoothstep(0.04, 0.11, lum);

    // Cities twinkle a little, each on its own clock
    vec2 cityCell = floor(vec2(atan(w.x, w.z), asin(w.y)) * 380.0);
    float tw = 0.82 + 0.18 * sin(uTime * (0.8 + 2.4 * hash12(cityCell)) + hash12(cityCell + 4.0) * 40.0);

    float day = smoothstep(0.2, 0.62, ndl);          // a thin sunlit crescent on the limb
    vec3 ground = mix(NIGHT_SEA, NIGHT_LAND, land);
    ground += vec3(0.05, 0.051, 0.054) * land * smoothstep(0.1, 0.3, lum); // ice and desert, faintly
    vec3 surface = ground;
    // Bright cores, then a glow in the lights' colour falling off round them.
    // The hub's colours are soft, so they're pushed twice as rich here, the
    // cores only lightly paled and the halos spread wider, for the colour to
    // read clearly against the dark.
    float night = 1.0 - day * 0.75;
    // The pointer's torch: cities near it burn brighter and the land shows faintly
    vec2 tp = (frag - uPointer) / uRadius;
    float torch = uTorch * exp(-dot(tp, tp) / 0.045);
    night *= (1.0 + 2.2 * torch) * (1.0 - 0.55 * uDim);
    surface += vec3(0.074, 0.075, 0.079) * land * torch;
    vec3 lightRich = clamp(mix(vec3(dot(uLight, vec3(0.299, 0.587, 0.114))), uLight, 2.0), 0.0, 1.0);
    vec3 lightPale = mix(lightRich, vec3(1.0), 0.3);
    vec3 lightDeep = lightRich * 0.7;
    vec3 core = mix(lightRich, lightPale, smoothstep(0.45, 1.0, lights));
    surface += core * lights * 1.7 * tw * night;
    surface += lightRich * lightsNear * 0.75 * tw * night;
    surface += mix(lightDeep, lightRich, lightsBlur) * lightsBlur * 0.85 * night;
    surface += lightDeep * lightsWide * 0.6 * night;
    vec3 nightSide = surface;
    // The crescent lit in gold light, the land in it brighter than the sea:
    // the gold's own hue, paling only where it's bright (see goldLight), and
    // falling away fast towards the terminator, so its fade is short
    surface = mix(surface, goldLight(0.3 + 0.55 * land), day * day * 0.75);

    // Where the sun's ray to this point crosses the cloud layer, it's in shade
    // (until the layer has given way to the deck)
    float shade = 0.0;
    if (uClouds > 0.0 && uDeep < 0.6) {
      // From the clouds' larger forms only, so the shade falls soft
      vec3 ws = toCloud * normalize(n + uSun * (SHADOW_H / max(ndl, 0.2)));
      float mS = textureGrad(uCloudMap, lonLat(ws), g.xy * soft * 2.0, g.zw * soft * 2.0).r;
      float coverS = cloudCoverAt(mS, mr, cluster);
      float fieldsInS;
      float fieldsS = cloudFields(ws, fp, fieldsInS);
      float ds = mix(coverS, cloudBody(coarseShape(ws, fp, fieldsS).x, coverS, spreadC, 0.7 * spreadC + 0.01), showsC);
      // Close in, as dark as the cloud casting it is thick, and only under
      // its dense parts (the larger forms read here are fuller than the
      // frayed puffs seen): thin puffs cast next to nothing, so their
      // shadows can't read as dirt
      float thickS = mix(1.0, smoothstep(0.3, 0.8, coverS), cloudNear);
      float body = mix(smoothstep(0.1, 0.75, ds), smoothstep(0.35, 0.85, ds), cloudNear);
      shade = body * thickS * polar * smoothstep(0.0, 0.3, uClouds) * smoothstep(-0.05, 0.2, ndl) * 0.42;
    }

    // Day: the Blue Marble, graded warm, lit by a sun that turns amber as it
    // gets low, a gold glint off the water, a warm band of twilight along
    // the terminator, and the night (with its lights) beyond it
    if (uDaylight > 0.0) {
      // Close in, the image's texels grow past a pixel: it's read a little
      // soft (its JPEG blocks would show) and the noise gives the detail,
      // nudging the read so edges wander and mottling the land
      float size = float(textureSize(uDay, 0).x);
      float mag = 2.0 * PI / size / fp;              // pixels a texel spans
      float near = smoothstep(0.7, 2.5, mag) * uNoiseReady * uDayReady;
      vec2 warp = vec2(0.0);
      vec2 dt = vec2(0.0);
      if (near > 0.0) {
        // The noise volume repeats (every 1/150 of a radius here), which close
        // in would show as a weave: a slow, gentle jog (from a coarse mip, so
        // it bends without combing) breaks it up.
        // Read a little soft, as its finest grain would too.
        vec3 wq = w * 1.7;
        wq += (textureLod(uNoise, TURN * wq * 7.5, 2.0).rbr - 0.5) * (1.2 / S0);
        dt = (detail(wq, fp * 3.4, warp).xy - vec2(0.5, 0.0)) * near;
      }
      vec2 uvd = uv + warp * near / size;
      float kLand = max(1.0, 1.5 * mag);
      float kSea = max(1.0, 2.0 * mag);
      vec3 bm = textureGrad(uDay, uvd, g.xy * kLand, g.zw * kLand).rgb;
      vec3 bmSea = near > 0.0 ? textureGrad(uDay, uvd, g.xy * kSea, g.zw * kSea).rgb : bm;
      // The coast held crisp at any zoom, roughened by the noise. (Lakes the
      // mask holds only faintly, the image shows near black: close in those
      // are water too, or their shores would ring dark.)
      float wm = mapAt(uWater, uvd, g, 0.0);
      float kw = 0.5 * min(1.0, 1.5 / max(mag * 0.5, 1e-3));
      float lake = smoothstep(0.045, 0.02, dot(bm, vec3(0.299, 0.587, 0.114)));
      wm = max(smoothstep(0.5 - kw, 0.5 + kw, wm + dt.y * 0.4), lake * near);
      // Until the images arrive: the night image's land, plainly coloured
      bm = mix(mix(OCEAN, vec3(0.32, 0.30, 0.21), land), bm, uDayReady);
      bmSea = mix(OCEAN, bmSea, uDayReady);
      float water = mix(1.0 - land, wm, uWaterReady);
      // The sea: its own depths, darkened to a deep, rich blue
      // Close in the sea floor's depths (in the image) are calmed, as the sea
      // itself would hide them
      bmSea = mix(bmSea, vec3(0.04, 0.1, 0.23), near * 0.45);
      // and where the image's coast is coarser than the mask, the land it
      // smears into the water is taken out
      bmSea = mix(bmSea, vec3(0.03, 0.08, 0.2), smoothstep(-0.02, 0.06, max(bmSea.r, bmSea.g) - bmSea.b) * near);
      vec3 sea = bmSea * vec3(0.42, 0.66, 0.8) * (1.0 + dt.y * 0.12) + vec3(0.0, 0.004, 0.012);
      // The land: a little less saturated, as from orbit, mottled close in
      vec3 soil = mix(vec3(dot(bm, vec3(0.299, 0.587, 0.114))), bm, 0.8) * 0.86;
      soil *= 1.0 + dt.x * 0.35 + dt.y * 0.45;
      soil = mix(soil, soil * vec3(0.94, 1.03, 0.92), clamp(dt.y * 2.0, 0.0, 1.0));
      vec3 albedo = mix(soil, sea, water);
      // (the low sun's amber only in a narrow band at the terminator: wider,
      // it browns the land and sea all down that side)
      vec3 sunCol = mix(LOW_SUN, mix(GOLD_PALE, SUNLIGHT, dayMix), smoothstep(0.0, 0.26, ndl));
      float diffuse = pow(clamp(ndl * 1.04 + 0.02, 0.0, 1.0), 0.8);
      vec3 lit = albedo * sunCol * diffuse * 1.3 * (1.0 - shade);
      // The sun's glint off the water: a soft gold sheen round a pale core
      vec3 h = normalize(uSun + toCam);
      float nh = max(dot(n, h), 0.0);
      float glint = pow(nh, 260.0) * 0.55 + pow(nh, 45.0) * 0.2 + pow(nh, 10.0) * 0.05;
      lit += mix(GOLD, GOLD_PALE, smoothstep(0.1, 0.6, glint)) * glint * water * smoothstep(0.0, 0.15, ndl) * (1.0 - shade * 1.6);
      // Twilight: a thin gold band where the sun is on the horizon, richest towards the limb
      lit += vec3(1.0, 0.72, 0.22) * exp(-sq((ndl - 0.03) / 0.055)) * (0.04 + 0.1 * (1.0 - nv));
      vec3 dayLook = lit + nightSide * (1.0 - smoothstep(-0.12, 0.14, ndl));
      surface = mix(surface, dayLook, dayMix);
    }

    // The clouds over it, and on the night side the cities glowing dimly through.
    // Close in, sunlit cloud is never darker than the ground under it, so a
    // thin puff's shaded side can't read as a smudge of dirt.
    if (uClouds > 0.0) {
      vec3 cityGlow = nightSide - ground;
      vec3 over = mix(cloudCol, max(cloudCol, surface), cloudLit * cloudNear);
      surface = mix(surface, over, cloudA) + cityGlow * cloudA * 0.3 * (1.0 - cloudLit);
    }

    // The terminator darkens the far side so the planet reads as round
    surface *= 0.55 + 0.45 * smoothstep(-0.9, 0.2, ndl + nv * 0.4);
    // Limb: a fresnel rim of gold light added over it (after the darkening,
    // which would dim it to brown), brightest on the sun side: bright and
    // tight to the edge, with only a little of it reaching in, so the gold
    // meets the dark as a clean edge of light rather than a dim gold wash
    float limb = max(1.0 - nv, 0.0);
    vec3 rim = goldLight((pow(limb, 5.0) + pow(limb, 2.6) * 0.3) * (0.12 + 0.96 * pow(facing, 1.8)));
    if (dayMix > 0.0) {
      // By day the sunlit air thickens towards the limb, blue where the sun
      // is high and gold where it's low, under the gold rim
      float sunUp = smoothstep(-0.1, 0.35, ndl);
      // (kept off the gold side of the limb, where blue over gold would go green)
      vec3 air = mix(vec3(1.0, 0.74, 0.3), vec3(0.72, 0.82, 1.0), smoothstep(0.0, 0.28, ndl)) * pow(limb, 3.0) * 0.42 * sunUp * (1.0 - 0.7 * facing * facing);
      vec3 edgeGold = goldLight(pow(limb, 7.0) * (0.25 + 0.75 * pow(facing, 1.5)));
      rim = mix(rim, air + edgeGold, dayMix);
    }
    surface += rim;

    // Coming down: the air thickens between the camera and the ground,
    // sunlit and warm, more of it towards the screen's edges
    if (uHaze > 0.0) {
      vec3 air = mix(vec3(0.62, 0.76, 0.98), vec3(1.0, 0.9, 0.74), 0.4) * 0.85;
      float k = uHaze * (0.1 + 0.3 * pow(max(1.0 - nv, 0.0), 1.5)) * smoothstep(-0.1, 0.3, ndl);
      surface = mix(surface, air, k);
    }

    float edge = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, r);
    col = mix(col, surface * uReady + STONE * 0.4 * (1.0 - uReady), edge);
    alpha = max(alpha, edge);

    // The cloud layer's own outline stands a little proud of the planet's
    if (uClouds > 0.0) {
      float sc = 1.0 + CLOUD_H;
      float over = cloudA * (1.0 - smoothstep(sc - aa, sc + aa, sqrt(ray.h2))) * (1.0 - edge) * uReady;
      col = mix(col, cloudCol, over);
      alpha = max(alpha, over);
    }
  } else {
    // Under the closed deck the ground only shows through its few gaps,
    // far below and hazed
    col = vec3(0.16, 0.24, 0.38);
    alpha = 1.0;
  }

  // The deck. From above, a sea of cloud tops: the ray is stepped down
  // through the deck until it passes under their height (from where it
  // enters the top, or the camera once inside, to the base), and they're
  // lit by their slope to the sun, with the hollows between in soft, cool
  // shade. Inside, the camera is in cloud: a bright, sunlit fog with wisps
  // drifting through it closes in, thickest under the tops, until there's
  // nothing else to see. (Not marched at all until it starts to show.)
  if (uDeep > 0.25) {
    float hi = 1.0 + DECK_HI;
    float inside = smoothstep(hi + 0.001, hi - 0.0025, uDist);
    // Down to the deck's base, or once inside, on down through the fog
    float lo = 1.0 + mix(DECK_LO, FOG_LO, inside);
    float tIn = max(ray.tc - sqrt(max(hi * hi - ray.h2, 0.0)), 0.0);
    float tOut = ray.tc - sqrt(max(lo * lo - ray.h2, 0.0));
    float cover = mix(cloudCover, 1.0, smoothstep(0.5, 1.0, uDeep)) * smoothstep(0.0, 0.25, uClouds);
    vec3 sunW = toCloud * uSun;
    vec3 mist = vec3(1.0, 0.975, 0.94);
    vec3 wind = vec3(uTime * 0.006, 0.0, uTime * 0.0025);
    float jitter = hash12(frag + fract(uTime * 7.31) * 97.0);
    // From above, the tops are a thin band and a few steps find them; the
    // fog inside takes more
    const int STEPS = 12;
    int steps = inside > 0.0 ? STEPS : 8;
    float dt = max(tOut - tIn, 0.0) / float(steps);
    // The fog all the way down (T, L), and as far as the tops (Ts, Ls)
    float T = 1.0, Ts = 1.0;
    vec3 L = vec3(0.0), Ls = vec3(0.0);
    float tHit = -1.0;
    float gapBefore = 1.0;
    for (int i = 0; i < STEPS; i++) {
      if (i >= steps || dt <= 0.0 || T < 0.01) break;
      float t = tIn + (float(i) + jitter) * dt;
      vec3 v = vec3(0.0, 0.0, uDist) + ray.d * t;
      vec3 q = toCloud * v;
      // Once deep in, everything is fog and the tops needn't be found
      float gap = inside < 1.0 ? length(v) - 1.0 - deckTop(normalize(q), fields, cover, cluster) : -1.0;
      if (gap < 0.0 && tHit < 0.0) {
        // Under the tops: back up to where the ray crossed them
        tHit = t - dt * clamp(-gap / max(gapBefore - gap, 1e-6), 0.0, 1.0);
        Ts = T;
        Ls = L;
        if (inside <= 0.0) break;
      }
      gapBefore = gap;
      if (inside > 0.0) {
        float wisp = wispAt(q, wind);
        float fog = inside * DECK_SIGMA * (0.2 + 0.8 * wisp * wisp + 1.2 * step(gap, 0.0));
        float a = 1.0 - exp(-fog * dt);
        L += T * a * mist * (0.9 + 0.13 * wisp);
        T *= 1.0 - a;
      }
    }
    vec3 top = col;
    if (tHit >= 0.0 && inside < 1.0) {
      vec3 v = vec3(0.0, 0.0, uDist) + ray.d * tHit;
      vec3 u = normalize(toCloud * v);
      float h0 = length(v) - 1.0;
      // The tops' slope, from their height a little way off in two
      // directions along the ground
      vec3 e1 = normalize(cross(u, vec3(0.0, 1.0, 0.0)));
      vec3 e2 = cross(u, e1);
      const float EPS = 0.0002;
      float t0 = deckTop(u, fields, cover, cluster);
      float g1 = (deckTop(normalize(u + e1 * EPS), fields, cover, cluster) - t0) / EPS;
      float g2 = (deckTop(normalize(u + e2 * EPS), fields, cover, cluster) - t0) / EPS;
      vec3 nTop = normalize(u - (e1 * g1 + e2 * g2) * 0.7);
      float lam = clamp(dot(nTop, sunW) * 0.5 + 0.55, 0.0, 1.0);
      // Hollows and gaps sit in shade
      float ao = mix(0.78, 1.0, smoothstep(DECK_HI - BILLOW - HOLE * 0.6 - TROUGH, DECK_HI - BILLOW * 0.2, h0));
      top = mix(SUNLIGHT, vec3(1.0), 0.3) * (0.5 + 0.56 * lam) * ao;
      top += vec3(0.04, 0.08, 0.15) * (1.0 - lam) + vec3(1.0, 0.68, 0.26) * pow(lam, 4.0) * 0.1;
      // Seen through the air below the camera, a little hazed
      top = mix(top, mix(vec3(0.62, 0.76, 0.98), vec3(1.0, 0.9, 0.74), 0.4) * 0.9, uHaze * 0.12);
      // Going in, they whiten into the fog
      top = mix(top, mist * 0.96, smoothstep(0.0, 0.5, inside));
    }
    vec3 seen = tHit >= 0.0 ? Ls + Ts * top : L + T * col;
    vec3 fogged = L + T * top;
    // In the cloud, the sun's side of it glows a little gold
    fogged += vec3(1.0, 0.8, 0.45) * 0.07 * smoothstep(0.0, 1.0, dot(normalize(px + 1e-5), sunDir2)) * min(length(px) / uResolution.y, 1.0);
    float deckIn = smoothstep(0.25, 0.6, uDeep);
    col = mix(col, mix(seen, fogged, inside), deckIn);
    alpha = max(alpha, deckIn * (tHit >= 0.0 ? 1.0 : 1.0 - T));
  }

  // Premultiplied: the page's stone shows wherever the canvas is clear
  col = clamp(col, 0.0, 1.0);
  float a = clamp(max(alpha, max(col.r, max(col.g, col.b))), 0.0, 1.0);
  outColor = vec4(col, a);
}
`;

// The noise volume the planet reads its fine detail from, drawn once at
// start, a slice at a time, into a 64-texel cube (nothing to download).
// Every channel tiles, so the volume repeats without a seam. r and b are
// smooth (gradient) noise, g Worley billows and a larger Worley billows,
// each three octaves, stretched to fill 0 to 1.
export const NOISE_FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
precision highp int;
uniform float uSlice;   // which slice, 0 to 63
out vec4 outColor;
const float N = 64.0;

float hash(ivec3 c, int seed) {
  uvec3 u = uvec3(c);
  uint h = (u.x * 0x27d4eb2du) ^ (u.y * 0x165667b1u) ^ (u.z * 0x61c88647u) ^ (uint(seed) * 0x2c1b3c6du);
  h = (h ^ (h >> 15u)) * 0x85ebca6bu;
  h = (h ^ (h >> 13u)) * 0xc2b2ae35u;
  return float(h ^ (h >> 16u)) / 4294967296.0;
}

// A cell wrapped into the tile (% isn't defined for negative ints here)
ivec3 wrapCell(ivec3 c, int period) {
  return c - period * ivec3(floor(vec3(c) / float(period)));
}

// Gradient noise at a point given in cells, tiling every period cells; about -1 to 1
float gradientNoise(vec3 p, int period, int seed) {
  vec3 i0 = floor(p);
  vec3 f = p - i0;
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float total = 0.0;
  for (int k = 0; k < 2; k++) {
    for (int j = 0; j < 2; j++) {
      for (int i = 0; i < 2; i++) {
        vec3 o = vec3(i, j, k);
        ivec3 c = wrapCell(ivec3(i0) + ivec3(i, j, k), period);
        // A random direction for the corner
        float gz = hash(c, seed) * 2.0 - 1.0;
        float ga = hash(c, seed + 101) * 6.2831853;
        float gr = sqrt(1.0 - gz * gz);
        vec3 d = f - o;
        vec3 wgt = mix(1.0 - u, u, o);
        total += (gr * cos(ga) * d.x + gr * sin(ga) * d.y + gz * d.z) * wgt.x * wgt.y * wgt.z;
      }
    }
  }
  return total * 1.6;
}

// Worley billows at a point given in cells, tiling every period cells: 1 on a cell's point, falling to 0
float billows(vec3 p, int period, int seed) {
  vec3 i0 = floor(p);
  float near = 9.0;
  for (int k = -1; k <= 1; k++) {
    for (int j = -1; j <= 1; j++) {
      for (int i = -1; i <= 1; i++) {
        ivec3 c = ivec3(i0) + ivec3(i, j, k);
        ivec3 w = wrapCell(c, period);
        vec3 d = vec3(c) + vec3(hash(w, seed), hash(w, seed + 7), hash(w, seed + 13)) - p;
        near = min(near, dot(d, d));
      }
    }
  }
  return 1.0 - min(sqrt(near), 1.0);
}

void main() {
  vec3 pos = vec3(floor(gl_FragCoord.xy), uSlice) / N;
  float r = 0.0, g = 0.0, b = 0.0, a = 0.0;
  float f = 4.0, amp = 0.5;
  for (int o = 0; o < 3; o++) {
    int period = int(f);
    r += gradientNoise(pos * f, period, 1) * amp;
    b += gradientNoise(pos * f, period, 2) * amp;
    g += billows(pos * f, period, 3) * (o == 0 ? 0.625 : amp);
    a += billows(pos * f * 0.5, period / 2, 4) * (o == 0 ? 0.625 : amp);
    f *= 2.0;
    amp *= 0.5;
  }
  outColor = clamp(vec4(0.5 + r * 1.15, (g - 0.2) * 1.8, 0.5 + b * 1.15, (a - 0.2) * 1.8), 0.0, 1.0);
}
`;

// Arcs: great circles between the cities WorldStreet connects, lifted off
// the surface, drawn as lines in a second pass with the same spin and tilt.
// A faint thread, and a bright pulse running along it on its own clock.
// Points behind the planet are hidden. With the perspective camera they're
// projected through it as the planet pass casts its rays.
export const ARC_VERTEX_SHADER = /* glsl */ `#version 300 es
in vec3 aPoint;   // on or above the unit sphere, in world space
in float aT;      // 0 to 1 along the arc
in float aSeed;   // the arc's own clock
uniform vec2 uResolution;
uniform vec2 uCenter;
uniform float uRadius;
uniform float uFocal;       // perspective: focal length, device pixels
uniform float uDist;        // perspective: the camera's distance from the centre, radii; 0 for the flat view
uniform float uFade;        // 0 to 1: faded out as the camera comes down near them
uniform float uSpin;
uniform float uTilt;
uniform float uPointSize;   // device pixels; only used when drawn as points
out float vT;
out float vSeed;
out float vVisible;

mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }

void main() {
  // The planet pass turns view into world; this turns world back into view
  vec3 v = rotX(-uTilt) * (rotY(-uSpin) * aPoint);
  if (uDist > 0.0) {
    // Through the camera: nearer points spread wider
    vec2 screen = uCenter + v.xy * (uFocal / max(uDist - v.z, 1e-3));
    gl_Position = vec4(screen / uResolution * 2.0 - 1.0, 0.0, 1.0);
    // Hidden where the line of sight to the point meets the planet first:
    // d the way to the point, tc how far along it passes nearest the centre
    // and h2 how near, squared (from the cross product, exact even far off)
    vec3 e = v - vec3(0.0, 0.0, uDist);
    float len = length(e);
    vec3 d = e / len;
    float tc = -uDist * d.z;
    float h2 = uDist * uDist * dot(d.xy, d.xy);
    float behind = 0.0;
    if (h2 < 1.0 && tc > 0.0) behind = smoothstep(0.0, 0.06, len - (tc - sqrt(1.0 - h2)));
    vVisible = (1.0 - behind) * uFade * step(v.z, uDist - 1e-3);
  } else {
    vec2 screen = uCenter + v.xy * uRadius;
    gl_Position = vec4(screen / uResolution * 2.0 - 1.0, 0.0, 1.0);
    float outside = smoothstep(0.995, 1.01, length(v.xy));
    vVisible = max(smoothstep(-0.02, 0.06, v.z), outside) * uFade;
  }
  vT = aT;
  vSeed = aSeed;
  gl_PointSize = uPointSize;
}
`;

export const ARC_FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
in float vT;
in float vSeed;
in float vVisible;
uniform float uTime;
out vec4 outColor;
const vec3 GOLD = vec3(0.918, 0.702, 0.031);
const vec3 GOLD_PALE = vec3(0.992, 0.902, 0.541);

void main() {
  float head = fract(uTime * (0.09 + 0.05 * vSeed) + vSeed * 7.0) * 1.4 - 0.2;
  float d = vT - head;
  // A sharp front with a tail trailing behind it
  float pulse = d > 0.0 ? exp(-d * d * 2600.0) : exp(d * 14.0);
  float ends = smoothstep(0.0, 0.06, vT) * smoothstep(1.0, 0.94, vT);
  float a = (0.16 + 0.95 * pulse) * ends * vVisible;
  vec3 col = mix(GOLD, GOLD_PALE, pulse) * a;
  outColor = vec4(col, a * 0.85);   // premultiplied, blended additively
}
`;

// Launch arcs: one-off flights out from one place to others. The arc vertex
// shader passes each arc's launch time in vSeed. The head runs the route in
// uTravel seconds, a thread is left behind it, and each point of the thread
// fades from the moment the head passed it, so the flight dissolves from
// where it started.
export const LAUNCH_FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
in float vT;
in float vSeed;
in float vVisible;
uniform float uTime;
uniform float uTravel;
out vec4 outColor;
const vec3 GOLD = vec3(0.918, 0.702, 0.031);
const vec3 GOLD_PALE = vec3(0.992, 0.902, 0.541);

void main() {
  float since = uTime - vSeed - vT * uTravel;    // how long ago the head passed this point
  if (since < 0.0) discard;                      // not reached yet
  float head = exp(-since * since * 300.0);
  float thread = 0.6 * exp(-since * 1.3);
  float ends = smoothstep(0.0, 0.03, vT);
  float a = (thread + head * 2.0) * ends * vVisible;
  if (a < 0.003) discard;
  outColor = vec4(mix(GOLD, GOLD_PALE, head) * a, a);   // premultiplied, blended additively
}
`;

// A launch arc's head: the same buffer drawn as soft round points, lit only
// near the head, so a small gold comet visibly runs each flight.
export const LAUNCH_HEAD_FRAGMENT_SHADER = /* glsl */ `#version 300 es
precision highp float;
in float vT;
in float vSeed;
in float vVisible;
uniform float uTime;
uniform float uTravel;
out vec4 outColor;
const vec3 GOLD_HI = vec3(0.980, 0.800, 0.082);
const vec3 GOLD_PALE = vec3(0.992, 0.902, 0.541);

void main() {
  float since = uTime - vSeed - vT * uTravel;
  if (since < 0.0) discard;
  float head = exp(-since * since * 220.0);
  vec2 pc = gl_PointCoord * 2.0 - 1.0;
  float a = head * exp(-dot(pc, pc) * 3.2) * vVisible * 0.85;
  if (a < 0.004) discard;
  outColor = vec4(mix(GOLD_HI, GOLD_PALE, head) * a, a);   // premultiplied, blended additively
}
`;
