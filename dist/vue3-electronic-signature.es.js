var Ue = Object.defineProperty;
var He = (o, t, a) => t in o ? Ue(o, t, { enumerable: !0, configurable: !0, writable: !0, value: a }) : o[t] = a;
var x = (o, t, a) => (He(o, typeof t != "symbol" ? t + "" : t, a), a);
import { defineComponent as Le, ref as M, computed as P, watch as L, nextTick as N, onMounted as Ne, onUnmounted as je, openBlock as I, createElementBlock as O, normalizeStyle as j, createElementVNode as k, toDisplayString as G, createCommentVNode as V } from "vue";
function be(o, t) {
  return Math.sqrt(
    Math.pow(t.x - o.x, 2) + Math.pow(t.y - o.y, 2)
  );
}
function Ge(o, t) {
  return Math.atan2(t.y - o.y, t.x - o.x);
}
function Ve(o, t, a, n) {
  const i = t || o, l = a || o, h = 0.2, u = Ge(i, l) * (n ? 1 : -1), r = be(i, l) * h;
  return {
    x: o.x + Math.cos(u) * r,
    y: o.y + Math.sin(u) * r,
    time: o.time
  };
}
function Qe(o, t, a) {
  if (!a.pressure.enabled)
    return a.strokeWidth;
  const n = be(o, t), i = t.time - o.time, l = i > 0 ? n / i : 0, h = Math.max(0.1, Math.min(1, 1 - l * 0.01)), { min: u, max: r } = a.pressure;
  return u + (r - u) * h;
}
function _t(o, t, a) {
  if (t.length < 2)
    return;
  if (o.strokeStyle = a.strokeColor, o.lineCap = "round", o.lineJoin = "round", !a.smoothing || t.length < 3) {
    o.beginPath(), o.lineWidth = a.strokeWidth, o.moveTo(t[0].x, t[0].y);
    for (let i = 1; i < t.length; i++)
      o.lineTo(t[i].x, t[i].y);
    o.stroke();
    return;
  }
  o.beginPath(), o.moveTo(t[0].x, t[0].y);
  for (let i = 1; i < t.length - 1; i++) {
    const l = t[i], h = t[i + 1];
    a.pressure.enabled ? o.lineWidth = Qe(t[i - 1], l, a) : o.lineWidth = a.strokeWidth;
    const u = Ve(l, t[i - 1], h);
    o.quadraticCurveTo(u.x, u.y, l.x, l.y);
  }
  const n = t[t.length - 1];
  o.lineTo(n.x, n.y), o.stroke();
}
function Ke(o) {
  const { canvasSize: t, paths: a } = o;
  let n = `<svg width="${t.width}" height="${t.height}" xmlns="http://www.w3.org/2000/svg">`;
  return a.forEach((i) => {
    if (i.points.length < 2)
      return;
    let l = `M ${i.points[0].x} ${i.points[0].y}`;
    for (let h = 1; h < i.points.length; h++)
      l += ` L ${i.points[h].x} ${i.points[h].y}`;
    n += `<path d="${l}" stroke="${i.strokeColor}" stroke-width="${i.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), n += "</svg>", n;
}
function Ze(o, t, a = { format: "png" }) {
  const { format: n, quality: i = 0.9, size: l, backgroundColor: h } = a;
  if (n === "svg")
    return Ke(t);
  const u = document.createElement("canvas"), r = u.getContext("2d");
  if (l) {
    u.width = l.width, u.height = l.height;
    const p = l.width / o.width, v = l.height / o.height;
    r.scale(p, v);
  } else
    u.width = o.width, u.height = o.height;
  switch (h && h !== "transparent" && (r.fillStyle = h, r.fillRect(0, 0, u.width, u.height)), r.drawImage(o, 0, 0), n) {
    case "jpeg":
      return u.toDataURL("image/jpeg", i);
    case "base64":
      return u.toDataURL("image/png").split(",")[1];
    case "png":
    default:
      return u.toDataURL("image/png");
  }
}
function et(o, t) {
  return new Promise((a, n) => {
    const i = new Image();
    i.onload = () => {
      const l = o.getContext("2d");
      l.clearRect(0, 0, o.width, o.height), l.drawImage(i, 0, 0, o.width, o.height), a();
    }, i.onerror = n, i.src = t;
  });
}
function Y(o) {
  return o.paths.length === 0 || o.paths.every((t) => t.points.length === 0);
}
function z(o, t) {
  return {
    paths: [],
    canvasSize: { width: o, height: t },
    timestamp: Date.now(),
    isEmpty: !0
  };
}
function $(o) {
  return JSON.parse(JSON.stringify(o));
}
class tt {
  constructor(t) {
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
    this.canvas = t, this.ctx = t.getContext("2d");
  }
  /**
   * 设置回放数据
   */
  setReplayData(t, a = {}) {
    console.log("设置回放数据:", t), console.log("回放选项:", a), this.replayData = t, this.options = { ...a }, this.speed = a.speed || t.speed || 1, this.currentTime = a.startTime || 0, this.state = "idle", console.log("回放数据设置完成，路径数量:", t.paths.length), console.log("总时长:", t.totalDuration);
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
  seek(t) {
    if (!this.replayData)
      return;
    const a = this.options.endTime || this.replayData.totalDuration;
    this.currentTime = Math.max(0, Math.min(t, a)), this.state === "playing" ? this.startTimestamp = performance.now() - this.currentTime / this.speed : this.pausedTime = this.currentTime / this.speed, this.renderFrame(this.currentTime);
  }
  /**
   * 设置播放速度
   */
  setSpeed(t) {
    const a = this.state === "playing";
    a && this.pause(), this.speed = Math.max(0.1, Math.min(5, t)), this.emit("replay-speed-change", this.speed), a && this.play();
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
    var t;
    return ((t = this.replayData) == null ? void 0 : t.totalDuration) || 0;
  }
  /**
   * 获取当前进度（0-1）
   */
  getProgress() {
    const t = this.getTotalDuration();
    return t > 0 ? this.currentTime / t : 0;
  }
  /**
   * 动画循环
   */
  animate() {
    if (this.state !== "playing" || !this.replayData)
      return;
    const t = performance.now();
    this.currentTime = (t - this.startTimestamp) * this.speed;
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
  renderFrame(t) {
    if (!this.replayData)
      return;
    this.clearCanvas();
    let a = !1;
    for (let n = 0; n < this.replayData.paths.length; n++) {
      const i = this.replayData.paths[n], l = i.startTime || 0, h = i.endTime || l + (i.duration || 0);
      if (t < l)
        break;
      if (t >= h) {
        this.drawCompletePath(i), !a && Math.abs(t - h) < 32 && this.emit("replay-path-end", n, i);
        continue;
      }
      a = !0;
      const u = Math.max(0, Math.min(1, (t - l) / Math.max(h - l, 1)));
      u > 0 && Math.abs(t - l) < 32 && this.emit("replay-path-start", n, i), this.drawPartialPath(i, u);
      break;
    }
  }
  /**
   * 绘制完整路径 - 使用与录制时相同的算法
   */
  drawCompletePath(t) {
    if (t.points.length < 2)
      return;
    const a = this.options.drawOptions || {
      strokeColor: t.strokeColor,
      strokeWidth: t.strokeWidth,
      smoothing: !0,
      pressure: { enabled: !1, min: 1, max: 4 }
    };
    this.drawPathWithSmoothAlgorithm(t.points, {
      ...a,
      strokeColor: t.strokeColor,
      // 保持路径自己的颜色
      strokeWidth: t.strokeWidth
      // 保持路径自己的宽度
    });
  }
  /**
   * 绘制部分路径 - 使用与录制时相同的算法
   */
  drawPartialPath(t, a) {
    if (t.points.length < 2)
      return;
    const n = t.startTime || 0, i = t.duration || 0, l = n + i * a, h = this.getPointsUpToTime(t.points, n, l);
    if (h.length < 2)
      return;
    const u = this.options.drawOptions || {
      strokeColor: t.strokeColor,
      strokeWidth: t.strokeWidth,
      smoothing: !0,
      pressure: { enabled: !1, min: 1, max: 4 }
    };
    this.drawPathWithSmoothAlgorithm(h, {
      ...u,
      strokeColor: t.strokeColor,
      // 保持路径自己的颜色
      strokeWidth: t.strokeWidth
      // 保持路径自己的宽度
    });
  }
  /**
   * 获取指定时间内的所有点
   */
  getPointsUpToTime(t, a, n) {
    const i = [];
    for (let l = 0; l < t.length; l++) {
      const h = t[l], u = a + (h.relativeTime || l * 50);
      if (u <= n)
        i.push(h);
      else {
        if (l > 0) {
          const r = t[l - 1], p = a + (r.relativeTime || (l - 1) * 50);
          if (p <= n) {
            const v = (n - p) / (u - p), c = {
              x: r.x + (h.x - r.x) * v,
              y: r.y + (h.y - r.y) * v,
              time: n,
              pressure: r.pressure ? r.pressure + (h.pressure || r.pressure - r.pressure) * v : h.pressure
            };
            i.push(c);
          }
        }
        break;
      }
    }
    return i;
  }
  /**
   * 使用与录制时相同的平滑算法绘制路径
   */
  drawPathWithSmoothAlgorithm(t, a) {
    if (t.length < 2)
      return;
    if (this.ctx.strokeStyle = a.strokeColor, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", !a.smoothing || t.length < 3) {
      this.ctx.beginPath(), this.ctx.lineWidth = a.strokeWidth, this.ctx.moveTo(t[0].x, t[0].y);
      for (let i = 1; i < t.length; i++)
        this.ctx.lineTo(t[i].x, t[i].y);
      this.ctx.stroke();
      return;
    }
    this.ctx.beginPath(), this.ctx.moveTo(t[0].x, t[0].y);
    for (let i = 1; i < t.length - 1; i++) {
      const l = t[i], h = t[i + 1];
      this.ctx.lineWidth = a.strokeWidth;
      const u = this.getControlPoint(l, t[i - 1], h);
      this.ctx.quadraticCurveTo(u.x, u.y, l.x, l.y);
    }
    const n = t[t.length - 1];
    this.ctx.lineTo(n.x, n.y), this.ctx.stroke();
  }
  /**
   * 获取控制点（用于贝塞尔曲线平滑） - 与signature.ts中的实现一致
   */
  getControlPoint(t, a, n) {
    const l = {
      length: Math.sqrt(Math.pow(n.x - a.x, 2) + Math.pow(n.y - a.y, 2)),
      angle: Math.atan2(n.y - a.y, n.x - a.x)
    }, h = l.angle + Math.PI, u = l.length * 0.2;
    return {
      x: t.x + Math.cos(h) * u,
      y: t.y + Math.sin(h) * u,
      time: t.time || 0
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
  on(t, a) {
    this.eventCallbacks.has(t) || this.eventCallbacks.set(t, []), this.eventCallbacks.get(t).push(a);
  }
  /**
   * 移除事件监听器
   */
  off(t, a) {
    if (this.eventCallbacks.has(t))
      if (a) {
        const n = this.eventCallbacks.get(t), i = n.indexOf(a);
        i > -1 && n.splice(i, 1);
      } else
        this.eventCallbacks.delete(t);
  }
  /**
   * 触发事件
   */
  emit(t, ...a) {
    const n = this.eventCallbacks.get(t);
    n && n.forEach((i) => i(...a));
  }
  /**
   * 销毁控制器
   */
  destroy() {
    this.stop(), this.eventCallbacks.clear(), this.replayData = null;
  }
}
function nt(o) {
  const t = o.paths.map((r) => {
    const p = r.points.map((c, T) => {
      var C;
      let y;
      if (c.time && r.points[0].time)
        y = c.time - r.points[0].time;
      else if (T === 0)
        y = 0;
      else {
        const E = r.points[T - 1], S = Math.sqrt(
          Math.pow(c.x - E.x, 2) + Math.pow(c.y - E.y, 2)
        ) / 100 * 1e3;
        y = (((C = p[T - 1]) == null ? void 0 : C.relativeTime) || 0) + Math.max(S, 16);
      }
      return {
        ...c,
        relativeTime: y
      };
    }), v = p.length > 0 ? p[p.length - 1].relativeTime : 0;
    return {
      ...r,
      points: p,
      duration: v
    };
  }), a = [];
  for (let r = 0; r < t.length; r++) {
    const p = t[r];
    let v;
    if (r === 0)
      v = 0;
    else {
      const y = a[r - 1], C = at(
        o.paths[r - 1].points,
        o.paths[r].points
      );
      v = y.endTime + C;
    }
    const c = v + p.duration, T = {
      ...p,
      startTime: v,
      endTime: c
    };
    console.log(`路径 ${r}: 开始时间=${v}, 结束时间=${c}, 持续时间=${p.duration}`), a.push(T);
  }
  const n = a.length > 0 ? a[a.length - 1].endTime : 0;
  console.log("回放数据生成完成:"), console.log("- 路径数量:", a.length), console.log("- 总时长:", n), console.log("- 路径详情:", a.map((r) => ({
    startTime: r.startTime,
    endTime: r.endTime,
    duration: r.duration,
    pointCount: r.points.length
  })));
  const i = a.reduce((r, p) => r + st(p.points), 0), l = n > 0 ? i / (n / 1e3) : 0, h = a.slice(1).map((r, p) => {
    const v = a[p];
    return r.startTime - v.endTime;
  }), u = h.length > 0 ? h.reduce((r, p) => r + p, 0) / h.length : 0;
  return {
    paths: a,
    totalDuration: n,
    speed: 1,
    metadata: {
      deviceType: ot(o),
      averageSpeed: l,
      totalDistance: i,
      averagePauseTime: u
    }
  };
}
function at(o, t) {
  if (o.length === 0 || t.length === 0)
    return 200;
  const a = o[o.length - 1], n = t[0];
  if (a.time && n.time)
    return Math.max(n.time - a.time, 50);
  const i = Math.sqrt(
    Math.pow(n.x - a.x, 2) + Math.pow(n.y - a.y, 2)
  );
  return Math.min(Math.max(i * 2, 100), 1e3);
}
function ot(o) {
  const t = o.paths.reduce((l, h) => l + h.points.length, 0), a = o.paths.length;
  if (t === 0)
    return "touch";
  const n = t / a;
  return n > 20 ? "touch" : n < 10 ? "mouse" : o.paths.some(
    (l) => l.points.some((h) => h.pressure !== void 0)
  ) ? "pen" : "touch";
}
function st(o) {
  let t = 0;
  for (let a = 1; a < o.length; a++) {
    const n = o[a].x - o[a - 1].x, i = o[a].y - o[a - 1].y;
    t += Math.sqrt(n * n + i * i);
  }
  return t;
}
const xe = {
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
function it(o) {
  return xe[o];
}
function Rt() {
  return Object.entries(xe).map(([o, t]) => ({
    key: o,
    config: t
  }));
}
function rt(o, t) {
  const a = it(o);
  return {
    strokeWidth: a.strokeWidth,
    smoothing: a.smoothing,
    pressure: a.pressure,
    lineCap: a.lineCap,
    lineJoin: a.lineJoin,
    strokeColor: t || a.recommendedColor || "#000000"
  };
}
const lt = ["width", "height"], ut = {
  key: 1,
  class: "signature-toolbar"
}, ht = ["disabled"], ct = ["disabled"], dt = ["disabled"], pt = {
  key: 2,
  class: "replay-controls"
}, mt = { class: "replay-buttons" }, gt = ["disabled"], vt = { key: 0 }, yt = { key: 1 }, ft = ["disabled"], kt = { class: "replay-progress" }, wt = ["max", "value", "disabled"], Tt = { class: "time-display" }, Ct = { class: "replay-speed" }, bt = /* @__PURE__ */ Le({
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
  setup(o, { expose: t, emit: a }) {
    const n = o, i = a, l = M(), h = M(!1), u = M(null), r = M(z(0, 0)), p = M([]), v = M(-1), c = M(null), T = M(!1), y = M("idle"), C = M(0), E = M(0), D = P(() => typeof n.width == "number" ? n.width : 800), S = P(() => typeof n.height == "number" ? n.height : 300), Se = P(() => ({
      position: "relative",
      display: "inline-block",
      width: typeof n.width == "string" ? n.width : `${n.width}px`,
      height: typeof n.height == "string" ? n.height : `${n.height}px`
    })), Me = P(() => ({
      border: n.borderStyle,
      borderRadius: n.borderRadius,
      backgroundColor: n.backgroundColor,
      cursor: n.disabled ? "not-allowed" : "crosshair",
      display: "block",
      width: "100%",
      height: "100%"
    })), De = P(() => ({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "#999",
      fontSize: "14px",
      pointerEvents: "none",
      userSelect: "none"
    })), We = P(() => T.value ? !1 : n.placeholder && Y(r.value)), Q = P(() => v.value > 0), K = P(() => v.value < p.value.length - 1), Z = P(() => T.value && c.value), W = P(() => !Z.value && !n.disabled), _e = P(() => {
      var e;
      return Z.value && ((e = n.replayOptions) == null ? void 0 : e.showControls) !== !1;
    }), b = P(() => {
      if (n.penStyle) {
        const e = rt(n.penStyle, n.strokeColor);
        return {
          strokeColor: e.strokeColor,
          strokeWidth: n.strokeWidth || e.strokeWidth,
          smoothing: n.smoothing !== void 0 ? n.smoothing : e.smoothing,
          pressure: {
            enabled: n.pressureSensitive !== void 0 ? n.pressureSensitive : e.pressure.enabled,
            min: n.minStrokeWidth || e.pressure.min,
            max: n.maxStrokeWidth || e.pressure.max
          },
          lineCap: e.lineCap,
          lineJoin: e.lineJoin
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
    }), ee = () => {
      var e;
      return ((e = l.value) == null ? void 0 : e.getContext("2d")) || null;
    }, A = (e, s) => {
      const m = l.value, f = m.getBoundingClientRect(), d = m.width / f.width, g = m.height / f.height;
      return {
        x: (e - f.left) * d,
        y: (s - f.top) * g,
        time: Date.now()
      };
    }, te = (e) => {
      if (!W.value)
        return;
      h.value = !0;
      const s = performance.now(), m = { ...e, time: s };
      u.value = {
        points: [m],
        strokeColor: n.strokeColor,
        strokeWidth: n.strokeWidth,
        startTime: s,
        endTime: s,
        duration: 0
      }, i("signature-start");
    }, X = (e, s, m, f) => {
      if (!b.value.pressure.enabled)
        return f;
      switch (m) {
        case "brush":
          if (s) {
            const R = Math.sqrt(Math.pow(e.x - s.x, 2) + Math.pow(e.y - s.y, 2)) / Math.max(1, (e.time || 0) - (s.time || 0)), H = Math.max(0.3, Math.min(2, 50 / Math.max(R, 1))), F = e.pressure || 0.5;
            return f * H * (0.5 + F);
          }
          return f;
        case "pencil":
          const d = e.pressure || 0.5;
          return f * (0.8 + d * 0.4);
        case "ballpoint":
          const g = e.pressure || 0.5;
          return f * (0.9 + g * 0.2);
        default:
          return f;
      }
    }, B = (e, s, m) => {
      var f;
      if (!(s.length < 2))
        switch (e.strokeStyle = ((f = u.value) == null ? void 0 : f.strokeColor) || b.value.strokeColor, e.lineCap = b.value.lineCap || "round", e.lineJoin = b.value.lineJoin || "round", m) {
          case "pen":
            if (e.lineWidth = b.value.strokeWidth, e.beginPath(), e.moveTo(s[0].x, s[0].y), b.value.smoothing && s.length >= 3) {
              for (let d = 1; d < s.length - 1; d++) {
                const g = ne(s[d], s[d - 1], s[d + 1]);
                e.quadraticCurveTo(g.x, g.y, s[d].x, s[d].y);
              }
              e.lineTo(s[s.length - 1].x, s[s.length - 1].y);
            } else
              for (let d = 1; d < s.length; d++)
                e.lineTo(s[d].x, s[d].y);
            e.stroke();
            break;
          case "brush":
            for (let d = 1; d < s.length; d++) {
              const g = s[d], w = s[d - 1], R = X(g, w, m, b.value.strokeWidth);
              e.lineWidth = R, e.beginPath(), e.moveTo(w.x, w.y), e.lineTo(g.x, g.y), e.stroke();
            }
            break;
          case "marker":
            e.globalAlpha = 0.8, e.lineWidth = b.value.strokeWidth, e.beginPath(), e.moveTo(s[0].x, s[0].y);
            for (let d = 1; d < s.length; d++)
              e.lineTo(s[d].x, s[d].y);
            e.stroke(), e.globalAlpha = 1;
            break;
          case "pencil":
            for (let d = 1; d < s.length; d++) {
              const g = s[d], w = s[d - 1], R = X(g, w, m, b.value.strokeWidth);
              e.lineWidth = R, e.beginPath(), e.moveTo(w.x, w.y), e.lineTo(g.x, g.y), e.stroke(), Math.random() > 0.7 && (e.globalAlpha = 0.3, e.beginPath(), e.arc(g.x + (Math.random() - 0.5), g.y + (Math.random() - 0.5), 0.5, 0, Math.PI * 2), e.fill(), e.globalAlpha = 1);
            }
            break;
          case "ballpoint":
            for (let d = 1; d < s.length; d++) {
              const g = s[d], w = s[d - 1], R = X(g, w, m, b.value.strokeWidth);
              if (e.lineWidth = R, e.beginPath(), e.moveTo(w.x, w.y), b.value.smoothing && d < s.length - 1) {
                const H = s[d + 1], F = ne(g, w, H);
                e.quadraticCurveTo(F.x, F.y, g.x, g.y);
              } else
                e.lineTo(g.x, g.y);
              e.stroke();
            }
            break;
        }
    }, Re = () => {
      if (!u.value || u.value.points.length < 2)
        return;
      const e = ee();
      if (!e)
        return;
      const s = u.value.points, m = s.length, f = n.penStyle || "pen";
      if (m === 2)
        B(e, s, f);
      else if (m >= 3) {
        const d = s.slice(-3);
        B(e, d, f);
      }
    }, ne = (e, s, m) => {
      const d = {
        length: Math.sqrt(Math.pow(m.x - s.x, 2) + Math.pow(m.y - s.y, 2)),
        angle: Math.atan2(m.y - s.y, m.x - s.x)
      }, g = d.angle + Math.PI, w = d.length * 0.2;
      return {
        x: e.x + Math.cos(g) * w,
        y: e.y + Math.sin(g) * w,
        time: e.time || 0
      };
    }, Ee = (e, s) => {
      if (s.points.length < 2)
        return;
      const m = n.penStyle || "pen", f = u.value;
      u.value = s, B(e, s.points, m), u.value = f;
    }, ae = (e) => {
      if (!h.value || !u.value || !W.value)
        return;
      const s = performance.now(), m = { ...e, time: s };
      u.value.points.push(m), u.value.startTime && (u.value.endTime = s, u.value.duration = s - u.value.startTime), Re(), re(), i("signature-drawing", r.value);
    }, oe = () => {
      if (!(!h.value || !u.value)) {
        if (h.value = !1, u.value.points.length > 0) {
          const e = u.value.points[u.value.points.length - 1];
          e.time && u.value.startTime && (u.value.endTime = e.time, u.value.duration = e.time - u.value.startTime);
        }
        r.value.paths.push(u.value), r.value.isEmpty = !1, r.value.timestamp = Date.now(), J(), _(), u.value = null, i("signature-end", r.value);
      }
    }, Ie = (e) => {
      e.preventDefault();
      const s = A(e.clientX, e.clientY);
      te(s);
    }, Oe = (e) => {
      if (e.preventDefault(), !h.value)
        return;
      const s = A(e.clientX, e.clientY);
      ae(s);
    }, se = (e) => {
      e.preventDefault(), oe();
    }, $e = (e) => {
      if (e.preventDefault(), e.touches.length !== 1)
        return;
      const s = e.touches[0], m = A(s.clientX, s.clientY);
      te(m);
    }, Ae = (e) => {
      if (e.preventDefault(), e.touches.length !== 1 || !h.value)
        return;
      const s = e.touches[0], m = A(s.clientX, s.clientY);
      ae(m);
    }, ie = (e) => {
      e.preventDefault(), oe();
    }, re = () => {
      r.value.canvasSize = {
        width: D.value,
        height: S.value
      }, r.value.isEmpty = Y(r.value);
    }, J = () => {
      p.value = p.value.slice(0, v.value + 1), p.value.push($(r.value)), v.value = p.value.length - 1;
      const e = 50;
      p.value.length > e && (p.value = p.value.slice(-e), v.value = p.value.length - 1);
    }, _ = () => {
      const e = ee();
      e && (e.clearRect(0, 0, D.value, S.value), n.backgroundColor && n.backgroundColor !== "transparent" && (e.fillStyle = n.backgroundColor, e.fillRect(0, 0, D.value, S.value)), r.value.paths.forEach((s) => {
        s.points.length > 0 && Ee(e, s);
      }));
    }, q = () => {
      if (console.log("初始化回放控制器"), console.log("canvas引用是否存在:", !!l.value), !l.value) {
        console.error("canvas引用不存在，无法初始化回放控制器");
        return;
      }
      c.value && (console.log("销毁现有回放控制器"), c.value.destroy()), console.log("创建新的回放控制器"), c.value = new tt(l.value), console.log("回放控制器创建成功:", !!c.value), c.value.on("replay-start", () => {
        y.value = "playing", i("replay-start");
      }), c.value.on("replay-progress", (e, s) => {
        C.value = e, E.value = s, i("replay-progress", e, s);
      }), c.value.on("replay-pause", () => {
        y.value = "paused", i("replay-pause");
      }), c.value.on("replay-resume", () => {
        y.value = "playing", i("replay-resume");
      }), c.value.on("replay-stop", () => {
        y.value = "stopped", i("replay-stop");
      }), c.value.on("replay-complete", () => {
        y.value = "completed", i("replay-complete");
      }), c.value.on("replay-path-start", (e, s) => {
        i("replay-path-start", e, s);
      }), c.value.on("replay-path-end", (e, s) => {
        i("replay-path-end", e, s);
      }), c.value.on("replay-speed-change", (e) => {
        i("replay-speed-change", e);
      });
    }, le = (e, s) => {
      if (c.value || q(), c.value) {
        T.value = !0;
        const m = {
          ...s,
          drawOptions: b.value,
          penStyle: n.penStyle
        };
        c.value.setReplayData(e, m), console.log("startReplay调用，自动播放:", s == null ? void 0 : s.autoPlay), (s == null ? void 0 : s.autoPlay) === !0 && c.value.play();
      }
    }, ue = (e) => {
      T.value = e, !e && c.value && (c.value.stop(), _());
    }, Je = () => Y(r.value) ? null : nt(r.value), he = () => {
      console.log("play方法被调用"), console.log("回放控制器是否存在:", !!c.value), c.value || (console.log("回放控制器不存在，尝试初始化"), q()), c.value ? (console.log("调用回放控制器的play方法"), c.value.play()) : console.error("回放控制器初始化失败，无法播放");
    }, ce = () => {
      var e;
      (e = c.value) == null || e.pause();
    }, de = () => {
      var e;
      (e = c.value) == null || e.stop();
    }, pe = (e) => {
      var s;
      (s = c.value) == null || s.seek(e);
    }, me = (e) => {
      var s;
      (s = c.value) == null || s.setSpeed(e);
    }, qe = () => {
      var e;
      return ((e = c.value) == null ? void 0 : e.getState()) || "idle";
    }, Fe = () => {
      var e;
      return ((e = c.value) == null ? void 0 : e.getCurrentTime()) || 0;
    }, U = () => {
      var e;
      return ((e = c.value) == null ? void 0 : e.getTotalDuration()) || 0;
    }, Ye = () => {
      var e;
      return ((e = c.value) == null ? void 0 : e.getProgress()) || 0;
    }, ge = (e) => {
      const s = Math.floor(e / 1e3), m = Math.floor(s / 60), f = s % 60;
      return `${m}:${f.toString().padStart(2, "0")}`;
    }, ve = () => {
      W.value && (r.value = z(D.value, S.value), _(), J(), i("signature-clear"));
    }, ye = () => {
      !Q.value || !W.value || (v.value--, r.value = $(p.value[v.value]), _(), i("signature-undo", r.value));
    }, fe = () => {
      !K.value || !W.value || (v.value++, r.value = $(p.value[v.value]), _(), i("signature-redo", r.value));
    }, ke = (e) => {
      const s = l.value;
      return Ze(s, r.value, e);
    }, we = () => Y(r.value), Te = async (e) => {
      if (!W.value)
        return;
      const s = l.value;
      await et(s, e), r.value = z(D.value, S.value), r.value.isEmpty = !1, J();
    }, ze = () => $(r.value), Xe = (e) => {
      W.value && (r.value = $(e), _(), J());
    }, Ce = (e, s) => {
      const m = e || D.value, f = s || S.value, d = ke({ format: "png" });
      N(() => {
        const g = l.value;
        g.width = m, g.height = f, we() || Te(d), re();
      });
    }, Be = () => {
      const e = l.value;
      e.width = D.value, e.height = S.value, r.value = z(D.value, S.value), p.value = [$(r.value)], v.value = 0, _();
    };
    return L([() => n.width, () => n.height], () => {
      N(() => {
        l.value && Ce();
      });
    }), L(() => n.replayMode, (e) => {
      e !== void 0 && ue(e);
    }), L(() => n.replayData, (e) => {
      if (console.log("watch监听到回放数据变化:", e), console.log("当前回放模式:", n.replayMode), console.log("回放控制器是否存在:", !!c.value), e && n.replayMode)
        if (c.value || (console.log("回放控制器未初始化，先初始化"), q()), c.value) {
          console.log("开始设置回放数据到控制器");
          const s = {
            ...n.replayOptions,
            drawOptions: b.value,
            penStyle: n.penStyle
          };
          c.value.setReplayData(e, s), console.log("回放数据已更新:", e);
        } else
          console.error("回放控制器初始化失败");
      else
        e || console.log("回放数据为空，跳过设置"), n.replayMode || console.log("不在回放模式，跳过设置");
    }, { immediate: !0 }), Ne(() => {
      N(() => {
        Be(), q(), n.replayMode && n.replayData && le(n.replayData, n.replayOptions);
      });
    }), je(() => {
      c.value && (c.value.destroy(), c.value = null);
    }), t({
      clear: ve,
      undo: ye,
      redo: fe,
      save: ke,
      isEmpty: we,
      fromDataURL: Te,
      getSignatureData: ze,
      setSignatureData: Xe,
      resize: Ce,
      // 回放相关方法
      startReplay: le,
      getReplayData: Je,
      setReplayMode: ue,
      play: he,
      pause: ce,
      stop: de,
      seek: pe,
      setSpeed: me,
      getState: qe,
      getCurrentTime: Fe,
      getTotalDuration: U,
      getProgress: Ye
    }), (e, s) => (I(), O("div", {
      class: "electronic-signature",
      style: j(Se.value)
    }, [
      k("canvas", {
        ref_key: "canvasRef",
        ref: l,
        width: D.value,
        height: S.value,
        style: j(Me.value),
        onMousedown: Ie,
        onMousemove: Oe,
        onMouseup: se,
        onMouseleave: se,
        onTouchstart: $e,
        onTouchmove: Ae,
        onTouchend: ie,
        onTouchcancel: ie
      }, null, 44, lt),
      We.value ? (I(), O("div", {
        key: 0,
        class: "signature-placeholder",
        style: j(De.value)
      }, G(e.placeholder), 5)) : V("", !0),
      e.showToolbar ? (I(), O("div", ut, [
        k("button", {
          onClick: ve,
          disabled: !W.value
        }, "清除", 8, ht),
        k("button", {
          onClick: ye,
          disabled: !W.value || !Q.value
        }, "撤销", 8, ct),
        k("button", {
          onClick: fe,
          disabled: !W.value || !K.value
        }, "重做", 8, dt)
      ])) : V("", !0),
      _e.value ? (I(), O("div", pt, [
        k("div", mt, [
          k("button", {
            onClick: s[0] || (s[0] = (m) => y.value === "playing" ? ce() : he()),
            disabled: y.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            y.value === "playing" ? (I(), O("span", vt, "⏸️")) : (I(), O("span", yt, "▶️"))
          ], 8, gt),
          k("button", {
            onClick: s[1] || (s[1] = (m) => de()),
            disabled: y.value === "idle",
            class: "replay-btn stop-btn"
          }, " ⏹️ ", 8, ft)
        ]),
        k("div", kt, [
          k("input", {
            type: "range",
            min: "0",
            max: U(),
            value: E.value,
            onInput: s[2] || (s[2] = (m) => pe(Number(m.target.value))),
            class: "progress-slider",
            disabled: y.value === "idle"
          }, null, 40, wt),
          k("div", Tt, [
            k("span", null, G(ge(E.value)), 1),
            s[4] || (s[4] = k("span", null, "/", -1)),
            k("span", null, G(ge(U())), 1)
          ])
        ]),
        k("div", Ct, [
          s[6] || (s[6] = k("label", null, "速度:", -1)),
          k("select", {
            onChange: s[3] || (s[3] = (m) => me(Number(m.target.value))),
            class: "speed-select"
          }, s[5] || (s[5] = [
            k("option", { value: "0.5" }, "0.5x", -1),
            k("option", {
              value: "1",
              selected: ""
            }, "1x", -1),
            k("option", { value: "1.5" }, "1.5x", -1),
            k("option", { value: "2" }, "2x", -1)
          ]), 32)
        ])
      ])) : V("", !0)
    ], 4));
  }
});
const xt = (o, t) => {
  const a = o.__vccOpts || o;
  for (const [n, i] of t)
    a[n] = i;
  return a;
}, Pe = /* @__PURE__ */ xt(bt, [["__scopeId", "data-v-7dfe3ed2"]]);
function Pt() {
  return window.devicePixelRatio || 1;
}
function Et(o) {
  const t = o.getContext("2d"), a = Pt(), n = o.clientWidth, i = o.clientHeight;
  return o.width = n * a, o.height = i * a, t.scale(a, a), o.style.width = n + "px", o.style.height = i + "px", t;
}
function St(o) {
  if (o.paths.length === 0)
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0
    };
  let t = 1 / 0, a = 1 / 0, n = -1 / 0, i = -1 / 0;
  return o.paths.forEach((l) => {
    l.points.forEach((h) => {
      t = Math.min(t, h.x), a = Math.min(a, h.y), n = Math.max(n, h.x), i = Math.max(i, h.y);
    });
  }), {
    minX: t,
    minY: a,
    maxX: n,
    maxY: i,
    width: n - t,
    height: i - a
  };
}
function It(o, t, a = 10) {
  const n = St(t);
  if (n.width === 0 || n.height === 0) {
    const r = document.createElement("canvas");
    return r.width = 1, r.height = 1, r;
  }
  const i = document.createElement("canvas"), l = i.getContext("2d"), h = n.width + a * 2, u = n.height + a * 2;
  return i.width = h, i.height = u, l.drawImage(
    o,
    n.minX - a,
    n.minY - a,
    h,
    u,
    0,
    0,
    h,
    u
  ), i;
}
function Ot(o, t, a, n = !0) {
  const i = document.createElement("canvas"), l = i.getContext("2d");
  let h = t, u = a;
  if (n) {
    const r = o.width / o.height, p = t / a;
    r > p ? u = t / r : h = a * r;
  }
  return i.width = h, i.height = u, l.imageSmoothingEnabled = !0, l.imageSmoothingQuality = "high", l.drawImage(o, 0, 0, h, u), i;
}
function $t(o, t, a = {}) {
  const {
    fontSize: n = 12,
    fontFamily: i = "Arial",
    color: l = "#999",
    opacity: h = 0.5,
    position: u = "bottom-right"
  } = a, r = document.createElement("canvas"), p = r.getContext("2d");
  r.width = o.width, r.height = o.height, p.drawImage(o, 0, 0), p.font = `${n}px ${i}`, p.fillStyle = l, p.globalAlpha = h;
  const c = p.measureText(t).width, T = n;
  let y, C;
  switch (u) {
    case "top-left":
      y = 10, C = T + 10;
      break;
    case "top-right":
      y = o.width - c - 10, C = T + 10;
      break;
    case "bottom-left":
      y = 10, C = o.height - 10;
      break;
    case "bottom-right":
      y = o.width - c - 10, C = o.height - 10;
      break;
    case "center":
      y = (o.width - c) / 2, C = (o.height + T) / 2;
      break;
    default:
      y = o.width - c - 10, C = o.height - 10;
  }
  return p.fillText(t, y, C), p.globalAlpha = 1, r;
}
function At(o) {
  const t = document.createElement("canvas"), a = t.getContext("2d");
  t.width = o.width, t.height = o.height, a.drawImage(o, 0, 0);
  const n = a.getImageData(0, 0, o.width, o.height), i = n.data;
  for (let l = 0; l < i.length; l += 4) {
    const h = i[l] * 0.299 + i[l + 1] * 0.587 + i[l + 2] * 0.114;
    i[l] = h, i[l + 1] = h, i[l + 2] = h;
  }
  return a.putImageData(n, 0, 0), t;
}
const Mt = (o) => {
  o.component("ElectronicSignature", Pe);
}, Jt = {
  install: Mt,
  ElectronicSignature: Pe
}, qt = "1.0.0";
export {
  Pe as ElectronicSignature,
  xe as PEN_STYLE_CONFIGS,
  tt as SignatureReplayController,
  $t as addWatermark,
  Qe as calculateStrokeWidth,
  $ as cloneSignatureData,
  At as convertToGrayscale,
  rt as createDrawOptionsFromPenStyle,
  z as createEmptySignatureData,
  nt as createReplayData,
  It as cropSignature,
  Jt as default,
  _t as drawSmoothPath,
  Ze as exportSignature,
  Rt as getAllPenStyles,
  Ge as getAngle,
  Ve as getControlPoint,
  Pt as getDevicePixelRatio,
  be as getDistance,
  it as getPenStyleConfig,
  St as getSignatureBounds,
  Y as isSignatureEmpty,
  et as loadImageToCanvas,
  Ot as resizeSignature,
  Et as setupHighDPICanvas,
  Ke as signatureToSVG,
  qt as version
};
