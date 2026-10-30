/* The experts' glowing table (hero and closing CTA), with light running along its lines.
   A WebGL pass over the photo: it finds the bright cyan lines in the image itself, then sends soft pulses along
   them, each with a soft head, a fading trail and a blurred bloom. Under the cursor the lines light up and the
   pulses quicken. The <img> stays underneath as the fallback.
   <div data-lightlines data-dir="1" data-top=".6">: dir 1 runs the light right to left (toward the people in the CTA),
   -1 left to right (out from them in the hero); top is where the table starts, as a fraction of the image height. */
(() => {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll("[data-lightlines]").forEach(scene => {
    const img = scene.querySelector("img");
    if (!img) return;
    const DIR = parseFloat(scene.dataset.dir || "1"), TOP = parseFloat(scene.dataset.top || ".6");

    const cv = document.createElement("canvas");
    cv.className = "ll-fx";
    cv.setAttribute("aria-hidden", "true");
    const gl = cv.getContext("webgl", { alpha: false, antialias: false, premultipliedAlpha: false });
    if (!gl) return;
    img.after(cv);

    const VS = `attribute vec2 p; varying vec2 v; void main(){ v = vec2(p.x * .5 + .5, .5 - p.y * .5); gl_Position = vec4(p, 0., 1.); }`;
    const FS = `precision mediump float;
      uniform sampler2D img; uniform vec4 map; uniform vec2 px, mouse; uniform float t, hov, asp, dir, top; varying vec2 v;
      // the lines: bright and cyan, and only on the table (the spotlight and the lit shirts are cyan too)
      float line(vec2 uv){
        vec3 c = texture2D(img, uv).rgb;
        return smoothstep(.1, .22, (c.g + c.b) * .5 - c.r) * smoothstep(.62, .95, max(c.g, c.b)) * smoothstep(top - .03, top + .03, uv.y);
      }
      void main(){
        vec2 uv = v * map.xy + map.zw;
        vec3 col = texture2D(img, uv).rgb;
        // two rings of taps: a near halo and a wide soft one, so the light blooms off the line instead of sitting on it
        float m = line(uv), h1 = 0., h2 = 0.;
        for (int i = 0; i < 8; i++) {
          vec2 d = vec2(cos(float(i) * .785 + .39), sin(float(i) * .785 + .39)) * px;
          h1 += line(uv + d * 6.); h2 += line(uv + d * 16.);
        }
        h1 /= 8.; h2 /= 8.;
        float glow = m * 1.1 + h1 * .8 + h2 * .6;
        vec3 cy = vec3(.55, .95, 1.);
        // pulses run along x (dir); each line gets its own offset so they don't move as one sheet
        float f = fract(dir * uv.x * 1.3 + t + .45 * sin(uv.y * 19. + 1.3) + .2 * sin(uv.y * 47.));
        float pulse = smoothstep(0., .06, f) * exp(-f * 7.);
        col += glow * pulse * cy;
        // hover: the lines under the cursor light up
        vec2 d = (v - mouse) * vec2(asp, 1.);
        col += (m * .6 + h1 * 1.2 + h2 * 1.6) * exp(-dot(d, d) * 14.) * hov * cy;
        gl_FragColor = vec4(min(col, 1.), 1.);
      }`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pg = gl.createProgram();
    gl.attachShader(pg, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(pg, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pg);
    if (!gl.getProgramParameter(pg, gl.LINK_STATUS)) { cv.remove(); return; }
    gl.useProgram(pg);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const U = n => gl.getUniformLocation(pg, n);
    const uMap = U("map"), uPx = U("px"), uT = U("t"), uMouse = U("mouse"), uHov = U("hov"), uAsp = U("asp");
    gl.uniform1f(U("dir"), DIR);
    gl.uniform1f(U("top"), TOP);

    let ready = false, on = false, raf = 0, iw = 1, ih = 1;
    // the pulses' phase is integrated so they can speed up under the cursor without jumping
    let phase = 0, last = 0, hov = 0, hovTo = 0;

    // the same cover crop and object-position as the <img>, so the canvas sits exactly on it
    const fit = () => {
      const r = cv.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, r.width < 820 ? 1 : 1.5);
      gl.uniform1f(uAsp, r.width / Math.max(1, r.height));
      cv.width = Math.max(1, Math.round(r.width * dpr));
      cv.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, cv.width, cv.height);
      const [px, py] = getComputedStyle(img).objectPosition.split(" ").map(s => parseFloat(s) / 100);
      const k = Math.max(r.width / iw, r.height / ih), w = iw * k, h = ih * k;
      gl.uniform4f(uMap, r.width / w, r.height / h, -((r.width - w) * px) / w, -((r.height - h) * py) / h);
      gl.uniform2f(uPx, 1 / iw, 1 / ih);
    };
    const frame = now => {
      const dt = last ? Math.min((now - last) / 1000, .1) : 0;
      last = on ? now : 0;
      hov += (hovTo - hov) * Math.min(1, dt * 4);
      phase = (phase + dt * (.14 + .16 * hov)) % 1;
      gl.uniform1f(uT, phase);
      gl.uniform1f(uHov, hov);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!cv.classList.contains("is-on")) cv.classList.add("is-on");
      raf = on ? requestAnimationFrame(frame) : 0;
    };
    const play = () => { if (ready && on && !raf) raf = requestAnimationFrame(frame); };

    const load = () => {
      const src = new Image();
      src.onload = () => {
        iw = src.naturalWidth; ih = src.naturalHeight;
        gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, src);
        ready = true;
        fit();
        play();
      };
      // the srcset candidate the <img> would pick, without waiting on its lazy load
      const need = cv.getBoundingClientRect().width * (devicePixelRatio || 1);
      const set = img.srcset.split(",").map(c => c.trim().split(/\s+/)).map(([u, w]) => [u, parseFloat(w)]).sort((a, b) => a[1] - b[1]);
      src.src = img.currentSrc || (set.find(([, w]) => w >= need) || set[set.length - 1] || [img.src])[0];
    };

    if (matchMedia("(hover: hover)").matches) {
      const sec = scene.closest("section") || scene;
      sec.addEventListener("pointermove", e => {
        const r = cv.getBoundingClientRect();
        gl.uniform2f(uMouse, (e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
        hovTo = 1;
      });
      sec.addEventListener("pointerleave", () => { hovTo = 0; });
    }

    new ResizeObserver(() => { if (ready) { fit(); if (!on) frame(performance.now()); } }).observe(cv);
    new IntersectionObserver(([e]) => {
      on = e.isIntersecting;
      if (on && !load.done) { load.done = true; load(); }
      play();
    }, { rootMargin: "200px" }).observe(scene);
  });
})();
