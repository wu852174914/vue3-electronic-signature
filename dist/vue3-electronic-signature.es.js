var Ne = Object.defineProperty;
var je = (s, t, n) => t in s ? Ne(s, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : s[t] = n;
var M = (s, t, n) => (je(s, typeof t != "symbol" ? t + "" : t, n), n);
import { defineComponent as Ge, ref as D, computed as P, watch as N, nextTick as j, onMounted as Ve, onUnmounted as Qe, openBlock as O, createElementBlock as J, normalizeStyle as G, createElementVNode as w, toDisplayString as V, createCommentVNode as Q } from "vue";
function Me(s, t) {
  return Math.sqrt(
    Math.pow(t.x - s.x, 2) + Math.pow(t.y - s.y, 2)
  );
}
function Ke(s, t) {
  return Math.atan2(t.y - s.y, t.x - s.x);
}
function Ze(s, t, n, a) {
  const i = t || s, r = n || s, u = 0.2, h = Ke(i, r) * (a ? 1 : -1), l = Me(i, r) * u;
  return {
    x: s.x + Math.cos(h) * l,
    y: s.y + Math.sin(h) * l,
    time: s.time
  };
}
function et(s, t, n) {
  if (!n.pressure.enabled)
    return n.strokeWidth;
  const a = Me(s, t), i = t.time - s.time, r = i > 0 ? a / i : 0, u = Math.max(0.1, Math.min(1, 1 - r * 0.01)), { min: h, max: l } = n.pressure;
  return h + (l - h) * u;
}
function Et(s, t, n) {
  if (t.length < 2)
    return;
  if (s.strokeStyle = n.strokeColor, s.lineCap = "round", s.lineJoin = "round", !n.smoothing || t.length < 3) {
    s.beginPath(), s.lineWidth = n.strokeWidth, s.moveTo(t[0].x, t[0].y);
    for (let i = 1; i < t.length; i++)
      s.lineTo(t[i].x, t[i].y);
    s.stroke();
    return;
  }
  s.beginPath(), s.moveTo(t[0].x, t[0].y);
  for (let i = 1; i < t.length - 1; i++) {
    const r = t[i], u = t[i + 1];
    n.pressure.enabled ? s.lineWidth = et(t[i - 1], r, n) : s.lineWidth = n.strokeWidth;
    const h = Ze(r, t[i - 1], u);
    s.quadraticCurveTo(h.x, h.y, r.x, r.y);
  }
  const a = t[t.length - 1];
  s.lineTo(a.x, a.y), s.stroke();
}
function tt(s) {
  const { canvasSize: t, paths: n } = s;
  let a = `<svg width="${t.width}" height="${t.height}" xmlns="http://www.w3.org/2000/svg">`;
  return n.forEach((i) => {
    if (i.points.length < 2)
      return;
    let r = `M ${i.points[0].x} ${i.points[0].y}`;
    for (let u = 1; u < i.points.length; u++)
      r += ` L ${i.points[u].x} ${i.points[u].y}`;
    a += `<path d="${r}" stroke="${i.strokeColor}" stroke-width="${i.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), a += "</svg>", a;
}
function at(s, t, n = { format: "png" }) {
  const { format: a, quality: i = 0.9, size: r, backgroundColor: u } = n;
  if (a === "svg")
    return tt(t);
  const h = document.createElement("canvas"), l = h.getContext("2d");
  if (r) {
    h.width = r.width, h.height = r.height;
    const m = r.width / s.width, v = r.height / s.height;
    l.scale(m, v);
  } else
    h.width = s.width, h.height = s.height;
  switch (u && u !== "transparent" && (l.fillStyle = u, l.fillRect(0, 0, h.width, h.height)), l.drawImage(s, 0, 0), a) {
    case "jpeg":
      return h.toDataURL("image/jpeg", i);
    case "base64":
      return h.toDataURL("image/png").split(",")[1];
    case "png":
    default:
      return h.toDataURL("image/png");
  }
}
function nt(s, t) {
  return new Promise((n, a) => {
    const i = new Image();
    i.onload = () => {
      const r = s.getContext("2d");
      r.clearRect(0, 0, s.width, s.height), r.drawImage(i, 0, 0, s.width, s.height), n();
    }, i.onerror = a, i.src = t;
  });
}
function z(s) {
  return s.paths.length === 0 || s.paths.every((t) => t.points.length === 0);
}
function B(s, t) {
  return {
    paths: [],
    canvasSize: { width: s, height: t },
    timestamp: Date.now(),
    isEmpty: !0
  };
}
function $(s) {
  return JSON.parse(JSON.stringify(s));
}
class ot {
  constructor(t) {
    M(this, "canvas");
    M(this, "ctx");
    M(this, "replayData", null);
    M(this, "state", "idle");
    M(this, "currentTime", 0);
    M(this, "speed", 1);
    M(this, "animationId", null);
    M(this, "startTimestamp", 0);
    M(this, "pausedTime", 0);
    M(this, "options", {});
    // 事件回调
    M(this, "eventCallbacks", /* @__PURE__ */ new Map());
    this.canvas = t, this.ctx = t.getContext("2d");
  }
  /**
   * 设置回放数据
   */
  setReplayData(t, n = {}) {
    console.log("设置回放数据:", t), console.log("回放选项:", n), this.replayData = t, this.options = { ...n }, this.speed = n.speed || t.speed || 1, this.currentTime = n.startTime || 0, this.state = "idle", console.log("回放数据设置完成，路径数量:", t.paths.length), console.log("总时长:", t.totalDuration);
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
    const n = this.options.endTime || this.replayData.totalDuration;
    this.currentTime = Math.max(0, Math.min(t, n)), this.state === "playing" ? this.startTimestamp = performance.now() - this.currentTime / this.speed : this.pausedTime = this.currentTime / this.speed, this.renderFrame(this.currentTime);
  }
  /**
   * 设置播放速度
   */
  setSpeed(t) {
    const n = this.state === "playing";
    n && this.pause(), this.speed = Math.max(0.1, Math.min(5, t)), this.emit("replay-speed-change", this.speed), n && this.play();
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
  renderFrame(t) {
    if (!this.replayData)
      return;
    this.clearCanvas();
    let n = !1;
    for (let a = 0; a < this.replayData.paths.length; a++) {
      const i = this.replayData.paths[a], r = i.startTime || 0, u = i.endTime || r + (i.duration || 0);
      if (t < r)
        break;
      if (t >= u) {
        this.drawCompletePath(i), !n && Math.abs(t - u) < 32 && this.emit("replay-path-end", a, i);
        continue;
      }
      n = !0;
      const h = Math.max(0, Math.min(1, (t - r) / Math.max(u - r, 1)));
      h > 0 && Math.abs(t - r) < 32 && this.emit("replay-path-start", a, i), this.drawPartialPath(i, h);
      break;
    }
  }
  /**
   * 绘制完整路径 - 使用与录制时相同的算法
   */
  drawCompletePath(t) {
    if (t.points.length < 2)
      return;
    const n = this.options.drawOptions || {
      strokeColor: t.strokeColor,
      strokeWidth: t.strokeWidth,
      smoothing: !0,
      pressure: { enabled: !1, min: 1, max: 4 }
    };
    this.drawPathWithSmoothAlgorithm(t.points, {
      ...n,
      strokeColor: t.strokeColor,
      // 保持路径自己的颜色
      strokeWidth: t.strokeWidth
      // 保持路径自己的宽度
    });
  }
  /**
   * 绘制部分路径 - 使用与录制时相同的算法
   */
  drawPartialPath(t, n) {
    if (t.points.length < 2)
      return;
    const a = t.startTime || 0, i = t.duration || 0, r = a + i * n, u = this.getPointsUpToTime(t.points, a, r);
    if (u.length < 2)
      return;
    const h = this.options.drawOptions || {
      strokeColor: t.strokeColor,
      strokeWidth: t.strokeWidth,
      smoothing: !0,
      pressure: { enabled: !1, min: 1, max: 4 }
    };
    this.drawPathWithSmoothAlgorithm(u, {
      ...h,
      strokeColor: t.strokeColor,
      // 保持路径自己的颜色
      strokeWidth: t.strokeWidth
      // 保持路径自己的宽度
    });
  }
  /**
   * 获取指定时间内的所有点
   */
  getPointsUpToTime(t, n, a) {
    const i = [];
    for (let r = 0; r < t.length; r++) {
      const u = t[r], h = n + (u.relativeTime || r * 50);
      if (h <= a)
        i.push(u);
      else {
        if (r > 0) {
          const l = t[r - 1], m = n + (l.relativeTime || (r - 1) * 50);
          if (m <= a) {
            const v = (a - m) / (h - m), c = {
              x: l.x + (u.x - l.x) * v,
              y: l.y + (u.y - l.y) * v,
              time: a,
              pressure: l.pressure ? l.pressure + (u.pressure || l.pressure - l.pressure) * v : u.pressure
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
  drawPathWithSmoothAlgorithm(t, n) {
    if (t.length < 2)
      return;
    if (this.ctx.strokeStyle = n.strokeColor, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", !n.smoothing || t.length < 3) {
      this.ctx.beginPath(), this.ctx.lineWidth = n.strokeWidth, this.ctx.moveTo(t[0].x, t[0].y);
      for (let i = 1; i < t.length; i++)
        this.ctx.lineTo(t[i].x, t[i].y);
      this.ctx.stroke();
      return;
    }
    this.ctx.beginPath(), this.ctx.moveTo(t[0].x, t[0].y);
    for (let i = 1; i < t.length - 1; i++) {
      const r = t[i], u = t[i + 1];
      this.ctx.lineWidth = n.strokeWidth;
      const h = this.getControlPoint(r, t[i - 1], u);
      this.ctx.quadraticCurveTo(h.x, h.y, r.x, r.y);
    }
    const a = t[t.length - 1];
    this.ctx.lineTo(a.x, a.y), this.ctx.stroke();
  }
  /**
   * 获取控制点（用于贝塞尔曲线平滑） - 与signature.ts中的实现一致
   */
  getControlPoint(t, n, a) {
    const r = {
      length: Math.sqrt(Math.pow(a.x - n.x, 2) + Math.pow(a.y - n.y, 2)),
      angle: Math.atan2(a.y - n.y, a.x - n.x)
    }, u = r.angle + Math.PI, h = r.length * 0.2;
    return {
      x: t.x + Math.cos(u) * h,
      y: t.y + Math.sin(u) * h,
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
  on(t, n) {
    this.eventCallbacks.has(t) || this.eventCallbacks.set(t, []), this.eventCallbacks.get(t).push(n);
  }
  /**
   * 移除事件监听器
   */
  off(t, n) {
    if (this.eventCallbacks.has(t))
      if (n) {
        const a = this.eventCallbacks.get(t), i = a.indexOf(n);
        i > -1 && a.splice(i, 1);
      } else
        this.eventCallbacks.delete(t);
  }
  /**
   * 触发事件
   */
  emit(t, ...n) {
    const a = this.eventCallbacks.get(t);
    a && a.forEach((i) => i(...n));
  }
  /**
   * 销毁控制器
   */
  destroy() {
    this.stop(), this.eventCallbacks.clear(), this.replayData = null;
  }
}
function st(s) {
  const t = s.paths.map((l) => {
    const m = l.points.map((c, b) => {
      var T;
      let y;
      if (c.time && l.points[0].time)
        y = c.time - l.points[0].time;
      else if (b === 0)
        y = 0;
      else {
        const A = l.points[b - 1], S = Math.sqrt(
          Math.pow(c.x - A.x, 2) + Math.pow(c.y - A.y, 2)
        ) / 100 * 1e3;
        y = (((T = m[b - 1]) == null ? void 0 : T.relativeTime) || 0) + Math.max(S, 16);
      }
      return {
        ...c,
        relativeTime: y
      };
    }), v = m.length > 0 ? m[m.length - 1].relativeTime : 0;
    return {
      ...l,
      points: m,
      duration: v
    };
  }), n = [];
  for (let l = 0; l < t.length; l++) {
    const m = t[l];
    let v;
    if (l === 0)
      v = 0;
    else {
      const y = n[l - 1], T = it(
        s.paths[l - 1].points,
        s.paths[l].points
      );
      v = y.endTime + T;
    }
    const c = v + m.duration, b = {
      ...m,
      startTime: v,
      endTime: c
    };
    console.log(`路径 ${l}: 开始时间=${v}, 结束时间=${c}, 持续时间=${m.duration}`), n.push(b);
  }
  const a = n.length > 0 ? n[n.length - 1].endTime : 0;
  console.log("回放数据生成完成:"), console.log("- 路径数量:", n.length), console.log("- 总时长:", a), console.log("- 路径详情:", n.map((l) => ({
    startTime: l.startTime,
    endTime: l.endTime,
    duration: l.duration,
    pointCount: l.points.length
  })));
  const i = n.reduce((l, m) => l + rt(m.points), 0), r = a > 0 ? i / (a / 1e3) : 0, u = n.slice(1).map((l, m) => {
    const v = n[m];
    return l.startTime - v.endTime;
  }), h = u.length > 0 ? u.reduce((l, m) => l + m, 0) / u.length : 0;
  return {
    paths: n,
    totalDuration: a,
    speed: 1,
    metadata: {
      deviceType: lt(s),
      averageSpeed: r,
      totalDistance: i,
      averagePauseTime: h
    }
  };
}
function it(s, t) {
  if (s.length === 0 || t.length === 0)
    return 200;
  const n = s[s.length - 1], a = t[0];
  if (n.time && a.time)
    return Math.max(a.time - n.time, 50);
  const i = Math.sqrt(
    Math.pow(a.x - n.x, 2) + Math.pow(a.y - n.y, 2)
  );
  return Math.min(Math.max(i * 2, 100), 1e3);
}
function lt(s) {
  const t = s.paths.reduce((r, u) => r + u.points.length, 0), n = s.paths.length;
  if (t === 0)
    return "touch";
  const a = t / n;
  return a > 20 ? "touch" : a < 10 ? "mouse" : s.paths.some(
    (r) => r.points.some((u) => u.pressure !== void 0)
  ) ? "pen" : "touch";
}
function rt(s) {
  let t = 0;
  for (let n = 1; n < s.length; n++) {
    const a = s[n].x - s[n - 1].x, i = s[n].y - s[n - 1].y;
    t += Math.sqrt(a * a + i * i);
  }
  return t;
}
const Pe = {
  pen: {
    name: "钢笔",
    description: "极细线条，锐利精准，商务签名",
    strokeWidth: 1,
    smoothing: !0,
    pressure: {
      enabled: !1,
      min: 1,
      max: 1
    },
    lineCap: "butt",
    lineJoin: "miter",
    recommendedColor: "#000080"
  },
  brush: {
    name: "毛笔",
    description: "粗细变化极大，传统书法效果",
    strokeWidth: 8,
    smoothing: !0,
    pressure: {
      enabled: !0,
      min: 1,
      max: 16
    },
    lineCap: "round",
    lineJoin: "round",
    recommendedColor: "#2c3e50"
  },
  marker: {
    name: "马克笔",
    description: "超粗线条，荧光笔效果",
    strokeWidth: 12,
    smoothing: !1,
    pressure: {
      enabled: !1,
      min: 10,
      max: 14
    },
    lineCap: "square",
    lineJoin: "bevel",
    recommendedColor: "#ff6b35"
  },
  pencil: {
    name: "铅笔",
    description: "粗糙纹理，素描效果",
    strokeWidth: 3,
    smoothing: !1,
    pressure: {
      enabled: !0,
      min: 2,
      max: 5
    },
    lineCap: "round",
    lineJoin: "round",
    recommendedColor: "#666666"
  },
  ballpoint: {
    name: "圆珠笔",
    description: "细线条，轻微断续效果",
    strokeWidth: 1.2,
    smoothing: !0,
    pressure: {
      enabled: !0,
      min: 0.8,
      max: 1.8
    },
    lineCap: "round",
    lineJoin: "round",
    recommendedColor: "#1e3a8a"
  }
};
function ht(s) {
  return Pe[s];
}
function At() {
  return Object.entries(Pe).map(([s, t]) => ({
    key: s,
    config: t
  }));
}
function ut(s, t) {
  const n = ht(s);
  return {
    strokeWidth: n.strokeWidth,
    smoothing: n.smoothing,
    pressure: n.pressure,
    lineCap: n.lineCap,
    lineJoin: n.lineJoin,
    strokeColor: t || n.recommendedColor || "#000000"
  };
}
const ct = ["width", "height"], dt = {
  key: 1,
  class: "signature-toolbar"
}, mt = ["disabled"], pt = ["disabled"], gt = ["disabled"], vt = {
  key: 2,
  class: "replay-controls"
}, yt = { class: "replay-buttons" }, ft = ["disabled"], kt = { key: 0 }, wt = { key: 1 }, bt = ["disabled"], Tt = { class: "replay-progress" }, Ct = ["max", "value", "disabled"], Mt = { class: "time-display" }, Pt = { class: "replay-speed" }, St = /* @__PURE__ */ Ge({
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
  setup(s, { expose: t, emit: n }) {
    const a = s, i = n, r = D(), u = D(!1), h = D(null), l = D(B(0, 0)), m = D([]), v = D(-1), c = D(null), b = D(!1), y = D("idle"), T = D(0), A = D(0), W = P(() => typeof a.width == "number" ? a.width : 800), S = P(() => typeof a.height == "number" ? a.height : 300), xe = P(() => ({
      position: "relative",
      display: "inline-block",
      width: typeof a.width == "string" ? a.width : `${a.width}px`,
      height: typeof a.height == "string" ? a.height : `${a.height}px`
    })), De = P(() => ({
      border: a.borderStyle,
      borderRadius: a.borderRadius,
      backgroundColor: a.backgroundColor,
      cursor: a.disabled ? "not-allowed" : "crosshair",
      display: "block",
      width: "100%",
      height: "100%"
    })), We = P(() => ({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "#999",
      fontSize: "14px",
      pointerEvents: "none",
      userSelect: "none"
    })), _e = P(() => b.value ? !1 : a.placeholder && z(l.value)), K = P(() => v.value > 0), Z = P(() => v.value < m.value.length - 1), ee = P(() => b.value && c.value), _ = P(() => !ee.value && !a.disabled), Re = P(() => {
      var e;
      return ee.value && ((e = a.replayOptions) == null ? void 0 : e.showControls) !== !1;
    }), R = P(() => {
      if (a.penStyle) {
        const e = ut(a.penStyle, a.strokeColor);
        return {
          strokeColor: e.strokeColor,
          strokeWidth: a.strokeWidth || e.strokeWidth,
          smoothing: a.smoothing !== void 0 ? a.smoothing : e.smoothing,
          pressure: {
            enabled: a.pressureSensitive !== void 0 ? a.pressureSensitive : e.pressure.enabled,
            min: a.minStrokeWidth || e.pressure.min,
            max: a.maxStrokeWidth || e.pressure.max
          },
          lineCap: e.lineCap,
          lineJoin: e.lineJoin
        };
      }
      return {
        strokeColor: a.strokeColor || "#000000",
        strokeWidth: a.strokeWidth || 2,
        smoothing: a.smoothing !== void 0 ? a.smoothing : !0,
        pressure: {
          enabled: a.pressureSensitive || !1,
          min: a.minStrokeWidth || 1,
          max: a.maxStrokeWidth || 4
        },
        lineCap: "round",
        lineJoin: "round"
      };
    }), te = () => {
      var e;
      return ((e = r.value) == null ? void 0 : e.getContext("2d")) || null;
    }, q = (e, o) => {
      const p = r.value, f = p.getBoundingClientRect(), d = p.width / f.width, g = p.height / f.height;
      return {
        x: (e - f.left) * d,
        y: (o - f.top) * g,
        time: Date.now()
      };
    }, ae = (e) => {
      if (!_.value)
        return;
      u.value = !0;
      const o = performance.now(), p = { ...e, time: o };
      h.value = {
        points: [p],
        strokeColor: a.strokeColor,
        strokeWidth: a.strokeWidth,
        startTime: o,
        endTime: o,
        duration: 0
      }, i("signature-start");
    }, L = (e, o, p, f) => {
      switch (p) {
        case "pen":
          return 1;
        case "brush":
          if (o) {
            const x = Math.sqrt(Math.pow(e.x - o.x, 2) + Math.pow(e.y - o.y, 2)), C = Math.max(1, (e.time || 0) - (o.time || 0)), E = x / C, X = Math.max(0.1, Math.min(3, 100 / Math.max(E, 1))), Ue = e.pressure || 0.5, He = 0.8 + Math.random() * 0.4;
            return Math.max(1, Math.min(20, f * X * (0.3 + Ue * 1.4) * He));
          }
          return f;
        case "marker":
          return 12;
        case "pencil":
          const d = e.pressure || 0.5, g = 0.9 + Math.random() * 0.2;
          return f * (0.7 + d * 0.6) * g;
        case "ballpoint":
          const k = e.pressure || 0.5;
          return f * (0.8 + k * 0.4);
        default:
          return f;
      }
    }, U = (e, o, p) => {
      var f;
      if (!(o.length < 2))
        switch (e.strokeStyle = ((f = h.value) == null ? void 0 : f.strokeColor) || R.value.strokeColor, e.lineCap = R.value.lineCap || "round", e.lineJoin = R.value.lineJoin || "round", p) {
          case "pen":
            if (e.lineWidth = 1, e.lineCap = "butt", e.lineJoin = "miter", e.beginPath(), e.moveTo(o[0].x, o[0].y), o.length >= 3) {
              for (let d = 1; d < o.length - 1; d++) {
                const g = ne(o[d], o[d - 1], o[d + 1]);
                e.quadraticCurveTo(g.x, g.y, o[d].x, o[d].y);
              }
              e.lineTo(o[o.length - 1].x, o[o.length - 1].y);
            } else
              for (let d = 1; d < o.length; d++)
                e.lineTo(o[d].x, o[d].y);
            e.stroke();
            break;
          case "brush":
            e.lineCap = "round", e.lineJoin = "round";
            for (let d = 1; d < o.length; d++) {
              const g = o[d], k = o[d - 1], x = L(g, k, p, R.value.strokeWidth), C = e.createLinearGradient(k.x, k.y, g.x, g.y);
              C.addColorStop(0, e.strokeStyle), C.addColorStop(1, e.strokeStyle), e.lineWidth = x, e.beginPath(), e.moveTo(k.x, k.y), e.lineTo(g.x, g.y), e.stroke(), x > 8 && Math.random() > 0.6 && (e.globalAlpha = 0.2, e.beginPath(), e.arc(g.x, g.y, x * 0.3, 0, Math.PI * 2), e.fill(), e.globalAlpha = 1);
            }
            break;
          case "marker":
            e.globalAlpha = 0.7, e.lineWidth = 12, e.lineCap = "square", e.lineJoin = "bevel", e.beginPath(), e.moveTo(o[0].x, o[0].y);
            for (let d = 1; d < o.length; d++)
              e.lineTo(o[d].x, o[d].y);
            e.stroke(), e.globalAlpha = 0.3, e.lineWidth = 16, e.beginPath(), e.moveTo(o[0].x, o[0].y);
            for (let d = 1; d < o.length; d++)
              e.lineTo(o[d].x, o[d].y);
            e.stroke(), e.globalAlpha = 1;
            break;
          case "pencil":
            e.lineCap = "round", e.lineJoin = "round";
            for (let d = 1; d < o.length; d++) {
              const g = o[d], k = o[d - 1], x = L(g, k, p, R.value.strokeWidth);
              e.lineWidth = x, e.globalAlpha = 0.8, e.beginPath(), e.moveTo(k.x, k.y), e.lineTo(g.x, g.y), e.stroke();
              for (let C = 0; C < 3; C++)
                if (Math.random() > 0.5) {
                  e.globalAlpha = 0.2, e.lineWidth = x * 0.3;
                  const E = (Math.random() - 0.5) * 2, X = (Math.random() - 0.5) * 2;
                  e.beginPath(), e.moveTo(k.x + E, k.y + X), e.lineTo(g.x + E, g.y + X), e.stroke();
                }
              if (Math.random() > 0.8) {
                e.globalAlpha = 0.4;
                for (let C = 0; C < 5; C++)
                  e.beginPath(), e.arc(
                    g.x + (Math.random() - 0.5) * 3,
                    g.y + (Math.random() - 0.5) * 3,
                    Math.random() * 0.8,
                    0,
                    Math.PI * 2
                  ), e.fill();
              }
            }
            e.globalAlpha = 1;
            break;
          case "ballpoint":
            e.lineCap = "round", e.lineJoin = "round";
            for (let d = 1; d < o.length; d++) {
              const g = o[d], k = o[d - 1], x = L(g, k, p, R.value.strokeWidth);
              if (Math.random() > 0.1) {
                if (e.lineWidth = x, e.globalAlpha = Math.random() > 0.2 ? 1 : 0.7, e.beginPath(), R.value.smoothing && d < o.length - 1) {
                  const C = o[d + 1], E = ne(g, k, C);
                  e.moveTo(k.x, k.y), e.quadraticCurveTo(E.x, E.y, g.x, g.y);
                } else
                  e.moveTo(k.x, k.y), e.lineTo(g.x, g.y);
                e.stroke();
              }
              Math.random() > 0.95 && (e.globalAlpha = 0.8, e.beginPath(), e.arc(g.x, g.y, x * 0.8, 0, Math.PI * 2), e.fill());
            }
            e.globalAlpha = 1;
            break;
        }
    }, Ie = () => {
      if (!h.value || h.value.points.length < 2)
        return;
      const e = te();
      if (!e)
        return;
      const o = h.value.points, p = o.length, f = a.penStyle || "pen";
      if (p === 2)
        U(e, o, f);
      else if (p >= 3) {
        const d = o.slice(-3);
        U(e, d, f);
      }
    }, ne = (e, o, p) => {
      const d = {
        length: Math.sqrt(Math.pow(p.x - o.x, 2) + Math.pow(p.y - o.y, 2)),
        angle: Math.atan2(p.y - o.y, p.x - o.x)
      }, g = d.angle + Math.PI, k = d.length * 0.2;
      return {
        x: e.x + Math.cos(g) * k,
        y: e.y + Math.sin(g) * k,
        time: e.time || 0
      };
    }, Ee = (e, o) => {
      if (o.points.length < 2)
        return;
      const p = a.penStyle || "pen", f = h.value;
      h.value = o, U(e, o.points, p), h.value = f;
    }, oe = (e) => {
      if (!u.value || !h.value || !_.value)
        return;
      const o = performance.now(), p = { ...e, time: o };
      h.value.points.push(p), h.value.startTime && (h.value.endTime = o, h.value.duration = o - h.value.startTime), Ie(), re(), i("signature-drawing", l.value);
    }, se = () => {
      if (!(!u.value || !h.value)) {
        if (u.value = !1, h.value.points.length > 0) {
          const e = h.value.points[h.value.points.length - 1];
          e.time && h.value.startTime && (h.value.endTime = e.time, h.value.duration = e.time - h.value.startTime);
        }
        l.value.paths.push(h.value), l.value.isEmpty = !1, l.value.timestamp = Date.now(), F(), I(), h.value = null, i("signature-end", l.value);
      }
    }, Ae = (e) => {
      e.preventDefault();
      const o = q(e.clientX, e.clientY);
      ae(o);
    }, Oe = (e) => {
      if (e.preventDefault(), !u.value)
        return;
      const o = q(e.clientX, e.clientY);
      oe(o);
    }, ie = (e) => {
      e.preventDefault(), se();
    }, Je = (e) => {
      if (e.preventDefault(), e.touches.length !== 1)
        return;
      const o = e.touches[0], p = q(o.clientX, o.clientY);
      ae(p);
    }, $e = (e) => {
      if (e.preventDefault(), e.touches.length !== 1 || !u.value)
        return;
      const o = e.touches[0], p = q(o.clientX, o.clientY);
      oe(p);
    }, le = (e) => {
      e.preventDefault(), se();
    }, re = () => {
      l.value.canvasSize = {
        width: W.value,
        height: S.value
      }, l.value.isEmpty = z(l.value);
    }, F = () => {
      m.value = m.value.slice(0, v.value + 1), m.value.push($(l.value)), v.value = m.value.length - 1;
      const e = 50;
      m.value.length > e && (m.value = m.value.slice(-e), v.value = m.value.length - 1);
    }, I = () => {
      const e = te();
      e && (e.clearRect(0, 0, W.value, S.value), a.backgroundColor && a.backgroundColor !== "transparent" && (e.fillStyle = a.backgroundColor, e.fillRect(0, 0, W.value, S.value)), l.value.paths.forEach((o) => {
        o.points.length > 0 && Ee(e, o);
      }));
    }, Y = () => {
      if (console.log("初始化回放控制器"), console.log("canvas引用是否存在:", !!r.value), !r.value) {
        console.error("canvas引用不存在，无法初始化回放控制器");
        return;
      }
      c.value && (console.log("销毁现有回放控制器"), c.value.destroy()), console.log("创建新的回放控制器"), c.value = new ot(r.value), console.log("回放控制器创建成功:", !!c.value), c.value.on("replay-start", () => {
        y.value = "playing", i("replay-start");
      }), c.value.on("replay-progress", (e, o) => {
        T.value = e, A.value = o, i("replay-progress", e, o);
      }), c.value.on("replay-pause", () => {
        y.value = "paused", i("replay-pause");
      }), c.value.on("replay-resume", () => {
        y.value = "playing", i("replay-resume");
      }), c.value.on("replay-stop", () => {
        y.value = "stopped", i("replay-stop");
      }), c.value.on("replay-complete", () => {
        y.value = "completed", i("replay-complete");
      }), c.value.on("replay-path-start", (e, o) => {
        i("replay-path-start", e, o);
      }), c.value.on("replay-path-end", (e, o) => {
        i("replay-path-end", e, o);
      }), c.value.on("replay-speed-change", (e) => {
        i("replay-speed-change", e);
      });
    }, he = (e, o) => {
      if (c.value || Y(), c.value) {
        b.value = !0;
        const p = {
          ...o,
          drawOptions: R.value,
          penStyle: a.penStyle
        };
        c.value.setReplayData(e, p), console.log("startReplay调用，自动播放:", o == null ? void 0 : o.autoPlay), (o == null ? void 0 : o.autoPlay) === !0 && c.value.play();
      }
    }, ue = (e) => {
      b.value = e, !e && c.value && (c.value.stop(), I());
    }, qe = () => z(l.value) ? null : st(l.value), ce = () => {
      console.log("play方法被调用"), console.log("回放控制器是否存在:", !!c.value), c.value || (console.log("回放控制器不存在，尝试初始化"), Y()), c.value ? (console.log("调用回放控制器的play方法"), c.value.play()) : console.error("回放控制器初始化失败，无法播放");
    }, de = () => {
      var e;
      (e = c.value) == null || e.pause();
    }, me = () => {
      var e;
      (e = c.value) == null || e.stop();
    }, pe = (e) => {
      var o;
      (o = c.value) == null || o.seek(e);
    }, ge = (e) => {
      var o;
      (o = c.value) == null || o.setSpeed(e);
    }, Fe = () => {
      var e;
      return ((e = c.value) == null ? void 0 : e.getState()) || "idle";
    }, Ye = () => {
      var e;
      return ((e = c.value) == null ? void 0 : e.getCurrentTime()) || 0;
    }, H = () => {
      var e;
      return ((e = c.value) == null ? void 0 : e.getTotalDuration()) || 0;
    }, Xe = () => {
      var e;
      return ((e = c.value) == null ? void 0 : e.getProgress()) || 0;
    }, ve = (e) => {
      const o = Math.floor(e / 1e3), p = Math.floor(o / 60), f = o % 60;
      return `${p}:${f.toString().padStart(2, "0")}`;
    }, ye = () => {
      _.value && (l.value = B(W.value, S.value), I(), F(), i("signature-clear"));
    }, fe = () => {
      !K.value || !_.value || (v.value--, l.value = $(m.value[v.value]), I(), i("signature-undo", l.value));
    }, ke = () => {
      !Z.value || !_.value || (v.value++, l.value = $(m.value[v.value]), I(), i("signature-redo", l.value));
    }, we = (e) => {
      const o = r.value;
      return at(o, l.value, e);
    }, be = () => z(l.value), Te = async (e) => {
      if (!_.value)
        return;
      const o = r.value;
      await nt(o, e), l.value = B(W.value, S.value), l.value.isEmpty = !1, F();
    }, ze = () => $(l.value), Be = (e) => {
      _.value && (l.value = $(e), I(), F());
    }, Ce = (e, o) => {
      const p = e || W.value, f = o || S.value, d = we({ format: "png" });
      j(() => {
        const g = r.value;
        g.width = p, g.height = f, be() || Te(d), re();
      });
    }, Le = () => {
      const e = r.value;
      e.width = W.value, e.height = S.value, l.value = B(W.value, S.value), m.value = [$(l.value)], v.value = 0, I();
    };
    return N([() => a.width, () => a.height], () => {
      j(() => {
        r.value && Ce();
      });
    }), N(() => a.replayMode, (e) => {
      e !== void 0 && ue(e);
    }), N(() => a.replayData, (e) => {
      if (console.log("watch监听到回放数据变化:", e), console.log("当前回放模式:", a.replayMode), console.log("回放控制器是否存在:", !!c.value), e && a.replayMode)
        if (c.value || (console.log("回放控制器未初始化，先初始化"), Y()), c.value) {
          console.log("开始设置回放数据到控制器");
          const o = {
            ...a.replayOptions,
            drawOptions: R.value,
            penStyle: a.penStyle
          };
          c.value.setReplayData(e, o), console.log("回放数据已更新:", e);
        } else
          console.error("回放控制器初始化失败");
      else
        e || console.log("回放数据为空，跳过设置"), a.replayMode || console.log("不在回放模式，跳过设置");
    }, { immediate: !0 }), Ve(() => {
      j(() => {
        Le(), Y(), a.replayMode && a.replayData && he(a.replayData, a.replayOptions);
      });
    }), Qe(() => {
      c.value && (c.value.destroy(), c.value = null);
    }), t({
      clear: ye,
      undo: fe,
      redo: ke,
      save: we,
      isEmpty: be,
      fromDataURL: Te,
      getSignatureData: ze,
      setSignatureData: Be,
      resize: Ce,
      // 回放相关方法
      startReplay: he,
      getReplayData: qe,
      setReplayMode: ue,
      play: ce,
      pause: de,
      stop: me,
      seek: pe,
      setSpeed: ge,
      getState: Fe,
      getCurrentTime: Ye,
      getTotalDuration: H,
      getProgress: Xe
    }), (e, o) => (O(), J("div", {
      class: "electronic-signature",
      style: G(xe.value)
    }, [
      w("canvas", {
        ref_key: "canvasRef",
        ref: r,
        width: W.value,
        height: S.value,
        style: G(De.value),
        onMousedown: Ae,
        onMousemove: Oe,
        onMouseup: ie,
        onMouseleave: ie,
        onTouchstart: Je,
        onTouchmove: $e,
        onTouchend: le,
        onTouchcancel: le
      }, null, 44, ct),
      _e.value ? (O(), J("div", {
        key: 0,
        class: "signature-placeholder",
        style: G(We.value)
      }, V(e.placeholder), 5)) : Q("", !0),
      e.showToolbar ? (O(), J("div", dt, [
        w("button", {
          onClick: ye,
          disabled: !_.value
        }, "清除", 8, mt),
        w("button", {
          onClick: fe,
          disabled: !_.value || !K.value
        }, "撤销", 8, pt),
        w("button", {
          onClick: ke,
          disabled: !_.value || !Z.value
        }, "重做", 8, gt)
      ])) : Q("", !0),
      Re.value ? (O(), J("div", vt, [
        w("div", yt, [
          w("button", {
            onClick: o[0] || (o[0] = (p) => y.value === "playing" ? de() : ce()),
            disabled: y.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            y.value === "playing" ? (O(), J("span", kt, "⏸️")) : (O(), J("span", wt, "▶️"))
          ], 8, ft),
          w("button", {
            onClick: o[1] || (o[1] = (p) => me()),
            disabled: y.value === "idle",
            class: "replay-btn stop-btn"
          }, " ⏹️ ", 8, bt)
        ]),
        w("div", Tt, [
          w("input", {
            type: "range",
            min: "0",
            max: H(),
            value: A.value,
            onInput: o[2] || (o[2] = (p) => pe(Number(p.target.value))),
            class: "progress-slider",
            disabled: y.value === "idle"
          }, null, 40, Ct),
          w("div", Mt, [
            w("span", null, V(ve(A.value)), 1),
            o[4] || (o[4] = w("span", null, "/", -1)),
            w("span", null, V(ve(H())), 1)
          ])
        ]),
        w("div", Pt, [
          o[6] || (o[6] = w("label", null, "速度:", -1)),
          w("select", {
            onChange: o[3] || (o[3] = (p) => ge(Number(p.target.value))),
            class: "speed-select"
          }, o[5] || (o[5] = [
            w("option", { value: "0.5" }, "0.5x", -1),
            w("option", {
              value: "1",
              selected: ""
            }, "1x", -1),
            w("option", { value: "1.5" }, "1.5x", -1),
            w("option", { value: "2" }, "2x", -1)
          ]), 32)
        ])
      ])) : Q("", !0)
    ], 4));
  }
});
const xt = (s, t) => {
  const n = s.__vccOpts || s;
  for (const [a, i] of t)
    n[a] = i;
  return n;
}, Se = /* @__PURE__ */ xt(St, [["__scopeId", "data-v-4831cb0a"]]);
function Dt() {
  return window.devicePixelRatio || 1;
}
function Ot(s) {
  const t = s.getContext("2d"), n = Dt(), a = s.clientWidth, i = s.clientHeight;
  return s.width = a * n, s.height = i * n, t.scale(n, n), s.style.width = a + "px", s.style.height = i + "px", t;
}
function Wt(s) {
  if (s.paths.length === 0)
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0
    };
  let t = 1 / 0, n = 1 / 0, a = -1 / 0, i = -1 / 0;
  return s.paths.forEach((r) => {
    r.points.forEach((u) => {
      t = Math.min(t, u.x), n = Math.min(n, u.y), a = Math.max(a, u.x), i = Math.max(i, u.y);
    });
  }), {
    minX: t,
    minY: n,
    maxX: a,
    maxY: i,
    width: a - t,
    height: i - n
  };
}
function Jt(s, t, n = 10) {
  const a = Wt(t);
  if (a.width === 0 || a.height === 0) {
    const l = document.createElement("canvas");
    return l.width = 1, l.height = 1, l;
  }
  const i = document.createElement("canvas"), r = i.getContext("2d"), u = a.width + n * 2, h = a.height + n * 2;
  return i.width = u, i.height = h, r.drawImage(
    s,
    a.minX - n,
    a.minY - n,
    u,
    h,
    0,
    0,
    u,
    h
  ), i;
}
function $t(s, t, n, a = !0) {
  const i = document.createElement("canvas"), r = i.getContext("2d");
  let u = t, h = n;
  if (a) {
    const l = s.width / s.height, m = t / n;
    l > m ? h = t / l : u = n * l;
  }
  return i.width = u, i.height = h, r.imageSmoothingEnabled = !0, r.imageSmoothingQuality = "high", r.drawImage(s, 0, 0, u, h), i;
}
function qt(s, t, n = {}) {
  const {
    fontSize: a = 12,
    fontFamily: i = "Arial",
    color: r = "#999",
    opacity: u = 0.5,
    position: h = "bottom-right"
  } = n, l = document.createElement("canvas"), m = l.getContext("2d");
  l.width = s.width, l.height = s.height, m.drawImage(s, 0, 0), m.font = `${a}px ${i}`, m.fillStyle = r, m.globalAlpha = u;
  const c = m.measureText(t).width, b = a;
  let y, T;
  switch (h) {
    case "top-left":
      y = 10, T = b + 10;
      break;
    case "top-right":
      y = s.width - c - 10, T = b + 10;
      break;
    case "bottom-left":
      y = 10, T = s.height - 10;
      break;
    case "bottom-right":
      y = s.width - c - 10, T = s.height - 10;
      break;
    case "center":
      y = (s.width - c) / 2, T = (s.height + b) / 2;
      break;
    default:
      y = s.width - c - 10, T = s.height - 10;
  }
  return m.fillText(t, y, T), m.globalAlpha = 1, l;
}
function Ft(s) {
  const t = document.createElement("canvas"), n = t.getContext("2d");
  t.width = s.width, t.height = s.height, n.drawImage(s, 0, 0);
  const a = n.getImageData(0, 0, s.width, s.height), i = a.data;
  for (let r = 0; r < i.length; r += 4) {
    const u = i[r] * 0.299 + i[r + 1] * 0.587 + i[r + 2] * 0.114;
    i[r] = u, i[r + 1] = u, i[r + 2] = u;
  }
  return n.putImageData(a, 0, 0), t;
}
const _t = (s) => {
  s.component("ElectronicSignature", Se);
}, Yt = {
  install: _t,
  ElectronicSignature: Se
}, Xt = "1.0.0";
export {
  Se as ElectronicSignature,
  Pe as PEN_STYLE_CONFIGS,
  ot as SignatureReplayController,
  qt as addWatermark,
  et as calculateStrokeWidth,
  $ as cloneSignatureData,
  Ft as convertToGrayscale,
  ut as createDrawOptionsFromPenStyle,
  B as createEmptySignatureData,
  st as createReplayData,
  Jt as cropSignature,
  Yt as default,
  Et as drawSmoothPath,
  at as exportSignature,
  At as getAllPenStyles,
  Ke as getAngle,
  Ze as getControlPoint,
  Dt as getDevicePixelRatio,
  Me as getDistance,
  ht as getPenStyleConfig,
  Wt as getSignatureBounds,
  z as isSignatureEmpty,
  nt as loadImageToCanvas,
  $t as resizeSignature,
  Ot as setupHighDPICanvas,
  tt as signatureToSVG,
  Xt as version
};
