var st = Object.defineProperty;
var it = (l, e, a) => e in l ? st(l, e, { enumerable: !0, configurable: !0, writable: !0, value: a }) : l[e] = a;
var k = (l, e, a) => (it(l, typeof e != "symbol" ? e + "" : e, a), a);
import { defineComponent as lt, ref as _, computed as E, watch as ae, nextTick as ne, onMounted as rt, onUnmounted as ht, openBlock as $, createElementBlock as z, normalizeStyle as oe, createElementVNode as T, toDisplayString as se, createCommentVNode as ie } from "vue";
function Oe(l, e) {
  return Math.sqrt(
    Math.pow(e.x - l.x, 2) + Math.pow(e.y - l.y, 2)
  );
}
function ct(l, e) {
  return Math.atan2(e.y - l.y, e.x - l.x);
}
function ut(l, e, a, n) {
  const s = e || l, i = a || l, h = 0.2, c = ct(s, i) * (n ? 1 : -1), r = Oe(s, i) * h;
  return {
    x: l.x + Math.cos(c) * r,
    y: l.y + Math.sin(c) * r,
    time: l.time
  };
}
function dt(l, e, a) {
  if (!a.pressure.enabled)
    return a.strokeWidth;
  const n = Oe(l, e), s = e.time - l.time, i = s > 0 ? n / s : 0, h = Math.max(0.1, Math.min(1, 1 - i * 0.01)), { min: c, max: r } = a.pressure;
  return c + (r - c) * h;
}
function Lt(l, e, a) {
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
    const i = e[s], h = e[s + 1];
    a.pressure.enabled ? l.lineWidth = dt(e[s - 1], i, a) : l.lineWidth = a.strokeWidth;
    const c = ut(i, e[s - 1], h);
    l.quadraticCurveTo(c.x, c.y, i.x, i.y);
  }
  const n = e[e.length - 1];
  l.lineTo(n.x, n.y), l.stroke();
}
function mt(l) {
  const { canvasSize: e, paths: a } = l;
  let n = `<svg width="${e.width}" height="${e.height}" xmlns="http://www.w3.org/2000/svg">`;
  return a.forEach((s) => {
    if (s.points.length < 2)
      return;
    let i = `M ${s.points[0].x} ${s.points[0].y}`;
    for (let h = 1; h < s.points.length; h++)
      i += ` L ${s.points[h].x} ${s.points[h].y}`;
    n += `<path d="${i}" stroke="${s.strokeColor}" stroke-width="${s.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), n += "</svg>", n;
}
function gt(l, e, a = { format: "png" }) {
  const { format: n, quality: s = 0.9, size: i, backgroundColor: h } = a;
  if (n === "svg")
    return mt(e);
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
function pt(l, e) {
  return new Promise((a, n) => {
    const s = new Image();
    s.onload = () => {
      const i = l.getContext("2d");
      i.clearRect(0, 0, l.width, l.height), i.drawImage(s, 0, 0, l.width, l.height), a();
    }, s.onerror = n, s.src = e;
  });
}
function N(l) {
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
function B(l) {
  return JSON.parse(JSON.stringify(l));
}
class ft {
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
    // 性能优化相关
    k(this, "offscreenCanvas", null);
    k(this, "offscreenCtx", null);
    k(this, "lastFrameImageBitmap", null);
    k(this, "renderThrottle", 0);
    k(this, "isRendering", !1);
    // 确定性随机数生成器（解决毛笔闪烁问题）
    k(this, "seededRandom");
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
    const a = this.offscreenCanvas, n = this.offscreenCtx;
    n.globalCompositeOperation = "copy", n.fillStyle = "transparent", n.fillRect(0, 0, a.width, a.height), n.globalCompositeOperation = "source-over";
    let s = !1;
    for (let i = 0; i < this.replayData.paths.length; i++) {
      const h = this.replayData.paths[i], c = h.startTime || 0, r = h.endTime || c + (h.duration || 0);
      if (e < c)
        break;
      if (e >= r) {
        this.drawCompletePathToOffscreen(h), !s && Math.abs(e - r) < 32 && this.emit("replay-path-end", i, h);
        continue;
      }
      s = !0;
      const m = Math.max(0, Math.min(1, (e - c) / Math.max(r - c, 1)));
      m > 0 && Math.abs(e - c) < 32 && this.emit("replay-path-start", i, h), this.drawPartialPathToOffscreen(h, m);
      break;
    }
  }
  /**
   * 获取指定时间内的所有点
   */
  getPointsUpToTime(e, a, n) {
    const s = [];
    for (let i = 0; i < e.length; i++) {
      const h = e[i], c = a + (h.relativeTime || i * 50);
      if (c <= n)
        s.push(h);
      else {
        if (i > 0) {
          const r = e[i - 1], m = a + (r.relativeTime || (i - 1) * 50);
          if (m <= n) {
            const p = (n - m) / (c - m), u = {
              x: r.x + (h.x - r.x) * p,
              y: r.y + (h.y - r.y) * p,
              time: n,
              pressure: r.pressure ? r.pressure + (h.pressure || r.pressure - r.pressure) * p : h.pressure
            };
            s.push(u);
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
  calculateDynamicStrokeWidth(e, a, n, s) {
    switch (n) {
      case "pen":
        return 1;
      case "brush":
        if (a) {
          const w = Math.sqrt(Math.pow(e.x - a.x, 2) + Math.pow(e.y - a.y, 2)), v = Math.max(1, (e.time || 0) - (a.time || 0)), M = w / v, R = Math.max(0.1, Math.min(3, 100 / Math.max(M, 1))), P = e.pressure || 0.5, S = Math.floor(e.x * 1e3 + e.y * 1e3 + (e.time || 0)), J = 0.8 + this.seededRandom(S) * 0.4;
          return Math.max(1, Math.min(20, s * R * (0.3 + P * 1.4) * J));
        }
        return s;
      case "marker":
        return 12;
      case "pencil":
        const i = e.pressure || 0.5, h = Math.floor(e.x * 1e3 + e.y * 1e3 + (e.time || 0)), c = 0.9 + this.seededRandom(h + 1) * 0.2;
        return s * (0.7 + i * 0.6) * c;
      case "ballpoint":
        const r = e.pressure || 0.5;
        return s * (0.8 + r * 0.4);
      case "elegant":
        const m = e.pressure || 0.5;
        let p = 1;
        if (a) {
          const w = Math.sqrt(Math.pow(e.x - a.x, 2) + Math.pow(e.y - a.y, 2)), v = Math.max(1, (e.time || 0) - (a.time || 0)), M = w / v;
          p = Math.max(0.3, Math.min(2, 50 / Math.max(M, 1)));
        }
        const u = m * p;
        return s * (0.4 + u * 1.6);
      default:
        return s;
    }
  }
  /**
   * 根据笔迹样式绘制线段（与录制时完全一致）
   */
  drawStyledStrokeForReplay(e, a, n, s) {
    if (!(e.length < 2))
      switch (this.ctx.strokeStyle = n, a) {
        case "pen":
          if (this.ctx.lineWidth = 1, this.ctx.lineCap = "butt", this.ctx.lineJoin = "miter", this.ctx.beginPath(), this.ctx.moveTo(e[0].x, e[0].y), e.length >= 3) {
            for (let i = 1; i < e.length - 1; i++) {
              const h = this.getControlPoint(e[i], e[i - 1], e[i + 1]);
              this.ctx.quadraticCurveTo(h.x, h.y, e[i].x, e[i].y);
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
            const h = e[i], c = e[i - 1], r = this.calculateDynamicStrokeWidth(h, c, a, s);
            this.ctx.lineWidth = r, this.ctx.beginPath(), this.ctx.moveTo(c.x, c.y), this.ctx.lineTo(h.x, h.y), this.ctx.stroke();
            const m = Math.floor(h.x * 100 + h.y * 100 + i);
            r > 8 && this.seededRandom(m) > 0.6 && (this.ctx.globalAlpha = 0.2, this.ctx.beginPath(), this.ctx.arc(h.x, h.y, r * 0.3, 0, Math.PI * 2), this.ctx.fill(), this.ctx.globalAlpha = 1);
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
            const h = e[i], c = e[i - 1], r = this.calculateDynamicStrokeWidth(h, c, a, s);
            this.ctx.lineWidth = r, this.ctx.globalAlpha = 0.8, this.ctx.beginPath(), this.ctx.moveTo(c.x, c.y), this.ctx.lineTo(h.x, h.y), this.ctx.stroke();
            for (let p = 0; p < 3; p++) {
              const u = Math.floor(h.x * 10 + h.y * 10 + i * 10 + p);
              if (this.seededRandom(u) > 0.5) {
                this.ctx.globalAlpha = 0.2, this.ctx.lineWidth = r * 0.3;
                const w = (this.seededRandom(u + 1) - 0.5) * 2, v = (this.seededRandom(u + 2) - 0.5) * 2;
                this.ctx.beginPath(), this.ctx.moveTo(c.x + w, c.y + v), this.ctx.lineTo(h.x + w, h.y + v), this.ctx.stroke();
              }
            }
            const m = Math.floor(h.x * 5 + h.y * 5 + i * 5);
            if (this.seededRandom(m) > 0.8) {
              this.ctx.globalAlpha = 0.4;
              for (let p = 0; p < 5; p++) {
                const u = m + p * 10;
                this.ctx.beginPath(), this.ctx.arc(
                  h.x + (this.seededRandom(u + 1) - 0.5) * 3,
                  h.y + (this.seededRandom(u + 2) - 0.5) * 3,
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
          for (let i = 1; i < e.length; i++) {
            const h = e[i], c = e[i - 1], r = this.calculateDynamicStrokeWidth(h, c, a, s), m = Math.floor(h.x * 50 + h.y * 50 + i);
            if (this.seededRandom(m) > 0.1) {
              if (this.ctx.lineWidth = r, this.ctx.globalAlpha = this.seededRandom(m + 1) > 0.2 ? 1 : 0.7, this.ctx.beginPath(), i < e.length - 1) {
                const u = e[i + 1], w = this.getControlPoint(h, c, u);
                this.ctx.moveTo(c.x, c.y), this.ctx.quadraticCurveTo(w.x, w.y, h.x, h.y);
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
          this.drawElegantStroke(e, n, s);
          break;
      }
  }
  /**
   * 绘制优雅笔迹 - 基于Fabric.js和Vue3-Signature-Pad的速度压力感应技术
   */
  drawElegantStroke(e, a, n) {
    if (e.length < 2)
      return;
    this.ctx.strokeStyle = a, this.ctx.fillStyle = a, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", this.ctx.globalCompositeOperation = "source-over";
    const s = this.preprocessPointsForVelocity(e, n);
    this.drawVelocityBasedPath(s), this.addVelocityBasedConnections(s);
  }
  /**
   * 预处理点数据，计算速度和动态线宽 - 基于Vue3-Signature-Pad算法
   */
  preprocessPointsForVelocity(e, a) {
    const n = [];
    for (let s = 0; s < e.length; s++) {
      const i = e[s];
      let h = 0, c = a;
      if (s > 0) {
        const m = e[s - 1], p = Math.sqrt(
          Math.pow(i.x - m.x, 2) + Math.pow(i.y - m.y, 2)
        ), u = Math.max(1, (i.time || 0) - (m.time || 0));
        h = p / u;
        const w = i.pressure || 0.5, v = Math.max(0.2, Math.min(3, 100 / Math.max(h, 1)));
        c = a * (0.3 + w * v * 1.4);
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
  drawVelocityBasedPath(e) {
    if (!(e.length < 2))
      for (let a = 1; a < e.length; a++) {
        const n = e[a], s = e[a - 1];
        this.drawVelocitySegment(s, n, s.smoothedWidth, n.smoothedWidth);
      }
  }
  /**
   * 绘制基于速度的单个线段 - 实现由粗到细的渐变
   */
  drawVelocitySegment(e, a, n, s) {
    const i = Math.sqrt(
      Math.pow(a.x - e.x, 2) + Math.pow(a.y - e.y, 2)
    ), h = Math.max(2, Math.min(10, Math.floor(i / 3)));
    this.ctx.beginPath();
    const c = [];
    for (let r = 0; r <= h; r++) {
      const m = r / h, p = this.smoothStep(m), u = e.x + (a.x - e.x) * p, w = e.y + (a.y - e.y) * p, v = n + (s - n) * p, M = a.x - e.x, R = a.y - e.y, P = Math.sqrt(M * M + R * R);
      if (P > 0) {
        const S = -R / P * v / 2, J = M / P * v / 2;
        r === 0 ? this.ctx.moveTo(u + S, w + J) : this.ctx.lineTo(u + S, w + J), c.push({ x: u - S, y: w - J });
      }
    }
    for (let r = c.length - 1; r >= 0; r--)
      this.ctx.lineTo(c[r].x, c[r].y);
    this.ctx.closePath(), this.ctx.fill();
  }
  /**
   * 基于速度变化的智能连接 - 优化连笔效果
   */
  addVelocityBasedConnections(e) {
    for (let a = 1; a < e.length - 1; a++) {
      const n = e[a - 1], s = e[a], i = e[a + 1], h = Math.abs(s.velocity - n.velocity), c = (s.velocity + n.velocity) / 2, r = Math.atan2(s.y - n.y, s.x - n.x), m = Math.atan2(i.y - s.y, i.x - s.x), p = Math.abs(m - r);
      if (h > c * 0.5 || p > 0.2) {
        const u = s.smoothedWidth * 0.4;
        this.ctx.beginPath(), this.ctx.arc(s.x, s.y, u, 0, Math.PI * 2), this.ctx.fill();
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
  getControlPoint(e, a, n) {
    const i = {
      length: Math.sqrt(Math.pow(n.x - a.x, 2) + Math.pow(n.y - a.y, 2)),
      angle: Math.atan2(n.y - a.y, n.x - a.x)
    }, h = i.angle + Math.PI, c = i.length * 0.2;
    return {
      x: e.x + Math.cos(h) * c,
      y: e.y + Math.sin(h) * c,
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
        const n = this.eventCallbacks.get(e), s = n.indexOf(a);
        s > -1 && n.splice(s, 1);
      } else
        this.eventCallbacks.delete(e);
  }
  /**
   * 触发事件
   */
  emit(e, ...a) {
    const n = this.eventCallbacks.get(e);
    n && n.forEach((s) => s(...a));
  }
  /**
   * 在离屏画布上绘制完整路径
   */
  drawCompletePathToOffscreen(e) {
    if (!this.offscreenCtx || e.points.length < 2)
      return;
    const a = this.ctx;
    this.ctx = this.offscreenCtx;
    const n = e.penStyle || this.options.penStyle || "pen";
    this.drawStyledStrokeForReplay(e.points, n, e.strokeColor, e.strokeWidth), this.ctx = a;
  }
  /**
   * 在离屏画布上绘制部分路径
   */
  drawPartialPathToOffscreen(e, a) {
    if (!this.offscreenCtx || e.points.length < 2)
      return;
    const n = e.startTime || 0, s = e.duration || 0, i = n + s * a, h = this.getPointsUpToTime(e.points, n, i);
    if (h.length < 2)
      return;
    const c = this.ctx;
    this.ctx = this.offscreenCtx;
    const r = e.penStyle || this.options.penStyle || "pen";
    this.drawStyledStrokeForReplay(h, r, e.strokeColor, e.strokeWidth), this.ctx = c;
  }
  /**
   * 销毁控制器
   */
  destroy() {
    this.stop(), this.eventCallbacks.clear(), this.replayData = null, this.lastFrameImageBitmap && (this.lastFrameImageBitmap.close(), this.lastFrameImageBitmap = null);
  }
}
function yt(l) {
  const e = l.paths.map((r) => {
    const m = r.points.map((u, w) => {
      var M;
      let v;
      if (u.time && r.points[0].time)
        v = u.time - r.points[0].time;
      else if (w === 0)
        v = 0;
      else {
        const R = r.points[w - 1], S = Math.sqrt(
          Math.pow(u.x - R.x, 2) + Math.pow(u.y - R.y, 2)
        ) / 100 * 1e3;
        v = (((M = m[w - 1]) == null ? void 0 : M.relativeTime) || 0) + Math.max(S, 16);
      }
      return {
        ...u,
        relativeTime: v
      };
    }), p = m.length > 0 ? m[m.length - 1].relativeTime : 0;
    return {
      ...r,
      points: m,
      duration: p
    };
  }), a = [];
  for (let r = 0; r < e.length; r++) {
    const m = e[r];
    let p;
    if (r === 0)
      p = 0;
    else {
      const v = a[r - 1], M = vt(
        l.paths[r - 1].points,
        l.paths[r].points
      );
      p = v.endTime + M;
    }
    const u = p + m.duration, w = {
      ...m,
      startTime: p,
      endTime: u
    };
    console.log(`路径 ${r}: 开始时间=${p}, 结束时间=${u}, 持续时间=${m.duration}`), a.push(w);
  }
  const n = a.length > 0 ? a[a.length - 1].endTime : 0;
  console.log("回放数据生成完成:"), console.log("- 路径数量:", a.length), console.log("- 总时长:", n), console.log("- 路径详情:", a.map((r) => ({
    startTime: r.startTime,
    endTime: r.endTime,
    duration: r.duration,
    pointCount: r.points.length
  })));
  const s = a.reduce((r, m) => r + Ct(m.points), 0), i = n > 0 ? s / (n / 1e3) : 0, h = a.slice(1).map((r, m) => {
    const p = a[m];
    return r.startTime - p.endTime;
  }), c = h.length > 0 ? h.reduce((r, m) => r + m, 0) / h.length : 0;
  return {
    paths: a,
    totalDuration: n,
    speed: 1,
    metadata: {
      deviceType: xt(l),
      averageSpeed: i,
      totalDistance: s,
      averagePauseTime: c
    }
  };
}
function vt(l, e) {
  if (l.length === 0 || e.length === 0)
    return 200;
  const a = l[l.length - 1], n = e[0];
  if (a.time && n.time)
    return Math.max(n.time - a.time, 50);
  const s = Math.sqrt(
    Math.pow(n.x - a.x, 2) + Math.pow(n.y - a.y, 2)
  );
  return Math.min(Math.max(s * 2, 100), 1e3);
}
function xt(l) {
  const e = l.paths.reduce((i, h) => i + h.points.length, 0), a = l.paths.length;
  if (e === 0)
    return "touch";
  const n = e / a;
  return n > 20 ? "touch" : n < 10 ? "mouse" : l.paths.some(
    (i) => i.points.some((h) => h.pressure !== void 0)
  ) ? "pen" : "touch";
}
function Ct(l) {
  let e = 0;
  for (let a = 1; a < l.length; a++) {
    const n = l[a].x - l[a - 1].x, s = l[a].y - l[a - 1].y;
    e += Math.sqrt(n * n + s * s);
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
function wt(l) {
  return _e[l];
}
function Ut() {
  return Object.entries(_e).map(([l, e]) => ({
    key: l,
    config: e
  }));
}
function Mt(l, e) {
  const a = wt(l);
  return {
    strokeWidth: a.strokeWidth,
    smoothing: a.smoothing,
    pressure: a.pressure,
    lineCap: a.lineCap,
    lineJoin: a.lineJoin,
    strokeColor: e || a.recommendedColor || "#000000"
  };
}
const bt = ["width", "height"], Tt = {
  key: 1,
  class: "signature-toolbar"
}, kt = ["disabled"], St = ["disabled"], Pt = ["disabled"], Dt = {
  key: 2,
  class: "replay-controls"
}, Wt = { class: "replay-buttons" }, Rt = ["disabled"], It = { key: 0 }, Et = { key: 1 }, Ot = ["disabled"], _t = { class: "replay-progress" }, At = ["max", "value", "disabled"], Ft = { class: "time-display" }, Jt = { class: "replay-speed" }, qt = /* @__PURE__ */ lt({
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
  setup(l, { expose: e, emit: a }) {
    const n = l, s = a, i = _(), h = _(!1), c = _(null), r = _(j(0, 0)), m = _([]), p = _(-1), u = _(null), w = _(!1), v = _("idle"), M = _(0), R = _(0), P = E(() => typeof n.width == "number" ? n.width : 800), S = E(() => typeof n.height == "number" ? n.height : 300), J = E(() => ({
      position: "relative",
      display: "inline-block",
      width: typeof n.width == "string" ? n.width : `${n.width}px`,
      height: typeof n.height == "string" ? n.height : `${n.height}px`
    })), Fe = E(() => ({
      border: n.borderStyle,
      borderRadius: n.borderRadius,
      backgroundColor: n.backgroundColor,
      cursor: n.disabled ? "not-allowed" : "crosshair",
      display: "block",
      width: "100%",
      height: "100%"
    })), Je = E(() => ({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "#999",
      fontSize: "14px",
      pointerEvents: "none",
      userSelect: "none"
    })), qe = E(() => w.value ? !1 : n.placeholder && N(r.value)), le = E(() => p.value > 0), re = E(() => p.value < m.value.length - 1), he = E(() => w.value && u.value), A = E(() => !he.value && !n.disabled), $e = E(() => {
      var t;
      return he.value && ((t = n.replayOptions) == null ? void 0 : t.showControls) !== !1;
    }), I = E(() => {
      if (n.penStyle) {
        const t = Mt(n.penStyle, n.strokeColor);
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
    }), ce = () => {
      var t;
      return ((t = i.value) == null ? void 0 : t.getContext("2d")) || null;
    }, X = (t, o) => {
      const g = i.value, f = g.getBoundingClientRect(), d = g.width / f.width, y = g.height / f.height;
      return {
        x: (t - f.left) * d,
        y: (o - f.top) * y,
        time: Date.now()
      };
    }, ue = (t) => {
      if (!A.value)
        return;
      h.value = !0;
      const o = performance.now(), g = { ...t, time: o };
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
    }, G = (t, o, g, f) => {
      switch (g) {
        case "pen":
          return 1;
        case "brush":
          if (o) {
            const D = Math.sqrt(Math.pow(t.x - o.x, 2) + Math.pow(t.y - o.y, 2)), O = Math.max(1, (t.time || 0) - (o.time || 0)), F = D / O, H = Math.max(0.1, Math.min(3, 100 / Math.max(F, 1))), V = t.pressure || 0.5, Y = 0.8 + Math.random() * 0.4;
            return Math.max(1, Math.min(20, f * H * (0.3 + V * 1.4) * Y));
          }
          return f;
        case "marker":
          return 12;
        case "pencil":
          const d = t.pressure || 0.5, y = 0.9 + Math.random() * 0.2;
          return f * (0.7 + d * 0.6) * y;
        case "ballpoint":
          const x = t.pressure || 0.5;
          return f * (0.8 + x * 0.4);
        case "elegant":
          const b = t.pressure || 0.5;
          let C = 1;
          if (o) {
            const D = Math.sqrt(Math.pow(t.x - o.x, 2) + Math.pow(t.y - o.y, 2)), O = Math.max(1, (t.time || 0) - (o.time || 0)), F = D / O;
            C = Math.max(0.3, Math.min(2, 50 / Math.max(F, 1)));
          }
          const W = b * C;
          return f * (0.4 + W * 1.6);
        default:
          return f;
      }
    }, Q = (t, o, g) => {
      var f;
      if (!(o.length < 2))
        switch (t.strokeStyle = ((f = c.value) == null ? void 0 : f.strokeColor) || I.value.strokeColor, t.lineCap = I.value.lineCap || "round", t.lineJoin = I.value.lineJoin || "round", g) {
          case "pen":
            if (t.lineWidth = 1, t.lineCap = "butt", t.lineJoin = "miter", t.beginPath(), t.moveTo(o[0].x, o[0].y), o.length >= 3) {
              for (let d = 1; d < o.length - 1; d++) {
                const y = de(o[d], o[d - 1], o[d + 1]);
                t.quadraticCurveTo(y.x, y.y, o[d].x, o[d].y);
              }
              t.lineTo(o[o.length - 1].x, o[o.length - 1].y);
            } else
              for (let d = 1; d < o.length; d++)
                t.lineTo(o[d].x, o[d].y);
            t.stroke();
            break;
          case "brush":
            t.lineCap = "round", t.lineJoin = "round";
            for (let d = 1; d < o.length; d++) {
              const y = o[d], x = o[d - 1], b = G(y, x, g, I.value.strokeWidth), C = t.createLinearGradient(x.x, x.y, y.x, y.y);
              C.addColorStop(0, t.strokeStyle), C.addColorStop(1, t.strokeStyle), t.lineWidth = b, t.beginPath(), t.moveTo(x.x, x.y), t.lineTo(y.x, y.y), t.stroke(), b > 8 && Math.random() > 0.6 && (t.globalAlpha = 0.2, t.beginPath(), t.arc(y.x, y.y, b * 0.3, 0, Math.PI * 2), t.fill(), t.globalAlpha = 1);
            }
            break;
          case "marker":
            t.globalAlpha = 0.7, t.lineWidth = 12, t.lineCap = "square", t.lineJoin = "bevel", t.beginPath(), t.moveTo(o[0].x, o[0].y);
            for (let d = 1; d < o.length; d++)
              t.lineTo(o[d].x, o[d].y);
            t.stroke(), t.globalAlpha = 0.3, t.lineWidth = 16, t.beginPath(), t.moveTo(o[0].x, o[0].y);
            for (let d = 1; d < o.length; d++)
              t.lineTo(o[d].x, o[d].y);
            t.stroke(), t.globalAlpha = 1;
            break;
          case "pencil":
            t.lineCap = "round", t.lineJoin = "round";
            for (let d = 1; d < o.length; d++) {
              const y = o[d], x = o[d - 1], b = G(y, x, g, I.value.strokeWidth);
              t.lineWidth = b, t.globalAlpha = 0.8, t.beginPath(), t.moveTo(x.x, x.y), t.lineTo(y.x, y.y), t.stroke();
              for (let C = 0; C < 3; C++)
                if (Math.random() > 0.5) {
                  t.globalAlpha = 0.2, t.lineWidth = b * 0.3;
                  const W = (Math.random() - 0.5) * 2, D = (Math.random() - 0.5) * 2;
                  t.beginPath(), t.moveTo(x.x + W, x.y + D), t.lineTo(y.x + W, y.y + D), t.stroke();
                }
              if (Math.random() > 0.8) {
                t.globalAlpha = 0.4;
                for (let C = 0; C < 5; C++)
                  t.beginPath(), t.arc(
                    y.x + (Math.random() - 0.5) * 3,
                    y.y + (Math.random() - 0.5) * 3,
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
            for (let d = 1; d < o.length; d++) {
              const y = o[d], x = o[d - 1], b = G(y, x, g, I.value.strokeWidth);
              if (Math.random() > 0.1) {
                if (t.lineWidth = b, t.globalAlpha = Math.random() > 0.2 ? 1 : 0.7, t.beginPath(), I.value.smoothing && d < o.length - 1) {
                  const C = o[d + 1], W = de(y, x, C);
                  t.moveTo(x.x, x.y), t.quadraticCurveTo(W.x, W.y, y.x, y.y);
                } else
                  t.moveTo(x.x, x.y), t.lineTo(y.x, y.y);
                t.stroke();
              }
              Math.random() > 0.95 && (t.globalAlpha = 0.8, t.beginPath(), t.arc(y.x, y.y, b * 0.8, 0, Math.PI * 2), t.fill());
            }
            t.globalAlpha = 1;
            break;
          case "elegant":
            Be(t, o);
            break;
        }
    }, ze = () => {
      if (!c.value || c.value.points.length < 2)
        return;
      const t = ce();
      if (!t)
        return;
      const o = c.value.points, g = o.length, f = n.penStyle || "pen";
      if (g === 2)
        Q(t, o, f);
      else if (g >= 3) {
        const d = o.slice(-3);
        Q(t, d, f);
      }
    }, Be = (t, o) => {
      var f, d;
      if (o.length < 2)
        return;
      t.strokeStyle = ((f = c.value) == null ? void 0 : f.strokeColor) || I.value.strokeColor, t.fillStyle = ((d = c.value) == null ? void 0 : d.strokeColor) || I.value.strokeColor, t.lineCap = "round", t.lineJoin = "round", t.globalCompositeOperation = "source-over";
      const g = Ve(o, I.value.strokeWidth);
      Ye(t, g), Le(t, g);
    }, Ve = (t, o) => {
      const g = [];
      for (let f = 0; f < t.length; f++) {
        const d = t[f];
        let y = 0, x = o;
        if (f > 0) {
          const C = t[f - 1], W = Math.sqrt(
            Math.pow(d.x - C.x, 2) + Math.pow(d.y - C.y, 2)
          ), D = Math.max(1, (d.time || 0) - (C.time || 0));
          y = W / D;
          const O = d.pressure || 0.5, F = Math.max(0.2, Math.min(3, 100 / Math.max(y, 1)));
          x = o * (0.3 + O * F * 1.4);
        }
        let b = x;
        if (f > 0) {
          const C = g[f - 1].smoothedWidth;
          b = C + (x - C) * 0.3;
        }
        g.push({
          ...d,
          velocity: y,
          dynamicWidth: x,
          smoothedWidth: Math.max(0.5, Math.min(o * 3, b))
        });
      }
      return g;
    }, Ye = (t, o) => {
      if (!(o.length < 2))
        for (let g = 1; g < o.length; g++) {
          const f = o[g], d = o[g - 1];
          Xe(t, d, f, d.smoothedWidth, f.smoothedWidth);
        }
    }, Xe = (t, o, g, f, d) => {
      const y = Math.sqrt(
        Math.pow(g.x - o.x, 2) + Math.pow(g.y - o.y, 2)
      ), x = Math.max(2, Math.min(10, Math.floor(y / 3)));
      t.beginPath();
      const b = [];
      for (let C = 0; C <= x; C++) {
        const W = C / x, D = Ue(W), O = o.x + (g.x - o.x) * D, F = o.y + (g.y - o.y) * D, H = f + (d - f) * D, V = g.x - o.x, Y = g.y - o.y, Z = Math.sqrt(V * V + Y * Y);
        if (Z > 0) {
          const ee = -Y / Z * H / 2, te = V / Z * H / 2;
          C === 0 ? t.moveTo(O + ee, F + te) : t.lineTo(O + ee, F + te), b.push({ x: O - ee, y: F - te });
        }
      }
      for (let C = b.length - 1; C >= 0; C--)
        t.lineTo(b[C].x, b[C].y);
      t.closePath(), t.fill();
    }, Le = (t, o) => {
      for (let g = 1; g < o.length - 1; g++) {
        const f = o[g - 1], d = o[g], y = o[g + 1], x = Math.abs(d.velocity - f.velocity), b = (d.velocity + f.velocity) / 2, C = Math.atan2(d.y - f.y, d.x - f.x), W = Math.atan2(y.y - d.y, y.x - d.x), D = Math.abs(W - C);
        if (x > b * 0.5 || D > 0.2) {
          const O = d.smoothedWidth * 0.4;
          t.beginPath(), t.arc(d.x, d.y, O, 0, Math.PI * 2), t.fill();
        }
      }
    }, Ue = (t) => t * t * (3 - 2 * t), de = (t, o, g) => {
      const d = {
        length: Math.sqrt(Math.pow(g.x - o.x, 2) + Math.pow(g.y - o.y, 2)),
        angle: Math.atan2(g.y - o.y, g.x - o.x)
      }, y = d.angle + Math.PI, x = d.length * 0.2;
      return {
        x: t.x + Math.cos(y) * x,
        y: t.y + Math.sin(y) * x,
        time: t.time || 0
      };
    }, He = (t, o) => {
      if (o.points.length < 2)
        return;
      const g = o.penStyle || n.penStyle || "pen", f = c.value;
      c.value = o, Q(t, o.points, g), c.value = f;
    }, me = (t) => {
      if (!h.value || !c.value || !A.value)
        return;
      const o = performance.now(), g = { ...t, time: o };
      c.value.points.push(g), c.value.startTime && (c.value.endTime = o, c.value.duration = o - c.value.startTime), ze(), ye(), s("signature-drawing", r.value);
    }, ge = () => {
      if (!(!h.value || !c.value)) {
        if (h.value = !1, c.value.points.length > 0) {
          const t = c.value.points[c.value.points.length - 1];
          t.time && c.value.startTime && (c.value.endTime = t.time, c.value.duration = t.time - c.value.startTime);
        }
        r.value.paths.push(c.value), r.value.isEmpty = !1, r.value.timestamp = Date.now(), L(), q(), c.value = null, s("signature-end", r.value);
      }
    }, Ne = (t) => {
      t.preventDefault();
      const o = X(t.clientX, t.clientY);
      ue(o);
    }, je = (t) => {
      if (t.preventDefault(), !h.value)
        return;
      const o = X(t.clientX, t.clientY);
      me(o);
    }, pe = (t) => {
      t.preventDefault(), ge();
    }, Ge = (t) => {
      if (t.preventDefault(), t.touches.length !== 1)
        return;
      const o = t.touches[0], g = X(o.clientX, o.clientY);
      ue(g);
    }, Qe = (t) => {
      if (t.preventDefault(), t.touches.length !== 1 || !h.value)
        return;
      const o = t.touches[0], g = X(o.clientX, o.clientY);
      me(g);
    }, fe = (t) => {
      t.preventDefault(), ge();
    }, ye = () => {
      r.value.canvasSize = {
        width: P.value,
        height: S.value
      }, r.value.isEmpty = N(r.value);
    }, L = () => {
      m.value = m.value.slice(0, p.value + 1), m.value.push(B(r.value)), p.value = m.value.length - 1;
      const t = 50;
      m.value.length > t && (m.value = m.value.slice(-t), p.value = m.value.length - 1);
    }, q = () => {
      const t = ce();
      t && (t.clearRect(0, 0, P.value, S.value), n.backgroundColor && n.backgroundColor !== "transparent" && (t.fillStyle = n.backgroundColor, t.fillRect(0, 0, P.value, S.value)), r.value.paths.forEach((o) => {
        o.points.length > 0 && He(t, o);
      }));
    }, U = () => {
      if (console.log("初始化回放控制器"), console.log("canvas引用是否存在:", !!i.value), !i.value) {
        console.error("canvas引用不存在，无法初始化回放控制器");
        return;
      }
      u.value && (console.log("销毁现有回放控制器"), u.value.destroy()), console.log("创建新的回放控制器"), u.value = new ft(i.value), console.log("回放控制器创建成功:", !!u.value), u.value.on("replay-start", () => {
        v.value = "playing", s("replay-start");
      }), u.value.on("replay-progress", (t, o) => {
        M.value = t, R.value = o, s("replay-progress", t, o);
      }), u.value.on("replay-pause", () => {
        v.value = "paused", s("replay-pause");
      }), u.value.on("replay-resume", () => {
        v.value = "playing", s("replay-resume");
      }), u.value.on("replay-stop", () => {
        v.value = "stopped", s("replay-stop");
      }), u.value.on("replay-complete", () => {
        v.value = "completed", s("replay-complete");
      }), u.value.on("replay-path-start", (t, o) => {
        s("replay-path-start", t, o);
      }), u.value.on("replay-path-end", (t, o) => {
        s("replay-path-end", t, o);
      }), u.value.on("replay-speed-change", (t) => {
        s("replay-speed-change", t);
      });
    }, ve = (t, o) => {
      if (u.value || U(), u.value) {
        w.value = !0;
        const g = {
          ...o,
          drawOptions: I.value,
          penStyle: n.penStyle
        };
        u.value.setReplayData(t, g), console.log("startReplay调用，自动播放:", o == null ? void 0 : o.autoPlay), (o == null ? void 0 : o.autoPlay) === !0 && u.value.play();
      }
    }, xe = (t) => {
      w.value = t, !t && u.value && (u.value.stop(), q());
    }, Ke = () => N(r.value) ? null : yt(r.value), Ce = () => {
      console.log("play方法被调用"), console.log("回放控制器是否存在:", !!u.value), u.value || (console.log("回放控制器不存在，尝试初始化"), U()), u.value ? (console.log("调用回放控制器的play方法"), u.value.play()) : console.error("回放控制器初始化失败，无法播放");
    }, we = () => {
      var t;
      (t = u.value) == null || t.pause();
    }, Me = () => {
      var t;
      (t = u.value) == null || t.stop();
    }, be = (t) => {
      var o;
      (o = u.value) == null || o.seek(t);
    }, Te = (t) => {
      var o;
      (o = u.value) == null || o.setSpeed(t);
    }, Ze = () => {
      var t;
      return ((t = u.value) == null ? void 0 : t.getState()) || "idle";
    }, et = () => {
      var t;
      return ((t = u.value) == null ? void 0 : t.getCurrentTime()) || 0;
    }, K = () => {
      var t;
      return ((t = u.value) == null ? void 0 : t.getTotalDuration()) || 0;
    }, tt = () => {
      var t;
      return ((t = u.value) == null ? void 0 : t.getProgress()) || 0;
    }, ke = (t) => {
      const o = Math.floor(t / 1e3), g = Math.floor(o / 60), f = o % 60;
      return `${g}:${f.toString().padStart(2, "0")}`;
    }, Se = () => {
      A.value && (r.value = j(P.value, S.value), q(), L(), s("signature-clear"));
    }, Pe = () => {
      !le.value || !A.value || (p.value--, r.value = B(m.value[p.value]), q(), s("signature-undo", r.value));
    }, De = () => {
      !re.value || !A.value || (p.value++, r.value = B(m.value[p.value]), q(), s("signature-redo", r.value));
    }, We = (t) => {
      const o = i.value;
      return gt(o, r.value, t);
    }, Re = () => N(r.value), Ie = async (t) => {
      if (!A.value)
        return;
      const o = i.value;
      await pt(o, t), r.value = j(P.value, S.value), r.value.isEmpty = !1, L();
    }, at = () => B(r.value), nt = (t) => {
      A.value && (r.value = B(t), q(), L());
    }, Ee = (t, o) => {
      const g = t || P.value, f = o || S.value, d = We({ format: "png" });
      ne(() => {
        const y = i.value;
        y.width = g, y.height = f, Re() || Ie(d), ye();
      });
    }, ot = () => {
      const t = i.value;
      t.width = P.value, t.height = S.value, r.value = j(P.value, S.value), m.value = [B(r.value)], p.value = 0, q();
    };
    return ae([() => n.width, () => n.height], () => {
      ne(() => {
        i.value && Ee();
      });
    }), ae(() => n.replayMode, (t) => {
      t !== void 0 && xe(t);
    }), ae(() => n.replayData, (t) => {
      if (console.log("watch监听到回放数据变化:", t), console.log("当前回放模式:", n.replayMode), console.log("回放控制器是否存在:", !!u.value), t && n.replayMode)
        if (u.value || (console.log("回放控制器未初始化，先初始化"), U()), u.value) {
          console.log("开始设置回放数据到控制器");
          const o = {
            ...n.replayOptions,
            drawOptions: I.value,
            penStyle: n.penStyle
          };
          u.value.setReplayData(t, o), console.log("回放数据已更新:", t);
        } else
          console.error("回放控制器初始化失败");
      else
        t || console.log("回放数据为空，跳过设置"), n.replayMode || console.log("不在回放模式，跳过设置");
    }, { immediate: !0 }), rt(() => {
      ne(() => {
        ot(), U(), n.replayMode && n.replayData && ve(n.replayData, n.replayOptions);
      });
    }), ht(() => {
      u.value && (u.value.destroy(), u.value = null);
    }), e({
      clear: Se,
      undo: Pe,
      redo: De,
      save: We,
      isEmpty: Re,
      fromDataURL: Ie,
      getSignatureData: at,
      setSignatureData: nt,
      resize: Ee,
      // 回放相关方法
      startReplay: ve,
      getReplayData: Ke,
      setReplayMode: xe,
      play: Ce,
      pause: we,
      stop: Me,
      seek: be,
      setSpeed: Te,
      getState: Ze,
      getCurrentTime: et,
      getTotalDuration: K,
      getProgress: tt
    }), (t, o) => ($(), z("div", {
      class: "electronic-signature",
      style: oe(J.value)
    }, [
      T("canvas", {
        ref_key: "canvasRef",
        ref: i,
        width: P.value,
        height: S.value,
        style: oe(Fe.value),
        onMousedown: Ne,
        onMousemove: je,
        onMouseup: pe,
        onMouseleave: pe,
        onTouchstart: Ge,
        onTouchmove: Qe,
        onTouchend: fe,
        onTouchcancel: fe
      }, null, 44, bt),
      qe.value ? ($(), z("div", {
        key: 0,
        class: "signature-placeholder",
        style: oe(Je.value)
      }, se(t.placeholder), 5)) : ie("", !0),
      t.showToolbar ? ($(), z("div", Tt, [
        T("button", {
          onClick: Se,
          disabled: !A.value
        }, "清除", 8, kt),
        T("button", {
          onClick: Pe,
          disabled: !A.value || !le.value
        }, "撤销", 8, St),
        T("button", {
          onClick: De,
          disabled: !A.value || !re.value
        }, "重做", 8, Pt)
      ])) : ie("", !0),
      $e.value ? ($(), z("div", Dt, [
        T("div", Wt, [
          T("button", {
            onClick: o[0] || (o[0] = (g) => v.value === "playing" ? we() : Ce()),
            disabled: v.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            v.value === "playing" ? ($(), z("span", It, "⏸️")) : ($(), z("span", Et, "▶️"))
          ], 8, Rt),
          T("button", {
            onClick: o[1] || (o[1] = (g) => Me()),
            disabled: v.value === "idle",
            class: "replay-btn stop-btn"
          }, " ⏹️ ", 8, Ot)
        ]),
        T("div", _t, [
          T("input", {
            type: "range",
            min: "0",
            max: K(),
            value: R.value,
            onInput: o[2] || (o[2] = (g) => be(Number(g.target.value))),
            class: "progress-slider",
            disabled: v.value === "idle"
          }, null, 40, At),
          T("div", Ft, [
            T("span", null, se(ke(R.value)), 1),
            o[4] || (o[4] = T("span", null, "/", -1)),
            T("span", null, se(ke(K())), 1)
          ])
        ]),
        T("div", Jt, [
          o[6] || (o[6] = T("label", null, "速度:", -1)),
          T("select", {
            onChange: o[3] || (o[3] = (g) => Te(Number(g.target.value))),
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
      ])) : ie("", !0)
    ], 4));
  }
});
const $t = (l, e) => {
  const a = l.__vccOpts || l;
  for (const [n, s] of e)
    a[n] = s;
  return a;
}, Ae = /* @__PURE__ */ $t(qt, [["__scopeId", "data-v-20a8ec18"]]);
function zt() {
  return window.devicePixelRatio || 1;
}
function Ht(l) {
  const e = l.getContext("2d"), a = zt(), n = l.clientWidth, s = l.clientHeight;
  return l.width = n * a, l.height = s * a, e.scale(a, a), l.style.width = n + "px", l.style.height = s + "px", e;
}
function Bt(l) {
  if (l.paths.length === 0)
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0
    };
  let e = 1 / 0, a = 1 / 0, n = -1 / 0, s = -1 / 0;
  return l.paths.forEach((i) => {
    i.points.forEach((h) => {
      e = Math.min(e, h.x), a = Math.min(a, h.y), n = Math.max(n, h.x), s = Math.max(s, h.y);
    });
  }), {
    minX: e,
    minY: a,
    maxX: n,
    maxY: s,
    width: n - e,
    height: s - a
  };
}
function Nt(l, e, a = 10) {
  const n = Bt(e);
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
function jt(l, e, a, n = !0) {
  const s = document.createElement("canvas"), i = s.getContext("2d");
  let h = e, c = a;
  if (n) {
    const r = l.width / l.height, m = e / a;
    r > m ? c = e / r : h = a * r;
  }
  return s.width = h, s.height = c, i.imageSmoothingEnabled = !0, i.imageSmoothingQuality = "high", i.drawImage(l, 0, 0, h, c), s;
}
function Gt(l, e, a = {}) {
  const {
    fontSize: n = 12,
    fontFamily: s = "Arial",
    color: i = "#999",
    opacity: h = 0.5,
    position: c = "bottom-right"
  } = a, r = document.createElement("canvas"), m = r.getContext("2d");
  r.width = l.width, r.height = l.height, m.drawImage(l, 0, 0), m.font = `${n}px ${s}`, m.fillStyle = i, m.globalAlpha = h;
  const u = m.measureText(e).width, w = n;
  let v, M;
  switch (c) {
    case "top-left":
      v = 10, M = w + 10;
      break;
    case "top-right":
      v = l.width - u - 10, M = w + 10;
      break;
    case "bottom-left":
      v = 10, M = l.height - 10;
      break;
    case "bottom-right":
      v = l.width - u - 10, M = l.height - 10;
      break;
    case "center":
      v = (l.width - u) / 2, M = (l.height + w) / 2;
      break;
    default:
      v = l.width - u - 10, M = l.height - 10;
  }
  return m.fillText(e, v, M), m.globalAlpha = 1, r;
}
function Qt(l) {
  const e = document.createElement("canvas"), a = e.getContext("2d");
  e.width = l.width, e.height = l.height, a.drawImage(l, 0, 0);
  const n = a.getImageData(0, 0, l.width, l.height), s = n.data;
  for (let i = 0; i < s.length; i += 4) {
    const h = s[i] * 0.299 + s[i + 1] * 0.587 + s[i + 2] * 0.114;
    s[i] = h, s[i + 1] = h, s[i + 2] = h;
  }
  return a.putImageData(n, 0, 0), e;
}
const Vt = (l) => {
  l.component("ElectronicSignature", Ae);
}, Kt = {
  install: Vt,
  ElectronicSignature: Ae
}, Zt = "1.0.0";
export {
  Ae as ElectronicSignature,
  _e as PEN_STYLE_CONFIGS,
  ft as SignatureReplayController,
  Gt as addWatermark,
  dt as calculateStrokeWidth,
  B as cloneSignatureData,
  Qt as convertToGrayscale,
  Mt as createDrawOptionsFromPenStyle,
  j as createEmptySignatureData,
  yt as createReplayData,
  Nt as cropSignature,
  Kt as default,
  Lt as drawSmoothPath,
  gt as exportSignature,
  Ut as getAllPenStyles,
  ct as getAngle,
  ut as getControlPoint,
  zt as getDevicePixelRatio,
  Oe as getDistance,
  wt as getPenStyleConfig,
  Bt as getSignatureBounds,
  N as isSignatureEmpty,
  pt as loadImageToCanvas,
  jt as resizeSignature,
  Ht as setupHighDPICanvas,
  mt as signatureToSVG,
  Zt as version
};
