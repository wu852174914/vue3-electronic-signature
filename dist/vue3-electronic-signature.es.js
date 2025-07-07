var Ae = Object.defineProperty;
var ze = (a, e, n) => e in a ? Ae(a, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : a[e] = n;
var x = (a, e, n) => (ze(a, typeof e != "symbol" ? e + "" : e, n), n);
import { defineComponent as Xe, ref as C, computed as w, watch as O, nextTick as q, onMounted as Ye, onUnmounted as Oe, openBlock as M, createElementBlock as W, normalizeStyle as B, createElementVNode as v, toDisplayString as F, createCommentVNode as U } from "vue";
function ye(a, e) {
  return Math.sqrt(
    Math.pow(e.x - a.x, 2) + Math.pow(e.y - a.y, 2)
  );
}
function qe(a, e) {
  return Math.atan2(e.y - a.y, e.x - a.x);
}
function Be(a, e, n, t) {
  const s = e || a, l = n || a, u = 0.2, h = qe(s, l) * (t ? 1 : -1), i = ye(s, l) * u;
  return {
    x: a.x + Math.cos(h) * i,
    y: a.y + Math.sin(h) * i,
    time: a.time
  };
}
function Fe(a, e, n) {
  if (!n.pressure.enabled)
    return n.strokeWidth;
  const t = ye(a, e), s = e.time - a.time, l = s > 0 ? t / s : 0, u = Math.max(0.1, Math.min(1, 1 - l * 0.01)), { min: h, max: i } = n.pressure;
  return h + (i - h) * u;
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
    const h = Be(l, e[s - 1], u);
    a.quadraticCurveTo(h.x, h.y, l.x, l.y);
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
  const h = document.createElement("canvas"), i = h.getContext("2d");
  if (l) {
    h.width = l.width, h.height = l.height;
    const d = l.width / a.width, p = l.height / a.height;
    i.scale(d, p);
  } else
    h.width = a.width, h.height = a.height;
  switch (u && u !== "transparent" && (i.fillStyle = u, i.fillRect(0, 0, h.width, h.height)), i.drawImage(a, 0, 0), t) {
    case "jpeg":
      return h.toDataURL("image/jpeg", s);
    case "base64":
      return h.toDataURL("image/png").split(",")[1];
    case "png":
    default:
      return h.toDataURL("image/png");
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
function A(a) {
  return a.paths.length === 0 || a.paths.every((e) => e.points.length === 0);
}
function z(a, e) {
  return {
    paths: [],
    canvasSize: { width: a, height: e },
    timestamp: Date.now(),
    isEmpty: !0
  };
}
function _(a) {
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
      const h = Math.max(0, Math.min(1, (e - l) / Math.max(u - l, 1)));
      h > 0 && Math.abs(e - l) < 32 && this.emit("replay-path-start", t, s), this.drawPartialPath(s, h);
      break;
    }
  }
  /**
   * 绘制完整路径 - 使用与录制时相同的算法
   */
  drawCompletePath(e) {
    e.points.length < 2 || this.drawPathWithSmoothAlgorithm(e.points, {
      strokeColor: e.strokeColor,
      strokeWidth: e.strokeWidth,
      smoothing: !0,
      // 保持与录制时一致
      pressure: { enabled: !1, min: 1, max: 4 }
    });
  }
  /**
   * 绘制部分路径 - 使用与录制时相同的算法
   */
  drawPartialPath(e, n) {
    if (e.points.length < 2)
      return;
    const t = e.startTime || 0, s = e.duration || 0, l = t + s * n, u = this.getPointsUpToTime(e.points, t, l);
    u.length < 2 || this.drawPathWithSmoothAlgorithm(u, {
      strokeColor: e.strokeColor,
      strokeWidth: e.strokeWidth,
      smoothing: !0,
      // 保持与录制时一致
      pressure: { enabled: !1, min: 1, max: 4 }
    });
  }
  /**
   * 获取指定时间内的所有点
   */
  getPointsUpToTime(e, n, t) {
    const s = [];
    for (let l = 0; l < e.length; l++) {
      const u = e[l], h = n + (u.relativeTime || l * 50);
      if (h <= t)
        s.push(u);
      else {
        if (l > 0) {
          const i = e[l - 1], d = n + (i.relativeTime || (l - 1) * 50);
          if (d <= t) {
            const p = (t - d) / (h - d), c = {
              x: i.x + (u.x - i.x) * p,
              y: i.y + (u.y - i.y) * p,
              time: t,
              pressure: i.pressure ? i.pressure + (u.pressure || i.pressure - i.pressure) * p : u.pressure
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
   * 使用与录制时相同的平滑算法绘制路径
   */
  drawPathWithSmoothAlgorithm(e, n) {
    if (e.length < 2)
      return;
    if (this.ctx.strokeStyle = n.strokeColor, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", !n.smoothing || e.length < 3) {
      this.ctx.beginPath(), this.ctx.lineWidth = n.strokeWidth, this.ctx.moveTo(e[0].x, e[0].y);
      for (let s = 1; s < e.length; s++)
        this.ctx.lineTo(e[s].x, e[s].y);
      this.ctx.stroke();
      return;
    }
    this.ctx.beginPath(), this.ctx.moveTo(e[0].x, e[0].y);
    for (let s = 1; s < e.length - 1; s++) {
      const l = e[s], u = e[s + 1];
      this.ctx.lineWidth = n.strokeWidth;
      const h = this.getControlPoint(l, e[s - 1], u);
      this.ctx.quadraticCurveTo(h.x, h.y, l.x, l.y);
    }
    const t = e[e.length - 1];
    this.ctx.lineTo(t.x, t.y), this.ctx.stroke();
  }
  /**
   * 获取控制点（用于贝塞尔曲线平滑） - 与signature.ts中的实现一致
   */
  getControlPoint(e, n, t) {
    const l = {
      length: Math.sqrt(Math.pow(t.x - n.x, 2) + Math.pow(t.y - n.y, 2)),
      angle: Math.atan2(t.y - n.y, t.x - n.x)
    }, u = l.angle + Math.PI, h = l.length * 0.2;
    return {
      x: e.x + Math.cos(u) * h,
      y: e.y + Math.sin(u) * h,
      time: e.time || 0
    };
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
    const d = i.points.map((c, y) => {
      var f;
      let g;
      if (c.time && i.points[0].time)
        g = c.time - i.points[0].time;
      else if (y === 0)
        g = 0;
      else {
        const P = i.points[y - 1], T = Math.sqrt(
          Math.pow(c.x - P.x, 2) + Math.pow(c.y - P.y, 2)
        ) / 100 * 1e3;
        g = (((f = d[y - 1]) == null ? void 0 : f.relativeTime) || 0) + Math.max(T, 16);
      }
      return {
        ...c,
        relativeTime: g
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
      const g = n[i - 1], f = je(
        a.paths[i - 1].points,
        a.paths[i].points
      );
      p = g.endTime + f;
    }
    const c = p + d.duration, y = {
      ...d,
      startTime: p,
      endTime: c
    };
    console.log(`路径 ${i}: 开始时间=${p}, 结束时间=${c}, 持续时间=${d.duration}`), n.push(y);
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
  }), h = u.length > 0 ? u.reduce((i, d) => i + d, 0) / u.length : 0;
  return {
    paths: n,
    totalDuration: t,
    speed: 1,
    metadata: {
      deviceType: Ve(a),
      averageSpeed: l,
      totalDistance: s,
      averagePauseTime: h
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
}, st = { class: "replay-buttons" }, nt = ["disabled"], ot = { key: 0 }, it = { key: 1 }, lt = ["disabled"], rt = { class: "replay-progress" }, ut = ["max", "value", "disabled"], ht = { class: "time-display" }, ct = { class: "replay-speed" }, dt = /* @__PURE__ */ Xe({
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
    const t = a, s = n, l = C(), u = C(!1), h = C(null), i = C(z(0, 0)), d = C([]), p = C(-1), c = C(null), y = C(!1), g = C("idle"), f = C(0), P = C(0), b = w(() => typeof t.width == "number" ? t.width : 800), T = w(() => typeof t.height == "number" ? t.height : 300), xe = w(() => ({
      position: "relative",
      display: "inline-block",
      width: typeof t.width == "string" ? t.width : `${t.width}px`,
      height: typeof t.height == "string" ? t.height : `${t.height}px`
    })), we = w(() => ({
      border: t.borderStyle,
      borderRadius: t.borderRadius,
      backgroundColor: t.backgroundColor,
      cursor: t.disabled ? "not-allowed" : "crosshair",
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
    })), ke = w(() => y.value ? !1 : t.placeholder && A(i.value)), H = w(() => p.value > 0), L = w(() => p.value < d.value.length - 1), N = w(() => y.value && c.value), D = w(() => !N.value && !t.disabled), Ce = w(() => {
      var o;
      return N.value && ((o = t.replayOptions) == null ? void 0 : o.showControls) !== !1;
    }), J = w(() => ({
      strokeColor: t.strokeColor,
      strokeWidth: t.strokeWidth,
      smoothing: t.smoothing,
      pressure: {
        enabled: t.pressureSensitive,
        min: t.minStrokeWidth,
        max: t.maxStrokeWidth
      }
    })), j = () => {
      var o;
      return ((o = l.value) == null ? void 0 : o.getContext("2d")) || null;
    }, R = (o, r) => {
      const m = l.value, k = m.getBoundingClientRect(), Y = m.width / k.width, $ = m.height / k.height;
      return {
        x: (o - k.left) * Y,
        y: (r - k.top) * $,
        time: Date.now()
      };
    }, V = (o) => {
      if (!D.value)
        return;
      u.value = !0;
      const r = performance.now(), m = { ...o, time: r };
      h.value = {
        points: [m],
        strokeColor: t.strokeColor,
        strokeWidth: t.strokeWidth,
        startTime: r,
        endTime: r,
        duration: 0
      }, s("signature-start");
    }, G = (o) => {
      if (!u.value || !h.value || !D.value)
        return;
      const r = performance.now(), m = { ...o, time: r };
      h.value.points.push(m), h.value.startTime && (h.value.endTime = r, h.value.duration = r - h.value.startTime);
      const k = j();
      k && ve(k, h.value.points, J.value), ee(), s("signature-drawing", i.value);
    }, Q = () => {
      if (!(!u.value || !h.value)) {
        if (u.value = !1, h.value.points.length > 0) {
          const o = h.value.points[h.value.points.length - 1];
          o.time && h.value.startTime && (h.value.endTime = o.time, h.value.duration = o.time - h.value.startTime);
        }
        i.value.paths.push(h.value), i.value.isEmpty = !1, i.value.timestamp = Date.now(), E(), h.value = null, s("signature-end", i.value);
      }
    }, be = (o) => {
      o.preventDefault();
      const r = R(o.clientX, o.clientY);
      V(r);
    }, De = (o) => {
      if (o.preventDefault(), !u.value)
        return;
      const r = R(o.clientX, o.clientY);
      G(r);
    }, K = (o) => {
      o.preventDefault(), Q();
    }, Pe = (o) => {
      if (o.preventDefault(), o.touches.length !== 1)
        return;
      const r = o.touches[0], m = R(r.clientX, r.clientY);
      V(m);
    }, Se = (o) => {
      if (o.preventDefault(), o.touches.length !== 1 || !u.value)
        return;
      const r = o.touches[0], m = R(r.clientX, r.clientY);
      G(m);
    }, Z = (o) => {
      o.preventDefault(), Q();
    }, ee = () => {
      i.value.canvasSize = {
        width: b.value,
        height: T.value
      }, i.value.isEmpty = A(i.value);
    }, E = () => {
      d.value = d.value.slice(0, p.value + 1), d.value.push(_(i.value)), p.value = d.value.length - 1;
      const o = 50;
      d.value.length > o && (d.value = d.value.slice(-o), p.value = d.value.length - 1);
    }, S = () => {
      const o = j();
      o && (o.clearRect(0, 0, b.value, T.value), t.backgroundColor && t.backgroundColor !== "transparent" && (o.fillStyle = t.backgroundColor, o.fillRect(0, 0, b.value, T.value)), i.value.paths.forEach((r) => {
        if (r.points.length > 0) {
          const m = {
            strokeColor: r.strokeColor,
            strokeWidth: r.strokeWidth,
            smoothing: t.smoothing,
            pressure: J.value.pressure
          };
          ve(o, r.points, m);
        }
      }));
    }, I = () => {
      if (console.log("初始化回放控制器"), console.log("canvas引用是否存在:", !!l.value), !l.value) {
        console.error("canvas引用不存在，无法初始化回放控制器");
        return;
      }
      c.value && (console.log("销毁现有回放控制器"), c.value.destroy()), console.log("创建新的回放控制器"), c.value = new Ne(l.value), console.log("回放控制器创建成功:", !!c.value), c.value.on("replay-start", () => {
        g.value = "playing", s("replay-start");
      }), c.value.on("replay-progress", (o, r) => {
        f.value = o, P.value = r, s("replay-progress", o, r);
      }), c.value.on("replay-pause", () => {
        g.value = "paused", s("replay-pause");
      }), c.value.on("replay-resume", () => {
        g.value = "playing", s("replay-resume");
      }), c.value.on("replay-stop", () => {
        g.value = "stopped", s("replay-stop");
      }), c.value.on("replay-complete", () => {
        g.value = "completed", s("replay-complete");
      }), c.value.on("replay-path-start", (o, r) => {
        s("replay-path-start", o, r);
      }), c.value.on("replay-path-end", (o, r) => {
        s("replay-path-end", o, r);
      }), c.value.on("replay-speed-change", (o) => {
        s("replay-speed-change", o);
      });
    }, te = (o, r) => {
      c.value || I(), c.value && (y.value = !0, c.value.setReplayData(o, r || {}), console.log("startReplay调用，自动播放:", r == null ? void 0 : r.autoPlay), (r == null ? void 0 : r.autoPlay) === !0 && c.value.play());
    }, ae = (o) => {
      y.value = o, !o && c.value && (c.value.stop(), S());
    }, Me = () => A(i.value) ? null : Je(i.value), se = () => {
      console.log("play方法被调用"), console.log("回放控制器是否存在:", !!c.value), c.value || (console.log("回放控制器不存在，尝试初始化"), I()), c.value ? (console.log("调用回放控制器的play方法"), c.value.play()) : console.error("回放控制器初始化失败，无法播放");
    }, ne = () => {
      var o;
      (o = c.value) == null || o.pause();
    }, oe = () => {
      var o;
      (o = c.value) == null || o.stop();
    }, ie = (o) => {
      var r;
      (r = c.value) == null || r.seek(o);
    }, le = (o) => {
      var r;
      (r = c.value) == null || r.setSpeed(o);
    }, We = () => {
      var o;
      return ((o = c.value) == null ? void 0 : o.getState()) || "idle";
    }, _e = () => {
      var o;
      return ((o = c.value) == null ? void 0 : o.getCurrentTime()) || 0;
    }, X = () => {
      var o;
      return ((o = c.value) == null ? void 0 : o.getTotalDuration()) || 0;
    }, Re = () => {
      var o;
      return ((o = c.value) == null ? void 0 : o.getProgress()) || 0;
    }, re = (o) => {
      const r = Math.floor(o / 1e3), m = Math.floor(r / 60), k = r % 60;
      return `${m}:${k.toString().padStart(2, "0")}`;
    }, ue = () => {
      D.value && (i.value = z(b.value, T.value), S(), E(), s("signature-clear"));
    }, he = () => {
      !H.value || !D.value || (p.value--, i.value = _(d.value[p.value]), S(), s("signature-undo", i.value));
    }, ce = () => {
      !L.value || !D.value || (p.value++, i.value = _(d.value[p.value]), S(), s("signature-redo", i.value));
    }, de = (o) => {
      const r = l.value;
      return He(r, i.value, o);
    }, pe = () => A(i.value), ge = async (o) => {
      if (!D.value)
        return;
      const r = l.value;
      await Le(r, o), i.value = z(b.value, T.value), i.value.isEmpty = !1, E();
    }, Ee = () => _(i.value), Ie = (o) => {
      D.value && (i.value = _(o), S(), E());
    }, me = (o, r) => {
      const m = o || b.value, k = r || T.value, Y = de({ format: "png" });
      q(() => {
        const $ = l.value;
        $.width = m, $.height = k, pe() || ge(Y), ee();
      });
    }, $e = () => {
      const o = l.value;
      o.width = b.value, o.height = T.value, i.value = z(b.value, T.value), d.value = [_(i.value)], p.value = 0, S();
    };
    return O([() => t.width, () => t.height], () => {
      q(() => {
        l.value && me();
      });
    }), O(() => t.replayMode, (o) => {
      o !== void 0 && ae(o);
    }), O(() => t.replayData, (o) => {
      console.log("watch监听到回放数据变化:", o), console.log("当前回放模式:", t.replayMode), console.log("回放控制器是否存在:", !!c.value), o && t.replayMode ? (c.value || (console.log("回放控制器未初始化，先初始化"), I()), c.value ? (console.log("开始设置回放数据到控制器"), c.value.setReplayData(o, t.replayOptions || {}), console.log("回放数据已更新:", o)) : console.error("回放控制器初始化失败")) : (o || console.log("回放数据为空，跳过设置"), t.replayMode || console.log("不在回放模式，跳过设置"));
    }, { immediate: !0 }), Ye(() => {
      q(() => {
        $e(), I(), t.replayMode && t.replayData && te(t.replayData, t.replayOptions);
      });
    }), Oe(() => {
      c.value && (c.value.destroy(), c.value = null);
    }), e({
      clear: ue,
      undo: he,
      redo: ce,
      save: de,
      isEmpty: pe,
      fromDataURL: ge,
      getSignatureData: Ee,
      setSignatureData: Ie,
      resize: me,
      // 回放相关方法
      startReplay: te,
      getReplayData: Me,
      setReplayMode: ae,
      play: se,
      pause: ne,
      stop: oe,
      seek: ie,
      setSpeed: le,
      getState: We,
      getCurrentTime: _e,
      getTotalDuration: X,
      getProgress: Re
    }), (o, r) => (M(), W("div", {
      class: "electronic-signature",
      style: B(xe.value)
    }, [
      v("canvas", {
        ref_key: "canvasRef",
        ref: l,
        width: b.value,
        height: T.value,
        style: B(we.value),
        onMousedown: be,
        onMousemove: De,
        onMouseup: K,
        onMouseleave: K,
        onTouchstart: Pe,
        onTouchmove: Se,
        onTouchend: Z,
        onTouchcancel: Z
      }, null, 44, Qe),
      ke.value ? (M(), W("div", {
        key: 0,
        class: "signature-placeholder",
        style: B(Te.value)
      }, F(o.placeholder), 5)) : U("", !0),
      o.showToolbar ? (M(), W("div", Ke, [
        v("button", {
          onClick: ue,
          disabled: !D.value
        }, "清除", 8, Ze),
        v("button", {
          onClick: he,
          disabled: !D.value || !H.value
        }, "撤销", 8, et),
        v("button", {
          onClick: ce,
          disabled: !D.value || !L.value
        }, "重做", 8, tt)
      ])) : U("", !0),
      Ce.value ? (M(), W("div", at, [
        v("div", st, [
          v("button", {
            onClick: r[0] || (r[0] = (m) => g.value === "playing" ? ne() : se()),
            disabled: g.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            g.value === "playing" ? (M(), W("span", ot, "⏸️")) : (M(), W("span", it, "▶️"))
          ], 8, nt),
          v("button", {
            onClick: r[1] || (r[1] = (m) => oe()),
            disabled: g.value === "idle",
            class: "replay-btn stop-btn"
          }, " ⏹️ ", 8, lt)
        ]),
        v("div", rt, [
          v("input", {
            type: "range",
            min: "0",
            max: X(),
            value: P.value,
            onInput: r[2] || (r[2] = (m) => ie(Number(m.target.value))),
            class: "progress-slider",
            disabled: g.value === "idle"
          }, null, 40, ut),
          v("div", ht, [
            v("span", null, F(re(P.value)), 1),
            r[4] || (r[4] = v("span", null, "/", -1)),
            v("span", null, F(re(X())), 1)
          ])
        ]),
        v("div", ct, [
          r[6] || (r[6] = v("label", null, "速度:", -1)),
          v("select", {
            onChange: r[3] || (r[3] = (m) => le(Number(m.target.value))),
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
      ])) : U("", !0)
    ], 4));
  }
});
const pt = (a, e) => {
  const n = a.__vccOpts || a;
  for (const [t, s] of e)
    n[t] = s;
  return n;
}, fe = /* @__PURE__ */ pt(dt, [["__scopeId", "data-v-c187d474"]]);
function gt() {
  return window.devicePixelRatio || 1;
}
function xt(a) {
  const e = a.getContext("2d"), n = gt(), t = a.clientWidth, s = a.clientHeight;
  return a.width = t * n, a.height = s * n, e.scale(n, n), a.style.width = t + "px", a.style.height = s + "px", e;
}
function mt(a) {
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
function wt(a, e, n = 10) {
  const t = mt(e);
  if (t.width === 0 || t.height === 0) {
    const i = document.createElement("canvas");
    return i.width = 1, i.height = 1, i;
  }
  const s = document.createElement("canvas"), l = s.getContext("2d"), u = t.width + n * 2, h = t.height + n * 2;
  return s.width = u, s.height = h, l.drawImage(
    a,
    t.minX - n,
    t.minY - n,
    u,
    h,
    0,
    0,
    u,
    h
  ), s;
}
function Tt(a, e, n, t = !0) {
  const s = document.createElement("canvas"), l = s.getContext("2d");
  let u = e, h = n;
  if (t) {
    const i = a.width / a.height, d = e / n;
    i > d ? h = e / i : u = n * i;
  }
  return s.width = u, s.height = h, l.imageSmoothingEnabled = !0, l.imageSmoothingQuality = "high", l.drawImage(a, 0, 0, u, h), s;
}
function kt(a, e, n = {}) {
  const {
    fontSize: t = 12,
    fontFamily: s = "Arial",
    color: l = "#999",
    opacity: u = 0.5,
    position: h = "bottom-right"
  } = n, i = document.createElement("canvas"), d = i.getContext("2d");
  i.width = a.width, i.height = a.height, d.drawImage(a, 0, 0), d.font = `${t}px ${s}`, d.fillStyle = l, d.globalAlpha = u;
  const c = d.measureText(e).width, y = t;
  let g, f;
  switch (h) {
    case "top-left":
      g = 10, f = y + 10;
      break;
    case "top-right":
      g = a.width - c - 10, f = y + 10;
      break;
    case "bottom-left":
      g = 10, f = a.height - 10;
      break;
    case "bottom-right":
      g = a.width - c - 10, f = a.height - 10;
      break;
    case "center":
      g = (a.width - c) / 2, f = (a.height + y) / 2;
      break;
    default:
      g = a.width - c - 10, f = a.height - 10;
  }
  return d.fillText(e, g, f), d.globalAlpha = 1, i;
}
function Ct(a) {
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
}, bt = {
  install: vt,
  ElectronicSignature: fe
}, Dt = "1.0.0";
export {
  fe as ElectronicSignature,
  Ne as SignatureReplayController,
  kt as addWatermark,
  Fe as calculateStrokeWidth,
  _ as cloneSignatureData,
  Ct as convertToGrayscale,
  z as createEmptySignatureData,
  Je as createReplayData,
  wt as cropSignature,
  bt as default,
  ve as drawSmoothPath,
  He as exportSignature,
  qe as getAngle,
  Be as getControlPoint,
  gt as getDevicePixelRatio,
  ye as getDistance,
  mt as getSignatureBounds,
  A as isSignatureEmpty,
  Le as loadImageToCanvas,
  Tt as resizeSignature,
  xt as setupHighDPICanvas,
  Ue as signatureToSVG,
  Dt as version
};
