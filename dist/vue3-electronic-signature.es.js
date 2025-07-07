var Xe = Object.defineProperty;
var Ye = (n, e, a) => e in n ? Xe(n, e, { enumerable: !0, configurable: !0, writable: !0, value: a }) : n[e] = a;
var k = (n, e, a) => (Ye(n, typeof e != "symbol" ? e + "" : e, a), a);
import { defineComponent as Fe, ref as P, computed as C, watch as Y, nextTick as F, onMounted as Be, onUnmounted as Ue, openBlock as R, createElementBlock as E, normalizeStyle as B, createElementVNode as y, toDisplayString as U, createCommentVNode as H } from "vue";
function we(n, e) {
  return Math.sqrt(
    Math.pow(e.x - n.x, 2) + Math.pow(e.y - n.y, 2)
  );
}
function He(n, e) {
  return Math.atan2(e.y - n.y, e.x - n.x);
}
function Le(n, e, a, o) {
  const s = e || n, r = a || n, h = 0.2, u = He(s, r) * (o ? 1 : -1), l = we(s, r) * h;
  return {
    x: n.x + Math.cos(u) * l,
    y: n.y + Math.sin(u) * l,
    time: n.time
  };
}
function Je(n, e, a) {
  if (!a.pressure.enabled)
    return a.strokeWidth;
  const o = we(n, e), s = e.time - n.time, r = s > 0 ? o / s : 0, h = Math.max(0.1, Math.min(1, 1 - r * 0.01)), { min: u, max: l } = a.pressure;
  return u + (l - u) * h;
}
function Ct(n, e, a) {
  if (e.length < 2)
    return;
  if (n.strokeStyle = a.strokeColor, n.lineCap = "round", n.lineJoin = "round", !a.smoothing || e.length < 3) {
    n.beginPath(), n.lineWidth = a.strokeWidth, n.moveTo(e[0].x, e[0].y);
    for (let s = 1; s < e.length; s++)
      n.lineTo(e[s].x, e[s].y);
    n.stroke();
    return;
  }
  n.beginPath(), n.moveTo(e[0].x, e[0].y);
  for (let s = 1; s < e.length - 1; s++) {
    const r = e[s], h = e[s + 1];
    a.pressure.enabled ? n.lineWidth = Je(e[s - 1], r, a) : n.lineWidth = a.strokeWidth;
    const u = Le(r, e[s - 1], h);
    n.quadraticCurveTo(u.x, u.y, r.x, r.y);
  }
  const o = e[e.length - 1];
  n.lineTo(o.x, o.y), n.stroke();
}
function Ne(n) {
  const { canvasSize: e, paths: a } = n;
  let o = `<svg width="${e.width}" height="${e.height}" xmlns="http://www.w3.org/2000/svg">`;
  return a.forEach((s) => {
    if (s.points.length < 2)
      return;
    let r = `M ${s.points[0].x} ${s.points[0].y}`;
    for (let h = 1; h < s.points.length; h++)
      r += ` L ${s.points[h].x} ${s.points[h].y}`;
    o += `<path d="${r}" stroke="${s.strokeColor}" stroke-width="${s.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), o += "</svg>", o;
}
function je(n, e, a = { format: "png" }) {
  const { format: o, quality: s = 0.9, size: r, backgroundColor: h } = a;
  if (o === "svg")
    return Ne(e);
  const u = document.createElement("canvas"), l = u.getContext("2d");
  if (r) {
    u.width = r.width, u.height = r.height;
    const p = r.width / n.width, g = r.height / n.height;
    l.scale(p, g);
  } else
    u.width = n.width, u.height = n.height;
  switch (h && h !== "transparent" && (l.fillStyle = h, l.fillRect(0, 0, u.width, u.height)), l.drawImage(n, 0, 0), o) {
    case "jpeg":
      return u.toDataURL("image/jpeg", s);
    case "base64":
      return u.toDataURL("image/png").split(",")[1];
    case "png":
    default:
      return u.toDataURL("image/png");
  }
}
function Ve(n, e) {
  return new Promise((a, o) => {
    const s = new Image();
    s.onload = () => {
      const r = n.getContext("2d");
      r.clearRect(0, 0, n.width, n.height), r.drawImage(s, 0, 0, n.width, n.height), a();
    }, s.onerror = o, s.src = e;
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
function I(n) {
  return JSON.parse(JSON.stringify(n));
}
class Ge {
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
    for (let o = 0; o < this.replayData.paths.length; o++) {
      const s = this.replayData.paths[o], r = s.startTime || 0, h = s.endTime || r + (s.duration || 0);
      if (e < r)
        break;
      if (e >= h) {
        this.drawCompletePath(s), !a && Math.abs(e - h) < 32 && this.emit("replay-path-end", o, s);
        continue;
      }
      a = !0;
      const u = Math.max(0, Math.min(1, (e - r) / Math.max(h - r, 1)));
      u > 0 && Math.abs(e - r) < 32 && this.emit("replay-path-start", o, s), this.drawPartialPath(s, u);
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
    const o = e.startTime || 0, s = e.duration || 0, r = o + s * a, h = this.getPointsUpToTime(e.points, o, r);
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
  getPointsUpToTime(e, a, o) {
    const s = [];
    for (let r = 0; r < e.length; r++) {
      const h = e[r], u = a + (h.relativeTime || r * 50);
      if (u <= o)
        s.push(h);
      else {
        if (r > 0) {
          const l = e[r - 1], p = a + (l.relativeTime || (r - 1) * 50);
          if (p <= o) {
            const g = (o - p) / (u - p), d = {
              x: l.x + (h.x - l.x) * g,
              y: l.y + (h.y - l.y) * g,
              time: o,
              pressure: l.pressure ? l.pressure + (h.pressure || l.pressure - l.pressure) * g : h.pressure
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
  drawPathWithSmoothAlgorithm(e, a) {
    if (e.length < 2)
      return;
    if (this.ctx.strokeStyle = a.strokeColor, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", !a.smoothing || e.length < 3) {
      this.ctx.beginPath(), this.ctx.lineWidth = a.strokeWidth, this.ctx.moveTo(e[0].x, e[0].y);
      for (let s = 1; s < e.length; s++)
        this.ctx.lineTo(e[s].x, e[s].y);
      this.ctx.stroke();
      return;
    }
    this.ctx.beginPath(), this.ctx.moveTo(e[0].x, e[0].y);
    for (let s = 1; s < e.length - 1; s++) {
      const r = e[s], h = e[s + 1];
      this.ctx.lineWidth = a.strokeWidth;
      const u = this.getControlPoint(r, e[s - 1], h);
      this.ctx.quadraticCurveTo(u.x, u.y, r.x, r.y);
    }
    const o = e[e.length - 1];
    this.ctx.lineTo(o.x, o.y), this.ctx.stroke();
  }
  /**
   * 获取控制点（用于贝塞尔曲线平滑） - 与signature.ts中的实现一致
   */
  getControlPoint(e, a, o) {
    const r = {
      length: Math.sqrt(Math.pow(o.x - a.x, 2) + Math.pow(o.y - a.y, 2)),
      angle: Math.atan2(o.y - a.y, o.x - a.x)
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
  on(e, a) {
    this.eventCallbacks.has(e) || this.eventCallbacks.set(e, []), this.eventCallbacks.get(e).push(a);
  }
  /**
   * 移除事件监听器
   */
  off(e, a) {
    if (this.eventCallbacks.has(e))
      if (a) {
        const o = this.eventCallbacks.get(e), s = o.indexOf(a);
        s > -1 && o.splice(s, 1);
      } else
        this.eventCallbacks.delete(e);
  }
  /**
   * 触发事件
   */
  emit(e, ...a) {
    const o = this.eventCallbacks.get(e);
    o && o.forEach((s) => s(...a));
  }
  /**
   * 销毁控制器
   */
  destroy() {
    this.stop(), this.eventCallbacks.clear(), this.replayData = null;
  }
}
function Qe(n) {
  const e = n.paths.map((l) => {
    const p = l.points.map((d, T) => {
      var x;
      let v;
      if (d.time && l.points[0].time)
        v = d.time - l.points[0].time;
      else if (T === 0)
        v = 0;
      else {
        const _ = l.points[T - 1], b = Math.sqrt(
          Math.pow(d.x - _.x, 2) + Math.pow(d.y - _.y, 2)
        ) / 100 * 1e3;
        v = (((x = p[T - 1]) == null ? void 0 : x.relativeTime) || 0) + Math.max(b, 16);
      }
      return {
        ...d,
        relativeTime: v
      };
    }), g = p.length > 0 ? p[p.length - 1].relativeTime : 0;
    return {
      ...l,
      points: p,
      duration: g
    };
  }), a = [];
  for (let l = 0; l < e.length; l++) {
    const p = e[l];
    let g;
    if (l === 0)
      g = 0;
    else {
      const v = a[l - 1], x = Ke(
        n.paths[l - 1].points,
        n.paths[l].points
      );
      g = v.endTime + x;
    }
    const d = g + p.duration, T = {
      ...p,
      startTime: g,
      endTime: d
    };
    console.log(`路径 ${l}: 开始时间=${g}, 结束时间=${d}, 持续时间=${p.duration}`), a.push(T);
  }
  const o = a.length > 0 ? a[a.length - 1].endTime : 0;
  console.log("回放数据生成完成:"), console.log("- 路径数量:", a.length), console.log("- 总时长:", o), console.log("- 路径详情:", a.map((l) => ({
    startTime: l.startTime,
    endTime: l.endTime,
    duration: l.duration,
    pointCount: l.points.length
  })));
  const s = a.reduce((l, p) => l + et(p.points), 0), r = o > 0 ? s / (o / 1e3) : 0, h = a.slice(1).map((l, p) => {
    const g = a[p];
    return l.startTime - g.endTime;
  }), u = h.length > 0 ? h.reduce((l, p) => l + p, 0) / h.length : 0;
  return {
    paths: a,
    totalDuration: o,
    speed: 1,
    metadata: {
      deviceType: Ze(n),
      averageSpeed: r,
      totalDistance: s,
      averagePauseTime: u
    }
  };
}
function Ke(n, e) {
  if (n.length === 0 || e.length === 0)
    return 200;
  const a = n[n.length - 1], o = e[0];
  if (a.time && o.time)
    return Math.max(o.time - a.time, 50);
  const s = Math.sqrt(
    Math.pow(o.x - a.x, 2) + Math.pow(o.y - a.y, 2)
  );
  return Math.min(Math.max(s * 2, 100), 1e3);
}
function Ze(n) {
  const e = n.paths.reduce((r, h) => r + h.points.length, 0), a = n.paths.length;
  if (e === 0)
    return "touch";
  const o = e / a;
  return o > 20 ? "touch" : o < 10 ? "mouse" : n.paths.some(
    (r) => r.points.some((h) => h.pressure !== void 0)
  ) ? "pen" : "touch";
}
function et(n) {
  let e = 0;
  for (let a = 1; a < n.length; a++) {
    const o = n[a].x - n[a - 1].x, s = n[a].y - n[a - 1].y;
    e += Math.sqrt(o * o + s * s);
  }
  return e;
}
const tt = ["width", "height"], ot = {
  key: 1,
  class: "signature-toolbar"
}, at = ["disabled"], nt = ["disabled"], st = ["disabled"], it = {
  key: 2,
  class: "replay-controls"
}, lt = { class: "replay-buttons" }, rt = ["disabled"], ut = { key: 0 }, ht = { key: 1 }, ct = ["disabled"], dt = { class: "replay-progress" }, pt = ["max", "value", "disabled"], gt = { class: "time-display" }, mt = { class: "replay-speed" }, vt = /* @__PURE__ */ Fe({
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
  setup(n, { expose: e, emit: a }) {
    const o = n, s = a, r = P(), h = P(!1), u = P(null), l = P(z(0, 0)), p = P([]), g = P(-1), d = P(null), T = P(!1), v = P("idle"), x = P(0), _ = P(0), M = C(() => typeof o.width == "number" ? o.width : 800), b = C(() => typeof o.height == "number" ? o.height : 300), xe = C(() => ({
      position: "relative",
      display: "inline-block",
      width: typeof o.width == "string" ? o.width : `${o.width}px`,
      height: typeof o.height == "string" ? o.height : `${o.height}px`
    })), ke = C(() => ({
      border: o.borderStyle,
      borderRadius: o.borderRadius,
      backgroundColor: o.backgroundColor,
      cursor: o.disabled ? "not-allowed" : "crosshair",
      display: "block",
      width: "100%",
      height: "100%"
    })), Ce = C(() => ({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "#999",
      fontSize: "14px",
      pointerEvents: "none",
      userSelect: "none"
    })), be = C(() => T.value ? !1 : o.placeholder && q(l.value)), L = C(() => g.value > 0), J = C(() => g.value < p.value.length - 1), N = C(() => T.value && d.value), D = C(() => !N.value && !o.disabled), Pe = C(() => {
      var t;
      return N.value && ((t = o.replayOptions) == null ? void 0 : t.showControls) !== !1;
    }), j = C(() => ({
      strokeColor: o.strokeColor,
      strokeWidth: o.strokeWidth,
      smoothing: o.smoothing,
      pressure: {
        enabled: o.pressureSensitive,
        min: o.minStrokeWidth,
        max: o.maxStrokeWidth
      }
    })), V = () => {
      var t;
      return ((t = r.value) == null ? void 0 : t.getContext("2d")) || null;
    }, $ = (t, i) => {
      const c = r.value, m = c.getBoundingClientRect(), f = c.width / m.width, w = c.height / m.height;
      return {
        x: (t - m.left) * f,
        y: (i - m.top) * w,
        time: Date.now()
      };
    }, G = (t) => {
      if (!D.value)
        return;
      h.value = !0;
      const i = performance.now(), c = { ...t, time: i };
      u.value = {
        points: [c],
        strokeColor: o.strokeColor,
        strokeWidth: o.strokeWidth,
        startTime: i,
        endTime: i,
        duration: 0
      }, s("signature-start");
    }, Me = () => {
      if (!u.value || u.value.points.length < 2)
        return;
      const t = V();
      if (!t)
        return;
      const i = u.value.points, c = i.length;
      if (t.strokeStyle = u.value.strokeColor, t.lineWidth = u.value.strokeWidth, t.lineCap = "round", t.lineJoin = "round", c === 2)
        t.beginPath(), t.moveTo(i[0].x, i[0].y), t.lineTo(i[1].x, i[1].y), t.stroke();
      else if (c >= 3) {
        const m = i[c - 3], f = i[c - 2], w = i[c - 1];
        if (t.beginPath(), o.smoothing) {
          t.moveTo(m.x, m.y);
          const W = Q(f, m, w);
          t.quadraticCurveTo(W.x, W.y, f.x, f.y);
        } else
          t.moveTo(f.x, f.y), t.lineTo(w.x, w.y);
        t.stroke();
      }
    }, Q = (t, i, c) => {
      const f = {
        length: Math.sqrt(Math.pow(c.x - i.x, 2) + Math.pow(c.y - i.y, 2)),
        angle: Math.atan2(c.y - i.y, c.x - i.x)
      }, w = f.angle + Math.PI, W = f.length * 0.2;
      return {
        x: t.x + Math.cos(w) * W,
        y: t.y + Math.sin(w) * W,
        time: t.time || 0
      };
    }, De = (t, i) => {
      if (i.points.length < 2)
        return;
      t.strokeStyle = i.strokeColor, t.lineWidth = i.strokeWidth, t.lineCap = "round", t.lineJoin = "round";
      const c = i.points;
      if (c.length === 2) {
        t.beginPath(), t.moveTo(c[0].x, c[0].y), t.lineTo(c[1].x, c[1].y), t.stroke();
        return;
      }
      if (!o.smoothing) {
        t.beginPath(), t.moveTo(c[0].x, c[0].y);
        for (let m = 1; m < c.length; m++)
          t.lineTo(c[m].x, c[m].y);
        t.stroke();
        return;
      }
      t.beginPath(), t.moveTo(c[0].x, c[0].y), c.length >= 3 && t.lineTo(c[1].x, c[1].y);
      for (let m = 1; m < c.length - 1; m++) {
        const f = c[m - 1], w = c[m], W = c[m + 1], fe = Q(w, f, W);
        t.quadraticCurveTo(fe.x, fe.y, w.x, w.y);
      }
      if (c.length >= 3) {
        const m = c[c.length - 1], f = c[c.length - 2];
        t.quadraticCurveTo(f.x, f.y, m.x, m.y);
      }
      t.stroke();
    }, K = (t) => {
      if (!h.value || !u.value || !D.value)
        return;
      const i = performance.now(), c = { ...t, time: i };
      u.value.points.push(c), u.value.startTime && (u.value.endTime = i, u.value.duration = i - u.value.startTime), Me(), oe(), s("signature-drawing", l.value);
    }, Z = () => {
      if (!(!h.value || !u.value)) {
        if (h.value = !1, u.value.points.length > 0) {
          const t = u.value.points[u.value.points.length - 1];
          t.time && u.value.startTime && (u.value.endTime = t.time, u.value.duration = t.time - u.value.startTime);
        }
        l.value.paths.push(u.value), l.value.isEmpty = !1, l.value.timestamp = Date.now(), O(), S(), u.value = null, s("signature-end", l.value);
      }
    }, Se = (t) => {
      t.preventDefault();
      const i = $(t.clientX, t.clientY);
      G(i);
    }, We = (t) => {
      if (t.preventDefault(), !h.value)
        return;
      const i = $(t.clientX, t.clientY);
      K(i);
    }, ee = (t) => {
      t.preventDefault(), Z();
    }, _e = (t) => {
      if (t.preventDefault(), t.touches.length !== 1)
        return;
      const i = t.touches[0], c = $(i.clientX, i.clientY);
      G(c);
    }, Re = (t) => {
      if (t.preventDefault(), t.touches.length !== 1 || !h.value)
        return;
      const i = t.touches[0], c = $(i.clientX, i.clientY);
      K(c);
    }, te = (t) => {
      t.preventDefault(), Z();
    }, oe = () => {
      l.value.canvasSize = {
        width: M.value,
        height: b.value
      }, l.value.isEmpty = q(l.value);
    }, O = () => {
      p.value = p.value.slice(0, g.value + 1), p.value.push(I(l.value)), g.value = p.value.length - 1;
      const t = 50;
      p.value.length > t && (p.value = p.value.slice(-t), g.value = p.value.length - 1);
    }, S = () => {
      const t = V();
      t && (t.clearRect(0, 0, M.value, b.value), o.backgroundColor && o.backgroundColor !== "transparent" && (t.fillStyle = o.backgroundColor, t.fillRect(0, 0, M.value, b.value)), l.value.paths.forEach((i) => {
        i.points.length > 0 && De(t, i);
      }));
    }, A = () => {
      if (console.log("初始化回放控制器"), console.log("canvas引用是否存在:", !!r.value), !r.value) {
        console.error("canvas引用不存在，无法初始化回放控制器");
        return;
      }
      d.value && (console.log("销毁现有回放控制器"), d.value.destroy()), console.log("创建新的回放控制器"), d.value = new Ge(r.value), console.log("回放控制器创建成功:", !!d.value), d.value.on("replay-start", () => {
        v.value = "playing", s("replay-start");
      }), d.value.on("replay-progress", (t, i) => {
        x.value = t, _.value = i, s("replay-progress", t, i);
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
    }, ae = (t, i) => {
      if (d.value || A(), d.value) {
        T.value = !0;
        const c = {
          ...i,
          drawOptions: j.value
        };
        d.value.setReplayData(t, c), console.log("startReplay调用，自动播放:", i == null ? void 0 : i.autoPlay), (i == null ? void 0 : i.autoPlay) === !0 && d.value.play();
      }
    }, ne = (t) => {
      T.value = t, !t && d.value && (d.value.stop(), S());
    }, Ee = () => q(l.value) ? null : Qe(l.value), se = () => {
      console.log("play方法被调用"), console.log("回放控制器是否存在:", !!d.value), d.value || (console.log("回放控制器不存在，尝试初始化"), A()), d.value ? (console.log("调用回放控制器的play方法"), d.value.play()) : console.error("回放控制器初始化失败，无法播放");
    }, ie = () => {
      var t;
      (t = d.value) == null || t.pause();
    }, le = () => {
      var t;
      (t = d.value) == null || t.stop();
    }, re = (t) => {
      var i;
      (i = d.value) == null || i.seek(t);
    }, ue = (t) => {
      var i;
      (i = d.value) == null || i.setSpeed(t);
    }, Ie = () => {
      var t;
      return ((t = d.value) == null ? void 0 : t.getState()) || "idle";
    }, $e = () => {
      var t;
      return ((t = d.value) == null ? void 0 : t.getCurrentTime()) || 0;
    }, X = () => {
      var t;
      return ((t = d.value) == null ? void 0 : t.getTotalDuration()) || 0;
    }, Oe = () => {
      var t;
      return ((t = d.value) == null ? void 0 : t.getProgress()) || 0;
    }, he = (t) => {
      const i = Math.floor(t / 1e3), c = Math.floor(i / 60), m = i % 60;
      return `${c}:${m.toString().padStart(2, "0")}`;
    }, ce = () => {
      D.value && (l.value = z(M.value, b.value), S(), O(), s("signature-clear"));
    }, de = () => {
      !L.value || !D.value || (g.value--, l.value = I(p.value[g.value]), S(), s("signature-undo", l.value));
    }, pe = () => {
      !J.value || !D.value || (g.value++, l.value = I(p.value[g.value]), S(), s("signature-redo", l.value));
    }, ge = (t) => {
      const i = r.value;
      return je(i, l.value, t);
    }, me = () => q(l.value), ve = async (t) => {
      if (!D.value)
        return;
      const i = r.value;
      await Ve(i, t), l.value = z(M.value, b.value), l.value.isEmpty = !1, O();
    }, Ae = () => I(l.value), qe = (t) => {
      D.value && (l.value = I(t), S(), O());
    }, ye = (t, i) => {
      const c = t || M.value, m = i || b.value, f = ge({ format: "png" });
      F(() => {
        const w = r.value;
        w.width = c, w.height = m, me() || ve(f), oe();
      });
    }, ze = () => {
      const t = r.value;
      t.width = M.value, t.height = b.value, l.value = z(M.value, b.value), p.value = [I(l.value)], g.value = 0, S();
    };
    return Y([() => o.width, () => o.height], () => {
      F(() => {
        r.value && ye();
      });
    }), Y(() => o.replayMode, (t) => {
      t !== void 0 && ne(t);
    }), Y(() => o.replayData, (t) => {
      if (console.log("watch监听到回放数据变化:", t), console.log("当前回放模式:", o.replayMode), console.log("回放控制器是否存在:", !!d.value), t && o.replayMode)
        if (d.value || (console.log("回放控制器未初始化，先初始化"), A()), d.value) {
          console.log("开始设置回放数据到控制器");
          const i = {
            ...o.replayOptions,
            drawOptions: j.value
          };
          d.value.setReplayData(t, i), console.log("回放数据已更新:", t);
        } else
          console.error("回放控制器初始化失败");
      else
        t || console.log("回放数据为空，跳过设置"), o.replayMode || console.log("不在回放模式，跳过设置");
    }, { immediate: !0 }), Be(() => {
      F(() => {
        ze(), A(), o.replayMode && o.replayData && ae(o.replayData, o.replayOptions);
      });
    }), Ue(() => {
      d.value && (d.value.destroy(), d.value = null);
    }), e({
      clear: ce,
      undo: de,
      redo: pe,
      save: ge,
      isEmpty: me,
      fromDataURL: ve,
      getSignatureData: Ae,
      setSignatureData: qe,
      resize: ye,
      // 回放相关方法
      startReplay: ae,
      getReplayData: Ee,
      setReplayMode: ne,
      play: se,
      pause: ie,
      stop: le,
      seek: re,
      setSpeed: ue,
      getState: Ie,
      getCurrentTime: $e,
      getTotalDuration: X,
      getProgress: Oe
    }), (t, i) => (R(), E("div", {
      class: "electronic-signature",
      style: B(xe.value)
    }, [
      y("canvas", {
        ref_key: "canvasRef",
        ref: r,
        width: M.value,
        height: b.value,
        style: B(ke.value),
        onMousedown: Se,
        onMousemove: We,
        onMouseup: ee,
        onMouseleave: ee,
        onTouchstart: _e,
        onTouchmove: Re,
        onTouchend: te,
        onTouchcancel: te
      }, null, 44, tt),
      be.value ? (R(), E("div", {
        key: 0,
        class: "signature-placeholder",
        style: B(Ce.value)
      }, U(t.placeholder), 5)) : H("", !0),
      t.showToolbar ? (R(), E("div", ot, [
        y("button", {
          onClick: ce,
          disabled: !D.value
        }, "清除", 8, at),
        y("button", {
          onClick: de,
          disabled: !D.value || !L.value
        }, "撤销", 8, nt),
        y("button", {
          onClick: pe,
          disabled: !D.value || !J.value
        }, "重做", 8, st)
      ])) : H("", !0),
      Pe.value ? (R(), E("div", it, [
        y("div", lt, [
          y("button", {
            onClick: i[0] || (i[0] = (c) => v.value === "playing" ? ie() : se()),
            disabled: v.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            v.value === "playing" ? (R(), E("span", ut, "⏸️")) : (R(), E("span", ht, "▶️"))
          ], 8, rt),
          y("button", {
            onClick: i[1] || (i[1] = (c) => le()),
            disabled: v.value === "idle",
            class: "replay-btn stop-btn"
          }, " ⏹️ ", 8, ct)
        ]),
        y("div", dt, [
          y("input", {
            type: "range",
            min: "0",
            max: X(),
            value: _.value,
            onInput: i[2] || (i[2] = (c) => re(Number(c.target.value))),
            class: "progress-slider",
            disabled: v.value === "idle"
          }, null, 40, pt),
          y("div", gt, [
            y("span", null, U(he(_.value)), 1),
            i[4] || (i[4] = y("span", null, "/", -1)),
            y("span", null, U(he(X())), 1)
          ])
        ]),
        y("div", mt, [
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
      ])) : H("", !0)
    ], 4));
  }
});
const yt = (n, e) => {
  const a = n.__vccOpts || n;
  for (const [o, s] of e)
    a[o] = s;
  return a;
}, Te = /* @__PURE__ */ yt(vt, [["__scopeId", "data-v-81a2b7c2"]]);
function ft() {
  return window.devicePixelRatio || 1;
}
function bt(n) {
  const e = n.getContext("2d"), a = ft(), o = n.clientWidth, s = n.clientHeight;
  return n.width = o * a, n.height = s * a, e.scale(a, a), n.style.width = o + "px", n.style.height = s + "px", e;
}
function wt(n) {
  if (n.paths.length === 0)
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0
    };
  let e = 1 / 0, a = 1 / 0, o = -1 / 0, s = -1 / 0;
  return n.paths.forEach((r) => {
    r.points.forEach((h) => {
      e = Math.min(e, h.x), a = Math.min(a, h.y), o = Math.max(o, h.x), s = Math.max(s, h.y);
    });
  }), {
    minX: e,
    minY: a,
    maxX: o,
    maxY: s,
    width: o - e,
    height: s - a
  };
}
function Pt(n, e, a = 10) {
  const o = wt(e);
  if (o.width === 0 || o.height === 0) {
    const l = document.createElement("canvas");
    return l.width = 1, l.height = 1, l;
  }
  const s = document.createElement("canvas"), r = s.getContext("2d"), h = o.width + a * 2, u = o.height + a * 2;
  return s.width = h, s.height = u, r.drawImage(
    n,
    o.minX - a,
    o.minY - a,
    h,
    u,
    0,
    0,
    h,
    u
  ), s;
}
function Mt(n, e, a, o = !0) {
  const s = document.createElement("canvas"), r = s.getContext("2d");
  let h = e, u = a;
  if (o) {
    const l = n.width / n.height, p = e / a;
    l > p ? u = e / l : h = a * l;
  }
  return s.width = h, s.height = u, r.imageSmoothingEnabled = !0, r.imageSmoothingQuality = "high", r.drawImage(n, 0, 0, h, u), s;
}
function Dt(n, e, a = {}) {
  const {
    fontSize: o = 12,
    fontFamily: s = "Arial",
    color: r = "#999",
    opacity: h = 0.5,
    position: u = "bottom-right"
  } = a, l = document.createElement("canvas"), p = l.getContext("2d");
  l.width = n.width, l.height = n.height, p.drawImage(n, 0, 0), p.font = `${o}px ${s}`, p.fillStyle = r, p.globalAlpha = h;
  const d = p.measureText(e).width, T = o;
  let v, x;
  switch (u) {
    case "top-left":
      v = 10, x = T + 10;
      break;
    case "top-right":
      v = n.width - d - 10, x = T + 10;
      break;
    case "bottom-left":
      v = 10, x = n.height - 10;
      break;
    case "bottom-right":
      v = n.width - d - 10, x = n.height - 10;
      break;
    case "center":
      v = (n.width - d) / 2, x = (n.height + T) / 2;
      break;
    default:
      v = n.width - d - 10, x = n.height - 10;
  }
  return p.fillText(e, v, x), p.globalAlpha = 1, l;
}
function St(n) {
  const e = document.createElement("canvas"), a = e.getContext("2d");
  e.width = n.width, e.height = n.height, a.drawImage(n, 0, 0);
  const o = a.getImageData(0, 0, n.width, n.height), s = o.data;
  for (let r = 0; r < s.length; r += 4) {
    const h = s[r] * 0.299 + s[r + 1] * 0.587 + s[r + 2] * 0.114;
    s[r] = h, s[r + 1] = h, s[r + 2] = h;
  }
  return a.putImageData(o, 0, 0), e;
}
const Tt = (n) => {
  n.component("ElectronicSignature", Te);
}, Wt = {
  install: Tt,
  ElectronicSignature: Te
}, _t = "1.0.0";
export {
  Te as ElectronicSignature,
  Ge as SignatureReplayController,
  Dt as addWatermark,
  Je as calculateStrokeWidth,
  I as cloneSignatureData,
  St as convertToGrayscale,
  z as createEmptySignatureData,
  Qe as createReplayData,
  Pt as cropSignature,
  Wt as default,
  Ct as drawSmoothPath,
  je as exportSignature,
  He as getAngle,
  Le as getControlPoint,
  ft as getDevicePixelRatio,
  we as getDistance,
  wt as getSignatureBounds,
  q as isSignatureEmpty,
  Ve as loadImageToCanvas,
  Mt as resizeSignature,
  bt as setupHighDPICanvas,
  Ne as signatureToSVG,
  _t as version
};
