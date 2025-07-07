var Xe = Object.defineProperty;
var Ye = (t, e, n) => e in t ? Xe(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var x = (t, e, n) => (Ye(t, typeof e != "symbol" ? e + "" : e, n), n);
import { defineComponent as ze, ref as b, computed as w, watch as A, nextTick as O, onMounted as Ae, onUnmounted as Oe, openBlock as M, createElementBlock as _, normalizeStyle as q, createElementVNode as v, toDisplayString as B, createCommentVNode as F } from "vue";
function ye(t, e) {
  return Math.sqrt(
    Math.pow(e.x - t.x, 2) + Math.pow(e.y - t.y, 2)
  );
}
function qe(t, e) {
  return Math.atan2(e.y - t.y, e.x - t.x);
}
function Be(t, e, n, a) {
  const s = e || t, r = n || t, u = 0.2, h = qe(s, r) * (a ? 1 : -1), o = ye(s, r) * u;
  return {
    x: t.x + Math.cos(h) * o,
    y: t.y + Math.sin(h) * o,
    time: t.time
  };
}
function Fe(t, e, n) {
  if (!n.pressure.enabled)
    return n.strokeWidth;
  const a = ye(t, e), s = e.time - t.time, r = s > 0 ? a / s : 0, u = Math.max(0.1, Math.min(1, 1 - r * 0.01)), { min: h, max: o } = n.pressure;
  return h + (o - h) * u;
}
function ve(t, e, n) {
  if (e.length < 2)
    return;
  if (t.strokeStyle = n.strokeColor, t.lineCap = "round", t.lineJoin = "round", !n.smoothing || e.length < 3) {
    t.beginPath(), t.lineWidth = n.strokeWidth, t.moveTo(e[0].x, e[0].y);
    for (let s = 1; s < e.length; s++)
      t.lineTo(e[s].x, e[s].y);
    t.stroke();
    return;
  }
  t.beginPath(), t.moveTo(e[0].x, e[0].y);
  for (let s = 1; s < e.length - 1; s++) {
    const r = e[s], u = e[s + 1];
    n.pressure.enabled ? t.lineWidth = Fe(e[s - 1], r, n) : t.lineWidth = n.strokeWidth;
    const h = Be(r, e[s - 1], u);
    t.quadraticCurveTo(h.x, h.y, r.x, r.y);
  }
  const a = e[e.length - 1];
  t.lineTo(a.x, a.y), t.stroke();
}
function Ue(t) {
  const { canvasSize: e, paths: n } = t;
  let a = `<svg width="${e.width}" height="${e.height}" xmlns="http://www.w3.org/2000/svg">`;
  return n.forEach((s) => {
    if (s.points.length < 2)
      return;
    let r = `M ${s.points[0].x} ${s.points[0].y}`;
    for (let u = 1; u < s.points.length; u++)
      r += ` L ${s.points[u].x} ${s.points[u].y}`;
    a += `<path d="${r}" stroke="${s.strokeColor}" stroke-width="${s.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), a += "</svg>", a;
}
function He(t, e, n = { format: "png" }) {
  const { format: a, quality: s = 0.9, size: r, backgroundColor: u } = n;
  if (a === "svg")
    return Ue(e);
  const h = document.createElement("canvas"), o = h.getContext("2d");
  if (r) {
    h.width = r.width, h.height = r.height;
    const d = r.width / t.width, p = r.height / t.height;
    o.scale(d, p);
  } else
    h.width = t.width, h.height = t.height;
  switch (u && u !== "transparent" && (o.fillStyle = u, o.fillRect(0, 0, h.width, h.height)), o.drawImage(t, 0, 0), a) {
    case "jpeg":
      return h.toDataURL("image/jpeg", s);
    case "base64":
      return h.toDataURL("image/png").split(",")[1];
    case "png":
    default:
      return h.toDataURL("image/png");
  }
}
function Le(t, e) {
  return new Promise((n, a) => {
    const s = new Image();
    s.onload = () => {
      const r = t.getContext("2d");
      r.clearRect(0, 0, t.width, t.height), r.drawImage(s, 0, 0, t.width, t.height), n();
    }, s.onerror = a, s.src = e;
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
  setReplayData(e, n = {}) {
    console.log("设置回放数据:", e), console.log("回放选项:", n), this.replayData = e, this.options = { ...n }, this.speed = n.speed || e.speed || 1, this.currentTime = n.startTime || 0, this.state = "idle", console.log("回放数据设置完成，路径数量:", e.paths.length), console.log("总时长:", e.totalDuration);
  }
  /**
   * 开始播放
   */
  play() {
    if (console.log("播放方法调用，回放数据:", this.replayData), console.log("当前状态:", this.state), !this.replayData) {
      console.error("没有回放数据，无法播放");
      return;
    }
    if (this.replayData.totalDuration <= 0) {
      console.error("回放数据总时长为0，无法播放");
      return;
    }
    if (this.replayData.paths.length === 0) {
      console.error("回放数据没有路径，无法播放");
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
    const n = this.options.endTime || this.replayData.totalDuration;
    this.currentTime = Math.max(0, Math.min(e, n)), this.state === "playing" ? this.startTimestamp = performance.now() - this.currentTime / this.speed : this.pausedTime = this.currentTime / this.speed, this.renderFrame(this.currentTime);
  }
  /**
   * 设置播放速度
   */
  setSpeed(e) {
    const n = this.state === "playing";
    n && this.pause(), this.speed = Math.max(0.1, Math.min(5, e)), this.emit("replay-speed-change", this.speed), n && this.play();
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
    const n = this.options.endTime || this.replayData.totalDuration;
    if (this.currentTime >= n) {
      this.currentTime = n, this.state = "completed", this.renderFrame(this.currentTime), this.emit("replay-complete"), this.options.loop && setTimeout(() => {
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
    let n = !1;
    for (let a = 0; a < this.replayData.paths.length; a++) {
      const s = this.replayData.paths[a], r = s.startTime || 0, u = s.endTime || r + (s.duration || 0);
      if (e < r)
        break;
      if (e >= u) {
        this.drawCompletePath(s), !n && Math.abs(e - u) < 32 && this.emit("replay-path-end", a, s);
        continue;
      }
      n = !0;
      const h = Math.max(0, Math.min(1, (e - r) / Math.max(u - r, 1)));
      h > 0 && Math.abs(e - r) < 32 && this.emit("replay-path-start", a, s), this.drawPartialPath(s, h);
      break;
    }
  }
  /**
   * 绘制完整路径
   */
  drawCompletePath(e) {
    if (!(e.points.length < 2)) {
      this.ctx.beginPath(), this.ctx.strokeStyle = e.strokeColor, this.ctx.lineWidth = e.strokeWidth, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", this.ctx.moveTo(e.points[0].x, e.points[0].y);
      for (let n = 1; n < e.points.length; n++)
        this.ctx.lineTo(e.points[n].x, e.points[n].y);
      this.ctx.stroke();
    }
  }
  /**
   * 绘制部分路径
   */
  drawPartialPath(e, n) {
    if (e.points.length < 2)
      return;
    const a = e.startTime || 0, s = e.duration || 0, r = a + s * n, u = this.getPointsUpToTime(e.points, a, r);
    u.length < 2 || (this.ctx.beginPath(), this.ctx.strokeStyle = e.strokeColor, this.ctx.lineWidth = e.strokeWidth, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", this.drawSmoothCurve(u), this.ctx.stroke());
  }
  /**
   * 获取指定时间内的所有点
   */
  getPointsUpToTime(e, n, a) {
    const s = [];
    for (let r = 0; r < e.length; r++) {
      const u = e[r], h = n + (u.relativeTime || r * 50);
      if (h <= a)
        s.push(u);
      else {
        if (r > 0) {
          const o = e[r - 1], d = n + (o.relativeTime || (r - 1) * 50);
          if (d <= a) {
            const p = (a - d) / (h - d), c = {
              x: o.x + (u.x - o.x) * p,
              y: o.y + (u.y - o.y) * p,
              time: a,
              pressure: o.pressure ? o.pressure + (u.pressure || o.pressure - o.pressure) * p : u.pressure
            };
            s.push(c);
          }
        }
        break;
      }
    }
    return s;
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
    for (let s = 1; s < e.length - 1; s++) {
      const r = e[s], u = e[s + 1], h = (r.x + u.x) / 2, o = (r.y + u.y) / 2;
      this.ctx.quadraticCurveTo(r.x, r.y, h, o);
    }
    const n = e[e.length - 1], a = e[e.length - 2];
    this.ctx.quadraticCurveTo(a.x, a.y, n.x, n.y);
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
  on(e, n) {
    this.eventCallbacks.has(e) || this.eventCallbacks.set(e, []), this.eventCallbacks.get(e).push(n);
  }
  /**
   * 移除事件监听器
   */
  off(e, n) {
    if (this.eventCallbacks.has(e))
      if (n) {
        const a = this.eventCallbacks.get(e), s = a.indexOf(n);
        s > -1 && a.splice(s, 1);
      } else
        this.eventCallbacks.delete(e);
  }
  /**
   * 触发事件
   */
  emit(e, ...n) {
    const a = this.eventCallbacks.get(e);
    a && a.forEach((s) => s(...n));
  }
  /**
   * 销毁控制器
   */
  destroy() {
    this.stop(), this.eventCallbacks.clear(), this.replayData = null;
  }
}
function Je(t) {
  const e = t.paths.map((o) => {
    const d = o.points.map((c, f) => {
      var y;
      let m;
      if (c.time && o.points[0].time)
        m = c.time - o.points[0].time;
      else if (f === 0)
        m = 0;
      else {
        const S = o.points[f - 1], T = Math.sqrt(
          Math.pow(c.x - S.x, 2) + Math.pow(c.y - S.y, 2)
        ) / 100 * 1e3;
        m = (((y = d[f - 1]) == null ? void 0 : y.relativeTime) || 0) + Math.max(T, 16);
      }
      return {
        ...c,
        relativeTime: m
      };
    }), p = d.length > 0 ? d[d.length - 1].relativeTime : 0;
    return {
      ...o,
      points: d,
      duration: p
    };
  }), n = [];
  for (let o = 0; o < e.length; o++) {
    const d = e[o];
    let p;
    if (o === 0)
      p = 0;
    else {
      const m = n[o - 1], y = je(
        t.paths[o - 1].points,
        t.paths[o].points
      );
      p = m.endTime + y;
    }
    const c = p + d.duration, f = {
      ...d,
      startTime: p,
      endTime: c
    };
    console.log(`路径 ${o}: 开始时间=${p}, 结束时间=${c}, 持续时间=${d.duration}`), n.push(f);
  }
  const a = n.length > 0 ? n[n.length - 1].endTime : 0;
  console.log("回放数据生成完成:"), console.log("- 路径数量:", n.length), console.log("- 总时长:", a), console.log("- 路径详情:", n.map((o) => ({
    startTime: o.startTime,
    endTime: o.endTime,
    duration: o.duration,
    pointCount: o.points.length
  })));
  const s = n.reduce((o, d) => o + Ge(d.points), 0), r = a > 0 ? s / (a / 1e3) : 0, u = n.slice(1).map((o, d) => {
    const p = n[d];
    return o.startTime - p.endTime;
  }), h = u.length > 0 ? u.reduce((o, d) => o + d, 0) / u.length : 0;
  return {
    paths: n,
    totalDuration: a,
    speed: 1,
    metadata: {
      deviceType: Ve(t),
      averageSpeed: r,
      totalDistance: s,
      averagePauseTime: h
    }
  };
}
function je(t, e) {
  if (t.length === 0 || e.length === 0)
    return 200;
  const n = t[t.length - 1], a = e[0];
  if (n.time && a.time)
    return Math.max(a.time - n.time, 50);
  const s = Math.sqrt(
    Math.pow(a.x - n.x, 2) + Math.pow(a.y - n.y, 2)
  );
  return Math.min(Math.max(s * 2, 100), 1e3);
}
function Ve(t) {
  const e = t.paths.reduce((r, u) => r + u.points.length, 0), n = t.paths.length;
  if (e === 0)
    return "touch";
  const a = e / n;
  return a > 20 ? "touch" : a < 10 ? "mouse" : t.paths.some(
    (r) => r.points.some((u) => u.pressure !== void 0)
  ) ? "pen" : "touch";
}
function Ge(t) {
  let e = 0;
  for (let n = 1; n < t.length; n++) {
    const a = t[n].x - t[n - 1].x, s = t[n].y - t[n - 1].y;
    e += Math.sqrt(a * a + s * s);
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
  setup(t, { expose: e, emit: n }) {
    const a = t, s = n, r = b(), u = b(!1), h = b(null), o = b(X(0, 0)), d = b([]), p = b(-1), c = b(null), f = b(!1), m = b("idle"), y = b(0), S = b(0), C = w(() => typeof a.width == "number" ? a.width : 800), T = w(() => typeof a.height == "number" ? a.height : 300), xe = w(() => ({
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
    })), ke = w(() => a.placeholder && $(o.value)), U = w(() => p.value > 0), H = w(() => p.value < d.value.length - 1), L = w(() => f.value && c.value), D = w(() => !L.value && !a.disabled), be = w(() => {
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
      return ((i = r.value) == null ? void 0 : i.getContext("2d")) || null;
    }, W = (i, l) => {
      const g = r.value, k = g.getBoundingClientRect(), z = g.width / k.width, I = g.height / k.height;
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
      }, s("signature-start");
    }, V = (i) => {
      if (!u.value || !h.value || !D.value)
        return;
      const l = performance.now(), g = { ...i, time: l };
      h.value.points.push(g), h.value.startTime && (h.value.endTime = l, h.value.duration = l - h.value.startTime);
      const k = J();
      k && ve(k, h.value.points, N.value), Z(), s("signature-drawing", o.value);
    }, G = () => {
      if (!(!u.value || !h.value)) {
        if (u.value = !1, h.value.points.length > 0) {
          const i = h.value.points[h.value.points.length - 1];
          i.time && h.value.startTime && (h.value.endTime = i.time, h.value.duration = i.time - h.value.startTime);
        }
        o.value.paths.push(h.value), o.value.isEmpty = !1, o.value.timestamp = Date.now(), E(), h.value = null, s("signature-end", o.value);
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
      o.value.canvasSize = {
        width: C.value,
        height: T.value
      }, o.value.isEmpty = $(o.value);
    }, E = () => {
      d.value = d.value.slice(0, p.value + 1), d.value.push(R(o.value)), p.value = d.value.length - 1;
      const i = 50;
      d.value.length > i && (d.value = d.value.slice(-i), p.value = d.value.length - 1);
    }, P = () => {
      const i = J();
      i && (i.clearRect(0, 0, C.value, T.value), a.backgroundColor && a.backgroundColor !== "transparent" && (i.fillStyle = a.backgroundColor, i.fillRect(0, 0, C.value, T.value)), o.value.paths.forEach((l) => {
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
      r.value && (c.value && c.value.destroy(), c.value = new Ne(r.value), c.value.on("replay-start", () => {
        m.value = "playing", s("replay-start");
      }), c.value.on("replay-progress", (i, l) => {
        y.value = i, S.value = l, s("replay-progress", i, l);
      }), c.value.on("replay-pause", () => {
        m.value = "paused", s("replay-pause");
      }), c.value.on("replay-resume", () => {
        m.value = "playing", s("replay-resume");
      }), c.value.on("replay-stop", () => {
        m.value = "stopped", s("replay-stop");
      }), c.value.on("replay-complete", () => {
        m.value = "completed", s("replay-complete");
      }), c.value.on("replay-path-start", (i, l) => {
        s("replay-path-start", i, l);
      }), c.value.on("replay-path-end", (i, l) => {
        s("replay-path-end", i, l);
      }), c.value.on("replay-speed-change", (i) => {
        s("replay-speed-change", i);
      }));
    }, te = (i, l) => {
      c.value || ee(), c.value && (f.value = !0, c.value.setReplayData(i, l || {}), console.log("startReplay调用，自动播放:", l == null ? void 0 : l.autoPlay), (l == null ? void 0 : l.autoPlay) === !0 && c.value.play());
    }, ae = (i) => {
      f.value = i, !i && c.value && (c.value.stop(), P());
    }, Me = () => $(o.value) ? null : Je(o.value), ne = () => {
      var i;
      (i = c.value) == null || i.play();
    }, se = () => {
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
      D.value && (o.value = X(C.value, T.value), P(), E(), s("signature-clear"));
    }, he = () => {
      !U.value || !D.value || (p.value--, o.value = R(d.value[p.value]), P(), s("signature-undo", o.value));
    }, ce = () => {
      !H.value || !D.value || (p.value++, o.value = R(d.value[p.value]), P(), s("signature-redo", o.value));
    }, de = (i) => {
      const l = r.value;
      return He(l, o.value, i);
    }, pe = () => $(o.value), me = async (i) => {
      if (!D.value)
        return;
      const l = r.value;
      await Le(l, i), o.value = X(C.value, T.value), o.value.isEmpty = !1, E();
    }, Ee = () => R(o.value), Ie = (i) => {
      D.value && (o.value = R(i), P(), E());
    }, ge = (i, l) => {
      const g = i || C.value, k = l || T.value, z = de({ format: "png" });
      O(() => {
        const I = r.value;
        I.width = g, I.height = k, pe() || me(z), Z();
      });
    }, $e = () => {
      const i = r.value;
      i.width = C.value, i.height = T.value, o.value = X(C.value, T.value), d.value = [R(o.value)], p.value = 0, P();
    };
    return A([() => a.width, () => a.height], () => {
      O(() => {
        r.value && ge();
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
      play: ne,
      pause: se,
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
        ref: r,
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
        v("div", nt, [
          v("button", {
            onClick: l[0] || (l[0] = (g) => m.value === "playing" ? se() : ne()),
            disabled: m.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            m.value === "playing" ? (M(), _("span", it, "⏸️")) : (M(), _("span", ot, "▶️"))
          ], 8, st),
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
  const n = t.__vccOpts || t;
  for (const [a, s] of e)
    n[a] = s;
  return n;
}, fe = /* @__PURE__ */ pt(dt, [["__scopeId", "data-v-7184cb09"]]);
function mt() {
  return window.devicePixelRatio || 1;
}
function xt(t) {
  const e = t.getContext("2d"), n = mt(), a = t.clientWidth, s = t.clientHeight;
  return t.width = a * n, t.height = s * n, e.scale(n, n), t.style.width = a + "px", t.style.height = s + "px", e;
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
  let e = 1 / 0, n = 1 / 0, a = -1 / 0, s = -1 / 0;
  return t.paths.forEach((r) => {
    r.points.forEach((u) => {
      e = Math.min(e, u.x), n = Math.min(n, u.y), a = Math.max(a, u.x), s = Math.max(s, u.y);
    });
  }), {
    minX: e,
    minY: n,
    maxX: a,
    maxY: s,
    width: a - e,
    height: s - n
  };
}
function wt(t, e, n = 10) {
  const a = gt(e);
  if (a.width === 0 || a.height === 0) {
    const o = document.createElement("canvas");
    return o.width = 1, o.height = 1, o;
  }
  const s = document.createElement("canvas"), r = s.getContext("2d"), u = a.width + n * 2, h = a.height + n * 2;
  return s.width = u, s.height = h, r.drawImage(
    t,
    a.minX - n,
    a.minY - n,
    u,
    h,
    0,
    0,
    u,
    h
  ), s;
}
function Tt(t, e, n, a = !0) {
  const s = document.createElement("canvas"), r = s.getContext("2d");
  let u = e, h = n;
  if (a) {
    const o = t.width / t.height, d = e / n;
    o > d ? h = e / o : u = n * o;
  }
  return s.width = u, s.height = h, r.imageSmoothingEnabled = !0, r.imageSmoothingQuality = "high", r.drawImage(t, 0, 0, u, h), s;
}
function kt(t, e, n = {}) {
  const {
    fontSize: a = 12,
    fontFamily: s = "Arial",
    color: r = "#999",
    opacity: u = 0.5,
    position: h = "bottom-right"
  } = n, o = document.createElement("canvas"), d = o.getContext("2d");
  o.width = t.width, o.height = t.height, d.drawImage(t, 0, 0), d.font = `${a}px ${s}`, d.fillStyle = r, d.globalAlpha = u;
  const c = d.measureText(e).width, f = a;
  let m, y;
  switch (h) {
    case "top-left":
      m = 10, y = f + 10;
      break;
    case "top-right":
      m = t.width - c - 10, y = f + 10;
      break;
    case "bottom-left":
      m = 10, y = t.height - 10;
      break;
    case "bottom-right":
      m = t.width - c - 10, y = t.height - 10;
      break;
    case "center":
      m = (t.width - c) / 2, y = (t.height + f) / 2;
      break;
    default:
      m = t.width - c - 10, y = t.height - 10;
  }
  return d.fillText(e, m, y), d.globalAlpha = 1, o;
}
function bt(t) {
  const e = document.createElement("canvas"), n = e.getContext("2d");
  e.width = t.width, e.height = t.height, n.drawImage(t, 0, 0);
  const a = n.getImageData(0, 0, t.width, t.height), s = a.data;
  for (let r = 0; r < s.length; r += 4) {
    const u = s[r] * 0.299 + s[r + 1] * 0.587 + s[r + 2] * 0.114;
    s[r] = u, s[r + 1] = u, s[r + 2] = u;
  }
  return n.putImageData(a, 0, 0), e;
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
