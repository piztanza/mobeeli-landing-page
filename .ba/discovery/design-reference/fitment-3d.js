/* Mobeeli fitment wheel — 3D hero scene (v4: full car reveal → zoom → wheel mounts, no re-stack).
   One-shot cinematic: whole blueprint car on screen, camera dollies into the front arch, wheel
   flies onto the studs, 4 bolts seat (flash ring), labels fade in. Then a calm idle (sway +
   soft ring pulse) — no dismount/remount clutter. Attrs: lang="en|id", static (no motion). */
(() => {
  if (customElements.get('fitment-wheel')) return;
  const THREE_URL = 'https://unpkg.com/three@0.160.0/build/three.module.js';
  const LABELS = {
    en: [
      { t: 'Bolt pattern · PCD', v: '4 × 100', p: [0.55, 0.75, 0.4] },
      { t: 'Center bore', v: '⌀ 54.1 mm', p: [0, 0, 0.4] },
      { t: 'Authenticity', v: 'Genuine', p: [1.5, -1.35, 0.2] }
    ],
    id: [
      { t: 'Pola baut · PCD', v: '4 × 100', p: [0.55, 0.75, 0.4] },
      { t: 'Lubang tengah', v: '⌀ 54,1 mm', p: [0, 0, 0.4] },
      { t: 'Keaslian', v: 'Asli', p: [1.5, -1.35, 0.2] }
    ]
  };
  const ENTRANCE = 1.0;
  const W_FAR = 2.8, W_SEAT = 0.15, B_FAR = 12, B_SEAT = 0.42;
  class FitmentWheel extends HTMLElement {
    static get observedAttributes() { return ['lang', 'static']; }
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      const sh = this.attachShadow({ mode: 'open' });
      sh.innerHTML = `
        <style>
          :host{position:relative;display:block;width:100%;height:100%;overflow:hidden;background:radial-gradient(120% 90% at 38% 28%,#16263f,#0a1322 75%);}
          canvas{position:absolute;inset:0;display:block;}
          .labels{position:absolute;inset:0;pointer-events:none;}
          .label{position:absolute;transform:translate(-50%,-100%);opacity:0;transition:opacity .5s;display:flex;flex-direction:column;align-items:center;white-space:nowrap;}
          .content{background:rgba(13,21,34,.74);border:1px solid rgba(91,155,247,.45);border-radius:8px;padding:6px 10px;backdrop-filter:blur(4px);display:flex;flex-direction:column;align-items:center;box-shadow:0 4px 14px rgba(3,8,16,.5);}
          .title{font-size:9px;font-weight:800;color:#5b9bf7;text-transform:uppercase;letter-spacing:.1em;}
          .value{font-size:13px;font-weight:700;color:#fff;margin-top:2px;}
          .line{width:1px;height:26px;background:linear-gradient(rgba(91,155,247,1),rgba(91,155,247,0));}
          .vignette{position:absolute;inset:0;pointer-events:none;background:radial-gradient(circle at 50% 45%,transparent 55%,rgba(10,19,34,.85) 118%);}
        </style>
        <div class="labels"></div>
        <div class="vignette"></div>`;
      this._labelsBox = sh.querySelector('.labels');
      this._buildLabels();
      import(THREE_URL).then(T => this._init(T)).catch(e => console.error('fitment-wheel init failed:', e && e.message, e && e.stack));
    }
    _buildLabels() {
      if (!this._labelsBox) return;
      const set = LABELS[this.getAttribute('lang') === 'id' ? 'id' : 'en'];
      this._labelsBox.innerHTML = '';
      this._labels = set.map(d => {
        const el = document.createElement('div');
        el.className = 'label';
        el.innerHTML = `<div class="content"><div class="title"></div><div class="value"></div></div><div class="line"></div>`;
        el.querySelector('.title').textContent = d.t;
        el.querySelector('.value').textContent = d.v;
        this._labelsBox.appendChild(el);
        return { el, p: d.p };
      });
      if (this._shown) this._labels.forEach(l => { l.el.style.opacity = '1'; });
    }
    attributeChangedCallback(name) {
      if (name === 'lang') this._buildLabels();
    }
    _init(THREE) {
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2('#0a1322', 0.022);
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      const CAM_WIDE = new THREE.Vector3(0.3, 1.5, 19);
      const CAM_CLOSE = new THREE.Vector3(1.4, 0.8, 9.0);
      const LOOK_WIDE = new THREE.Vector3(-2.0, 0.9, 0);
      const LOOK_CLOSE = new THREE.Vector3(0.4, 0.6, 0);
      const camPos = new THREE.Vector3(), camLook = new THREE.Vector3();
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.shadowRoot.insertBefore(renderer.domElement, this._labelsBox);
      scene.add(new THREE.AmbientLight(0xffffff, 1.0));
      const dir = new THREE.DirectionalLight(0x2f7df6, 4); dir.position.set(5, 5, 4); scene.add(dir);
      const pt = new THREE.PointLight(0x123f9e, 10, 16); pt.position.set(-2, -2, 2); scene.add(pt);
      const solidMat = new THREE.MeshPhysicalMaterial({ color: 0x060d18, metalness: 0.7, roughness: 0.3, clearcoat: 0.8, emissive: 0x123f9e, emissiveIntensity: 0.15, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
      const wire = (geom, color, op, thresh) => new THREE.LineSegments(new THREE.EdgesGeometry(geom, thresh || 1), new THREE.LineBasicMaterial({ color, transparent: true, opacity: op || 0.7 }));
      const root = new THREE.Group(); scene.add(root);
      // ---- Full car body: side profile with front + rear arches, front arch centered on origin ----
      const car = new THREE.Group(); root.add(car);
      const prof = new THREE.Shape();
      prof.moveTo(-11.2, -1.5);
      prof.lineTo(-10.35, -1.5);
      prof.lineTo(-10.35, 0);
      prof.absarc(-7.6, 0, 2.75, Math.PI, 0, true);
      prof.lineTo(-4.85, -1.5);
      prof.lineTo(-2.75, -1.5);
      prof.lineTo(-2.75, 0);
      prof.absarc(0, 0, 2.75, Math.PI, 0, true);
      prof.lineTo(2.75, -1.5);
      prof.lineTo(6.7, -1.5);
      prof.quadraticCurveTo(7.9, -1.35, 7.95, -0.2);
      prof.quadraticCurveTo(8.0, 1.0, 7.2, 1.45);
      prof.quadraticCurveTo(5.6, 1.95, 3.6, 2.3);
      prof.quadraticCurveTo(2.4, 2.5, 1.6, 3.4);
      prof.quadraticCurveTo(0.9, 4.35, -0.8, 4.6);
      prof.quadraticCurveTo(-3.5, 4.85, -6.0, 4.45);
      prof.quadraticCurveTo(-8.6, 4.0, -9.9, 2.7);
      prof.quadraticCurveTo(-11.15, 1.5, -11.2, 0.2);
      prof.closePath();
      const bodyGeom = new THREE.ExtrudeGeometry(prof, { depth: 3.2, bevelEnabled: false, curveSegments: 24 });
      const body = new THREE.Mesh(bodyGeom, solidMat); body.position.z = -3.5; car.add(body);
      const bodyWire = wire(bodyGeom, 0x2f7df6, 0.45, 10); bodyWire.position.z = -3.5; car.add(bodyWire);
      // Blueprint feature lines on the visible face: windows, pillars, seams
      const feat = [
        [1.7, 3.0, -8.8, 2.95],
        [2.5, 2.45, 1.0, 4.1],
        [-2.6, 4.55, -2.55, 3.0],
        [-6.2, 4.3, -8.8, 2.95],
        [-3.8, 2.95, -3.8, -1.25],
        [3.1, 2.35, 3.05, -1.3],
        [7.0, 1.3, 5.9, 1.7]
      ];
      const featArr = [];
      feat.forEach(s => { featArr.push(s[0], s[1], -0.27, s[2], s[3], -0.27); });
      const featGeom = new THREE.BufferGeometry();
      featGeom.setAttribute('position', new THREE.Float32BufferAttribute(featArr, 3));
      car.add(new THREE.LineSegments(featGeom, new THREE.LineBasicMaterial({ color: 0x2f7df6, transparent: true, opacity: 0.55 })));
      // Rear wheel (static, same design as the front wheel)
      const rear = new THREE.Group(); rear.position.set(-7.6, 0, -0.05); car.add(rear);
      const rearRimG = new THREE.TorusGeometry(2, 0.4, 24, 56);
      rear.add(new THREE.Mesh(rearRimG, solidMat));
      rear.add(wire(rearRimG, 0x2f7df6, 0.5));
      const rearHubG = new THREE.CylinderGeometry(0.55, 0.55, 0.6, 24);
      const rearHub = new THREE.Mesh(rearHubG, solidMat); rearHub.rotation.x = Math.PI / 2; rear.add(rearHub);
      const rearHubW = wire(rearHubG, 0x2f7df6, 0.5); rearHubW.rotation.x = Math.PI / 2; rear.add(rearHubW);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const g = new THREE.CylinderGeometry(0.11, 0.11, 1.6, 8);
        const s = new THREE.Mesh(g, solidMat);
        s.position.set(Math.cos(a) * 1.25, Math.sin(a) * 1.25, 0);
        s.rotation.z = a + Math.PI / 2;
        rear.add(s);
        const w2 = wire(g, 0x2f7df6, 0.35);
        w2.position.copy(s.position); w2.rotation.copy(s.rotation);
        rear.add(w2);
      }
      // Hub + studs in the front arch
      const hubBaseG = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 20);
      const hubBase = new THREE.Mesh(hubBaseG, solidMat); hubBase.rotation.x = Math.PI / 2; hubBase.position.z = -0.05; car.add(hubBase);
      const hubBaseW = wire(hubBaseG, 0x5b9bf7, 0.8); hubBaseW.rotation.x = Math.PI / 2; hubBaseW.position.z = -0.05; car.add(hubBaseW);
      const BR = 0.32;
      for (let i = 0; i < 4; i++) {
        const a = Math.PI / 4 + (i / 4) * Math.PI * 2;
        const sg = new THREE.CylinderGeometry(0.035, 0.035, 0.8, 8);
        const stud = new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ color: 0x5b9bf7 }));
        stud.rotation.x = Math.PI / 2;
        stud.position.set(Math.cos(a) * BR, Math.sin(a) * BR, 0.1);
        car.add(stud);
      }
      // Ground shadows
      const groundCar = new THREE.Mesh(new THREE.CircleGeometry(10.5, 48), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.22 }));
      groundCar.rotation.x = -Math.PI / 2; groundCar.scale.set(1.12, 0.42, 1); groundCar.position.set(-2.2, -2.47, -1.2); root.add(groundCar);
      const groundWheel = new THREE.Mesh(new THREE.CircleGeometry(2.3, 40), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3 }));
      groundWheel.rotation.x = -Math.PI / 2; groundWheel.scale.x = 1.4; groundWheel.position.y = -2.45; root.add(groundWheel);
      // ---- Wheel group (travels on Z onto the studs) ----
      const wheel = new THREE.Group(); root.add(wheel);
      const rimGeom = new THREE.TorusGeometry(2, 0.4, 24, 56);
      wheel.add(new THREE.Mesh(rimGeom, solidMat));
      wheel.add(wire(rimGeom, 0x5b9bf7));
      const hubGeom = new THREE.CylinderGeometry(0.55, 0.55, 0.6, 24);
      const hub = new THREE.Mesh(hubGeom, solidMat); hub.rotation.x = Math.PI / 2; wheel.add(hub);
      const hubWire = wire(hubGeom, 0x5b9bf7); hubWire.rotation.x = Math.PI / 2; wheel.add(hubWire);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const g = new THREE.CylinderGeometry(0.11, 0.11, 1.6, 8);
        const s = new THREE.Mesh(g, solidMat);
        s.position.set(Math.cos(a) * 1.25, Math.sin(a) * 1.25, 0);
        s.rotation.z = a + Math.PI / 2;
        wheel.add(s);
        const w = wire(g, 0x2f7df6);
        w.position.copy(s.position); w.rotation.copy(s.rotation);
        wheel.add(w);
      }
      const bolts = [];
      for (let i = 0; i < 4; i++) {
        const a = Math.PI / 4 + (i / 4) * Math.PI * 2;
        const b = new THREE.Group();
        const headG = new THREE.CylinderGeometry(0.1, 0.1, 0.09, 6);
        const shaftG = new THREE.CylinderGeometry(0.042, 0.042, 0.26, 10);
        const head = new THREE.Mesh(headG, solidMat); head.position.y = 0.13; b.add(head);
        b.add(new THREE.Mesh(shaftG, solidMat));
        const hw = wire(headG, 0x5b9bf7, 0.95); hw.position.y = 0.13; b.add(hw);
        b.add(wire(shaftG, 0x2f7df6, 0.8));
        b.rotation.x = Math.PI / 2;
        b.position.set(Math.cos(a) * BR, Math.sin(a) * BR, B_FAR);
        wheel.add(b);
        bolts.push(b);
      }
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.014, 8, 48), new THREE.MeshBasicMaterial({ color: 0x5b9bf7, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }));
      ring.position.z = 0.36; wheel.add(ring);
      const resize = () => {
        const w = this.clientWidth || 300, h = this.clientHeight || 200;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      this._ro = new ResizeObserver(resize); this._ro.observe(this);
      const tempV = new THREE.Vector3();
      const start = performance.now();
      const clamp01 = x => Math.max(0, Math.min(1, x));
      const easeOut = p => 1 - Math.pow(1 - p, 3);
      const easeInOut = p => p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      // Timeline (s after ENTRANCE): wide hold → dolly 1.4-3.2 → wheel 3.5-5.1 → bolts 5.1-6.3 → ring 6.5 → labels 7.4 → idle pulse
      const tick = () => {
        this._raf = requestAnimationFrame(tick);
        const t = (performance.now() - start) / 1000;
        const isStatic = this.hasAttribute('static');
        const e = Math.min(t / 2.0, 1);
        const ease = 1 - Math.pow(2, -10 * e);
        const sc = isStatic ? 1 : Math.max(0.001, ease);
        root.scale.set(sc, sc, sc);
        root.rotation.y = isStatic ? 0.14 : (Math.PI * (1 - ease) * 0.25 + 0.14 + 0.04 * Math.sin(t * 0.4));
        const ta = isStatic ? 99 : (t > ENTRANCE ? t - ENTRANCE : -1);
        camera.position.copy(CAM_CLOSE);
        camera.lookAt(LOOK_CLOSE);
        const LOOP = 7.0, tl = (!isStatic && ta >= 0) ? ta % LOOP : -1;
        // wheel mounts and dismounts each loop
        let wz = W_FAR, wrot = -0.35;
        if (isStatic) { wz = W_SEAT; wrot = 0; }
        else if (tl >= 0) {
          if (tl < 0.4) { wz = W_FAR; wrot = -0.35; }
          else if (tl < 5.6) { const p = clamp01((tl - 0.4) / 1.8); const kk = easeOut(p); wz = W_FAR + (W_SEAT - W_FAR) * kk; wrot = -0.35 * (1 - kk); }
          else { const q = clamp01((tl - 5.6) / 1.0); wz = W_SEAT + (W_FAR - W_SEAT) * (q * q * q); wrot = -0.2 * q; }
        }
        wheel.position.z = wz;
        wheel.rotation.z = wrot;
        // bolts: hidden until the wheel starts moving, then streak in from off-screen (past the camera)
        // and seat right as the wheel finishes fitting; unbolt back off-screen on dismount
        bolts.forEach((b, i) => {
          let z = B_FAR, moving = false;
          const inS = 0.9 + i * 0.12;
          const outS = 5.2 + i * 0.08;
          if (isStatic) z = B_SEAT;
          else if (tl >= 0) {
            if (tl < inS) z = B_FAR;
            else if (tl < outS) { const p = clamp01((tl - inS) / 1.9); z = B_FAR + (B_SEAT - B_FAR) * easeOut(p); moving = p < 1; }
            else { const q = clamp01((tl - outS) / 0.7); z = B_SEAT + (B_FAR - B_SEAT) * (q * q * q); moving = q < 1; }
            if (moving) b.rotation.y += 0.35;
          }
          b.visible = isStatic ? true : (tl >= inS && tl < outS + 0.75);
          b.position.z = z;
        });
        // flash ring after the last bolt seats each loop
        let ro = 0, rs = 1;
        if (!isStatic && tl > 3.2 && tl < 3.75) { const u = clamp01((tl - 3.2) / 0.55); ro = 0.85 * (1 - u); rs = 1 + 0.55 * u; }
        ring.material.opacity = ro;
        ring.scale.set(rs, rs, rs);
        // labels after first full loop
        if (!this._shown && (isStatic || ta > 7.2)) {
          this._shown = true;
          this.dispatchEvent(new CustomEvent('fitment-first-loop', { bubbles: true, composed: true }));
          (this._labels || []).forEach((l, i) => setTimeout(() => { l.el.style.opacity = '1'; }, isStatic ? 0 : i * 150));
        }
        const w = this.clientWidth, h = this.clientHeight;
        (this._labels || []).forEach(l => {
          tempV.set(l.p[0], l.p[1], l.p[2]);
          tempV.applyMatrix4(wheel.matrixWorld);
          tempV.project(camera);
          if (tempV.z > 1) { l.el.style.display = 'none'; return; }
          l.el.style.display = 'flex';
          l.el.style.left = ((tempV.x * 0.5 + 0.5) * w) + 'px';
          l.el.style.top = ((-(tempV.y * 0.5) + 0.5) * h) + 'px';
        });
        renderer.render(scene, camera);
      };
      tick();
      this._cleanup = () => { cancelAnimationFrame(this._raf); this._ro && this._ro.disconnect(); renderer.dispose(); };
    }
    disconnectedCallback() { this._cleanup && this._cleanup(); }
  }
  customElements.define('fitment-wheel', FitmentWheel);
})();
