/* Mobeeli — dot-matrix Indonesia flyover map (Unify band closer).
   Tilted 3D land view: the archipelago in bright blue dots fills the frame, camera drifts along
   the islands like a flyover; drag to pan; Jakarta marker + animated arcs to major cities.
   Attrs: lang="en|id", static (no auto-motion). Custom element name kept: <indo-globe>. */
(() => {
  if (customElements.get('indo-globe')) return;
  const THREE_URL = 'https://unpkg.com/three@0.160.0/build/three.module.js';
  const ISLANDS = [
    [[95,5.7],[97.5,4.5],[100,0.5],[103,-2.5],[106,-6],[104.5,-6],[101,-3],[98,1],[95.5,3.5]],
    [[105.5,-6],[108,-6.3],[111,-6.5],[114.5,-7.5],[114.5,-8.5],[111,-8.2],[108,-7.8],[105.8,-7]],
    [[108.9,0.2],[109.5,1.8],[111.5,1.2],[113,3.2],[115,4.6],[117.4,3.9],[118.9,1.2],[117.5,-0.8],[116.3,-3.4],[114.5,-4],[112.5,-3.3],[110.2,-2.9],[109,-1.2]],
    [[118.8,0.6],[120.2,1.3],[120.8,0.9],[120.4,-1],[121.3,-2],[122.5,-3],[122.2,-4.5],[120.9,-5.6],[120.2,-5.5],[120.4,-3.2],[119.6,-2.2],[119.4,-0.7]],
    [[120.8,1.2],[122.7,1],[124.8,1.4],[125.2,1.6],[124.9,0.8],[122.9,0.4],[121,0.6]],
    [[122.4,-3.2],[123.2,-4],[123,-5.4],[122.3,-4.6]],
    [[130.8,-0.9],[132.9,-0.4],[134.2,-1.4],[135.5,-1.5],[136.5,-2.2],[138,-2.4],[140.9,-2.6],[141,-8],[138.5,-7.3],[137,-5],[135,-4.3],[133.5,-3.5],[132.2,-4],[131,-2.4],[130.3,-1.4]],
    [[114.8,-8.2],[125,-8.3],[125,-9.3],[114.8,-9]],
    [[127.4,1.8],[128.6,1.4],[128.3,0.3],[127.4,0.7]],
    [[127.9,-3],[130.8,-3.2],[130.6,-3.9],[128,-3.6]]
  ];
  const JKT = [106.8, -6.2];
  const CITIES = [[112.7,-7.25],[107.6,-6.9],[110.4,-7.0],[98.7,3.6],[119.4,-5.1],[116.8,-1.25]];
  const S = 0.16, LON0 = 117.75, LAT0 = -2.05;
  const inPoly = (x, y, p) => {
    let inside = false;
    for (let i = 0, j = p.length - 1; i < p.length; j = i++) {
      if ((p[i][1] > y) !== (p[j][1] > y) && x < (p[j][0] - p[i][0]) * (y - p[i][1]) / (p[j][1] - p[i][1]) + p[i][0]) inside = !inside;
    }
    return inside;
  };
  class IndoGlobe extends HTMLElement {
    static get observedAttributes() { return ['lang', 'static']; }
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      const sh = this.attachShadow({ mode: 'open' });
      sh.innerHTML = `
        <style>
          :host{position:relative;display:block;width:100%;height:100%;cursor:grab;touch-action:none;}
          :host(.drag){cursor:grabbing;}
          canvas{position:absolute;inset:0;display:block;}
          .lbl{position:absolute;transform:translate(-50%,-130%);white-space:nowrap;background:rgba(13,21,34,.78);border:1px solid rgba(91,155,247,.45);border-radius:999px;padding:6px 13px;font-size:12px;font-weight:700;color:#fff;backdrop-filter:blur(4px);pointer-events:none;opacity:0;transition:opacity .6s;}
          .lbl b{color:#5b9bf7;font-weight:800;}
          .fade{position:absolute;inset:0;pointer-events:none;background:radial-gradient(115% 100% at 50% 42%,transparent 58%,#0d1522 96%);}
        </style>
        <div class="fade"></div>
        <div class="lbl"><b>Jakarta</b>&nbsp;<span data-t>— first market, 2026</span></div>`;
      this._lbl = sh.querySelector('.lbl');
      this._setLblText();
      import(THREE_URL).then(T => this._init(T)).catch(e => console.error('indo-map init failed:', e && e.message));
    }
    _setLblText() {
      const t = this.shadowRoot && this.shadowRoot.querySelector('[data-t]');
      if (t) t.textContent = this.getAttribute('lang') === 'id' ? '— pasar pertama, 2026' : '— first market, 2026';
    }
    attributeChangedCallback(n) { if (n === 'lang') this._setLblText(); }
    _init(THREE) {
      const toM = (lon, lat, y) => new THREE.Vector3((lon - LON0) * S, y || 0, -(lat - LAT0) * S);
      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x0d1522, 6.5, 12.5);
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 60);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.shadowRoot.insertBefore(renderer.domElement, this.shadowRoot.querySelector('.fade'));
      const hash = (a, b) => { const s = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453; return s - Math.floor(s); };
      const mkPts = (arr, color, size, op) => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
        return new THREE.Points(g, new THREE.PointsMaterial({ color, size, transparent: true, opacity: op, sizeAttenuation: true }));
      };
      // Ocean grid
      const ocean = [];
      for (let lat = -18; lat <= 26; lat += 1.0) {
        for (let lon = 78; lon <= 158; lon += 1.0) {
          const v = toM(lon + hash(lon, lat) * 0.3, lat + hash(lat, lon) * 0.3, 0);
          ocean.push(v.x, v.y, v.z);
        }
      }
      scene.add(mkPts(ocean, 0x27395a, 0.028, 0.5));
      // Land dots (two layers for depth)
      const land = [], landHi = [];
      for (let lat = -10.8; lat <= 6.6; lat += 0.27) {
        for (let lon = 94.2; lon <= 141.6; lon += 0.27) {
          if (ISLANDS.some(p => inPoly(lon, lat, p))) {
            const h = 0.02 + hash(lon, lat) * 0.07;
            const v = toM(lon, lat, h);
            (hash(lat, lon) > 0.82 ? landHi : land).push(v.x, v.y, v.z);
          }
        }
      }
      scene.add(mkPts(land, 0x4a90f7, 0.034, 0.92));
      scene.add(mkPts(landHi, 0x9cc3ff, 0.04, 0.95));
      // Jakarta + cities + arcs
      const jv = toM(JKT[0], JKT[1], 0.03);
      const jkt = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
      jkt.position.copy(jv); scene.add(jkt);
      const ringG = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.008, 8, 40), new THREE.MeshBasicMaterial({ color: 0x5b9bf7, transparent: true, opacity: 0.7 }));
      ringG.rotation.x = -Math.PI / 2; ringG.position.copy(jv); scene.add(ringG);
      const movers = [];
      CITIES.forEach(c => {
        const cv = toM(c[0], c[1], 0.03);
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 10), new THREE.MeshBasicMaterial({ color: 0xd7e7ff }));
        m.position.copy(cv); scene.add(m);
        const mid = jv.clone().add(cv).multiplyScalar(0.5); mid.y = 0.35 + jv.distanceTo(cv) * 0.22;
        const curve = new THREE.QuadraticBezierCurve3(jv, mid, cv);
        scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(36)), new THREE.LineBasicMaterial({ color: 0x3f8bf8, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending })));
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending }));
        scene.add(dot);
        movers.push({ dot, curve, off: Math.random() });
      });
      // Camera rig: tilted flyover; drag pans, idle drifts along the islands
      let panX = -1.4, panZ = 0.2, drift = 0, dir = 1, dragging = false, lastX = 0, lastY = 0, idleAt = 0;
      let camX = panX, camZ = panZ;
      const applyCam = () => {
        camera.position.set(camX + drift, 3.6, 2.6 + camZ);
        camera.lookAt(camX + drift, 0, camZ - 0.1);
      };
      applyCam();
      this.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; this.classList.add('drag'); this.setPointerCapture(e.pointerId); });
      this.addEventListener('pointermove', e => {
        if (!dragging) return;
        panX = Math.max(-3.9, Math.min(3.9, panX - (e.clientX - lastX) * 0.006));
        panZ = Math.max(-0.7, Math.min(1.5, panZ - (e.clientY - lastY) * 0.005));
        lastX = e.clientX; lastY = e.clientY; idleAt = performance.now() + 3000;
      });
      const endDrag = () => { dragging = false; this.classList.remove('drag'); };
      this.addEventListener('pointerup', endDrag);
      this.addEventListener('pointercancel', endDrag);
      this._io = new IntersectionObserver(es => es.forEach(en => {
        if (en.isIntersecting && !dragging) { panX = -1.4; panZ = 0.2; idleAt = performance.now() + 2200; }
      }), { threshold: 0.35 });
      this._io.observe(this);
      const resize = () => {
        const w = this.clientWidth || 300, h = this.clientHeight || 300;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      this._ro = new ResizeObserver(resize); this._ro.observe(this);
      const tmp = new THREE.Vector3();
      const start = performance.now();
      const tick = () => {
        this._raf = requestAnimationFrame(tick);
        const now = performance.now(), t = (now - start) / 1000;
        const isStatic = this.hasAttribute('static');
        if (!isStatic && !dragging && now > idleAt) {
          drift += 0.0016 * dir;
          const edge = panX + drift;
          if (edge > 2.6) dir = -1;
          if (edge < -2.6) dir = 1;
        }
        camX += (panX - camX) * 0.09;
        camZ += (panZ - camZ) * 0.09;
        applyCam();
        const ps = isStatic ? 1 : 1 + 1.1 * (0.5 + 0.5 * Math.sin(t * 2.2));
        ringG.scale.set(ps, ps, 1);
        ringG.material.opacity = isStatic ? 0.5 : 0.75 * (1 - (ps - 1) / 2.2);
        if (!isStatic) movers.forEach(m => { m.dot.position.copy(m.curve.getPoint((t * 0.13 + m.off) % 1)); });
        else movers.forEach(m => { m.dot.position.copy(m.curve.getPoint(0.5)); });
        if (t > 0.8) this._lbl.style.opacity = '1';
        tmp.copy(jv).project(camera);
        const w = this.clientWidth, h = this.clientHeight;
        this._lbl.style.display = tmp.z > 1 ? 'none' : 'block';
        this._lbl.style.left = ((tmp.x * 0.5 + 0.5) * w) + 'px';
        this._lbl.style.top = ((-(tmp.y * 0.5) + 0.5) * h) + 'px';
        renderer.render(scene, camera);
      };
      tick();
      this._cleanup = () => { cancelAnimationFrame(this._raf); this._ro && this._ro.disconnect(); this._io && this._io.disconnect(); renderer.dispose(); };
    }
    disconnectedCallback() { this._cleanup && this._cleanup(); }
  }
  customElements.define('indo-globe', IndoGlobe);
})();
