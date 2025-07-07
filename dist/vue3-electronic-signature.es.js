var Xe = Object.defineProperty;
var Ye = (t, e, s) => e in t ? Xe(t, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : t[e] = s;
var x = (t, e, s) => (Ye(t, typeof e != "symbol" ? e + "" : e, s), s);
import { defineComponent as ze, ref as b, computed as w, watch as A, nextTick as O, onMounted as Ae, onUnmounted as Oe, openBlock as M, createElementBlock as _, normalizeStyle as q, createElementVNode as v, toDisplayString as B, createCommentVNode as F } from "vue";
function ye(t, e) {
  return Math.sqrt(
    Math.pow(e.x - t.x, 2) + Math.pow(e.y - t.y, 2)
  );
}
function qe(t, e) {
  return Math.atan2(e.y - t.y, e.x - t.x);
}
function Be(t, e, s, a) {
  const n = e || t, o = s || t, u = 0.2, h = qe(n, o) * (a ? 1 : -1), r = ye(n, o) * u;
  return {
    x: t.x + Math.cos(h) * r,
    y: t.y + Math.sin(h) * r,
    time: t.time
  };
}
function Fe(t, e, s) {
  if (!s.pressure.enabled)
    return s.strokeWidth;
  const a = ye(t, e), n = e.time - t.time, o = n > 0 ? a / n : 0, u = Math.max(0.1, Math.min(1, 1 - o * 0.01)), { min: h, max: r } = s.pressure;
  return h + (r - h) * u;
}
function ve(t, e, s) {
  if (e.length < 2)
    return;
  if (t.strokeStyle = s.strokeColor, t.lineCap = "round", t.lineJoin = "round", !s.smoothing || e.length < 3) {
    t.beginPath(), t.lineWidth = s.strokeWidth, t.moveTo(e[0].x, e[0].y);
    for (let n = 1; n < e.length; n++)
      t.lineTo(e[n].x, e[n].y);
    t.stroke();
    return;
  }
  t.beginPath(), t.moveTo(e[0].x, e[0].y);
  for (let n = 1; n < e.length - 1; n++) {
    const o = e[n], u = e[n + 1];
    s.pressure.enabled ? t.lineWidth = Fe(e[n - 1], o, s) : t.lineWidth = s.strokeWidth;
    const h = Be(o, e[n - 1], u);
    t.quadraticCurveTo(h.x, h.y, o.x, o.y);
  }
  const a = e[e.length - 1];
  t.lineTo(a.x, a.y), t.stroke();
}
function Ue(t) {
  const { canvasSize: e, paths: s } = t;
  let a = `<svg width="${e.width}" height="${e.height}" xmlns="http://www.w3.org/2000/svg">`;
  return s.forEach((n) => {
    if (n.points.length < 2)
      return;
    let o = `M ${n.points[0].x} ${n.points[0].y}`;
    for (let u = 1; u < n.points.length; u++)
      o += ` L ${n.points[u].x} ${n.points[u].y}`;
    a += `<path d="${o}" stroke="${n.strokeColor}" stroke-width="${n.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), a += "</svg>", a;
}
function He(t, e, s = { format: "png" }) {
  const { format: a, quality: n = 0.9, size: o, backgroundColor: u } = s;
  if (a === "svg")
    return Ue(e);
  const h = document.createElement("canvas"), r = h.getContext("2d");
  if (o) {
    h.width = o.width, h.height = o.height;
    const d = o.width / t.width, p = o.height / t.height;
    r.scale(d, p);
  } else
    h.width = t.width, h.height = t.height;
  switch (u && u !== "transparent" && (r.fillStyle = u, r.fillRect(0, 0, h.width, h.height)), r.drawImage(t, 0, 0), a) {
    case "jpeg":
      return h.toDataURL("image/jpeg", n);
    case "base64":
      return h.toDataURL("image/png").split(",")[1];
    case "png":
    default:
      return h.toDataURL("image/png");
  }
}
function Le(t, e) {
  return new Promise((s, a) => {
    const n = new Image();
    n.onload = () => {
      const o = t.getContext("2d");
      o.clearRect(0, 0, t.width, t.height), o.drawImage(n, 0, 0, t.width, t.height), s();
    }, n.onerror = a, n.src = e;
  });
}
function $(t) {
  return t.paths.length === 0 || t.paths.every((e) => e.points.length === 0);
}
function X(t, e) {
  return {
    paths: [],
    canvasSize: { width: t, height: e },
    timestamp: Date.now(),
    isEmpty: !0
  };
}
function R(t) {
  return JSON.parse(JSON.stringify(t));
}
class Ne {
  constructor(e) {
    x(this, "canvas");
    x(this, "ctx");
    x(this, "replayData", null);
    x(this, "state", "idle");
    x(this, "currentTime", 0);
    x(this, "speed", 1);
    x(this, "animationId", null);
    x(this, "startTimestamp", 0);
    x(this, "pausedTime", 0);
    x(this, "options", {});
    // 事件回调
    x(this, "eventCallbacks", /* @__PURE__ */ new Map());
    this.canvas = e, this.ctx = e.getContext("2d");
  }
  /**
   * 设置回放数据
   */
  setReplayData(e, s = {}) {
    console.log("设置回放数据:", e), console.log("回放选项:", s), this.replayData = e, this.options = { ...s }, this.speed = s.speed || e.speed || 1, this.currentTime = s.startTime || 0, this.state = "idle", console.log("回放数据设置完成，路径数量:", e.paths.length), console.log("总时长:", e.totalDuration);
  }
  /**
   * 开始播放
   */
  play() {
    if (console.log("播放方法调用，回放数据:", this.replayData), console.log("当前状态:", this.state), !this.replayData) {
      console.error("没有回放数据，无法播放");
      return;
    }
    if (this.state === "playing") {
      console.log("已在播放中，忽略");
      return;
    }
    this.state === "paused" ? (console.log("从暂停状态恢复播放"), this.state = "playing", this.startTimestamp = performance.now() - this.pausedTime, this.emit("replay-resume")) : (console.log("开始新的播放"), this.state = "playing", this.startTimestamp = performance.now(), this.pausedTime = 0, this.currentTime = this.options.startTime || 0, this.clearCanvas(), this.emit("replay-start")), this.animate();
  }
  /**
   * 暂停播放
   */
  pause() {
    this.state === "playing" && (this.state = "paused", this.pausedTime = performance.now() - this.startTimestamp, this.animationId && (cancelAnimationFrame(this.animationId), this.animationId = null), this.emit("replay-pause"));
  }
  /**
   * 停止播放
   */
  stop() {
    this.state = "stopped", this.currentTime = 0, this.pausedTime = 0, this.animationId && (cancelAnimationFrame(this.animationId), this.animationId = null), this.clearCanvas(), this.emit("replay-stop");
  }
  /**
   * 跳转到指定时间
   */
  seek(e) {
    if (!this.replayData)
      return;
    const s = this.options.endTime || this.replayData.totalDuration;
    this.currentTime = Math.max(0, Math.min(e, s)), this.state === "playing" ? this.startTimestamp = performance.now() - this.currentTime / this.speed : this.pausedTime = this.currentTime / this.speed, this.renderFrame(this.currentTime);
  }
  /**
   * 设置播放速度
   */
  setSpeed(e) {
    const s = this.state === "playing";
    s && this.pause(), this.speed = Math.max(0.1, Math.min(5, e)), this.emit("replay-speed-change", this.speed), s && this.play();
  }
  /**
   * 获取当前状态
   */
  getState() {
    return this.state;
  }
  /**
   * 获取当前时间
   */
  getCurrentTime() {
    return this.currentTime;
  }
  /**
   * 获取总时长
   */
  getTotalDuration() {
    var e;
    return ((e = this.replayData) == null ? void 0 : e.totalDuration) || 0;
  }
  /**
   * 获取当前进度（0-1）
   */
  getProgress() {
    const e = this.getTotalDuration();
    return e > 0 ? this.currentTime / e : 0;
  }
  /**
   * 动画循环
   */
  animate() {
    if (this.state !== "playing" || !this.replayData)
      return;
    const e = performance.now();
    this.currentTime = (e - this.startTimestamp) * this.speed;
    const s = this.options.endTime || this.replayData.totalDuration;
    if (this.currentTime >= s) {
      this.currentTime = s, this.state = "completed", this.renderFrame(this.currentTime), this.emit("replay-complete"), this.options.loop && setTimeout(() => {
        this.currentTime = this.options.startTime || 0, this.play();
      }, 500);
      return;
    }
    this.renderFrame(this.currentTime), this.emit("replay-progress", this.getProgress(), this.currentTime), this.animationId = requestAnimationFrame(() => this.animate());
  }
  /**
   * 渲染指定时间的帧
   */
  renderFrame(e) {
    if (!this.replayData)
      return;
    this.clearCanvas();
    let s = !1;
    for (let a = 0; a < this.replayData.paths.length; a++) {
      const n = this.replayData.paths[a], o = n.startTime || 0, u = n.endTime || o + (n.duration || 0);
      if (e < o)
        break;
      if (e >= u) {
        this.drawCompletePath(n), !s && Math.abs(e - u) < 32 && this.emit("replay-path-end", a, n);
        continue;
      }
      s = !0;
      const h = Math.max(0, Math.min(1, (e - o) / Math.max(u - o, 1)));
      h > 0 && Math.abs(e - o) < 32 && this.emit("replay-path-start", a, n), this.drawPartialPath(n, h);
      break;
    }
  }
  /**
   * 绘制完整路径
   */
  drawCompletePath(e) {
    if (!(e.points.length < 2)) {
      this.ctx.beginPath(), this.ctx.strokeStyle = e.strokeColor, this.ctx.lineWidth = e.strokeWidth, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", this.ctx.moveTo(e.points[0].x, e.points[0].y);
      for (let s = 1; s < e.points.length; s++)
        this.ctx.lineTo(e.points[s].x, e.points[s].y);
      this.ctx.stroke();
    }
  }
  /**
   * 绘制部分路径
   */
  drawPartialPath(e, s) {
    if (e.points.length < 2)
      return;
    const a = e.startTime || 0, n = e.duration || 0, o = a + n * s, u = this.getPointsUpToTime(e.points, a, o);
    u.length < 2 || (this.ctx.beginPath(), this.ctx.strokeStyle = e.strokeColor, this.ctx.lineWidth = e.strokeWidth, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", this.drawSmoothCurve(u), this.ctx.stroke());
  }
  /**
   * 获取指定时间内的所有点
   */
  getPointsUpToTime(e, s, a) {
    const n = [];
    for (let o = 0; o < e.length; o++) {
      const u = e[o], h = s + (u.relativeTime || o * 50);
      if (h <= a)
        n.push(u);
      else {
        if (o > 0) {
          const r = e[o - 1], d = s + (r.relativeTime || (o - 1) * 50);
          if (d <= a) {
            const p = (a - d) / (h - d), c = {
              x: r.x + (u.x - r.x) * p,
              y: r.y + (u.y - r.y) * p,
              time: a,
              pressure: r.pressure ? r.pressure + (u.pressure || r.pressure - r.pressure) * p : u.pressure
            };
            n.push(c);
          }
        }
        break;
      }
    }
    return n;
  }
  /**
   * 绘制平滑曲线，与原始绘制保持一致
   */
  drawSmoothCurve(e) {
    if (e.length < 2)
      return;
    if (this.ctx.moveTo(e[0].x, e[0].y), e.length === 2) {
      this.ctx.lineTo(e[1].x, e[1].y);
      return;
    }
    for (let n = 1; n < e.length - 1; n++) {
      const o = e[n], u = e[n + 1], h = (o.x + u.x) / 2, r = (o.y + u.y) / 2;
      this.ctx.quadraticCurveTo(o.x, o.y, h, r);
    }
    const s = e[e.length - 1], a = e[e.length - 2];
    this.ctx.quadraticCurveTo(a.x, a.y, s.x, s.y);
  }
  /**
   * 清除画布
   */
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  /**
   * 注册事件监听器
   */
  on(e, s) {
    this.eventCallbacks.has(e) || this.eventCallbacks.set(e, []), this.eventCallbacks.get(e).push(s);
  }
  /**
   * 移除事件监听器
   */
  off(e, s) {
    if (this.eventCallbacks.has(e))
      if (s) {
        const a = this.eventCallbacks.get(e), n = a.indexOf(s);
        n > -1 && a.splice(n, 1);
      } else
        this.eventCallbacks.delete(e);
  }
  /**
   * 触发事件
   */
  emit(e, ...s) {
    const a = this.eventCallbacks.get(e);
    a && a.forEach((n) => n(...s));
  }
  /**
   * 销毁控制器
   */
  destroy() {
    this.stop(), this.eventCallbacks.clear(), this.replayData = null;
  }
}
function Je(t) {
  const s = t.paths.map((r) => {
    const d = r.points.map((c, y) => {
      var f;
      let m;
      if (c.time && r.points[0].time)
        m = c.time - r.points[0].time;
      else if (y === 0)
        m = 0;
      else {
        const S = r.points[y - 1], T = Math.sqrt(
          Math.pow(c.x - S.x, 2) + Math.pow(c.y - S.y, 2)
        ) / 100 * 1e3;
        m = (((f = d[y - 1]) == null ? void 0 : f.relativeTime) || 0) + Math.max(T, 16);
      }
      return {
        ...c,
        relativeTime: m
      };
    }), p = d.length > 0 ? d[d.length - 1].relativeTime : 0;
    return {
      ...r,
      points: d,
      duration: p
    };
  }).map((r, d) => {
    let p;
    if (d === 0)
      p = 0;
    else {
      const y = s[d - 1], m = je(
        t.paths[d - 1].points,
        t.paths[d].points
      );
      p = y.endTime + m;
    }
    const c = p + r.duration;
    return {
      ...r,
      startTime: p,
      endTime: c
    };
  }), a = s.length > 0 ? s[s.length - 1].endTime : 0, n = s.reduce((r, d) => r + Ge(d.points), 0), o = a > 0 ? n / (a / 1e3) : 0, u = s.slice(1).map((r, d) => {
    const p = s[d];
    return r.startTime - p.endTime;
  }), h = u.length > 0 ? u.reduce((r, d) => r + d, 0) / u.length : 0;
  return {
    paths: s,
    totalDuration: a,
    speed: 1,
    metadata: {
      deviceType: Ve(t),
      averageSpeed: o,
      totalDistance: n,
      averagePauseTime: h
    }
  };
}
function je(t, e) {
  if (t.length === 0 || e.length === 0)
    return 200;
  const s = t[t.length - 1], a = e[0];
  if (s.time && a.time)
    return Math.max(a.time - s.time, 50);
  const n = Math.sqrt(
    Math.pow(a.x - s.x, 2) + Math.pow(a.y - s.y, 2)
  );
  return Math.min(Math.max(n * 2, 100), 1e3);
}
function Ve(t) {
  const e = t.paths.reduce((o, u) => o + u.points.length, 0), s = t.paths.length;
  if (e === 0)
    return "touch";
  const a = e / s;
  return a > 20 ? "touch" : a < 10 ? "mouse" : t.paths.some(
    (o) => o.points.some((u) => u.pressure !== void 0)
  ) ? "pen" : "touch";
}
function Ge(t) {
  let e = 0;
  for (let s = 1; s < t.length; s++) {
    const a = t[s].x - t[s - 1].x, n = t[s].y - t[s - 1].y;
    e += Math.sqrt(a * a + n * n);
  }
  return e;
}
const Qe = ["width", "height"], Ke = {
  key: 1,
  class: "signature-toolbar"
}, Ze = ["disabled"], et = ["disabled"], tt = ["disabled"], at = {
  key: 2,
  class: "replay-controls"
}, st = { class: "replay-buttons" }, nt = ["disabled"], it = { key: 0 }, ot = { key: 1 }, rt = ["disabled"], lt = { class: "replay-progress" }, ut = ["max", "value", "disabled"], ht = { class: "time-display" }, ct = { class: "replay-speed" }, dt = /* @__PURE__ */ ze({
  __name: "ElectronicSignature",
  props: {
    showToolbar: { type: Boolean, default: !1 },
    width: { default: "100%" },
    height: { default: 300 },
    strokeColor: { default: "#000000" },
    strokeWidth: { default: 2 },
    backgroundColor: { default: "transparent" },
    disabled: { type: Boolean, default: !1 },
    placeholder: { default: "请在此处签名" },
    smoothing: { type: Boolean, default: !0 },
    pressureSensitive: { type: Boolean, default: !1 },
    minStrokeWidth: { default: 1 },
    maxStrokeWidth: { default: 4 },
    borderStyle: { default: "1px solid #ddd" },
    borderRadius: { default: "4px" },
    replayMode: { type: Boolean },
    replayData: {},
    replayOptions: {}
  },
  emits: ["signature-start", "signature-drawing", "signature-end", "signature-clear", "signature-undo", "signature-redo", "replay-start", "replay-progress", "replay-pause", "replay-resume", "replay-stop", "replay-complete", "replay-path-start", "replay-path-end", "replay-speed-change"],
  setup(t, { expose: e, emit: s }) {
    const a = t, n = s, o = b(), u = b(!1), h = b(null), r = b(X(0, 0)), d = b([]), p = b(-1), c = b(null), y = b(!1), m = b("idle"), f = b(0), S = b(0), C = w(() => typeof a.width == "number" ? a.width : 800), T = w(() => typeof a.height == "number" ? a.height : 300), xe = w(() => ({
      position: "relative",
      display: "inline-block",
      width: typeof a.width == "string" ? a.width : `${a.width}px`,
      height: typeof a.height == "string" ? a.height : `${a.height}px`
    })), we = w(() => ({
      border: a.borderStyle,
      borderRadius: a.borderRadius,
      backgroundColor: a.backgroundColor,
      cursor: a.disabled ? "not-allowed" : "crosshair",
      display: "block",
      width: "100%",
      height: "100%"
    })), Te = w(() => ({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "#999",
      fontSize: "14px",
      pointerEvents: "none",
      userSelect: "none"
    })), ke = w(() => a.placeholder && $(r.value)), U = w(() => p.value > 0), H = w(() => p.value < d.value.length - 1), L = w(() => y.value && c.value), D = w(() => !L.value && !a.disabled), be = w(() => {
      var i;
      return L.value && ((i = a.replayOptions) == null ? void 0 : i.showControls) !== !1;
    }), N = w(() => ({
      strokeColor: a.strokeColor,
      strokeWidth: a.strokeWidth,
      smoothing: a.smoothing,
      pressure: {
        enabled: a.pressureSensitive,
        min: a.minStrokeWidth,
        max: a.maxStrokeWidth
      }
    })), J = () => {
      var i;
      return ((i = o.value) == null ? void 0 : i.getContext("2d")) || null;
    }, W = (i, l) => {
      const g = o.value, k = g.getBoundingClientRect(), z = g.width / k.width, I = g.height / k.height;
      return {
        x: (i - k.left) * z,
        y: (l - k.top) * I,
        time: Date.now()
      };
    }, j = (i) => {
      if (!D.value)
        return;
      u.value = !0;
      const l = performance.now(), g = { ...i, time: l };
      h.value = {
        points: [g],
        strokeColor: a.strokeColor,
        strokeWidth: a.strokeWidth,
        startTime: l,
        endTime: l,
        duration: 0
      }, n("signature-start");
    }, V = (i) => {
      if (!u.value || !h.value || !D.value)
        return;
      const l = performance.now(), g = { ...i, time: l };
      h.value.points.push(g), h.value.startTime && (h.value.endTime = l, h.value.duration = l - h.value.startTime);
      const k = J();
      k && ve(k, h.value.points, N.value), Z(), n("signature-drawing", r.value);
    }, G = () => {
      if (!(!u.value || !h.value)) {
        if (u.value = !1, h.value.points.length > 0) {
          const i = h.value.points[h.value.points.length - 1];
          i.time && h.value.startTime && (h.value.endTime = i.time, h.value.duration = i.time - h.value.startTime);
        }
        r.value.paths.push(h.value), r.value.isEmpty = !1, r.value.timestamp = Date.now(), E(), h.value = null, n("signature-end", r.value);
      }
    }, Ce = (i) => {
      i.preventDefault();
      const l = W(i.clientX, i.clientY);
      j(l);
    }, De = (i) => {
      if (i.preventDefault(), !u.value)
        return;
      const l = W(i.clientX, i.clientY);
      V(l);
    }, Q = (i) => {
      i.preventDefault(), G();
    }, Se = (i) => {
      if (i.preventDefault(), i.touches.length !== 1)
        return;
      const l = i.touches[0], g = W(l.clientX, l.clientY);
      j(g);
    }, Pe = (i) => {
      if (i.preventDefault(), i.touches.length !== 1 || !u.value)
        return;
      const l = i.touches[0], g = W(l.clientX, l.clientY);
      V(g);
    }, K = (i) => {
      i.preventDefault(), G();
    }, Z = () => {
      r.value.canvasSize = {
        width: C.value,
        height: T.value
      }, r.value.isEmpty = $(r.value);
    }, E = () => {
      d.value = d.value.slice(0, p.value + 1), d.value.push(R(r.value)), p.value = d.value.length - 1;
      const i = 50;
      d.value.length > i && (d.value = d.value.slice(-i), p.value = d.value.length - 1);
    }, P = () => {
      const i = J();
      i && (i.clearRect(0, 0, C.value, T.value), a.backgroundColor && a.backgroundColor !== "transparent" && (i.fillStyle = a.backgroundColor, i.fillRect(0, 0, C.value, T.value)), r.value.paths.forEach((l) => {
        if (l.points.length > 0) {
          const g = {
            strokeColor: l.strokeColor,
            strokeWidth: l.strokeWidth,
            smoothing: a.smoothing,
            pressure: N.value.pressure
          };
          ve(i, l.points, g);
        }
      }));
    }, ee = () => {
      o.value && (c.value && c.value.destroy(), c.value = new Ne(o.value), c.value.on("replay-start", () => {
        m.value = "playing", n("replay-start");
      }), c.value.on("replay-progress", (i, l) => {
        f.value = i, S.value = l, n("replay-progress", i, l);
      }), c.value.on("replay-pause", () => {
        m.value = "paused", n("replay-pause");
      }), c.value.on("replay-resume", () => {
        m.value = "playing", n("replay-resume");
      }), c.value.on("replay-stop", () => {
        m.value = "stopped", n("replay-stop");
      }), c.value.on("replay-complete", () => {
        m.value = "completed", n("replay-complete");
      }), c.value.on("replay-path-start", (i, l) => {
        n("replay-path-start", i, l);
      }), c.value.on("replay-path-end", (i, l) => {
        n("replay-path-end", i, l);
      }), c.value.on("replay-speed-change", (i) => {
        n("replay-speed-change", i);
      }));
    }, te = (i, l) => {
      c.value || ee(), c.value && (y.value = !0, c.value.setReplayData(i, l || {}), console.log("startReplay调用，自动播放:", l == null ? void 0 : l.autoPlay), (l == null ? void 0 : l.autoPlay) === !0 && c.value.play());
    }, ae = (i) => {
      y.value = i, !i && c.value && (c.value.stop(), P());
    }, Me = () => $(r.value) ? null : Je(r.value), se = () => {
      var i;
      (i = c.value) == null || i.play();
    }, ne = () => {
      var i;
      (i = c.value) == null || i.pause();
    }, ie = () => {
      var i;
      (i = c.value) == null || i.stop();
    }, oe = (i) => {
      var l;
      (l = c.value) == null || l.seek(i);
    }, re = (i) => {
      var l;
      (l = c.value) == null || l.setSpeed(i);
    }, _e = () => {
      var i;
      return ((i = c.value) == null ? void 0 : i.getState()) || "idle";
    }, Re = () => {
      var i;
      return ((i = c.value) == null ? void 0 : i.getCurrentTime()) || 0;
    }, Y = () => {
      var i;
      return ((i = c.value) == null ? void 0 : i.getTotalDuration()) || 0;
    }, We = () => {
      var i;
      return ((i = c.value) == null ? void 0 : i.getProgress()) || 0;
    }, le = (i) => {
      const l = Math.floor(i / 1e3), g = Math.floor(l / 60), k = l % 60;
      return `${g}:${k.toString().padStart(2, "0")}`;
    }, ue = () => {
      D.value && (r.value = X(C.value, T.value), P(), E(), n("signature-clear"));
    }, he = () => {
      !U.value || !D.value || (p.value--, r.value = R(d.value[p.value]), P(), n("signature-undo", r.value));
    }, ce = () => {
      !H.value || !D.value || (p.value++, r.value = R(d.value[p.value]), P(), n("signature-redo", r.value));
    }, de = (i) => {
      const l = o.value;
      return He(l, r.value, i);
    }, pe = () => $(r.value), me = async (i) => {
      if (!D.value)
        return;
      const l = o.value;
      await Le(l, i), r.value = X(C.value, T.value), r.value.isEmpty = !1, E();
    }, Ee = () => R(r.value), Ie = (i) => {
      D.value && (r.value = R(i), P(), E());
    }, ge = (i, l) => {
      const g = i || C.value, k = l || T.value, z = de({ format: "png" });
      O(() => {
        const I = o.value;
        I.width = g, I.height = k, pe() || me(z), Z();
      });
    }, $e = () => {
      const i = o.value;
      i.width = C.value, i.height = T.value, r.value = X(C.value, T.value), d.value = [R(r.value)], p.value = 0, P();
    };
    return A([() => a.width, () => a.height], () => {
      O(() => {
        o.value && ge();
      });
    }), A(() => a.replayMode, (i) => {
      i !== void 0 && ae(i);
    }), A(() => a.replayData, (i) => {
      i && a.replayMode && c.value && (c.value.setReplayData(i, a.replayOptions || {}), console.log("回放数据已更新:", i));
    }), Ae(() => {
      O(() => {
        $e(), ee(), a.replayMode && a.replayData && te(a.replayData, a.replayOptions);
      });
    }), Oe(() => {
      c.value && (c.value.destroy(), c.value = null);
    }), e({
      clear: ue,
      undo: he,
      redo: ce,
      save: de,
      isEmpty: pe,
      fromDataURL: me,
      getSignatureData: Ee,
      setSignatureData: Ie,
      resize: ge,
      // 回放相关方法
      startReplay: te,
      getReplayData: Me,
      setReplayMode: ae,
      play: se,
      pause: ne,
      stop: ie,
      seek: oe,
      setSpeed: re,
      getState: _e,
      getCurrentTime: Re,
      getTotalDuration: Y,
      getProgress: We
    }), (i, l) => (M(), _("div", {
      class: "electronic-signature",
      style: q(xe.value)
    }, [
      v("canvas", {
        ref_key: "canvasRef",
        ref: o,
        width: C.value,
        height: T.value,
        style: q(we.value),
        onMousedown: Ce,
        onMousemove: De,
        onMouseup: Q,
        onMouseleave: Q,
        onTouchstart: Se,
        onTouchmove: Pe,
        onTouchend: K,
        onTouchcancel: K
      }, null, 44, Qe),
      ke.value ? (M(), _("div", {
        key: 0,
        class: "signature-placeholder",
        style: q(Te.value)
      }, B(i.placeholder), 5)) : F("", !0),
      i.showToolbar ? (M(), _("div", Ke, [
        v("button", {
          onClick: ue,
          disabled: !D.value
        }, "清除", 8, Ze),
        v("button", {
          onClick: he,
          disabled: !D.value || !U.value
        }, "撤销", 8, et),
        v("button", {
          onClick: ce,
          disabled: !D.value || !H.value
        }, "重做", 8, tt)
      ])) : F("", !0),
      be.value ? (M(), _("div", at, [
        v("div", st, [
          v("button", {
            onClick: l[0] || (l[0] = (g) => m.value === "playing" ? ne() : se()),
            disabled: m.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            m.value === "playing" ? (M(), _("span", it, "⏸️")) : (M(), _("span", ot, "▶️"))
          ], 8, nt),
          v("button", {
            onClick: l[1] || (l[1] = (g) => ie()),
            disabled: m.value === "idle",
            class: "replay-btn stop-btn"
          }, " ⏹️ ", 8, rt)
        ]),
        v("div", lt, [
          v("input", {
            type: "range",
            min: "0",
            max: Y(),
            value: S.value,
            onInput: l[2] || (l[2] = (g) => oe(Number(g.target.value))),
            class: "progress-slider",
            disabled: m.value === "idle"
          }, null, 40, ut),
          v("div", ht, [
            v("span", null, B(le(S.value)), 1),
            l[4] || (l[4] = v("span", null, "/", -1)),
            v("span", null, B(le(Y())), 1)
          ])
        ]),
        v("div", ct, [
          l[6] || (l[6] = v("label", null, "速度:", -1)),
          v("select", {
            onChange: l[3] || (l[3] = (g) => re(Number(g.target.value))),
            class: "speed-select"
          }, l[5] || (l[5] = [
            v("option", { value: "0.5" }, "0.5x", -1),
            v("option", {
              value: "1",
              selected: ""
            }, "1x", -1),
            v("option", { value: "1.5" }, "1.5x", -1),
            v("option", { value: "2" }, "2x", -1)
          ]), 32)
        ])
      ])) : F("", !0)
    ], 4));
  }
});
const pt = (t, e) => {
  const s = t.__vccOpts || t;
  for (const [a, n] of e)
    s[a] = n;
  return s;
}, fe = /* @__PURE__ */ pt(dt, [["__scopeId", "data-v-7184cb09"]]);
function mt() {
  return window.devicePixelRatio || 1;
}
function xt(t) {
  const e = t.getContext("2d"), s = mt(), a = t.clientWidth, n = t.clientHeight;
  return t.width = a * s, t.height = n * s, e.scale(s, s), t.style.width = a + "px", t.style.height = n + "px", e;
}
function gt(t) {
  if (t.paths.length === 0)
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0
    };
  let e = 1 / 0, s = 1 / 0, a = -1 / 0, n = -1 / 0;
  return t.paths.forEach((o) => {
    o.points.forEach((u) => {
      e = Math.min(e, u.x), s = Math.min(s, u.y), a = Math.max(a, u.x), n = Math.max(n, u.y);
    });
  }), {
    minX: e,
    minY: s,
    maxX: a,
    maxY: n,
    width: a - e,
    height: n - s
  };
}
function wt(t, e, s = 10) {
  const a = gt(e);
  if (a.width === 0 || a.height === 0) {
    const r = document.createElement("canvas");
    return r.width = 1, r.height = 1, r;
  }
  const n = document.createElement("canvas"), o = n.getContext("2d"), u = a.width + s * 2, h = a.height + s * 2;
  return n.width = u, n.height = h, o.drawImage(
    t,
    a.minX - s,
    a.minY - s,
    u,
    h,
    0,
    0,
    u,
    h
  ), n;
}
function Tt(t, e, s, a = !0) {
  const n = document.createElement("canvas"), o = n.getContext("2d");
  let u = e, h = s;
  if (a) {
    const r = t.width / t.height, d = e / s;
    r > d ? h = e / r : u = s * r;
  }
  return n.width = u, n.height = h, o.imageSmoothingEnabled = !0, o.imageSmoothingQuality = "high", o.drawImage(t, 0, 0, u, h), n;
}
function kt(t, e, s = {}) {
  const {
    fontSize: a = 12,
    fontFamily: n = "Arial",
    color: o = "#999",
    opacity: u = 0.5,
    position: h = "bottom-right"
  } = s, r = document.createElement("canvas"), d = r.getContext("2d");
  r.width = t.width, r.height = t.height, d.drawImage(t, 0, 0), d.font = `${a}px ${n}`, d.fillStyle = o, d.globalAlpha = u;
  const c = d.measureText(e).width, y = a;
  let m, f;
  switch (h) {
    case "top-left":
      m = 10, f = y + 10;
      break;
    case "top-right":
      m = t.width - c - 10, f = y + 10;
      break;
    case "bottom-left":
      m = 10, f = t.height - 10;
      break;
    case "bottom-right":
      m = t.width - c - 10, f = t.height - 10;
      break;
    case "center":
      m = (t.width - c) / 2, f = (t.height + y) / 2;
      break;
    default:
      m = t.width - c - 10, f = t.height - 10;
  }
  return d.fillText(e, m, f), d.globalAlpha = 1, r;
}
function bt(t) {
  const e = document.createElement("canvas"), s = e.getContext("2d");
  e.width = t.width, e.height = t.height, s.drawImage(t, 0, 0);
  const a = s.getImageData(0, 0, t.width, t.height), n = a.data;
  for (let o = 0; o < n.length; o += 4) {
    const u = n[o] * 0.299 + n[o + 1] * 0.587 + n[o + 2] * 0.114;
    n[o] = u, n[o + 1] = u, n[o + 2] = u;
  }
  return s.putImageData(a, 0, 0), e;
}
const vt = (t) => {
  t.component("ElectronicSignature", fe);
}, Ct = {
  install: vt,
  ElectronicSignature: fe
}, Dt = "1.0.0";
export {
  fe as ElectronicSignature,
  Ne as SignatureReplayController,
  kt as addWatermark,
  Fe as calculateStrokeWidth,
  R as cloneSignatureData,
  bt as convertToGrayscale,
  X as createEmptySignatureData,
  Je as createReplayData,
  wt as cropSignature,
  Ct as default,
  ve as drawSmoothPath,
  He as exportSignature,
  qe as getAngle,
  Be as getControlPoint,
  mt as getDevicePixelRatio,
  ye as getDistance,
  gt as getSignatureBounds,
  $ as isSignatureEmpty,
  Le as loadImageToCanvas,
  Tt as resizeSignature,
  xt as setupHighDPICanvas,
  Ue as signatureToSVG,
  Dt as version
};
