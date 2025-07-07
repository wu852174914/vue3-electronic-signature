var rt = Object.defineProperty;
var ht = (l, t, n) => t in l ? rt(l, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : l[t] = n;
var P = (l, t, n) => (ht(l, typeof t != "symbol" ? t + "" : t, n), n);
import { defineComponent as ct, ref as E, computed as O, watch as oe, nextTick as se, onMounted as ut, onUnmounted as dt, openBlock as z, createElementBlock as V, normalizeStyle as ie, createElementVNode as T, toDisplayString as le, createCommentVNode as re } from "vue";
function _e(l, t) {
  return Math.sqrt(
    Math.pow(t.x - l.x, 2) + Math.pow(t.y - l.y, 2)
  );
}
function mt(l, t) {
  return Math.atan2(t.y - l.y, t.x - l.x);
}
function gt(l, t, n, a) {
  const s = t || l, i = n || l, h = 0.2, c = mt(s, i) * (a ? 1 : -1), r = _e(s, i) * h;
  return {
    x: l.x + Math.cos(c) * r,
    y: l.y + Math.sin(c) * r,
    time: l.time
  };
}
function pt(l, t, n) {
  if (!n.pressure.enabled)
    return n.strokeWidth;
  const a = _e(l, t), s = t.time - l.time, i = s > 0 ? a / s : 0, h = Math.max(0.1, Math.min(1, 1 - i * 0.01)), { min: c, max: r } = n.pressure;
  return c + (r - c) * h;
}
function jt(l, t, n) {
  if (t.length < 2)
    return;
  if (l.strokeStyle = n.strokeColor, l.lineCap = "round", l.lineJoin = "round", !n.smoothing || t.length < 3) {
    l.beginPath(), l.lineWidth = n.strokeWidth, l.moveTo(t[0].x, t[0].y);
    for (let s = 1; s < t.length; s++)
      l.lineTo(t[s].x, t[s].y);
    l.stroke();
    return;
  }
  l.beginPath(), l.moveTo(t[0].x, t[0].y);
  for (let s = 1; s < t.length - 1; s++) {
    const i = t[s], h = t[s + 1];
    n.pressure.enabled ? l.lineWidth = pt(t[s - 1], i, n) : l.lineWidth = n.strokeWidth;
    const c = gt(i, t[s - 1], h);
    l.quadraticCurveTo(c.x, c.y, i.x, i.y);
  }
  const a = t[t.length - 1];
  l.lineTo(a.x, a.y), l.stroke();
}
function ft(l) {
  const { canvasSize: t, paths: n } = l;
  let a = `<svg width="${t.width}" height="${t.height}" xmlns="http://www.w3.org/2000/svg">`;
  return n.forEach((s) => {
    if (s.points.length < 2)
      return;
    let i = `M ${s.points[0].x} ${s.points[0].y}`;
    for (let h = 1; h < s.points.length; h++)
      i += ` L ${s.points[h].x} ${s.points[h].y}`;
    a += `<path d="${i}" stroke="${s.strokeColor}" stroke-width="${s.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), a += "</svg>", a;
}
function yt(l, t, n = { format: "png" }) {
  const { format: a, quality: s = 0.9, size: i, backgroundColor: h } = n;
  if (a === "svg")
    return ft(t);
  const c = document.createElement("canvas"), r = c.getContext("2d");
  if (i) {
    c.width = i.width, c.height = i.height;
    const m = i.width / l.width, p = i.height / l.height;
    r.scale(m, p);
  } else
    c.width = l.width, c.height = l.height;
  switch (h && h !== "transparent" && (r.fillStyle = h, r.fillRect(0, 0, c.width, c.height)), r.drawImage(l, 0, 0), a) {
    case "jpeg":
      return c.toDataURL("image/jpeg", s);
    case "base64":
      return c.toDataURL("image/png").split(",")[1];
    case "png":
    default:
      return c.toDataURL("image/png");
  }
}
function vt(l, t) {
  return new Promise((n, a) => {
    const s = new Image();
    s.onload = () => {
      const i = l.getContext("2d");
      i.clearRect(0, 0, l.width, l.height), i.drawImage(s, 0, 0, l.width, l.height), n();
    }, s.onerror = a, s.src = t;
  });
}
function G(l) {
  return l.paths.length === 0 || l.paths.every((t) => t.points.length === 0);
}
function Q(l, t) {
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
class xt {
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
  setReplayData(t, n = {}) {
    console.log("设置回放数据:", t), console.log("回放选项:", n), this.replayData = t, this.options = { ...n }, this.speed = n.speed || t.speed || 1, this.currentTime = n.startTime || 0, this.state = "idle", this.resetOptimizationState(), console.log("回放数据设置完成，路径数量:", t.paths.length), console.log("总时长:", t.totalDuration);
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
   * 渲染指定时间的帧 - 高性能优化版本
   */
  renderFrame(t) {
    if (!this.replayData || !this.offscreenCanvas || !this.offscreenCtx)
      return;
    const n = performance.now();
    if (!(n - this.renderThrottle < 16) && (this.renderThrottle = n, !this.isRendering)) {
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
    const n = this.offscreenCanvas, a = this.offscreenCtx;
    a.globalCompositeOperation = "copy", a.fillStyle = "transparent", a.fillRect(0, 0, n.width, n.height), a.globalCompositeOperation = "source-over";
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
  getPointsUpToTime(t, n, a) {
    const s = [];
    for (let i = 0; i < t.length; i++) {
      const h = t[i], c = n + (h.relativeTime || i * 50);
      if (c <= a)
        s.push(h);
      else {
        if (i > 0) {
          const r = t[i - 1], m = n + (r.relativeTime || (i - 1) * 50);
          if (m <= a) {
            const p = (a - m) / (c - m), v = {
              x: r.x + (h.x - r.x) * p,
              y: r.y + (h.y - r.y) * p,
              time: a,
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
  calculateDynamicStrokeWidth(t, n, a, s) {
    switch (a) {
      case "pen":
        return 1;
      case "brush":
        if (n) {
          const g = Math.sqrt(Math.pow(t.x - n.x, 2) + Math.pow(t.y - n.y, 2)), x = Math.max(1, (t.time || 0) - (n.time || 0)), C = g / x, _ = Math.max(0.1, Math.min(3, 100 / Math.max(C, 1))), F = t.pressure || 0.5, k = Math.floor(t.x * 1e3 + t.y * 1e3 + (t.time || 0)), D = 0.8 + this.seededRandom(k) * 0.4;
          return Math.max(1, Math.min(20, s * _ * (0.3 + F * 1.4) * D));
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
        if (n) {
          const g = Math.sqrt(Math.pow(t.x - n.x, 2) + Math.pow(t.y - n.y, 2)), x = Math.max(1, (t.time || 0) - (n.time || 0)), C = g / x;
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
  drawStyledStrokeForReplay(t, n, a, s) {
    if (!(t.length < 2))
      switch (this.ctx.strokeStyle = a, n) {
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
            const h = t[i], c = t[i - 1], r = this.calculateDynamicStrokeWidth(h, c, n, s);
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
            const h = t[i], c = t[i - 1], r = this.calculateDynamicStrokeWidth(h, c, n, s);
            this.ctx.lineWidth = r, this.ctx.globalAlpha = 0.8, this.ctx.beginPath(), this.ctx.moveTo(c.x, c.y), this.ctx.lineTo(h.x, h.y), this.ctx.stroke();
            for (let p = 0; p < 3; p++) {
              const v = Math.floor(h.x * 10 + h.y * 10 + i * 10 + p);
              if (this.seededRandom(v) > 0.5) {
                this.ctx.globalAlpha = 0.2, this.ctx.lineWidth = r * 0.3;
                const g = (this.seededRandom(v + 1) - 0.5) * 2, x = (this.seededRandom(v + 2) - 0.5) * 2;
                this.ctx.beginPath(), this.ctx.moveTo(c.x + g, c.y + x), this.ctx.lineTo(h.x + g, h.y + x), this.ctx.stroke();
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
            const h = t[i], c = t[i - 1], r = this.calculateDynamicStrokeWidth(h, c, n, s), m = Math.floor(h.x * 50 + h.y * 50 + i);
            if (this.seededRandom(m) > 0.1) {
              if (this.ctx.lineWidth = r, this.ctx.globalAlpha = this.seededRandom(m + 1) > 0.2 ? 1 : 0.7, this.ctx.beginPath(), i < t.length - 1) {
                const p = t[i + 1], v = this.getControlPoint(h, c, p);
                this.ctx.moveTo(c.x, c.y), this.ctx.quadraticCurveTo(v.x, v.y, h.x, h.y);
              } else
                this.ctx.moveTo(c.x, c.y), this.ctx.lineTo(h.x, h.y);
              this.ctx.stroke();
            }
          }
          this.ctx.globalAlpha = 1;
          break;
        case "elegant":
          this.drawElegantStroke(t, a, s);
          break;
      }
  }
  /**
   * 绘制优雅笔迹 - 基于Fabric.js和Vue3-Signature-Pad的速度压力感应技术
   */
  drawElegantStroke(t, n, a) {
    if (t.length < 2)
      return;
    this.ctx.strokeStyle = n, this.ctx.fillStyle = n, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", this.ctx.globalCompositeOperation = "source-over";
    const s = this.preprocessPointsForVelocity(t, a);
    this.drawVelocityBasedPath(s), this.addVelocityBasedConnections(s);
  }
  /**
   * 预处理点数据，计算速度和动态线宽 - 基于Vue3-Signature-Pad算法
   */
  preprocessPointsForVelocity(t, n) {
    const a = [];
    for (let s = 0; s < t.length; s++) {
      const i = t[s];
      let h = 0, c = n;
      if (s > 0) {
        const m = t[s - 1], p = Math.sqrt(
          Math.pow(i.x - m.x, 2) + Math.pow(i.y - m.y, 2)
        ), v = Math.max(1, (i.time || 0) - (m.time || 0));
        h = p / v;
        const g = i.pressure || 0.5, x = Math.max(0.2, Math.min(3, 100 / Math.max(h, 1)));
        c = n * (0.3 + g * x * 1.4);
      }
      let r = c;
      if (s > 0) {
        const m = a[s - 1].smoothedWidth;
        r = m + (c - m) * 0.3;
      }
      a.push({
        ...i,
        velocity: h,
        dynamicWidth: c,
        smoothedWidth: Math.max(0.5, Math.min(n * 3, r))
      });
    }
    return a;
  }
  /**
   * 基于速度的路径绘制 - 使用Fabric.js的平滑算法
   */
  drawVelocityBasedPath(t) {
    if (!(t.length < 2))
      for (let n = 1; n < t.length; n++) {
        const a = t[n], s = t[n - 1];
        this.drawVelocitySegment(s, a, s.smoothedWidth, a.smoothedWidth);
      }
  }
  /**
   * 绘制基于速度的单个线段 - 实现由粗到细的渐变
   */
  drawVelocitySegment(t, n, a, s) {
    const i = Math.sqrt(
      Math.pow(n.x - t.x, 2) + Math.pow(n.y - t.y, 2)
    ), h = Math.max(2, Math.min(10, Math.floor(i / 3)));
    this.ctx.beginPath();
    const c = [];
    for (let r = 0; r <= h; r++) {
      const m = r / h, p = this.smoothStep(m), v = t.x + (n.x - t.x) * p, g = t.y + (n.y - t.y) * p, x = a + (s - a) * p, C = n.x - t.x, _ = n.y - t.y, F = Math.sqrt(C * C + _ * _);
      if (F > 0) {
        const k = -_ / F * x / 2, D = C / F * x / 2;
        r === 0 ? this.ctx.moveTo(v + k, g + D) : this.ctx.lineTo(v + k, g + D), c.push({ x: v - k, y: g - D });
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
    for (let n = 1; n < t.length - 1; n++) {
      const a = t[n - 1], s = t[n], i = t[n + 1], h = Math.abs(s.velocity - a.velocity), c = (s.velocity + a.velocity) / 2, r = Math.atan2(s.y - a.y, s.x - a.x), m = Math.atan2(i.y - s.y, i.x - s.x);
      let p = Math.abs(m - r);
      if (p > Math.PI && (p = 2 * Math.PI - p), h > c * 0.3 || p > 0.15) {
        const g = s.smoothedWidth * 0.6, x = this.ctx.createRadialGradient(
          s.x,
          s.y,
          0,
          s.x,
          s.y,
          g
        );
        x.addColorStop(0, this.ctx.fillStyle), x.addColorStop(1, "transparent");
        const C = this.ctx.fillStyle;
        this.ctx.fillStyle = x, this.ctx.beginPath(), this.ctx.arc(s.x, s.y, g, 0, Math.PI * 2), this.ctx.fill(), this.ctx.fillStyle = C;
      }
      if (p > 0.05) {
        const g = s.smoothedWidth * 0.2;
        this.ctx.beginPath(), this.ctx.arc(s.x, s.y, g, 0, Math.PI * 2), this.ctx.fill();
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
  getControlPoint(t, n, a) {
    const i = {
      length: Math.sqrt(Math.pow(a.x - n.x, 2) + Math.pow(a.y - n.y, 2)),
      angle: Math.atan2(a.y - n.y, a.x - n.x)
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
  on(t, n) {
    this.eventCallbacks.has(t) || this.eventCallbacks.set(t, []), this.eventCallbacks.get(t).push(n);
  }
  /**
   * 移除事件监听器
   */
  off(t, n) {
    if (this.eventCallbacks.has(t))
      if (n) {
        const a = this.eventCallbacks.get(t), s = a.indexOf(n);
        s > -1 && a.splice(s, 1);
      } else
        this.eventCallbacks.delete(t);
  }
  /**
   * 触发事件
   */
  emit(t, ...n) {
    const a = this.eventCallbacks.get(t);
    a && a.forEach((s) => s(...n));
  }
  /**
   * 在离屏画布上绘制完整路径
   */
  drawCompletePathToOffscreen(t) {
    if (!this.offscreenCtx || t.points.length < 2)
      return;
    const n = this.ctx;
    this.ctx = this.offscreenCtx;
    const a = t.penStyle || this.options.penStyle || "pen";
    this.drawStyledStrokeForReplay(t.points, a, t.strokeColor, t.strokeWidth), this.ctx = n;
  }
  /**
   * 在离屏画布上绘制部分路径
   */
  drawPartialPathToOffscreen(t, n) {
    if (!this.offscreenCtx || t.points.length < 2)
      return;
    const a = t.startTime || 0, s = t.duration || 0, i = a + s * n, h = this.getPointsUpToTime(t.points, a, i);
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
function Ct(l) {
  const t = l.paths.map((r) => {
    const m = r.points.map((v, g) => {
      var C;
      let x;
      if (v.time && r.points[0].time)
        x = v.time - r.points[0].time;
      else if (g === 0)
        x = 0;
      else {
        const _ = r.points[g - 1], k = Math.sqrt(
          Math.pow(v.x - _.x, 2) + Math.pow(v.y - _.y, 2)
        ) / 100 * 1e3;
        x = (((C = m[g - 1]) == null ? void 0 : C.relativeTime) || 0) + Math.max(k, 16);
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
  }), n = [];
  for (let r = 0; r < t.length; r++) {
    const m = t[r];
    let p;
    if (r === 0)
      p = 0;
    else {
      const x = n[r - 1], C = wt(
        l.paths[r - 1].points,
        l.paths[r].points
      );
      p = x.endTime + C;
    }
    const v = p + m.duration, g = {
      ...m,
      startTime: p,
      endTime: v
    };
    console.log(`路径 ${r}: 开始时间=${p}, 结束时间=${v}, 持续时间=${m.duration}`), n.push(g);
  }
  const a = n.length > 0 ? n[n.length - 1].endTime : 0;
  console.log("回放数据生成完成:"), console.log("- 路径数量:", n.length), console.log("- 总时长:", a), console.log("- 路径详情:", n.map((r) => ({
    startTime: r.startTime,
    endTime: r.endTime,
    duration: r.duration,
    pointCount: r.points.length
  })));
  const s = n.reduce((r, m) => r + bt(m.points), 0), i = a > 0 ? s / (a / 1e3) : 0, h = n.slice(1).map((r, m) => {
    const p = n[m];
    return r.startTime - p.endTime;
  }), c = h.length > 0 ? h.reduce((r, m) => r + m, 0) / h.length : 0;
  return {
    paths: n,
    totalDuration: a,
    speed: 1,
    metadata: {
      deviceType: Mt(l),
      averageSpeed: i,
      totalDistance: s,
      averagePauseTime: c
    }
  };
}
function wt(l, t) {
  if (l.length === 0 || t.length === 0)
    return 200;
  const n = l[l.length - 1], a = t[0];
  if (n.time && a.time)
    return Math.max(a.time - n.time, 50);
  const s = Math.sqrt(
    Math.pow(a.x - n.x, 2) + Math.pow(a.y - n.y, 2)
  );
  return Math.min(Math.max(s * 2, 100), 1e3);
}
function Mt(l) {
  const t = l.paths.reduce((i, h) => i + h.points.length, 0), n = l.paths.length;
  if (t === 0)
    return "touch";
  const a = t / n;
  return a > 20 ? "touch" : a < 10 ? "mouse" : l.paths.some(
    (i) => i.points.some((h) => h.pressure !== void 0)
  ) ? "pen" : "touch";
}
function bt(l) {
  let t = 0;
  for (let n = 1; n < l.length; n++) {
    const a = l[n].x - l[n - 1].x, s = l[n].y - l[n - 1].y;
    t += Math.sqrt(a * a + s * s);
  }
  return t;
}
const Fe = {
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
function Tt(l) {
  return Fe[l];
}
function Gt() {
  return Object.entries(Fe).map(([l, t]) => ({
    key: l,
    config: t
  }));
}
function kt(l, t) {
  const n = Tt(l);
  return {
    strokeWidth: n.strokeWidth,
    smoothing: n.smoothing,
    pressure: n.pressure,
    lineCap: n.lineCap,
    lineJoin: n.lineJoin,
    strokeColor: t || n.recommendedColor || "#000000"
  };
}
const St = ["width", "height"], Pt = {
  key: 1,
  class: "signature-toolbar"
}, Dt = ["disabled"], Wt = ["disabled"], Rt = ["disabled"], It = {
  key: 2,
  class: "replay-controls"
}, Et = { class: "replay-buttons" }, Ot = ["disabled"], _t = { key: 0 }, Ft = { key: 1 }, At = ["disabled"], Jt = { class: "replay-progress" }, qt = ["max", "value", "disabled"], Bt = { class: "time-display" }, $t = { class: "replay-speed" }, zt = 16, Vt = /* @__PURE__ */ ct({
  __name: "ElectronicSignature",
  props: {
    showToolbar: { type: Boolean, default: !1 },
    width: { default: "100%" },
    height: { default: 300 },
    penStyle: { default: "ballpoint" },
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
  setup(l, { expose: t, emit: n }) {
    const a = l, s = n, i = E(), h = E(!1), c = E(null), r = E(Q(0, 0)), m = E([]), p = E(-1), v = E(0), g = E(null), x = E(!1), C = E("idle"), _ = E(0), F = E(0), k = O(() => typeof a.width == "number" ? a.width : 800), D = O(() => typeof a.height == "number" ? a.height : 300), Je = O(() => ({
      position: "relative",
      display: "inline-block",
      width: typeof a.width == "string" ? a.width : `${a.width}px`,
      height: typeof a.height == "string" ? a.height : `${a.height}px`
    })), qe = O(() => ({
      border: a.borderStyle,
      borderRadius: a.borderRadius,
      backgroundColor: a.backgroundColor,
      cursor: a.disabled ? "not-allowed" : "crosshair",
      display: "block",
      width: "100%",
      height: "100%"
    })), Be = O(() => ({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "#999",
      fontSize: "14px",
      pointerEvents: "none",
      userSelect: "none"
    })), $e = O(() => x.value ? !1 : a.placeholder && G(r.value)), he = O(() => p.value > 0), ce = O(() => p.value < m.value.length - 1), ue = O(() => x.value && g.value), A = O(() => !ue.value && !a.disabled), ze = O(() => {
      var e;
      return ue.value && ((e = a.replayOptions) == null ? void 0 : e.showControls) !== !1;
    }), I = O(() => {
      if (a.penStyle) {
        const e = kt(a.penStyle, a.strokeColor);
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
    }), L = () => {
      var e;
      return ((e = i.value) == null ? void 0 : e.getContext("2d")) || null;
    }, U = (e, o) => {
      const d = i.value, f = d.getBoundingClientRect(), u = d.width / f.width, y = d.height / f.height;
      return {
        x: (e - f.left) * u,
        y: (o - f.top) * y,
        time: Date.now()
      };
    }, de = (e) => {
      if (!A.value)
        return;
      h.value = !0;
      const o = performance.now(), d = { ...e, time: o };
      c.value = {
        points: [d],
        strokeColor: a.strokeColor,
        strokeWidth: a.strokeWidth,
        penStyle: a.penStyle,
        // 保存笔迹样式
        startTime: o,
        endTime: o,
        duration: 0
      }, s("signature-start");
    }, K = (e, o, d, f) => {
      switch (d) {
        case "pen":
          return 1;
        case "brush":
          if (o) {
            const S = Math.sqrt(Math.pow(e.x - o.x, 2) + Math.pow(e.y - o.y, 2)), J = Math.max(1, (e.time || 0) - (o.time || 0)), W = S / J, q = Math.max(0.1, Math.min(3, 100 / Math.max(W, 1))), $ = e.pressure || 0.5, X = 0.8 + Math.random() * 0.4;
            return Math.max(1, Math.min(20, f * q * (0.3 + $ * 1.4) * X));
          }
          return f;
        case "marker":
          return 12;
        case "pencil":
          const u = e.pressure || 0.5, y = 0.9 + Math.random() * 0.2;
          return f * (0.7 + u * 0.6) * y;
        case "ballpoint":
          const w = e.pressure || 0.5;
          return f * (0.8 + w * 0.4);
        case "elegant":
          const b = e.pressure || 0.5;
          let M = 1;
          if (o) {
            const S = Math.sqrt(Math.pow(e.x - o.x, 2) + Math.pow(e.y - o.y, 2)), J = Math.max(1, (e.time || 0) - (o.time || 0)), W = S / J;
            M = Math.max(0.3, Math.min(2, 50 / Math.max(W, 1)));
          }
          const R = b * M;
          return f * (0.4 + R * 1.6);
        default:
          return f;
      }
    }, H = (e, o, d) => {
      var f;
      if (!(o.length < 2))
        switch (e.strokeStyle = ((f = c.value) == null ? void 0 : f.strokeColor) || I.value.strokeColor, e.lineCap = I.value.lineCap || "round", e.lineJoin = I.value.lineJoin || "round", d) {
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
              const y = o[u], w = o[u - 1], b = K(y, w, d, I.value.strokeWidth), M = e.createLinearGradient(w.x, w.y, y.x, y.y);
              M.addColorStop(0, e.strokeStyle), M.addColorStop(1, e.strokeStyle), e.lineWidth = b, e.beginPath(), e.moveTo(w.x, w.y), e.lineTo(y.x, y.y), e.stroke(), b > 8 && Math.random() > 0.6 && (e.globalAlpha = 0.2, e.beginPath(), e.arc(y.x, y.y, b * 0.3, 0, Math.PI * 2), e.fill(), e.globalAlpha = 1);
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
              const y = o[u], w = o[u - 1], b = K(y, w, d, I.value.strokeWidth);
              e.lineWidth = b, e.globalAlpha = 0.8, e.beginPath(), e.moveTo(w.x, w.y), e.lineTo(y.x, y.y), e.stroke();
              for (let M = 0; M < 3; M++)
                if (Math.random() > 0.5) {
                  e.globalAlpha = 0.2, e.lineWidth = b * 0.3;
                  const R = (Math.random() - 0.5) * 2, S = (Math.random() - 0.5) * 2;
                  e.beginPath(), e.moveTo(w.x + R, w.y + S), e.lineTo(y.x + R, y.y + S), e.stroke();
                }
              if (Math.random() > 0.8) {
                e.globalAlpha = 0.4;
                for (let M = 0; M < 5; M++)
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
              const y = o[u], w = o[u - 1], b = K(y, w, d, I.value.strokeWidth);
              if (Math.random() > 0.1) {
                if (e.lineWidth = b, e.globalAlpha = Math.random() > 0.2 ? 1 : 0.7, e.beginPath(), I.value.smoothing && u < o.length - 1) {
                  const M = o[u + 1], R = me(y, w, M);
                  e.moveTo(w.x, w.y), e.quadraticCurveTo(R.x, R.y, y.x, y.y);
                } else
                  e.moveTo(w.x, w.y), e.lineTo(y.x, y.y);
                e.stroke();
              }
            }
            e.globalAlpha = 1;
            break;
          case "elegant":
            Le(e, o);
            break;
        }
    }, Ve = () => {
      if (!c.value || c.value.points.length < 2)
        return;
      const e = L();
      if (!e)
        return;
      if ((c.value.penStyle || a.penStyle || "pen") === "brush") {
        Ye();
        return;
      }
      e.clearRect(0, 0, k.value, D.value);
      for (const d of r.value.paths)
        d !== c.value && Z(e, d);
      c.value.points.length >= 2 && Z(e, c.value);
    }, Ye = () => {
      if (!c.value || c.value.points.length < 2)
        return;
      const e = L();
      if (!e)
        return;
      const o = c.value.points;
      if (o.length >= 2) {
        const f = o.slice(-3);
        f.length >= 2 && H(e, f, "brush");
      }
    }, Xe = () => {
      if (!c.value || c.value.points.length < 2)
        return;
      const e = L();
      if (!e)
        return;
      const o = c.value.points, d = o.length, f = a.penStyle || "pen";
      if (d === 2)
        H(e, o, f);
      else if (d >= 3) {
        const u = o.slice(-3);
        H(e, u, f);
      }
    }, Le = (e, o) => {
      var f, u;
      if (o.length < 2)
        return;
      e.strokeStyle = ((f = c.value) == null ? void 0 : f.strokeColor) || I.value.strokeColor, e.fillStyle = ((u = c.value) == null ? void 0 : u.strokeColor) || I.value.strokeColor, e.lineCap = "round", e.lineJoin = "round", e.globalCompositeOperation = "source-over";
      const d = Ue(o, I.value.strokeWidth);
      He(e, d), je(e, d);
    }, Ue = (e, o) => {
      const d = [];
      for (let f = 0; f < e.length; f++) {
        const u = e[f];
        let y = 0, w = o;
        if (f > 0) {
          const M = e[f - 1], R = Math.sqrt(
            Math.pow(u.x - M.x, 2) + Math.pow(u.y - M.y, 2)
          ), S = Math.max(1, (u.time || 0) - (M.time || 0));
          y = R / S;
          const J = u.pressure || 0.5, W = Math.max(0.2, Math.min(3, 100 / Math.max(y, 1)));
          w = o * (0.3 + J * W * 1.4);
        }
        let b = w;
        if (f > 0) {
          const M = d[f - 1].smoothedWidth;
          b = M + (w - M) * 0.3;
        }
        d.push({
          ...u,
          velocity: y,
          dynamicWidth: w,
          smoothedWidth: Math.max(0.5, Math.min(o * 3, b))
        });
      }
      return d;
    }, He = (e, o) => {
      if (!(o.length < 2))
        for (let d = 1; d < o.length; d++) {
          const f = o[d], u = o[d - 1];
          Ne(e, u, f, u.smoothedWidth, f.smoothedWidth);
        }
    }, Ne = (e, o, d, f, u) => {
      const y = Math.sqrt(
        Math.pow(d.x - o.x, 2) + Math.pow(d.y - o.y, 2)
      ), w = Math.max(2, Math.min(10, Math.floor(y / 3)));
      e.beginPath();
      const b = [];
      for (let M = 0; M <= w; M++) {
        const R = M / w, S = Ge(R), J = o.x + (d.x - o.x) * S, W = o.y + (d.y - o.y) * S, q = f + (u - f) * S, $ = d.x - o.x, X = d.y - o.y, te = Math.sqrt($ * $ + X * X);
        if (te > 0) {
          const ne = -X / te * q / 2, ae = $ / te * q / 2;
          M === 0 ? e.moveTo(J + ne, W + ae) : e.lineTo(J + ne, W + ae), b.push({ x: J - ne, y: W - ae });
        }
      }
      for (let M = b.length - 1; M >= 0; M--)
        e.lineTo(b[M].x, b[M].y);
      e.closePath(), e.fill();
    }, je = (e, o) => {
      for (let d = 1; d < o.length - 1; d++) {
        const f = o[d - 1], u = o[d], y = o[d + 1], w = Math.abs(u.velocity - f.velocity), b = (u.velocity + f.velocity) / 2, M = Math.atan2(u.y - f.y, u.x - f.x), R = Math.atan2(y.y - u.y, y.x - u.x);
        let S = Math.abs(R - M);
        if (S > Math.PI && (S = 2 * Math.PI - S), w > b * 0.3 || S > 0.15) {
          const W = u.smoothedWidth * 0.6, q = e.createRadialGradient(
            u.x,
            u.y,
            0,
            u.x,
            u.y,
            W
          );
          q.addColorStop(0, e.fillStyle), q.addColorStop(1, "transparent");
          const $ = e.fillStyle;
          e.fillStyle = q, e.beginPath(), e.arc(u.x, u.y, W, 0, Math.PI * 2), e.fill(), e.fillStyle = $;
        }
        if (S > 0.05) {
          const W = u.smoothedWidth * 0.2;
          e.beginPath(), e.arc(u.x, u.y, W, 0, Math.PI * 2), e.fill();
        }
      }
    }, Ge = (e) => e * e * (3 - 2 * e), me = (e, o, d) => {
      const u = {
        length: Math.sqrt(Math.pow(d.x - o.x, 2) + Math.pow(d.y - o.y, 2)),
        angle: Math.atan2(d.y - o.y, d.x - o.x)
      }, y = u.angle + Math.PI, w = u.length * 0.2;
      return {
        x: e.x + Math.cos(y) * w,
        y: e.y + Math.sin(y) * w,
        time: e.time || 0
      };
    }, Z = (e, o) => {
      if (o.points.length < 2)
        return;
      const d = o.penStyle || a.penStyle || "pen", f = c.value;
      c.value = o, H(e, o.points, d), c.value = f;
    }, ge = (e) => {
      if (!h.value || !c.value || !A.value)
        return;
      const o = performance.now();
      if (o - v.value < zt)
        return;
      v.value = o;
      const d = { ...e, time: o };
      c.value.points.push(d), c.value.startTime && (c.value.endTime = o, c.value.duration = o - c.value.startTime), a.realTimeMode ? Ve() : Xe(), ve(), s("signature-drawing", r.value);
    }, pe = () => {
      if (!(!h.value || !c.value)) {
        if (h.value = !1, c.value.points.length > 0) {
          const e = c.value.points[c.value.points.length - 1];
          e.time && c.value.startTime && (c.value.endTime = e.time, c.value.duration = e.time - c.value.startTime);
        }
        r.value.paths.push(c.value), r.value.isEmpty = !1, r.value.timestamp = Date.now(), N(), B(), c.value = null, s("signature-end", r.value);
      }
    }, Qe = (e) => {
      e.preventDefault();
      const o = U(e.clientX, e.clientY);
      de(o);
    }, Ke = (e) => {
      if (e.preventDefault(), !h.value)
        return;
      const o = U(e.clientX, e.clientY);
      ge(o);
    }, fe = (e) => {
      e.preventDefault(), pe();
    }, Ze = (e) => {
      if (e.preventDefault(), e.touches.length !== 1)
        return;
      const o = e.touches[0], d = U(o.clientX, o.clientY);
      de(d);
    }, et = (e) => {
      if (e.preventDefault(), e.touches.length !== 1 || !h.value)
        return;
      const o = e.touches[0], d = U(o.clientX, o.clientY);
      ge(d);
    }, ye = (e) => {
      e.preventDefault(), pe();
    }, ve = () => {
      r.value.canvasSize = {
        width: k.value,
        height: D.value
      }, r.value.isEmpty = G(r.value);
    }, N = () => {
      m.value = m.value.slice(0, p.value + 1), m.value.push(Y(r.value)), p.value = m.value.length - 1;
      const e = 50;
      m.value.length > e && (m.value = m.value.slice(-e), p.value = m.value.length - 1);
    }, B = () => {
      const e = L();
      e && (e.clearRect(0, 0, k.value, D.value), a.backgroundColor && a.backgroundColor !== "transparent" && (e.fillStyle = a.backgroundColor, e.fillRect(0, 0, k.value, D.value)), r.value.paths.forEach((o) => {
        o.points.length > 0 && Z(e, o);
      }));
    }, j = () => {
      if (console.log("初始化回放控制器"), console.log("canvas引用是否存在:", !!i.value), !i.value) {
        console.error("canvas引用不存在，无法初始化回放控制器");
        return;
      }
      g.value && (console.log("销毁现有回放控制器"), g.value.destroy()), console.log("创建新的回放控制器"), g.value = new xt(i.value), console.log("回放控制器创建成功:", !!g.value), g.value.on("replay-start", () => {
        C.value = "playing", s("replay-start");
      }), g.value.on("replay-progress", (e, o) => {
        _.value = e, F.value = o, s("replay-progress", e, o);
      }), g.value.on("replay-pause", () => {
        C.value = "paused", s("replay-pause");
      }), g.value.on("replay-resume", () => {
        C.value = "playing", s("replay-resume");
      }), g.value.on("replay-stop", () => {
        C.value = "stopped", s("replay-stop");
      }), g.value.on("replay-complete", () => {
        C.value = "completed", s("replay-complete");
      }), g.value.on("replay-path-start", (e, o) => {
        s("replay-path-start", e, o);
      }), g.value.on("replay-path-end", (e, o) => {
        s("replay-path-end", e, o);
      }), g.value.on("replay-speed-change", (e) => {
        s("replay-speed-change", e);
      });
    }, xe = (e, o) => {
      if (g.value || j(), g.value) {
        x.value = !0;
        const d = {
          ...o,
          drawOptions: I.value,
          penStyle: a.penStyle
        };
        g.value.setReplayData(e, d), console.log("startReplay调用，自动播放:", o == null ? void 0 : o.autoPlay), (o == null ? void 0 : o.autoPlay) === !0 && g.value.play();
      }
    }, Ce = (e) => {
      x.value = e, !e && g.value && (g.value.stop(), B());
    }, tt = () => G(r.value) ? null : Ct(r.value), we = () => {
      console.log("play方法被调用"), console.log("回放控制器是否存在:", !!g.value), g.value || (console.log("回放控制器不存在，尝试初始化"), j()), g.value ? (console.log("调用回放控制器的play方法"), g.value.play()) : console.error("回放控制器初始化失败，无法播放");
    }, Me = () => {
      var e;
      (e = g.value) == null || e.pause();
    }, be = () => {
      var e;
      (e = g.value) == null || e.stop();
    }, Te = (e) => {
      var o;
      (o = g.value) == null || o.seek(e);
    }, ke = (e) => {
      var o;
      (o = g.value) == null || o.setSpeed(e);
    }, nt = () => {
      var e;
      return ((e = g.value) == null ? void 0 : e.getState()) || "idle";
    }, at = () => {
      var e;
      return ((e = g.value) == null ? void 0 : e.getCurrentTime()) || 0;
    }, ee = () => {
      var e;
      return ((e = g.value) == null ? void 0 : e.getTotalDuration()) || 0;
    }, ot = () => {
      var e;
      return ((e = g.value) == null ? void 0 : e.getProgress()) || 0;
    }, Se = (e) => {
      const o = Math.floor(e / 1e3), d = Math.floor(o / 60), f = o % 60;
      return `${d}:${f.toString().padStart(2, "0")}`;
    }, Pe = () => {
      A.value && (r.value = Q(k.value, D.value), B(), N(), s("signature-clear"));
    }, De = () => {
      !he.value || !A.value || (p.value--, r.value = Y(m.value[p.value]), B(), s("signature-undo", r.value));
    }, We = () => {
      !ce.value || !A.value || (p.value++, r.value = Y(m.value[p.value]), B(), s("signature-redo", r.value));
    }, Re = (e) => {
      const o = i.value;
      return yt(o, r.value, e);
    }, Ie = () => G(r.value), Ee = async (e) => {
      if (!A.value)
        return;
      const o = i.value;
      await vt(o, e), r.value = Q(k.value, D.value), r.value.isEmpty = !1, N();
    }, st = () => Y(r.value), it = (e) => {
      A.value && (r.value = Y(e), B(), N());
    }, Oe = (e, o) => {
      const d = e || k.value, f = o || D.value, u = Re({ format: "png" });
      se(() => {
        const y = i.value;
        y.width = d, y.height = f, Ie() || Ee(u), ve();
      });
    }, lt = () => {
      const e = i.value;
      e.width = k.value, e.height = D.value, r.value = Q(k.value, D.value), m.value = [Y(r.value)], p.value = 0, B();
    };
    return oe([() => a.width, () => a.height], () => {
      se(() => {
        i.value && Oe();
      });
    }), oe(() => a.replayMode, (e) => {
      e !== void 0 && Ce(e);
    }), oe(() => a.replayData, (e) => {
      if (console.log("watch监听到回放数据变化:", e), console.log("当前回放模式:", a.replayMode), console.log("回放控制器是否存在:", !!g.value), e && a.replayMode)
        if (g.value || (console.log("回放控制器未初始化，先初始化"), j()), g.value) {
          console.log("开始设置回放数据到控制器");
          const o = {
            ...a.replayOptions,
            drawOptions: I.value,
            penStyle: a.penStyle
          };
          g.value.setReplayData(e, o), console.log("回放数据已更新:", e);
        } else
          console.error("回放控制器初始化失败");
      else
        e || console.log("回放数据为空，跳过设置"), a.replayMode || console.log("不在回放模式，跳过设置");
    }, { immediate: !0 }), ut(() => {
      se(() => {
        lt(), j(), a.replayMode && a.replayData && xe(a.replayData, a.replayOptions);
      });
    }), dt(() => {
      g.value && (g.value.destroy(), g.value = null);
    }), t({
      clear: Pe,
      undo: De,
      redo: We,
      save: Re,
      isEmpty: Ie,
      fromDataURL: Ee,
      getSignatureData: st,
      setSignatureData: it,
      resize: Oe,
      // 回放相关方法
      startReplay: xe,
      getReplayData: tt,
      setReplayMode: Ce,
      play: we,
      pause: Me,
      stop: be,
      seek: Te,
      setSpeed: ke,
      getState: nt,
      getCurrentTime: at,
      getTotalDuration: ee,
      getProgress: ot
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
        onMousedown: Qe,
        onMousemove: Ke,
        onMouseup: fe,
        onMouseleave: fe,
        onTouchstart: Ze,
        onTouchmove: et,
        onTouchend: ye,
        onTouchcancel: ye
      }, null, 44, St),
      $e.value ? (z(), V("div", {
        key: 0,
        class: "signature-placeholder",
        style: ie(Be.value)
      }, le(e.placeholder), 5)) : re("", !0),
      e.showToolbar ? (z(), V("div", Pt, [
        T("button", {
          onClick: Pe,
          disabled: !A.value
        }, "清除", 8, Dt),
        T("button", {
          onClick: De,
          disabled: !A.value || !he.value
        }, "撤销", 8, Wt),
        T("button", {
          onClick: We,
          disabled: !A.value || !ce.value
        }, "重做", 8, Rt)
      ])) : re("", !0),
      ze.value ? (z(), V("div", It, [
        T("div", Et, [
          T("button", {
            onClick: o[0] || (o[0] = (d) => C.value === "playing" ? Me() : we()),
            disabled: C.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            C.value === "playing" ? (z(), V("span", _t, "⏸️")) : (z(), V("span", Ft, "▶️"))
          ], 8, Ot),
          T("button", {
            onClick: o[1] || (o[1] = (d) => be()),
            disabled: C.value === "idle",
            class: "replay-btn stop-btn"
          }, " ⏹️ ", 8, At)
        ]),
        T("div", Jt, [
          T("input", {
            type: "range",
            min: "0",
            max: ee(),
            value: F.value,
            onInput: o[2] || (o[2] = (d) => Te(Number(d.target.value))),
            class: "progress-slider",
            disabled: C.value === "idle"
          }, null, 40, qt),
          T("div", Bt, [
            T("span", null, le(Se(F.value)), 1),
            o[4] || (o[4] = T("span", null, "/", -1)),
            T("span", null, le(Se(ee())), 1)
          ])
        ]),
        T("div", $t, [
          o[6] || (o[6] = T("label", null, "速度:", -1)),
          T("select", {
            onChange: o[3] || (o[3] = (d) => ke(Number(d.target.value))),
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
const Yt = (l, t) => {
  const n = l.__vccOpts || l;
  for (const [a, s] of t)
    n[a] = s;
  return n;
}, Ae = /* @__PURE__ */ Yt(Vt, [["__scopeId", "data-v-8a5f5b1d"]]);
function Xt() {
  return window.devicePixelRatio || 1;
}
function Qt(l) {
  const t = l.getContext("2d"), n = Xt(), a = l.clientWidth, s = l.clientHeight;
  return l.width = a * n, l.height = s * n, t.scale(n, n), l.style.width = a + "px", l.style.height = s + "px", t;
}
function Lt(l) {
  if (l.paths.length === 0)
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0
    };
  let t = 1 / 0, n = 1 / 0, a = -1 / 0, s = -1 / 0;
  return l.paths.forEach((i) => {
    i.points.forEach((h) => {
      t = Math.min(t, h.x), n = Math.min(n, h.y), a = Math.max(a, h.x), s = Math.max(s, h.y);
    });
  }), {
    minX: t,
    minY: n,
    maxX: a,
    maxY: s,
    width: a - t,
    height: s - n
  };
}
function Kt(l, t, n = 10) {
  const a = Lt(t);
  if (a.width === 0 || a.height === 0) {
    const r = document.createElement("canvas");
    return r.width = 1, r.height = 1, r;
  }
  const s = document.createElement("canvas"), i = s.getContext("2d"), h = a.width + n * 2, c = a.height + n * 2;
  return s.width = h, s.height = c, i.drawImage(
    l,
    a.minX - n,
    a.minY - n,
    h,
    c,
    0,
    0,
    h,
    c
  ), s;
}
function Zt(l, t, n, a = !0) {
  const s = document.createElement("canvas"), i = s.getContext("2d");
  let h = t, c = n;
  if (a) {
    const r = l.width / l.height, m = t / n;
    r > m ? c = t / r : h = n * r;
  }
  return s.width = h, s.height = c, i.imageSmoothingEnabled = !0, i.imageSmoothingQuality = "high", i.drawImage(l, 0, 0, h, c), s;
}
function en(l, t, n = {}) {
  const {
    fontSize: a = 12,
    fontFamily: s = "Arial",
    color: i = "#999",
    opacity: h = 0.5,
    position: c = "bottom-right"
  } = n, r = document.createElement("canvas"), m = r.getContext("2d");
  r.width = l.width, r.height = l.height, m.drawImage(l, 0, 0), m.font = `${a}px ${s}`, m.fillStyle = i, m.globalAlpha = h;
  const v = m.measureText(t).width, g = a;
  let x, C;
  switch (c) {
    case "top-left":
      x = 10, C = g + 10;
      break;
    case "top-right":
      x = l.width - v - 10, C = g + 10;
      break;
    case "bottom-left":
      x = 10, C = l.height - 10;
      break;
    case "bottom-right":
      x = l.width - v - 10, C = l.height - 10;
      break;
    case "center":
      x = (l.width - v) / 2, C = (l.height + g) / 2;
      break;
    default:
      x = l.width - v - 10, C = l.height - 10;
  }
  return m.fillText(t, x, C), m.globalAlpha = 1, r;
}
function tn(l) {
  const t = document.createElement("canvas"), n = t.getContext("2d");
  t.width = l.width, t.height = l.height, n.drawImage(l, 0, 0);
  const a = n.getImageData(0, 0, l.width, l.height), s = a.data;
  for (let i = 0; i < s.length; i += 4) {
    const h = s[i] * 0.299 + s[i + 1] * 0.587 + s[i + 2] * 0.114;
    s[i] = h, s[i + 1] = h, s[i + 2] = h;
  }
  return n.putImageData(a, 0, 0), t;
}
const Ut = (l) => {
  l.component("ElectronicSignature", Ae);
}, nn = {
  install: Ut,
  ElectronicSignature: Ae
}, an = "1.0.0";
export {
  Ae as ElectronicSignature,
  Fe as PEN_STYLE_CONFIGS,
  xt as SignatureReplayController,
  en as addWatermark,
  pt as calculateStrokeWidth,
  Y as cloneSignatureData,
  tn as convertToGrayscale,
  kt as createDrawOptionsFromPenStyle,
  Q as createEmptySignatureData,
  Ct as createReplayData,
  Kt as cropSignature,
  nn as default,
  jt as drawSmoothPath,
  yt as exportSignature,
  Gt as getAllPenStyles,
  mt as getAngle,
  gt as getControlPoint,
  Xt as getDevicePixelRatio,
  _e as getDistance,
  Tt as getPenStyleConfig,
  Lt as getSignatureBounds,
  G as isSignatureEmpty,
  vt as loadImageToCanvas,
  Zt as resizeSignature,
  Qt as setupHighDPICanvas,
  ft as signatureToSVG,
  an as version
};
