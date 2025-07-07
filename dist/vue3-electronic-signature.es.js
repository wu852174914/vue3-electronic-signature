var qe = Object.defineProperty;
var ze = (n, e, o) => e in n ? qe(n, e, { enumerable: !0, configurable: !0, writable: !0, value: o }) : n[e] = o;
var T = (n, e, o) => (ze(n, typeof e != "symbol" ? e + "" : e, o), o);
import { defineComponent as Xe, ref as P, computed as k, watch as F, nextTick as B, onMounted as Ye, onUnmounted as Fe, openBlock as _, createElementBlock as R, normalizeStyle as U, createElementVNode as v, toDisplayString as H, createCommentVNode as L } from "vue";
function ye(n, e) {
  return Math.sqrt(
    Math.pow(e.x - n.x, 2) + Math.pow(e.y - n.y, 2)
  );
}
function Be(n, e) {
  return Math.atan2(e.y - n.y, e.x - n.x);
}
function Ue(n, e, o, t) {
  const s = e || n, r = o || n, h = 0.2, u = Be(s, r) * (t ? 1 : -1), i = ye(s, r) * h;
  return {
    x: n.x + Math.cos(u) * i,
    y: n.y + Math.sin(u) * i,
    time: n.time
  };
}
function He(n, e, o) {
  if (!o.pressure.enabled)
    return o.strokeWidth;
  const t = ye(n, e), s = e.time - n.time, r = s > 0 ? t / s : 0, h = Math.max(0.1, Math.min(1, 1 - r * 0.01)), { min: u, max: i } = o.pressure;
  return u + (i - u) * h;
}
function Le(n, e, o) {
  if (e.length < 2)
    return;
  if (n.strokeStyle = o.strokeColor, n.lineCap = "round", n.lineJoin = "round", !o.smoothing || e.length < 3) {
    n.beginPath(), n.lineWidth = o.strokeWidth, n.moveTo(e[0].x, e[0].y);
    for (let s = 1; s < e.length; s++)
      n.lineTo(e[s].x, e[s].y);
    n.stroke();
    return;
  }
  n.beginPath(), n.moveTo(e[0].x, e[0].y);
  for (let s = 1; s < e.length - 1; s++) {
    const r = e[s], h = e[s + 1];
    o.pressure.enabled ? n.lineWidth = He(e[s - 1], r, o) : n.lineWidth = o.strokeWidth;
    const u = Ue(r, e[s - 1], h);
    n.quadraticCurveTo(u.x, u.y, r.x, r.y);
  }
  const t = e[e.length - 1];
  n.lineTo(t.x, t.y), n.stroke();
}
function Ne(n) {
  const { canvasSize: e, paths: o } = n;
  let t = `<svg width="${e.width}" height="${e.height}" xmlns="http://www.w3.org/2000/svg">`;
  return o.forEach((s) => {
    if (s.points.length < 2)
      return;
    let r = `M ${s.points[0].x} ${s.points[0].y}`;
    for (let h = 1; h < s.points.length; h++)
      r += ` L ${s.points[h].x} ${s.points[h].y}`;
    t += `<path d="${r}" stroke="${s.strokeColor}" stroke-width="${s.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), t += "</svg>", t;
}
function Je(n, e, o = { format: "png" }) {
  const { format: t, quality: s = 0.9, size: r, backgroundColor: h } = o;
  if (t === "svg")
    return Ne(e);
  const u = document.createElement("canvas"), i = u.getContext("2d");
  if (r) {
    u.width = r.width, u.height = r.height;
    const d = r.width / n.width, g = r.height / n.height;
    i.scale(d, g);
  } else
    u.width = n.width, u.height = n.height;
  switch (h && h !== "transparent" && (i.fillStyle = h, i.fillRect(0, 0, u.width, u.height)), i.drawImage(n, 0, 0), t) {
    case "jpeg":
      return u.toDataURL("image/jpeg", s);
    case "base64":
      return u.toDataURL("image/png").split(",")[1];
    case "png":
    default:
      return u.toDataURL("image/png");
  }
}
function je(n, e) {
  return new Promise((o, t) => {
    const s = new Image();
    s.onload = () => {
      const r = n.getContext("2d");
      r.clearRect(0, 0, n.width, n.height), r.drawImage(s, 0, 0, n.width, n.height), o();
    }, s.onerror = t, s.src = e;
  });
}
function q(n) {
  return n.paths.length === 0 || n.paths.every((e) => e.points.length === 0);
}
function z(n, e) {
  return {
    paths: [],
    canvasSize: { width: n, height: e },
    timestamp: Date.now(),
    isEmpty: !0
  };
}
function E(n) {
  return JSON.parse(JSON.stringify(n));
}
class Ve {
  constructor(e) {
    T(this, "canvas");
    T(this, "ctx");
    T(this, "replayData", null);
    T(this, "state", "idle");
    T(this, "currentTime", 0);
    T(this, "speed", 1);
    T(this, "animationId", null);
    T(this, "startTimestamp", 0);
    T(this, "pausedTime", 0);
    T(this, "options", {});
    // 事件回调
    T(this, "eventCallbacks", /* @__PURE__ */ new Map());
    this.canvas = e, this.ctx = e.getContext("2d");
  }
  /**
   * 设置回放数据
   */
  setReplayData(e, o = {}) {
    console.log("设置回放数据:", e), console.log("回放选项:", o), this.replayData = e, this.options = { ...o }, this.speed = o.speed || e.speed || 1, this.currentTime = o.startTime || 0, this.state = "idle", console.log("回放数据设置完成，路径数量:", e.paths.length), console.log("总时长:", e.totalDuration);
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
    const o = this.options.endTime || this.replayData.totalDuration;
    this.currentTime = Math.max(0, Math.min(e, o)), this.state === "playing" ? this.startTimestamp = performance.now() - this.currentTime / this.speed : this.pausedTime = this.currentTime / this.speed, this.renderFrame(this.currentTime);
  }
  /**
   * 设置播放速度
   */
  setSpeed(e) {
    const o = this.state === "playing";
    o && this.pause(), this.speed = Math.max(0.1, Math.min(5, e)), this.emit("replay-speed-change", this.speed), o && this.play();
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
    const o = this.options.endTime || this.replayData.totalDuration;
    if (this.currentTime >= o) {
      this.currentTime = o, this.state = "completed", this.renderFrame(this.currentTime), this.emit("replay-complete"), this.options.loop && setTimeout(() => {
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
    let o = !1;
    for (let t = 0; t < this.replayData.paths.length; t++) {
      const s = this.replayData.paths[t], r = s.startTime || 0, h = s.endTime || r + (s.duration || 0);
      if (e < r)
        break;
      if (e >= h) {
        this.drawCompletePath(s), !o && Math.abs(e - h) < 32 && this.emit("replay-path-end", t, s);
        continue;
      }
      o = !0;
      const u = Math.max(0, Math.min(1, (e - r) / Math.max(h - r, 1)));
      u > 0 && Math.abs(e - r) < 32 && this.emit("replay-path-start", t, s), this.drawPartialPath(s, u);
      break;
    }
  }
  /**
   * 绘制完整路径 - 使用与录制时相同的算法
   */
  drawCompletePath(e) {
    if (e.points.length < 2)
      return;
    const o = this.options.drawOptions || {
      strokeColor: e.strokeColor,
      strokeWidth: e.strokeWidth,
      smoothing: !0,
      pressure: { enabled: !1, min: 1, max: 4 }
    };
    this.drawPathWithSmoothAlgorithm(e.points, {
      ...o,
      strokeColor: e.strokeColor,
      // 保持路径自己的颜色
      strokeWidth: e.strokeWidth
      // 保持路径自己的宽度
    });
  }
  /**
   * 绘制部分路径 - 使用与录制时相同的算法
   */
  drawPartialPath(e, o) {
    if (e.points.length < 2)
      return;
    const t = e.startTime || 0, s = e.duration || 0, r = t + s * o, h = this.getPointsUpToTime(e.points, t, r);
    if (h.length < 2)
      return;
    const u = this.options.drawOptions || {
      strokeColor: e.strokeColor,
      strokeWidth: e.strokeWidth,
      smoothing: !0,
      pressure: { enabled: !1, min: 1, max: 4 }
    };
    this.drawPathWithSmoothAlgorithm(h, {
      ...u,
      strokeColor: e.strokeColor,
      // 保持路径自己的颜色
      strokeWidth: e.strokeWidth
      // 保持路径自己的宽度
    });
  }
  /**
   * 获取指定时间内的所有点
   */
  getPointsUpToTime(e, o, t) {
    const s = [];
    for (let r = 0; r < e.length; r++) {
      const h = e[r], u = o + (h.relativeTime || r * 50);
      if (u <= t)
        s.push(h);
      else {
        if (r > 0) {
          const i = e[r - 1], d = o + (i.relativeTime || (r - 1) * 50);
          if (d <= t) {
            const g = (t - d) / (u - d), c = {
              x: i.x + (h.x - i.x) * g,
              y: i.y + (h.y - i.y) * g,
              time: t,
              pressure: i.pressure ? i.pressure + (h.pressure || i.pressure - i.pressure) * g : h.pressure
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
  drawPathWithSmoothAlgorithm(e, o) {
    if (e.length < 2)
      return;
    if (this.ctx.strokeStyle = o.strokeColor, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", !o.smoothing || e.length < 3) {
      this.ctx.beginPath(), this.ctx.lineWidth = o.strokeWidth, this.ctx.moveTo(e[0].x, e[0].y);
      for (let s = 1; s < e.length; s++)
        this.ctx.lineTo(e[s].x, e[s].y);
      this.ctx.stroke();
      return;
    }
    this.ctx.beginPath(), this.ctx.moveTo(e[0].x, e[0].y);
    for (let s = 1; s < e.length - 1; s++) {
      const r = e[s], h = e[s + 1];
      this.ctx.lineWidth = o.strokeWidth;
      const u = this.getControlPoint(r, e[s - 1], h);
      this.ctx.quadraticCurveTo(u.x, u.y, r.x, r.y);
    }
    const t = e[e.length - 1];
    this.ctx.lineTo(t.x, t.y), this.ctx.stroke();
  }
  /**
   * 获取控制点（用于贝塞尔曲线平滑） - 与signature.ts中的实现一致
   */
  getControlPoint(e, o, t) {
    const r = {
      length: Math.sqrt(Math.pow(t.x - o.x, 2) + Math.pow(t.y - o.y, 2)),
      angle: Math.atan2(t.y - o.y, t.x - o.x)
    }, h = r.angle + Math.PI, u = r.length * 0.2;
    return {
      x: e.x + Math.cos(h) * u,
      y: e.y + Math.sin(h) * u,
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
  on(e, o) {
    this.eventCallbacks.has(e) || this.eventCallbacks.set(e, []), this.eventCallbacks.get(e).push(o);
  }
  /**
   * 移除事件监听器
   */
  off(e, o) {
    if (this.eventCallbacks.has(e))
      if (o) {
        const t = this.eventCallbacks.get(e), s = t.indexOf(o);
        s > -1 && t.splice(s, 1);
      } else
        this.eventCallbacks.delete(e);
  }
  /**
   * 触发事件
   */
  emit(e, ...o) {
    const t = this.eventCallbacks.get(e);
    t && t.forEach((s) => s(...o));
  }
  /**
   * 销毁控制器
   */
  destroy() {
    this.stop(), this.eventCallbacks.clear(), this.replayData = null;
  }
}
function Ge(n) {
  const e = n.paths.map((i) => {
    const d = i.points.map((c, y) => {
      var f;
      let m;
      if (c.time && i.points[0].time)
        m = c.time - i.points[0].time;
      else if (y === 0)
        m = 0;
      else {
        const W = i.points[y - 1], C = Math.sqrt(
          Math.pow(c.x - W.x, 2) + Math.pow(c.y - W.y, 2)
        ) / 100 * 1e3;
        m = (((f = d[y - 1]) == null ? void 0 : f.relativeTime) || 0) + Math.max(C, 16);
      }
      return {
        ...c,
        relativeTime: m
      };
    }), g = d.length > 0 ? d[d.length - 1].relativeTime : 0;
    return {
      ...i,
      points: d,
      duration: g
    };
  }), o = [];
  for (let i = 0; i < e.length; i++) {
    const d = e[i];
    let g;
    if (i === 0)
      g = 0;
    else {
      const m = o[i - 1], f = Qe(
        n.paths[i - 1].points,
        n.paths[i].points
      );
      g = m.endTime + f;
    }
    const c = g + d.duration, y = {
      ...d,
      startTime: g,
      endTime: c
    };
    console.log(`路径 ${i}: 开始时间=${g}, 结束时间=${c}, 持续时间=${d.duration}`), o.push(y);
  }
  const t = o.length > 0 ? o[o.length - 1].endTime : 0;
  console.log("回放数据生成完成:"), console.log("- 路径数量:", o.length), console.log("- 总时长:", t), console.log("- 路径详情:", o.map((i) => ({
    startTime: i.startTime,
    endTime: i.endTime,
    duration: i.duration,
    pointCount: i.points.length
  })));
  const s = o.reduce((i, d) => i + Ze(d.points), 0), r = t > 0 ? s / (t / 1e3) : 0, h = o.slice(1).map((i, d) => {
    const g = o[d];
    return i.startTime - g.endTime;
  }), u = h.length > 0 ? h.reduce((i, d) => i + d, 0) / h.length : 0;
  return {
    paths: o,
    totalDuration: t,
    speed: 1,
    metadata: {
      deviceType: Ke(n),
      averageSpeed: r,
      totalDistance: s,
      averagePauseTime: u
    }
  };
}
function Qe(n, e) {
  if (n.length === 0 || e.length === 0)
    return 200;
  const o = n[n.length - 1], t = e[0];
  if (o.time && t.time)
    return Math.max(t.time - o.time, 50);
  const s = Math.sqrt(
    Math.pow(t.x - o.x, 2) + Math.pow(t.y - o.y, 2)
  );
  return Math.min(Math.max(s * 2, 100), 1e3);
}
function Ke(n) {
  const e = n.paths.reduce((r, h) => r + h.points.length, 0), o = n.paths.length;
  if (e === 0)
    return "touch";
  const t = e / o;
  return t > 20 ? "touch" : t < 10 ? "mouse" : n.paths.some(
    (r) => r.points.some((h) => h.pressure !== void 0)
  ) ? "pen" : "touch";
}
function Ze(n) {
  let e = 0;
  for (let o = 1; o < n.length; o++) {
    const t = n[o].x - n[o - 1].x, s = n[o].y - n[o - 1].y;
    e += Math.sqrt(t * t + s * s);
  }
  return e;
}
const et = ["width", "height"], tt = {
  key: 1,
  class: "signature-toolbar"
}, at = ["disabled"], ot = ["disabled"], nt = ["disabled"], st = {
  key: 2,
  class: "replay-controls"
}, it = { class: "replay-buttons" }, lt = ["disabled"], rt = { key: 0 }, ut = { key: 1 }, ht = ["disabled"], ct = { class: "replay-progress" }, dt = ["max", "value", "disabled"], pt = { class: "time-display" }, gt = { class: "replay-speed" }, mt = /* @__PURE__ */ Xe({
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
  setup(n, { expose: e, emit: o }) {
    const t = n, s = o, r = P(), h = P(!1), u = P(null), i = P(z(0, 0)), d = P([]), g = P(-1), c = P(null), y = P(!1), m = P("idle"), f = P(0), W = P(0), M = k(() => typeof t.width == "number" ? t.width : 800), C = k(() => typeof t.height == "number" ? t.height : 300), xe = k(() => ({
      position: "relative",
      display: "inline-block",
      width: typeof t.width == "string" ? t.width : `${t.width}px`,
      height: typeof t.height == "string" ? t.height : `${t.height}px`
    })), we = k(() => ({
      border: t.borderStyle,
      borderRadius: t.borderRadius,
      backgroundColor: t.backgroundColor,
      cursor: t.disabled ? "not-allowed" : "crosshair",
      display: "block",
      width: "100%",
      height: "100%"
    })), Te = k(() => ({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "#999",
      fontSize: "14px",
      pointerEvents: "none",
      userSelect: "none"
    })), ke = k(() => y.value ? !1 : t.placeholder && q(i.value)), N = k(() => g.value > 0), J = k(() => g.value < d.value.length - 1), j = k(() => y.value && c.value), D = k(() => !j.value && !t.disabled), Ce = k(() => {
      var a;
      return j.value && ((a = t.replayOptions) == null ? void 0 : a.showControls) !== !1;
    }), X = k(() => ({
      strokeColor: t.strokeColor,
      strokeWidth: t.strokeWidth,
      smoothing: t.smoothing,
      pressure: {
        enabled: t.pressureSensitive,
        min: t.minStrokeWidth,
        max: t.maxStrokeWidth
      }
    })), V = () => {
      var a;
      return ((a = r.value) == null ? void 0 : a.getContext("2d")) || null;
    }, $ = (a, l) => {
      const p = r.value, x = p.getBoundingClientRect(), w = p.width / x.width, b = p.height / x.height;
      return {
        x: (a - x.left) * w,
        y: (l - x.top) * b,
        time: Date.now()
      };
    }, G = (a) => {
      if (!D.value)
        return;
      h.value = !0;
      const l = performance.now(), p = { ...a, time: l };
      u.value = {
        points: [p],
        strokeColor: t.strokeColor,
        strokeWidth: t.strokeWidth,
        startTime: l,
        endTime: l,
        duration: 0
      }, s("signature-start");
    }, be = () => {
      if (!u.value || u.value.points.length < 2)
        return;
      const a = V();
      if (!a)
        return;
      const l = u.value.points, p = l.length;
      if (a.strokeStyle = u.value.strokeColor, a.lineWidth = u.value.strokeWidth, a.lineCap = "round", a.lineJoin = "round", p === 2)
        a.beginPath(), a.moveTo(l[0].x, l[0].y), a.lineTo(l[1].x, l[1].y), a.stroke();
      else if (p >= 3) {
        const x = l[p - 3], w = l[p - 2], b = l[p - 1];
        if (a.beginPath(), t.smoothing) {
          a.moveTo(x.x, x.y);
          const I = Pe(w, x, b);
          a.quadraticCurveTo(I.x, I.y, w.x, w.y);
        } else
          a.moveTo(w.x, w.y), a.lineTo(b.x, b.y);
        a.stroke();
      }
    }, Pe = (a, l, p) => {
      const w = {
        length: Math.sqrt(Math.pow(p.x - l.x, 2) + Math.pow(p.y - l.y, 2)),
        angle: Math.atan2(p.y - l.y, p.x - l.x)
      }, b = w.angle + Math.PI, I = w.length * 0.2;
      return {
        x: a.x + Math.cos(b) * I,
        y: a.y + Math.sin(b) * I,
        time: a.time || 0
      };
    }, Q = (a) => {
      if (!h.value || !u.value || !D.value)
        return;
      const l = performance.now(), p = { ...a, time: l };
      u.value.points.push(p), u.value.startTime && (u.value.endTime = l, u.value.duration = l - u.value.startTime), be(), te(), s("signature-drawing", i.value);
    }, K = () => {
      if (!(!h.value || !u.value)) {
        if (h.value = !1, u.value.points.length > 0) {
          const a = u.value.points[u.value.points.length - 1];
          a.time && u.value.startTime && (u.value.endTime = a.time, u.value.duration = a.time - u.value.startTime);
        }
        i.value.paths.push(u.value), i.value.isEmpty = !1, i.value.timestamp = Date.now(), O(), S(), u.value = null, s("signature-end", i.value);
      }
    }, Me = (a) => {
      a.preventDefault();
      const l = $(a.clientX, a.clientY);
      G(l);
    }, De = (a) => {
      if (a.preventDefault(), !h.value)
        return;
      const l = $(a.clientX, a.clientY);
      Q(l);
    }, Z = (a) => {
      a.preventDefault(), K();
    }, Se = (a) => {
      if (a.preventDefault(), a.touches.length !== 1)
        return;
      const l = a.touches[0], p = $(l.clientX, l.clientY);
      G(p);
    }, We = (a) => {
      if (a.preventDefault(), a.touches.length !== 1 || !h.value)
        return;
      const l = a.touches[0], p = $(l.clientX, l.clientY);
      Q(p);
    }, ee = (a) => {
      a.preventDefault(), K();
    }, te = () => {
      i.value.canvasSize = {
        width: M.value,
        height: C.value
      }, i.value.isEmpty = q(i.value);
    }, O = () => {
      d.value = d.value.slice(0, g.value + 1), d.value.push(E(i.value)), g.value = d.value.length - 1;
      const a = 50;
      d.value.length > a && (d.value = d.value.slice(-a), g.value = d.value.length - 1);
    }, S = () => {
      const a = V();
      a && (a.clearRect(0, 0, M.value, C.value), t.backgroundColor && t.backgroundColor !== "transparent" && (a.fillStyle = t.backgroundColor, a.fillRect(0, 0, M.value, C.value)), i.value.paths.forEach((l) => {
        if (l.points.length > 0) {
          const p = {
            strokeColor: l.strokeColor,
            strokeWidth: l.strokeWidth,
            smoothing: t.smoothing,
            pressure: X.value.pressure
          };
          Le(a, l.points, p);
        }
      }));
    }, A = () => {
      if (console.log("初始化回放控制器"), console.log("canvas引用是否存在:", !!r.value), !r.value) {
        console.error("canvas引用不存在，无法初始化回放控制器");
        return;
      }
      c.value && (console.log("销毁现有回放控制器"), c.value.destroy()), console.log("创建新的回放控制器"), c.value = new Ve(r.value), console.log("回放控制器创建成功:", !!c.value), c.value.on("replay-start", () => {
        m.value = "playing", s("replay-start");
      }), c.value.on("replay-progress", (a, l) => {
        f.value = a, W.value = l, s("replay-progress", a, l);
      }), c.value.on("replay-pause", () => {
        m.value = "paused", s("replay-pause");
      }), c.value.on("replay-resume", () => {
        m.value = "playing", s("replay-resume");
      }), c.value.on("replay-stop", () => {
        m.value = "stopped", s("replay-stop");
      }), c.value.on("replay-complete", () => {
        m.value = "completed", s("replay-complete");
      }), c.value.on("replay-path-start", (a, l) => {
        s("replay-path-start", a, l);
      }), c.value.on("replay-path-end", (a, l) => {
        s("replay-path-end", a, l);
      }), c.value.on("replay-speed-change", (a) => {
        s("replay-speed-change", a);
      });
    }, ae = (a, l) => {
      if (c.value || A(), c.value) {
        y.value = !0;
        const p = {
          ...l,
          drawOptions: X.value
        };
        c.value.setReplayData(a, p), console.log("startReplay调用，自动播放:", l == null ? void 0 : l.autoPlay), (l == null ? void 0 : l.autoPlay) === !0 && c.value.play();
      }
    }, oe = (a) => {
      y.value = a, !a && c.value && (c.value.stop(), S());
    }, _e = () => q(i.value) ? null : Ge(i.value), ne = () => {
      console.log("play方法被调用"), console.log("回放控制器是否存在:", !!c.value), c.value || (console.log("回放控制器不存在，尝试初始化"), A()), c.value ? (console.log("调用回放控制器的play方法"), c.value.play()) : console.error("回放控制器初始化失败，无法播放");
    }, se = () => {
      var a;
      (a = c.value) == null || a.pause();
    }, ie = () => {
      var a;
      (a = c.value) == null || a.stop();
    }, le = (a) => {
      var l;
      (l = c.value) == null || l.seek(a);
    }, re = (a) => {
      var l;
      (l = c.value) == null || l.setSpeed(a);
    }, Re = () => {
      var a;
      return ((a = c.value) == null ? void 0 : a.getState()) || "idle";
    }, Ee = () => {
      var a;
      return ((a = c.value) == null ? void 0 : a.getCurrentTime()) || 0;
    }, Y = () => {
      var a;
      return ((a = c.value) == null ? void 0 : a.getTotalDuration()) || 0;
    }, Ie = () => {
      var a;
      return ((a = c.value) == null ? void 0 : a.getProgress()) || 0;
    }, ue = (a) => {
      const l = Math.floor(a / 1e3), p = Math.floor(l / 60), x = l % 60;
      return `${p}:${x.toString().padStart(2, "0")}`;
    }, he = () => {
      D.value && (i.value = z(M.value, C.value), S(), O(), s("signature-clear"));
    }, ce = () => {
      !N.value || !D.value || (g.value--, i.value = E(d.value[g.value]), S(), s("signature-undo", i.value));
    }, de = () => {
      !J.value || !D.value || (g.value++, i.value = E(d.value[g.value]), S(), s("signature-redo", i.value));
    }, pe = (a) => {
      const l = r.value;
      return Je(l, i.value, a);
    }, ge = () => q(i.value), me = async (a) => {
      if (!D.value)
        return;
      const l = r.value;
      await je(l, a), i.value = z(M.value, C.value), i.value.isEmpty = !1, O();
    }, $e = () => E(i.value), Oe = (a) => {
      D.value && (i.value = E(a), S(), O());
    }, ve = (a, l) => {
      const p = a || M.value, x = l || C.value, w = pe({ format: "png" });
      B(() => {
        const b = r.value;
        b.width = p, b.height = x, ge() || me(w), te();
      });
    }, Ae = () => {
      const a = r.value;
      a.width = M.value, a.height = C.value, i.value = z(M.value, C.value), d.value = [E(i.value)], g.value = 0, S();
    };
    return F([() => t.width, () => t.height], () => {
      B(() => {
        r.value && ve();
      });
    }), F(() => t.replayMode, (a) => {
      a !== void 0 && oe(a);
    }), F(() => t.replayData, (a) => {
      if (console.log("watch监听到回放数据变化:", a), console.log("当前回放模式:", t.replayMode), console.log("回放控制器是否存在:", !!c.value), a && t.replayMode)
        if (c.value || (console.log("回放控制器未初始化，先初始化"), A()), c.value) {
          console.log("开始设置回放数据到控制器");
          const l = {
            ...t.replayOptions,
            drawOptions: X.value
          };
          c.value.setReplayData(a, l), console.log("回放数据已更新:", a);
        } else
          console.error("回放控制器初始化失败");
      else
        a || console.log("回放数据为空，跳过设置"), t.replayMode || console.log("不在回放模式，跳过设置");
    }, { immediate: !0 }), Ye(() => {
      B(() => {
        Ae(), A(), t.replayMode && t.replayData && ae(t.replayData, t.replayOptions);
      });
    }), Fe(() => {
      c.value && (c.value.destroy(), c.value = null);
    }), e({
      clear: he,
      undo: ce,
      redo: de,
      save: pe,
      isEmpty: ge,
      fromDataURL: me,
      getSignatureData: $e,
      setSignatureData: Oe,
      resize: ve,
      // 回放相关方法
      startReplay: ae,
      getReplayData: _e,
      setReplayMode: oe,
      play: ne,
      pause: se,
      stop: ie,
      seek: le,
      setSpeed: re,
      getState: Re,
      getCurrentTime: Ee,
      getTotalDuration: Y,
      getProgress: Ie
    }), (a, l) => (_(), R("div", {
      class: "electronic-signature",
      style: U(xe.value)
    }, [
      v("canvas", {
        ref_key: "canvasRef",
        ref: r,
        width: M.value,
        height: C.value,
        style: U(we.value),
        onMousedown: Me,
        onMousemove: De,
        onMouseup: Z,
        onMouseleave: Z,
        onTouchstart: Se,
        onTouchmove: We,
        onTouchend: ee,
        onTouchcancel: ee
      }, null, 44, et),
      ke.value ? (_(), R("div", {
        key: 0,
        class: "signature-placeholder",
        style: U(Te.value)
      }, H(a.placeholder), 5)) : L("", !0),
      a.showToolbar ? (_(), R("div", tt, [
        v("button", {
          onClick: he,
          disabled: !D.value
        }, "清除", 8, at),
        v("button", {
          onClick: ce,
          disabled: !D.value || !N.value
        }, "撤销", 8, ot),
        v("button", {
          onClick: de,
          disabled: !D.value || !J.value
        }, "重做", 8, nt)
      ])) : L("", !0),
      Ce.value ? (_(), R("div", st, [
        v("div", it, [
          v("button", {
            onClick: l[0] || (l[0] = (p) => m.value === "playing" ? se() : ne()),
            disabled: m.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            m.value === "playing" ? (_(), R("span", rt, "⏸️")) : (_(), R("span", ut, "▶️"))
          ], 8, lt),
          v("button", {
            onClick: l[1] || (l[1] = (p) => ie()),
            disabled: m.value === "idle",
            class: "replay-btn stop-btn"
          }, " ⏹️ ", 8, ht)
        ]),
        v("div", ct, [
          v("input", {
            type: "range",
            min: "0",
            max: Y(),
            value: W.value,
            onInput: l[2] || (l[2] = (p) => le(Number(p.target.value))),
            class: "progress-slider",
            disabled: m.value === "idle"
          }, null, 40, dt),
          v("div", pt, [
            v("span", null, H(ue(W.value)), 1),
            l[4] || (l[4] = v("span", null, "/", -1)),
            v("span", null, H(ue(Y())), 1)
          ])
        ]),
        v("div", gt, [
          l[6] || (l[6] = v("label", null, "速度:", -1)),
          v("select", {
            onChange: l[3] || (l[3] = (p) => re(Number(p.target.value))),
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
      ])) : L("", !0)
    ], 4));
  }
});
const vt = (n, e) => {
  const o = n.__vccOpts || n;
  for (const [t, s] of e)
    o[t] = s;
  return o;
}, fe = /* @__PURE__ */ vt(mt, [["__scopeId", "data-v-537b6f9f"]]);
function yt() {
  return window.devicePixelRatio || 1;
}
function kt(n) {
  const e = n.getContext("2d"), o = yt(), t = n.clientWidth, s = n.clientHeight;
  return n.width = t * o, n.height = s * o, e.scale(o, o), n.style.width = t + "px", n.style.height = s + "px", e;
}
function ft(n) {
  if (n.paths.length === 0)
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0
    };
  let e = 1 / 0, o = 1 / 0, t = -1 / 0, s = -1 / 0;
  return n.paths.forEach((r) => {
    r.points.forEach((h) => {
      e = Math.min(e, h.x), o = Math.min(o, h.y), t = Math.max(t, h.x), s = Math.max(s, h.y);
    });
  }), {
    minX: e,
    minY: o,
    maxX: t,
    maxY: s,
    width: t - e,
    height: s - o
  };
}
function Ct(n, e, o = 10) {
  const t = ft(e);
  if (t.width === 0 || t.height === 0) {
    const i = document.createElement("canvas");
    return i.width = 1, i.height = 1, i;
  }
  const s = document.createElement("canvas"), r = s.getContext("2d"), h = t.width + o * 2, u = t.height + o * 2;
  return s.width = h, s.height = u, r.drawImage(
    n,
    t.minX - o,
    t.minY - o,
    h,
    u,
    0,
    0,
    h,
    u
  ), s;
}
function bt(n, e, o, t = !0) {
  const s = document.createElement("canvas"), r = s.getContext("2d");
  let h = e, u = o;
  if (t) {
    const i = n.width / n.height, d = e / o;
    i > d ? u = e / i : h = o * i;
  }
  return s.width = h, s.height = u, r.imageSmoothingEnabled = !0, r.imageSmoothingQuality = "high", r.drawImage(n, 0, 0, h, u), s;
}
function Pt(n, e, o = {}) {
  const {
    fontSize: t = 12,
    fontFamily: s = "Arial",
    color: r = "#999",
    opacity: h = 0.5,
    position: u = "bottom-right"
  } = o, i = document.createElement("canvas"), d = i.getContext("2d");
  i.width = n.width, i.height = n.height, d.drawImage(n, 0, 0), d.font = `${t}px ${s}`, d.fillStyle = r, d.globalAlpha = h;
  const c = d.measureText(e).width, y = t;
  let m, f;
  switch (u) {
    case "top-left":
      m = 10, f = y + 10;
      break;
    case "top-right":
      m = n.width - c - 10, f = y + 10;
      break;
    case "bottom-left":
      m = 10, f = n.height - 10;
      break;
    case "bottom-right":
      m = n.width - c - 10, f = n.height - 10;
      break;
    case "center":
      m = (n.width - c) / 2, f = (n.height + y) / 2;
      break;
    default:
      m = n.width - c - 10, f = n.height - 10;
  }
  return d.fillText(e, m, f), d.globalAlpha = 1, i;
}
function Mt(n) {
  const e = document.createElement("canvas"), o = e.getContext("2d");
  e.width = n.width, e.height = n.height, o.drawImage(n, 0, 0);
  const t = o.getImageData(0, 0, n.width, n.height), s = t.data;
  for (let r = 0; r < s.length; r += 4) {
    const h = s[r] * 0.299 + s[r + 1] * 0.587 + s[r + 2] * 0.114;
    s[r] = h, s[r + 1] = h, s[r + 2] = h;
  }
  return o.putImageData(t, 0, 0), e;
}
const xt = (n) => {
  n.component("ElectronicSignature", fe);
}, Dt = {
  install: xt,
  ElectronicSignature: fe
}, St = "1.0.0";
export {
  fe as ElectronicSignature,
  Ve as SignatureReplayController,
  Pt as addWatermark,
  He as calculateStrokeWidth,
  E as cloneSignatureData,
  Mt as convertToGrayscale,
  z as createEmptySignatureData,
  Ge as createReplayData,
  Ct as cropSignature,
  Dt as default,
  Le as drawSmoothPath,
  Je as exportSignature,
  Be as getAngle,
  Ue as getControlPoint,
  yt as getDevicePixelRatio,
  ye as getDistance,
  ft as getSignatureBounds,
  q as isSignatureEmpty,
  je as loadImageToCanvas,
  bt as resizeSignature,
  kt as setupHighDPICanvas,
  Ne as signatureToSVG,
  St as version
};
