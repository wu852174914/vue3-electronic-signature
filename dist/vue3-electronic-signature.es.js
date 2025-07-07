var lt = Object.defineProperty;
var rt = (l, t, a) => t in l ? lt(l, t, { enumerable: !0, configurable: !0, writable: !0, value: a }) : l[t] = a;
var P = (l, t, a) => (rt(l, typeof t != "symbol" ? t + "" : t, a), a);
import { defineComponent as ht, ref as E, computed as O, watch as oe, nextTick as se, onMounted as ct, onUnmounted as ut, openBlock as z, createElementBlock as V, normalizeStyle as ie, createElementVNode as T, toDisplayString as le, createCommentVNode as re } from "vue";
function _e(l, t) {
  return Math.sqrt(
    Math.pow(t.x - l.x, 2) + Math.pow(t.y - l.y, 2)
  );
}
function dt(l, t) {
  return Math.atan2(t.y - l.y, t.x - l.x);
}
function mt(l, t, a, n) {
  const s = t || l, i = a || l, h = 0.2, c = dt(s, i) * (n ? 1 : -1), r = _e(s, i) * h;
  return {
    x: l.x + Math.cos(c) * r,
    y: l.y + Math.sin(c) * r,
    time: l.time
  };
}
function gt(l, t, a) {
  if (!a.pressure.enabled)
    return a.strokeWidth;
  const n = _e(l, t), s = t.time - l.time, i = s > 0 ? n / s : 0, h = Math.max(0.1, Math.min(1, 1 - i * 0.01)), { min: c, max: r } = a.pressure;
  return c + (r - c) * h;
}
function Nt(l, t, a) {
  if (t.length < 2)
    return;
  if (l.strokeStyle = a.strokeColor, l.lineCap = "round", l.lineJoin = "round", !a.smoothing || t.length < 3) {
    l.beginPath(), l.lineWidth = a.strokeWidth, l.moveTo(t[0].x, t[0].y);
    for (let s = 1; s < t.length; s++)
      l.lineTo(t[s].x, t[s].y);
    l.stroke();
    return;
  }
  l.beginPath(), l.moveTo(t[0].x, t[0].y);
  for (let s = 1; s < t.length - 1; s++) {
    const i = t[s], h = t[s + 1];
    a.pressure.enabled ? l.lineWidth = gt(t[s - 1], i, a) : l.lineWidth = a.strokeWidth;
    const c = mt(i, t[s - 1], h);
    l.quadraticCurveTo(c.x, c.y, i.x, i.y);
  }
  const n = t[t.length - 1];
  l.lineTo(n.x, n.y), l.stroke();
}
function pt(l) {
  const { canvasSize: t, paths: a } = l;
  let n = `<svg width="${t.width}" height="${t.height}" xmlns="http://www.w3.org/2000/svg">`;
  return a.forEach((s) => {
    if (s.points.length < 2)
      return;
    let i = `M ${s.points[0].x} ${s.points[0].y}`;
    for (let h = 1; h < s.points.length; h++)
      i += ` L ${s.points[h].x} ${s.points[h].y}`;
    n += `<path d="${i}" stroke="${s.strokeColor}" stroke-width="${s.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), n += "</svg>", n;
}
function ft(l, t, a = { format: "png" }) {
  const { format: n, quality: s = 0.9, size: i, backgroundColor: h } = a;
  if (n === "svg")
    return pt(t);
  const c = document.createElement("canvas"), r = c.getContext("2d");
  if (i) {
    c.width = i.width, c.height = i.height;
    const m = i.width / l.width, p = i.height / l.height;
    r.scale(m, p);
  } else
    c.width = l.width, c.height = l.height;
  switch (h && h !== "transparent" && (r.fillStyle = h, r.fillRect(0, 0, c.width, c.height)), r.drawImage(l, 0, 0), n) {
    case "jpeg":
      return c.toDataURL("image/jpeg", s);
    case "base64":
      return c.toDataURL("image/png").split(",")[1];
    case "png":
    default:
      return c.toDataURL("image/png");
  }
}
function yt(l, t) {
  return new Promise((a, n) => {
    const s = new Image();
    s.onload = () => {
      const i = l.getContext("2d");
      i.clearRect(0, 0, l.width, l.height), i.drawImage(s, 0, 0, l.width, l.height), a();
    }, s.onerror = n, s.src = t;
  });
}
function N(l) {
  return l.paths.length === 0 || l.paths.every((t) => t.points.length === 0);
}
function j(l, t) {
  return {
    paths: [],
    canvasSize: { width: l, height: t },
    timestamp: Date.now(),
    isEmpty: !0
  };
}
function Y(l) {
  return JSON.parse(JSON.stringify(l));
}
class vt {
  constructor(t) {
    P(this, "canvas");
    P(this, "ctx");
    P(this, "replayData", null);
    P(this, "state", "idle");
    P(this, "currentTime", 0);
    P(this, "speed", 1);
    P(this, "animationId", null);
    P(this, "startTimestamp", 0);
    P(this, "pausedTime", 0);
    P(this, "options", {});
    // 事件回调
    P(this, "eventCallbacks", /* @__PURE__ */ new Map());
    // 性能优化相关
    P(this, "offscreenCanvas", null);
    P(this, "offscreenCtx", null);
    P(this, "lastFrameImageBitmap", null);
    P(this, "renderThrottle", 0);
    P(this, "isRendering", !1);
    // 确定性随机数生成器（解决毛笔闪烁问题）
    P(this, "seededRandom");
    this.canvas = t, this.ctx = t.getContext("2d"), this.initializeOffscreenCanvas(), this.seededRandom = this.createSeededRandom();
  }
  /**
   * 创建确定性随机数生成器（解决毛笔等笔迹的闪烁问题）
   * 基于简单的线性同余生成器（LCG）算法
   */
  createSeededRandom() {
    return (t) => {
      const s = Math.pow(2, 32);
      return (1664525 * t + 1013904223) % s / s;
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
    } catch (t) {
      console.warn("Failed to initialize optimized offscreen canvas:", t), this.offscreenCanvas = document.createElement("canvas"), this.offscreenCanvas.width = this.canvas.width, this.offscreenCanvas.height = this.canvas.height, this.offscreenCtx = this.offscreenCanvas.getContext("2d");
    }
  }
  /**
   * 设置回放数据
   */
  setReplayData(t, a = {}) {
    console.log("设置回放数据:", t), console.log("回放选项:", a), this.replayData = t, this.options = { ...a }, this.speed = a.speed || t.speed || 1, this.currentTime = a.startTime || 0, this.state = "idle", this.resetOptimizationState(), console.log("回放数据设置完成，路径数量:", t.paths.length), console.log("总时长:", t.totalDuration);
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
   * 渲染指定时间的帧 - 高性能优化版本
   */
  renderFrame(t) {
    if (!this.replayData || !this.offscreenCanvas || !this.offscreenCtx)
      return;
    const a = performance.now();
    if (!(a - this.renderThrottle < 16) && (this.renderThrottle = a, !this.isRendering)) {
      this.isRendering = !0;
      try {
        this.renderToOffscreenCanvas(t), this.transferToMainCanvasSync();
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
  renderToOffscreenCanvas(t) {
    if (!this.replayData || !this.offscreenCtx)
      return;
    const a = this.offscreenCanvas, n = this.offscreenCtx;
    n.globalCompositeOperation = "copy", n.fillStyle = "transparent", n.fillRect(0, 0, a.width, a.height), n.globalCompositeOperation = "source-over";
    let s = !1;
    for (let i = 0; i < this.replayData.paths.length; i++) {
      const h = this.replayData.paths[i], c = h.startTime || 0, r = h.endTime || c + (h.duration || 0);
      if (t < c)
        break;
      if (t >= r) {
        this.drawCompletePathToOffscreen(h), !s && Math.abs(t - r) < 32 && this.emit("replay-path-end", i, h);
        continue;
      }
      s = !0;
      const m = Math.max(0, Math.min(1, (t - c) / Math.max(r - c, 1)));
      m > 0 && Math.abs(t - c) < 32 && this.emit("replay-path-start", i, h), this.drawPartialPathToOffscreen(h, m);
      break;
    }
  }
  /**
   * 获取指定时间内的所有点
   */
  getPointsUpToTime(t, a, n) {
    const s = [];
    for (let i = 0; i < t.length; i++) {
      const h = t[i], c = a + (h.relativeTime || i * 50);
      if (c <= n)
        s.push(h);
      else {
        if (i > 0) {
          const r = t[i - 1], m = a + (r.relativeTime || (i - 1) * 50);
          if (m <= n) {
            const p = (n - m) / (c - m), v = {
              x: r.x + (h.x - r.x) * p,
              y: r.y + (h.y - r.y) * p,
              time: n,
              pressure: r.pressure ? r.pressure + (h.pressure || r.pressure - r.pressure) * p : h.pressure
            };
            s.push(v);
          }
        }
        break;
      }
    }
    return s;
  }
  /**
   * 根据笔迹样式计算动态线宽（与录制时一致）
   */
  calculateDynamicStrokeWidth(t, a, n, s) {
    switch (n) {
      case "pen":
        return 1;
      case "brush":
        if (a) {
          const d = Math.sqrt(Math.pow(t.x - a.x, 2) + Math.pow(t.y - a.y, 2)), x = Math.max(1, (t.time || 0) - (a.time || 0)), C = d / x, _ = Math.max(0.1, Math.min(3, 100 / Math.max(C, 1))), A = t.pressure || 0.5, k = Math.floor(t.x * 1e3 + t.y * 1e3 + (t.time || 0)), D = 0.8 + this.seededRandom(k) * 0.4;
          return Math.max(1, Math.min(20, s * _ * (0.3 + A * 1.4) * D));
        }
        return s;
      case "marker":
        return 12;
      case "pencil":
        const i = t.pressure || 0.5, h = Math.floor(t.x * 1e3 + t.y * 1e3 + (t.time || 0)), c = 0.9 + this.seededRandom(h + 1) * 0.2;
        return s * (0.7 + i * 0.6) * c;
      case "ballpoint":
        const r = t.pressure || 0.5;
        return s * (0.8 + r * 0.4);
      case "elegant":
        const m = t.pressure || 0.5;
        let p = 1;
        if (a) {
          const d = Math.sqrt(Math.pow(t.x - a.x, 2) + Math.pow(t.y - a.y, 2)), x = Math.max(1, (t.time || 0) - (a.time || 0)), C = d / x;
          p = Math.max(0.3, Math.min(2, 50 / Math.max(C, 1)));
        }
        const v = m * p;
        return s * (0.4 + v * 1.6);
      default:
        return s;
    }
  }
  /**
   * 根据笔迹样式绘制线段（与录制时完全一致）
   */
  drawStyledStrokeForReplay(t, a, n, s) {
    if (!(t.length < 2))
      switch (this.ctx.strokeStyle = n, a) {
        case "pen":
          if (this.ctx.lineWidth = 1, this.ctx.lineCap = "butt", this.ctx.lineJoin = "miter", this.ctx.beginPath(), this.ctx.moveTo(t[0].x, t[0].y), t.length >= 3) {
            for (let i = 1; i < t.length - 1; i++) {
              const h = this.getControlPoint(t[i], t[i - 1], t[i + 1]);
              this.ctx.quadraticCurveTo(h.x, h.y, t[i].x, t[i].y);
            }
            this.ctx.lineTo(t[t.length - 1].x, t[t.length - 1].y);
          } else
            for (let i = 1; i < t.length; i++)
              this.ctx.lineTo(t[i].x, t[i].y);
          this.ctx.stroke();
          break;
        case "brush":
          this.ctx.lineCap = "round", this.ctx.lineJoin = "round";
          for (let i = 1; i < t.length; i++) {
            const h = t[i], c = t[i - 1], r = this.calculateDynamicStrokeWidth(h, c, a, s);
            this.ctx.lineWidth = r, this.ctx.beginPath(), this.ctx.moveTo(c.x, c.y), this.ctx.lineTo(h.x, h.y), this.ctx.stroke();
            const m = Math.floor(h.x * 100 + h.y * 100 + i);
            r > 8 && this.seededRandom(m) > 0.6 && (this.ctx.globalAlpha = 0.2, this.ctx.beginPath(), this.ctx.arc(h.x, h.y, r * 0.3, 0, Math.PI * 2), this.ctx.fill(), this.ctx.globalAlpha = 1);
          }
          break;
        case "marker":
          this.ctx.globalAlpha = 0.7, this.ctx.lineWidth = 12, this.ctx.lineCap = "square", this.ctx.lineJoin = "bevel", this.ctx.beginPath(), this.ctx.moveTo(t[0].x, t[0].y);
          for (let i = 1; i < t.length; i++)
            this.ctx.lineTo(t[i].x, t[i].y);
          this.ctx.stroke(), this.ctx.globalAlpha = 0.3, this.ctx.lineWidth = 16, this.ctx.beginPath(), this.ctx.moveTo(t[0].x, t[0].y);
          for (let i = 1; i < t.length; i++)
            this.ctx.lineTo(t[i].x, t[i].y);
          this.ctx.stroke(), this.ctx.globalAlpha = 1;
          break;
        case "pencil":
          this.ctx.lineCap = "round", this.ctx.lineJoin = "round";
          for (let i = 1; i < t.length; i++) {
            const h = t[i], c = t[i - 1], r = this.calculateDynamicStrokeWidth(h, c, a, s);
            this.ctx.lineWidth = r, this.ctx.globalAlpha = 0.8, this.ctx.beginPath(), this.ctx.moveTo(c.x, c.y), this.ctx.lineTo(h.x, h.y), this.ctx.stroke();
            for (let p = 0; p < 3; p++) {
              const v = Math.floor(h.x * 10 + h.y * 10 + i * 10 + p);
              if (this.seededRandom(v) > 0.5) {
                this.ctx.globalAlpha = 0.2, this.ctx.lineWidth = r * 0.3;
                const d = (this.seededRandom(v + 1) - 0.5) * 2, x = (this.seededRandom(v + 2) - 0.5) * 2;
                this.ctx.beginPath(), this.ctx.moveTo(c.x + d, c.y + x), this.ctx.lineTo(h.x + d, h.y + x), this.ctx.stroke();
              }
            }
            const m = Math.floor(h.x * 5 + h.y * 5 + i * 5);
            if (this.seededRandom(m) > 0.8) {
              this.ctx.globalAlpha = 0.4;
              for (let p = 0; p < 5; p++) {
                const v = m + p * 10;
                this.ctx.beginPath(), this.ctx.arc(
                  h.x + (this.seededRandom(v + 1) - 0.5) * 3,
                  h.y + (this.seededRandom(v + 2) - 0.5) * 3,
                  this.seededRandom(v + 3) * 0.8,
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
          for (let i = 1; i < t.length; i++) {
            const h = t[i], c = t[i - 1], r = this.calculateDynamicStrokeWidth(h, c, a, s), m = Math.floor(h.x * 50 + h.y * 50 + i);
            if (this.seededRandom(m) > 0.1) {
              if (this.ctx.lineWidth = r, this.ctx.globalAlpha = this.seededRandom(m + 1) > 0.2 ? 1 : 0.7, this.ctx.beginPath(), i < t.length - 1) {
                const v = t[i + 1], d = this.getControlPoint(h, c, v);
                this.ctx.moveTo(c.x, c.y), this.ctx.quadraticCurveTo(d.x, d.y, h.x, h.y);
              } else
                this.ctx.moveTo(c.x, c.y), this.ctx.lineTo(h.x, h.y);
              this.ctx.stroke();
            }
            const p = Math.floor(h.x * 20 + h.y * 20 + i * 3);
            this.seededRandom(p) > 0.95 && (this.ctx.globalAlpha = 0.8, this.ctx.beginPath(), this.ctx.arc(h.x, h.y, r * 0.8, 0, Math.PI * 2), this.ctx.fill());
          }
          this.ctx.globalAlpha = 1;
          break;
        case "elegant":
          this.drawElegantStroke(t, n, s);
          break;
      }
  }
  /**
   * 绘制优雅笔迹 - 基于Fabric.js和Vue3-Signature-Pad的速度压力感应技术
   */
  drawElegantStroke(t, a, n) {
    if (t.length < 2)
      return;
    this.ctx.strokeStyle = a, this.ctx.fillStyle = a, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", this.ctx.globalCompositeOperation = "source-over";
    const s = this.preprocessPointsForVelocity(t, n);
    this.drawVelocityBasedPath(s), this.addVelocityBasedConnections(s);
  }
  /**
   * 预处理点数据，计算速度和动态线宽 - 基于Vue3-Signature-Pad算法
   */
  preprocessPointsForVelocity(t, a) {
    const n = [];
    for (let s = 0; s < t.length; s++) {
      const i = t[s];
      let h = 0, c = a;
      if (s > 0) {
        const m = t[s - 1], p = Math.sqrt(
          Math.pow(i.x - m.x, 2) + Math.pow(i.y - m.y, 2)
        ), v = Math.max(1, (i.time || 0) - (m.time || 0));
        h = p / v;
        const d = i.pressure || 0.5, x = Math.max(0.2, Math.min(3, 100 / Math.max(h, 1)));
        c = a * (0.3 + d * x * 1.4);
      }
      let r = c;
      if (s > 0) {
        const m = n[s - 1].smoothedWidth;
        r = m + (c - m) * 0.3;
      }
      n.push({
        ...i,
        velocity: h,
        dynamicWidth: c,
        smoothedWidth: Math.max(0.5, Math.min(a * 3, r))
      });
    }
    return n;
  }
  /**
   * 基于速度的路径绘制 - 使用Fabric.js的平滑算法
   */
  drawVelocityBasedPath(t) {
    if (!(t.length < 2))
      for (let a = 1; a < t.length; a++) {
        const n = t[a], s = t[a - 1];
        this.drawVelocitySegment(s, n, s.smoothedWidth, n.smoothedWidth);
      }
  }
  /**
   * 绘制基于速度的单个线段 - 实现由粗到细的渐变
   */
  drawVelocitySegment(t, a, n, s) {
    const i = Math.sqrt(
      Math.pow(a.x - t.x, 2) + Math.pow(a.y - t.y, 2)
    ), h = Math.max(2, Math.min(10, Math.floor(i / 3)));
    this.ctx.beginPath();
    const c = [];
    for (let r = 0; r <= h; r++) {
      const m = r / h, p = this.smoothStep(m), v = t.x + (a.x - t.x) * p, d = t.y + (a.y - t.y) * p, x = n + (s - n) * p, C = a.x - t.x, _ = a.y - t.y, A = Math.sqrt(C * C + _ * _);
      if (A > 0) {
        const k = -_ / A * x / 2, D = C / A * x / 2;
        r === 0 ? this.ctx.moveTo(v + k, d + D) : this.ctx.lineTo(v + k, d + D), c.push({ x: v - k, y: d - D });
      }
    }
    for (let r = c.length - 1; r >= 0; r--)
      this.ctx.lineTo(c[r].x, c[r].y);
    this.ctx.closePath(), this.ctx.fill();
  }
  /**
   * 基于速度变化的智能连接 - 优化连笔效果，增强连笔的明显性
   */
  addVelocityBasedConnections(t) {
    for (let a = 1; a < t.length - 1; a++) {
      const n = t[a - 1], s = t[a], i = t[a + 1], h = Math.abs(s.velocity - n.velocity), c = (s.velocity + n.velocity) / 2, r = Math.atan2(s.y - n.y, s.x - n.x), m = Math.atan2(i.y - s.y, i.x - s.x);
      let p = Math.abs(m - r);
      if (p > Math.PI && (p = 2 * Math.PI - p), h > c * 0.3 || p > 0.15) {
        const d = s.smoothedWidth * 0.6, x = this.ctx.createRadialGradient(
          s.x,
          s.y,
          0,
          s.x,
          s.y,
          d
        );
        x.addColorStop(0, this.ctx.fillStyle), x.addColorStop(1, "transparent");
        const C = this.ctx.fillStyle;
        this.ctx.fillStyle = x, this.ctx.beginPath(), this.ctx.arc(s.x, s.y, d, 0, Math.PI * 2), this.ctx.fill(), this.ctx.fillStyle = C;
      }
      if (p > 0.05) {
        const d = s.smoothedWidth * 0.2;
        this.ctx.beginPath(), this.ctx.arc(s.x, s.y, d, 0, Math.PI * 2), this.ctx.fill();
      }
    }
  }
  /**
   * 平滑插值函数 - 基于Paper.js的平滑算法
   */
  smoothStep(t) {
    return t * t * (3 - 2 * t);
  }
  /**
   * 获取控制点（用于贝塞尔曲线平滑） - 与signature.ts中的实现一致
   */
  getControlPoint(t, a, n) {
    const i = {
      length: Math.sqrt(Math.pow(n.x - a.x, 2) + Math.pow(n.y - a.y, 2)),
      angle: Math.atan2(n.y - a.y, n.x - a.x)
    }, h = i.angle + Math.PI, c = i.length * 0.2;
    return {
      x: t.x + Math.cos(h) * c,
      y: t.y + Math.sin(h) * c,
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
        const n = this.eventCallbacks.get(t), s = n.indexOf(a);
        s > -1 && n.splice(s, 1);
      } else
        this.eventCallbacks.delete(t);
  }
  /**
   * 触发事件
   */
  emit(t, ...a) {
    const n = this.eventCallbacks.get(t);
    n && n.forEach((s) => s(...a));
  }
  /**
   * 在离屏画布上绘制完整路径
   */
  drawCompletePathToOffscreen(t) {
    if (!this.offscreenCtx || t.points.length < 2)
      return;
    const a = this.ctx;
    this.ctx = this.offscreenCtx;
    const n = t.penStyle || this.options.penStyle || "pen";
    this.drawStyledStrokeForReplay(t.points, n, t.strokeColor, t.strokeWidth), this.ctx = a;
  }
  /**
   * 在离屏画布上绘制部分路径
   */
  drawPartialPathToOffscreen(t, a) {
    if (!this.offscreenCtx || t.points.length < 2)
      return;
    const n = t.startTime || 0, s = t.duration || 0, i = n + s * a, h = this.getPointsUpToTime(t.points, n, i);
    if (h.length < 2)
      return;
    const c = this.ctx;
    this.ctx = this.offscreenCtx;
    const r = t.penStyle || this.options.penStyle || "pen";
    this.drawStyledStrokeForReplay(h, r, t.strokeColor, t.strokeWidth), this.ctx = c;
  }
  /**
   * 销毁控制器
   */
  destroy() {
    this.stop(), this.eventCallbacks.clear(), this.replayData = null, this.lastFrameImageBitmap && (this.lastFrameImageBitmap.close(), this.lastFrameImageBitmap = null);
  }
}
function xt(l) {
  const t = l.paths.map((r) => {
    const m = r.points.map((v, d) => {
      var C;
      let x;
      if (v.time && r.points[0].time)
        x = v.time - r.points[0].time;
      else if (d === 0)
        x = 0;
      else {
        const _ = r.points[d - 1], k = Math.sqrt(
          Math.pow(v.x - _.x, 2) + Math.pow(v.y - _.y, 2)
        ) / 100 * 1e3;
        x = (((C = m[d - 1]) == null ? void 0 : C.relativeTime) || 0) + Math.max(k, 16);
      }
      return {
        ...v,
        relativeTime: x
      };
    }), p = m.length > 0 ? m[m.length - 1].relativeTime : 0;
    return {
      ...r,
      points: m,
      duration: p
    };
  }), a = [];
  for (let r = 0; r < t.length; r++) {
    const m = t[r];
    let p;
    if (r === 0)
      p = 0;
    else {
      const x = a[r - 1], C = Ct(
        l.paths[r - 1].points,
        l.paths[r].points
      );
      p = x.endTime + C;
    }
    const v = p + m.duration, d = {
      ...m,
      startTime: p,
      endTime: v
    };
    console.log(`路径 ${r}: 开始时间=${p}, 结束时间=${v}, 持续时间=${m.duration}`), a.push(d);
  }
  const n = a.length > 0 ? a[a.length - 1].endTime : 0;
  console.log("回放数据生成完成:"), console.log("- 路径数量:", a.length), console.log("- 总时长:", n), console.log("- 路径详情:", a.map((r) => ({
    startTime: r.startTime,
    endTime: r.endTime,
    duration: r.duration,
    pointCount: r.points.length
  })));
  const s = a.reduce((r, m) => r + bt(m.points), 0), i = n > 0 ? s / (n / 1e3) : 0, h = a.slice(1).map((r, m) => {
    const p = a[m];
    return r.startTime - p.endTime;
  }), c = h.length > 0 ? h.reduce((r, m) => r + m, 0) / h.length : 0;
  return {
    paths: a,
    totalDuration: n,
    speed: 1,
    metadata: {
      deviceType: Mt(l),
      averageSpeed: i,
      totalDistance: s,
      averagePauseTime: c
    }
  };
}
function Ct(l, t) {
  if (l.length === 0 || t.length === 0)
    return 200;
  const a = l[l.length - 1], n = t[0];
  if (a.time && n.time)
    return Math.max(n.time - a.time, 50);
  const s = Math.sqrt(
    Math.pow(n.x - a.x, 2) + Math.pow(n.y - a.y, 2)
  );
  return Math.min(Math.max(s * 2, 100), 1e3);
}
function Mt(l) {
  const t = l.paths.reduce((i, h) => i + h.points.length, 0), a = l.paths.length;
  if (t === 0)
    return "touch";
  const n = t / a;
  return n > 20 ? "touch" : n < 10 ? "mouse" : l.paths.some(
    (i) => i.points.some((h) => h.pressure !== void 0)
  ) ? "pen" : "touch";
}
function bt(l) {
  let t = 0;
  for (let a = 1; a < l.length; a++) {
    const n = l[a].x - l[a - 1].x, s = l[a].y - l[a - 1].y;
    t += Math.sqrt(n * n + s * s);
  }
  return t;
}
const Ae = {
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
function wt(l) {
  return Ae[l];
}
function jt() {
  return Object.entries(Ae).map(([l, t]) => ({
    key: l,
    config: t
  }));
}
function Tt(l, t) {
  const a = wt(l);
  return {
    strokeWidth: a.strokeWidth,
    smoothing: a.smoothing,
    pressure: a.pressure,
    lineCap: a.lineCap,
    lineJoin: a.lineJoin,
    strokeColor: t || a.recommendedColor || "#000000"
  };
}
const kt = ["width", "height"], St = {
  key: 1,
  class: "signature-toolbar"
}, Pt = ["disabled"], Dt = ["disabled"], Wt = ["disabled"], Rt = {
  key: 2,
  class: "replay-controls"
}, It = { class: "replay-buttons" }, Et = ["disabled"], Ot = { key: 0 }, _t = { key: 1 }, At = ["disabled"], Ft = { class: "replay-progress" }, Jt = ["max", "value", "disabled"], qt = { class: "time-display" }, $t = { class: "replay-speed" }, Bt = 16, zt = /* @__PURE__ */ ht({
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
    realTimeMode: { type: Boolean, default: !0 },
    replayData: {},
    replayOptions: {}
  },
  emits: ["signature-start", "signature-drawing", "signature-end", "signature-clear", "signature-undo", "signature-redo", "replay-start", "replay-progress", "replay-pause", "replay-resume", "replay-stop", "replay-complete", "replay-path-start", "replay-path-end", "replay-speed-change"],
  setup(l, { expose: t, emit: a }) {
    const n = l, s = a, i = E(), h = E(!1), c = E(null), r = E(j(0, 0)), m = E([]), p = E(-1), v = E(0), d = E(null), x = E(!1), C = E("idle"), _ = E(0), A = E(0), k = O(() => typeof n.width == "number" ? n.width : 800), D = O(() => typeof n.height == "number" ? n.height : 300), Je = O(() => ({
      position: "relative",
      display: "inline-block",
      width: typeof n.width == "string" ? n.width : `${n.width}px`,
      height: typeof n.height == "string" ? n.height : `${n.height}px`
    })), qe = O(() => ({
      border: n.borderStyle,
      borderRadius: n.borderRadius,
      backgroundColor: n.backgroundColor,
      cursor: n.disabled ? "not-allowed" : "crosshair",
      display: "block",
      width: "100%",
      height: "100%"
    })), $e = O(() => ({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "#999",
      fontSize: "14px",
      pointerEvents: "none",
      userSelect: "none"
    })), Be = O(() => x.value ? !1 : n.placeholder && N(r.value)), he = O(() => p.value > 0), ce = O(() => p.value < m.value.length - 1), ue = O(() => x.value && d.value), F = O(() => !ue.value && !n.disabled), ze = O(() => {
      var e;
      return ue.value && ((e = n.replayOptions) == null ? void 0 : e.showControls) !== !1;
    }), I = O(() => {
      if (n.penStyle) {
        const e = Tt(n.penStyle, n.strokeColor);
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
    }), G = () => {
      var e;
      return ((e = i.value) == null ? void 0 : e.getContext("2d")) || null;
    }, L = (e, o) => {
      const g = i.value, f = g.getBoundingClientRect(), u = g.width / f.width, y = g.height / f.height;
      return {
        x: (e - f.left) * u,
        y: (o - f.top) * y,
        time: Date.now()
      };
    }, de = (e) => {
      if (!F.value)
        return;
      h.value = !0;
      const o = performance.now(), g = { ...e, time: o };
      c.value = {
        points: [g],
        strokeColor: n.strokeColor,
        strokeWidth: n.strokeWidth,
        penStyle: n.penStyle,
        // 保存笔迹样式
        startTime: o,
        endTime: o,
        duration: 0
      }, s("signature-start");
    }, Q = (e, o, g, f) => {
      switch (g) {
        case "pen":
          return 1;
        case "brush":
          if (o) {
            const S = Math.sqrt(Math.pow(e.x - o.x, 2) + Math.pow(e.y - o.y, 2)), J = Math.max(1, (e.time || 0) - (o.time || 0)), W = S / J, q = Math.max(0.1, Math.min(3, 100 / Math.max(W, 1))), B = e.pressure || 0.5, X = 0.8 + Math.random() * 0.4;
            return Math.max(1, Math.min(20, f * q * (0.3 + B * 1.4) * X));
          }
          return f;
        case "marker":
          return 12;
        case "pencil":
          const u = e.pressure || 0.5, y = 0.9 + Math.random() * 0.2;
          return f * (0.7 + u * 0.6) * y;
        case "ballpoint":
          const M = e.pressure || 0.5;
          return f * (0.8 + M * 0.4);
        case "elegant":
          const w = e.pressure || 0.5;
          let b = 1;
          if (o) {
            const S = Math.sqrt(Math.pow(e.x - o.x, 2) + Math.pow(e.y - o.y, 2)), J = Math.max(1, (e.time || 0) - (o.time || 0)), W = S / J;
            b = Math.max(0.3, Math.min(2, 50 / Math.max(W, 1)));
          }
          const R = w * b;
          return f * (0.4 + R * 1.6);
        default:
          return f;
      }
    }, K = (e, o, g) => {
      var f;
      if (!(o.length < 2))
        switch (e.strokeStyle = ((f = c.value) == null ? void 0 : f.strokeColor) || I.value.strokeColor, e.lineCap = I.value.lineCap || "round", e.lineJoin = I.value.lineJoin || "round", g) {
          case "pen":
            if (e.lineWidth = 1, e.lineCap = "butt", e.lineJoin = "miter", e.beginPath(), e.moveTo(o[0].x, o[0].y), o.length >= 3) {
              for (let u = 1; u < o.length - 1; u++) {
                const y = me(o[u], o[u - 1], o[u + 1]);
                e.quadraticCurveTo(y.x, y.y, o[u].x, o[u].y);
              }
              e.lineTo(o[o.length - 1].x, o[o.length - 1].y);
            } else
              for (let u = 1; u < o.length; u++)
                e.lineTo(o[u].x, o[u].y);
            e.stroke();
            break;
          case "brush":
            e.lineCap = "round", e.lineJoin = "round";
            for (let u = 1; u < o.length; u++) {
              const y = o[u], M = o[u - 1], w = Q(y, M, g, I.value.strokeWidth), b = e.createLinearGradient(M.x, M.y, y.x, y.y);
              b.addColorStop(0, e.strokeStyle), b.addColorStop(1, e.strokeStyle), e.lineWidth = w, e.beginPath(), e.moveTo(M.x, M.y), e.lineTo(y.x, y.y), e.stroke(), w > 8 && Math.random() > 0.6 && (e.globalAlpha = 0.2, e.beginPath(), e.arc(y.x, y.y, w * 0.3, 0, Math.PI * 2), e.fill(), e.globalAlpha = 1);
            }
            break;
          case "marker":
            e.globalAlpha = 0.7, e.lineWidth = 12, e.lineCap = "square", e.lineJoin = "bevel", e.beginPath(), e.moveTo(o[0].x, o[0].y);
            for (let u = 1; u < o.length; u++)
              e.lineTo(o[u].x, o[u].y);
            e.stroke(), e.globalAlpha = 0.3, e.lineWidth = 16, e.beginPath(), e.moveTo(o[0].x, o[0].y);
            for (let u = 1; u < o.length; u++)
              e.lineTo(o[u].x, o[u].y);
            e.stroke(), e.globalAlpha = 1;
            break;
          case "pencil":
            e.lineCap = "round", e.lineJoin = "round";
            for (let u = 1; u < o.length; u++) {
              const y = o[u], M = o[u - 1], w = Q(y, M, g, I.value.strokeWidth);
              e.lineWidth = w, e.globalAlpha = 0.8, e.beginPath(), e.moveTo(M.x, M.y), e.lineTo(y.x, y.y), e.stroke();
              for (let b = 0; b < 3; b++)
                if (Math.random() > 0.5) {
                  e.globalAlpha = 0.2, e.lineWidth = w * 0.3;
                  const R = (Math.random() - 0.5) * 2, S = (Math.random() - 0.5) * 2;
                  e.beginPath(), e.moveTo(M.x + R, M.y + S), e.lineTo(y.x + R, y.y + S), e.stroke();
                }
              if (Math.random() > 0.8) {
                e.globalAlpha = 0.4;
                for (let b = 0; b < 5; b++)
                  e.beginPath(), e.arc(
                    y.x + (Math.random() - 0.5) * 3,
                    y.y + (Math.random() - 0.5) * 3,
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
            for (let u = 1; u < o.length; u++) {
              const y = o[u], M = o[u - 1], w = Q(y, M, g, I.value.strokeWidth);
              if (Math.random() > 0.1) {
                if (e.lineWidth = w, e.globalAlpha = Math.random() > 0.2 ? 1 : 0.7, e.beginPath(), I.value.smoothing && u < o.length - 1) {
                  const b = o[u + 1], R = me(y, M, b);
                  e.moveTo(M.x, M.y), e.quadraticCurveTo(R.x, R.y, y.x, y.y);
                } else
                  e.moveTo(M.x, M.y), e.lineTo(y.x, y.y);
                e.stroke();
              }
              Math.random() > 0.95 && (e.globalAlpha = 0.8, e.beginPath(), e.arc(y.x, y.y, w * 0.8, 0, Math.PI * 2), e.fill());
            }
            e.globalAlpha = 1;
            break;
          case "elegant":
            Xe(e, o);
            break;
        }
    }, Ve = () => {
      if (!c.value || c.value.points.length < 2)
        return;
      const e = G();
      if (e) {
        e.clearRect(0, 0, k.value, D.value);
        for (const o of r.value.paths)
          o !== c.value && Z(e, o);
        c.value.points.length >= 2 && Z(e, c.value);
      }
    }, Ye = () => {
      if (!c.value || c.value.points.length < 2)
        return;
      const e = G();
      if (!e)
        return;
      const o = c.value.points, g = o.length, f = n.penStyle || "pen";
      if (g === 2)
        K(e, o, f);
      else if (g >= 3) {
        const u = o.slice(-3);
        K(e, u, f);
      }
    }, Xe = (e, o) => {
      var f, u;
      if (o.length < 2)
        return;
      e.strokeStyle = ((f = c.value) == null ? void 0 : f.strokeColor) || I.value.strokeColor, e.fillStyle = ((u = c.value) == null ? void 0 : u.strokeColor) || I.value.strokeColor, e.lineCap = "round", e.lineJoin = "round", e.globalCompositeOperation = "source-over";
      const g = Le(o, I.value.strokeWidth);
      Ue(e, g), Ne(e, g);
    }, Le = (e, o) => {
      const g = [];
      for (let f = 0; f < e.length; f++) {
        const u = e[f];
        let y = 0, M = o;
        if (f > 0) {
          const b = e[f - 1], R = Math.sqrt(
            Math.pow(u.x - b.x, 2) + Math.pow(u.y - b.y, 2)
          ), S = Math.max(1, (u.time || 0) - (b.time || 0));
          y = R / S;
          const J = u.pressure || 0.5, W = Math.max(0.2, Math.min(3, 100 / Math.max(y, 1)));
          M = o * (0.3 + J * W * 1.4);
        }
        let w = M;
        if (f > 0) {
          const b = g[f - 1].smoothedWidth;
          w = b + (M - b) * 0.3;
        }
        g.push({
          ...u,
          velocity: y,
          dynamicWidth: M,
          smoothedWidth: Math.max(0.5, Math.min(o * 3, w))
        });
      }
      return g;
    }, Ue = (e, o) => {
      if (!(o.length < 2))
        for (let g = 1; g < o.length; g++) {
          const f = o[g], u = o[g - 1];
          He(e, u, f, u.smoothedWidth, f.smoothedWidth);
        }
    }, He = (e, o, g, f, u) => {
      const y = Math.sqrt(
        Math.pow(g.x - o.x, 2) + Math.pow(g.y - o.y, 2)
      ), M = Math.max(2, Math.min(10, Math.floor(y / 3)));
      e.beginPath();
      const w = [];
      for (let b = 0; b <= M; b++) {
        const R = b / M, S = je(R), J = o.x + (g.x - o.x) * S, W = o.y + (g.y - o.y) * S, q = f + (u - f) * S, B = g.x - o.x, X = g.y - o.y, te = Math.sqrt(B * B + X * X);
        if (te > 0) {
          const ae = -X / te * q / 2, ne = B / te * q / 2;
          b === 0 ? e.moveTo(J + ae, W + ne) : e.lineTo(J + ae, W + ne), w.push({ x: J - ae, y: W - ne });
        }
      }
      for (let b = w.length - 1; b >= 0; b--)
        e.lineTo(w[b].x, w[b].y);
      e.closePath(), e.fill();
    }, Ne = (e, o) => {
      for (let g = 1; g < o.length - 1; g++) {
        const f = o[g - 1], u = o[g], y = o[g + 1], M = Math.abs(u.velocity - f.velocity), w = (u.velocity + f.velocity) / 2, b = Math.atan2(u.y - f.y, u.x - f.x), R = Math.atan2(y.y - u.y, y.x - u.x);
        let S = Math.abs(R - b);
        if (S > Math.PI && (S = 2 * Math.PI - S), M > w * 0.3 || S > 0.15) {
          const W = u.smoothedWidth * 0.6, q = e.createRadialGradient(
            u.x,
            u.y,
            0,
            u.x,
            u.y,
            W
          );
          q.addColorStop(0, e.fillStyle), q.addColorStop(1, "transparent");
          const B = e.fillStyle;
          e.fillStyle = q, e.beginPath(), e.arc(u.x, u.y, W, 0, Math.PI * 2), e.fill(), e.fillStyle = B;
        }
        if (S > 0.05) {
          const W = u.smoothedWidth * 0.2;
          e.beginPath(), e.arc(u.x, u.y, W, 0, Math.PI * 2), e.fill();
        }
      }
    }, je = (e) => e * e * (3 - 2 * e), me = (e, o, g) => {
      const u = {
        length: Math.sqrt(Math.pow(g.x - o.x, 2) + Math.pow(g.y - o.y, 2)),
        angle: Math.atan2(g.y - o.y, g.x - o.x)
      }, y = u.angle + Math.PI, M = u.length * 0.2;
      return {
        x: e.x + Math.cos(y) * M,
        y: e.y + Math.sin(y) * M,
        time: e.time || 0
      };
    }, Z = (e, o) => {
      if (o.points.length < 2)
        return;
      const g = o.penStyle || n.penStyle || "pen", f = c.value;
      c.value = o, K(e, o.points, g), c.value = f;
    }, ge = (e) => {
      if (!h.value || !c.value || !F.value)
        return;
      const o = performance.now();
      if (o - v.value < Bt)
        return;
      v.value = o;
      const g = { ...e, time: o };
      c.value.points.push(g), c.value.startTime && (c.value.endTime = o, c.value.duration = o - c.value.startTime), n.realTimeMode ? Ve() : Ye(), ve(), s("signature-drawing", r.value);
    }, pe = () => {
      if (!(!h.value || !c.value)) {
        if (h.value = !1, c.value.points.length > 0) {
          const e = c.value.points[c.value.points.length - 1];
          e.time && c.value.startTime && (c.value.endTime = e.time, c.value.duration = e.time - c.value.startTime);
        }
        r.value.paths.push(c.value), r.value.isEmpty = !1, r.value.timestamp = Date.now(), U(), $(), c.value = null, s("signature-end", r.value);
      }
    }, Ge = (e) => {
      e.preventDefault();
      const o = L(e.clientX, e.clientY);
      de(o);
    }, Qe = (e) => {
      if (e.preventDefault(), !h.value)
        return;
      const o = L(e.clientX, e.clientY);
      ge(o);
    }, fe = (e) => {
      e.preventDefault(), pe();
    }, Ke = (e) => {
      if (e.preventDefault(), e.touches.length !== 1)
        return;
      const o = e.touches[0], g = L(o.clientX, o.clientY);
      de(g);
    }, Ze = (e) => {
      if (e.preventDefault(), e.touches.length !== 1 || !h.value)
        return;
      const o = e.touches[0], g = L(o.clientX, o.clientY);
      ge(g);
    }, ye = (e) => {
      e.preventDefault(), pe();
    }, ve = () => {
      r.value.canvasSize = {
        width: k.value,
        height: D.value
      }, r.value.isEmpty = N(r.value);
    }, U = () => {
      m.value = m.value.slice(0, p.value + 1), m.value.push(Y(r.value)), p.value = m.value.length - 1;
      const e = 50;
      m.value.length > e && (m.value = m.value.slice(-e), p.value = m.value.length - 1);
    }, $ = () => {
      const e = G();
      e && (e.clearRect(0, 0, k.value, D.value), n.backgroundColor && n.backgroundColor !== "transparent" && (e.fillStyle = n.backgroundColor, e.fillRect(0, 0, k.value, D.value)), r.value.paths.forEach((o) => {
        o.points.length > 0 && Z(e, o);
      }));
    }, H = () => {
      if (console.log("初始化回放控制器"), console.log("canvas引用是否存在:", !!i.value), !i.value) {
        console.error("canvas引用不存在，无法初始化回放控制器");
        return;
      }
      d.value && (console.log("销毁现有回放控制器"), d.value.destroy()), console.log("创建新的回放控制器"), d.value = new vt(i.value), console.log("回放控制器创建成功:", !!d.value), d.value.on("replay-start", () => {
        C.value = "playing", s("replay-start");
      }), d.value.on("replay-progress", (e, o) => {
        _.value = e, A.value = o, s("replay-progress", e, o);
      }), d.value.on("replay-pause", () => {
        C.value = "paused", s("replay-pause");
      }), d.value.on("replay-resume", () => {
        C.value = "playing", s("replay-resume");
      }), d.value.on("replay-stop", () => {
        C.value = "stopped", s("replay-stop");
      }), d.value.on("replay-complete", () => {
        C.value = "completed", s("replay-complete");
      }), d.value.on("replay-path-start", (e, o) => {
        s("replay-path-start", e, o);
      }), d.value.on("replay-path-end", (e, o) => {
        s("replay-path-end", e, o);
      }), d.value.on("replay-speed-change", (e) => {
        s("replay-speed-change", e);
      });
    }, xe = (e, o) => {
      if (d.value || H(), d.value) {
        x.value = !0;
        const g = {
          ...o,
          drawOptions: I.value,
          penStyle: n.penStyle
        };
        d.value.setReplayData(e, g), console.log("startReplay调用，自动播放:", o == null ? void 0 : o.autoPlay), (o == null ? void 0 : o.autoPlay) === !0 && d.value.play();
      }
    }, Ce = (e) => {
      x.value = e, !e && d.value && (d.value.stop(), $());
    }, et = () => N(r.value) ? null : xt(r.value), Me = () => {
      console.log("play方法被调用"), console.log("回放控制器是否存在:", !!d.value), d.value || (console.log("回放控制器不存在，尝试初始化"), H()), d.value ? (console.log("调用回放控制器的play方法"), d.value.play()) : console.error("回放控制器初始化失败，无法播放");
    }, be = () => {
      var e;
      (e = d.value) == null || e.pause();
    }, we = () => {
      var e;
      (e = d.value) == null || e.stop();
    }, Te = (e) => {
      var o;
      (o = d.value) == null || o.seek(e);
    }, ke = (e) => {
      var o;
      (o = d.value) == null || o.setSpeed(e);
    }, tt = () => {
      var e;
      return ((e = d.value) == null ? void 0 : e.getState()) || "idle";
    }, at = () => {
      var e;
      return ((e = d.value) == null ? void 0 : e.getCurrentTime()) || 0;
    }, ee = () => {
      var e;
      return ((e = d.value) == null ? void 0 : e.getTotalDuration()) || 0;
    }, nt = () => {
      var e;
      return ((e = d.value) == null ? void 0 : e.getProgress()) || 0;
    }, Se = (e) => {
      const o = Math.floor(e / 1e3), g = Math.floor(o / 60), f = o % 60;
      return `${g}:${f.toString().padStart(2, "0")}`;
    }, Pe = () => {
      F.value && (r.value = j(k.value, D.value), $(), U(), s("signature-clear"));
    }, De = () => {
      !he.value || !F.value || (p.value--, r.value = Y(m.value[p.value]), $(), s("signature-undo", r.value));
    }, We = () => {
      !ce.value || !F.value || (p.value++, r.value = Y(m.value[p.value]), $(), s("signature-redo", r.value));
    }, Re = (e) => {
      const o = i.value;
      return ft(o, r.value, e);
    }, Ie = () => N(r.value), Ee = async (e) => {
      if (!F.value)
        return;
      const o = i.value;
      await yt(o, e), r.value = j(k.value, D.value), r.value.isEmpty = !1, U();
    }, ot = () => Y(r.value), st = (e) => {
      F.value && (r.value = Y(e), $(), U());
    }, Oe = (e, o) => {
      const g = e || k.value, f = o || D.value, u = Re({ format: "png" });
      se(() => {
        const y = i.value;
        y.width = g, y.height = f, Ie() || Ee(u), ve();
      });
    }, it = () => {
      const e = i.value;
      e.width = k.value, e.height = D.value, r.value = j(k.value, D.value), m.value = [Y(r.value)], p.value = 0, $();
    };
    return oe([() => n.width, () => n.height], () => {
      se(() => {
        i.value && Oe();
      });
    }), oe(() => n.replayMode, (e) => {
      e !== void 0 && Ce(e);
    }), oe(() => n.replayData, (e) => {
      if (console.log("watch监听到回放数据变化:", e), console.log("当前回放模式:", n.replayMode), console.log("回放控制器是否存在:", !!d.value), e && n.replayMode)
        if (d.value || (console.log("回放控制器未初始化，先初始化"), H()), d.value) {
          console.log("开始设置回放数据到控制器");
          const o = {
            ...n.replayOptions,
            drawOptions: I.value,
            penStyle: n.penStyle
          };
          d.value.setReplayData(e, o), console.log("回放数据已更新:", e);
        } else
          console.error("回放控制器初始化失败");
      else
        e || console.log("回放数据为空，跳过设置"), n.replayMode || console.log("不在回放模式，跳过设置");
    }, { immediate: !0 }), ct(() => {
      se(() => {
        it(), H(), n.replayMode && n.replayData && xe(n.replayData, n.replayOptions);
      });
    }), ut(() => {
      d.value && (d.value.destroy(), d.value = null);
    }), t({
      clear: Pe,
      undo: De,
      redo: We,
      save: Re,
      isEmpty: Ie,
      fromDataURL: Ee,
      getSignatureData: ot,
      setSignatureData: st,
      resize: Oe,
      // 回放相关方法
      startReplay: xe,
      getReplayData: et,
      setReplayMode: Ce,
      play: Me,
      pause: be,
      stop: we,
      seek: Te,
      setSpeed: ke,
      getState: tt,
      getCurrentTime: at,
      getTotalDuration: ee,
      getProgress: nt
    }), (e, o) => (z(), V("div", {
      class: "electronic-signature",
      style: ie(Je.value)
    }, [
      T("canvas", {
        ref_key: "canvasRef",
        ref: i,
        width: k.value,
        height: D.value,
        style: ie(qe.value),
        onMousedown: Ge,
        onMousemove: Qe,
        onMouseup: fe,
        onMouseleave: fe,
        onTouchstart: Ke,
        onTouchmove: Ze,
        onTouchend: ye,
        onTouchcancel: ye
      }, null, 44, kt),
      Be.value ? (z(), V("div", {
        key: 0,
        class: "signature-placeholder",
        style: ie($e.value)
      }, le(e.placeholder), 5)) : re("", !0),
      e.showToolbar ? (z(), V("div", St, [
        T("button", {
          onClick: Pe,
          disabled: !F.value
        }, "清除", 8, Pt),
        T("button", {
          onClick: De,
          disabled: !F.value || !he.value
        }, "撤销", 8, Dt),
        T("button", {
          onClick: We,
          disabled: !F.value || !ce.value
        }, "重做", 8, Wt)
      ])) : re("", !0),
      ze.value ? (z(), V("div", Rt, [
        T("div", It, [
          T("button", {
            onClick: o[0] || (o[0] = (g) => C.value === "playing" ? be() : Me()),
            disabled: C.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            C.value === "playing" ? (z(), V("span", Ot, "⏸️")) : (z(), V("span", _t, "▶️"))
          ], 8, Et),
          T("button", {
            onClick: o[1] || (o[1] = (g) => we()),
            disabled: C.value === "idle",
            class: "replay-btn stop-btn"
          }, " ⏹️ ", 8, At)
        ]),
        T("div", Ft, [
          T("input", {
            type: "range",
            min: "0",
            max: ee(),
            value: A.value,
            onInput: o[2] || (o[2] = (g) => Te(Number(g.target.value))),
            class: "progress-slider",
            disabled: C.value === "idle"
          }, null, 40, Jt),
          T("div", qt, [
            T("span", null, le(Se(A.value)), 1),
            o[4] || (o[4] = T("span", null, "/", -1)),
            T("span", null, le(Se(ee())), 1)
          ])
        ]),
        T("div", $t, [
          o[6] || (o[6] = T("label", null, "速度:", -1)),
          T("select", {
            onChange: o[3] || (o[3] = (g) => ke(Number(g.target.value))),
            class: "speed-select"
          }, o[5] || (o[5] = [
            T("option", { value: "0.5" }, "0.5x", -1),
            T("option", {
              value: "1",
              selected: ""
            }, "1x", -1),
            T("option", { value: "1.5" }, "1.5x", -1),
            T("option", { value: "2" }, "2x", -1)
          ]), 32)
        ])
      ])) : re("", !0)
    ], 4));
  }
});
const Vt = (l, t) => {
  const a = l.__vccOpts || l;
  for (const [n, s] of t)
    a[n] = s;
  return a;
}, Fe = /* @__PURE__ */ Vt(zt, [["__scopeId", "data-v-3010a1bd"]]);
function Yt() {
  return window.devicePixelRatio || 1;
}
function Gt(l) {
  const t = l.getContext("2d"), a = Yt(), n = l.clientWidth, s = l.clientHeight;
  return l.width = n * a, l.height = s * a, t.scale(a, a), l.style.width = n + "px", l.style.height = s + "px", t;
}
function Xt(l) {
  if (l.paths.length === 0)
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0
    };
  let t = 1 / 0, a = 1 / 0, n = -1 / 0, s = -1 / 0;
  return l.paths.forEach((i) => {
    i.points.forEach((h) => {
      t = Math.min(t, h.x), a = Math.min(a, h.y), n = Math.max(n, h.x), s = Math.max(s, h.y);
    });
  }), {
    minX: t,
    minY: a,
    maxX: n,
    maxY: s,
    width: n - t,
    height: s - a
  };
}
function Qt(l, t, a = 10) {
  const n = Xt(t);
  if (n.width === 0 || n.height === 0) {
    const r = document.createElement("canvas");
    return r.width = 1, r.height = 1, r;
  }
  const s = document.createElement("canvas"), i = s.getContext("2d"), h = n.width + a * 2, c = n.height + a * 2;
  return s.width = h, s.height = c, i.drawImage(
    l,
    n.minX - a,
    n.minY - a,
    h,
    c,
    0,
    0,
    h,
    c
  ), s;
}
function Kt(l, t, a, n = !0) {
  const s = document.createElement("canvas"), i = s.getContext("2d");
  let h = t, c = a;
  if (n) {
    const r = l.width / l.height, m = t / a;
    r > m ? c = t / r : h = a * r;
  }
  return s.width = h, s.height = c, i.imageSmoothingEnabled = !0, i.imageSmoothingQuality = "high", i.drawImage(l, 0, 0, h, c), s;
}
function Zt(l, t, a = {}) {
  const {
    fontSize: n = 12,
    fontFamily: s = "Arial",
    color: i = "#999",
    opacity: h = 0.5,
    position: c = "bottom-right"
  } = a, r = document.createElement("canvas"), m = r.getContext("2d");
  r.width = l.width, r.height = l.height, m.drawImage(l, 0, 0), m.font = `${n}px ${s}`, m.fillStyle = i, m.globalAlpha = h;
  const v = m.measureText(t).width, d = n;
  let x, C;
  switch (c) {
    case "top-left":
      x = 10, C = d + 10;
      break;
    case "top-right":
      x = l.width - v - 10, C = d + 10;
      break;
    case "bottom-left":
      x = 10, C = l.height - 10;
      break;
    case "bottom-right":
      x = l.width - v - 10, C = l.height - 10;
      break;
    case "center":
      x = (l.width - v) / 2, C = (l.height + d) / 2;
      break;
    default:
      x = l.width - v - 10, C = l.height - 10;
  }
  return m.fillText(t, x, C), m.globalAlpha = 1, r;
}
function ea(l) {
  const t = document.createElement("canvas"), a = t.getContext("2d");
  t.width = l.width, t.height = l.height, a.drawImage(l, 0, 0);
  const n = a.getImageData(0, 0, l.width, l.height), s = n.data;
  for (let i = 0; i < s.length; i += 4) {
    const h = s[i] * 0.299 + s[i + 1] * 0.587 + s[i + 2] * 0.114;
    s[i] = h, s[i + 1] = h, s[i + 2] = h;
  }
  return a.putImageData(n, 0, 0), t;
}
const Lt = (l) => {
  l.component("ElectronicSignature", Fe);
}, ta = {
  install: Lt,
  ElectronicSignature: Fe
}, aa = "1.0.0";
export {
  Fe as ElectronicSignature,
  Ae as PEN_STYLE_CONFIGS,
  vt as SignatureReplayController,
  Zt as addWatermark,
  gt as calculateStrokeWidth,
  Y as cloneSignatureData,
  ea as convertToGrayscale,
  Tt as createDrawOptionsFromPenStyle,
  j as createEmptySignatureData,
  xt as createReplayData,
  Qt as cropSignature,
  ta as default,
  Nt as drawSmoothPath,
  ft as exportSignature,
  jt as getAllPenStyles,
  dt as getAngle,
  mt as getControlPoint,
  Yt as getDevicePixelRatio,
  _e as getDistance,
  wt as getPenStyleConfig,
  Xt as getSignatureBounds,
  N as isSignatureEmpty,
  yt as loadImageToCanvas,
  Kt as resizeSignature,
  Gt as setupHighDPICanvas,
  pt as signatureToSVG,
  aa as version
};
