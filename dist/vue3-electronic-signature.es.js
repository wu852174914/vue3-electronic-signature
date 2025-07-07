var $e = Object.defineProperty;
var Oe = (s, e, a) => e in s ? $e(s, e, { enumerable: !0, configurable: !0, writable: !0, value: a }) : s[e] = a;
var w = (s, e, a) => (Oe(s, typeof e != "symbol" ? e + "" : e, a), a);
import { defineComponent as Ae, ref as k, computed as x, watch as q, nextTick as B, onMounted as ze, onUnmounted as Xe, openBlock as M, createElementBlock as W, normalizeStyle as F, createElementVNode as v, toDisplayString as U, createCommentVNode as H } from "vue";
function me(s, e) {
  return Math.sqrt(
    Math.pow(e.x - s.x, 2) + Math.pow(e.y - s.y, 2)
  );
}
function Ye(s, e) {
  return Math.atan2(e.y - s.y, e.x - s.x);
}
function qe(s, e, a, t) {
  const o = e || s, l = a || s, u = 0.2, h = Ye(o, l) * (t ? 1 : -1), i = me(o, l) * u;
  return {
    x: s.x + Math.cos(h) * i,
    y: s.y + Math.sin(h) * i,
    time: s.time
  };
}
function Be(s, e, a) {
  if (!a.pressure.enabled)
    return a.strokeWidth;
  const t = me(s, e), o = e.time - s.time, l = o > 0 ? t / o : 0, u = Math.max(0.1, Math.min(1, 1 - l * 0.01)), { min: h, max: i } = a.pressure;
  return h + (i - h) * u;
}
function Fe(s, e, a) {
  if (e.length < 2)
    return;
  if (s.strokeStyle = a.strokeColor, s.lineCap = "round", s.lineJoin = "round", !a.smoothing || e.length < 3) {
    s.beginPath(), s.lineWidth = a.strokeWidth, s.moveTo(e[0].x, e[0].y);
    for (let o = 1; o < e.length; o++)
      s.lineTo(e[o].x, e[o].y);
    s.stroke();
    return;
  }
  s.beginPath(), s.moveTo(e[0].x, e[0].y);
  for (let o = 1; o < e.length - 1; o++) {
    const l = e[o], u = e[o + 1];
    a.pressure.enabled ? s.lineWidth = Be(e[o - 1], l, a) : s.lineWidth = a.strokeWidth;
    const h = qe(l, e[o - 1], u);
    s.quadraticCurveTo(h.x, h.y, l.x, l.y);
  }
  const t = e[e.length - 1];
  s.lineTo(t.x, t.y), s.stroke();
}
function Ue(s) {
  const { canvasSize: e, paths: a } = s;
  let t = `<svg width="${e.width}" height="${e.height}" xmlns="http://www.w3.org/2000/svg">`;
  return a.forEach((o) => {
    if (o.points.length < 2)
      return;
    let l = `M ${o.points[0].x} ${o.points[0].y}`;
    for (let u = 1; u < o.points.length; u++)
      l += ` L ${o.points[u].x} ${o.points[u].y}`;
    t += `<path d="${l}" stroke="${o.strokeColor}" stroke-width="${o.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), t += "</svg>", t;
}
function He(s, e, a = { format: "png" }) {
  const { format: t, quality: o = 0.9, size: l, backgroundColor: u } = a;
  if (t === "svg")
    return Ue(e);
  const h = document.createElement("canvas"), i = h.getContext("2d");
  if (l) {
    h.width = l.width, h.height = l.height;
    const d = l.width / s.width, p = l.height / s.height;
    i.scale(d, p);
  } else
    h.width = s.width, h.height = s.height;
  switch (u && u !== "transparent" && (i.fillStyle = u, i.fillRect(0, 0, h.width, h.height)), i.drawImage(s, 0, 0), t) {
    case "jpeg":
      return h.toDataURL("image/jpeg", o);
    case "base64":
      return h.toDataURL("image/png").split(",")[1];
    case "png":
    default:
      return h.toDataURL("image/png");
  }
}
function Le(s, e) {
  return new Promise((a, t) => {
    const o = new Image();
    o.onload = () => {
      const l = s.getContext("2d");
      l.clearRect(0, 0, s.width, s.height), l.drawImage(o, 0, 0, s.width, s.height), a();
    }, o.onerror = t, o.src = e;
  });
}
function O(s) {
  return s.paths.length === 0 || s.paths.every((e) => e.points.length === 0);
}
function A(s, e) {
  return {
    paths: [],
    canvasSize: { width: s, height: e },
    timestamp: Date.now(),
    isEmpty: !0
  };
}
function _(s) {
  return JSON.parse(JSON.stringify(s));
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
  setReplayData(e, a = {}) {
    console.log("设置回放数据:", e), console.log("回放选项:", a), this.replayData = e, this.options = { ...a }, this.speed = a.speed || e.speed || 1, this.currentTime = a.startTime || 0, this.state = "idle", console.log("回放数据设置完成，路径数量:", e.paths.length), console.log("总时长:", e.totalDuration);
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
    const a = this.options.endTime || this.replayData.totalDuration;
    this.currentTime = Math.max(0, Math.min(e, a)), this.state === "playing" ? this.startTimestamp = performance.now() - this.currentTime / this.speed : this.pausedTime = this.currentTime / this.speed, this.renderFrame(this.currentTime);
  }
  /**
   * 设置播放速度
   */
  setSpeed(e) {
    const a = this.state === "playing";
    a && this.pause(), this.speed = Math.max(0.1, Math.min(5, e)), this.emit("replay-speed-change", this.speed), a && this.play();
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
    const a = this.options.endTime || this.replayData.totalDuration;
    if (this.currentTime >= a) {
      this.currentTime = a, this.state = "completed", this.renderFrame(this.currentTime), this.emit("replay-complete"), this.options.loop && setTimeout(() => {
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
    let a = !1;
    for (let t = 0; t < this.replayData.paths.length; t++) {
      const o = this.replayData.paths[t], l = o.startTime || 0, u = o.endTime || l + (o.duration || 0);
      if (e < l)
        break;
      if (e >= u) {
        this.drawCompletePath(o), !a && Math.abs(e - u) < 32 && this.emit("replay-path-end", t, o);
        continue;
      }
      a = !0;
      const h = Math.max(0, Math.min(1, (e - l) / Math.max(u - l, 1)));
      h > 0 && Math.abs(e - l) < 32 && this.emit("replay-path-start", t, o), this.drawPartialPath(o, h);
      break;
    }
  }
  /**
   * 绘制完整路径 - 使用与录制时相同的算法
   */
  drawCompletePath(e) {
    if (e.points.length < 2)
      return;
    const a = this.options.drawOptions || {
      strokeColor: e.strokeColor,
      strokeWidth: e.strokeWidth,
      smoothing: !0,
      pressure: { enabled: !1, min: 1, max: 4 }
    };
    this.drawPathWithSmoothAlgorithm(e.points, {
      ...a,
      strokeColor: e.strokeColor,
      // 保持路径自己的颜色
      strokeWidth: e.strokeWidth
      // 保持路径自己的宽度
    });
  }
  /**
   * 绘制部分路径 - 使用与录制时相同的算法
   */
  drawPartialPath(e, a) {
    if (e.points.length < 2)
      return;
    const t = e.startTime || 0, o = e.duration || 0, l = t + o * a, u = this.getPointsUpToTime(e.points, t, l);
    if (u.length < 2)
      return;
    const h = this.options.drawOptions || {
      strokeColor: e.strokeColor,
      strokeWidth: e.strokeWidth,
      smoothing: !0,
      pressure: { enabled: !1, min: 1, max: 4 }
    };
    this.drawPathWithSmoothAlgorithm(u, {
      ...h,
      strokeColor: e.strokeColor,
      // 保持路径自己的颜色
      strokeWidth: e.strokeWidth
      // 保持路径自己的宽度
    });
  }
  /**
   * 获取指定时间内的所有点
   */
  getPointsUpToTime(e, a, t) {
    const o = [];
    for (let l = 0; l < e.length; l++) {
      const u = e[l], h = a + (u.relativeTime || l * 50);
      if (h <= t)
        o.push(u);
      else {
        if (l > 0) {
          const i = e[l - 1], d = a + (i.relativeTime || (l - 1) * 50);
          if (d <= t) {
            const p = (t - d) / (h - d), c = {
              x: i.x + (u.x - i.x) * p,
              y: i.y + (u.y - i.y) * p,
              time: t,
              pressure: i.pressure ? i.pressure + (u.pressure || i.pressure - i.pressure) * p : u.pressure
            };
            o.push(c);
          }
        }
        break;
      }
    }
    return o;
  }
  /**
   * 使用与录制时相同的平滑算法绘制路径
   */
  drawPathWithSmoothAlgorithm(e, a) {
    if (e.length < 2)
      return;
    if (this.ctx.strokeStyle = a.strokeColor, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", !a.smoothing || e.length < 3) {
      this.ctx.beginPath(), this.ctx.lineWidth = a.strokeWidth, this.ctx.moveTo(e[0].x, e[0].y);
      for (let o = 1; o < e.length; o++)
        this.ctx.lineTo(e[o].x, e[o].y);
      this.ctx.stroke();
      return;
    }
    this.ctx.beginPath(), this.ctx.moveTo(e[0].x, e[0].y);
    for (let o = 1; o < e.length - 1; o++) {
      const l = e[o], u = e[o + 1];
      this.ctx.lineWidth = a.strokeWidth;
      const h = this.getControlPoint(l, e[o - 1], u);
      this.ctx.quadraticCurveTo(h.x, h.y, l.x, l.y);
    }
    const t = e[e.length - 1];
    this.ctx.lineTo(t.x, t.y), this.ctx.stroke();
  }
  /**
   * 获取控制点（用于贝塞尔曲线平滑） - 与signature.ts中的实现一致
   */
  getControlPoint(e, a, t) {
    const l = {
      length: Math.sqrt(Math.pow(t.x - a.x, 2) + Math.pow(t.y - a.y, 2)),
      angle: Math.atan2(t.y - a.y, t.x - a.x)
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
  on(e, a) {
    this.eventCallbacks.has(e) || this.eventCallbacks.set(e, []), this.eventCallbacks.get(e).push(a);
  }
  /**
   * 移除事件监听器
   */
  off(e, a) {
    if (this.eventCallbacks.has(e))
      if (a) {
        const t = this.eventCallbacks.get(e), o = t.indexOf(a);
        o > -1 && t.splice(o, 1);
      } else
        this.eventCallbacks.delete(e);
  }
  /**
   * 触发事件
   */
  emit(e, ...a) {
    const t = this.eventCallbacks.get(e);
    t && t.forEach((o) => o(...a));
  }
  /**
   * 销毁控制器
   */
  destroy() {
    this.stop(), this.eventCallbacks.clear(), this.replayData = null;
  }
}
function Je(s) {
  const e = s.paths.map((i) => {
    const d = i.points.map((c, y) => {
      var f;
      let g;
      if (c.time && i.points[0].time)
        g = c.time - i.points[0].time;
      else if (y === 0)
        g = 0;
      else {
        const S = i.points[y - 1], T = Math.sqrt(
          Math.pow(c.x - S.x, 2) + Math.pow(c.y - S.y, 2)
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
  }), a = [];
  for (let i = 0; i < e.length; i++) {
    const d = e[i];
    let p;
    if (i === 0)
      p = 0;
    else {
      const g = a[i - 1], f = je(
        s.paths[i - 1].points,
        s.paths[i].points
      );
      p = g.endTime + f;
    }
    const c = p + d.duration, y = {
      ...d,
      startTime: p,
      endTime: c
    };
    console.log(`路径 ${i}: 开始时间=${p}, 结束时间=${c}, 持续时间=${d.duration}`), a.push(y);
  }
  const t = a.length > 0 ? a[a.length - 1].endTime : 0;
  console.log("回放数据生成完成:"), console.log("- 路径数量:", a.length), console.log("- 总时长:", t), console.log("- 路径详情:", a.map((i) => ({
    startTime: i.startTime,
    endTime: i.endTime,
    duration: i.duration,
    pointCount: i.points.length
  })));
  const o = a.reduce((i, d) => i + Ge(d.points), 0), l = t > 0 ? o / (t / 1e3) : 0, u = a.slice(1).map((i, d) => {
    const p = a[d];
    return i.startTime - p.endTime;
  }), h = u.length > 0 ? u.reduce((i, d) => i + d, 0) / u.length : 0;
  return {
    paths: a,
    totalDuration: t,
    speed: 1,
    metadata: {
      deviceType: Ve(s),
      averageSpeed: l,
      totalDistance: o,
      averagePauseTime: h
    }
  };
}
function je(s, e) {
  if (s.length === 0 || e.length === 0)
    return 200;
  const a = s[s.length - 1], t = e[0];
  if (a.time && t.time)
    return Math.max(t.time - a.time, 50);
  const o = Math.sqrt(
    Math.pow(t.x - a.x, 2) + Math.pow(t.y - a.y, 2)
  );
  return Math.min(Math.max(o * 2, 100), 1e3);
}
function Ve(s) {
  const e = s.paths.reduce((l, u) => l + u.points.length, 0), a = s.paths.length;
  if (e === 0)
    return "touch";
  const t = e / a;
  return t > 20 ? "touch" : t < 10 ? "mouse" : s.paths.some(
    (l) => l.points.some((u) => u.pressure !== void 0)
  ) ? "pen" : "touch";
}
function Ge(s) {
  let e = 0;
  for (let a = 1; a < s.length; a++) {
    const t = s[a].x - s[a - 1].x, o = s[a].y - s[a - 1].y;
    e += Math.sqrt(t * t + o * o);
  }
  return e;
}
const Qe = ["width", "height"], Ke = {
  key: 1,
  class: "signature-toolbar"
}, Ze = ["disabled"], et = ["disabled"], tt = ["disabled"], at = {
  key: 2,
  class: "replay-controls"
}, st = { class: "replay-buttons" }, ot = ["disabled"], nt = { key: 0 }, it = { key: 1 }, lt = ["disabled"], rt = { class: "replay-progress" }, ut = ["max", "value", "disabled"], ht = { class: "time-display" }, ct = { class: "replay-speed" }, dt = /* @__PURE__ */ Ae({
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
  setup(s, { expose: e, emit: a }) {
    const t = s, o = a, l = k(), u = k(!1), h = k(null), i = k(A(0, 0)), d = k([]), p = k(-1), c = k(null), y = k(!1), g = k("idle"), f = k(0), S = k(0), C = x(() => typeof t.width == "number" ? t.width : 800), T = x(() => typeof t.height == "number" ? t.height : 300), ye = x(() => ({
      position: "relative",
      display: "inline-block",
      width: typeof t.width == "string" ? t.width : `${t.width}px`,
      height: typeof t.height == "string" ? t.height : `${t.height}px`
    })), fe = x(() => ({
      border: t.borderStyle,
      borderRadius: t.borderRadius,
      backgroundColor: t.backgroundColor,
      cursor: t.disabled ? "not-allowed" : "crosshair",
      display: "block",
      width: "100%",
      height: "100%"
    })), we = x(() => ({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "#999",
      fontSize: "14px",
      pointerEvents: "none",
      userSelect: "none"
    })), xe = x(() => y.value ? !1 : t.placeholder && O(i.value)), L = x(() => p.value > 0), N = x(() => p.value < d.value.length - 1), J = x(() => y.value && c.value), b = x(() => !J.value && !t.disabled), Te = x(() => {
      var n;
      return J.value && ((n = t.replayOptions) == null ? void 0 : n.showControls) !== !1;
    }), z = x(() => ({
      strokeColor: t.strokeColor,
      strokeWidth: t.strokeWidth,
      smoothing: t.smoothing,
      pressure: {
        enabled: t.pressureSensitive,
        min: t.minStrokeWidth,
        max: t.maxStrokeWidth
      }
    })), ke = () => {
      var n;
      return ((n = l.value) == null ? void 0 : n.getContext("2d")) || null;
    }, R = (n, r) => {
      const m = l.value, D = m.getBoundingClientRect(), Y = m.width / D.width, $ = m.height / D.height;
      return {
        x: (n - D.left) * Y,
        y: (r - D.top) * $,
        time: Date.now()
      };
    }, j = (n) => {
      if (!b.value)
        return;
      u.value = !0;
      const r = performance.now(), m = { ...n, time: r };
      h.value = {
        points: [m],
        strokeColor: t.strokeColor,
        strokeWidth: t.strokeWidth,
        startTime: r,
        endTime: r,
        duration: 0
      }, o("signature-start");
    }, V = (n) => {
      if (!u.value || !h.value || !b.value)
        return;
      const r = performance.now(), m = { ...n, time: r };
      h.value.points.push(m), h.value.startTime && (h.value.endTime = r, h.value.duration = r - h.value.startTime), P(), Z(), o("signature-drawing", i.value);
    }, G = () => {
      if (!(!u.value || !h.value)) {
        if (u.value = !1, h.value.points.length > 0) {
          const n = h.value.points[h.value.points.length - 1];
          n.time && h.value.startTime && (h.value.endTime = n.time, h.value.duration = n.time - h.value.startTime);
        }
        i.value.paths.push(h.value), i.value.isEmpty = !1, i.value.timestamp = Date.now(), E(), h.value = null, o("signature-end", i.value);
      }
    }, Ce = (n) => {
      n.preventDefault();
      const r = R(n.clientX, n.clientY);
      j(r);
    }, be = (n) => {
      if (n.preventDefault(), !u.value)
        return;
      const r = R(n.clientX, n.clientY);
      V(r);
    }, Q = (n) => {
      n.preventDefault(), G();
    }, De = (n) => {
      if (n.preventDefault(), n.touches.length !== 1)
        return;
      const r = n.touches[0], m = R(r.clientX, r.clientY);
      j(m);
    }, Pe = (n) => {
      if (n.preventDefault(), n.touches.length !== 1 || !u.value)
        return;
      const r = n.touches[0], m = R(r.clientX, r.clientY);
      V(m);
    }, K = (n) => {
      n.preventDefault(), G();
    }, Z = () => {
      i.value.canvasSize = {
        width: C.value,
        height: T.value
      }, i.value.isEmpty = O(i.value);
    }, E = () => {
      d.value = d.value.slice(0, p.value + 1), d.value.push(_(i.value)), p.value = d.value.length - 1;
      const n = 50;
      d.value.length > n && (d.value = d.value.slice(-n), p.value = d.value.length - 1);
    }, P = () => {
      const n = ke();
      n && (n.clearRect(0, 0, C.value, T.value), t.backgroundColor && t.backgroundColor !== "transparent" && (n.fillStyle = t.backgroundColor, n.fillRect(0, 0, C.value, T.value)), i.value.paths.forEach((r) => {
        if (r.points.length > 0) {
          const m = {
            strokeColor: r.strokeColor,
            strokeWidth: r.strokeWidth,
            smoothing: t.smoothing,
            pressure: z.value.pressure
          };
          Fe(n, r.points, m);
        }
      }));
    }, I = () => {
      if (console.log("初始化回放控制器"), console.log("canvas引用是否存在:", !!l.value), !l.value) {
        console.error("canvas引用不存在，无法初始化回放控制器");
        return;
      }
      c.value && (console.log("销毁现有回放控制器"), c.value.destroy()), console.log("创建新的回放控制器"), c.value = new Ne(l.value), console.log("回放控制器创建成功:", !!c.value), c.value.on("replay-start", () => {
        g.value = "playing", o("replay-start");
      }), c.value.on("replay-progress", (n, r) => {
        f.value = n, S.value = r, o("replay-progress", n, r);
      }), c.value.on("replay-pause", () => {
        g.value = "paused", o("replay-pause");
      }), c.value.on("replay-resume", () => {
        g.value = "playing", o("replay-resume");
      }), c.value.on("replay-stop", () => {
        g.value = "stopped", o("replay-stop");
      }), c.value.on("replay-complete", () => {
        g.value = "completed", o("replay-complete");
      }), c.value.on("replay-path-start", (n, r) => {
        o("replay-path-start", n, r);
      }), c.value.on("replay-path-end", (n, r) => {
        o("replay-path-end", n, r);
      }), c.value.on("replay-speed-change", (n) => {
        o("replay-speed-change", n);
      });
    }, ee = (n, r) => {
      if (c.value || I(), c.value) {
        y.value = !0;
        const m = {
          ...r,
          drawOptions: z.value
        };
        c.value.setReplayData(n, m), console.log("startReplay调用，自动播放:", r == null ? void 0 : r.autoPlay), (r == null ? void 0 : r.autoPlay) === !0 && c.value.play();
      }
    }, te = (n) => {
      y.value = n, !n && c.value && (c.value.stop(), P());
    }, Se = () => O(i.value) ? null : Je(i.value), ae = () => {
      console.log("play方法被调用"), console.log("回放控制器是否存在:", !!c.value), c.value || (console.log("回放控制器不存在，尝试初始化"), I()), c.value ? (console.log("调用回放控制器的play方法"), c.value.play()) : console.error("回放控制器初始化失败，无法播放");
    }, se = () => {
      var n;
      (n = c.value) == null || n.pause();
    }, oe = () => {
      var n;
      (n = c.value) == null || n.stop();
    }, ne = (n) => {
      var r;
      (r = c.value) == null || r.seek(n);
    }, ie = (n) => {
      var r;
      (r = c.value) == null || r.setSpeed(n);
    }, Me = () => {
      var n;
      return ((n = c.value) == null ? void 0 : n.getState()) || "idle";
    }, We = () => {
      var n;
      return ((n = c.value) == null ? void 0 : n.getCurrentTime()) || 0;
    }, X = () => {
      var n;
      return ((n = c.value) == null ? void 0 : n.getTotalDuration()) || 0;
    }, _e = () => {
      var n;
      return ((n = c.value) == null ? void 0 : n.getProgress()) || 0;
    }, le = (n) => {
      const r = Math.floor(n / 1e3), m = Math.floor(r / 60), D = r % 60;
      return `${m}:${D.toString().padStart(2, "0")}`;
    }, re = () => {
      b.value && (i.value = A(C.value, T.value), P(), E(), o("signature-clear"));
    }, ue = () => {
      !L.value || !b.value || (p.value--, i.value = _(d.value[p.value]), P(), o("signature-undo", i.value));
    }, he = () => {
      !N.value || !b.value || (p.value++, i.value = _(d.value[p.value]), P(), o("signature-redo", i.value));
    }, ce = (n) => {
      const r = l.value;
      return He(r, i.value, n);
    }, de = () => O(i.value), pe = async (n) => {
      if (!b.value)
        return;
      const r = l.value;
      await Le(r, n), i.value = A(C.value, T.value), i.value.isEmpty = !1, E();
    }, Re = () => _(i.value), Ee = (n) => {
      b.value && (i.value = _(n), P(), E());
    }, ge = (n, r) => {
      const m = n || C.value, D = r || T.value, Y = ce({ format: "png" });
      B(() => {
        const $ = l.value;
        $.width = m, $.height = D, de() || pe(Y), Z();
      });
    }, Ie = () => {
      const n = l.value;
      n.width = C.value, n.height = T.value, i.value = A(C.value, T.value), d.value = [_(i.value)], p.value = 0, P();
    };
    return q([() => t.width, () => t.height], () => {
      B(() => {
        l.value && ge();
      });
    }), q(() => t.replayMode, (n) => {
      n !== void 0 && te(n);
    }), q(() => t.replayData, (n) => {
      if (console.log("watch监听到回放数据变化:", n), console.log("当前回放模式:", t.replayMode), console.log("回放控制器是否存在:", !!c.value), n && t.replayMode)
        if (c.value || (console.log("回放控制器未初始化，先初始化"), I()), c.value) {
          console.log("开始设置回放数据到控制器");
          const r = {
            ...t.replayOptions,
            drawOptions: z.value
          };
          c.value.setReplayData(n, r), console.log("回放数据已更新:", n);
        } else
          console.error("回放控制器初始化失败");
      else
        n || console.log("回放数据为空，跳过设置"), t.replayMode || console.log("不在回放模式，跳过设置");
    }, { immediate: !0 }), ze(() => {
      B(() => {
        Ie(), I(), t.replayMode && t.replayData && ee(t.replayData, t.replayOptions);
      });
    }), Xe(() => {
      c.value && (c.value.destroy(), c.value = null);
    }), e({
      clear: re,
      undo: ue,
      redo: he,
      save: ce,
      isEmpty: de,
      fromDataURL: pe,
      getSignatureData: Re,
      setSignatureData: Ee,
      resize: ge,
      // 回放相关方法
      startReplay: ee,
      getReplayData: Se,
      setReplayMode: te,
      play: ae,
      pause: se,
      stop: oe,
      seek: ne,
      setSpeed: ie,
      getState: Me,
      getCurrentTime: We,
      getTotalDuration: X,
      getProgress: _e
    }), (n, r) => (M(), W("div", {
      class: "electronic-signature",
      style: F(ye.value)
    }, [
      v("canvas", {
        ref_key: "canvasRef",
        ref: l,
        width: C.value,
        height: T.value,
        style: F(fe.value),
        onMousedown: Ce,
        onMousemove: be,
        onMouseup: Q,
        onMouseleave: Q,
        onTouchstart: De,
        onTouchmove: Pe,
        onTouchend: K,
        onTouchcancel: K
      }, null, 44, Qe),
      xe.value ? (M(), W("div", {
        key: 0,
        class: "signature-placeholder",
        style: F(we.value)
      }, U(n.placeholder), 5)) : H("", !0),
      n.showToolbar ? (M(), W("div", Ke, [
        v("button", {
          onClick: re,
          disabled: !b.value
        }, "清除", 8, Ze),
        v("button", {
          onClick: ue,
          disabled: !b.value || !L.value
        }, "撤销", 8, et),
        v("button", {
          onClick: he,
          disabled: !b.value || !N.value
        }, "重做", 8, tt)
      ])) : H("", !0),
      Te.value ? (M(), W("div", at, [
        v("div", st, [
          v("button", {
            onClick: r[0] || (r[0] = (m) => g.value === "playing" ? se() : ae()),
            disabled: g.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            g.value === "playing" ? (M(), W("span", nt, "⏸️")) : (M(), W("span", it, "▶️"))
          ], 8, ot),
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
            value: S.value,
            onInput: r[2] || (r[2] = (m) => ne(Number(m.target.value))),
            class: "progress-slider",
            disabled: g.value === "idle"
          }, null, 40, ut),
          v("div", ht, [
            v("span", null, U(le(S.value)), 1),
            r[4] || (r[4] = v("span", null, "/", -1)),
            v("span", null, U(le(X())), 1)
          ])
        ]),
        v("div", ct, [
          r[6] || (r[6] = v("label", null, "速度:", -1)),
          v("select", {
            onChange: r[3] || (r[3] = (m) => ie(Number(m.target.value))),
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
      ])) : H("", !0)
    ], 4));
  }
});
const pt = (s, e) => {
  const a = s.__vccOpts || s;
  for (const [t, o] of e)
    a[t] = o;
  return a;
}, ve = /* @__PURE__ */ pt(dt, [["__scopeId", "data-v-4463879c"]]);
function gt() {
  return window.devicePixelRatio || 1;
}
function wt(s) {
  const e = s.getContext("2d"), a = gt(), t = s.clientWidth, o = s.clientHeight;
  return s.width = t * a, s.height = o * a, e.scale(a, a), s.style.width = t + "px", s.style.height = o + "px", e;
}
function mt(s) {
  if (s.paths.length === 0)
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0
    };
  let e = 1 / 0, a = 1 / 0, t = -1 / 0, o = -1 / 0;
  return s.paths.forEach((l) => {
    l.points.forEach((u) => {
      e = Math.min(e, u.x), a = Math.min(a, u.y), t = Math.max(t, u.x), o = Math.max(o, u.y);
    });
  }), {
    minX: e,
    minY: a,
    maxX: t,
    maxY: o,
    width: t - e,
    height: o - a
  };
}
function xt(s, e, a = 10) {
  const t = mt(e);
  if (t.width === 0 || t.height === 0) {
    const i = document.createElement("canvas");
    return i.width = 1, i.height = 1, i;
  }
  const o = document.createElement("canvas"), l = o.getContext("2d"), u = t.width + a * 2, h = t.height + a * 2;
  return o.width = u, o.height = h, l.drawImage(
    s,
    t.minX - a,
    t.minY - a,
    u,
    h,
    0,
    0,
    u,
    h
  ), o;
}
function Tt(s, e, a, t = !0) {
  const o = document.createElement("canvas"), l = o.getContext("2d");
  let u = e, h = a;
  if (t) {
    const i = s.width / s.height, d = e / a;
    i > d ? h = e / i : u = a * i;
  }
  return o.width = u, o.height = h, l.imageSmoothingEnabled = !0, l.imageSmoothingQuality = "high", l.drawImage(s, 0, 0, u, h), o;
}
function kt(s, e, a = {}) {
  const {
    fontSize: t = 12,
    fontFamily: o = "Arial",
    color: l = "#999",
    opacity: u = 0.5,
    position: h = "bottom-right"
  } = a, i = document.createElement("canvas"), d = i.getContext("2d");
  i.width = s.width, i.height = s.height, d.drawImage(s, 0, 0), d.font = `${t}px ${o}`, d.fillStyle = l, d.globalAlpha = u;
  const c = d.measureText(e).width, y = t;
  let g, f;
  switch (h) {
    case "top-left":
      g = 10, f = y + 10;
      break;
    case "top-right":
      g = s.width - c - 10, f = y + 10;
      break;
    case "bottom-left":
      g = 10, f = s.height - 10;
      break;
    case "bottom-right":
      g = s.width - c - 10, f = s.height - 10;
      break;
    case "center":
      g = (s.width - c) / 2, f = (s.height + y) / 2;
      break;
    default:
      g = s.width - c - 10, f = s.height - 10;
  }
  return d.fillText(e, g, f), d.globalAlpha = 1, i;
}
function Ct(s) {
  const e = document.createElement("canvas"), a = e.getContext("2d");
  e.width = s.width, e.height = s.height, a.drawImage(s, 0, 0);
  const t = a.getImageData(0, 0, s.width, s.height), o = t.data;
  for (let l = 0; l < o.length; l += 4) {
    const u = o[l] * 0.299 + o[l + 1] * 0.587 + o[l + 2] * 0.114;
    o[l] = u, o[l + 1] = u, o[l + 2] = u;
  }
  return a.putImageData(t, 0, 0), e;
}
const vt = (s) => {
  s.component("ElectronicSignature", ve);
}, bt = {
  install: vt,
  ElectronicSignature: ve
}, Dt = "1.0.0";
export {
  ve as ElectronicSignature,
  Ne as SignatureReplayController,
  kt as addWatermark,
  Be as calculateStrokeWidth,
  _ as cloneSignatureData,
  Ct as convertToGrayscale,
  A as createEmptySignatureData,
  Je as createReplayData,
  xt as cropSignature,
  bt as default,
  Fe as drawSmoothPath,
  He as exportSignature,
  Ye as getAngle,
  qe as getControlPoint,
  gt as getDevicePixelRatio,
  me as getDistance,
  mt as getSignatureBounds,
  O as isSignatureEmpty,
  Le as loadImageToCanvas,
  Tt as resizeSignature,
  wt as setupHighDPICanvas,
  Ue as signatureToSVG,
  Dt as version
};
