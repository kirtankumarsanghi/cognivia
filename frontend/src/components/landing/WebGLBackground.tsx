import { useEffect, useRef } from 'react';

export default function WebGLBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Sync the WebGL drawing-buffer size with the CSS-driven layout size.
    function syncSize() {
      if (!canvas) return;
      const w = canvas.clientWidth || 1280;
      const h = canvas.clientHeight || 720;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    }
    
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(syncSize);
      resizeObserver.observe(canvas);
    }
    syncSize();

    const gl = canvas.getContext('webgl') || (canvas.getContext('experimental-webgl') as WebGLRenderingContext);
    if (!gl) return;

    const vs = `attribute vec2 a_position;
varying vec2 v_texCoord;
void main() {
  v_texCoord = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;
    
    const fs = `precision highp float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float pulse(vec2 uv, float t, float offset) {
    float d = length(uv);
    float ripple = smoothstep(0.4, 0.0, abs(d - t * 1.5));
    return ripple * (1.0 - t);
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    vec2 mouse = (u_mouse.xy * 2.0 - u_resolution.xy) / min(u_resolution.x, u_resolution.y);
    
    // Deep Navy Base from Confusion Pulse DS
    vec3 color = vec3(0.04, 0.05, 0.08); 
    
    // Subtle animated grid
    vec2 gridUV = uv * 15.0;
    vec2 grid = abs(fract(gridUV - 0.5) - 0.5) / fwidth(gridUV);
    float line = 1.0 - min(grid.x, grid.y);
    color += line * 0.02 * vec3(0.2, 0.4, 0.8);

    // Multi-layered Pulse Rings
    for(float i=0.0; i<4.0; i++) {
        float t = fract(u_time * 0.2 + i * 0.25);
        // Amber and Orange accents for confusion peaks
        vec3 pulseColor = mix(vec3(1.0, 0.6, 0.1), vec3(0.9, 0.2, 0.1), i/4.0);
        float p = pulse(uv - mouse * 0.2, t, i);
        color += p * pulseColor * 0.4;
    }
    
    // Ambient Atmosphere
    float vignette = 1.0 - length(uv) * 0.5;
    color *= vignette;
    
    // Glowing focal point near mouse
    float glow = 0.03 / length(uv - mouse * 0.5);
    color += glow * vec3(0.1, 0.3, 0.6);

    gl_FragColor = vec4(color, 1.0);
}`;

    function createShader(type: number, source: string) {
      if(!gl) return null;
      const s = gl.createShader(type);
      if(!s) return null;
      gl.shaderSource(s, source);
      gl.compileShader(s);
      return s;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vs);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fs);
    
    if(!vertexShader || !fragmentShader) return;

    const prog = gl.createProgram();
    if(!prog) return;
    gl.attachShader(prog, vertexShader);
    gl.attachShader(prog, fragmentShader);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    
    const pos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes = gl.getUniformLocation(prog, 'u_resolution');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    const mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    
    const onMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width && rect.height) {
        const nx = (event.clientX - rect.left) / rect.width;
        const ny = 1.0 - (event.clientY - rect.top) / rect.height;
        mouse.x = nx * canvas.width;
        mouse.y = ny * canvas.height;
      }
    };
    
    window.addEventListener('mousemove', onMouseMove);

    let animationFrameId: number;

    function render(t: number) {
      if (!canvas || !gl) return;
      if (typeof ResizeObserver === 'undefined') syncSize();
      gl.viewport(0, 0, canvas.width, canvas.height);
      if (uTime) gl.uniform1f(uTime, t * 0.001);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationFrameId = requestAnimationFrame(render);
    }
    
    render(0);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      if (resizeObserver && canvas) {
        resizeObserver.unobserve(canvas);
      }
    };
  }, []);

  return (
    <div style={{ display: 'block', width: '100%', height: '100%', minHeight: '200px' }}>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }}></canvas>
    </div>
  );
}
