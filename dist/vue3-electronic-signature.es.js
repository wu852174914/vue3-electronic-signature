var at = Object.defineProperty;
var st = (l, e, s) => e in l ? at(l, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : l[e] = s;
var M = (l, e, s) => (st(l, typeof e != "symbol" ? e + "" : e, s), s);
import { defineComponent as ot, ref as I, computed as R, watch as ee, nextTick as te, onMounted as it, onUnmounted as lt, openBlock as z, createElementBlock as Y, normalizeStyle as ne, createElementVNode as k, toDisplayString as ae, createCommentVNode as se } from "vue";
function Oe(l, e) {
  return Math.sqrt(
    Math.pow(e.x - l.x, 2) + Math.pow(e.y - l.y, 2)
  );
}
function rt(l, e) {
  return Math.atan2(e.y - l.y, e.x - l.x);
}
function ht(l, e, s, n) {
  const i = e || l, o = s || l, r = 0.2, c = rt(i, o) * (n ? 1 : -1), h = Oe(i, o) * r;
  return {
    x: l.x + Math.cos(c) * h,
    y: l.y + Math.sin(c) * h,
    time: l.time
  };
}
function ct(l, e, s) {
  if (!s.pressure.enabled)
    return s.strokeWidth;
  const n = Oe(l, e), i = e.time - l.time, o = i > 0 ? n / i : 0, r = Math.max(0.1, Math.min(1, 1 - o * 0.01)), { min: c, max: h } = s.pressure;
  return c + (h - c) * r;
}
function Bt(l, e, s) {
  if (e.length < 2)
    return;
  if (l.strokeStyle = s.strokeColor, l.lineCap = "round", l.lineJoin = "round", !s.smoothing || e.length < 3) {
    l.beginPath(), l.lineWidth = s.strokeWidth, l.moveTo(e[0].x, e[0].y);
    for (let i = 1; i < e.length; i++)
      l.lineTo(e[i].x, e[i].y);
    l.stroke();
    return;
  }
  l.beginPath(), l.moveTo(e[0].x, e[0].y);
  for (let i = 1; i < e.length - 1; i++) {
    const o = e[i], r = e[i + 1];
    s.pressure.enabled ? l.lineWidth = ct(e[i - 1], o, s) : l.lineWidth = s.strokeWidth;
    const c = ht(o, e[i - 1], r);
    l.quadraticCurveTo(c.x, c.y, o.x, o.y);
  }
  const n = e[e.length - 1];
  l.lineTo(n.x, n.y), l.stroke();
}
function ut(l) {
  const { canvasSize: e, paths: s } = l;
  let n = `<svg width="${e.width}" height="${e.height}" xmlns="http://www.w3.org/2000/svg">`;
  return s.forEach((i) => {
    if (i.points.length < 2)
      return;
    let o = `M ${i.points[0].x} ${i.points[0].y}`;
    for (let r = 1; r < i.points.length; r++)
      o += ` L ${i.points[r].x} ${i.points[r].y}`;
    n += `<path d="${o}" stroke="${i.strokeColor}" stroke-width="${i.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), n += "</svg>", n;
}
function dt(l, e, s = { format: "png" }) {
  const { format: n, quality: i = 0.9, size: o, backgroundColor: r } = s;
  if (n === "svg")
    return ut(e);
  const c = document.createElement("canvas"), h = c.getContext("2d");
  if (o) {
    c.width = o.width, c.height = o.height;
    const m = o.width / l.width, p = o.height / l.height;
    h.scale(m, p);
  } else
    c.width = l.width, c.height = l.height;
  switch (r && r !== "transparent" && (h.fillStyle = r, h.fillRect(0, 0, c.width, c.height)), h.drawImage(l, 0, 0), n) {
    case "jpeg":
      return c.toDataURL("image/jpeg", i);
    case "base64":
      return c.toDataURL("image/png").split(",")[1];
    case "png":
    default:
      return c.toDataURL("image/png");
  }
}
function mt(l, e) {
  return new Promise((s, n) => {
    const i = new Image();
    i.onload = () => {
      const o = l.getContext("2d");
      o.clearRect(0, 0, l.width, l.height), o.drawImage(i, 0, 0, l.width, l.height), s();
    }, i.onerror = n, i.src = e;
  });
}
function G(l) {
  return l.paths.length === 0 || l.paths.every((e) => e.points.length === 0);
}
function V(l, e) {
  return {
    paths: [],
    canvasSize: { width: l, height: e },
    timestamp: Date.now(),
    isEmpty: !0
  };
}
function X(l) {
  return JSON.parse(JSON.stringify(l));
}
class gt {
  constructor(e) {
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
    // 性能优化相关
    M(this, "offscreenCanvas", null);
    M(this, "offscreenCtx", null);
    M(this, "lastFrameImageBitmap", null);
    M(this, "renderThrottle", 0);
    M(this, "isRendering", !1);
    // 确定性随机数生成器（解决毛笔闪烁问题）
    M(this, "seededRandom");
    this.canvas = e, this.ctx = e.getContext("2d"), this.initializeOffscreenCanvas(), this.seededRandom = this.createSeededRandom();
  }
  /**
   * 创建确定性随机数生成器（解决毛笔等笔迹的闪烁问题）
   * 基于简单的线性同余生成器（LCG）算法
   */
  createSeededRandom() {
    return (e) => {
      const i = Math.pow(2, 32);
      return (1664525 * e + 1013904223) % i / i;
    };
  }
  /**
   * 初始化离屏画布用于性能优化
   */
  initializeOffscreenCanvas() {
    try {
      if (typeof OffscreenCanvas < "u" ? (this.offscreenCanvas = new OffscreenCanvas(this.canvas.width, this.canvas.height), this.offscreenCtx = this.offscreenCanvas.getContext("2d")) : (this.offscreenCanvas = document.createElement("canvas"), this.offscreenCanvas.width = this.canvas.width, this.offscreenCanvas.height = this.canvas.height, this.offscreenCtx = this.offscreenCanvas.getContext("2d")), this.offscreenCtx) {
        this.offscreenCtx.imageSmoothingEnabled = !0, this.offscreenCtx.imageSmoothingQuality = "high";
        try {
          this.offscreenCtx.textRenderingOptimization = "optimizeSpeed";
        } catch {
        }
      }
    } catch (e) {
      console.warn("Failed to initialize optimized offscreen canvas:", e), this.offscreenCanvas = document.createElement("canvas"), this.offscreenCanvas.width = this.canvas.width, this.offscreenCanvas.height = this.canvas.height, this.offscreenCtx = this.offscreenCanvas.getContext("2d");
    }
  }
  /**
   * 设置回放数据
   */
  setReplayData(e, s = {}) {
    console.log("设置回放数据:", e), console.log("回放选项:", s), this.replayData = e, this.options = { ...s }, this.speed = s.speed || e.speed || 1, this.currentTime = s.startTime || 0, this.state = "idle", this.resetOptimizationState(), console.log("回放数据设置完成，路径数量:", e.paths.length), console.log("总时长:", e.totalDuration);
  }
  /**
   * 重置优化状态
   */
  resetOptimizationState() {
    this.offscreenCanvas && (this.offscreenCanvas.width = this.canvas.width, this.offscreenCanvas.height = this.canvas.height);
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
   * 渲染指定时间的帧 - 高性能优化版本
   */
  renderFrame(e) {
    if (!this.replayData || !this.offscreenCanvas || !this.offscreenCtx)
      return;
    const s = performance.now();
    if (!(s - this.renderThrottle < 16) && (this.renderThrottle = s, !this.isRendering)) {
      this.isRendering = !0;
      try {
        this.renderToOffscreenCanvas(e), this.transferToMainCanvasSync();
      } finally {
        this.isRendering = !1;
      }
    }
  }
  /**
   * 高效地将离屏画布内容传输到主画布（同步版本）
   */
  transferToMainCanvasSync() {
    if (this.offscreenCanvas)
      try {
        this.ctx.imageSmoothingEnabled = !1, this.ctx.globalCompositeOperation = "copy", this.ctx.drawImage(this.offscreenCanvas, 0, 0), this.ctx.globalCompositeOperation = "source-over", this.ctx.imageSmoothingEnabled = !0;
      } catch {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height), this.ctx.drawImage(this.offscreenCanvas, 0, 0);
      }
  }
  /**
   * 在离屏画布上渲染完整帧
   */
  renderToOffscreenCanvas(e) {
    if (!this.replayData || !this.offscreenCtx)
      return;
    const s = this.offscreenCanvas, n = this.offscreenCtx;
    n.globalCompositeOperation = "copy", n.fillStyle = "transparent", n.fillRect(0, 0, s.width, s.height), n.globalCompositeOperation = "source-over";
    let i = !1;
    for (let o = 0; o < this.replayData.paths.length; o++) {
      const r = this.replayData.paths[o], c = r.startTime || 0, h = r.endTime || c + (r.duration || 0);
      if (e < c)
        break;
      if (e >= h) {
        this.drawCompletePathToOffscreen(r), !i && Math.abs(e - h) < 32 && this.emit("replay-path-end", o, r);
        continue;
      }
      i = !0;
      const m = Math.max(0, Math.min(1, (e - c) / Math.max(h - c, 1)));
      m > 0 && Math.abs(e - c) < 32 && this.emit("replay-path-start", o, r), this.drawPartialPathToOffscreen(r, m);
      break;
    }
  }
  /**
   * 获取指定时间内的所有点
   */
  getPointsUpToTime(e, s, n) {
    const i = [];
    for (let o = 0; o < e.length; o++) {
      const r = e[o], c = s + (r.relativeTime || o * 50);
      if (c <= n)
        i.push(r);
      else {
        if (o > 0) {
          const h = e[o - 1], m = s + (h.relativeTime || (o - 1) * 50);
          if (m <= n) {
            const p = (n - m) / (c - m), u = {
              x: h.x + (r.x - h.x) * p,
              y: h.y + (r.y - h.y) * p,
              time: n,
              pressure: h.pressure ? h.pressure + (r.pressure || h.pressure - h.pressure) * p : r.pressure
            };
            i.push(u);
          }
        }
        break;
      }
    }
    return i;
  }
  /**
   * 根据笔迹样式计算动态线宽（与录制时一致）
   */
  calculateDynamicStrokeWidth(e, s, n, i) {
    switch (n) {
      case "pen":
        return 1;
      case "brush":
        if (s) {
          const b = Math.sqrt(Math.pow(e.x - s.x, 2) + Math.pow(e.y - s.y, 2)), v = Math.max(1, (e.time || 0) - (s.time || 0)), w = b / v, W = Math.max(0.1, Math.min(3, 100 / Math.max(w, 1))), S = e.pressure || 0.5, P = Math.floor(e.x * 1e3 + e.y * 1e3 + (e.time || 0)), F = 0.8 + this.seededRandom(P) * 0.4;
          return Math.max(1, Math.min(20, i * W * (0.3 + S * 1.4) * F));
        }
        return i;
      case "marker":
        return 12;
      case "pencil":
        const o = e.pressure || 0.5, r = Math.floor(e.x * 1e3 + e.y * 1e3 + (e.time || 0)), c = 0.9 + this.seededRandom(r + 1) * 0.2;
        return i * (0.7 + o * 0.6) * c;
      case "ballpoint":
        const h = e.pressure || 0.5;
        return i * (0.8 + h * 0.4);
      case "elegant":
        const m = e.pressure || 0.5;
        let p = 1;
        if (s) {
          const b = Math.sqrt(Math.pow(e.x - s.x, 2) + Math.pow(e.y - s.y, 2)), v = Math.max(1, (e.time || 0) - (s.time || 0)), w = b / v;
          p = Math.max(0.3, Math.min(2, 50 / Math.max(w, 1)));
        }
        const u = m * p;
        return i * (0.4 + u * 1.6);
      default:
        return i;
    }
  }
  /**
   * 根据笔迹样式绘制线段（与录制时完全一致）
   */
  drawStyledStrokeForReplay(e, s, n, i) {
    if (!(e.length < 2))
      switch (this.ctx.strokeStyle = n, s) {
        case "pen":
          if (this.ctx.lineWidth = 1, this.ctx.lineCap = "butt", this.ctx.lineJoin = "miter", this.ctx.beginPath(), this.ctx.moveTo(e[0].x, e[0].y), e.length >= 3) {
            for (let o = 1; o < e.length - 1; o++) {
              const r = this.getControlPoint(e[o], e[o - 1], e[o + 1]);
              this.ctx.quadraticCurveTo(r.x, r.y, e[o].x, e[o].y);
            }
            this.ctx.lineTo(e[e.length - 1].x, e[e.length - 1].y);
          } else
            for (let o = 1; o < e.length; o++)
              this.ctx.lineTo(e[o].x, e[o].y);
          this.ctx.stroke();
          break;
        case "brush":
          this.ctx.lineCap = "round", this.ctx.lineJoin = "round";
          for (let o = 1; o < e.length; o++) {
            const r = e[o], c = e[o - 1], h = this.calculateDynamicStrokeWidth(r, c, s, i);
            this.ctx.lineWidth = h, this.ctx.beginPath(), this.ctx.moveTo(c.x, c.y), this.ctx.lineTo(r.x, r.y), this.ctx.stroke();
            const m = Math.floor(r.x * 100 + r.y * 100 + o);
            h > 8 && this.seededRandom(m) > 0.6 && (this.ctx.globalAlpha = 0.2, this.ctx.beginPath(), this.ctx.arc(r.x, r.y, h * 0.3, 0, Math.PI * 2), this.ctx.fill(), this.ctx.globalAlpha = 1);
          }
          break;
        case "marker":
          this.ctx.globalAlpha = 0.7, this.ctx.lineWidth = 12, this.ctx.lineCap = "square", this.ctx.lineJoin = "bevel", this.ctx.beginPath(), this.ctx.moveTo(e[0].x, e[0].y);
          for (let o = 1; o < e.length; o++)
            this.ctx.lineTo(e[o].x, e[o].y);
          this.ctx.stroke(), this.ctx.globalAlpha = 0.3, this.ctx.lineWidth = 16, this.ctx.beginPath(), this.ctx.moveTo(e[0].x, e[0].y);
          for (let o = 1; o < e.length; o++)
            this.ctx.lineTo(e[o].x, e[o].y);
          this.ctx.stroke(), this.ctx.globalAlpha = 1;
          break;
        case "pencil":
          this.ctx.lineCap = "round", this.ctx.lineJoin = "round";
          for (let o = 1; o < e.length; o++) {
            const r = e[o], c = e[o - 1], h = this.calculateDynamicStrokeWidth(r, c, s, i);
            this.ctx.lineWidth = h, this.ctx.globalAlpha = 0.8, this.ctx.beginPath(), this.ctx.moveTo(c.x, c.y), this.ctx.lineTo(r.x, r.y), this.ctx.stroke();
            for (let p = 0; p < 3; p++) {
              const u = Math.floor(r.x * 10 + r.y * 10 + o * 10 + p);
              if (this.seededRandom(u) > 0.5) {
                this.ctx.globalAlpha = 0.2, this.ctx.lineWidth = h * 0.3;
                const b = (this.seededRandom(u + 1) - 0.5) * 2, v = (this.seededRandom(u + 2) - 0.5) * 2;
                this.ctx.beginPath(), this.ctx.moveTo(c.x + b, c.y + v), this.ctx.lineTo(r.x + b, r.y + v), this.ctx.stroke();
              }
            }
            const m = Math.floor(r.x * 5 + r.y * 5 + o * 5);
            if (this.seededRandom(m) > 0.8) {
              this.ctx.globalAlpha = 0.4;
              for (let p = 0; p < 5; p++) {
                const u = m + p * 10;
                this.ctx.beginPath(), this.ctx.arc(
                  r.x + (this.seededRandom(u + 1) - 0.5) * 3,
                  r.y + (this.seededRandom(u + 2) - 0.5) * 3,
                  this.seededRandom(u + 3) * 0.8,
                  0,
                  Math.PI * 2
                ), this.ctx.fill();
              }
            }
          }
          this.ctx.globalAlpha = 1;
          break;
        case "ballpoint":
          this.ctx.lineCap = "round", this.ctx.lineJoin = "round";
          for (let o = 1; o < e.length; o++) {
            const r = e[o], c = e[o - 1], h = this.calculateDynamicStrokeWidth(r, c, s, i), m = Math.floor(r.x * 50 + r.y * 50 + o);
            if (this.seededRandom(m) > 0.1) {
              if (this.ctx.lineWidth = h, this.ctx.globalAlpha = this.seededRandom(m + 1) > 0.2 ? 1 : 0.7, this.ctx.beginPath(), o < e.length - 1) {
                const u = e[o + 1], b = this.getControlPoint(r, c, u);
                this.ctx.moveTo(c.x, c.y), this.ctx.quadraticCurveTo(b.x, b.y, r.x, r.y);
              } else
                this.ctx.moveTo(c.x, c.y), this.ctx.lineTo(r.x, r.y);
              this.ctx.stroke();
            }
            const p = Math.floor(r.x * 20 + r.y * 20 + o * 3);
            this.seededRandom(p) > 0.95 && (this.ctx.globalAlpha = 0.8, this.ctx.beginPath(), this.ctx.arc(r.x, r.y, h * 0.8, 0, Math.PI * 2), this.ctx.fill());
          }
          this.ctx.globalAlpha = 1;
          break;
        case "elegant":
          this.drawElegantStroke(e, n, i);
          break;
      }
  }
  /**
   * 绘制优雅笔迹 - 基于Paper.js技术的平滑渐变效果
   */
  drawElegantStroke(e, s, n) {
    if (!(e.length < 2)) {
      this.ctx.strokeStyle = s, this.ctx.fillStyle = s, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", this.ctx.globalCompositeOperation = "source-over";
      for (let i = 1; i < e.length; i++) {
        const o = e[i], r = e[i - 1], c = this.calculateDynamicStrokeWidth(o, r, "elegant", n), h = i > 1 ? this.calculateDynamicStrokeWidth(r, e[i - 2], "elegant", n) : c;
        this.drawElegantSegment(r, o, h, c);
      }
      this.addElegantConnections(e, n);
    }
  }
  /**
   * 绘制优雅笔迹的单个线段 - 基于Paper.js的渐变技术
   */
  drawElegantSegment(e, s, n, i) {
    const o = Math.max(3, Math.floor(Math.sqrt(
      Math.pow(s.x - e.x, 2) + Math.pow(s.y - e.y, 2)
    ) / 2));
    this.ctx.beginPath();
    const r = [], c = [];
    for (let h = 0; h <= o; h++) {
      const m = h / o, p = this.smoothStep(m), u = e.x + (s.x - e.x) * p, b = e.y + (s.y - e.y) * p, v = n + (i - n) * p, w = s.x - e.x, W = s.y - e.y, S = Math.sqrt(w * w + W * W);
      if (S > 0) {
        const P = -W / S * v / 2, F = w / S * v / 2;
        r.push({ x: u + P, y: b + F }), c.push({ x: u - P, y: b - F });
      }
    }
    if (r.length > 0 && c.length > 0) {
      this.ctx.moveTo(r[0].x, r[0].y);
      for (let h = 1; h < r.length; h++)
        this.ctx.lineTo(r[h].x, r[h].y);
      for (let h = c.length - 1; h >= 0; h--)
        this.ctx.lineTo(c[h].x, c[h].y);
      this.ctx.closePath(), this.ctx.fill();
    }
  }
  /**
   * 添加连笔的优美效果 - 基于Paper.js的平滑连接技术
   */
  addElegantConnections(e, s) {
    for (let n = 1; n < e.length - 1; n++) {
      const i = e[n - 1], o = e[n], r = e[n + 1], c = Math.atan2(o.y - i.y, o.x - i.x), h = Math.atan2(r.y - o.y, r.x - o.x);
      if (Math.abs(h - c) > 0.3) {
        const p = this.calculateDynamicStrokeWidth(o, i, "elegant", s);
        this.ctx.beginPath(), this.ctx.arc(o.x, o.y, p / 3, 0, Math.PI * 2), this.ctx.fill();
      }
    }
  }
  /**
   * 平滑插值函数 - 基于Paper.js的平滑算法
   */
  smoothStep(e) {
    return e * e * (3 - 2 * e);
  }
  /**
   * 获取控制点（用于贝塞尔曲线平滑） - 与signature.ts中的实现一致
   */
  getControlPoint(e, s, n) {
    const o = {
      length: Math.sqrt(Math.pow(n.x - s.x, 2) + Math.pow(n.y - s.y, 2)),
      angle: Math.atan2(n.y - s.y, n.x - s.x)
    }, r = o.angle + Math.PI, c = o.length * 0.2;
    return {
      x: e.x + Math.cos(r) * c,
      y: e.y + Math.sin(r) * c,
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
  on(e, s) {
    this.eventCallbacks.has(e) || this.eventCallbacks.set(e, []), this.eventCallbacks.get(e).push(s);
  }
  /**
   * 移除事件监听器
   */
  off(e, s) {
    if (this.eventCallbacks.has(e))
      if (s) {
        const n = this.eventCallbacks.get(e), i = n.indexOf(s);
        i > -1 && n.splice(i, 1);
      } else
        this.eventCallbacks.delete(e);
  }
  /**
   * 触发事件
   */
  emit(e, ...s) {
    const n = this.eventCallbacks.get(e);
    n && n.forEach((i) => i(...s));
  }
  /**
   * 在离屏画布上绘制完整路径
   */
  drawCompletePathToOffscreen(e) {
    if (!this.offscreenCtx || e.points.length < 2)
      return;
    const s = this.ctx;
    this.ctx = this.offscreenCtx;
    const n = e.penStyle || this.options.penStyle || "pen";
    this.drawStyledStrokeForReplay(e.points, n, e.strokeColor, e.strokeWidth), this.ctx = s;
  }
  /**
   * 在离屏画布上绘制部分路径
   */
  drawPartialPathToOffscreen(e, s) {
    if (!this.offscreenCtx || e.points.length < 2)
      return;
    const n = e.startTime || 0, i = e.duration || 0, o = n + i * s, r = this.getPointsUpToTime(e.points, n, o);
    if (r.length < 2)
      return;
    const c = this.ctx;
    this.ctx = this.offscreenCtx;
    const h = e.penStyle || this.options.penStyle || "pen";
    this.drawStyledStrokeForReplay(r, h, e.strokeColor, e.strokeWidth), this.ctx = c;
  }
  /**
   * 销毁控制器
   */
  destroy() {
    this.stop(), this.eventCallbacks.clear(), this.replayData = null, this.lastFrameImageBitmap && (this.lastFrameImageBitmap.close(), this.lastFrameImageBitmap = null);
  }
}
function pt(l) {
  const e = l.paths.map((h) => {
    const m = h.points.map((u, b) => {
      var w;
      let v;
      if (u.time && h.points[0].time)
        v = u.time - h.points[0].time;
      else if (b === 0)
        v = 0;
      else {
        const W = h.points[b - 1], P = Math.sqrt(
          Math.pow(u.x - W.x, 2) + Math.pow(u.y - W.y, 2)
        ) / 100 * 1e3;
        v = (((w = m[b - 1]) == null ? void 0 : w.relativeTime) || 0) + Math.max(P, 16);
      }
      return {
        ...u,
        relativeTime: v
      };
    }), p = m.length > 0 ? m[m.length - 1].relativeTime : 0;
    return {
      ...h,
      points: m,
      duration: p
    };
  }), s = [];
  for (let h = 0; h < e.length; h++) {
    const m = e[h];
    let p;
    if (h === 0)
      p = 0;
    else {
      const v = s[h - 1], w = ft(
        l.paths[h - 1].points,
        l.paths[h].points
      );
      p = v.endTime + w;
    }
    const u = p + m.duration, b = {
      ...m,
      startTime: p,
      endTime: u
    };
    console.log(`路径 ${h}: 开始时间=${p}, 结束时间=${u}, 持续时间=${m.duration}`), s.push(b);
  }
  const n = s.length > 0 ? s[s.length - 1].endTime : 0;
  console.log("回放数据生成完成:"), console.log("- 路径数量:", s.length), console.log("- 总时长:", n), console.log("- 路径详情:", s.map((h) => ({
    startTime: h.startTime,
    endTime: h.endTime,
    duration: h.duration,
    pointCount: h.points.length
  })));
  const i = s.reduce((h, m) => h + vt(m.points), 0), o = n > 0 ? i / (n / 1e3) : 0, r = s.slice(1).map((h, m) => {
    const p = s[m];
    return h.startTime - p.endTime;
  }), c = r.length > 0 ? r.reduce((h, m) => h + m, 0) / r.length : 0;
  return {
    paths: s,
    totalDuration: n,
    speed: 1,
    metadata: {
      deviceType: yt(l),
      averageSpeed: o,
      totalDistance: i,
      averagePauseTime: c
    }
  };
}
function ft(l, e) {
  if (l.length === 0 || e.length === 0)
    return 200;
  const s = l[l.length - 1], n = e[0];
  if (s.time && n.time)
    return Math.max(n.time - s.time, 50);
  const i = Math.sqrt(
    Math.pow(n.x - s.x, 2) + Math.pow(n.y - s.y, 2)
  );
  return Math.min(Math.max(i * 2, 100), 1e3);
}
function yt(l) {
  const e = l.paths.reduce((o, r) => o + r.points.length, 0), s = l.paths.length;
  if (e === 0)
    return "touch";
  const n = e / s;
  return n > 20 ? "touch" : n < 10 ? "mouse" : l.paths.some(
    (o) => o.points.some((r) => r.pressure !== void 0)
  ) ? "pen" : "touch";
}
function vt(l) {
  let e = 0;
  for (let s = 1; s < l.length; s++) {
    const n = l[s].x - l[s - 1].x, i = l[s].y - l[s - 1].y;
    e += Math.sqrt(n * n + i * i);
  }
  return e;
}
const _e = {
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
  },
  elegant: {
    name: "优雅笔",
    description: "适中线条，由粗到细的渐变之美，连笔流畅",
    strokeWidth: 3,
    smoothing: !0,
    pressure: {
      enabled: !0,
      min: 0.4,
      max: 2.5
    },
    lineCap: "round",
    lineJoin: "round",
    recommendedColor: "#374151"
  }
};
function xt(l) {
  return _e[l];
}
function Lt() {
  return Object.entries(_e).map(([l, e]) => ({
    key: l,
    config: e
  }));
}
function Ct(l, e) {
  const s = xt(l);
  return {
    strokeWidth: s.strokeWidth,
    smoothing: s.smoothing,
    pressure: s.pressure,
    lineCap: s.lineCap,
    lineJoin: s.lineJoin,
    strokeColor: e || s.recommendedColor || "#000000"
  };
}
const bt = ["width", "height"], wt = {
  key: 1,
  class: "signature-toolbar"
}, Tt = ["disabled"], kt = ["disabled"], Mt = ["disabled"], St = {
  key: 2,
  class: "replay-controls"
}, Pt = { class: "replay-buttons" }, Dt = ["disabled"], Wt = { key: 0 }, Rt = { key: 1 }, Et = ["disabled"], It = { class: "replay-progress" }, Ot = ["max", "value", "disabled"], _t = { class: "time-display" }, At = { class: "replay-speed" }, Ft = /* @__PURE__ */ ot({
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
  setup(l, { expose: e, emit: s }) {
    const n = l, i = s, o = I(), r = I(!1), c = I(null), h = I(V(0, 0)), m = I([]), p = I(-1), u = I(null), b = I(!1), v = I("idle"), w = I(0), W = I(0), S = R(() => typeof n.width == "number" ? n.width : 800), P = R(() => typeof n.height == "number" ? n.height : 300), F = R(() => ({
      position: "relative",
      display: "inline-block",
      width: typeof n.width == "string" ? n.width : `${n.width}px`,
      height: typeof n.height == "string" ? n.height : `${n.height}px`
    })), Fe = R(() => ({
      border: n.borderStyle,
      borderRadius: n.borderRadius,
      backgroundColor: n.backgroundColor,
      cursor: n.disabled ? "not-allowed" : "crosshair",
      display: "block",
      width: "100%",
      height: "100%"
    })), Je = R(() => ({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "#999",
      fontSize: "14px",
      pointerEvents: "none",
      userSelect: "none"
    })), qe = R(() => b.value ? !1 : n.placeholder && G(h.value)), oe = R(() => p.value > 0), ie = R(() => p.value < m.value.length - 1), le = R(() => b.value && u.value), O = R(() => !le.value && !n.disabled), $e = R(() => {
      var t;
      return le.value && ((t = n.replayOptions) == null ? void 0 : t.showControls) !== !1;
    }), D = R(() => {
      if (n.penStyle) {
        const t = Ct(n.penStyle, n.strokeColor);
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
    }), re = () => {
      var t;
      return ((t = o.value) == null ? void 0 : t.getContext("2d")) || null;
    }, U = (t, a) => {
      const g = o.value, x = g.getBoundingClientRect(), d = g.width / x.width, f = g.height / x.height;
      return {
        x: (t - x.left) * d,
        y: (a - x.top) * f,
        time: Date.now()
      };
    }, he = (t) => {
      if (!O.value)
        return;
      r.value = !0;
      const a = performance.now(), g = { ...t, time: a };
      c.value = {
        points: [g],
        strokeColor: n.strokeColor,
        strokeWidth: n.strokeWidth,
        penStyle: n.penStyle,
        // 保存笔迹样式
        startTime: a,
        endTime: a,
        duration: 0
      }, i("signature-start");
    }, J = (t, a, g, x) => {
      switch (g) {
        case "pen":
          return 1;
        case "brush":
          if (a) {
            const _ = Math.sqrt(Math.pow(t.x - a.x, 2) + Math.pow(t.y - a.y, 2)), q = Math.max(1, (t.time || 0) - (a.time || 0)), $ = _ / q, j = Math.max(0.1, Math.min(3, 100 / Math.max($, 1))), B = t.pressure || 0.5, L = 0.8 + Math.random() * 0.4;
            return Math.max(1, Math.min(20, x * j * (0.3 + B * 1.4) * L));
          }
          return x;
        case "marker":
          return 12;
        case "pencil":
          const d = t.pressure || 0.5, f = 0.9 + Math.random() * 0.2;
          return x * (0.7 + d * 0.6) * f;
        case "ballpoint":
          const y = t.pressure || 0.5;
          return x * (0.8 + y * 0.4);
        case "elegant":
          const T = t.pressure || 0.5;
          let C = 1;
          if (a) {
            const _ = Math.sqrt(Math.pow(t.x - a.x, 2) + Math.pow(t.y - a.y, 2)), q = Math.max(1, (t.time || 0) - (a.time || 0)), $ = _ / q;
            C = Math.max(0.3, Math.min(2, 50 / Math.max($, 1)));
          }
          const E = T * C;
          return x * (0.4 + E * 1.6);
        default:
          return x;
      }
    }, Q = (t, a, g) => {
      var x;
      if (!(a.length < 2))
        switch (t.strokeStyle = ((x = c.value) == null ? void 0 : x.strokeColor) || D.value.strokeColor, t.lineCap = D.value.lineCap || "round", t.lineJoin = D.value.lineJoin || "round", g) {
          case "pen":
            if (t.lineWidth = 1, t.lineCap = "butt", t.lineJoin = "miter", t.beginPath(), t.moveTo(a[0].x, a[0].y), a.length >= 3) {
              for (let d = 1; d < a.length - 1; d++) {
                const f = ce(a[d], a[d - 1], a[d + 1]);
                t.quadraticCurveTo(f.x, f.y, a[d].x, a[d].y);
              }
              t.lineTo(a[a.length - 1].x, a[a.length - 1].y);
            } else
              for (let d = 1; d < a.length; d++)
                t.lineTo(a[d].x, a[d].y);
            t.stroke();
            break;
          case "brush":
            t.lineCap = "round", t.lineJoin = "round";
            for (let d = 1; d < a.length; d++) {
              const f = a[d], y = a[d - 1], T = J(f, y, g, D.value.strokeWidth), C = t.createLinearGradient(y.x, y.y, f.x, f.y);
              C.addColorStop(0, t.strokeStyle), C.addColorStop(1, t.strokeStyle), t.lineWidth = T, t.beginPath(), t.moveTo(y.x, y.y), t.lineTo(f.x, f.y), t.stroke(), T > 8 && Math.random() > 0.6 && (t.globalAlpha = 0.2, t.beginPath(), t.arc(f.x, f.y, T * 0.3, 0, Math.PI * 2), t.fill(), t.globalAlpha = 1);
            }
            break;
          case "marker":
            t.globalAlpha = 0.7, t.lineWidth = 12, t.lineCap = "square", t.lineJoin = "bevel", t.beginPath(), t.moveTo(a[0].x, a[0].y);
            for (let d = 1; d < a.length; d++)
              t.lineTo(a[d].x, a[d].y);
            t.stroke(), t.globalAlpha = 0.3, t.lineWidth = 16, t.beginPath(), t.moveTo(a[0].x, a[0].y);
            for (let d = 1; d < a.length; d++)
              t.lineTo(a[d].x, a[d].y);
            t.stroke(), t.globalAlpha = 1;
            break;
          case "pencil":
            t.lineCap = "round", t.lineJoin = "round";
            for (let d = 1; d < a.length; d++) {
              const f = a[d], y = a[d - 1], T = J(f, y, g, D.value.strokeWidth);
              t.lineWidth = T, t.globalAlpha = 0.8, t.beginPath(), t.moveTo(y.x, y.y), t.lineTo(f.x, f.y), t.stroke();
              for (let C = 0; C < 3; C++)
                if (Math.random() > 0.5) {
                  t.globalAlpha = 0.2, t.lineWidth = T * 0.3;
                  const E = (Math.random() - 0.5) * 2, _ = (Math.random() - 0.5) * 2;
                  t.beginPath(), t.moveTo(y.x + E, y.y + _), t.lineTo(f.x + E, f.y + _), t.stroke();
                }
              if (Math.random() > 0.8) {
                t.globalAlpha = 0.4;
                for (let C = 0; C < 5; C++)
                  t.beginPath(), t.arc(
                    f.x + (Math.random() - 0.5) * 3,
                    f.y + (Math.random() - 0.5) * 3,
                    Math.random() * 0.8,
                    0,
                    Math.PI * 2
                  ), t.fill();
              }
            }
            t.globalAlpha = 1;
            break;
          case "ballpoint":
            t.lineCap = "round", t.lineJoin = "round";
            for (let d = 1; d < a.length; d++) {
              const f = a[d], y = a[d - 1], T = J(f, y, g, D.value.strokeWidth);
              if (Math.random() > 0.1) {
                if (t.lineWidth = T, t.globalAlpha = Math.random() > 0.2 ? 1 : 0.7, t.beginPath(), D.value.smoothing && d < a.length - 1) {
                  const C = a[d + 1], E = ce(f, y, C);
                  t.moveTo(y.x, y.y), t.quadraticCurveTo(E.x, E.y, f.x, f.y);
                } else
                  t.moveTo(y.x, y.y), t.lineTo(f.x, f.y);
                t.stroke();
              }
              Math.random() > 0.95 && (t.globalAlpha = 0.8, t.beginPath(), t.arc(f.x, f.y, T * 0.8, 0, Math.PI * 2), t.fill());
            }
            t.globalAlpha = 1;
            break;
          case "elegant":
            Ye(t, a);
            break;
        }
    }, ze = () => {
      if (!c.value || c.value.points.length < 2)
        return;
      const t = re();
      if (!t)
        return;
      const a = c.value.points, g = a.length, x = n.penStyle || "pen";
      if (g === 2)
        Q(t, a, x);
      else if (g >= 3) {
        const d = a.slice(-3);
        Q(t, d, x);
      }
    }, Ye = (t, a) => {
      var g, x;
      if (!(a.length < 2)) {
        t.strokeStyle = ((g = c.value) == null ? void 0 : g.strokeColor) || D.value.strokeColor, t.fillStyle = ((x = c.value) == null ? void 0 : x.strokeColor) || D.value.strokeColor, t.lineCap = "round", t.lineJoin = "round", t.globalCompositeOperation = "source-over";
        for (let d = 1; d < a.length; d++) {
          const f = a[d], y = a[d - 1], T = J(f, y, "elegant", D.value.strokeWidth), C = d > 1 ? J(y, a[d - 2], "elegant", D.value.strokeWidth) : T;
          Xe(t, y, f, C, T);
        }
        Be(t, a);
      }
    }, Xe = (t, a, g, x, d) => {
      const f = Math.max(3, Math.floor(Math.sqrt(
        Math.pow(g.x - a.x, 2) + Math.pow(g.y - a.y, 2)
      ) / 2));
      t.beginPath();
      const y = [], T = [];
      for (let C = 0; C <= f; C++) {
        const E = C / f, _ = Le(E), q = a.x + (g.x - a.x) * _, $ = a.y + (g.y - a.y) * _, j = x + (d - x) * _, B = g.x - a.x, L = g.y - a.y, Z = Math.sqrt(B * B + L * L);
        if (Z > 0) {
          const Ee = -L / Z * j / 2, Ie = B / Z * j / 2;
          y.push({ x: q + Ee, y: $ + Ie }), T.push({ x: q - Ee, y: $ - Ie });
        }
      }
      if (y.length > 0 && T.length > 0) {
        t.moveTo(y[0].x, y[0].y);
        for (let C = 1; C < y.length; C++)
          t.lineTo(y[C].x, y[C].y);
        for (let C = T.length - 1; C >= 0; C--)
          t.lineTo(T[C].x, T[C].y);
        t.closePath(), t.fill();
      }
    }, Be = (t, a) => {
      for (let g = 1; g < a.length - 1; g++) {
        const x = a[g - 1], d = a[g], f = a[g + 1], y = Math.atan2(d.y - x.y, d.x - x.x), T = Math.atan2(f.y - d.y, f.x - d.x);
        if (Math.abs(T - y) > 0.3) {
          const E = J(d, x, "elegant", D.value.strokeWidth);
          t.beginPath(), t.arc(d.x, d.y, E / 3, 0, Math.PI * 2), t.fill();
        }
      }
    }, Le = (t) => t * t * (3 - 2 * t), ce = (t, a, g) => {
      const d = {
        length: Math.sqrt(Math.pow(g.x - a.x, 2) + Math.pow(g.y - a.y, 2)),
        angle: Math.atan2(g.y - a.y, g.x - a.x)
      }, f = d.angle + Math.PI, y = d.length * 0.2;
      return {
        x: t.x + Math.cos(f) * y,
        y: t.y + Math.sin(f) * y,
        time: t.time || 0
      };
    }, Ue = (t, a) => {
      if (a.points.length < 2)
        return;
      const g = a.penStyle || n.penStyle || "pen", x = c.value;
      c.value = a, Q(t, a.points, g), c.value = x;
    }, ue = (t) => {
      if (!r.value || !c.value || !O.value)
        return;
      const a = performance.now(), g = { ...t, time: a };
      c.value.points.push(g), c.value.startTime && (c.value.endTime = a, c.value.duration = a - c.value.startTime), ze(), pe(), i("signature-drawing", h.value);
    }, de = () => {
      if (!(!r.value || !c.value)) {
        if (r.value = !1, c.value.points.length > 0) {
          const t = c.value.points[c.value.points.length - 1];
          t.time && c.value.startTime && (c.value.endTime = t.time, c.value.duration = t.time - c.value.startTime);
        }
        h.value.paths.push(c.value), h.value.isEmpty = !1, h.value.timestamp = Date.now(), H(), A(), c.value = null, i("signature-end", h.value);
      }
    }, He = (t) => {
      t.preventDefault();
      const a = U(t.clientX, t.clientY);
      he(a);
    }, Ne = (t) => {
      if (t.preventDefault(), !r.value)
        return;
      const a = U(t.clientX, t.clientY);
      ue(a);
    }, me = (t) => {
      t.preventDefault(), de();
    }, je = (t) => {
      if (t.preventDefault(), t.touches.length !== 1)
        return;
      const a = t.touches[0], g = U(a.clientX, a.clientY);
      he(g);
    }, Ge = (t) => {
      if (t.preventDefault(), t.touches.length !== 1 || !r.value)
        return;
      const a = t.touches[0], g = U(a.clientX, a.clientY);
      ue(g);
    }, ge = (t) => {
      t.preventDefault(), de();
    }, pe = () => {
      h.value.canvasSize = {
        width: S.value,
        height: P.value
      }, h.value.isEmpty = G(h.value);
    }, H = () => {
      m.value = m.value.slice(0, p.value + 1), m.value.push(X(h.value)), p.value = m.value.length - 1;
      const t = 50;
      m.value.length > t && (m.value = m.value.slice(-t), p.value = m.value.length - 1);
    }, A = () => {
      const t = re();
      t && (t.clearRect(0, 0, S.value, P.value), n.backgroundColor && n.backgroundColor !== "transparent" && (t.fillStyle = n.backgroundColor, t.fillRect(0, 0, S.value, P.value)), h.value.paths.forEach((a) => {
        a.points.length > 0 && Ue(t, a);
      }));
    }, N = () => {
      if (console.log("初始化回放控制器"), console.log("canvas引用是否存在:", !!o.value), !o.value) {
        console.error("canvas引用不存在，无法初始化回放控制器");
        return;
      }
      u.value && (console.log("销毁现有回放控制器"), u.value.destroy()), console.log("创建新的回放控制器"), u.value = new gt(o.value), console.log("回放控制器创建成功:", !!u.value), u.value.on("replay-start", () => {
        v.value = "playing", i("replay-start");
      }), u.value.on("replay-progress", (t, a) => {
        w.value = t, W.value = a, i("replay-progress", t, a);
      }), u.value.on("replay-pause", () => {
        v.value = "paused", i("replay-pause");
      }), u.value.on("replay-resume", () => {
        v.value = "playing", i("replay-resume");
      }), u.value.on("replay-stop", () => {
        v.value = "stopped", i("replay-stop");
      }), u.value.on("replay-complete", () => {
        v.value = "completed", i("replay-complete");
      }), u.value.on("replay-path-start", (t, a) => {
        i("replay-path-start", t, a);
      }), u.value.on("replay-path-end", (t, a) => {
        i("replay-path-end", t, a);
      }), u.value.on("replay-speed-change", (t) => {
        i("replay-speed-change", t);
      });
    }, fe = (t, a) => {
      if (u.value || N(), u.value) {
        b.value = !0;
        const g = {
          ...a,
          drawOptions: D.value,
          penStyle: n.penStyle
        };
        u.value.setReplayData(t, g), console.log("startReplay调用，自动播放:", a == null ? void 0 : a.autoPlay), (a == null ? void 0 : a.autoPlay) === !0 && u.value.play();
      }
    }, ye = (t) => {
      b.value = t, !t && u.value && (u.value.stop(), A());
    }, Ve = () => G(h.value) ? null : pt(h.value), ve = () => {
      console.log("play方法被调用"), console.log("回放控制器是否存在:", !!u.value), u.value || (console.log("回放控制器不存在，尝试初始化"), N()), u.value ? (console.log("调用回放控制器的play方法"), u.value.play()) : console.error("回放控制器初始化失败，无法播放");
    }, xe = () => {
      var t;
      (t = u.value) == null || t.pause();
    }, Ce = () => {
      var t;
      (t = u.value) == null || t.stop();
    }, be = (t) => {
      var a;
      (a = u.value) == null || a.seek(t);
    }, we = (t) => {
      var a;
      (a = u.value) == null || a.setSpeed(t);
    }, Qe = () => {
      var t;
      return ((t = u.value) == null ? void 0 : t.getState()) || "idle";
    }, Ke = () => {
      var t;
      return ((t = u.value) == null ? void 0 : t.getCurrentTime()) || 0;
    }, K = () => {
      var t;
      return ((t = u.value) == null ? void 0 : t.getTotalDuration()) || 0;
    }, Ze = () => {
      var t;
      return ((t = u.value) == null ? void 0 : t.getProgress()) || 0;
    }, Te = (t) => {
      const a = Math.floor(t / 1e3), g = Math.floor(a / 60), x = a % 60;
      return `${g}:${x.toString().padStart(2, "0")}`;
    }, ke = () => {
      O.value && (h.value = V(S.value, P.value), A(), H(), i("signature-clear"));
    }, Me = () => {
      !oe.value || !O.value || (p.value--, h.value = X(m.value[p.value]), A(), i("signature-undo", h.value));
    }, Se = () => {
      !ie.value || !O.value || (p.value++, h.value = X(m.value[p.value]), A(), i("signature-redo", h.value));
    }, Pe = (t) => {
      const a = o.value;
      return dt(a, h.value, t);
    }, De = () => G(h.value), We = async (t) => {
      if (!O.value)
        return;
      const a = o.value;
      await mt(a, t), h.value = V(S.value, P.value), h.value.isEmpty = !1, H();
    }, et = () => X(h.value), tt = (t) => {
      O.value && (h.value = X(t), A(), H());
    }, Re = (t, a) => {
      const g = t || S.value, x = a || P.value, d = Pe({ format: "png" });
      te(() => {
        const f = o.value;
        f.width = g, f.height = x, De() || We(d), pe();
      });
    }, nt = () => {
      const t = o.value;
      t.width = S.value, t.height = P.value, h.value = V(S.value, P.value), m.value = [X(h.value)], p.value = 0, A();
    };
    return ee([() => n.width, () => n.height], () => {
      te(() => {
        o.value && Re();
      });
    }), ee(() => n.replayMode, (t) => {
      t !== void 0 && ye(t);
    }), ee(() => n.replayData, (t) => {
      if (console.log("watch监听到回放数据变化:", t), console.log("当前回放模式:", n.replayMode), console.log("回放控制器是否存在:", !!u.value), t && n.replayMode)
        if (u.value || (console.log("回放控制器未初始化，先初始化"), N()), u.value) {
          console.log("开始设置回放数据到控制器");
          const a = {
            ...n.replayOptions,
            drawOptions: D.value,
            penStyle: n.penStyle
          };
          u.value.setReplayData(t, a), console.log("回放数据已更新:", t);
        } else
          console.error("回放控制器初始化失败");
      else
        t || console.log("回放数据为空，跳过设置"), n.replayMode || console.log("不在回放模式，跳过设置");
    }, { immediate: !0 }), it(() => {
      te(() => {
        nt(), N(), n.replayMode && n.replayData && fe(n.replayData, n.replayOptions);
      });
    }), lt(() => {
      u.value && (u.value.destroy(), u.value = null);
    }), e({
      clear: ke,
      undo: Me,
      redo: Se,
      save: Pe,
      isEmpty: De,
      fromDataURL: We,
      getSignatureData: et,
      setSignatureData: tt,
      resize: Re,
      // 回放相关方法
      startReplay: fe,
      getReplayData: Ve,
      setReplayMode: ye,
      play: ve,
      pause: xe,
      stop: Ce,
      seek: be,
      setSpeed: we,
      getState: Qe,
      getCurrentTime: Ke,
      getTotalDuration: K,
      getProgress: Ze
    }), (t, a) => (z(), Y("div", {
      class: "electronic-signature",
      style: ne(F.value)
    }, [
      k("canvas", {
        ref_key: "canvasRef",
        ref: o,
        width: S.value,
        height: P.value,
        style: ne(Fe.value),
        onMousedown: He,
        onMousemove: Ne,
        onMouseup: me,
        onMouseleave: me,
        onTouchstart: je,
        onTouchmove: Ge,
        onTouchend: ge,
        onTouchcancel: ge
      }, null, 44, bt),
      qe.value ? (z(), Y("div", {
        key: 0,
        class: "signature-placeholder",
        style: ne(Je.value)
      }, ae(t.placeholder), 5)) : se("", !0),
      t.showToolbar ? (z(), Y("div", wt, [
        k("button", {
          onClick: ke,
          disabled: !O.value
        }, "清除", 8, Tt),
        k("button", {
          onClick: Me,
          disabled: !O.value || !oe.value
        }, "撤销", 8, kt),
        k("button", {
          onClick: Se,
          disabled: !O.value || !ie.value
        }, "重做", 8, Mt)
      ])) : se("", !0),
      $e.value ? (z(), Y("div", St, [
        k("div", Pt, [
          k("button", {
            onClick: a[0] || (a[0] = (g) => v.value === "playing" ? xe() : ve()),
            disabled: v.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            v.value === "playing" ? (z(), Y("span", Wt, "⏸️")) : (z(), Y("span", Rt, "▶️"))
          ], 8, Dt),
          k("button", {
            onClick: a[1] || (a[1] = (g) => Ce()),
            disabled: v.value === "idle",
            class: "replay-btn stop-btn"
          }, " ⏹️ ", 8, Et)
        ]),
        k("div", It, [
          k("input", {
            type: "range",
            min: "0",
            max: K(),
            value: W.value,
            onInput: a[2] || (a[2] = (g) => be(Number(g.target.value))),
            class: "progress-slider",
            disabled: v.value === "idle"
          }, null, 40, Ot),
          k("div", _t, [
            k("span", null, ae(Te(W.value)), 1),
            a[4] || (a[4] = k("span", null, "/", -1)),
            k("span", null, ae(Te(K())), 1)
          ])
        ]),
        k("div", At, [
          a[6] || (a[6] = k("label", null, "速度:", -1)),
          k("select", {
            onChange: a[3] || (a[3] = (g) => we(Number(g.target.value))),
            class: "speed-select"
          }, a[5] || (a[5] = [
            k("option", { value: "0.5" }, "0.5x", -1),
            k("option", {
              value: "1",
              selected: ""
            }, "1x", -1),
            k("option", { value: "1.5" }, "1.5x", -1),
            k("option", { value: "2" }, "2x", -1)
          ]), 32)
        ])
      ])) : se("", !0)
    ], 4));
  }
});
const Jt = (l, e) => {
  const s = l.__vccOpts || l;
  for (const [n, i] of e)
    s[n] = i;
  return s;
}, Ae = /* @__PURE__ */ Jt(Ft, [["__scopeId", "data-v-bb077751"]]);
function qt() {
  return window.devicePixelRatio || 1;
}
function Ut(l) {
  const e = l.getContext("2d"), s = qt(), n = l.clientWidth, i = l.clientHeight;
  return l.width = n * s, l.height = i * s, e.scale(s, s), l.style.width = n + "px", l.style.height = i + "px", e;
}
function $t(l) {
  if (l.paths.length === 0)
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0
    };
  let e = 1 / 0, s = 1 / 0, n = -1 / 0, i = -1 / 0;
  return l.paths.forEach((o) => {
    o.points.forEach((r) => {
      e = Math.min(e, r.x), s = Math.min(s, r.y), n = Math.max(n, r.x), i = Math.max(i, r.y);
    });
  }), {
    minX: e,
    minY: s,
    maxX: n,
    maxY: i,
    width: n - e,
    height: i - s
  };
}
function Ht(l, e, s = 10) {
  const n = $t(e);
  if (n.width === 0 || n.height === 0) {
    const h = document.createElement("canvas");
    return h.width = 1, h.height = 1, h;
  }
  const i = document.createElement("canvas"), o = i.getContext("2d"), r = n.width + s * 2, c = n.height + s * 2;
  return i.width = r, i.height = c, o.drawImage(
    l,
    n.minX - s,
    n.minY - s,
    r,
    c,
    0,
    0,
    r,
    c
  ), i;
}
function Nt(l, e, s, n = !0) {
  const i = document.createElement("canvas"), o = i.getContext("2d");
  let r = e, c = s;
  if (n) {
    const h = l.width / l.height, m = e / s;
    h > m ? c = e / h : r = s * h;
  }
  return i.width = r, i.height = c, o.imageSmoothingEnabled = !0, o.imageSmoothingQuality = "high", o.drawImage(l, 0, 0, r, c), i;
}
function jt(l, e, s = {}) {
  const {
    fontSize: n = 12,
    fontFamily: i = "Arial",
    color: o = "#999",
    opacity: r = 0.5,
    position: c = "bottom-right"
  } = s, h = document.createElement("canvas"), m = h.getContext("2d");
  h.width = l.width, h.height = l.height, m.drawImage(l, 0, 0), m.font = `${n}px ${i}`, m.fillStyle = o, m.globalAlpha = r;
  const u = m.measureText(e).width, b = n;
  let v, w;
  switch (c) {
    case "top-left":
      v = 10, w = b + 10;
      break;
    case "top-right":
      v = l.width - u - 10, w = b + 10;
      break;
    case "bottom-left":
      v = 10, w = l.height - 10;
      break;
    case "bottom-right":
      v = l.width - u - 10, w = l.height - 10;
      break;
    case "center":
      v = (l.width - u) / 2, w = (l.height + b) / 2;
      break;
    default:
      v = l.width - u - 10, w = l.height - 10;
  }
  return m.fillText(e, v, w), m.globalAlpha = 1, h;
}
function Gt(l) {
  const e = document.createElement("canvas"), s = e.getContext("2d");
  e.width = l.width, e.height = l.height, s.drawImage(l, 0, 0);
  const n = s.getImageData(0, 0, l.width, l.height), i = n.data;
  for (let o = 0; o < i.length; o += 4) {
    const r = i[o] * 0.299 + i[o + 1] * 0.587 + i[o + 2] * 0.114;
    i[o] = r, i[o + 1] = r, i[o + 2] = r;
  }
  return s.putImageData(n, 0, 0), e;
}
const zt = (l) => {
  l.component("ElectronicSignature", Ae);
}, Vt = {
  install: zt,
  ElectronicSignature: Ae
}, Qt = "1.0.0";
export {
  Ae as ElectronicSignature,
  _e as PEN_STYLE_CONFIGS,
  gt as SignatureReplayController,
  jt as addWatermark,
  ct as calculateStrokeWidth,
  X as cloneSignatureData,
  Gt as convertToGrayscale,
  Ct as createDrawOptionsFromPenStyle,
  V as createEmptySignatureData,
  pt as createReplayData,
  Ht as cropSignature,
  Vt as default,
  Bt as drawSmoothPath,
  dt as exportSignature,
  Lt as getAllPenStyles,
  rt as getAngle,
  ht as getControlPoint,
  qt as getDevicePixelRatio,
  Oe as getDistance,
  xt as getPenStyleConfig,
  $t as getSignatureBounds,
  G as isSignatureEmpty,
  mt as loadImageToCanvas,
  Nt as resizeSignature,
  Ut as setupHighDPICanvas,
  ut as signatureToSVG,
  Qt as version
};
