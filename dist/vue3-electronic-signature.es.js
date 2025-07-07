var ht = Object.defineProperty;
var ct = (l, e, a) => e in l ? ht(l, e, { enumerable: !0, configurable: !0, writable: !0, value: a }) : l[e] = a;
var P = (l, e, a) => (ct(l, typeof e != "symbol" ? e + "" : e, a), a);
import { defineComponent as ut, ref as E, computed as O, watch as oe, nextTick as se, onMounted as dt, onUnmounted as mt, openBlock as $, createElementBlock as z, normalizeStyle as ie, createElementVNode as M, toDisplayString as le, createCommentVNode as re } from "vue";
function _e(l, e) {
  return Math.sqrt(
    Math.pow(e.x - l.x, 2) + Math.pow(e.y - l.y, 2)
  );
}
function gt(l, e) {
  return Math.atan2(e.y - l.y, e.x - l.x);
}
function pt(l, e, a, o) {
  const s = e || l, i = a || l, c = 0.2, h = gt(s, i) * (o ? 1 : -1), r = _e(s, i) * c;
  return {
    x: l.x + Math.cos(h) * r,
    y: l.y + Math.sin(h) * r,
    time: l.time
  };
}
function ft(l, e, a) {
  if (!a.pressure.enabled)
    return a.strokeWidth;
  const o = _e(l, e), s = e.time - l.time, i = s > 0 ? o / s : 0, c = Math.max(0.1, Math.min(1, 1 - i * 0.01)), { min: h, max: r } = a.pressure;
  return h + (r - h) * c;
}
function jt(l, e, a) {
  if (e.length < 2)
    return;
  if (l.strokeStyle = a.strokeColor, l.lineCap = "round", l.lineJoin = "round", !a.smoothing || e.length < 3) {
    l.beginPath(), l.lineWidth = a.strokeWidth, l.moveTo(e[0].x, e[0].y);
    for (let s = 1; s < e.length; s++)
      l.lineTo(e[s].x, e[s].y);
    l.stroke();
    return;
  }
  l.beginPath(), l.moveTo(e[0].x, e[0].y);
  for (let s = 1; s < e.length - 1; s++) {
    const i = e[s], c = e[s + 1];
    a.pressure.enabled ? l.lineWidth = ft(e[s - 1], i, a) : l.lineWidth = a.strokeWidth;
    const h = pt(i, e[s - 1], c);
    l.quadraticCurveTo(h.x, h.y, i.x, i.y);
  }
  const o = e[e.length - 1];
  l.lineTo(o.x, o.y), l.stroke();
}
function yt(l) {
  const { canvasSize: e, paths: a } = l;
  let o = `<svg width="${e.width}" height="${e.height}" xmlns="http://www.w3.org/2000/svg">`;
  return a.forEach((s) => {
    if (s.points.length < 2)
      return;
    let i = `M ${s.points[0].x} ${s.points[0].y}`;
    for (let c = 1; c < s.points.length; c++)
      i += ` L ${s.points[c].x} ${s.points[c].y}`;
    o += `<path d="${i}" stroke="${s.strokeColor}" stroke-width="${s.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), o += "</svg>", o;
}
function vt(l, e, a = { format: "png" }) {
  const { format: o, quality: s = 0.9, size: i, backgroundColor: c } = a;
  if (o === "svg")
    return yt(e);
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
function xt(l, e) {
  return new Promise((a, o) => {
    const s = new Image();
    s.onload = () => {
      const i = l.getContext("2d");
      i.clearRect(0, 0, l.width, l.height), i.drawImage(s, 0, 0, l.width, l.height), a();
    }, s.onerror = o, s.src = e;
  });
}
function G(l) {
  return l.paths.length === 0 || l.paths.every((e) => e.points.length === 0);
}
function j(l, e) {
  return {
    paths: [],
    canvasSize: { width: l, height: e },
    timestamp: Date.now(),
    isEmpty: !0
  };
}
function V(l) {
  return JSON.parse(JSON.stringify(l));
}
class Ct {
  constructor(e) {
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
    this.canvas = e, this.ctx = e.getContext("2d"), this.initializeOffscreenCanvas(), this.seededRandom = this.createSeededRandom();
  }
  /**
   * 创建确定性随机数生成器（解决毛笔等笔迹的闪烁问题）
   * 基于简单的线性同余生成器（LCG）算法
   */
  createSeededRandom() {
    return (e) => {
      const s = Math.pow(2, 32);
      return (1664525 * e + 1013904223) % s / s;
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
  setReplayData(e, a = {}) {
    console.log("设置回放数据:", e), console.log("回放选项:", a), this.replayData = e, this.options = { ...a }, this.speed = a.speed || e.speed || 1, this.currentTime = a.startTime || 0, this.state = "idle", this.resetOptimizationState(), console.log("回放数据设置完成，路径数量:", e.paths.length), console.log("总时长:", e.totalDuration);
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
   * 渲染指定时间的帧 - 高性能优化版本
   */
  renderFrame(e) {
    if (!this.replayData || !this.offscreenCanvas || !this.offscreenCtx)
      return;
    const a = performance.now();
    if (!(a - this.renderThrottle < 16) && (this.renderThrottle = a, !this.isRendering)) {
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
    const a = this.offscreenCanvas, o = this.offscreenCtx;
    o.globalCompositeOperation = "copy", o.fillStyle = "transparent", o.fillRect(0, 0, a.width, a.height), o.globalCompositeOperation = "source-over";
    let s = !1;
    for (let i = 0; i < this.replayData.paths.length; i++) {
      const c = this.replayData.paths[i], h = c.startTime || 0, r = c.endTime || h + (c.duration || 0);
      if (e < h)
        break;
      if (e >= r) {
        this.drawCompletePathToOffscreen(c), !s && Math.abs(e - r) < 32 && this.emit("replay-path-end", i, c);
        continue;
      }
      s = !0;
      const d = Math.max(0, Math.min(1, (e - h) / Math.max(r - h, 1)));
      d > 0 && Math.abs(e - h) < 32 && this.emit("replay-path-start", i, c), this.drawPartialPathToOffscreen(c, d);
      break;
    }
  }
  /**
   * 获取指定时间内的所有点
   */
  getPointsUpToTime(e, a, o) {
    const s = [];
    for (let i = 0; i < e.length; i++) {
      const c = e[i], h = a + (c.relativeTime || i * 50);
      if (h <= o)
        s.push(c);
      else {
        if (i > 0) {
          const r = e[i - 1], d = a + (r.relativeTime || (i - 1) * 50);
          if (d <= o) {
            const p = (o - d) / (h - d), v = {
              x: r.x + (c.x - r.x) * p,
              y: r.y + (c.y - r.y) * p,
              time: o,
              pressure: r.pressure ? r.pressure + (c.pressure || r.pressure - r.pressure) * p : c.pressure
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
  calculateDynamicStrokeWidth(e, a, o, s) {
    switch (o) {
      case "pen":
        return 1;
      case "brush":
        if (a) {
          const m = Math.sqrt(Math.pow(e.x - a.x, 2) + Math.pow(e.y - a.y, 2)), x = Math.max(1, (e.time || 0) - (a.time || 0)), w = m / x, _ = Math.max(0.1, Math.min(3, 100 / Math.max(w, 1))), F = e.pressure || 0.5, k = Math.floor(e.x * 1e3 + e.y * 1e3 + (e.time || 0)), D = 0.8 + this.seededRandom(k) * 0.4;
          return Math.max(1, Math.min(20, s * _ * (0.3 + F * 1.4) * D));
        }
        return s;
      case "marker":
        return 12;
      case "pencil":
        const i = e.pressure || 0.5, c = Math.floor(e.x * 1e3 + e.y * 1e3 + (e.time || 0)), h = 0.9 + this.seededRandom(c + 1) * 0.2;
        return s * (0.7 + i * 0.6) * h;
      case "ballpoint":
        const r = e.pressure || 0.5;
        return s * (0.8 + r * 0.4);
      case "elegant":
        const d = e.pressure || 0.5;
        let p = 1;
        if (a) {
          const m = Math.sqrt(Math.pow(e.x - a.x, 2) + Math.pow(e.y - a.y, 2)), x = Math.max(1, (e.time || 0) - (a.time || 0)), w = m / x;
          p = Math.max(0.3, Math.min(2, 50 / Math.max(w, 1)));
        }
        const v = d * p;
        return s * (0.4 + v * 1.6);
      default:
        return s;
    }
  }
  /**
   * 根据笔迹样式绘制线段（与录制时完全一致）
   */
  drawStyledStrokeForReplay(e, a, o, s) {
    if (!(e.length < 2))
      switch (this.ctx.strokeStyle = o, a) {
        case "pen":
          if (this.ctx.lineWidth = 1, this.ctx.lineCap = "butt", this.ctx.lineJoin = "miter", this.ctx.beginPath(), this.ctx.moveTo(e[0].x, e[0].y), e.length >= 3) {
            for (let i = 1; i < e.length - 1; i++) {
              const c = this.getControlPoint(e[i], e[i - 1], e[i + 1]);
              this.ctx.quadraticCurveTo(c.x, c.y, e[i].x, e[i].y);
            }
            this.ctx.lineTo(e[e.length - 1].x, e[e.length - 1].y);
          } else
            for (let i = 1; i < e.length; i++)
              this.ctx.lineTo(e[i].x, e[i].y);
          this.ctx.stroke();
          break;
        case "brush":
          this.ctx.lineCap = "round", this.ctx.lineJoin = "round";
          for (let i = 1; i < e.length; i++) {
            const c = e[i], h = e[i - 1], r = this.calculateDynamicStrokeWidth(c, h, a, s);
            this.ctx.lineWidth = r, this.ctx.beginPath(), this.ctx.moveTo(h.x, h.y), this.ctx.lineTo(c.x, c.y), this.ctx.stroke();
            const d = Math.floor(c.x * 100 + c.y * 100 + i);
            r > 8 && this.seededRandom(d) > 0.6 && (this.ctx.globalAlpha = 0.2, this.ctx.beginPath(), this.ctx.arc(c.x, c.y, r * 0.3, 0, Math.PI * 2), this.ctx.fill(), this.ctx.globalAlpha = 1);
          }
          break;
        case "marker":
          this.ctx.globalAlpha = 0.7, this.ctx.lineWidth = 12, this.ctx.lineCap = "square", this.ctx.lineJoin = "bevel", this.ctx.beginPath(), this.ctx.moveTo(e[0].x, e[0].y);
          for (let i = 1; i < e.length; i++)
            this.ctx.lineTo(e[i].x, e[i].y);
          this.ctx.stroke(), this.ctx.globalAlpha = 0.3, this.ctx.lineWidth = 16, this.ctx.beginPath(), this.ctx.moveTo(e[0].x, e[0].y);
          for (let i = 1; i < e.length; i++)
            this.ctx.lineTo(e[i].x, e[i].y);
          this.ctx.stroke(), this.ctx.globalAlpha = 1;
          break;
        case "pencil":
          this.ctx.lineCap = "round", this.ctx.lineJoin = "round";
          for (let i = 1; i < e.length; i++) {
            const c = e[i], h = e[i - 1], r = this.calculateDynamicStrokeWidth(c, h, a, s);
            this.ctx.lineWidth = r, this.ctx.globalAlpha = 0.8, this.ctx.beginPath(), this.ctx.moveTo(h.x, h.y), this.ctx.lineTo(c.x, c.y), this.ctx.stroke();
            for (let p = 0; p < 3; p++) {
              const v = Math.floor(c.x * 10 + c.y * 10 + i * 10 + p);
              if (this.seededRandom(v) > 0.5) {
                this.ctx.globalAlpha = 0.2, this.ctx.lineWidth = r * 0.3;
                const m = (this.seededRandom(v + 1) - 0.5) * 2, x = (this.seededRandom(v + 2) - 0.5) * 2;
                this.ctx.beginPath(), this.ctx.moveTo(h.x + m, h.y + x), this.ctx.lineTo(c.x + m, c.y + x), this.ctx.stroke();
              }
            }
            const d = Math.floor(c.x * 5 + c.y * 5 + i * 5);
            if (this.seededRandom(d) > 0.8) {
              this.ctx.globalAlpha = 0.4;
              for (let p = 0; p < 5; p++) {
                const v = d + p * 10;
                this.ctx.beginPath(), this.ctx.arc(
                  c.x + (this.seededRandom(v + 1) - 0.5) * 3,
                  c.y + (this.seededRandom(v + 2) - 0.5) * 3,
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
          for (let i = 1; i < e.length; i++) {
            const c = e[i], h = e[i - 1], r = this.calculateDynamicStrokeWidth(c, h, a, s);
            if (this.ctx.lineWidth = r, this.ctx.globalAlpha = 1, this.ctx.beginPath(), i < e.length - 1) {
              const d = e[i + 1], p = this.getControlPoint(c, h, d);
              this.ctx.moveTo(h.x, h.y), this.ctx.quadraticCurveTo(p.x, p.y, c.x, c.y);
            } else
              this.ctx.moveTo(h.x, h.y), this.ctx.lineTo(c.x, c.y);
            this.ctx.stroke();
          }
          this.ctx.globalAlpha = 1;
          break;
        case "elegant":
          this.drawElegantStroke(e, o, s);
          break;
      }
  }
  /**
   * 绘制优雅笔迹 - 基于Fabric.js和Vue3-Signature-Pad的速度压力感应技术
   */
  drawElegantStroke(e, a, o) {
    if (e.length < 2)
      return;
    this.ctx.strokeStyle = a, this.ctx.fillStyle = a, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", this.ctx.globalCompositeOperation = "source-over";
    const s = this.preprocessPointsForVelocity(e, o);
    this.drawVelocityBasedPath(s), this.addVelocityBasedConnections(s);
  }
  /**
   * 预处理点数据，计算速度和动态线宽 - 基于Vue3-Signature-Pad算法
   */
  preprocessPointsForVelocity(e, a) {
    const o = [];
    for (let s = 0; s < e.length; s++) {
      const i = e[s];
      let c = 0, h = a;
      if (s > 0) {
        const d = e[s - 1], p = Math.sqrt(
          Math.pow(i.x - d.x, 2) + Math.pow(i.y - d.y, 2)
        ), v = Math.max(1, (i.time || 0) - (d.time || 0));
        c = p / v;
        const m = i.pressure || 0.5, x = Math.max(0.2, Math.min(3, 100 / Math.max(c, 1)));
        h = a * (0.3 + m * x * 1.4);
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
  drawVelocityBasedPath(e) {
    if (!(e.length < 2))
      for (let a = 1; a < e.length; a++) {
        const o = e[a], s = e[a - 1];
        this.drawVelocitySegment(s, o, s.smoothedWidth, o.smoothedWidth);
      }
  }
  /**
   * 绘制基于速度的单个线段 - 实现由粗到细的渐变
   */
  drawVelocitySegment(e, a, o, s) {
    const i = Math.sqrt(
      Math.pow(a.x - e.x, 2) + Math.pow(a.y - e.y, 2)
    ), c = Math.max(2, Math.min(10, Math.floor(i / 3)));
    this.ctx.beginPath();
    const h = [];
    for (let r = 0; r <= c; r++) {
      const d = r / c, p = this.smoothStep(d), v = e.x + (a.x - e.x) * p, m = e.y + (a.y - e.y) * p, x = o + (s - o) * p, w = a.x - e.x, _ = a.y - e.y, F = Math.sqrt(w * w + _ * _);
      if (F > 0) {
        const k = -_ / F * x / 2, D = w / F * x / 2;
        r === 0 ? this.ctx.moveTo(v + k, m + D) : this.ctx.lineTo(v + k, m + D), h.push({ x: v - k, y: m - D });
      }
    }
    for (let r = h.length - 1; r >= 0; r--)
      this.ctx.lineTo(h[r].x, h[r].y);
    this.ctx.closePath(), this.ctx.fill();
  }
  /**
   * 基于速度变化的智能连接 - 优化连笔效果，增强连笔的明显性
   */
  addVelocityBasedConnections(e) {
    for (let a = 1; a < e.length - 1; a++) {
      const o = e[a - 1], s = e[a], i = e[a + 1], c = Math.abs(s.velocity - o.velocity), h = (s.velocity + o.velocity) / 2, r = Math.atan2(s.y - o.y, s.x - o.x), d = Math.atan2(i.y - s.y, i.x - s.x);
      let p = Math.abs(d - r);
      if (p > Math.PI && (p = 2 * Math.PI - p), c > h * 0.3 || p > 0.15) {
        const m = s.smoothedWidth * 0.6, x = this.ctx.createRadialGradient(
          s.x,
          s.y,
          0,
          s.x,
          s.y,
          m
        );
        x.addColorStop(0, this.ctx.fillStyle), x.addColorStop(1, "transparent");
        const w = this.ctx.fillStyle;
        this.ctx.fillStyle = x, this.ctx.beginPath(), this.ctx.arc(s.x, s.y, m, 0, Math.PI * 2), this.ctx.fill(), this.ctx.fillStyle = w;
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
  smoothStep(e) {
    return e * e * (3 - 2 * e);
  }
  /**
   * 获取控制点（用于贝塞尔曲线平滑） - 与signature.ts中的实现一致
   */
  getControlPoint(e, a, o) {
    const i = {
      length: Math.sqrt(Math.pow(o.x - a.x, 2) + Math.pow(o.y - a.y, 2)),
      angle: Math.atan2(o.y - a.y, o.x - a.x)
    }, c = i.angle + Math.PI, h = i.length * 0.2;
    return {
      x: e.x + Math.cos(c) * h,
      y: e.y + Math.sin(c) * h,
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
   * 在离屏画布上绘制完整路径
   */
  drawCompletePathToOffscreen(e) {
    if (!this.offscreenCtx || e.points.length < 2)
      return;
    const a = this.ctx;
    this.ctx = this.offscreenCtx;
    const o = e.penStyle || this.options.penStyle || "pen";
    this.drawStyledStrokeForReplay(e.points, o, e.strokeColor, e.strokeWidth), this.ctx = a;
  }
  /**
   * 在离屏画布上绘制部分路径
   */
  drawPartialPathToOffscreen(e, a) {
    if (!this.offscreenCtx || e.points.length < 2)
      return;
    const o = e.startTime || 0, s = e.duration || 0, i = o + s * a, c = this.getPointsUpToTime(e.points, o, i);
    if (c.length < 2)
      return;
    const h = this.ctx;
    this.ctx = this.offscreenCtx;
    const r = e.penStyle || this.options.penStyle || "pen";
    this.drawStyledStrokeForReplay(c, r, e.strokeColor, e.strokeWidth), this.ctx = h;
  }
  /**
   * 销毁控制器
   */
  destroy() {
    this.stop(), this.eventCallbacks.clear(), this.replayData = null, this.lastFrameImageBitmap && (this.lastFrameImageBitmap.close(), this.lastFrameImageBitmap = null);
  }
}
function wt(l) {
  const e = l.paths.map((r) => {
    const d = r.points.map((v, m) => {
      var w;
      let x;
      if (v.time && r.points[0].time)
        x = v.time - r.points[0].time;
      else if (m === 0)
        x = 0;
      else {
        const _ = r.points[m - 1], k = Math.sqrt(
          Math.pow(v.x - _.x, 2) + Math.pow(v.y - _.y, 2)
        ) / 100 * 1e3;
        x = (((w = d[m - 1]) == null ? void 0 : w.relativeTime) || 0) + Math.max(k, 16);
      }
      return {
        ...v,
        relativeTime: x
      };
    }), p = d.length > 0 ? d[d.length - 1].relativeTime : 0;
    return {
      ...r,
      points: d,
      duration: p
    };
  }), a = [];
  for (let r = 0; r < e.length; r++) {
    const d = e[r];
    let p;
    if (r === 0)
      p = 0;
    else {
      const x = a[r - 1], w = bt(
        l.paths[r - 1].points,
        l.paths[r].points
      );
      p = x.endTime + w;
    }
    const v = p + d.duration, m = {
      ...d,
      startTime: p,
      endTime: v
    };
    console.log(`路径 ${r}: 开始时间=${p}, 结束时间=${v}, 持续时间=${d.duration}`), a.push(m);
  }
  const o = a.length > 0 ? a[a.length - 1].endTime : 0;
  console.log("回放数据生成完成:"), console.log("- 路径数量:", a.length), console.log("- 总时长:", o), console.log("- 路径详情:", a.map((r) => ({
    startTime: r.startTime,
    endTime: r.endTime,
    duration: r.duration,
    pointCount: r.points.length
  })));
  const s = a.reduce((r, d) => r + Mt(d.points), 0), i = o > 0 ? s / (o / 1e3) : 0, c = a.slice(1).map((r, d) => {
    const p = a[d];
    return r.startTime - p.endTime;
  }), h = c.length > 0 ? c.reduce((r, d) => r + d, 0) / c.length : 0;
  return {
    paths: a,
    totalDuration: o,
    speed: 1,
    metadata: {
      deviceType: Tt(l),
      averageSpeed: i,
      totalDistance: s,
      averagePauseTime: h
    }
  };
}
function bt(l, e) {
  if (l.length === 0 || e.length === 0)
    return 200;
  const a = l[l.length - 1], o = e[0];
  if (a.time && o.time)
    return Math.max(o.time - a.time, 50);
  const s = Math.sqrt(
    Math.pow(o.x - a.x, 2) + Math.pow(o.y - a.y, 2)
  );
  return Math.min(Math.max(s * 2, 100), 1e3);
}
function Tt(l) {
  const e = l.paths.reduce((i, c) => i + c.points.length, 0), a = l.paths.length;
  if (e === 0)
    return "touch";
  const o = e / a;
  return o > 20 ? "touch" : o < 10 ? "mouse" : l.paths.some(
    (i) => i.points.some((c) => c.pressure !== void 0)
  ) ? "pen" : "touch";
}
function Mt(l) {
  let e = 0;
  for (let a = 1; a < l.length; a++) {
    const o = l[a].x - l[a - 1].x, s = l[a].y - l[a - 1].y;
    e += Math.sqrt(o * o + s * s);
  }
  return e;
}
const Fe = {
  pen: {
    name: "钢笔",
    description: "极细线条，锐利精准，商务签名",
    strokeWidth: 1,
    smoothing: !0,
    pressure: {
      enabled: !0,
      min: 1,
      max: 1
    },
    lineCap: "round",
    lineJoin: "round",
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
  return Object.entries(Fe).map(([l, e]) => ({
    key: l,
    config: e
  }));
}
function St(l, e) {
  const a = kt(l);
  return {
    strokeWidth: a.strokeWidth,
    smoothing: a.smoothing,
    pressure: a.pressure,
    lineCap: a.lineCap,
    lineJoin: a.lineJoin,
    strokeColor: e || a.recommendedColor || "#000000"
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
  setup(l, { expose: e, emit: a }) {
    const o = l, s = a, i = E(), c = E(!1), h = E(null), r = E(j(0, 0)), d = E([]), p = E(-1), v = E(0), m = E(null), x = E(!1), w = E("idle"), _ = E(0), F = E(0), k = O(() => typeof o.width == "number" ? o.width : 800), D = O(() => typeof o.height == "number" ? o.height : 300), Je = O(() => ({
      position: "relative",
      display: "inline-block",
      width: typeof o.width == "string" ? o.width : `${o.width}px`,
      height: typeof o.height == "string" ? o.height : `${o.height}px`
    })), qe = O(() => ({
      border: o.borderStyle,
      borderRadius: o.borderRadius,
      backgroundColor: o.backgroundColor,
      cursor: o.disabled ? "not-allowed" : "crosshair",
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
    })), $e = O(() => x.value ? !1 : o.placeholder && G(r.value)), he = O(() => p.value > 0), ce = O(() => p.value < d.value.length - 1), ue = O(() => x.value && m.value), A = O(() => !ue.value && !o.disabled), ze = O(() => {
      var t;
      return ue.value && ((t = o.replayOptions) == null ? void 0 : t.showControls) !== !1;
    }), R = O(() => {
      if (o.penStyle) {
        const t = St(o.penStyle, o.strokeColor);
        return {
          strokeColor: t.strokeColor,
          strokeWidth: o.strokeWidth || t.strokeWidth,
          smoothing: o.smoothing !== void 0 ? o.smoothing : t.smoothing,
          pressure: {
            enabled: o.pressureSensitive !== void 0 ? o.pressureSensitive : t.pressure.enabled,
            min: o.minStrokeWidth || t.pressure.min,
            max: o.maxStrokeWidth || t.pressure.max
          },
          lineCap: t.lineCap,
          lineJoin: t.lineJoin
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
    }), Y = () => {
      var t;
      return ((t = i.value) == null ? void 0 : t.getContext("2d")) || null;
    }, U = (t, n) => {
      const u = i.value, f = u.getBoundingClientRect(), y = u.width / f.width, g = u.height / f.height;
      return {
        x: (t - f.left) * y,
        y: (n - f.top) * g,
        time: Date.now()
      };
    }, de = (t) => {
      if (!A.value)
        return;
      c.value = !0;
      const n = performance.now(), u = { ...t, time: n };
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
    }, Q = (t, n, u, f) => {
      switch (u) {
        case "pen":
          return 1;
        case "brush":
          if (n) {
            const W = Math.sqrt(Math.pow(t.x - n.x, 2) + Math.pow(t.y - n.y, 2)), S = Math.max(1, (t.time || 0) - (n.time || 0)), J = W / S, I = Math.max(0.1, Math.min(3, 100 / Math.max(J, 1))), q = t.pressure || 0.5;
            return Math.max(1, Math.min(20, f * I * (0.3 + q * 1.4)));
          }
          return f;
        case "marker":
          return 12;
        case "pencil":
          const y = t.pressure || 0.5;
          return f * (0.7 + y * 0.6);
        case "ballpoint":
          const g = t.pressure || 0.5;
          return f * (0.8 + g * 0.4);
        case "elegant":
          const C = t.pressure || 0.5;
          let b = 1;
          if (n) {
            const W = Math.sqrt(Math.pow(t.x - n.x, 2) + Math.pow(t.y - n.y, 2)), S = Math.max(1, (t.time || 0) - (n.time || 0)), J = W / S;
            b = Math.max(0.3, Math.min(2, 50 / Math.max(J, 1)));
          }
          const T = C * b;
          return f * (0.4 + T * 1.6);
        default:
          return f;
      }
    }, X = (t, n, u, f = !1) => {
      var y;
      if (!(n.length < 2))
        switch (t.strokeStyle = ((y = h.value) == null ? void 0 : y.strokeColor) || R.value.strokeColor, t.lineCap = R.value.lineCap || "round", t.lineJoin = R.value.lineJoin || "round", u) {
          case "pen":
            if (t.lineWidth = 1, t.lineCap = "butt", t.lineJoin = "miter", t.beginPath(), t.moveTo(n[0].x, n[0].y), n.length >= 3) {
              for (let g = 1; g < n.length - 1; g++) {
                const C = me(n[g], n[g - 1], n[g + 1]);
                t.quadraticCurveTo(C.x, C.y, n[g].x, n[g].y);
              }
              t.lineTo(n[n.length - 1].x, n[n.length - 1].y);
            } else
              for (let g = 1; g < n.length; g++)
                t.lineTo(n[g].x, n[g].y);
            t.stroke();
            break;
          case "brush":
            t.lineCap = "round", t.lineJoin = "round";
            for (let g = 1; g < n.length; g++) {
              const C = n[g], b = n[g - 1], T = Q(C, b, u, R.value.strokeWidth), W = t.createLinearGradient(b.x, b.y, C.x, C.y);
              W.addColorStop(0, t.strokeStyle), W.addColorStop(1, t.strokeStyle), t.lineWidth = T, t.beginPath(), t.moveTo(b.x, b.y), t.lineTo(C.x, C.y), t.stroke();
            }
            break;
          case "marker":
            t.globalAlpha = 0.7, t.lineWidth = 12, t.lineCap = "square", t.lineJoin = "bevel", t.beginPath(), t.moveTo(n[0].x, n[0].y);
            for (let g = 1; g < n.length; g++)
              t.lineTo(n[g].x, n[g].y);
            t.stroke(), t.globalAlpha = 0.3, t.lineWidth = 16, t.beginPath(), t.moveTo(n[0].x, n[0].y);
            for (let g = 1; g < n.length; g++)
              t.lineTo(n[g].x, n[g].y);
            t.stroke(), t.globalAlpha = 1;
            break;
          case "pencil":
            t.lineCap = "round", t.lineJoin = "round";
            for (let g = 1; g < n.length; g++) {
              const C = n[g], b = n[g - 1], T = Q(C, b, u, R.value.strokeWidth);
              t.lineWidth = T, t.globalAlpha = 0.8, t.beginPath(), t.moveTo(b.x, b.y), t.lineTo(C.x, C.y), t.stroke();
            }
            t.globalAlpha = 1;
            break;
          case "ballpoint":
            t.lineCap = "round", t.lineJoin = "round";
            for (let g = 1; g < n.length; g++) {
              const C = n[g], b = n[g - 1], T = Q(C, b, u, R.value.strokeWidth);
              if (t.lineWidth = T, t.globalAlpha = 1, t.beginPath(), R.value.smoothing && g < n.length - 1) {
                const W = n[g + 1], S = me(C, b, W);
                t.moveTo(b.x, b.y), t.quadraticCurveTo(S.x, S.y, C.x, C.y);
              } else
                t.moveTo(b.x, b.y), t.lineTo(C.x, C.y);
              t.stroke();
            }
            t.globalAlpha = 1;
            break;
          case "elegant":
            Ue(t, n, f);
            break;
        }
    }, Ve = () => {
      if (!h.value || h.value.points.length < 2)
        return;
      const t = Y();
      if (!t)
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
      t.clearRect(0, 0, k.value, D.value);
      for (const u of r.value.paths)
        u !== h.value && K(t, u);
      h.value.points.length >= 2 && K(t, h.value);
    }, Ye = () => {
      if (!h.value || h.value.points.length < 2)
        return;
      const t = Y();
      if (!t)
        return;
      const n = h.value.points;
      if (n.length >= 2) {
        const f = n.slice(-3);
        f.length >= 2 && X(t, f, "brush", !0);
      }
    }, Xe = () => {
      if (!h.value || h.value.points.length < 2)
        return;
      const t = Y();
      if (!t)
        return;
      const n = h.value.points;
      if (n.length >= 2) {
        const f = n.slice(-3);
        f.length >= 2 && X(t, f, "ballpoint", !0);
      }
    }, Le = () => {
      if (!h.value || h.value.points.length < 2)
        return;
      const t = Y();
      if (!t)
        return;
      const n = h.value.points, u = n.length, f = o.penStyle || "pen";
      if (u === 2)
        X(t, n, f, !0);
      else if (u >= 3) {
        const y = n.slice(-3);
        X(t, y, f, !0);
      }
    }, Ue = (t, n, u = !1) => {
      var y, g;
      if (n.length < 2)
        return;
      t.strokeStyle = ((y = h.value) == null ? void 0 : y.strokeColor) || R.value.strokeColor, t.fillStyle = ((g = h.value) == null ? void 0 : g.strokeColor) || R.value.strokeColor, t.lineCap = "round", t.lineJoin = "round", t.globalCompositeOperation = "source-over";
      const f = He(n, R.value.strokeWidth);
      Ne(t, f), u || je(t, f);
    }, He = (t, n) => {
      const u = [];
      for (let f = 0; f < t.length; f++) {
        const y = t[f];
        let g = 0, C = n;
        if (f > 0) {
          const T = t[f - 1], W = Math.sqrt(
            Math.pow(y.x - T.x, 2) + Math.pow(y.y - T.y, 2)
          ), S = Math.max(1, (y.time || 0) - (T.time || 0));
          g = W / S;
          const J = y.pressure || 0.5, I = Math.max(0.2, Math.min(3, 100 / Math.max(g, 1)));
          C = n * (0.3 + J * I * 1.4);
        }
        let b = C;
        if (f > 0) {
          const T = u[f - 1].smoothedWidth;
          b = T + (C - T) * 0.3;
        }
        u.push({
          ...y,
          velocity: g,
          dynamicWidth: C,
          smoothedWidth: Math.max(0.5, Math.min(n * 3, b))
        });
      }
      return u;
    }, Ne = (t, n) => {
      if (!(n.length < 2))
        for (let u = 1; u < n.length; u++) {
          const f = n[u], y = n[u - 1];
          Ge(t, y, f, y.smoothedWidth, f.smoothedWidth);
        }
    }, Ge = (t, n, u, f, y) => {
      const g = Math.sqrt(
        Math.pow(u.x - n.x, 2) + Math.pow(u.y - n.y, 2)
      ), C = Math.max(2, Math.min(10, Math.floor(g / 3)));
      t.beginPath();
      const b = [];
      for (let T = 0; T <= C; T++) {
        const W = T / C, S = Qe(W), J = n.x + (u.x - n.x) * S, I = n.y + (u.y - n.y) * S, q = f + (y - f) * S, L = u.x - n.x, ee = u.y - n.y, te = Math.sqrt(L * L + ee * ee);
        if (te > 0) {
          const ne = -ee / te * q / 2, ae = L / te * q / 2;
          T === 0 ? t.moveTo(J + ne, I + ae) : t.lineTo(J + ne, I + ae), b.push({ x: J - ne, y: I - ae });
        }
      }
      for (let T = b.length - 1; T >= 0; T--)
        t.lineTo(b[T].x, b[T].y);
      t.closePath(), t.fill();
    }, je = (t, n) => {
      for (let u = 1; u < n.length - 1; u++) {
        const f = n[u - 1], y = n[u], g = n[u + 1], C = Math.abs(y.velocity - f.velocity), b = (y.velocity + f.velocity) / 2, T = Math.atan2(y.y - f.y, y.x - f.x), W = Math.atan2(g.y - y.y, g.x - y.x);
        let S = Math.abs(W - T);
        if (S > Math.PI && (S = 2 * Math.PI - S), C > b * 0.3 || S > 0.15) {
          const I = y.smoothedWidth * 0.6, q = t.createRadialGradient(
            y.x,
            y.y,
            0,
            y.x,
            y.y,
            I
          );
          q.addColorStop(0, t.fillStyle), q.addColorStop(1, "transparent");
          const L = t.fillStyle;
          t.fillStyle = q, t.beginPath(), t.arc(y.x, y.y, I, 0, Math.PI * 2), t.fill(), t.fillStyle = L;
        }
        if (S > 0.05) {
          const I = y.smoothedWidth * 0.2;
          t.beginPath(), t.arc(y.x, y.y, I, 0, Math.PI * 2), t.fill();
        }
      }
    }, Qe = (t) => t * t * (3 - 2 * t), me = (t, n, u) => {
      const y = {
        length: Math.sqrt(Math.pow(u.x - n.x, 2) + Math.pow(u.y - n.y, 2)),
        angle: Math.atan2(u.y - n.y, u.x - n.x)
      }, g = y.angle + Math.PI, C = y.length * 0.2;
      return {
        x: t.x + Math.cos(g) * C,
        y: t.y + Math.sin(g) * C,
        time: t.time || 0
      };
    }, K = (t, n) => {
      if (n.points.length < 2)
        return;
      const u = n.penStyle || o.penStyle || "pen", f = h.value;
      h.value = n, X(t, n.points, u), h.value = f;
    }, ge = (t) => {
      if (!c.value || !h.value || !A.value)
        return;
      const n = performance.now();
      if (n - v.value < Vt)
        return;
      v.value = n;
      const u = { ...t, time: n };
      h.value.points.push(u), h.value.startTime && (h.value.endTime = n, h.value.duration = n - h.value.startTime), o.realTimeMode ? Ve() : Le(), ve(), s("signature-drawing", r.value);
    }, pe = () => {
      if (!(!c.value || !h.value)) {
        if (c.value = !1, h.value.points.length > 0) {
          const t = h.value.points[h.value.points.length - 1];
          t.time && h.value.startTime && (h.value.endTime = t.time, h.value.duration = t.time - h.value.startTime);
        }
        r.value.paths.push(h.value), r.value.isEmpty = !1, r.value.timestamp = Date.now(), H(), B(), h.value = null, s("signature-end", r.value);
      }
    }, Ke = (t) => {
      t.preventDefault();
      const n = U(t.clientX, t.clientY);
      de(n);
    }, Ze = (t) => {
      if (t.preventDefault(), !c.value)
        return;
      const n = U(t.clientX, t.clientY);
      ge(n);
    }, fe = (t) => {
      t.preventDefault(), pe();
    }, et = (t) => {
      if (t.preventDefault(), t.touches.length !== 1)
        return;
      const n = t.touches[0], u = U(n.clientX, n.clientY);
      de(u);
    }, tt = (t) => {
      if (t.preventDefault(), t.touches.length !== 1 || !c.value)
        return;
      const n = t.touches[0], u = U(n.clientX, n.clientY);
      ge(u);
    }, ye = (t) => {
      t.preventDefault(), pe();
    }, ve = () => {
      r.value.canvasSize = {
        width: k.value,
        height: D.value
      }, r.value.isEmpty = G(r.value);
    }, H = () => {
      d.value = d.value.slice(0, p.value + 1), d.value.push(V(r.value)), p.value = d.value.length - 1;
      const t = 50;
      d.value.length > t && (d.value = d.value.slice(-t), p.value = d.value.length - 1);
    }, B = () => {
      const t = Y();
      t && (t.clearRect(0, 0, k.value, D.value), o.backgroundColor && o.backgroundColor !== "transparent" && (t.fillStyle = o.backgroundColor, t.fillRect(0, 0, k.value, D.value)), r.value.paths.forEach((n) => {
        n.points.length > 0 && K(t, n);
      }));
    }, N = () => {
      if (console.log("初始化回放控制器"), console.log("canvas引用是否存在:", !!i.value), !i.value) {
        console.error("canvas引用不存在，无法初始化回放控制器");
        return;
      }
      m.value && (console.log("销毁现有回放控制器"), m.value.destroy()), console.log("创建新的回放控制器"), m.value = new Ct(i.value), console.log("回放控制器创建成功:", !!m.value), m.value.on("replay-start", () => {
        w.value = "playing", s("replay-start");
      }), m.value.on("replay-progress", (t, n) => {
        _.value = t, F.value = n, s("replay-progress", t, n);
      }), m.value.on("replay-pause", () => {
        w.value = "paused", s("replay-pause");
      }), m.value.on("replay-resume", () => {
        w.value = "playing", s("replay-resume");
      }), m.value.on("replay-stop", () => {
        w.value = "stopped", s("replay-stop");
      }), m.value.on("replay-complete", () => {
        w.value = "completed", s("replay-complete");
      }), m.value.on("replay-path-start", (t, n) => {
        s("replay-path-start", t, n);
      }), m.value.on("replay-path-end", (t, n) => {
        s("replay-path-end", t, n);
      }), m.value.on("replay-speed-change", (t) => {
        s("replay-speed-change", t);
      });
    }, xe = (t, n) => {
      if (m.value || N(), m.value) {
        x.value = !0;
        const u = {
          ...n,
          drawOptions: R.value,
          penStyle: o.penStyle
        };
        m.value.setReplayData(t, u), console.log("startReplay调用，自动播放:", n == null ? void 0 : n.autoPlay), (n == null ? void 0 : n.autoPlay) === !0 && m.value.play();
      }
    }, Ce = (t) => {
      x.value = t, !t && m.value && (m.value.stop(), B());
    }, nt = () => G(r.value) ? null : wt(r.value), we = () => {
      console.log("play方法被调用"), console.log("回放控制器是否存在:", !!m.value), m.value || (console.log("回放控制器不存在，尝试初始化"), N()), m.value ? (console.log("调用回放控制器的play方法"), m.value.play()) : console.error("回放控制器初始化失败，无法播放");
    }, be = () => {
      var t;
      (t = m.value) == null || t.pause();
    }, Te = () => {
      var t;
      (t = m.value) == null || t.stop();
    }, Me = (t) => {
      var n;
      (n = m.value) == null || n.seek(t);
    }, ke = (t) => {
      var n;
      (n = m.value) == null || n.setSpeed(t);
    }, at = () => {
      var t;
      return ((t = m.value) == null ? void 0 : t.getState()) || "idle";
    }, ot = () => {
      var t;
      return ((t = m.value) == null ? void 0 : t.getCurrentTime()) || 0;
    }, Z = () => {
      var t;
      return ((t = m.value) == null ? void 0 : t.getTotalDuration()) || 0;
    }, st = () => {
      var t;
      return ((t = m.value) == null ? void 0 : t.getProgress()) || 0;
    }, Se = (t) => {
      const n = Math.floor(t / 1e3), u = Math.floor(n / 60), f = n % 60;
      return `${u}:${f.toString().padStart(2, "0")}`;
    }, Pe = () => {
      A.value && (r.value = j(k.value, D.value), B(), H(), s("signature-clear"));
    }, De = () => {
      !he.value || !A.value || (p.value--, r.value = V(d.value[p.value]), B(), s("signature-undo", r.value));
    }, We = () => {
      !ce.value || !A.value || (p.value++, r.value = V(d.value[p.value]), B(), s("signature-redo", r.value));
    }, Re = (t) => {
      const n = i.value;
      return vt(n, r.value, t);
    }, Ie = () => G(r.value), Ee = async (t) => {
      if (!A.value)
        return;
      const n = i.value;
      await xt(n, t), r.value = j(k.value, D.value), r.value.isEmpty = !1, H();
    }, it = () => V(r.value), lt = (t) => {
      A.value && (r.value = V(t), B(), H());
    }, Oe = (t, n) => {
      const u = t || k.value, f = n || D.value, y = Re({ format: "png" });
      se(() => {
        const g = i.value;
        g.width = u, g.height = f, Ie() || Ee(y), ve();
      });
    }, rt = () => {
      const t = i.value;
      t.width = k.value, t.height = D.value, r.value = j(k.value, D.value), d.value = [V(r.value)], p.value = 0, B();
    };
    return oe([() => o.width, () => o.height], () => {
      se(() => {
        i.value && Oe();
      });
    }), oe(() => o.replayMode, (t) => {
      t !== void 0 && Ce(t);
    }), oe(() => o.replayData, (t) => {
      if (console.log("watch监听到回放数据变化:", t), console.log("当前回放模式:", o.replayMode), console.log("回放控制器是否存在:", !!m.value), t && o.replayMode)
        if (m.value || (console.log("回放控制器未初始化，先初始化"), N()), m.value) {
          console.log("开始设置回放数据到控制器");
          const n = {
            ...o.replayOptions,
            drawOptions: R.value,
            penStyle: o.penStyle
          };
          m.value.setReplayData(t, n), console.log("回放数据已更新:", t);
        } else
          console.error("回放控制器初始化失败");
      else
        t || console.log("回放数据为空，跳过设置"), o.replayMode || console.log("不在回放模式，跳过设置");
    }, { immediate: !0 }), dt(() => {
      se(() => {
        rt(), N(), o.replayMode && o.replayData && xe(o.replayData, o.replayOptions);
      });
    }), mt(() => {
      m.value && (m.value.destroy(), m.value = null);
    }), e({
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
      stop: Te,
      seek: Me,
      setSpeed: ke,
      getState: at,
      getCurrentTime: ot,
      getTotalDuration: Z,
      getProgress: st
    }), (t, n) => ($(), z("div", {
      class: "electronic-signature",
      style: ie(Je.value)
    }, [
      M("canvas", {
        ref_key: "canvasRef",
        ref: i,
        width: k.value,
        height: D.value,
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
      $e.value ? ($(), z("div", {
        key: 0,
        class: "signature-placeholder",
        style: ie(Be.value)
      }, le(t.placeholder), 5)) : re("", !0),
      t.showToolbar ? ($(), z("div", Dt, [
        M("button", {
          onClick: Pe,
          disabled: !A.value
        }, "清除", 8, Wt),
        M("button", {
          onClick: De,
          disabled: !A.value || !he.value
        }, "撤销", 8, Rt),
        M("button", {
          onClick: We,
          disabled: !A.value || !ce.value
        }, "重做", 8, It)
      ])) : re("", !0),
      ze.value ? ($(), z("div", Et, [
        M("div", Ot, [
          M("button", {
            onClick: n[0] || (n[0] = (u) => w.value === "playing" ? be() : we()),
            disabled: w.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            w.value === "playing" ? ($(), z("span", Ft, "⏸️")) : ($(), z("span", At, "▶️"))
          ], 8, _t),
          M("button", {
            onClick: n[1] || (n[1] = (u) => Te()),
            disabled: w.value === "idle",
            class: "replay-btn stop-btn"
          }, " ⏹️ ", 8, Jt)
        ]),
        M("div", qt, [
          M("input", {
            type: "range",
            min: "0",
            max: Z(),
            value: F.value,
            onInput: n[2] || (n[2] = (u) => Me(Number(u.target.value))),
            class: "progress-slider",
            disabled: w.value === "idle"
          }, null, 40, Bt),
          M("div", $t, [
            M("span", null, le(Se(F.value)), 1),
            n[4] || (n[4] = M("span", null, "/", -1)),
            M("span", null, le(Se(Z())), 1)
          ])
        ]),
        M("div", zt, [
          n[6] || (n[6] = M("label", null, "速度:", -1)),
          M("select", {
            onChange: n[3] || (n[3] = (u) => ke(Number(u.target.value))),
            class: "speed-select"
          }, n[5] || (n[5] = [
            M("option", { value: "0.5" }, "0.5x", -1),
            M("option", {
              value: "1",
              selected: ""
            }, "1x", -1),
            M("option", { value: "1.5" }, "1.5x", -1),
            M("option", { value: "2" }, "2x", -1)
          ]), 32)
        ])
      ])) : re("", !0)
    ], 4));
  }
});
const Xt = (l, e) => {
  const a = l.__vccOpts || l;
  for (const [o, s] of e)
    a[o] = s;
  return a;
}, Ae = /* @__PURE__ */ Xt(Yt, [["__scopeId", "data-v-6bb11666"]]);
function Lt() {
  return window.devicePixelRatio || 1;
}
function Kt(l) {
  const e = l.getContext("2d"), a = Lt(), o = l.clientWidth, s = l.clientHeight;
  return l.width = o * a, l.height = s * a, e.scale(a, a), l.style.width = o + "px", l.style.height = s + "px", e;
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
  let e = 1 / 0, a = 1 / 0, o = -1 / 0, s = -1 / 0;
  return l.paths.forEach((i) => {
    i.points.forEach((c) => {
      e = Math.min(e, c.x), a = Math.min(a, c.y), o = Math.max(o, c.x), s = Math.max(s, c.y);
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
function Zt(l, e, a = 10) {
  const o = Ut(e);
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
function en(l, e, a, o = !0) {
  const s = document.createElement("canvas"), i = s.getContext("2d");
  let c = e, h = a;
  if (o) {
    const r = l.width / l.height, d = e / a;
    r > d ? h = e / r : c = a * r;
  }
  return s.width = c, s.height = h, i.imageSmoothingEnabled = !0, i.imageSmoothingQuality = "high", i.drawImage(l, 0, 0, c, h), s;
}
function tn(l, e, a = {}) {
  const {
    fontSize: o = 12,
    fontFamily: s = "Arial",
    color: i = "#999",
    opacity: c = 0.5,
    position: h = "bottom-right"
  } = a, r = document.createElement("canvas"), d = r.getContext("2d");
  r.width = l.width, r.height = l.height, d.drawImage(l, 0, 0), d.font = `${o}px ${s}`, d.fillStyle = i, d.globalAlpha = c;
  const v = d.measureText(e).width, m = o;
  let x, w;
  switch (h) {
    case "top-left":
      x = 10, w = m + 10;
      break;
    case "top-right":
      x = l.width - v - 10, w = m + 10;
      break;
    case "bottom-left":
      x = 10, w = l.height - 10;
      break;
    case "bottom-right":
      x = l.width - v - 10, w = l.height - 10;
      break;
    case "center":
      x = (l.width - v) / 2, w = (l.height + m) / 2;
      break;
    default:
      x = l.width - v - 10, w = l.height - 10;
  }
  return d.fillText(e, x, w), d.globalAlpha = 1, r;
}
function nn(l) {
  const e = document.createElement("canvas"), a = e.getContext("2d");
  e.width = l.width, e.height = l.height, a.drawImage(l, 0, 0);
  const o = a.getImageData(0, 0, l.width, l.height), s = o.data;
  for (let i = 0; i < s.length; i += 4) {
    const c = s[i] * 0.299 + s[i + 1] * 0.587 + s[i + 2] * 0.114;
    s[i] = c, s[i + 1] = c, s[i + 2] = c;
  }
  return a.putImageData(o, 0, 0), e;
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
  V as cloneSignatureData,
  nn as convertToGrayscale,
  St as createDrawOptionsFromPenStyle,
  j as createEmptySignatureData,
  wt as createReplayData,
  Zt as cropSignature,
  an as default,
  jt as drawSmoothPath,
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
