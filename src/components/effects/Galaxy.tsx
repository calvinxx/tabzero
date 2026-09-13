// Adapted from React Bits Galaxy; see THIRD_PARTY_NOTICES.md.
// Original shaders, with a non-interactive background lifecycle and theme support.
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl'
import { useEffect, useRef } from 'react'

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;
uniform float uLightMode;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);

  vec2 gv = fract(uv) - 0.5; 
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);
      
      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;
      
      col += star * size * color;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec2 mouseNorm = uMouse - vec2(0.5);
  
  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0);
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  if (uLightMode > 0.5) {
    float energy = max(max(col.r, col.g), col.b);
    float coverage = clamp(smoothstep(0.0, 0.42, energy) * 0.92, 0.0, 0.92);
    vec3 ink = clamp(col * 0.48, 0.0, 0.82);
    gl_FragColor = vec4(mix(vec3(1.0), ink, coverage), 1.0);
  } else if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`;

export default function Galaxy() {
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const host = container.current
    if (!host) return
    let cleanup = () => {}
    try {
      const renderer = new Renderer({ alpha: true, premultipliedAlpha: false, dpr: 1, powerPreference: 'low-power' })
      const gl = renderer.gl
      const releaseContext = () => {
        gl.canvas.remove()
        gl.getExtension('WEBGL_lose_context')?.loseContext()
      }
      cleanup = releaseContext
      const geometry = new Triangle(gl)
      const program = new Program(gl, {
        vertex: vertexShader,
        fragment: fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: new Color(1, 1, 1) },
          uFocal: { value: new Float32Array([0.5, 0.5]) },
          uRotation: { value: new Float32Array([1, 0]) },
          uStarSpeed: { value: 0.5 },
          uDensity: { value: 1 },
          uHueShift: { value: 220 },
          uSpeed: { value: 0.35 },
          uMouse: { value: new Float32Array([0.5, 0.5]) },
          uGlowIntensity: { value: 0.3 },
          uSaturation: { value: 0.15 },
          uMouseRepulsion: { value: false },
          uTwinkleIntensity: { value: 0.2 },
          uRotationSpeed: { value: 0.025 },
          uRepulsionStrength: { value: 0 },
          uMouseActiveFactor: { value: 0 },
          uAutoCenterRepulsion: { value: 0 },
          uTransparent: { value: true },
          uLightMode: { value: 0 }
        }
      })
      const mesh = new Mesh(gl, { geometry, program })
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
      let frame = 0
      let elapsed = 0
      let lastTime = 0
      let lost = false

      const draw = () => {
        try { renderer.render({ scene: mesh }); return true }
        catch { lost = true; cleanup(); return false }
      }
      const stop = () => { cancelAnimationFrame(frame); frame = 0; lastTime = 0 }
      const update = (now: number) => {
        if (lastTime) elapsed += Math.min(now - lastTime, 100) / 1000
        lastTime = now
        program.uniforms.uTime.value = elapsed
        program.uniforms.uStarSpeed.value = 0.5 + elapsed * 0.05
        if (draw()) frame = requestAnimationFrame(update)
      }
      const sync = () => {
        stop()
        if (lost || document.hidden) return
        const light = document.documentElement.dataset.theme !== 'dark'
        program.uniforms.uLightMode.value = light ? 1 : 0
        gl.clearColor(light ? 1 : 0, light ? 1 : 0, light ? 1 : 0, light ? 1 : 0)
        if (draw() && !motion.matches) frame = requestAnimationFrame(update)
      }
      const resize = () => {
        const width = host.clientWidth
        const height = host.clientHeight
        // ponytail: cap the background at 1440px wide; raise only if visible pixelation warrants it.
        const scale = Math.min(1, 1440 / Math.max(width, 1))
        renderer.setSize(Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale)))
        program.uniforms.uResolution.value = new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
        sync()
      }
      const onLost = () => { lost = true; stop(); gl.canvas.style.display = 'none' }
      const themeObserver = new MutationObserver(sync)
      const sizeObserver = new ResizeObserver(resize)
      let disposed = false
      cleanup = () => {
        if (disposed) return
        disposed = true
        stop()
        themeObserver.disconnect()
        sizeObserver.disconnect()
        motion.removeEventListener('change', sync)
        document.removeEventListener('visibilitychange', sync)
        gl.canvas.removeEventListener('webglcontextlost', onLost)
        geometry.remove()
        program.remove()
        releaseContext()
      }
      host.appendChild(gl.canvas)
      gl.canvas.addEventListener('webglcontextlost', onLost)
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
      sizeObserver.observe(host)
      motion.addEventListener('change', sync)
      document.addEventListener('visibilitychange', sync)
      resize()
    } catch {
      // Any initialization failure falls back to the normal page background.
      cleanup()
    }
    return cleanup
  }, [])

  return <div ref={container} className="galaxy-background" aria-hidden="true" />
}
