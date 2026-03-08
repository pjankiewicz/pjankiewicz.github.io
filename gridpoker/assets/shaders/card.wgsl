#import bevy_sprite::mesh2d_vertex_output::VertexOutput
#import bevy_sprite::mesh2d_view_bindings::globals

// Material uniforms (bind group = MATERIAL_BIND_GROUP)
struct CardUniforms {
    // Effect flags (0.0 = off, 1.0 = on, or intensity)
    isotope: f32,
    isotope_activated: f32,
    isotope_phase: f32,
    enriched: f32,
    anchored: f32,
    highlight: f32,
    dimmed: f32,
    worn_seed: f32,
    highlight_color: vec4<f32>, // xyz = color, w = unused
};

@group(#{MATERIAL_BIND_GROUP}) @binding(0) var<uniform> material: CardUniforms;
@group(#{MATERIAL_BIND_GROUP}) @binding(1) var base_texture: texture_2d<f32>;
@group(#{MATERIAL_BIND_GROUP}) @binding(2) var base_sampler: sampler;

// ── Helpers ──

fn hash22(p: vec2<f32>) -> f32 {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

fn noise2d(p: vec2<f32>, seed: f32) -> f32 {
    let ps = p + vec2(seed, seed);
    let i = floor(ps);
    let f = fract(ps);
    let u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(hash22(i), hash22(i + vec2(1.0, 0.0)), u.x),
        mix(hash22(i + vec2(0.0, 1.0)), hash22(i + vec2(1.0, 1.0)), u.x),
        u.y
    );
}

// ── HSL conversion ──

fn hue2rgb(s: f32, t: f32, h: f32) -> f32 {
    let hs = (h % 1.0) * 6.0;
    if hs < 1.0 { return (t - s) * hs + s; }
    if hs < 3.0 { return t; }
    if hs < 4.0 { return (t - s) * (4.0 - hs) + s; }
    return s;
}

fn rgb2hsl(c: vec4<f32>) -> vec4<f32> {
    let lo = min(c.r, min(c.g, c.b));
    let hi = max(c.r, max(c.g, c.b));
    let delta = hi - lo;
    let sum = hi + lo;
    var hsl = vec4(0.0, 0.0, 0.5 * sum, c.a);
    if delta < 0.0001 { return hsl; }
    if hsl.z < 0.5 { hsl.y = delta / sum; } else { hsl.y = delta / (2.0 - sum); }
    if hi == c.r      { hsl.x = (c.g - c.b) / delta; }
    else if hi == c.g { hsl.x = (c.b - c.r) / delta + 2.0; }
    else              { hsl.x = (c.r - c.g) / delta + 4.0; }
    hsl.x = (hsl.x / 6.0) % 1.0;
    return hsl;
}

fn hsl2rgb(c: vec4<f32>) -> vec4<f32> {
    if c.y < 0.0001 { return vec4(vec3(c.z), c.a); }
    var t: f32;
    if c.z < 0.5 { t = c.y * c.z + c.z; } else { t = -c.y * c.z + (c.y + c.z); }
    let s = 2.0 * c.z - t;
    return vec4(
        hue2rgb(s, t, c.x + 1.0/3.0),
        hue2rgb(s, t, c.x),
        hue2rgb(s, t, c.x - 1.0/3.0),
        c.w
    );
}

// ── Effect functions ──

fn apply_isotope(color: vec3<f32>, uv: vec2<f32>, time: f32) -> vec3<f32> {
    let p = material.isotope_phase;
    let activated = material.isotope_activated;
    let speed = mix(0.8, 3.5, activated);
    let t = time * speed;

    let n1 = sin(uv.x * 8.0 + t * 0.7 + p) * cos(uv.y * 6.0 - t * 0.5 + p * 1.3);
    let n2 = sin(uv.y * 10.0 + t * 0.9 + p * 2.1) * cos(uv.x * 7.0 + t * 0.6 - p * 0.7);
    let n3 = sin((uv.x + uv.y) * 5.0 - t * 0.4 + p * 1.7) * 0.5;
    let slime = (n1 + n2 + n3) / 3.0;

    let blobEdge = mix(0.5, 0.25, activated);
    let blobs = smoothstep(-0.1, blobEdge, slime);

    let darkGreen = vec3(0.05, 0.15, 0.02);
    let brightGreen = vec3(0.22, 0.95, 0.08);
    let neonGreen = vec3(0.4, 1.0, 0.15);
    let slimeBase = mix(darkGreen, brightGreen, blobs);
    let slimeActive = mix(brightGreen, neonGreen, blobs);
    let slimeColor = mix(slimeBase, slimeActive, activated);

    let intensity = material.isotope;
    let blendIdle = 0.18 + 0.12 * intensity;
    let blendActive = 0.45 + 0.15 * intensity;
    let blend = mix(blendIdle, blendActive, activated);
    var result = mix(color, slimeColor, blend);

    // Edge drip
    let edgeDist = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
    let dripNoise = sin(uv.x * 20.0 + t + p * 3.0) * 0.03;
    let edgeWidth = mix(0.12, 0.2, activated);
    let edgeStr = mix(0.15 + 0.2 * intensity, 0.5, activated);
    let edgeGlow = smoothstep(edgeWidth + dripNoise, 0.0, edgeDist) * edgeStr;
    result.y = min(1.0, result.y + edgeGlow);

    // Pulse
    let pulse = sin(time * 12.0 + p * 2.0) * 0.5 + 0.5;
    result += vec3(0.02, 0.08, 0.01) * pulse * activated;

    return result;
}

fn apply_enriched(color: vec3<f32>, uv: vec2<f32>, time: f32) -> vec3<f32> {
    let hi = max(color.r, max(color.g, color.b));
    let delta = hi * 0.5;

    let t = time;
    let fac = 0.3 + sin((uv.x * 450.0 + sin(t * 6.0) * 180.0) - 700.0 * t)
            - sin((uv.x * 190.0 + uv.y * 30.0) + 1080.3 * t);

    var result = color;
    result.x = max(color.r, (1.0 - color.r) * delta * fac + color.r);
    result.y = max(color.g, (1.0 - color.g) * delta * fac * 0.7 + color.g);
    result.z = max(color.b, (1.0 - color.b) * delta * fac * 0.2 + color.b);
    return result;
}

fn apply_anchor(color: vec3<f32>, uv: vec2<f32>, alpha: f32) -> vec4<f32> {
    var hsl = rgb2hsl(vec4(color * 0.8 + 0.2 * vec3(1.0, 0.0, 0.0), alpha));
    hsl.y = 0.5;

    let width = 0.1;
    let d1 = uv.x + uv.y;
    let d2 = (1.0 - uv.x) + uv.y;
    let onX = (d1 > 1.0 - width && d1 < 1.0 + width) ||
              (d2 > 1.0 - width && d2 < 1.0 + width);

    if onX {
        hsl.x = 1.0;
        hsl.y = 0.7;
        hsl.z = hsl.z * 0.8;
    } else {
        hsl.y = hsl.y * 0.5;
        hsl.z = hsl.z * 0.7;
    }

    var result = hsl2rgb(hsl);
    if onX { result.w = alpha; } else { result.w = alpha * 0.3; }
    return result;
}

fn apply_highlight(color: vec3<f32>, uv: vec2<f32>, time: f32) -> vec3<f32> {
    let t = time;
    let hColor = material.highlight_color.xyz;

    // Scanning line
    let scanY = (t * 0.6) % 1.4 - 0.2;
    let scanDist = abs(uv.y - scanY);
    let scanLine = smoothstep(0.06, 0.0, scanDist);
    let scanGlow = smoothstep(0.18, 0.0, scanDist) * 0.3;

    // Border glow
    let edgeDist = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
    let borderPulse = 0.6 + 0.4 * sin(t * 4.0);
    let border = smoothstep(0.1, 0.0, edgeDist) * borderPulse;

    // Corner accents
    let cTL = length(uv);
    let cTR = length(uv - vec2(1.0, 0.0));
    let cBL = length(uv - vec2(0.0, 1.0));
    let cBR = length(uv - vec2(1.0, 1.0));
    let corners = (smoothstep(0.35, 0.0, cTL) + smoothstep(0.35, 0.0, cTR)
                 + smoothstep(0.35, 0.0, cBL) + smoothstep(0.35, 0.0, cBR)) * 0.25;

    let effect = scanLine * 0.5 + scanGlow + border * 0.4 + corners * 0.2;
    return color + hColor * effect;
}

fn apply_worn(color: vec3<f32>, uv: vec2<f32>, alpha: f32) -> vec4<f32> {
    let seed = material.worn_seed;

    // Age tint
    var aged = color;
    aged.x = min(1.0, aged.x * 1.03 + 0.015);
    aged.y = min(1.0, aged.y * 0.99);
    aged.z = aged.z * 0.92;

    // Stains
    let stainN = noise2d(uv * 3.0, seed * 3.0);
    let stain = smoothstep(0.62, 0.72, stainN);
    aged = mix(aged, aged * 0.8 + vec3(0.03, 0.02, 0.0), stain * 0.2);

    // Foxing spots
    let fox = noise2d(uv * 12.0, seed * 17.0);
    let foxSpot = smoothstep(0.85, 0.89, fox);
    aged = mix(aged, aged * 0.7 + vec3(0.08, 0.05, 0.02), foxSpot * 0.25);

    // Edge fraying
    let edgeDist = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
    let edgeN = noise2d(uv * 30.0, seed * 11.0);
    let fray = smoothstep(0.0, 0.025 + edgeN * 0.02, edgeDist);

    // Corner wear
    let cTL = length(uv);
    let cTR = length(uv - vec2(1.0, 0.0));
    let cBL = length(uv - vec2(0.0, 1.0));
    let cBR = length(uv - vec2(1.0, 1.0));
    let cMin = min(min(cTL, cTR), min(cBL, cBR));
    let cornerWear = smoothstep(0.3, 0.0, cMin) * 0.12;
    aged = mix(aged, aged * 0.65 + vec3(0.03, 0.02, 0.0), cornerWear);

    return vec4(aged, alpha * fray);
}

fn apply_dim(color: vec3<f32>, alpha: f32) -> vec4<f32> {
    var hsl = rgb2hsl(vec4(color, alpha));
    hsl.y = hsl.y * 0.5;
    hsl.z = hsl.z * 0.8;
    var result = hsl2rgb(hsl);
    result.w = alpha * 0.5;
    return result;
}

// ── Main fragment ──

@fragment
fn fragment(mesh: VertexOutput) -> @location(0) vec4<f32> {
    var tex = textureSample(base_texture, base_sampler, mesh.uv);
    if tex.a < 0.01 { discard; }

    let uv = mesh.uv;
    let time = globals.time;
    var color = tex.rgb;
    var alpha = tex.a;

    // Worn card effect (always applied with per-card seed)
    if material.worn_seed > 0.0 {
        let worn = apply_worn(color, uv, alpha);
        color = worn.rgb;
        alpha = worn.a;
    }

    // Isotope green slime
    if material.isotope > 0.0 {
        color = apply_isotope(color, uv, time);
    }

    // Enriched gold shimmer
    if material.enriched > 0.0 {
        color = apply_enriched(color, uv, time);
    }

    // Anchor X-pattern
    if material.anchored > 0.0 {
        let anchored = apply_anchor(color, uv, alpha);
        return anchored;
    }

    // Highlight scanning line
    if material.highlight > 0.0 {
        color = apply_highlight(color, uv, time);
    }

    // Dim (desaturate + darken) — lerp for partial dimming
    if material.dimmed > 0.0 {
        let dimmed_col = apply_dim(color, alpha);
        let d = material.dimmed;
        return vec4(mix(color, dimmed_col.rgb, d), mix(alpha, dimmed_col.a, d));
    }

    return vec4(color, alpha);
}
