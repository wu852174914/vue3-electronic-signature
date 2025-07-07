var Ye = Object.defineProperty;
var ze = (a, e, o) => e in a ? Ye(a, e, { enumerable: !0, configurable: !0, writable: !0, value: o }) : a[e] = o;
var k = (a, e, o) => (ze(a, typeof e != "symbol" ? e + "" : e, o), o);
import { defineComponent as Xe, ref as P, computed as C, watch as z, nextTick as X, onMounted as Be, onUnmounted as Le, openBlock as E, createElementBlock as I, normalizeStyle as B, createElementVNode as y, toDisplayString as L, createCommentVNode as U } from "vue";
function xe(a, e) {
  return Math.sqrt(
    Math.pow(e.x - a.x, 2) + Math.pow(e.y - a.y, 2)
  );
}
function Ue(a, e) {
  return Math.atan2(e.y - a.y, e.x - a.x);
}
function He(a, e, o, n) {
  const s = e || a, l = o || a, h = 0.2, u = Ue(s, l) * (n ? 1 : -1), r = xe(s, l) * h;
  return {
    x: a.x + Math.cos(u) * r,
    y: a.y + Math.sin(u) * r,
    time: a.time
  };
}
function Ne(a, e, o) {
  if (!o.pressure.enabled)
    return o.strokeWidth;
  const n = xe(a, e), s = e.time - a.time, l = s > 0 ? n / s : 0, h = Math.max(0.1, Math.min(1, 1 - l * 0.01)), { min: u, max: r } = o.pressure;
  return u + (r - u) * h;
}
function St(a, e, o) {
  if (e.length < 2)
    return;
  if (a.strokeStyle = o.strokeColor, a.lineCap = "round", a.lineJoin = "round", !o.smoothing || e.length < 3) {
    a.beginPath(), a.lineWidth = o.strokeWidth, a.moveTo(e[0].x, e[0].y);
    for (let s = 1; s < e.length; s++)
      a.lineTo(e[s].x, e[s].y);
    a.stroke();
    return;
  }
  a.beginPath(), a.moveTo(e[0].x, e[0].y);
  for (let s = 1; s < e.length - 1; s++) {
    const l = e[s], h = e[s + 1];
    o.pressure.enabled ? a.lineWidth = Ne(e[s - 1], l, o) : a.lineWidth = o.strokeWidth;
    const u = He(l, e[s - 1], h);
    a.quadraticCurveTo(u.x, u.y, l.x, l.y);
  }
  const n = e[e.length - 1];
  a.lineTo(n.x, n.y), a.stroke();
}
function je(a) {
  const { canvasSize: e, paths: o } = a;
  let n = `<svg width="${e.width}" height="${e.height}" xmlns="http://www.w3.org/2000/svg">`;
  return o.forEach((s) => {
    if (s.points.length < 2)
      return;
    let l = `M ${s.points[0].x} ${s.points[0].y}`;
    for (let h = 1; h < s.points.length; h++)
      l += ` L ${s.points[h].x} ${s.points[h].y}`;
    n += `<path d="${l}" stroke="${s.strokeColor}" stroke-width="${s.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), n += "</svg>", n;
}
function Ge(a, e, o = { format: "png" }) {
  const { format: n, quality: s = 0.9, size: l, backgroundColor: h } = o;
  if (n === "svg")
    return je(e);
  const u = document.createElement("canvas"), r = u.getContext("2d");
  if (l) {
    u.width = l.width, u.height = l.height;
    const p = l.width / a.width, m = l.height / a.height;
    r.scale(p, m);
  } else
    u.width = a.width, u.height = a.height;
  switch (h && h !== "transparent" && (r.fillStyle = h, r.fillRect(0, 0, u.width, u.height)), r.drawImage(a, 0, 0), n) {
    case "jpeg":
      return u.toDataURL("image/jpeg", s);
    case "base64":
      return u.toDataURL("image/png").split(",")[1];
    case "png":
    default:
      return u.toDataURL("image/png");
  }
}
function Ve(a, e) {
  return new Promise((o, n) => {
    const s = new Image();
    s.onload = () => {
      const l = a.getContext("2d");
      l.clearRect(0, 0, a.width, a.height), l.drawImage(s, 0, 0, a.width, a.height), o();
    }, s.onerror = n, s.src = e;
  });
}
function q(a) {
  return a.paths.length === 0 || a.paths.every((e) => e.points.length === 0);
}
function F(a, e) {
  return {
    paths: [],
    canvasSize: { width: a, height: e },
    timestamp: Date.now(),
    isEmpty: !0
  };
}
function O(a) {
  return JSON.parse(JSON.stringify(a));
}
class Qe {
  constructor(e) {
    k(this, "canvas");
    k(this, "ctx");
    k(this, "replayData", null);
    k(this, "state", "idle");
    k(this, "currentTime", 0);
    k(this, "speed", 1);
    k(this, "animationId", null);
    k(this, "startTimestamp", 0);
    k(this, "pausedTime", 0);
    k(this, "options", {});
    // 事件回调
    k(this, "eventCallbacks", /* @__PURE__ */ new Map());
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
    for (let n = 0; n < this.replayData.paths.length; n++) {
      const s = this.replayData.paths[n], l = s.startTime || 0, h = s.endTime || l + (s.duration || 0);
      if (e < l)
        break;
      if (e >= h) {
        this.drawCompletePath(s), !o && Math.abs(e - h) < 32 && this.emit("replay-path-end", n, s);
        continue;
      }
      o = !0;
      const u = Math.max(0, Math.min(1, (e - l) / Math.max(h - l, 1)));
      u > 0 && Math.abs(e - l) < 32 && this.emit("replay-path-start", n, s), this.drawPartialPath(s, u);
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
    const n = e.startTime || 0, s = e.duration || 0, l = n + s * o, h = this.getPointsUpToTime(e.points, n, l);
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
  getPointsUpToTime(e, o, n) {
    const s = [];
    for (let l = 0; l < e.length; l++) {
      const h = e[l], u = o + (h.relativeTime || l * 50);
      if (u <= n)
        s.push(h);
      else {
        if (l > 0) {
          const r = e[l - 1], p = o + (r.relativeTime || (l - 1) * 50);
          if (p <= n) {
            const m = (n - p) / (u - p), d = {
              x: r.x + (h.x - r.x) * m,
              y: r.y + (h.y - r.y) * m,
              time: n,
              pressure: r.pressure ? r.pressure + (h.pressure || r.pressure - r.pressure) * m : h.pressure
            };
            s.push(d);
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
      const l = e[s], h = e[s + 1];
      this.ctx.lineWidth = o.strokeWidth;
      const u = this.getControlPoint(l, e[s - 1], h);
      this.ctx.quadraticCurveTo(u.x, u.y, l.x, l.y);
    }
    const n = e[e.length - 1];
    this.ctx.lineTo(n.x, n.y), this.ctx.stroke();
  }
  /**
   * 获取控制点（用于贝塞尔曲线平滑） - 与signature.ts中的实现一致
   */
  getControlPoint(e, o, n) {
    const l = {
      length: Math.sqrt(Math.pow(n.x - o.x, 2) + Math.pow(n.y - o.y, 2)),
      angle: Math.atan2(n.y - o.y, n.x - o.x)
    }, h = l.angle + Math.PI, u = l.length * 0.2;
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
        const n = this.eventCallbacks.get(e), s = n.indexOf(o);
        s > -1 && n.splice(s, 1);
      } else
        this.eventCallbacks.delete(e);
  }
  /**
   * 触发事件
   */
  emit(e, ...o) {
    const n = this.eventCallbacks.get(e);
    n && n.forEach((s) => s(...o));
  }
  /**
   * 销毁控制器
   */
  destroy() {
    this.stop(), this.eventCallbacks.clear(), this.replayData = null;
  }
}
function Ke(a) {
  const e = a.paths.map((r) => {
    const p = r.points.map((d, w) => {
      var T;
      let v;
      if (d.time && r.points[0].time)
        v = d.time - r.points[0].time;
      else if (w === 0)
        v = 0;
      else {
        const _ = r.points[w - 1], b = Math.sqrt(
          Math.pow(d.x - _.x, 2) + Math.pow(d.y - _.y, 2)
        ) / 100 * 1e3;
        v = (((T = p[w - 1]) == null ? void 0 : T.relativeTime) || 0) + Math.max(b, 16);
      }
      return {
        ...d,
        relativeTime: v
      };
    }), m = p.length > 0 ? p[p.length - 1].relativeTime : 0;
    return {
      ...r,
      points: p,
      duration: m
    };
  }), o = [];
  for (let r = 0; r < e.length; r++) {
    const p = e[r];
    let m;
    if (r === 0)
      m = 0;
    else {
      const v = o[r - 1], T = Ze(
        a.paths[r - 1].points,
        a.paths[r].points
      );
      m = v.endTime + T;
    }
    const d = m + p.duration, w = {
      ...p,
      startTime: m,
      endTime: d
    };
    console.log(`路径 ${r}: 开始时间=${m}, 结束时间=${d}, 持续时间=${p.duration}`), o.push(w);
  }
  const n = o.length > 0 ? o[o.length - 1].endTime : 0;
  console.log("回放数据生成完成:"), console.log("- 路径数量:", o.length), console.log("- 总时长:", n), console.log("- 路径详情:", o.map((r) => ({
    startTime: r.startTime,
    endTime: r.endTime,
    duration: r.duration,
    pointCount: r.points.length
  })));
  const s = o.reduce((r, p) => r + tt(p.points), 0), l = n > 0 ? s / (n / 1e3) : 0, h = o.slice(1).map((r, p) => {
    const m = o[p];
    return r.startTime - m.endTime;
  }), u = h.length > 0 ? h.reduce((r, p) => r + p, 0) / h.length : 0;
  return {
    paths: o,
    totalDuration: n,
    speed: 1,
    metadata: {
      deviceType: et(a),
      averageSpeed: l,
      totalDistance: s,
      averagePauseTime: u
    }
  };
}
function Ze(a, e) {
  if (a.length === 0 || e.length === 0)
    return 200;
  const o = a[a.length - 1], n = e[0];
  if (o.time && n.time)
    return Math.max(n.time - o.time, 50);
  const s = Math.sqrt(
    Math.pow(n.x - o.x, 2) + Math.pow(n.y - o.y, 2)
  );
  return Math.min(Math.max(s * 2, 100), 1e3);
}
function et(a) {
  const e = a.paths.reduce((l, h) => l + h.points.length, 0), o = a.paths.length;
  if (e === 0)
    return "touch";
  const n = e / o;
  return n > 20 ? "touch" : n < 10 ? "mouse" : a.paths.some(
    (l) => l.points.some((h) => h.pressure !== void 0)
  ) ? "pen" : "touch";
}
function tt(a) {
  let e = 0;
  for (let o = 1; o < a.length; o++) {
    const n = a[o].x - a[o - 1].x, s = a[o].y - a[o - 1].y;
    e += Math.sqrt(n * n + s * s);
  }
  return e;
}
const we = {
  pen: {
    name: "钢笔",
    description: "细线条，高精度，适合正式签名",
    strokeWidth: 1.5,
    smoothing: !0,
    pressure: {
      enabled: !1,
      min: 1,
      max: 2
    },
    lineCap: "round",
    lineJoin: "round",
    recommendedColor: "#000080"
  },
  brush: {
    name: "毛笔",
    description: "压感变化，粗细不均，艺术感强",
    strokeWidth: 4,
    smoothing: !0,
    pressure: {
      enabled: !0,
      min: 2,
      max: 8
    },
    lineCap: "round",
    lineJoin: "round",
    recommendedColor: "#2c3e50"
  },
  marker: {
    name: "马克笔",
    description: "粗线条，均匀宽度，醒目清晰",
    strokeWidth: 5,
    smoothing: !0,
    pressure: {
      enabled: !1,
      min: 4,
      max: 6
    },
    lineCap: "round",
    lineJoin: "round",
    recommendedColor: "#e74c3c"
  },
  pencil: {
    name: "铅笔",
    description: "中等粗细，略有纹理，自然感强",
    strokeWidth: 2,
    smoothing: !1,
    pressure: {
      enabled: !0,
      min: 1.5,
      max: 3
    },
    lineCap: "round",
    lineJoin: "round",
    recommendedColor: "#7f8c8d"
  },
  ballpoint: {
    name: "圆珠笔",
    description: "细线条，轻微变化，日常书写",
    strokeWidth: 1,
    smoothing: !0,
    pressure: {
      enabled: !0,
      min: 0.8,
      max: 1.5
    },
    lineCap: "round",
    lineJoin: "round",
    recommendedColor: "#3498db"
  }
};
function nt(a) {
  return we[a];
}
function Mt() {
  return Object.entries(we).map(([a, e]) => ({
    key: a,
    config: e
  }));
}
function ot(a, e) {
  const o = nt(a);
  return {
    strokeWidth: o.strokeWidth,
    smoothing: o.smoothing,
    pressure: o.pressure,
    lineCap: o.lineCap,
    lineJoin: o.lineJoin,
    strokeColor: e || o.recommendedColor || "#000000"
  };
}
const at = ["width", "height"], st = {
  key: 1,
  class: "signature-toolbar"
}, it = ["disabled"], rt = ["disabled"], lt = ["disabled"], ut = {
  key: 2,
  class: "replay-controls"
}, ht = { class: "replay-buttons" }, ct = ["disabled"], dt = { key: 0 }, pt = { key: 1 }, mt = ["disabled"], gt = { class: "replay-progress" }, vt = ["max", "value", "disabled"], yt = { class: "time-display" }, ft = { class: "replay-speed" }, xt = /* @__PURE__ */ Xe({
  __name: "ElectronicSignature",
  props: {
    showToolbar: { type: Boolean, default: !1 },
    width: { default: "100%" },
    height: { default: 300 },
    penStyle: { default: "pen" },
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
  setup(a, { expose: e, emit: o }) {
    const n = a, s = o, l = P(), h = P(!1), u = P(null), r = P(F(0, 0)), p = P([]), m = P(-1), d = P(null), w = P(!1), v = P("idle"), T = P(0), _ = P(0), S = C(() => typeof n.width == "number" ? n.width : 800), b = C(() => typeof n.height == "number" ? n.height : 300), ke = C(() => ({
      position: "relative",
      display: "inline-block",
      width: typeof n.width == "string" ? n.width : `${n.width}px`,
      height: typeof n.height == "string" ? n.height : `${n.height}px`
    })), Ce = C(() => ({
      border: n.borderStyle,
      borderRadius: n.borderRadius,
      backgroundColor: n.backgroundColor,
      cursor: n.disabled ? "not-allowed" : "crosshair",
      display: "block",
      width: "100%",
      height: "100%"
    })), be = C(() => ({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "#999",
      fontSize: "14px",
      pointerEvents: "none",
      userSelect: "none"
    })), Pe = C(() => w.value ? !1 : n.placeholder && q(r.value)), H = C(() => m.value > 0), N = C(() => m.value < p.value.length - 1), j = C(() => w.value && d.value), M = C(() => !j.value && !n.disabled), Se = C(() => {
      var t;
      return j.value && ((t = n.replayOptions) == null ? void 0 : t.showControls) !== !1;
    }), R = C(() => {
      if (n.penStyle) {
        const t = ot(n.penStyle, n.strokeColor);
        return {
          strokeColor: t.strokeColor,
          strokeWidth: n.strokeWidth || t.strokeWidth,
          smoothing: n.smoothing !== void 0 ? n.smoothing : t.smoothing,
          pressure: {
            enabled: n.pressureSensitive !== void 0 ? n.pressureSensitive : t.pressure.enabled,
            min: n.minStrokeWidth || t.pressure.min,
            max: n.maxStrokeWidth || t.pressure.max
          },
          lineCap: t.lineCap,
          lineJoin: t.lineJoin
        };
      }
      return {
        strokeColor: n.strokeColor || "#000000",
        strokeWidth: n.strokeWidth || 2,
        smoothing: n.smoothing !== void 0 ? n.smoothing : !0,
        pressure: {
          enabled: n.pressureSensitive || !1,
          min: n.minStrokeWidth || 1,
          max: n.maxStrokeWidth || 4
        },
        lineCap: "round",
        lineJoin: "round"
      };
    }), G = () => {
      var t;
      return ((t = l.value) == null ? void 0 : t.getContext("2d")) || null;
    }, $ = (t, i) => {
      const c = l.value, g = c.getBoundingClientRect(), f = c.width / g.width, x = c.height / g.height;
      return {
        x: (t - g.left) * f,
        y: (i - g.top) * x,
        time: Date.now()
      };
    }, V = (t) => {
      if (!M.value)
        return;
      h.value = !0;
      const i = performance.now(), c = { ...t, time: i };
      u.value = {
        points: [c],
        strokeColor: n.strokeColor,
        strokeWidth: n.strokeWidth,
        startTime: i,
        endTime: i,
        duration: 0
      }, s("signature-start");
    }, Me = () => {
      if (!u.value || u.value.points.length < 2)
        return;
      const t = G();
      if (!t)
        return;
      const i = u.value.points, c = i.length;
      if (t.strokeStyle = u.value.strokeColor, t.lineWidth = u.value.strokeWidth, t.lineCap = R.value.lineCap || "round", t.lineJoin = R.value.lineJoin || "round", c === 2)
        t.beginPath(), t.moveTo(i[0].x, i[0].y), t.lineTo(i[1].x, i[1].y), t.stroke();
      else if (c >= 3) {
        const g = i[c - 3], f = i[c - 2], x = i[c - 1];
        if (t.beginPath(), n.smoothing) {
          t.moveTo(g.x, g.y);
          const W = Q(f, g, x);
          t.quadraticCurveTo(W.x, W.y, f.x, f.y);
        } else
          t.moveTo(f.x, f.y), t.lineTo(x.x, x.y);
        t.stroke();
      }
    }, Q = (t, i, c) => {
      const f = {
        length: Math.sqrt(Math.pow(c.x - i.x, 2) + Math.pow(c.y - i.y, 2)),
        angle: Math.atan2(c.y - i.y, c.x - i.x)
      }, x = f.angle + Math.PI, W = f.length * 0.2;
      return {
        x: t.x + Math.cos(x) * W,
        y: t.y + Math.sin(x) * W,
        time: t.time || 0
      };
    }, De = (t, i) => {
      if (i.points.length < 2)
        return;
      t.strokeStyle = i.strokeColor, t.lineWidth = i.strokeWidth, t.lineCap = R.value.lineCap || "round", t.lineJoin = R.value.lineJoin || "round";
      const c = i.points;
      if (c.length === 2) {
        t.beginPath(), t.moveTo(c[0].x, c[0].y), t.lineTo(c[1].x, c[1].y), t.stroke();
        return;
      }
      if (!n.smoothing) {
        t.beginPath(), t.moveTo(c[0].x, c[0].y);
        for (let g = 1; g < c.length; g++)
          t.lineTo(c[g].x, c[g].y);
        t.stroke();
        return;
      }
      t.beginPath(), t.moveTo(c[0].x, c[0].y), c.length >= 3 && t.lineTo(c[1].x, c[1].y);
      for (let g = 1; g < c.length - 1; g++) {
        const f = c[g - 1], x = c[g], W = c[g + 1], fe = Q(x, f, W);
        t.quadraticCurveTo(fe.x, fe.y, x.x, x.y);
      }
      if (c.length >= 3) {
        const g = c[c.length - 1], f = c[c.length - 2];
        t.quadraticCurveTo(f.x, f.y, g.x, g.y);
      }
      t.stroke();
    }, K = (t) => {
      if (!h.value || !u.value || !M.value)
        return;
      const i = performance.now(), c = { ...t, time: i };
      u.value.points.push(c), u.value.startTime && (u.value.endTime = i, u.value.duration = i - u.value.startTime), Me(), ne(), s("signature-drawing", r.value);
    }, Z = () => {
      if (!(!h.value || !u.value)) {
        if (h.value = !1, u.value.points.length > 0) {
          const t = u.value.points[u.value.points.length - 1];
          t.time && u.value.startTime && (u.value.endTime = t.time, u.value.duration = t.time - u.value.startTime);
        }
        r.value.paths.push(u.value), r.value.isEmpty = !1, r.value.timestamp = Date.now(), J(), D(), u.value = null, s("signature-end", r.value);
      }
    }, We = (t) => {
      t.preventDefault();
      const i = $(t.clientX, t.clientY);
      V(i);
    }, _e = (t) => {
      if (t.preventDefault(), !h.value)
        return;
      const i = $(t.clientX, t.clientY);
      K(i);
    }, ee = (t) => {
      t.preventDefault(), Z();
    }, Re = (t) => {
      if (t.preventDefault(), t.touches.length !== 1)
        return;
      const i = t.touches[0], c = $(i.clientX, i.clientY);
      V(c);
    }, Ee = (t) => {
      if (t.preventDefault(), t.touches.length !== 1 || !h.value)
        return;
      const i = t.touches[0], c = $(i.clientX, i.clientY);
      K(c);
    }, te = (t) => {
      t.preventDefault(), Z();
    }, ne = () => {
      r.value.canvasSize = {
        width: S.value,
        height: b.value
      }, r.value.isEmpty = q(r.value);
    }, J = () => {
      p.value = p.value.slice(0, m.value + 1), p.value.push(O(r.value)), m.value = p.value.length - 1;
      const t = 50;
      p.value.length > t && (p.value = p.value.slice(-t), m.value = p.value.length - 1);
    }, D = () => {
      const t = G();
      t && (t.clearRect(0, 0, S.value, b.value), n.backgroundColor && n.backgroundColor !== "transparent" && (t.fillStyle = n.backgroundColor, t.fillRect(0, 0, S.value, b.value)), r.value.paths.forEach((i) => {
        i.points.length > 0 && De(t, i);
      }));
    }, A = () => {
      if (console.log("初始化回放控制器"), console.log("canvas引用是否存在:", !!l.value), !l.value) {
        console.error("canvas引用不存在，无法初始化回放控制器");
        return;
      }
      d.value && (console.log("销毁现有回放控制器"), d.value.destroy()), console.log("创建新的回放控制器"), d.value = new Qe(l.value), console.log("回放控制器创建成功:", !!d.value), d.value.on("replay-start", () => {
        v.value = "playing", s("replay-start");
      }), d.value.on("replay-progress", (t, i) => {
        T.value = t, _.value = i, s("replay-progress", t, i);
      }), d.value.on("replay-pause", () => {
        v.value = "paused", s("replay-pause");
      }), d.value.on("replay-resume", () => {
        v.value = "playing", s("replay-resume");
      }), d.value.on("replay-stop", () => {
        v.value = "stopped", s("replay-stop");
      }), d.value.on("replay-complete", () => {
        v.value = "completed", s("replay-complete");
      }), d.value.on("replay-path-start", (t, i) => {
        s("replay-path-start", t, i);
      }), d.value.on("replay-path-end", (t, i) => {
        s("replay-path-end", t, i);
      }), d.value.on("replay-speed-change", (t) => {
        s("replay-speed-change", t);
      });
    }, oe = (t, i) => {
      if (d.value || A(), d.value) {
        w.value = !0;
        const c = {
          ...i,
          drawOptions: R.value
        };
        d.value.setReplayData(t, c), console.log("startReplay调用，自动播放:", i == null ? void 0 : i.autoPlay), (i == null ? void 0 : i.autoPlay) === !0 && d.value.play();
      }
    }, ae = (t) => {
      w.value = t, !t && d.value && (d.value.stop(), D());
    }, Ie = () => q(r.value) ? null : Ke(r.value), se = () => {
      console.log("play方法被调用"), console.log("回放控制器是否存在:", !!d.value), d.value || (console.log("回放控制器不存在，尝试初始化"), A()), d.value ? (console.log("调用回放控制器的play方法"), d.value.play()) : console.error("回放控制器初始化失败，无法播放");
    }, ie = () => {
      var t;
      (t = d.value) == null || t.pause();
    }, re = () => {
      var t;
      (t = d.value) == null || t.stop();
    }, le = (t) => {
      var i;
      (i = d.value) == null || i.seek(t);
    }, ue = (t) => {
      var i;
      (i = d.value) == null || i.setSpeed(t);
    }, Oe = () => {
      var t;
      return ((t = d.value) == null ? void 0 : t.getState()) || "idle";
    }, $e = () => {
      var t;
      return ((t = d.value) == null ? void 0 : t.getCurrentTime()) || 0;
    }, Y = () => {
      var t;
      return ((t = d.value) == null ? void 0 : t.getTotalDuration()) || 0;
    }, Je = () => {
      var t;
      return ((t = d.value) == null ? void 0 : t.getProgress()) || 0;
    }, he = (t) => {
      const i = Math.floor(t / 1e3), c = Math.floor(i / 60), g = i % 60;
      return `${c}:${g.toString().padStart(2, "0")}`;
    }, ce = () => {
      M.value && (r.value = F(S.value, b.value), D(), J(), s("signature-clear"));
    }, de = () => {
      !H.value || !M.value || (m.value--, r.value = O(p.value[m.value]), D(), s("signature-undo", r.value));
    }, pe = () => {
      !N.value || !M.value || (m.value++, r.value = O(p.value[m.value]), D(), s("signature-redo", r.value));
    }, me = (t) => {
      const i = l.value;
      return Ge(i, r.value, t);
    }, ge = () => q(r.value), ve = async (t) => {
      if (!M.value)
        return;
      const i = l.value;
      await Ve(i, t), r.value = F(S.value, b.value), r.value.isEmpty = !1, J();
    }, Ae = () => O(r.value), qe = (t) => {
      M.value && (r.value = O(t), D(), J());
    }, ye = (t, i) => {
      const c = t || S.value, g = i || b.value, f = me({ format: "png" });
      X(() => {
        const x = l.value;
        x.width = c, x.height = g, ge() || ve(f), ne();
      });
    }, Fe = () => {
      const t = l.value;
      t.width = S.value, t.height = b.value, r.value = F(S.value, b.value), p.value = [O(r.value)], m.value = 0, D();
    };
    return z([() => n.width, () => n.height], () => {
      X(() => {
        l.value && ye();
      });
    }), z(() => n.replayMode, (t) => {
      t !== void 0 && ae(t);
    }), z(() => n.replayData, (t) => {
      if (console.log("watch监听到回放数据变化:", t), console.log("当前回放模式:", n.replayMode), console.log("回放控制器是否存在:", !!d.value), t && n.replayMode)
        if (d.value || (console.log("回放控制器未初始化，先初始化"), A()), d.value) {
          console.log("开始设置回放数据到控制器");
          const i = {
            ...n.replayOptions,
            drawOptions: R.value
          };
          d.value.setReplayData(t, i), console.log("回放数据已更新:", t);
        } else
          console.error("回放控制器初始化失败");
      else
        t || console.log("回放数据为空，跳过设置"), n.replayMode || console.log("不在回放模式，跳过设置");
    }, { immediate: !0 }), Be(() => {
      X(() => {
        Fe(), A(), n.replayMode && n.replayData && oe(n.replayData, n.replayOptions);
      });
    }), Le(() => {
      d.value && (d.value.destroy(), d.value = null);
    }), e({
      clear: ce,
      undo: de,
      redo: pe,
      save: me,
      isEmpty: ge,
      fromDataURL: ve,
      getSignatureData: Ae,
      setSignatureData: qe,
      resize: ye,
      // 回放相关方法
      startReplay: oe,
      getReplayData: Ie,
      setReplayMode: ae,
      play: se,
      pause: ie,
      stop: re,
      seek: le,
      setSpeed: ue,
      getState: Oe,
      getCurrentTime: $e,
      getTotalDuration: Y,
      getProgress: Je
    }), (t, i) => (E(), I("div", {
      class: "electronic-signature",
      style: B(ke.value)
    }, [
      y("canvas", {
        ref_key: "canvasRef",
        ref: l,
        width: S.value,
        height: b.value,
        style: B(Ce.value),
        onMousedown: We,
        onMousemove: _e,
        onMouseup: ee,
        onMouseleave: ee,
        onTouchstart: Re,
        onTouchmove: Ee,
        onTouchend: te,
        onTouchcancel: te
      }, null, 44, at),
      Pe.value ? (E(), I("div", {
        key: 0,
        class: "signature-placeholder",
        style: B(be.value)
      }, L(t.placeholder), 5)) : U("", !0),
      t.showToolbar ? (E(), I("div", st, [
        y("button", {
          onClick: ce,
          disabled: !M.value
        }, "清除", 8, it),
        y("button", {
          onClick: de,
          disabled: !M.value || !H.value
        }, "撤销", 8, rt),
        y("button", {
          onClick: pe,
          disabled: !M.value || !N.value
        }, "重做", 8, lt)
      ])) : U("", !0),
      Se.value ? (E(), I("div", ut, [
        y("div", ht, [
          y("button", {
            onClick: i[0] || (i[0] = (c) => v.value === "playing" ? ie() : se()),
            disabled: v.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            v.value === "playing" ? (E(), I("span", dt, "⏸️")) : (E(), I("span", pt, "▶️"))
          ], 8, ct),
          y("button", {
            onClick: i[1] || (i[1] = (c) => re()),
            disabled: v.value === "idle",
            class: "replay-btn stop-btn"
          }, " ⏹️ ", 8, mt)
        ]),
        y("div", gt, [
          y("input", {
            type: "range",
            min: "0",
            max: Y(),
            value: _.value,
            onInput: i[2] || (i[2] = (c) => le(Number(c.target.value))),
            class: "progress-slider",
            disabled: v.value === "idle"
          }, null, 40, vt),
          y("div", yt, [
            y("span", null, L(he(_.value)), 1),
            i[4] || (i[4] = y("span", null, "/", -1)),
            y("span", null, L(he(Y())), 1)
          ])
        ]),
        y("div", ft, [
          i[6] || (i[6] = y("label", null, "速度:", -1)),
          y("select", {
            onChange: i[3] || (i[3] = (c) => ue(Number(c.target.value))),
            class: "speed-select"
          }, i[5] || (i[5] = [
            y("option", { value: "0.5" }, "0.5x", -1),
            y("option", {
              value: "1",
              selected: ""
            }, "1x", -1),
            y("option", { value: "1.5" }, "1.5x", -1),
            y("option", { value: "2" }, "2x", -1)
          ]), 32)
        ])
      ])) : U("", !0)
    ], 4));
  }
});
const wt = (a, e) => {
  const o = a.__vccOpts || a;
  for (const [n, s] of e)
    o[n] = s;
  return o;
}, Te = /* @__PURE__ */ wt(xt, [["__scopeId", "data-v-8c5b2327"]]);
function Tt() {
  return window.devicePixelRatio || 1;
}
function Dt(a) {
  const e = a.getContext("2d"), o = Tt(), n = a.clientWidth, s = a.clientHeight;
  return a.width = n * o, a.height = s * o, e.scale(o, o), a.style.width = n + "px", a.style.height = s + "px", e;
}
function kt(a) {
  if (a.paths.length === 0)
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0
    };
  let e = 1 / 0, o = 1 / 0, n = -1 / 0, s = -1 / 0;
  return a.paths.forEach((l) => {
    l.points.forEach((h) => {
      e = Math.min(e, h.x), o = Math.min(o, h.y), n = Math.max(n, h.x), s = Math.max(s, h.y);
    });
  }), {
    minX: e,
    minY: o,
    maxX: n,
    maxY: s,
    width: n - e,
    height: s - o
  };
}
function Wt(a, e, o = 10) {
  const n = kt(e);
  if (n.width === 0 || n.height === 0) {
    const r = document.createElement("canvas");
    return r.width = 1, r.height = 1, r;
  }
  const s = document.createElement("canvas"), l = s.getContext("2d"), h = n.width + o * 2, u = n.height + o * 2;
  return s.width = h, s.height = u, l.drawImage(
    a,
    n.minX - o,
    n.minY - o,
    h,
    u,
    0,
    0,
    h,
    u
  ), s;
}
function _t(a, e, o, n = !0) {
  const s = document.createElement("canvas"), l = s.getContext("2d");
  let h = e, u = o;
  if (n) {
    const r = a.width / a.height, p = e / o;
    r > p ? u = e / r : h = o * r;
  }
  return s.width = h, s.height = u, l.imageSmoothingEnabled = !0, l.imageSmoothingQuality = "high", l.drawImage(a, 0, 0, h, u), s;
}
function Rt(a, e, o = {}) {
  const {
    fontSize: n = 12,
    fontFamily: s = "Arial",
    color: l = "#999",
    opacity: h = 0.5,
    position: u = "bottom-right"
  } = o, r = document.createElement("canvas"), p = r.getContext("2d");
  r.width = a.width, r.height = a.height, p.drawImage(a, 0, 0), p.font = `${n}px ${s}`, p.fillStyle = l, p.globalAlpha = h;
  const d = p.measureText(e).width, w = n;
  let v, T;
  switch (u) {
    case "top-left":
      v = 10, T = w + 10;
      break;
    case "top-right":
      v = a.width - d - 10, T = w + 10;
      break;
    case "bottom-left":
      v = 10, T = a.height - 10;
      break;
    case "bottom-right":
      v = a.width - d - 10, T = a.height - 10;
      break;
    case "center":
      v = (a.width - d) / 2, T = (a.height + w) / 2;
      break;
    default:
      v = a.width - d - 10, T = a.height - 10;
  }
  return p.fillText(e, v, T), p.globalAlpha = 1, r;
}
function Et(a) {
  const e = document.createElement("canvas"), o = e.getContext("2d");
  e.width = a.width, e.height = a.height, o.drawImage(a, 0, 0);
  const n = o.getImageData(0, 0, a.width, a.height), s = n.data;
  for (let l = 0; l < s.length; l += 4) {
    const h = s[l] * 0.299 + s[l + 1] * 0.587 + s[l + 2] * 0.114;
    s[l] = h, s[l + 1] = h, s[l + 2] = h;
  }
  return o.putImageData(n, 0, 0), e;
}
const Ct = (a) => {
  a.component("ElectronicSignature", Te);
}, It = {
  install: Ct,
  ElectronicSignature: Te
}, Ot = "1.0.0";
export {
  Te as ElectronicSignature,
  we as PEN_STYLE_CONFIGS,
  Qe as SignatureReplayController,
  Rt as addWatermark,
  Ne as calculateStrokeWidth,
  O as cloneSignatureData,
  Et as convertToGrayscale,
  ot as createDrawOptionsFromPenStyle,
  F as createEmptySignatureData,
  Ke as createReplayData,
  Wt as cropSignature,
  It as default,
  St as drawSmoothPath,
  Ge as exportSignature,
  Mt as getAllPenStyles,
  Ue as getAngle,
  He as getControlPoint,
  Tt as getDevicePixelRatio,
  xe as getDistance,
  nt as getPenStyleConfig,
  kt as getSignatureBounds,
  q as isSignatureEmpty,
  Ve as loadImageToCanvas,
  _t as resizeSignature,
  Dt as setupHighDPICanvas,
  je as signatureToSVG,
  Ot as version
};
