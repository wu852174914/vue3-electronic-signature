var Xe = Object.defineProperty;
var Ye = (a, e, n) => e in a ? Xe(a, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : a[e] = n;
var x = (a, e, n) => (Ye(a, typeof e != "symbol" ? e + "" : e, n), n);
import { defineComponent as ze, ref as b, computed as T, watch as A, nextTick as O, onMounted as Ae, onUnmounted as Oe, openBlock as M, createElementBlock as _, normalizeStyle as q, createElementVNode as v, toDisplayString as B, createCommentVNode as F } from "vue";
function ye(a, e) {
  return Math.sqrt(
    Math.pow(e.x - a.x, 2) + Math.pow(e.y - a.y, 2)
  );
}
function qe(a, e) {
  return Math.atan2(e.y - a.y, e.x - a.x);
}
function Be(a, e, n, t) {
  const s = e || a, l = n || a, u = 0.2, c = qe(s, l) * (t ? 1 : -1), i = ye(s, l) * u;
  return {
    x: a.x + Math.cos(c) * i,
    y: a.y + Math.sin(c) * i,
    time: a.time
  };
}
function Fe(a, e, n) {
  if (!n.pressure.enabled)
    return n.strokeWidth;
  const t = ye(a, e), s = e.time - a.time, l = s > 0 ? t / s : 0, u = Math.max(0.1, Math.min(1, 1 - l * 0.01)), { min: c, max: i } = n.pressure;
  return c + (i - c) * u;
}
function ve(a, e, n) {
  if (e.length < 2)
    return;
  if (a.strokeStyle = n.strokeColor, a.lineCap = "round", a.lineJoin = "round", !n.smoothing || e.length < 3) {
    a.beginPath(), a.lineWidth = n.strokeWidth, a.moveTo(e[0].x, e[0].y);
    for (let s = 1; s < e.length; s++)
      a.lineTo(e[s].x, e[s].y);
    a.stroke();
    return;
  }
  a.beginPath(), a.moveTo(e[0].x, e[0].y);
  for (let s = 1; s < e.length - 1; s++) {
    const l = e[s], u = e[s + 1];
    n.pressure.enabled ? a.lineWidth = Fe(e[s - 1], l, n) : a.lineWidth = n.strokeWidth;
    const c = Be(l, e[s - 1], u);
    a.quadraticCurveTo(c.x, c.y, l.x, l.y);
  }
  const t = e[e.length - 1];
  a.lineTo(t.x, t.y), a.stroke();
}
function Ue(a) {
  const { canvasSize: e, paths: n } = a;
  let t = `<svg width="${e.width}" height="${e.height}" xmlns="http://www.w3.org/2000/svg">`;
  return n.forEach((s) => {
    if (s.points.length < 2)
      return;
    let l = `M ${s.points[0].x} ${s.points[0].y}`;
    for (let u = 1; u < s.points.length; u++)
      l += ` L ${s.points[u].x} ${s.points[u].y}`;
    t += `<path d="${l}" stroke="${s.strokeColor}" stroke-width="${s.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), t += "</svg>", t;
}
function He(a, e, n = { format: "png" }) {
  const { format: t, quality: s = 0.9, size: l, backgroundColor: u } = n;
  if (t === "svg")
    return Ue(e);
  const c = document.createElement("canvas"), i = c.getContext("2d");
  if (l) {
    c.width = l.width, c.height = l.height;
    const d = l.width / a.width, p = l.height / a.height;
    i.scale(d, p);
  } else
    c.width = a.width, c.height = a.height;
  switch (u && u !== "transparent" && (i.fillStyle = u, i.fillRect(0, 0, c.width, c.height)), i.drawImage(a, 0, 0), t) {
    case "jpeg":
      return c.toDataURL("image/jpeg", s);
    case "base64":
      return c.toDataURL("image/png").split(",")[1];
    case "png":
    default:
      return c.toDataURL("image/png");
  }
}
function Le(a, e) {
  return new Promise((n, t) => {
    const s = new Image();
    s.onload = () => {
      const l = a.getContext("2d");
      l.clearRect(0, 0, a.width, a.height), l.drawImage(s, 0, 0, a.width, a.height), n();
    }, s.onerror = t, s.src = e;
  });
}
function $(a) {
  return a.paths.length === 0 || a.paths.every((e) => e.points.length === 0);
}
function X(a, e) {
  return {
    paths: [],
    canvasSize: { width: a, height: e },
    timestamp: Date.now(),
    isEmpty: !0
  };
}
function R(a) {
  return JSON.parse(JSON.stringify(a));
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
    for (let t = 0; t < this.replayData.paths.length; t++) {
      const s = this.replayData.paths[t], l = s.startTime || 0, u = s.endTime || l + (s.duration || 0);
      if (e < l)
        break;
      if (e >= u) {
        this.drawCompletePath(s), !n && Math.abs(e - u) < 32 && this.emit("replay-path-end", t, s);
        continue;
      }
      n = !0;
      const c = Math.max(0, Math.min(1, (e - l) / Math.max(u - l, 1)));
      c > 0 && Math.abs(e - l) < 32 && this.emit("replay-path-start", t, s), this.drawPartialPath(s, c);
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
    const t = e.startTime || 0, s = e.duration || 0, l = t + s * n, u = this.getPointsUpToTime(e.points, t, l);
    u.length < 2 || (this.ctx.beginPath(), this.ctx.strokeStyle = e.strokeColor, this.ctx.lineWidth = e.strokeWidth, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", this.drawSmoothCurve(u), this.ctx.stroke());
  }
  /**
   * 获取指定时间内的所有点
   */
  getPointsUpToTime(e, n, t) {
    const s = [];
    for (let l = 0; l < e.length; l++) {
      const u = e[l], c = n + (u.relativeTime || l * 50);
      if (c <= t)
        s.push(u);
      else {
        if (l > 0) {
          const i = e[l - 1], d = n + (i.relativeTime || (l - 1) * 50);
          if (d <= t) {
            const p = (t - d) / (c - d), h = {
              x: i.x + (u.x - i.x) * p,
              y: i.y + (u.y - i.y) * p,
              time: t,
              pressure: i.pressure ? i.pressure + (u.pressure || i.pressure - i.pressure) * p : u.pressure
            };
            s.push(h);
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
      const l = e[s], u = e[s + 1], c = (l.x + u.x) / 2, i = (l.y + u.y) / 2;
      this.ctx.quadraticCurveTo(l.x, l.y, c, i);
    }
    const n = e[e.length - 1], t = e[e.length - 2];
    this.ctx.quadraticCurveTo(t.x, t.y, n.x, n.y);
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
        const t = this.eventCallbacks.get(e), s = t.indexOf(n);
        s > -1 && t.splice(s, 1);
      } else
        this.eventCallbacks.delete(e);
  }
  /**
   * 触发事件
   */
  emit(e, ...n) {
    const t = this.eventCallbacks.get(e);
    t && t.forEach((s) => s(...n));
  }
  /**
   * 销毁控制器
   */
  destroy() {
    this.stop(), this.eventCallbacks.clear(), this.replayData = null;
  }
}
function Je(a) {
  const e = a.paths.map((i) => {
    const d = i.points.map((h, f) => {
      var y;
      let m;
      if (h.time && i.points[0].time)
        m = h.time - i.points[0].time;
      else if (f === 0)
        m = 0;
      else {
        const S = i.points[f - 1], w = Math.sqrt(
          Math.pow(h.x - S.x, 2) + Math.pow(h.y - S.y, 2)
        ) / 100 * 1e3;
        m = (((y = d[f - 1]) == null ? void 0 : y.relativeTime) || 0) + Math.max(w, 16);
      }
      return {
        ...h,
        relativeTime: m
      };
    }), p = d.length > 0 ? d[d.length - 1].relativeTime : 0;
    return {
      ...i,
      points: d,
      duration: p
    };
  }), n = [];
  for (let i = 0; i < e.length; i++) {
    const d = e[i];
    let p;
    if (i === 0)
      p = 0;
    else {
      const m = n[i - 1], y = je(
        a.paths[i - 1].points,
        a.paths[i].points
      );
      p = m.endTime + y;
    }
    const h = p + d.duration, f = {
      ...d,
      startTime: p,
      endTime: h
    };
    console.log(`路径 ${i}: 开始时间=${p}, 结束时间=${h}, 持续时间=${d.duration}`), n.push(f);
  }
  const t = n.length > 0 ? n[n.length - 1].endTime : 0;
  console.log("回放数据生成完成:"), console.log("- 路径数量:", n.length), console.log("- 总时长:", t), console.log("- 路径详情:", n.map((i) => ({
    startTime: i.startTime,
    endTime: i.endTime,
    duration: i.duration,
    pointCount: i.points.length
  })));
  const s = n.reduce((i, d) => i + Ge(d.points), 0), l = t > 0 ? s / (t / 1e3) : 0, u = n.slice(1).map((i, d) => {
    const p = n[d];
    return i.startTime - p.endTime;
  }), c = u.length > 0 ? u.reduce((i, d) => i + d, 0) / u.length : 0;
  return {
    paths: n,
    totalDuration: t,
    speed: 1,
    metadata: {
      deviceType: Ve(a),
      averageSpeed: l,
      totalDistance: s,
      averagePauseTime: c
    }
  };
}
function je(a, e) {
  if (a.length === 0 || e.length === 0)
    return 200;
  const n = a[a.length - 1], t = e[0];
  if (n.time && t.time)
    return Math.max(t.time - n.time, 50);
  const s = Math.sqrt(
    Math.pow(t.x - n.x, 2) + Math.pow(t.y - n.y, 2)
  );
  return Math.min(Math.max(s * 2, 100), 1e3);
}
function Ve(a) {
  const e = a.paths.reduce((l, u) => l + u.points.length, 0), n = a.paths.length;
  if (e === 0)
    return "touch";
  const t = e / n;
  return t > 20 ? "touch" : t < 10 ? "mouse" : a.paths.some(
    (l) => l.points.some((u) => u.pressure !== void 0)
  ) ? "pen" : "touch";
}
function Ge(a) {
  let e = 0;
  for (let n = 1; n < a.length; n++) {
    const t = a[n].x - a[n - 1].x, s = a[n].y - a[n - 1].y;
    e += Math.sqrt(t * t + s * s);
  }
  return e;
}
const Qe = ["width", "height"], Ke = {
  key: 1,
  class: "signature-toolbar"
}, Ze = ["disabled"], et = ["disabled"], tt = ["disabled"], at = {
  key: 2,
  class: "replay-controls"
}, nt = { class: "replay-buttons" }, st = ["disabled"], ot = { key: 0 }, it = { key: 1 }, lt = ["disabled"], rt = { class: "replay-progress" }, ut = ["max", "value", "disabled"], ct = { class: "time-display" }, ht = { class: "replay-speed" }, dt = /* @__PURE__ */ ze({
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
  setup(a, { expose: e, emit: n }) {
    const t = a, s = n, l = b(), u = b(!1), c = b(null), i = b(X(0, 0)), d = b([]), p = b(-1), h = b(null), f = b(!1), m = b("idle"), y = b(0), S = b(0), C = T(() => typeof t.width == "number" ? t.width : 800), w = T(() => typeof t.height == "number" ? t.height : 300), xe = T(() => ({
      position: "relative",
      display: "inline-block",
      width: typeof t.width == "string" ? t.width : `${t.width}px`,
      height: typeof t.height == "string" ? t.height : `${t.height}px`
    })), Te = T(() => ({
      border: t.borderStyle,
      borderRadius: t.borderRadius,
      backgroundColor: t.backgroundColor,
      cursor: t.disabled ? "not-allowed" : "crosshair",
      display: "block",
      width: "100%",
      height: "100%"
    })), we = T(() => ({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "#999",
      fontSize: "14px",
      pointerEvents: "none",
      userSelect: "none"
    })), ke = T(() => t.placeholder && $(i.value)), U = T(() => p.value > 0), H = T(() => p.value < d.value.length - 1), L = T(() => f.value && h.value), D = T(() => !L.value && !t.disabled), be = T(() => {
      var o;
      return L.value && ((o = t.replayOptions) == null ? void 0 : o.showControls) !== !1;
    }), N = T(() => ({
      strokeColor: t.strokeColor,
      strokeWidth: t.strokeWidth,
      smoothing: t.smoothing,
      pressure: {
        enabled: t.pressureSensitive,
        min: t.minStrokeWidth,
        max: t.maxStrokeWidth
      }
    })), J = () => {
      var o;
      return ((o = l.value) == null ? void 0 : o.getContext("2d")) || null;
    }, W = (o, r) => {
      const g = l.value, k = g.getBoundingClientRect(), z = g.width / k.width, I = g.height / k.height;
      return {
        x: (o - k.left) * z,
        y: (r - k.top) * I,
        time: Date.now()
      };
    }, j = (o) => {
      if (!D.value)
        return;
      u.value = !0;
      const r = performance.now(), g = { ...o, time: r };
      c.value = {
        points: [g],
        strokeColor: t.strokeColor,
        strokeWidth: t.strokeWidth,
        startTime: r,
        endTime: r,
        duration: 0
      }, s("signature-start");
    }, V = (o) => {
      if (!u.value || !c.value || !D.value)
        return;
      const r = performance.now(), g = { ...o, time: r };
      c.value.points.push(g), c.value.startTime && (c.value.endTime = r, c.value.duration = r - c.value.startTime);
      const k = J();
      k && ve(k, c.value.points, N.value), Z(), s("signature-drawing", i.value);
    }, G = () => {
      if (!(!u.value || !c.value)) {
        if (u.value = !1, c.value.points.length > 0) {
          const o = c.value.points[c.value.points.length - 1];
          o.time && c.value.startTime && (c.value.endTime = o.time, c.value.duration = o.time - c.value.startTime);
        }
        i.value.paths.push(c.value), i.value.isEmpty = !1, i.value.timestamp = Date.now(), E(), c.value = null, s("signature-end", i.value);
      }
    }, Ce = (o) => {
      o.preventDefault();
      const r = W(o.clientX, o.clientY);
      j(r);
    }, De = (o) => {
      if (o.preventDefault(), !u.value)
        return;
      const r = W(o.clientX, o.clientY);
      V(r);
    }, Q = (o) => {
      o.preventDefault(), G();
    }, Se = (o) => {
      if (o.preventDefault(), o.touches.length !== 1)
        return;
      const r = o.touches[0], g = W(r.clientX, r.clientY);
      j(g);
    }, Pe = (o) => {
      if (o.preventDefault(), o.touches.length !== 1 || !u.value)
        return;
      const r = o.touches[0], g = W(r.clientX, r.clientY);
      V(g);
    }, K = (o) => {
      o.preventDefault(), G();
    }, Z = () => {
      i.value.canvasSize = {
        width: C.value,
        height: w.value
      }, i.value.isEmpty = $(i.value);
    }, E = () => {
      d.value = d.value.slice(0, p.value + 1), d.value.push(R(i.value)), p.value = d.value.length - 1;
      const o = 50;
      d.value.length > o && (d.value = d.value.slice(-o), p.value = d.value.length - 1);
    }, P = () => {
      const o = J();
      o && (o.clearRect(0, 0, C.value, w.value), t.backgroundColor && t.backgroundColor !== "transparent" && (o.fillStyle = t.backgroundColor, o.fillRect(0, 0, C.value, w.value)), i.value.paths.forEach((r) => {
        if (r.points.length > 0) {
          const g = {
            strokeColor: r.strokeColor,
            strokeWidth: r.strokeWidth,
            smoothing: t.smoothing,
            pressure: N.value.pressure
          };
          ve(o, r.points, g);
        }
      }));
    }, ee = () => {
      l.value && (h.value && h.value.destroy(), h.value = new Ne(l.value), h.value.on("replay-start", () => {
        m.value = "playing", s("replay-start");
      }), h.value.on("replay-progress", (o, r) => {
        y.value = o, S.value = r, s("replay-progress", o, r);
      }), h.value.on("replay-pause", () => {
        m.value = "paused", s("replay-pause");
      }), h.value.on("replay-resume", () => {
        m.value = "playing", s("replay-resume");
      }), h.value.on("replay-stop", () => {
        m.value = "stopped", s("replay-stop");
      }), h.value.on("replay-complete", () => {
        m.value = "completed", s("replay-complete");
      }), h.value.on("replay-path-start", (o, r) => {
        s("replay-path-start", o, r);
      }), h.value.on("replay-path-end", (o, r) => {
        s("replay-path-end", o, r);
      }), h.value.on("replay-speed-change", (o) => {
        s("replay-speed-change", o);
      }));
    }, te = (o, r) => {
      h.value || ee(), h.value && (f.value = !0, h.value.setReplayData(o, r || {}), console.log("startReplay调用，自动播放:", r == null ? void 0 : r.autoPlay), (r == null ? void 0 : r.autoPlay) === !0 && h.value.play());
    }, ae = (o) => {
      f.value = o, !o && h.value && (h.value.stop(), P());
    }, Me = () => $(i.value) ? null : Je(i.value), ne = () => {
      var o;
      (o = h.value) == null || o.play();
    }, se = () => {
      var o;
      (o = h.value) == null || o.pause();
    }, oe = () => {
      var o;
      (o = h.value) == null || o.stop();
    }, ie = (o) => {
      var r;
      (r = h.value) == null || r.seek(o);
    }, le = (o) => {
      var r;
      (r = h.value) == null || r.setSpeed(o);
    }, _e = () => {
      var o;
      return ((o = h.value) == null ? void 0 : o.getState()) || "idle";
    }, Re = () => {
      var o;
      return ((o = h.value) == null ? void 0 : o.getCurrentTime()) || 0;
    }, Y = () => {
      var o;
      return ((o = h.value) == null ? void 0 : o.getTotalDuration()) || 0;
    }, We = () => {
      var o;
      return ((o = h.value) == null ? void 0 : o.getProgress()) || 0;
    }, re = (o) => {
      const r = Math.floor(o / 1e3), g = Math.floor(r / 60), k = r % 60;
      return `${g}:${k.toString().padStart(2, "0")}`;
    }, ue = () => {
      D.value && (i.value = X(C.value, w.value), P(), E(), s("signature-clear"));
    }, ce = () => {
      !U.value || !D.value || (p.value--, i.value = R(d.value[p.value]), P(), s("signature-undo", i.value));
    }, he = () => {
      !H.value || !D.value || (p.value++, i.value = R(d.value[p.value]), P(), s("signature-redo", i.value));
    }, de = (o) => {
      const r = l.value;
      return He(r, i.value, o);
    }, pe = () => $(i.value), me = async (o) => {
      if (!D.value)
        return;
      const r = l.value;
      await Le(r, o), i.value = X(C.value, w.value), i.value.isEmpty = !1, E();
    }, Ee = () => R(i.value), Ie = (o) => {
      D.value && (i.value = R(o), P(), E());
    }, ge = (o, r) => {
      const g = o || C.value, k = r || w.value, z = de({ format: "png" });
      O(() => {
        const I = l.value;
        I.width = g, I.height = k, pe() || me(z), Z();
      });
    }, $e = () => {
      const o = l.value;
      o.width = C.value, o.height = w.value, i.value = X(C.value, w.value), d.value = [R(i.value)], p.value = 0, P();
    };
    return A([() => t.width, () => t.height], () => {
      O(() => {
        l.value && ge();
      });
    }), A(() => t.replayMode, (o) => {
      o !== void 0 && ae(o);
    }), A(() => t.replayData, (o) => {
      console.log("watch监听到回放数据变化:", o), console.log("当前回放模式:", t.replayMode), console.log("回放控制器是否存在:", !!h.value), o && t.replayMode && h.value ? (console.log("开始设置回放数据到控制器"), h.value.setReplayData(o, t.replayOptions || {}), console.log("回放数据已更新:", o)) : (o || console.log("回放数据为空，跳过设置"), t.replayMode || console.log("不在回放模式，跳过设置"), h.value || console.log("回放控制器不存在，跳过设置"));
    }, { immediate: !0 }), Ae(() => {
      O(() => {
        $e(), ee(), t.replayMode && t.replayData && te(t.replayData, t.replayOptions);
      });
    }), Oe(() => {
      h.value && (h.value.destroy(), h.value = null);
    }), e({
      clear: ue,
      undo: ce,
      redo: he,
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
      stop: oe,
      seek: ie,
      setSpeed: le,
      getState: _e,
      getCurrentTime: Re,
      getTotalDuration: Y,
      getProgress: We
    }), (o, r) => (M(), _("div", {
      class: "electronic-signature",
      style: q(xe.value)
    }, [
      v("canvas", {
        ref_key: "canvasRef",
        ref: l,
        width: C.value,
        height: w.value,
        style: q(Te.value),
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
        style: q(we.value)
      }, B(o.placeholder), 5)) : F("", !0),
      o.showToolbar ? (M(), _("div", Ke, [
        v("button", {
          onClick: ue,
          disabled: !D.value
        }, "清除", 8, Ze),
        v("button", {
          onClick: ce,
          disabled: !D.value || !U.value
        }, "撤销", 8, et),
        v("button", {
          onClick: he,
          disabled: !D.value || !H.value
        }, "重做", 8, tt)
      ])) : F("", !0),
      be.value ? (M(), _("div", at, [
        v("div", nt, [
          v("button", {
            onClick: r[0] || (r[0] = (g) => m.value === "playing" ? se() : ne()),
            disabled: m.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            m.value === "playing" ? (M(), _("span", ot, "⏸️")) : (M(), _("span", it, "▶️"))
          ], 8, st),
          v("button", {
            onClick: r[1] || (r[1] = (g) => oe()),
            disabled: m.value === "idle",
            class: "replay-btn stop-btn"
          }, " ⏹️ ", 8, lt)
        ]),
        v("div", rt, [
          v("input", {
            type: "range",
            min: "0",
            max: Y(),
            value: S.value,
            onInput: r[2] || (r[2] = (g) => ie(Number(g.target.value))),
            class: "progress-slider",
            disabled: m.value === "idle"
          }, null, 40, ut),
          v("div", ct, [
            v("span", null, B(re(S.value)), 1),
            r[4] || (r[4] = v("span", null, "/", -1)),
            v("span", null, B(re(Y())), 1)
          ])
        ]),
        v("div", ht, [
          r[6] || (r[6] = v("label", null, "速度:", -1)),
          v("select", {
            onChange: r[3] || (r[3] = (g) => le(Number(g.target.value))),
            class: "speed-select"
          }, r[5] || (r[5] = [
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
const pt = (a, e) => {
  const n = a.__vccOpts || a;
  for (const [t, s] of e)
    n[t] = s;
  return n;
}, fe = /* @__PURE__ */ pt(dt, [["__scopeId", "data-v-7c6fb85a"]]);
function mt() {
  return window.devicePixelRatio || 1;
}
function xt(a) {
  const e = a.getContext("2d"), n = mt(), t = a.clientWidth, s = a.clientHeight;
  return a.width = t * n, a.height = s * n, e.scale(n, n), a.style.width = t + "px", a.style.height = s + "px", e;
}
function gt(a) {
  if (a.paths.length === 0)
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0
    };
  let e = 1 / 0, n = 1 / 0, t = -1 / 0, s = -1 / 0;
  return a.paths.forEach((l) => {
    l.points.forEach((u) => {
      e = Math.min(e, u.x), n = Math.min(n, u.y), t = Math.max(t, u.x), s = Math.max(s, u.y);
    });
  }), {
    minX: e,
    minY: n,
    maxX: t,
    maxY: s,
    width: t - e,
    height: s - n
  };
}
function Tt(a, e, n = 10) {
  const t = gt(e);
  if (t.width === 0 || t.height === 0) {
    const i = document.createElement("canvas");
    return i.width = 1, i.height = 1, i;
  }
  const s = document.createElement("canvas"), l = s.getContext("2d"), u = t.width + n * 2, c = t.height + n * 2;
  return s.width = u, s.height = c, l.drawImage(
    a,
    t.minX - n,
    t.minY - n,
    u,
    c,
    0,
    0,
    u,
    c
  ), s;
}
function wt(a, e, n, t = !0) {
  const s = document.createElement("canvas"), l = s.getContext("2d");
  let u = e, c = n;
  if (t) {
    const i = a.width / a.height, d = e / n;
    i > d ? c = e / i : u = n * i;
  }
  return s.width = u, s.height = c, l.imageSmoothingEnabled = !0, l.imageSmoothingQuality = "high", l.drawImage(a, 0, 0, u, c), s;
}
function kt(a, e, n = {}) {
  const {
    fontSize: t = 12,
    fontFamily: s = "Arial",
    color: l = "#999",
    opacity: u = 0.5,
    position: c = "bottom-right"
  } = n, i = document.createElement("canvas"), d = i.getContext("2d");
  i.width = a.width, i.height = a.height, d.drawImage(a, 0, 0), d.font = `${t}px ${s}`, d.fillStyle = l, d.globalAlpha = u;
  const h = d.measureText(e).width, f = t;
  let m, y;
  switch (c) {
    case "top-left":
      m = 10, y = f + 10;
      break;
    case "top-right":
      m = a.width - h - 10, y = f + 10;
      break;
    case "bottom-left":
      m = 10, y = a.height - 10;
      break;
    case "bottom-right":
      m = a.width - h - 10, y = a.height - 10;
      break;
    case "center":
      m = (a.width - h) / 2, y = (a.height + f) / 2;
      break;
    default:
      m = a.width - h - 10, y = a.height - 10;
  }
  return d.fillText(e, m, y), d.globalAlpha = 1, i;
}
function bt(a) {
  const e = document.createElement("canvas"), n = e.getContext("2d");
  e.width = a.width, e.height = a.height, n.drawImage(a, 0, 0);
  const t = n.getImageData(0, 0, a.width, a.height), s = t.data;
  for (let l = 0; l < s.length; l += 4) {
    const u = s[l] * 0.299 + s[l + 1] * 0.587 + s[l + 2] * 0.114;
    s[l] = u, s[l + 1] = u, s[l + 2] = u;
  }
  return n.putImageData(t, 0, 0), e;
}
const vt = (a) => {
  a.component("ElectronicSignature", fe);
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
  Tt as cropSignature,
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
  wt as resizeSignature,
  xt as setupHighDPICanvas,
  Ue as signatureToSVG,
  Dt as version
};
