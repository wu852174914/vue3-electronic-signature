var ht = Object.defineProperty;
var ct = (l, t, a) => t in l ? ht(l, t, { enumerable: !0, configurable: !0, writable: !0, value: a }) : l[t] = a;
var D = (l, t, a) => (ct(l, typeof t != "symbol" ? t + "" : t, a), a);
import { defineComponent as ut, ref as O, computed as _, watch as oe, nextTick as se, onMounted as dt, onUnmounted as mt, openBlock as z, createElementBlock as V, normalizeStyle as ie, createElementVNode as k, toDisplayString as le, createCommentVNode as re } from "vue";
function _e(l, t) {
  return Math.sqrt(
    Math.pow(t.x - l.x, 2) + Math.pow(t.y - l.y, 2)
  );
}
function gt(l, t) {
  return Math.atan2(t.y - l.y, t.x - l.x);
}
function pt(l, t, a, o) {
  const s = t || l, i = a || l, c = 0.2, h = gt(s, i) * (o ? 1 : -1), r = _e(s, i) * c;
  return {
    x: l.x + Math.cos(h) * r,
    y: l.y + Math.sin(h) * r,
    time: l.time
  };
}
function ft(l, t, a) {
  if (!a.pressure.enabled)
    return a.strokeWidth;
  const o = _e(l, t), s = t.time - l.time, i = s > 0 ? o / s : 0, c = Math.max(0.1, Math.min(1, 1 - i * 0.01)), { min: h, max: r } = a.pressure;
  return h + (r - h) * c;
}
function Gt(l, t, a) {
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
    const i = t[s], c = t[s + 1];
    a.pressure.enabled ? l.lineWidth = ft(t[s - 1], i, a) : l.lineWidth = a.strokeWidth;
    const h = pt(i, t[s - 1], c);
    l.quadraticCurveTo(h.x, h.y, i.x, i.y);
  }
  const o = t[t.length - 1];
  l.lineTo(o.x, o.y), l.stroke();
}
function yt(l) {
  const { canvasSize: t, paths: a } = l;
  let o = `<svg width="${t.width}" height="${t.height}" xmlns="http://www.w3.org/2000/svg">`;
  return a.forEach((s) => {
    if (s.points.length < 2)
      return;
    let i = `M ${s.points[0].x} ${s.points[0].y}`;
    for (let c = 1; c < s.points.length; c++)
      i += ` L ${s.points[c].x} ${s.points[c].y}`;
    o += `<path d="${i}" stroke="${s.strokeColor}" stroke-width="${s.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), o += "</svg>", o;
}
function vt(l, t, a = { format: "png" }) {
  const { format: o, quality: s = 0.9, size: i, backgroundColor: c } = a;
  if (o === "svg")
    return yt(t);
  const h = document.createElement("canvas"), r = h.getContext("2d");
  if (i) {
    h.width = i.width, h.height = i.height;
    const d = i.width / l.width, p = i.height / l.height;
    r.scale(d, p);
  } else
    h.width = l.width, h.height = l.height;
  switch (c && c !== "transparent" && (r.fillStyle = c, r.fillRect(0, 0, h.width, h.height)), r.drawImage(l, 0, 0), o) {
    case "jpeg":
      return h.toDataURL("image/jpeg", s);
    case "base64":
      return h.toDataURL("image/png").split(",")[1];
    case "png":
    default:
      return h.toDataURL("image/png");
  }
}
function xt(l, t) {
  return new Promise((a, o) => {
    const s = new Image();
    s.onload = () => {
      const i = l.getContext("2d");
      i.clearRect(0, 0, l.width, l.height), i.drawImage(s, 0, 0, l.width, l.height), a();
    }, s.onerror = o, s.src = t;
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
class Ct {
  constructor(t) {
    D(this, "canvas");
    D(this, "ctx");
    D(this, "replayData", null);
    D(this, "state", "idle");
    D(this, "currentTime", 0);
    D(this, "speed", 1);
    D(this, "animationId", null);
    D(this, "startTimestamp", 0);
    D(this, "pausedTime", 0);
    D(this, "options", {});
    // 事件回调
    D(this, "eventCallbacks", /* @__PURE__ */ new Map());
    // 性能优化相关
    D(this, "offscreenCanvas", null);
    D(this, "offscreenCtx", null);
    D(this, "lastFrameImageBitmap", null);
    D(this, "renderThrottle", 0);
    D(this, "isRendering", !1);
    // 确定性随机数生成器（解决毛笔闪烁问题）
    D(this, "seededRandom");
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
    const a = this.offscreenCanvas, o = this.offscreenCtx;
    o.globalCompositeOperation = "copy", o.fillStyle = "transparent", o.fillRect(0, 0, a.width, a.height), o.globalCompositeOperation = "source-over";
    let s = !1;
    for (let i = 0; i < this.replayData.paths.length; i++) {
      const c = this.replayData.paths[i], h = c.startTime || 0, r = c.endTime || h + (c.duration || 0);
      if (t < h)
        break;
      if (t >= r) {
        this.drawCompletePathToOffscreen(c), !s && Math.abs(t - r) < 32 && this.emit("replay-path-end", i, c);
        continue;
      }
      s = !0;
      const d = Math.max(0, Math.min(1, (t - h) / Math.max(r - h, 1)));
      d > 0 && Math.abs(t - h) < 32 && this.emit("replay-path-start", i, c), this.drawPartialPathToOffscreen(c, d);
      break;
    }
  }
  /**
   * 获取指定时间内的所有点
   */
  getPointsUpToTime(t, a, o) {
    const s = [];
    for (let i = 0; i < t.length; i++) {
      const c = t[i], h = a + (c.relativeTime || i * 50);
      if (h <= o)
        s.push(c);
      else {
        if (i > 0) {
          const r = t[i - 1], d = a + (r.relativeTime || (i - 1) * 50);
          if (d <= o) {
            const p = (o - d) / (h - d), x = {
              x: r.x + (c.x - r.x) * p,
              y: r.y + (c.y - r.y) * p,
              time: o,
              pressure: r.pressure ? r.pressure + (c.pressure || r.pressure - r.pressure) * p : c.pressure
            };
            s.push(x);
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
  calculateDynamicStrokeWidth(t, a, o, s) {
    switch (o) {
      case "pen":
        return 1;
      case "brush":
        if (a) {
          const m = Math.sqrt(Math.pow(t.x - a.x, 2) + Math.pow(t.y - a.y, 2)), C = Math.max(1, (t.time || 0) - (a.time || 0)), w = m / C, F = Math.max(0.1, Math.min(3, 100 / Math.max(w, 1))), A = t.pressure || 0.5, S = Math.floor(t.x * 1e3 + t.y * 1e3 + (t.time || 0)), W = 0.8 + this.seededRandom(S) * 0.4;
          return Math.max(1, Math.min(20, s * F * (0.3 + A * 1.4) * W));
        }
        return s;
      case "marker":
        return 12;
      case "pencil":
        const i = t.pressure || 0.5, c = Math.floor(t.x * 1e3 + t.y * 1e3 + (t.time || 0)), h = 0.9 + this.seededRandom(c + 1) * 0.2;
        return s * (0.7 + i * 0.6) * h;
      case "ballpoint":
        const r = t.pressure || 0.5;
        return s * (0.8 + r * 0.4);
      case "elegant":
        const d = t.pressure || 0.5;
        let p = 1;
        if (a) {
          const m = Math.sqrt(Math.pow(t.x - a.x, 2) + Math.pow(t.y - a.y, 2)), C = Math.max(1, (t.time || 0) - (a.time || 0)), w = m / C;
          p = Math.max(0.3, Math.min(2, 50 / Math.max(w, 1)));
        }
        const x = d * p;
        return s * (0.4 + x * 1.6);
      default:
        return s;
    }
  }
  /**
   * 根据笔迹样式绘制线段（与录制时完全一致）
   */
  drawStyledStrokeForReplay(t, a, o, s) {
    if (!(t.length < 2))
      switch (this.ctx.strokeStyle = o, a) {
        case "pen":
          if (this.ctx.lineWidth = 1, this.ctx.lineCap = "butt", this.ctx.lineJoin = "miter", this.ctx.beginPath(), this.ctx.moveTo(t[0].x, t[0].y), t.length >= 3) {
            for (let i = 1; i < t.length - 1; i++) {
              const c = this.getControlPoint(t[i], t[i - 1], t[i + 1]);
              this.ctx.quadraticCurveTo(c.x, c.y, t[i].x, t[i].y);
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
            const c = t[i], h = t[i - 1], r = this.calculateDynamicStrokeWidth(c, h, a, s);
            this.ctx.lineWidth = r, this.ctx.beginPath(), this.ctx.moveTo(h.x, h.y), this.ctx.lineTo(c.x, c.y), this.ctx.stroke();
            const d = Math.floor(c.x * 100 + c.y * 100 + i);
            r > 8 && this.seededRandom(d) > 0.6 && (this.ctx.globalAlpha = 0.2, this.ctx.beginPath(), this.ctx.arc(c.x, c.y, r * 0.3, 0, Math.PI * 2), this.ctx.fill(), this.ctx.globalAlpha = 1);
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
            const c = t[i], h = t[i - 1], r = this.calculateDynamicStrokeWidth(c, h, a, s);
            this.ctx.lineWidth = r, this.ctx.globalAlpha = 0.8, this.ctx.beginPath(), this.ctx.moveTo(h.x, h.y), this.ctx.lineTo(c.x, c.y), this.ctx.stroke();
            for (let p = 0; p < 3; p++) {
              const x = Math.floor(c.x * 10 + c.y * 10 + i * 10 + p);
              if (this.seededRandom(x) > 0.5) {
                this.ctx.globalAlpha = 0.2, this.ctx.lineWidth = r * 0.3;
                const m = (this.seededRandom(x + 1) - 0.5) * 2, C = (this.seededRandom(x + 2) - 0.5) * 2;
                this.ctx.beginPath(), this.ctx.moveTo(h.x + m, h.y + C), this.ctx.lineTo(c.x + m, c.y + C), this.ctx.stroke();
              }
            }
            const d = Math.floor(c.x * 5 + c.y * 5 + i * 5);
            if (this.seededRandom(d) > 0.8) {
              this.ctx.globalAlpha = 0.4;
              for (let p = 0; p < 5; p++) {
                const x = d + p * 10;
                this.ctx.beginPath(), this.ctx.arc(
                  c.x + (this.seededRandom(x + 1) - 0.5) * 3,
                  c.y + (this.seededRandom(x + 2) - 0.5) * 3,
                  this.seededRandom(x + 3) * 0.8,
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
            const c = t[i], h = t[i - 1], r = this.calculateDynamicStrokeWidth(c, h, a, s), d = Math.floor(c.x * 50 + c.y * 50 + i);
            if (this.seededRandom(d) > 0.1) {
              if (this.ctx.lineWidth = r, this.ctx.globalAlpha = this.seededRandom(d + 1) > 0.2 ? 1 : 0.7, this.ctx.beginPath(), i < t.length - 1) {
                const p = t[i + 1], x = this.getControlPoint(c, h, p);
                this.ctx.moveTo(h.x, h.y), this.ctx.quadraticCurveTo(x.x, x.y, c.x, c.y);
              } else
                this.ctx.moveTo(h.x, h.y), this.ctx.lineTo(c.x, c.y);
              this.ctx.stroke();
            }
          }
          this.ctx.globalAlpha = 1;
          break;
        case "elegant":
          this.drawElegantStroke(t, o, s);
          break;
      }
  }
  /**
   * 绘制优雅笔迹 - 基于Fabric.js和Vue3-Signature-Pad的速度压力感应技术
   */
  drawElegantStroke(t, a, o) {
    if (t.length < 2)
      return;
    this.ctx.strokeStyle = a, this.ctx.fillStyle = a, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", this.ctx.globalCompositeOperation = "source-over";
    const s = this.preprocessPointsForVelocity(t, o);
    this.drawVelocityBasedPath(s), this.addVelocityBasedConnections(s);
  }
  /**
   * 预处理点数据，计算速度和动态线宽 - 基于Vue3-Signature-Pad算法
   */
  preprocessPointsForVelocity(t, a) {
    const o = [];
    for (let s = 0; s < t.length; s++) {
      const i = t[s];
      let c = 0, h = a;
      if (s > 0) {
        const d = t[s - 1], p = Math.sqrt(
          Math.pow(i.x - d.x, 2) + Math.pow(i.y - d.y, 2)
        ), x = Math.max(1, (i.time || 0) - (d.time || 0));
        c = p / x;
        const m = i.pressure || 0.5, C = Math.max(0.2, Math.min(3, 100 / Math.max(c, 1)));
        h = a * (0.3 + m * C * 1.4);
      }
      let r = h;
      if (s > 0) {
        const d = o[s - 1].smoothedWidth;
        r = d + (h - d) * 0.3;
      }
      o.push({
        ...i,
        velocity: c,
        dynamicWidth: h,
        smoothedWidth: Math.max(0.5, Math.min(a * 3, r))
      });
    }
    return o;
  }
  /**
   * 基于速度的路径绘制 - 使用Fabric.js的平滑算法
   */
  drawVelocityBasedPath(t) {
    if (!(t.length < 2))
      for (let a = 1; a < t.length; a++) {
        const o = t[a], s = t[a - 1];
        this.drawVelocitySegment(s, o, s.smoothedWidth, o.smoothedWidth);
      }
  }
  /**
   * 绘制基于速度的单个线段 - 实现由粗到细的渐变
   */
  drawVelocitySegment(t, a, o, s) {
    const i = Math.sqrt(
      Math.pow(a.x - t.x, 2) + Math.pow(a.y - t.y, 2)
    ), c = Math.max(2, Math.min(10, Math.floor(i / 3)));
    this.ctx.beginPath();
    const h = [];
    for (let r = 0; r <= c; r++) {
      const d = r / c, p = this.smoothStep(d), x = t.x + (a.x - t.x) * p, m = t.y + (a.y - t.y) * p, C = o + (s - o) * p, w = a.x - t.x, F = a.y - t.y, A = Math.sqrt(w * w + F * F);
      if (A > 0) {
        const S = -F / A * C / 2, W = w / A * C / 2;
        r === 0 ? this.ctx.moveTo(x + S, m + W) : this.ctx.lineTo(x + S, m + W), h.push({ x: x - S, y: m - W });
      }
    }
    for (let r = h.length - 1; r >= 0; r--)
      this.ctx.lineTo(h[r].x, h[r].y);
    this.ctx.closePath(), this.ctx.fill();
  }
  /**
   * 基于速度变化的智能连接 - 优化连笔效果，增强连笔的明显性
   */
  addVelocityBasedConnections(t) {
    for (let a = 1; a < t.length - 1; a++) {
      const o = t[a - 1], s = t[a], i = t[a + 1], c = Math.abs(s.velocity - o.velocity), h = (s.velocity + o.velocity) / 2, r = Math.atan2(s.y - o.y, s.x - o.x), d = Math.atan2(i.y - s.y, i.x - s.x);
      let p = Math.abs(d - r);
      if (p > Math.PI && (p = 2 * Math.PI - p), c > h * 0.3 || p > 0.15) {
        const m = s.smoothedWidth * 0.6, C = this.ctx.createRadialGradient(
          s.x,
          s.y,
          0,
          s.x,
          s.y,
          m
        );
        C.addColorStop(0, this.ctx.fillStyle), C.addColorStop(1, "transparent");
        const w = this.ctx.fillStyle;
        this.ctx.fillStyle = C, this.ctx.beginPath(), this.ctx.arc(s.x, s.y, m, 0, Math.PI * 2), this.ctx.fill(), this.ctx.fillStyle = w;
      }
      if (p > 0.05) {
        const m = s.smoothedWidth * 0.2;
        this.ctx.beginPath(), this.ctx.arc(s.x, s.y, m, 0, Math.PI * 2), this.ctx.fill();
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
  getControlPoint(t, a, o) {
    const i = {
      length: Math.sqrt(Math.pow(o.x - a.x, 2) + Math.pow(o.y - a.y, 2)),
      angle: Math.atan2(o.y - a.y, o.x - a.x)
    }, c = i.angle + Math.PI, h = i.length * 0.2;
    return {
      x: t.x + Math.cos(c) * h,
      y: t.y + Math.sin(c) * h,
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
        const o = this.eventCallbacks.get(t), s = o.indexOf(a);
        s > -1 && o.splice(s, 1);
      } else
        this.eventCallbacks.delete(t);
  }
  /**
   * 触发事件
   */
  emit(t, ...a) {
    const o = this.eventCallbacks.get(t);
    o && o.forEach((s) => s(...a));
  }
  /**
   * 在离屏画布上绘制完整路径
   */
  drawCompletePathToOffscreen(t) {
    if (!this.offscreenCtx || t.points.length < 2)
      return;
    const a = this.ctx;
    this.ctx = this.offscreenCtx;
    const o = t.penStyle || this.options.penStyle || "pen";
    this.drawStyledStrokeForReplay(t.points, o, t.strokeColor, t.strokeWidth), this.ctx = a;
  }
  /**
   * 在离屏画布上绘制部分路径
   */
  drawPartialPathToOffscreen(t, a) {
    if (!this.offscreenCtx || t.points.length < 2)
      return;
    const o = t.startTime || 0, s = t.duration || 0, i = o + s * a, c = this.getPointsUpToTime(t.points, o, i);
    if (c.length < 2)
      return;
    const h = this.ctx;
    this.ctx = this.offscreenCtx;
    const r = t.penStyle || this.options.penStyle || "pen";
    this.drawStyledStrokeForReplay(c, r, t.strokeColor, t.strokeWidth), this.ctx = h;
  }
  /**
   * 销毁控制器
   */
  destroy() {
    this.stop(), this.eventCallbacks.clear(), this.replayData = null, this.lastFrameImageBitmap && (this.lastFrameImageBitmap.close(), this.lastFrameImageBitmap = null);
  }
}
function wt(l) {
  const t = l.paths.map((r) => {
    const d = r.points.map((x, m) => {
      var w;
      let C;
      if (x.time && r.points[0].time)
        C = x.time - r.points[0].time;
      else if (m === 0)
        C = 0;
      else {
        const F = r.points[m - 1], S = Math.sqrt(
          Math.pow(x.x - F.x, 2) + Math.pow(x.y - F.y, 2)
        ) / 100 * 1e3;
        C = (((w = d[m - 1]) == null ? void 0 : w.relativeTime) || 0) + Math.max(S, 16);
      }
      return {
        ...x,
        relativeTime: C
      };
    }), p = d.length > 0 ? d[d.length - 1].relativeTime : 0;
    return {
      ...r,
      points: d,
      duration: p
    };
  }), a = [];
  for (let r = 0; r < t.length; r++) {
    const d = t[r];
    let p;
    if (r === 0)
      p = 0;
    else {
      const C = a[r - 1], w = bt(
        l.paths[r - 1].points,
        l.paths[r].points
      );
      p = C.endTime + w;
    }
    const x = p + d.duration, m = {
      ...d,
      startTime: p,
      endTime: x
    };
    console.log(`路径 ${r}: 开始时间=${p}, 结束时间=${x}, 持续时间=${d.duration}`), a.push(m);
  }
  const o = a.length > 0 ? a[a.length - 1].endTime : 0;
  console.log("回放数据生成完成:"), console.log("- 路径数量:", a.length), console.log("- 总时长:", o), console.log("- 路径详情:", a.map((r) => ({
    startTime: r.startTime,
    endTime: r.endTime,
    duration: r.duration,
    pointCount: r.points.length
  })));
  const s = a.reduce((r, d) => r + Tt(d.points), 0), i = o > 0 ? s / (o / 1e3) : 0, c = a.slice(1).map((r, d) => {
    const p = a[d];
    return r.startTime - p.endTime;
  }), h = c.length > 0 ? c.reduce((r, d) => r + d, 0) / c.length : 0;
  return {
    paths: a,
    totalDuration: o,
    speed: 1,
    metadata: {
      deviceType: Mt(l),
      averageSpeed: i,
      totalDistance: s,
      averagePauseTime: h
    }
  };
}
function bt(l, t) {
  if (l.length === 0 || t.length === 0)
    return 200;
  const a = l[l.length - 1], o = t[0];
  if (a.time && o.time)
    return Math.max(o.time - a.time, 50);
  const s = Math.sqrt(
    Math.pow(o.x - a.x, 2) + Math.pow(o.y - a.y, 2)
  );
  return Math.min(Math.max(s * 2, 100), 1e3);
}
function Mt(l) {
  const t = l.paths.reduce((i, c) => i + c.points.length, 0), a = l.paths.length;
  if (t === 0)
    return "touch";
  const o = t / a;
  return o > 20 ? "touch" : o < 10 ? "mouse" : l.paths.some(
    (i) => i.points.some((c) => c.pressure !== void 0)
  ) ? "pen" : "touch";
}
function Tt(l) {
  let t = 0;
  for (let a = 1; a < l.length; a++) {
    const o = l[a].x - l[a - 1].x, s = l[a].y - l[a - 1].y;
    t += Math.sqrt(o * o + s * s);
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
function kt(l) {
  return Fe[l];
}
function Qt() {
  return Object.entries(Fe).map(([l, t]) => ({
    key: l,
    config: t
  }));
}
function St(l, t) {
  const a = kt(l);
  return {
    strokeWidth: a.strokeWidth,
    smoothing: a.smoothing,
    pressure: a.pressure,
    lineCap: a.lineCap,
    lineJoin: a.lineJoin,
    strokeColor: t || a.recommendedColor || "#000000"
  };
}
const Pt = ["width", "height"], Dt = {
  key: 1,
  class: "signature-toolbar"
}, Wt = ["disabled"], Rt = ["disabled"], It = ["disabled"], Et = {
  key: 2,
  class: "replay-controls"
}, Ot = { class: "replay-buttons" }, _t = ["disabled"], Ft = { key: 0 }, At = { key: 1 }, Jt = ["disabled"], qt = { class: "replay-progress" }, Bt = ["max", "value", "disabled"], $t = { class: "time-display" }, zt = { class: "replay-speed" }, Vt = 16, Yt = /* @__PURE__ */ ut({
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
  setup(l, { expose: t, emit: a }) {
    const o = l, s = a, i = O(), c = O(!1), h = O(null), r = O(Q(0, 0)), d = O([]), p = O(-1), x = O(0), m = O(null), C = O(!1), w = O("idle"), F = O(0), A = O(0), S = _(() => typeof o.width == "number" ? o.width : 800), W = _(() => typeof o.height == "number" ? o.height : 300), Je = _(() => ({
      position: "relative",
      display: "inline-block",
      width: typeof o.width == "string" ? o.width : `${o.width}px`,
      height: typeof o.height == "string" ? o.height : `${o.height}px`
    })), qe = _(() => ({
      border: o.borderStyle,
      borderRadius: o.borderRadius,
      backgroundColor: o.backgroundColor,
      cursor: o.disabled ? "not-allowed" : "crosshair",
      display: "block",
      width: "100%",
      height: "100%"
    })), Be = _(() => ({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "#999",
      fontSize: "14px",
      pointerEvents: "none",
      userSelect: "none"
    })), $e = _(() => C.value ? !1 : o.placeholder && G(r.value)), he = _(() => p.value > 0), ce = _(() => p.value < d.value.length - 1), ue = _(() => C.value && m.value), J = _(() => !ue.value && !o.disabled), ze = _(() => {
      var e;
      return ue.value && ((e = o.replayOptions) == null ? void 0 : e.showControls) !== !1;
    }), E = _(() => {
      if (o.penStyle) {
        const e = St(o.penStyle, o.strokeColor);
        return {
          strokeColor: e.strokeColor,
          strokeWidth: o.strokeWidth || e.strokeWidth,
          smoothing: o.smoothing !== void 0 ? o.smoothing : e.smoothing,
          pressure: {
            enabled: o.pressureSensitive !== void 0 ? o.pressureSensitive : e.pressure.enabled,
            min: o.minStrokeWidth || e.pressure.min,
            max: o.maxStrokeWidth || e.pressure.max
          },
          lineCap: e.lineCap,
          lineJoin: e.lineJoin
        };
      }
      return {
        strokeColor: o.strokeColor || "#000000",
        strokeWidth: o.strokeWidth || 2,
        smoothing: o.smoothing !== void 0 ? o.smoothing : !0,
        pressure: {
          enabled: o.pressureSensitive || !1,
          min: o.minStrokeWidth || 1,
          max: o.maxStrokeWidth || 4
        },
        lineCap: "round",
        lineJoin: "round"
      };
    }), X = () => {
      var e;
      return ((e = i.value) == null ? void 0 : e.getContext("2d")) || null;
    }, H = (e, n) => {
      const u = i.value, f = u.getBoundingClientRect(), y = u.width / f.width, g = u.height / f.height;
      return {
        x: (e - f.left) * y,
        y: (n - f.top) * g,
        time: Date.now()
      };
    }, de = (e) => {
      if (!J.value)
        return;
      c.value = !0;
      const n = performance.now(), u = { ...e, time: n };
      h.value = {
        points: [u],
        strokeColor: o.strokeColor,
        strokeWidth: o.strokeWidth,
        penStyle: o.penStyle,
        // 保存笔迹样式
        startTime: n,
        endTime: n,
        duration: 0
      }, s("signature-start");
    }, K = (e, n, u, f) => {
      switch (u) {
        case "pen":
          return 1;
        case "brush":
          if (n) {
            const T = Math.sqrt(Math.pow(e.x - n.x, 2) + Math.pow(e.y - n.y, 2)), I = Math.max(1, (e.time || 0) - (n.time || 0)), R = T / I, q = Math.max(0.1, Math.min(3, 100 / Math.max(R, 1))), $ = e.pressure || 0.5, U = 0.8 + Math.random() * 0.4;
            return Math.max(1, Math.min(20, f * q * (0.3 + $ * 1.4) * U));
          }
          return f;
        case "marker":
          return 12;
        case "pencil":
          const y = e.pressure || 0.5, g = 0.9 + Math.random() * 0.2;
          return f * (0.7 + y * 0.6) * g;
        case "ballpoint":
          const v = e.pressure || 0.5;
          return f * (0.8 + v * 0.4);
        case "elegant":
          const b = e.pressure || 0.5;
          let M = 1;
          if (n) {
            const T = Math.sqrt(Math.pow(e.x - n.x, 2) + Math.pow(e.y - n.y, 2)), I = Math.max(1, (e.time || 0) - (n.time || 0)), R = T / I;
            M = Math.max(0.3, Math.min(2, 50 / Math.max(R, 1)));
          }
          const P = b * M;
          return f * (0.4 + P * 1.6);
        default:
          return f;
      }
    }, L = (e, n, u, f = !1) => {
      var y;
      if (!(n.length < 2))
        switch (e.strokeStyle = ((y = h.value) == null ? void 0 : y.strokeColor) || E.value.strokeColor, e.lineCap = E.value.lineCap || "round", e.lineJoin = E.value.lineJoin || "round", u) {
          case "pen":
            if (e.lineWidth = 1, e.lineCap = "butt", e.lineJoin = "miter", e.beginPath(), e.moveTo(n[0].x, n[0].y), n.length >= 3) {
              for (let g = 1; g < n.length - 1; g++) {
                const v = me(n[g], n[g - 1], n[g + 1]);
                e.quadraticCurveTo(v.x, v.y, n[g].x, n[g].y);
              }
              e.lineTo(n[n.length - 1].x, n[n.length - 1].y);
            } else
              for (let g = 1; g < n.length; g++)
                e.lineTo(n[g].x, n[g].y);
            e.stroke();
            break;
          case "brush":
            e.lineCap = "round", e.lineJoin = "round";
            for (let g = 1; g < n.length; g++) {
              const v = n[g], b = n[g - 1], M = K(v, b, u, E.value.strokeWidth), P = e.createLinearGradient(b.x, b.y, v.x, v.y);
              P.addColorStop(0, e.strokeStyle), P.addColorStop(1, e.strokeStyle), e.lineWidth = M, e.beginPath(), e.moveTo(b.x, b.y), e.lineTo(v.x, v.y), e.stroke(), M > 8 && Math.random() > 0.6 && (e.globalAlpha = 0.2, e.beginPath(), e.arc(v.x, v.y, M * 0.3, 0, Math.PI * 2), e.fill(), e.globalAlpha = 1);
            }
            break;
          case "marker":
            e.globalAlpha = 0.7, e.lineWidth = 12, e.lineCap = "square", e.lineJoin = "bevel", e.beginPath(), e.moveTo(n[0].x, n[0].y);
            for (let g = 1; g < n.length; g++)
              e.lineTo(n[g].x, n[g].y);
            e.stroke(), e.globalAlpha = 0.3, e.lineWidth = 16, e.beginPath(), e.moveTo(n[0].x, n[0].y);
            for (let g = 1; g < n.length; g++)
              e.lineTo(n[g].x, n[g].y);
            e.stroke(), e.globalAlpha = 1;
            break;
          case "pencil":
            e.lineCap = "round", e.lineJoin = "round";
            for (let g = 1; g < n.length; g++) {
              const v = n[g], b = n[g - 1], M = K(v, b, u, E.value.strokeWidth);
              e.lineWidth = M, e.globalAlpha = 0.8, e.beginPath(), e.moveTo(b.x, b.y), e.lineTo(v.x, v.y), e.stroke();
              for (let P = 0; P < 3; P++)
                if (Math.random() > 0.5) {
                  e.globalAlpha = 0.2, e.lineWidth = M * 0.3;
                  const T = (Math.random() - 0.5) * 2, I = (Math.random() - 0.5) * 2;
                  e.beginPath(), e.moveTo(b.x + T, b.y + I), e.lineTo(v.x + T, v.y + I), e.stroke();
                }
              if (Math.random() > 0.8) {
                e.globalAlpha = 0.4;
                for (let P = 0; P < 5; P++)
                  e.beginPath(), e.arc(
                    v.x + (Math.random() - 0.5) * 3,
                    v.y + (Math.random() - 0.5) * 3,
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
            for (let g = 1; g < n.length; g++) {
              const v = n[g], b = n[g - 1], M = K(v, b, u, E.value.strokeWidth);
              if (Math.random() > 0.1) {
                if (e.lineWidth = M, e.globalAlpha = Math.random() > 0.2 ? 1 : 0.7, e.beginPath(), E.value.smoothing && g < n.length - 1) {
                  const P = n[g + 1], T = me(v, b, P);
                  e.moveTo(b.x, b.y), e.quadraticCurveTo(T.x, T.y, v.x, v.y);
                } else
                  e.moveTo(b.x, b.y), e.lineTo(v.x, v.y);
                e.stroke();
              }
            }
            e.globalAlpha = 1;
            break;
          case "elegant":
            Ue(e, n, f);
            break;
        }
    }, Ve = () => {
      if (!h.value || h.value.points.length < 2)
        return;
      const e = X();
      if (!e)
        return;
      const n = h.value.penStyle || o.penStyle || "pen";
      if (n === "brush") {
        Ye();
        return;
      }
      if (n === "ballpoint") {
        Xe();
        return;
      }
      e.clearRect(0, 0, S.value, W.value);
      for (const u of r.value.paths)
        u !== h.value && Z(e, u);
      h.value.points.length >= 2 && Z(e, h.value);
    }, Ye = () => {
      if (!h.value || h.value.points.length < 2)
        return;
      const e = X();
      if (!e)
        return;
      const n = h.value.points;
      if (n.length >= 2) {
        const f = n.slice(-3);
        f.length >= 2 && L(e, f, "brush", !0);
      }
    }, Xe = () => {
      if (!h.value || h.value.points.length < 2)
        return;
      const e = X();
      if (!e)
        return;
      const n = h.value.points;
      if (n.length >= 2) {
        const f = n.slice(-3);
        f.length >= 2 && L(e, f, "ballpoint", !0);
      }
    }, Le = () => {
      if (!h.value || h.value.points.length < 2)
        return;
      const e = X();
      if (!e)
        return;
      const n = h.value.points, u = n.length, f = o.penStyle || "pen";
      if (u === 2)
        L(e, n, f, !0);
      else if (u >= 3) {
        const y = n.slice(-3);
        L(e, y, f, !0);
      }
    }, Ue = (e, n, u = !1) => {
      var y, g;
      if (n.length < 2)
        return;
      e.strokeStyle = ((y = h.value) == null ? void 0 : y.strokeColor) || E.value.strokeColor, e.fillStyle = ((g = h.value) == null ? void 0 : g.strokeColor) || E.value.strokeColor, e.lineCap = "round", e.lineJoin = "round", e.globalCompositeOperation = "source-over";
      const f = He(n, E.value.strokeWidth);
      Ne(e, f), u || Ge(e, f);
    }, He = (e, n) => {
      const u = [];
      for (let f = 0; f < e.length; f++) {
        const y = e[f];
        let g = 0, v = n;
        if (f > 0) {
          const M = e[f - 1], P = Math.sqrt(
            Math.pow(y.x - M.x, 2) + Math.pow(y.y - M.y, 2)
          ), T = Math.max(1, (y.time || 0) - (M.time || 0));
          g = P / T;
          const I = y.pressure || 0.5, R = Math.max(0.2, Math.min(3, 100 / Math.max(g, 1)));
          v = n * (0.3 + I * R * 1.4);
        }
        let b = v;
        if (f > 0) {
          const M = u[f - 1].smoothedWidth;
          b = M + (v - M) * 0.3;
        }
        u.push({
          ...y,
          velocity: g,
          dynamicWidth: v,
          smoothedWidth: Math.max(0.5, Math.min(n * 3, b))
        });
      }
      return u;
    }, Ne = (e, n) => {
      if (!(n.length < 2))
        for (let u = 1; u < n.length; u++) {
          const f = n[u], y = n[u - 1];
          je(e, y, f, y.smoothedWidth, f.smoothedWidth);
        }
    }, je = (e, n, u, f, y) => {
      const g = Math.sqrt(
        Math.pow(u.x - n.x, 2) + Math.pow(u.y - n.y, 2)
      ), v = Math.max(2, Math.min(10, Math.floor(g / 3)));
      e.beginPath();
      const b = [];
      for (let M = 0; M <= v; M++) {
        const P = M / v, T = Qe(P), I = n.x + (u.x - n.x) * T, R = n.y + (u.y - n.y) * T, q = f + (y - f) * T, $ = u.x - n.x, U = u.y - n.y, te = Math.sqrt($ * $ + U * U);
        if (te > 0) {
          const ne = -U / te * q / 2, ae = $ / te * q / 2;
          M === 0 ? e.moveTo(I + ne, R + ae) : e.lineTo(I + ne, R + ae), b.push({ x: I - ne, y: R - ae });
        }
      }
      for (let M = b.length - 1; M >= 0; M--)
        e.lineTo(b[M].x, b[M].y);
      e.closePath(), e.fill();
    }, Ge = (e, n) => {
      for (let u = 1; u < n.length - 1; u++) {
        const f = n[u - 1], y = n[u], g = n[u + 1], v = Math.abs(y.velocity - f.velocity), b = (y.velocity + f.velocity) / 2, M = Math.atan2(y.y - f.y, y.x - f.x), P = Math.atan2(g.y - y.y, g.x - y.x);
        let T = Math.abs(P - M);
        if (T > Math.PI && (T = 2 * Math.PI - T), v > b * 0.3 || T > 0.15) {
          const R = y.smoothedWidth * 0.6, q = e.createRadialGradient(
            y.x,
            y.y,
            0,
            y.x,
            y.y,
            R
          );
          q.addColorStop(0, e.fillStyle), q.addColorStop(1, "transparent");
          const $ = e.fillStyle;
          e.fillStyle = q, e.beginPath(), e.arc(y.x, y.y, R, 0, Math.PI * 2), e.fill(), e.fillStyle = $;
        }
        if (T > 0.05) {
          const R = y.smoothedWidth * 0.2;
          e.beginPath(), e.arc(y.x, y.y, R, 0, Math.PI * 2), e.fill();
        }
      }
    }, Qe = (e) => e * e * (3 - 2 * e), me = (e, n, u) => {
      const y = {
        length: Math.sqrt(Math.pow(u.x - n.x, 2) + Math.pow(u.y - n.y, 2)),
        angle: Math.atan2(u.y - n.y, u.x - n.x)
      }, g = y.angle + Math.PI, v = y.length * 0.2;
      return {
        x: e.x + Math.cos(g) * v,
        y: e.y + Math.sin(g) * v,
        time: e.time || 0
      };
    }, Z = (e, n) => {
      if (n.points.length < 2)
        return;
      const u = n.penStyle || o.penStyle || "pen", f = h.value;
      h.value = n, L(e, n.points, u), h.value = f;
    }, ge = (e) => {
      if (!c.value || !h.value || !J.value)
        return;
      const n = performance.now();
      if (n - x.value < Vt)
        return;
      x.value = n;
      const u = { ...e, time: n };
      h.value.points.push(u), h.value.startTime && (h.value.endTime = n, h.value.duration = n - h.value.startTime), o.realTimeMode ? Ve() : Le(), ve(), s("signature-drawing", r.value);
    }, pe = () => {
      if (!(!c.value || !h.value)) {
        if (c.value = !1, h.value.points.length > 0) {
          const e = h.value.points[h.value.points.length - 1];
          e.time && h.value.startTime && (h.value.endTime = e.time, h.value.duration = e.time - h.value.startTime);
        }
        r.value.paths.push(h.value), r.value.isEmpty = !1, r.value.timestamp = Date.now(), N(), B(), h.value = null, s("signature-end", r.value);
      }
    }, Ke = (e) => {
      e.preventDefault();
      const n = H(e.clientX, e.clientY);
      de(n);
    }, Ze = (e) => {
      if (e.preventDefault(), !c.value)
        return;
      const n = H(e.clientX, e.clientY);
      ge(n);
    }, fe = (e) => {
      e.preventDefault(), pe();
    }, et = (e) => {
      if (e.preventDefault(), e.touches.length !== 1)
        return;
      const n = e.touches[0], u = H(n.clientX, n.clientY);
      de(u);
    }, tt = (e) => {
      if (e.preventDefault(), e.touches.length !== 1 || !c.value)
        return;
      const n = e.touches[0], u = H(n.clientX, n.clientY);
      ge(u);
    }, ye = (e) => {
      e.preventDefault(), pe();
    }, ve = () => {
      r.value.canvasSize = {
        width: S.value,
        height: W.value
      }, r.value.isEmpty = G(r.value);
    }, N = () => {
      d.value = d.value.slice(0, p.value + 1), d.value.push(Y(r.value)), p.value = d.value.length - 1;
      const e = 50;
      d.value.length > e && (d.value = d.value.slice(-e), p.value = d.value.length - 1);
    }, B = () => {
      const e = X();
      e && (e.clearRect(0, 0, S.value, W.value), o.backgroundColor && o.backgroundColor !== "transparent" && (e.fillStyle = o.backgroundColor, e.fillRect(0, 0, S.value, W.value)), r.value.paths.forEach((n) => {
        n.points.length > 0 && Z(e, n);
      }));
    }, j = () => {
      if (console.log("初始化回放控制器"), console.log("canvas引用是否存在:", !!i.value), !i.value) {
        console.error("canvas引用不存在，无法初始化回放控制器");
        return;
      }
      m.value && (console.log("销毁现有回放控制器"), m.value.destroy()), console.log("创建新的回放控制器"), m.value = new Ct(i.value), console.log("回放控制器创建成功:", !!m.value), m.value.on("replay-start", () => {
        w.value = "playing", s("replay-start");
      }), m.value.on("replay-progress", (e, n) => {
        F.value = e, A.value = n, s("replay-progress", e, n);
      }), m.value.on("replay-pause", () => {
        w.value = "paused", s("replay-pause");
      }), m.value.on("replay-resume", () => {
        w.value = "playing", s("replay-resume");
      }), m.value.on("replay-stop", () => {
        w.value = "stopped", s("replay-stop");
      }), m.value.on("replay-complete", () => {
        w.value = "completed", s("replay-complete");
      }), m.value.on("replay-path-start", (e, n) => {
        s("replay-path-start", e, n);
      }), m.value.on("replay-path-end", (e, n) => {
        s("replay-path-end", e, n);
      }), m.value.on("replay-speed-change", (e) => {
        s("replay-speed-change", e);
      });
    }, xe = (e, n) => {
      if (m.value || j(), m.value) {
        C.value = !0;
        const u = {
          ...n,
          drawOptions: E.value,
          penStyle: o.penStyle
        };
        m.value.setReplayData(e, u), console.log("startReplay调用，自动播放:", n == null ? void 0 : n.autoPlay), (n == null ? void 0 : n.autoPlay) === !0 && m.value.play();
      }
    }, Ce = (e) => {
      C.value = e, !e && m.value && (m.value.stop(), B());
    }, nt = () => G(r.value) ? null : wt(r.value), we = () => {
      console.log("play方法被调用"), console.log("回放控制器是否存在:", !!m.value), m.value || (console.log("回放控制器不存在，尝试初始化"), j()), m.value ? (console.log("调用回放控制器的play方法"), m.value.play()) : console.error("回放控制器初始化失败，无法播放");
    }, be = () => {
      var e;
      (e = m.value) == null || e.pause();
    }, Me = () => {
      var e;
      (e = m.value) == null || e.stop();
    }, Te = (e) => {
      var n;
      (n = m.value) == null || n.seek(e);
    }, ke = (e) => {
      var n;
      (n = m.value) == null || n.setSpeed(e);
    }, at = () => {
      var e;
      return ((e = m.value) == null ? void 0 : e.getState()) || "idle";
    }, ot = () => {
      var e;
      return ((e = m.value) == null ? void 0 : e.getCurrentTime()) || 0;
    }, ee = () => {
      var e;
      return ((e = m.value) == null ? void 0 : e.getTotalDuration()) || 0;
    }, st = () => {
      var e;
      return ((e = m.value) == null ? void 0 : e.getProgress()) || 0;
    }, Se = (e) => {
      const n = Math.floor(e / 1e3), u = Math.floor(n / 60), f = n % 60;
      return `${u}:${f.toString().padStart(2, "0")}`;
    }, Pe = () => {
      J.value && (r.value = Q(S.value, W.value), B(), N(), s("signature-clear"));
    }, De = () => {
      !he.value || !J.value || (p.value--, r.value = Y(d.value[p.value]), B(), s("signature-undo", r.value));
    }, We = () => {
      !ce.value || !J.value || (p.value++, r.value = Y(d.value[p.value]), B(), s("signature-redo", r.value));
    }, Re = (e) => {
      const n = i.value;
      return vt(n, r.value, e);
    }, Ie = () => G(r.value), Ee = async (e) => {
      if (!J.value)
        return;
      const n = i.value;
      await xt(n, e), r.value = Q(S.value, W.value), r.value.isEmpty = !1, N();
    }, it = () => Y(r.value), lt = (e) => {
      J.value && (r.value = Y(e), B(), N());
    }, Oe = (e, n) => {
      const u = e || S.value, f = n || W.value, y = Re({ format: "png" });
      se(() => {
        const g = i.value;
        g.width = u, g.height = f, Ie() || Ee(y), ve();
      });
    }, rt = () => {
      const e = i.value;
      e.width = S.value, e.height = W.value, r.value = Q(S.value, W.value), d.value = [Y(r.value)], p.value = 0, B();
    };
    return oe([() => o.width, () => o.height], () => {
      se(() => {
        i.value && Oe();
      });
    }), oe(() => o.replayMode, (e) => {
      e !== void 0 && Ce(e);
    }), oe(() => o.replayData, (e) => {
      if (console.log("watch监听到回放数据变化:", e), console.log("当前回放模式:", o.replayMode), console.log("回放控制器是否存在:", !!m.value), e && o.replayMode)
        if (m.value || (console.log("回放控制器未初始化，先初始化"), j()), m.value) {
          console.log("开始设置回放数据到控制器");
          const n = {
            ...o.replayOptions,
            drawOptions: E.value,
            penStyle: o.penStyle
          };
          m.value.setReplayData(e, n), console.log("回放数据已更新:", e);
        } else
          console.error("回放控制器初始化失败");
      else
        e || console.log("回放数据为空，跳过设置"), o.replayMode || console.log("不在回放模式，跳过设置");
    }, { immediate: !0 }), dt(() => {
      se(() => {
        rt(), j(), o.replayMode && o.replayData && xe(o.replayData, o.replayOptions);
      });
    }), mt(() => {
      m.value && (m.value.destroy(), m.value = null);
    }), t({
      clear: Pe,
      undo: De,
      redo: We,
      save: Re,
      isEmpty: Ie,
      fromDataURL: Ee,
      getSignatureData: it,
      setSignatureData: lt,
      resize: Oe,
      // 回放相关方法
      startReplay: xe,
      getReplayData: nt,
      setReplayMode: Ce,
      play: we,
      pause: be,
      stop: Me,
      seek: Te,
      setSpeed: ke,
      getState: at,
      getCurrentTime: ot,
      getTotalDuration: ee,
      getProgress: st
    }), (e, n) => (z(), V("div", {
      class: "electronic-signature",
      style: ie(Je.value)
    }, [
      k("canvas", {
        ref_key: "canvasRef",
        ref: i,
        width: S.value,
        height: W.value,
        style: ie(qe.value),
        onMousedown: Ke,
        onMousemove: Ze,
        onMouseup: fe,
        onMouseleave: fe,
        onTouchstart: et,
        onTouchmove: tt,
        onTouchend: ye,
        onTouchcancel: ye
      }, null, 44, Pt),
      $e.value ? (z(), V("div", {
        key: 0,
        class: "signature-placeholder",
        style: ie(Be.value)
      }, le(e.placeholder), 5)) : re("", !0),
      e.showToolbar ? (z(), V("div", Dt, [
        k("button", {
          onClick: Pe,
          disabled: !J.value
        }, "清除", 8, Wt),
        k("button", {
          onClick: De,
          disabled: !J.value || !he.value
        }, "撤销", 8, Rt),
        k("button", {
          onClick: We,
          disabled: !J.value || !ce.value
        }, "重做", 8, It)
      ])) : re("", !0),
      ze.value ? (z(), V("div", Et, [
        k("div", Ot, [
          k("button", {
            onClick: n[0] || (n[0] = (u) => w.value === "playing" ? be() : we()),
            disabled: w.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            w.value === "playing" ? (z(), V("span", Ft, "⏸️")) : (z(), V("span", At, "▶️"))
          ], 8, _t),
          k("button", {
            onClick: n[1] || (n[1] = (u) => Me()),
            disabled: w.value === "idle",
            class: "replay-btn stop-btn"
          }, " ⏹️ ", 8, Jt)
        ]),
        k("div", qt, [
          k("input", {
            type: "range",
            min: "0",
            max: ee(),
            value: A.value,
            onInput: n[2] || (n[2] = (u) => Te(Number(u.target.value))),
            class: "progress-slider",
            disabled: w.value === "idle"
          }, null, 40, Bt),
          k("div", $t, [
            k("span", null, le(Se(A.value)), 1),
            n[4] || (n[4] = k("span", null, "/", -1)),
            k("span", null, le(Se(ee())), 1)
          ])
        ]),
        k("div", zt, [
          n[6] || (n[6] = k("label", null, "速度:", -1)),
          k("select", {
            onChange: n[3] || (n[3] = (u) => ke(Number(u.target.value))),
            class: "speed-select"
          }, n[5] || (n[5] = [
            k("option", { value: "0.5" }, "0.5x", -1),
            k("option", {
              value: "1",
              selected: ""
            }, "1x", -1),
            k("option", { value: "1.5" }, "1.5x", -1),
            k("option", { value: "2" }, "2x", -1)
          ]), 32)
        ])
      ])) : re("", !0)
    ], 4));
  }
});
const Xt = (l, t) => {
  const a = l.__vccOpts || l;
  for (const [o, s] of t)
    a[o] = s;
  return a;
}, Ae = /* @__PURE__ */ Xt(Yt, [["__scopeId", "data-v-f381ec60"]]);
function Lt() {
  return window.devicePixelRatio || 1;
}
function Kt(l) {
  const t = l.getContext("2d"), a = Lt(), o = l.clientWidth, s = l.clientHeight;
  return l.width = o * a, l.height = s * a, t.scale(a, a), l.style.width = o + "px", l.style.height = s + "px", t;
}
function Ut(l) {
  if (l.paths.length === 0)
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0
    };
  let t = 1 / 0, a = 1 / 0, o = -1 / 0, s = -1 / 0;
  return l.paths.forEach((i) => {
    i.points.forEach((c) => {
      t = Math.min(t, c.x), a = Math.min(a, c.y), o = Math.max(o, c.x), s = Math.max(s, c.y);
    });
  }), {
    minX: t,
    minY: a,
    maxX: o,
    maxY: s,
    width: o - t,
    height: s - a
  };
}
function Zt(l, t, a = 10) {
  const o = Ut(t);
  if (o.width === 0 || o.height === 0) {
    const r = document.createElement("canvas");
    return r.width = 1, r.height = 1, r;
  }
  const s = document.createElement("canvas"), i = s.getContext("2d"), c = o.width + a * 2, h = o.height + a * 2;
  return s.width = c, s.height = h, i.drawImage(
    l,
    o.minX - a,
    o.minY - a,
    c,
    h,
    0,
    0,
    c,
    h
  ), s;
}
function en(l, t, a, o = !0) {
  const s = document.createElement("canvas"), i = s.getContext("2d");
  let c = t, h = a;
  if (o) {
    const r = l.width / l.height, d = t / a;
    r > d ? h = t / r : c = a * r;
  }
  return s.width = c, s.height = h, i.imageSmoothingEnabled = !0, i.imageSmoothingQuality = "high", i.drawImage(l, 0, 0, c, h), s;
}
function tn(l, t, a = {}) {
  const {
    fontSize: o = 12,
    fontFamily: s = "Arial",
    color: i = "#999",
    opacity: c = 0.5,
    position: h = "bottom-right"
  } = a, r = document.createElement("canvas"), d = r.getContext("2d");
  r.width = l.width, r.height = l.height, d.drawImage(l, 0, 0), d.font = `${o}px ${s}`, d.fillStyle = i, d.globalAlpha = c;
  const x = d.measureText(t).width, m = o;
  let C, w;
  switch (h) {
    case "top-left":
      C = 10, w = m + 10;
      break;
    case "top-right":
      C = l.width - x - 10, w = m + 10;
      break;
    case "bottom-left":
      C = 10, w = l.height - 10;
      break;
    case "bottom-right":
      C = l.width - x - 10, w = l.height - 10;
      break;
    case "center":
      C = (l.width - x) / 2, w = (l.height + m) / 2;
      break;
    default:
      C = l.width - x - 10, w = l.height - 10;
  }
  return d.fillText(t, C, w), d.globalAlpha = 1, r;
}
function nn(l) {
  const t = document.createElement("canvas"), a = t.getContext("2d");
  t.width = l.width, t.height = l.height, a.drawImage(l, 0, 0);
  const o = a.getImageData(0, 0, l.width, l.height), s = o.data;
  for (let i = 0; i < s.length; i += 4) {
    const c = s[i] * 0.299 + s[i + 1] * 0.587 + s[i + 2] * 0.114;
    s[i] = c, s[i + 1] = c, s[i + 2] = c;
  }
  return a.putImageData(o, 0, 0), t;
}
const Ht = (l) => {
  l.component("ElectronicSignature", Ae);
}, an = {
  install: Ht,
  ElectronicSignature: Ae
}, on = "1.0.0";
export {
  Ae as ElectronicSignature,
  Fe as PEN_STYLE_CONFIGS,
  Ct as SignatureReplayController,
  tn as addWatermark,
  ft as calculateStrokeWidth,
  Y as cloneSignatureData,
  nn as convertToGrayscale,
  St as createDrawOptionsFromPenStyle,
  Q as createEmptySignatureData,
  wt as createReplayData,
  Zt as cropSignature,
  an as default,
  Gt as drawSmoothPath,
  vt as exportSignature,
  Qt as getAllPenStyles,
  gt as getAngle,
  pt as getControlPoint,
  Lt as getDevicePixelRatio,
  _e as getDistance,
  kt as getPenStyleConfig,
  Ut as getSignatureBounds,
  G as isSignatureEmpty,
  xt as loadImageToCanvas,
  en as resizeSignature,
  Kt as setupHighDPICanvas,
  yt as signatureToSVG,
  on as version
};
