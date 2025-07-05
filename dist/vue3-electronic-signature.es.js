var Xe = Object.defineProperty;
var Ye = (t, e, s) => e in t ? Xe(t, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : t[e] = s;
var w = (t, e, s) => (Ye(t, typeof e != "symbol" ? e + "" : e, s), s);
import { defineComponent as ze, ref as C, computed as T, watch as q, nextTick as B, onMounted as Ae, onUnmounted as Oe, openBlock as M, createElementBlock as _, normalizeStyle as F, createElementVNode as v, toDisplayString as U, createCommentVNode as H } from "vue";
function xe(t, e) {
  return Math.sqrt(
    Math.pow(e.x - t.x, 2) + Math.pow(e.y - t.y, 2)
  );
}
function qe(t, e) {
  return Math.atan2(e.y - t.y, e.x - t.x);
}
function Be(t, e, s, a) {
  const n = e || t, o = s || t, h = 0.2, l = qe(n, o) * (a ? 1 : -1), r = xe(n, o) * h;
  return {
    x: t.x + Math.cos(l) * r,
    y: t.y + Math.sin(l) * r,
    time: t.time
  };
}
function Fe(t, e, s) {
  if (!s.pressure.enabled)
    return s.strokeWidth;
  const a = xe(t, e), n = e.time - t.time, o = n > 0 ? a / n : 0, h = Math.max(0.1, Math.min(1, 1 - o * 0.01)), { min: l, max: r } = s.pressure;
  return l + (r - l) * h;
}
function fe(t, e, s) {
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
    const o = e[n], h = e[n + 1];
    s.pressure.enabled ? t.lineWidth = Fe(e[n - 1], o, s) : t.lineWidth = s.strokeWidth;
    const l = Be(o, e[n - 1], h);
    t.quadraticCurveTo(l.x, l.y, o.x, o.y);
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
    for (let h = 1; h < n.points.length; h++)
      o += ` L ${n.points[h].x} ${n.points[h].y}`;
    a += `<path d="${o}" stroke="${n.strokeColor}" stroke-width="${n.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), a += "</svg>", a;
}
function He(t, e, s = { format: "png" }) {
  const { format: a, quality: n = 0.9, size: o, backgroundColor: h } = s;
  if (a === "svg")
    return Ue(e);
  const l = document.createElement("canvas"), r = l.getContext("2d");
  if (o) {
    l.width = o.width, l.height = o.height;
    const d = o.width / t.width, g = o.height / t.height;
    r.scale(d, g);
  } else
    l.width = t.width, l.height = t.height;
  switch (h && h !== "transparent" && (r.fillStyle = h, r.fillRect(0, 0, l.width, l.height)), r.drawImage(t, 0, 0), a) {
    case "jpeg":
      return l.toDataURL("image/jpeg", n);
    case "base64":
      return l.toDataURL("image/png").split(",")[1];
    case "png":
    default:
      return l.toDataURL("image/png");
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
    w(this, "canvas");
    w(this, "ctx");
    w(this, "replayData", null);
    w(this, "state", "idle");
    w(this, "currentTime", 0);
    w(this, "speed", 1);
    w(this, "animationId", null);
    w(this, "startTimestamp", 0);
    w(this, "pausedTime", 0);
    w(this, "options", {});
    // 事件回调
    w(this, "eventCallbacks", /* @__PURE__ */ new Map());
    this.canvas = e, this.ctx = e.getContext("2d");
  }
  /**
   * 设置回放数据
   */
  setReplayData(e, s = {}) {
    this.replayData = e, this.options = { ...s }, this.speed = s.speed || e.speed || 1, this.currentTime = s.startTime || 0, this.state = "idle";
  }
  /**
   * 开始播放
   */
  play() {
    !this.replayData || this.state === "playing" || (this.state === "paused" ? (this.state = "playing", this.startTimestamp = performance.now() - this.pausedTime, this.emit("replay-resume")) : (this.state = "playing", this.startTimestamp = performance.now(), this.pausedTime = 0, this.currentTime = this.options.startTime || 0, this.clearCanvas(), this.emit("replay-start")), this.animate());
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
      const n = this.replayData.paths[a], o = n.startTime || 0, h = n.endTime || o + (n.duration || 0);
      if (e < o)
        break;
      if (e >= h) {
        this.drawCompletePath(n), !s && Math.abs(e - h) < 32 && this.emit("replay-path-end", a, n);
        continue;
      }
      s = !0;
      const l = Math.max(0, Math.min(1, (e - o) / Math.max(h - o, 1)));
      l > 0 && Math.abs(e - o) < 32 && this.emit("replay-path-start", a, n), this.drawPartialPath(n, l);
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
    const a = e.startTime || 0, n = e.duration || 0, o = a + n * s, h = this.getPointsUpToTime(e.points, a, o);
    h.length < 2 || (this.ctx.beginPath(), this.ctx.strokeStyle = e.strokeColor, this.ctx.lineWidth = e.strokeWidth, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", this.drawSmoothCurve(h), this.ctx.stroke());
  }
  /**
   * 获取指定时间内的所有点
   */
  getPointsUpToTime(e, s, a) {
    const n = [];
    for (let o = 0; o < e.length; o++) {
      const h = e[o], l = s + (h.relativeTime || o * 50);
      if (l <= a)
        n.push(h);
      else {
        if (o > 0) {
          const r = e[o - 1], d = s + (r.relativeTime || (o - 1) * 50);
          if (d <= a) {
            const g = (a - d) / (l - d), c = {
              x: r.x + (h.x - r.x) * g,
              y: r.y + (h.y - r.y) * g,
              time: a,
              pressure: r.pressure ? r.pressure + (h.pressure || r.pressure - r.pressure) * g : h.pressure
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
      const o = e[n], h = e[n + 1], l = (o.x + h.x) / 2, r = (o.y + h.y) / 2;
      this.ctx.quadraticCurveTo(o.x, o.y, l, r);
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
  const e = t.paths.map((l, r) => {
    const d = l.points.map((p, y) => {
      var f;
      let D;
      if (p.time && l.points[0].time)
        D = p.time - l.points[0].time;
      else if (y === 0)
        D = 0;
      else {
        const x = l.points[y - 1], Y = Math.sqrt(
          Math.pow(p.x - x.x, 2) + Math.pow(p.y - x.y, 2)
        ) / 100 * 1e3;
        D = (((f = d[y - 1]) == null ? void 0 : f.relativeTime) || 0) + Math.max(Y, 16);
      }
      return {
        ...p,
        relativeTime: D
      };
    });
    let g;
    if (r === 0)
      g = 0;
    else {
      const p = e[r - 1], y = je(
        t.paths[r - 1].points,
        l.points
      );
      g = p.endTime + y;
    }
    const c = d.length > 0 ? d[d.length - 1].relativeTime : 0, S = g + c;
    return {
      ...l,
      points: d,
      startTime: g,
      endTime: S,
      duration: c
    };
  }), s = e.length > 0 ? e[e.length - 1].endTime : 0, a = e.reduce((l, r) => l + Ge(r.points), 0), n = s > 0 ? a / (s / 1e3) : 0, o = e.slice(1).map((l, r) => {
    const d = e[r];
    return l.startTime - d.endTime;
  }), h = o.length > 0 ? o.reduce((l, r) => l + r, 0) / o.length : 0;
  return {
    paths: e,
    totalDuration: s,
    speed: 1,
    metadata: {
      deviceType: Ve(t),
      averageSpeed: n,
      totalDistance: a,
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
  const e = t.paths.reduce((o, h) => o + h.points.length, 0), s = t.paths.length;
  if (e === 0)
    return "touch";
  const a = e / s;
  return a > 20 ? "touch" : a < 10 ? "mouse" : t.paths.some(
    (o) => o.points.some((h) => h.pressure !== void 0)
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
}, nt = { class: "replay-buttons" }, st = ["disabled"], it = { key: 0 }, ot = { key: 1 }, rt = ["disabled"], lt = { class: "replay-progress" }, ut = ["max", "value", "disabled"], ht = { class: "time-display" }, ct = { class: "replay-speed" }, dt = /* @__PURE__ */ ze({
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
    const a = t, n = s, o = C(), h = C(!1), l = C(null), r = C(X(0, 0)), d = C([]), g = C(-1), c = C(null), S = C(!1), p = C("idle"), y = C(0), D = C(0), f = T(() => typeof a.width == "number" ? a.width : 800), x = T(() => typeof a.height == "number" ? a.height : 300), L = T(() => ({
      position: "relative",
      display: "inline-block",
      width: typeof a.width == "string" ? a.width : `${a.width}px`,
      height: typeof a.height == "string" ? a.height : `${a.height}px`
    })), Y = T(() => ({
      border: a.borderStyle,
      borderRadius: a.borderRadius,
      backgroundColor: a.backgroundColor,
      cursor: a.disabled ? "not-allowed" : "crosshair",
      display: "block",
      width: "100%",
      height: "100%"
    })), Te = T(() => ({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "#999",
      fontSize: "14px",
      pointerEvents: "none",
      userSelect: "none"
    })), ke = T(() => a.placeholder && $(r.value)), N = T(() => g.value > 0), J = T(() => g.value < d.value.length - 1), j = T(() => S.value && c.value), b = T(() => !j.value && !a.disabled), Ce = T(() => {
      var i;
      return j.value && ((i = a.replayOptions) == null ? void 0 : i.showControls) !== !1;
    }), V = T(() => ({
      strokeColor: a.strokeColor,
      strokeWidth: a.strokeWidth,
      smoothing: a.smoothing,
      pressure: {
        enabled: a.pressureSensitive,
        min: a.minStrokeWidth,
        max: a.maxStrokeWidth
      }
    })), G = () => {
      var i;
      return ((i = o.value) == null ? void 0 : i.getContext("2d")) || null;
    }, W = (i, u) => {
      const m = o.value, k = m.getBoundingClientRect(), O = m.width / k.width, I = m.height / k.height;
      return {
        x: (i - k.left) * O,
        y: (u - k.top) * I,
        time: Date.now()
      };
    }, Q = (i) => {
      if (!b.value)
        return;
      h.value = !0;
      const u = performance.now(), m = { ...i, time: u };
      l.value = {
        points: [m],
        strokeColor: a.strokeColor,
        strokeWidth: a.strokeWidth,
        startTime: u,
        endTime: u,
        duration: 0
      }, n("signature-start");
    }, K = (i) => {
      if (!h.value || !l.value || !b.value)
        return;
      const u = performance.now(), m = { ...i, time: u };
      l.value.points.push(m), l.value.startTime && (l.value.endTime = u, l.value.duration = u - l.value.startTime);
      const k = G();
      k && fe(k, l.value.points, V.value), ae(), n("signature-drawing", r.value);
    }, Z = () => {
      if (!(!h.value || !l.value)) {
        if (h.value = !1, l.value.points.length > 0) {
          const i = l.value.points[l.value.points.length - 1];
          i.time && l.value.startTime && (l.value.endTime = i.time, l.value.duration = i.time - l.value.startTime);
        }
        r.value.paths.push(l.value), r.value.isEmpty = !1, r.value.timestamp = Date.now(), E(), l.value = null, n("signature-end", r.value);
      }
    }, be = (i) => {
      i.preventDefault();
      const u = W(i.clientX, i.clientY);
      Q(u);
    }, Se = (i) => {
      if (i.preventDefault(), !h.value)
        return;
      const u = W(i.clientX, i.clientY);
      K(u);
    }, ee = (i) => {
      i.preventDefault(), Z();
    }, De = (i) => {
      if (i.preventDefault(), i.touches.length !== 1)
        return;
      const u = i.touches[0], m = W(u.clientX, u.clientY);
      Q(m);
    }, Pe = (i) => {
      if (i.preventDefault(), i.touches.length !== 1 || !h.value)
        return;
      const u = i.touches[0], m = W(u.clientX, u.clientY);
      K(m);
    }, te = (i) => {
      i.preventDefault(), Z();
    }, ae = () => {
      r.value.canvasSize = {
        width: f.value,
        height: x.value
      }, r.value.isEmpty = $(r.value);
    }, E = () => {
      d.value = d.value.slice(0, g.value + 1), d.value.push(R(r.value)), g.value = d.value.length - 1;
      const i = 50;
      d.value.length > i && (d.value = d.value.slice(-i), g.value = d.value.length - 1);
    }, P = () => {
      const i = G();
      i && (i.clearRect(0, 0, f.value, x.value), a.backgroundColor && a.backgroundColor !== "transparent" && (i.fillStyle = a.backgroundColor, i.fillRect(0, 0, f.value, x.value)), r.value.paths.forEach((u) => {
        if (u.points.length > 0) {
          const m = {
            strokeColor: u.strokeColor,
            strokeWidth: u.strokeWidth,
            smoothing: a.smoothing,
            pressure: V.value.pressure
          };
          fe(i, u.points, m);
        }
      }));
    }, ne = () => {
      o.value && (c.value && c.value.destroy(), c.value = new Ne(o.value), c.value.on("replay-start", () => {
        p.value = "playing", n("replay-start");
      }), c.value.on("replay-progress", (i, u) => {
        y.value = i, D.value = u, n("replay-progress", i, u);
      }), c.value.on("replay-pause", () => {
        p.value = "paused", n("replay-pause");
      }), c.value.on("replay-resume", () => {
        p.value = "playing", n("replay-resume");
      }), c.value.on("replay-stop", () => {
        p.value = "stopped", n("replay-stop");
      }), c.value.on("replay-complete", () => {
        p.value = "completed", n("replay-complete");
      }), c.value.on("replay-path-start", (i, u) => {
        n("replay-path-start", i, u);
      }), c.value.on("replay-path-end", (i, u) => {
        n("replay-path-end", i, u);
      }), c.value.on("replay-speed-change", (i) => {
        n("replay-speed-change", i);
      }));
    }, z = (i, u) => {
      c.value || ne(), c.value && (S.value = !0, c.value.setReplayData(i, u), (u == null ? void 0 : u.autoPlay) !== !1 && c.value.play());
    }, se = (i) => {
      S.value = i, !i && c.value && (c.value.stop(), P());
    }, Me = () => $(r.value) ? null : Je(r.value), ie = () => {
      var i;
      (i = c.value) == null || i.play();
    }, oe = () => {
      var i;
      (i = c.value) == null || i.pause();
    }, re = () => {
      var i;
      (i = c.value) == null || i.stop();
    }, le = (i) => {
      var u;
      (u = c.value) == null || u.seek(i);
    }, ue = (i) => {
      var u;
      (u = c.value) == null || u.setSpeed(i);
    }, _e = () => {
      var i;
      return ((i = c.value) == null ? void 0 : i.getState()) || "idle";
    }, Re = () => {
      var i;
      return ((i = c.value) == null ? void 0 : i.getCurrentTime()) || 0;
    }, A = () => {
      var i;
      return ((i = c.value) == null ? void 0 : i.getTotalDuration()) || 0;
    }, We = () => {
      var i;
      return ((i = c.value) == null ? void 0 : i.getProgress()) || 0;
    }, he = (i) => {
      const u = Math.floor(i / 1e3), m = Math.floor(u / 60), k = u % 60;
      return `${m}:${k.toString().padStart(2, "0")}`;
    }, ce = () => {
      b.value && (r.value = X(f.value, x.value), P(), E(), n("signature-clear"));
    }, de = () => {
      !N.value || !b.value || (g.value--, r.value = R(d.value[g.value]), P(), n("signature-undo", r.value));
    }, pe = () => {
      !J.value || !b.value || (g.value++, r.value = R(d.value[g.value]), P(), n("signature-redo", r.value));
    }, me = (i) => {
      const u = o.value;
      return He(u, r.value, i);
    }, ge = () => $(r.value), ve = async (i) => {
      if (!b.value)
        return;
      const u = o.value;
      await Le(u, i), r.value = X(f.value, x.value), r.value.isEmpty = !1, E();
    }, Ee = () => R(r.value), Ie = (i) => {
      b.value && (r.value = R(i), P(), E());
    }, ye = (i, u) => {
      const m = i || f.value, k = u || x.value, O = me({ format: "png" });
      B(() => {
        const I = o.value;
        I.width = m, I.height = k, ge() || ve(O), ae();
      });
    }, $e = () => {
      const i = o.value;
      i.width = f.value, i.height = x.value, r.value = X(f.value, x.value), d.value = [R(r.value)], g.value = 0, P();
    };
    return q([() => a.width, () => a.height], () => {
      B(() => {
        o.value && ye();
      });
    }), q(() => a.replayMode, (i) => {
      i !== void 0 && se(i);
    }), q(() => a.replayData, (i) => {
      i && a.replayMode && z(i, a.replayOptions);
    }), Ae(() => {
      B(() => {
        $e(), ne(), a.replayMode && a.replayData && z(a.replayData, a.replayOptions);
      });
    }), Oe(() => {
      c.value && (c.value.destroy(), c.value = null);
    }), e({
      clear: ce,
      undo: de,
      redo: pe,
      save: me,
      isEmpty: ge,
      fromDataURL: ve,
      getSignatureData: Ee,
      setSignatureData: Ie,
      resize: ye,
      // 回放相关方法
      startReplay: z,
      getReplayData: Me,
      setReplayMode: se,
      play: ie,
      pause: oe,
      stop: re,
      seek: le,
      setSpeed: ue,
      getState: _e,
      getCurrentTime: Re,
      getTotalDuration: A,
      getProgress: We
    }), (i, u) => (M(), _("div", {
      class: "electronic-signature",
      style: F(L.value)
    }, [
      v("canvas", {
        ref_key: "canvasRef",
        ref: o,
        width: f.value,
        height: x.value,
        style: F(Y.value),
        onMousedown: be,
        onMousemove: Se,
        onMouseup: ee,
        onMouseleave: ee,
        onTouchstart: De,
        onTouchmove: Pe,
        onTouchend: te,
        onTouchcancel: te
      }, null, 44, Qe),
      ke.value ? (M(), _("div", {
        key: 0,
        class: "signature-placeholder",
        style: F(Te.value)
      }, U(i.placeholder), 5)) : H("", !0),
      i.showToolbar ? (M(), _("div", Ke, [
        v("button", {
          onClick: ce,
          disabled: !b.value
        }, "清除", 8, Ze),
        v("button", {
          onClick: de,
          disabled: !b.value || !N.value
        }, "撤销", 8, et),
        v("button", {
          onClick: pe,
          disabled: !b.value || !J.value
        }, "重做", 8, tt)
      ])) : H("", !0),
      Ce.value ? (M(), _("div", at, [
        v("div", nt, [
          v("button", {
            onClick: u[0] || (u[0] = (m) => p.value === "playing" ? oe() : ie()),
            disabled: p.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            p.value === "playing" ? (M(), _("span", it, "⏸️")) : (M(), _("span", ot, "▶️"))
          ], 8, st),
          v("button", {
            onClick: u[1] || (u[1] = (m) => re()),
            disabled: p.value === "idle",
            class: "replay-btn stop-btn"
          }, " ⏹️ ", 8, rt)
        ]),
        v("div", lt, [
          v("input", {
            type: "range",
            min: "0",
            max: A(),
            value: D.value,
            onInput: u[2] || (u[2] = (m) => le(Number(m.target.value))),
            class: "progress-slider",
            disabled: p.value === "idle"
          }, null, 40, ut),
          v("div", ht, [
            v("span", null, U(he(D.value)), 1),
            u[4] || (u[4] = v("span", null, "/", -1)),
            v("span", null, U(he(A())), 1)
          ])
        ]),
        v("div", ct, [
          u[6] || (u[6] = v("label", null, "速度:", -1)),
          v("select", {
            onChange: u[3] || (u[3] = (m) => ue(Number(m.target.value))),
            class: "speed-select"
          }, u[5] || (u[5] = [
            v("option", { value: "0.5" }, "0.5x", -1),
            v("option", {
              value: "1",
              selected: ""
            }, "1x", -1),
            v("option", { value: "1.5" }, "1.5x", -1),
            v("option", { value: "2" }, "2x", -1)
          ]), 32)
        ])
      ])) : H("", !0)
    ], 4));
  }
});
const pt = (t, e) => {
  const s = t.__vccOpts || t;
  for (const [a, n] of e)
    s[a] = n;
  return s;
}, we = /* @__PURE__ */ pt(dt, [["__scopeId", "data-v-6dd7f370"]]);
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
    o.points.forEach((h) => {
      e = Math.min(e, h.x), s = Math.min(s, h.y), a = Math.max(a, h.x), n = Math.max(n, h.y);
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
  const n = document.createElement("canvas"), o = n.getContext("2d"), h = a.width + s * 2, l = a.height + s * 2;
  return n.width = h, n.height = l, o.drawImage(
    t,
    a.minX - s,
    a.minY - s,
    h,
    l,
    0,
    0,
    h,
    l
  ), n;
}
function Tt(t, e, s, a = !0) {
  const n = document.createElement("canvas"), o = n.getContext("2d");
  let h = e, l = s;
  if (a) {
    const r = t.width / t.height, d = e / s;
    r > d ? l = e / r : h = s * r;
  }
  return n.width = h, n.height = l, o.imageSmoothingEnabled = !0, o.imageSmoothingQuality = "high", o.drawImage(t, 0, 0, h, l), n;
}
function kt(t, e, s = {}) {
  const {
    fontSize: a = 12,
    fontFamily: n = "Arial",
    color: o = "#999",
    opacity: h = 0.5,
    position: l = "bottom-right"
  } = s, r = document.createElement("canvas"), d = r.getContext("2d");
  r.width = t.width, r.height = t.height, d.drawImage(t, 0, 0), d.font = `${a}px ${n}`, d.fillStyle = o, d.globalAlpha = h;
  const c = d.measureText(e).width, S = a;
  let p, y;
  switch (l) {
    case "top-left":
      p = 10, y = S + 10;
      break;
    case "top-right":
      p = t.width - c - 10, y = S + 10;
      break;
    case "bottom-left":
      p = 10, y = t.height - 10;
      break;
    case "bottom-right":
      p = t.width - c - 10, y = t.height - 10;
      break;
    case "center":
      p = (t.width - c) / 2, y = (t.height + S) / 2;
      break;
    default:
      p = t.width - c - 10, y = t.height - 10;
  }
  return d.fillText(e, p, y), d.globalAlpha = 1, r;
}
function Ct(t) {
  const e = document.createElement("canvas"), s = e.getContext("2d");
  e.width = t.width, e.height = t.height, s.drawImage(t, 0, 0);
  const a = s.getImageData(0, 0, t.width, t.height), n = a.data;
  for (let o = 0; o < n.length; o += 4) {
    const h = n[o] * 0.299 + n[o + 1] * 0.587 + n[o + 2] * 0.114;
    n[o] = h, n[o + 1] = h, n[o + 2] = h;
  }
  return s.putImageData(a, 0, 0), e;
}
const vt = (t) => {
  t.component("ElectronicSignature", we);
}, bt = {
  install: vt,
  ElectronicSignature: we
}, St = "1.0.0";
export {
  we as ElectronicSignature,
  Ne as SignatureReplayController,
  kt as addWatermark,
  Fe as calculateStrokeWidth,
  R as cloneSignatureData,
  Ct as convertToGrayscale,
  X as createEmptySignatureData,
  Je as createReplayData,
  wt as cropSignature,
  bt as default,
  fe as drawSmoothPath,
  He as exportSignature,
  qe as getAngle,
  Be as getControlPoint,
  mt as getDevicePixelRatio,
  xe as getDistance,
  gt as getSignatureBounds,
  $ as isSignatureEmpty,
  Le as loadImageToCanvas,
  Tt as resizeSignature,
  xt as setupHighDPICanvas,
  Ue as signatureToSVG,
  St as version
};
