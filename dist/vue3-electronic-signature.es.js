var lt = Object.defineProperty;
var ht = (r, e, a) => e in r ? lt(r, e, { enumerable: !0, configurable: !0, writable: !0, value: a }) : r[e] = a;
var M = (r, e, a) => (ht(r, typeof e != "symbol" ? e + "" : e, a), a);
import { defineComponent as ct, ref as W, computed as R, watch as se, nextTick as oe, onMounted as ut, onUnmounted as dt, openBlock as $, createElementBlock as z, normalizeStyle as ie, createElementVNode as b, toDisplayString as re, createCommentVNode as le } from "vue";
function _e(r, e) {
  return Math.sqrt(
    Math.pow(e.x - r.x, 2) + Math.pow(e.y - r.y, 2)
  );
}
function mt(r, e) {
  return Math.atan2(e.y - r.y, e.x - r.x);
}
function pt(r, e, a, s) {
  const o = e || r, i = a || r, c = 0.2, h = mt(o, i) * (s ? 1 : -1), l = _e(o, i) * c;
  return {
    x: r.x + Math.cos(h) * l,
    y: r.y + Math.sin(h) * l,
    time: r.time
  };
}
function gt(r, e, a) {
  if (!a.pressure.enabled)
    return a.strokeWidth;
  const s = _e(r, e), o = e.time - r.time, i = o > 0 ? s / o : 0, c = Math.max(0.1, Math.min(1, 1 - i * 0.01)), { min: h, max: l } = a.pressure;
  return h + (l - h) * c;
}
function jt(r, e, a) {
  if (e.length < 2)
    return;
  if (r.strokeStyle = a.strokeColor, r.lineCap = "round", r.lineJoin = "round", !a.smoothing || e.length < 3) {
    r.beginPath(), r.lineWidth = a.strokeWidth, r.moveTo(e[0].x, e[0].y);
    for (let o = 1; o < e.length; o++)
      r.lineTo(e[o].x, e[o].y);
    r.stroke();
    return;
  }
  r.beginPath(), r.moveTo(e[0].x, e[0].y);
  for (let o = 1; o < e.length - 1; o++) {
    const i = e[o], c = e[o + 1];
    a.pressure.enabled ? r.lineWidth = gt(e[o - 1], i, a) : r.lineWidth = a.strokeWidth;
    const h = pt(i, e[o - 1], c);
    r.quadraticCurveTo(h.x, h.y, i.x, i.y);
  }
  const s = e[e.length - 1];
  r.lineTo(s.x, s.y), r.stroke();
}
function ft(r) {
  const { canvasSize: e, paths: a } = r;
  let s = `<svg width="${e.width}" height="${e.height}" xmlns="http://www.w3.org/2000/svg">`;
  return a.forEach((o) => {
    if (o.points.length < 2)
      return;
    let i = `M ${o.points[0].x} ${o.points[0].y}`;
    for (let c = 1; c < o.points.length; c++)
      i += ` L ${o.points[c].x} ${o.points[c].y}`;
    s += `<path d="${i}" stroke="${o.strokeColor}" stroke-width="${o.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), s += "</svg>", s;
}
function yt(r, e, a = { format: "png" }) {
  const { format: s, quality: o = 0.9, size: i, backgroundColor: c } = a;
  if (s === "svg")
    return ft(e);
  const h = document.createElement("canvas"), l = h.getContext("2d");
  if (i) {
    h.width = i.width, h.height = i.height;
    const u = i.width / r.width, g = i.height / r.height;
    l.scale(u, g);
  } else
    h.width = r.width, h.height = r.height;
  switch (c && c !== "transparent" && (l.fillStyle = c, l.fillRect(0, 0, h.width, h.height)), l.drawImage(r, 0, 0), s) {
    case "jpeg":
      return h.toDataURL("image/jpeg", o);
    case "base64":
      return h.toDataURL("image/png").split(",")[1];
    case "png":
    default:
      return h.toDataURL("image/png");
  }
}
function vt(r, e) {
  return new Promise((a, s) => {
    const o = new Image();
    o.onload = () => {
      const i = r.getContext("2d");
      i.clearRect(0, 0, r.width, r.height), i.drawImage(o, 0, 0, r.width, r.height), a();
    }, o.onerror = s, o.src = e;
  });
}
function N(r) {
  return r.paths.length === 0 || r.paths.every((e) => e.points.length === 0);
}
function j(r, e) {
  return {
    paths: [],
    canvasSize: { width: r, height: e },
    timestamp: Date.now(),
    isEmpty: !0
  };
}
function B(r) {
  return JSON.parse(JSON.stringify(r));
}
class xt {
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
      const o = Math.pow(2, 32);
      return (1664525 * e + 1013904223) % o / o;
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
    const a = this.offscreenCanvas, s = this.offscreenCtx;
    s.globalCompositeOperation = "copy", s.fillStyle = "transparent", s.fillRect(0, 0, a.width, a.height), s.globalCompositeOperation = "source-over";
    let o = !1;
    for (let i = 0; i < this.replayData.paths.length; i++) {
      const c = this.replayData.paths[i], h = c.startTime || 0, l = c.endTime || h + (c.duration || 0);
      if (e < h)
        break;
      if (e >= l) {
        this.drawCompletePathToOffscreen(c), !o && Math.abs(e - l) < 32 && this.emit("replay-path-end", i, c);
        continue;
      }
      o = !0;
      const u = Math.max(0, Math.min(1, (e - h) / Math.max(l - h, 1)));
      u > 0 && Math.abs(e - h) < 32 && this.emit("replay-path-start", i, c), this.drawPartialPathToOffscreen(c, u);
      break;
    }
  }
  /**
   * 获取指定时间内的所有点
   */
  getPointsUpToTime(e, a, s) {
    const o = [];
    for (let i = 0; i < e.length; i++) {
      const c = e[i], h = a + (c.relativeTime || i * 50);
      if (h <= s)
        o.push(c);
      else {
        if (i > 0) {
          const l = e[i - 1], u = a + (l.relativeTime || (i - 1) * 50);
          if (u <= s) {
            const g = (s - u) / (h - u), v = {
              x: l.x + (c.x - l.x) * g,
              y: l.y + (c.y - l.y) * g,
              time: s,
              pressure: l.pressure ? l.pressure + (c.pressure || l.pressure - l.pressure) * g : c.pressure
            };
            o.push(v);
          }
        }
        break;
      }
    }
    return o;
  }
  /**
   * 根据笔迹样式计算动态线宽（与录制时一致）
   */
  calculateDynamicStrokeWidth(e, a, s, o) {
    switch (s) {
      case "pen":
        return 1;
      case "brush":
        if (a) {
          const p = Math.sqrt(Math.pow(e.x - a.x, 2) + Math.pow(e.y - a.y, 2)), x = Math.max(1, (e.time || 0) - (a.time || 0)), C = p / x, I = Math.max(0.1, Math.min(3, 100 / Math.max(C, 1))), E = e.pressure || 0.5, k = Math.floor(e.x * 1e3 + e.y * 1e3 + (e.time || 0)), S = 0.8 + this.seededRandom(k) * 0.4;
          return Math.max(1, Math.min(20, o * I * (0.3 + E * 1.4) * S));
        }
        return o;
      case "marker":
        return 12;
      case "pencil":
        const i = e.pressure || 0.5, c = Math.floor(e.x * 1e3 + e.y * 1e3 + (e.time || 0)), h = 0.9 + this.seededRandom(c + 1) * 0.2;
        return o * (0.7 + i * 0.6) * h;
      case "ballpoint":
        const l = e.pressure || 0.5;
        return o * (0.8 + l * 0.4);
      case "elegant":
        const u = e.pressure || 0.5;
        let g = 1;
        if (a) {
          const p = Math.sqrt(Math.pow(e.x - a.x, 2) + Math.pow(e.y - a.y, 2)), x = Math.max(1, (e.time || 0) - (a.time || 0)), C = p / x;
          g = Math.max(0.3, Math.min(2, 50 / Math.max(C, 1)));
        }
        const v = u * g;
        return o * (0.4 + v * 1.6);
      default:
        return o;
    }
  }
  /**
   * 根据笔迹样式绘制线段（与录制时完全一致）
   */
  drawStyledStrokeForReplay(e, a, s, o) {
    if (!(e.length < 2))
      switch (this.ctx.strokeStyle = s, a) {
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
            const c = e[i], h = e[i - 1], l = this.calculateDynamicStrokeWidth(c, h, a, o);
            this.ctx.lineWidth = l, this.ctx.beginPath(), this.ctx.moveTo(h.x, h.y), this.ctx.lineTo(c.x, c.y), this.ctx.stroke();
            const u = Math.floor(c.x * 100 + c.y * 100 + i);
            l > 8 && this.seededRandom(u) > 0.6 && (this.ctx.globalAlpha = 0.2, this.ctx.beginPath(), this.ctx.arc(c.x, c.y, l * 0.3, 0, Math.PI * 2), this.ctx.fill(), this.ctx.globalAlpha = 1);
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
            const c = e[i], h = e[i - 1], l = this.calculateDynamicStrokeWidth(c, h, a, o);
            this.ctx.lineWidth = l, this.ctx.globalAlpha = 0.8, this.ctx.beginPath(), this.ctx.moveTo(h.x, h.y), this.ctx.lineTo(c.x, c.y), this.ctx.stroke();
            for (let g = 0; g < 3; g++) {
              const v = Math.floor(c.x * 10 + c.y * 10 + i * 10 + g);
              if (this.seededRandom(v) > 0.5) {
                this.ctx.globalAlpha = 0.2, this.ctx.lineWidth = l * 0.3;
                const p = (this.seededRandom(v + 1) - 0.5) * 2, x = (this.seededRandom(v + 2) - 0.5) * 2;
                this.ctx.beginPath(), this.ctx.moveTo(h.x + p, h.y + x), this.ctx.lineTo(c.x + p, c.y + x), this.ctx.stroke();
              }
            }
            const u = Math.floor(c.x * 5 + c.y * 5 + i * 5);
            if (this.seededRandom(u) > 0.8) {
              this.ctx.globalAlpha = 0.4;
              for (let g = 0; g < 5; g++) {
                const v = u + g * 10;
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
            const c = e[i], h = e[i - 1], l = this.calculateDynamicStrokeWidth(c, h, a, o);
            if (this.ctx.lineWidth = l, this.ctx.globalAlpha = 1, this.ctx.beginPath(), i < e.length - 1) {
              const u = e[i + 1], g = this.getControlPoint(c, h, u);
              this.ctx.moveTo(h.x, h.y), this.ctx.quadraticCurveTo(g.x, g.y, c.x, c.y);
            } else
              this.ctx.moveTo(h.x, h.y), this.ctx.lineTo(c.x, c.y);
            this.ctx.stroke();
          }
          this.ctx.globalAlpha = 1;
          break;
        case "elegant":
          this.drawElegantStroke(e, s, o);
          break;
      }
  }
  /**
   * 绘制优雅笔迹 - 基于Fabric.js和Vue3-Signature-Pad的速度压力感应技术
   */
  drawElegantStroke(e, a, s) {
    if (e.length < 2)
      return;
    this.ctx.strokeStyle = a, this.ctx.fillStyle = a, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", this.ctx.globalCompositeOperation = "source-over";
    const o = this.preprocessPointsForVelocity(e, s);
    this.drawVelocityBasedPath(o);
  }
  /**
   * 预处理点数据，计算速度和动态线宽 - 基于Vue3-Signature-Pad算法
   */
  preprocessPointsForVelocity(e, a) {
    const s = [];
    for (let o = 0; o < e.length; o++) {
      const i = e[o];
      let c = 0, h = a;
      if (o > 0) {
        const u = e[o - 1], g = Math.sqrt(
          Math.pow(i.x - u.x, 2) + Math.pow(i.y - u.y, 2)
        ), v = Math.max(1, (i.time || 0) - (u.time || 0));
        c = g / v;
        const p = i.pressure || 0.5, x = Math.max(0.1, Math.min(5, 150 / Math.max(c, 1)));
        h = a * (0.2 + p * x * 2);
      }
      let l = h;
      if (o > 0) {
        const u = s[o - 1].smoothedWidth;
        l = u + (h - u) * 0.5;
      }
      s.push({
        ...i,
        velocity: c,
        dynamicWidth: h,
        smoothedWidth: Math.max(0.3, Math.min(a * 5, l))
        // 扩大变化范围
      });
    }
    return s;
  }
  /**
   * 基于速度的路径绘制 - 使用Fabric.js的平滑算法
   */
  drawVelocityBasedPath(e) {
    if (!(e.length < 2))
      for (let a = 1; a < e.length; a++) {
        const s = e[a], o = e[a - 1];
        this.drawVelocitySegment(o, s, o.smoothedWidth, s.smoothedWidth);
      }
  }
  /**
   * 绘制基于速度的单个线段 - 实现由粗到细的渐变
   */
  drawVelocitySegment(e, a, s, o) {
    const i = Math.sqrt(
      Math.pow(a.x - e.x, 2) + Math.pow(a.y - e.y, 2)
    ), c = Math.max(2, Math.min(10, Math.floor(i / 3)));
    this.ctx.beginPath();
    const h = [];
    for (let l = 0; l <= c; l++) {
      const u = l / c, g = this.smoothStep(u), v = e.x + (a.x - e.x) * g, p = e.y + (a.y - e.y) * g, x = s + (o - s) * g, C = a.x - e.x, I = a.y - e.y, E = Math.sqrt(C * C + I * I);
      if (E > 0) {
        const k = -I / E * x / 2, S = C / E * x / 2;
        l === 0 ? this.ctx.moveTo(v + k, p + S) : this.ctx.lineTo(v + k, p + S), h.push({ x: v - k, y: p - S });
      }
    }
    for (let l = h.length - 1; l >= 0; l--)
      this.ctx.lineTo(h[l].x, h[l].y);
    this.ctx.closePath(), this.ctx.fill();
  }
  // 删除连接点函数 - 基于用户反馈，不需要黑色圆圈连接点
  /**
   * 平滑插值函数 - 基于Paper.js的平滑算法
   */
  smoothStep(e) {
    return e * e * (3 - 2 * e);
  }
  /**
   * 获取控制点（用于贝塞尔曲线平滑） - 与signature.ts中的实现一致
   */
  getControlPoint(e, a, s) {
    const i = {
      length: Math.sqrt(Math.pow(s.x - a.x, 2) + Math.pow(s.y - a.y, 2)),
      angle: Math.atan2(s.y - a.y, s.x - a.x)
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
        const s = this.eventCallbacks.get(e), o = s.indexOf(a);
        o > -1 && s.splice(o, 1);
      } else
        this.eventCallbacks.delete(e);
  }
  /**
   * 触发事件
   */
  emit(e, ...a) {
    const s = this.eventCallbacks.get(e);
    s && s.forEach((o) => o(...a));
  }
  /**
   * 在离屏画布上绘制完整路径
   */
  drawCompletePathToOffscreen(e) {
    if (!this.offscreenCtx || e.points.length < 2)
      return;
    const a = this.ctx;
    this.ctx = this.offscreenCtx;
    const s = e.penStyle || this.options.penStyle || "pen";
    this.drawStyledStrokeForReplay(e.points, s, e.strokeColor, e.strokeWidth), this.ctx = a;
  }
  /**
   * 在离屏画布上绘制部分路径
   */
  drawPartialPathToOffscreen(e, a) {
    if (!this.offscreenCtx || e.points.length < 2)
      return;
    const s = e.startTime || 0, o = e.duration || 0, i = s + o * a, c = this.getPointsUpToTime(e.points, s, i);
    if (c.length < 2)
      return;
    const h = this.ctx;
    this.ctx = this.offscreenCtx;
    const l = e.penStyle || this.options.penStyle || "pen";
    this.drawStyledStrokeForReplay(c, l, e.strokeColor, e.strokeWidth), this.ctx = h;
  }
  /**
   * 销毁控制器
   */
  destroy() {
    this.stop(), this.eventCallbacks.clear(), this.replayData = null, this.lastFrameImageBitmap && (this.lastFrameImageBitmap.close(), this.lastFrameImageBitmap = null);
  }
}
function Ct(r) {
  const e = r.paths.map((l) => {
    const u = l.points.map((v, p) => {
      var C;
      let x;
      if (v.time && l.points[0].time)
        x = v.time - l.points[0].time;
      else if (p === 0)
        x = 0;
      else {
        const I = l.points[p - 1], k = Math.sqrt(
          Math.pow(v.x - I.x, 2) + Math.pow(v.y - I.y, 2)
        ) / 100 * 1e3;
        x = (((C = u[p - 1]) == null ? void 0 : C.relativeTime) || 0) + Math.max(k, 16);
      }
      return {
        ...v,
        relativeTime: x
      };
    }), g = u.length > 0 ? u[u.length - 1].relativeTime : 0;
    return {
      ...l,
      points: u,
      duration: g
    };
  }), a = [];
  for (let l = 0; l < e.length; l++) {
    const u = e[l];
    let g;
    if (l === 0)
      g = 0;
    else {
      const x = a[l - 1], C = wt(
        r.paths[l - 1].points,
        r.paths[l].points
      );
      g = x.endTime + C;
    }
    const v = g + u.duration, p = {
      ...u,
      startTime: g,
      endTime: v
    };
    console.log(`路径 ${l}: 开始时间=${g}, 结束时间=${v}, 持续时间=${u.duration}`), a.push(p);
  }
  const s = a.length > 0 ? a[a.length - 1].endTime : 0;
  console.log("回放数据生成完成:"), console.log("- 路径数量:", a.length), console.log("- 总时长:", s), console.log("- 路径详情:", a.map((l) => ({
    startTime: l.startTime,
    endTime: l.endTime,
    duration: l.duration,
    pointCount: l.points.length
  })));
  const o = a.reduce((l, u) => l + bt(u.points), 0), i = s > 0 ? o / (s / 1e3) : 0, c = a.slice(1).map((l, u) => {
    const g = a[u];
    return l.startTime - g.endTime;
  }), h = c.length > 0 ? c.reduce((l, u) => l + u, 0) / c.length : 0;
  return {
    paths: a,
    totalDuration: s,
    speed: 1,
    metadata: {
      deviceType: Tt(r),
      averageSpeed: i,
      totalDistance: o,
      averagePauseTime: h
    }
  };
}
function wt(r, e) {
  if (r.length === 0 || e.length === 0)
    return 200;
  const a = r[r.length - 1], s = e[0];
  if (a.time && s.time)
    return Math.max(s.time - a.time, 50);
  const o = Math.sqrt(
    Math.pow(s.x - a.x, 2) + Math.pow(s.y - a.y, 2)
  );
  return Math.min(Math.max(o * 2, 100), 1e3);
}
function Tt(r) {
  const e = r.paths.reduce((i, c) => i + c.points.length, 0), a = r.paths.length;
  if (e === 0)
    return "touch";
  const s = e / a;
  return s > 20 ? "touch" : s < 10 ? "mouse" : r.paths.some(
    (i) => i.points.some((c) => c.pressure !== void 0)
  ) ? "pen" : "touch";
}
function bt(r) {
  let e = 0;
  for (let a = 1; a < r.length; a++) {
    const s = r[a].x - r[a - 1].x, o = r[a].y - r[a - 1].y;
    e += Math.sqrt(s * s + o * o);
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
function kt(r) {
  return Fe[r];
}
function Gt() {
  return Object.entries(Fe).map(([r, e]) => ({
    key: r,
    config: e
  }));
}
function Mt(r, e) {
  const a = kt(r);
  return {
    strokeWidth: a.strokeWidth,
    smoothing: a.smoothing,
    pressure: a.pressure,
    lineCap: a.lineCap,
    lineJoin: a.lineJoin,
    strokeColor: e || a.recommendedColor || "#000000"
  };
}
const St = ["width", "height"], Pt = {
  key: 1,
  class: "signature-toolbar"
}, Dt = ["disabled"], Wt = ["disabled"], Rt = ["disabled"], It = {
  key: 2,
  class: "replay-controls"
}, Et = { class: "replay-buttons" }, Ot = ["disabled"], _t = { key: 0 }, Ft = { key: 1 }, At = ["disabled"], Jt = { class: "replay-progress" }, qt = ["max", "value", "disabled"], $t = { class: "time-display" }, zt = { class: "replay-speed" }, Bt = 16, Yt = /* @__PURE__ */ ct({
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
  setup(r, { expose: e, emit: a }) {
    const s = r, o = a, i = W(), c = W(!1), h = W(null), l = W(j(0, 0)), u = W([]), g = W(-1), v = W(0), p = W(null), x = W(!1), C = W("idle"), I = W(0), E = W(0), k = R(() => typeof s.width == "number" ? s.width : 800), S = R(() => typeof s.height == "number" ? s.height : 300), Je = R(() => ({
      position: "relative",
      display: "inline-block",
      width: typeof s.width == "string" ? s.width : `${s.width}px`,
      height: typeof s.height == "string" ? s.height : `${s.height}px`
    })), qe = R(() => ({
      border: s.borderStyle,
      borderRadius: s.borderRadius,
      backgroundColor: s.backgroundColor,
      cursor: s.disabled ? "not-allowed" : "crosshair",
      display: "block",
      width: "100%",
      height: "100%"
    })), $e = R(() => ({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "#999",
      fontSize: "14px",
      pointerEvents: "none",
      userSelect: "none"
    })), ze = R(() => x.value ? !1 : s.placeholder && N(l.value)), he = R(() => g.value > 0), ce = R(() => g.value < u.value.length - 1), ue = R(() => x.value && p.value), O = R(() => !ue.value && !s.disabled), Be = R(() => {
      var t;
      return ue.value && ((t = s.replayOptions) == null ? void 0 : t.showControls) !== !1;
    }), D = R(() => {
      if (s.penStyle) {
        const t = Mt(s.penStyle, s.strokeColor);
        return {
          strokeColor: t.strokeColor,
          strokeWidth: s.strokeWidth || t.strokeWidth,
          smoothing: s.smoothing !== void 0 ? s.smoothing : t.smoothing,
          pressure: {
            enabled: s.pressureSensitive !== void 0 ? s.pressureSensitive : t.pressure.enabled,
            min: s.minStrokeWidth || t.pressure.min,
            max: s.maxStrokeWidth || t.pressure.max
          },
          lineCap: t.lineCap,
          lineJoin: t.lineJoin
        };
      }
      return {
        strokeColor: s.strokeColor || "#000000",
        strokeWidth: s.strokeWidth || 2,
        smoothing: s.smoothing !== void 0 ? s.smoothing : !0,
        pressure: {
          enabled: s.pressureSensitive || !1,
          min: s.minStrokeWidth || 1,
          max: s.maxStrokeWidth || 4
        },
        lineCap: "round",
        lineJoin: "round"
      };
    }), Y = () => {
      var t;
      return ((t = i.value) == null ? void 0 : t.getContext("2d")) || null;
    }, V = (t, n) => {
      const m = i.value, f = m.getBoundingClientRect(), d = m.width / f.width, y = m.height / f.height;
      return {
        x: (t - f.left) * d,
        y: (n - f.top) * y,
        time: Date.now()
      };
    }, de = (t) => {
      if (!O.value)
        return;
      c.value = !0;
      const n = performance.now(), m = { ...t, time: n };
      h.value = {
        points: [m],
        strokeColor: s.strokeColor,
        strokeWidth: s.strokeWidth,
        penStyle: s.penStyle,
        // 保存笔迹样式
        startTime: n,
        endTime: n,
        duration: 0
      }, o("signature-start");
    }, G = (t, n, m, f) => {
      switch (m) {
        case "pen":
          return 1;
        case "brush":
          if (n) {
            const _ = Math.sqrt(Math.pow(t.x - n.x, 2) + Math.pow(t.y - n.y, 2)), F = Math.max(1, (t.time || 0) - (n.time || 0)), A = _ / F, q = Math.max(0.1, Math.min(3, 100 / Math.max(A, 1))), H = t.pressure || 0.5;
            return Math.max(1, Math.min(20, f * q * (0.3 + H * 1.4)));
          }
          return f;
        case "marker":
          return 12;
        case "pencil":
          const d = t.pressure || 0.5;
          return f * (0.7 + d * 0.6);
        case "ballpoint":
          const y = t.pressure || 0.5;
          return f * (0.8 + y * 0.4);
        case "elegant":
          const w = t.pressure || 0.5;
          let P = 1;
          if (n) {
            const _ = Math.sqrt(Math.pow(t.x - n.x, 2) + Math.pow(t.y - n.y, 2)), F = Math.max(1, (t.time || 0) - (n.time || 0)), A = _ / F;
            P = Math.max(0.3, Math.min(2, 50 / Math.max(A, 1)));
          }
          const T = w * P;
          return f * (0.4 + T * 1.6);
        default:
          return f;
      }
    }, X = (t, n, m) => {
      var f;
      if (!(n.length < 2))
        switch (t.strokeStyle = ((f = h.value) == null ? void 0 : f.strokeColor) || D.value.strokeColor, t.lineCap = D.value.lineCap || "round", t.lineJoin = D.value.lineJoin || "round", m) {
          case "pen":
            if (t.lineWidth = 1, t.lineCap = "butt", t.lineJoin = "miter", t.beginPath(), t.moveTo(n[0].x, n[0].y), n.length >= 3) {
              for (let d = 1; d < n.length - 1; d++) {
                const y = me(n[d], n[d - 1], n[d + 1]);
                t.quadraticCurveTo(y.x, y.y, n[d].x, n[d].y);
              }
              t.lineTo(n[n.length - 1].x, n[n.length - 1].y);
            } else
              for (let d = 1; d < n.length; d++)
                t.lineTo(n[d].x, n[d].y);
            t.stroke();
            break;
          case "brush":
            t.lineCap = "round", t.lineJoin = "round";
            for (let d = 1; d < n.length; d++) {
              const y = n[d], w = n[d - 1], P = G(y, w, m, D.value.strokeWidth), T = t.createLinearGradient(w.x, w.y, y.x, y.y);
              T.addColorStop(0, t.strokeStyle), T.addColorStop(1, t.strokeStyle), t.lineWidth = P, t.beginPath(), t.moveTo(w.x, w.y), t.lineTo(y.x, y.y), t.stroke();
            }
            break;
          case "marker":
            t.globalAlpha = 0.7, t.lineWidth = 12, t.lineCap = "square", t.lineJoin = "bevel", t.beginPath(), t.moveTo(n[0].x, n[0].y);
            for (let d = 1; d < n.length; d++)
              t.lineTo(n[d].x, n[d].y);
            t.stroke(), t.globalAlpha = 0.3, t.lineWidth = 16, t.beginPath(), t.moveTo(n[0].x, n[0].y);
            for (let d = 1; d < n.length; d++)
              t.lineTo(n[d].x, n[d].y);
            t.stroke(), t.globalAlpha = 1;
            break;
          case "pencil":
            t.lineCap = "round", t.lineJoin = "round";
            for (let d = 1; d < n.length; d++) {
              const y = n[d], w = n[d - 1], P = G(y, w, m, D.value.strokeWidth);
              t.lineWidth = P, t.globalAlpha = 0.8, t.beginPath(), t.moveTo(w.x, w.y), t.lineTo(y.x, y.y), t.stroke();
            }
            t.globalAlpha = 1;
            break;
          case "ballpoint":
            t.lineCap = "round", t.lineJoin = "round";
            for (let d = 1; d < n.length; d++) {
              const y = n[d], w = n[d - 1], P = G(y, w, m, D.value.strokeWidth);
              if (t.lineWidth = P, t.globalAlpha = 1, t.beginPath(), D.value.smoothing && d < n.length - 1) {
                const T = n[d + 1], _ = me(y, w, T);
                t.moveTo(w.x, w.y), t.quadraticCurveTo(_.x, _.y, y.x, y.y);
              } else
                t.moveTo(w.x, w.y), t.lineTo(y.x, y.y);
              t.stroke();
            }
            t.globalAlpha = 1;
            break;
          case "elegant":
            Ue(t, n);
            break;
        }
    }, Ye = () => {
      if (!h.value || h.value.points.length < 2)
        return;
      const t = Y();
      if (!t)
        return;
      const n = h.value.penStyle || s.penStyle || "pen";
      if (n === "brush") {
        Xe();
        return;
      }
      if (n === "ballpoint") {
        Ve();
        return;
      }
      t.clearRect(0, 0, k.value, S.value);
      for (const m of l.value.paths)
        m !== h.value && Q(t, m);
      h.value.points.length >= 2 && Q(t, h.value);
    }, Xe = () => {
      if (!h.value || h.value.points.length < 2)
        return;
      const t = Y();
      if (!t)
        return;
      const n = h.value.points;
      if (n.length >= 2) {
        const f = n.slice(-3);
        f.length >= 2 && X(t, f, "brush");
      }
    }, Ve = () => {
      if (!h.value || h.value.points.length < 2)
        return;
      const t = Y();
      if (!t)
        return;
      const n = h.value.points;
      if (n.length >= 2) {
        const f = n.slice(-3);
        f.length >= 2 && X(t, f, "ballpoint");
      }
    }, Le = () => {
      if (!h.value || h.value.points.length < 2)
        return;
      const t = Y();
      if (!t)
        return;
      const n = h.value.points, m = n.length, f = s.penStyle || "pen";
      if (m === 2)
        X(t, n, f);
      else if (m >= 3) {
        const d = n.slice(-3);
        X(t, d, f);
      }
    }, Ue = (t, n) => {
      var f, d;
      if (n.length < 2)
        return;
      t.strokeStyle = ((f = h.value) == null ? void 0 : f.strokeColor) || D.value.strokeColor, t.fillStyle = ((d = h.value) == null ? void 0 : d.strokeColor) || D.value.strokeColor, t.lineCap = "round", t.lineJoin = "round", t.globalCompositeOperation = "source-over";
      const m = He(n, D.value.strokeWidth);
      Ne(t, m);
    }, He = (t, n) => {
      const m = [];
      for (let f = 0; f < t.length; f++) {
        const d = t[f];
        let y = 0, w = n;
        if (f > 0) {
          const T = t[f - 1], _ = Math.sqrt(
            Math.pow(d.x - T.x, 2) + Math.pow(d.y - T.y, 2)
          ), F = Math.max(1, (d.time || 0) - (T.time || 0));
          y = _ / F;
          const A = d.pressure || 0.5, q = Math.max(0.1, Math.min(5, 150 / Math.max(y, 1)));
          w = n * (0.2 + A * q * 2);
        }
        let P = w;
        if (f > 0) {
          const T = m[f - 1].smoothedWidth;
          P = T + (w - T) * 0.5;
        }
        m.push({
          ...d,
          velocity: y,
          dynamicWidth: w,
          smoothedWidth: Math.max(0.3, Math.min(n * 5, P))
          // 扩大变化范围
        });
      }
      return m;
    }, Ne = (t, n) => {
      if (!(n.length < 2))
        for (let m = 1; m < n.length; m++) {
          const f = n[m], d = n[m - 1];
          je(t, d, f, d.smoothedWidth, f.smoothedWidth);
        }
    }, je = (t, n, m, f, d) => {
      const y = Math.sqrt(
        Math.pow(m.x - n.x, 2) + Math.pow(m.y - n.y, 2)
      ), w = Math.max(2, Math.min(10, Math.floor(y / 3)));
      t.beginPath();
      const P = [];
      for (let T = 0; T <= w; T++) {
        const _ = T / w, F = Ge(_), A = n.x + (m.x - n.x) * F, q = n.y + (m.y - n.y) * F, H = f + (d - f) * F, Z = m.x - n.x, ee = m.y - n.y, te = Math.sqrt(Z * Z + ee * ee);
        if (te > 0) {
          const ne = -ee / te * H / 2, ae = Z / te * H / 2;
          T === 0 ? t.moveTo(A + ne, q + ae) : t.lineTo(A + ne, q + ae), P.push({ x: A - ne, y: q - ae });
        }
      }
      for (let T = P.length - 1; T >= 0; T--)
        t.lineTo(P[T].x, P[T].y);
      t.closePath(), t.fill();
    }, Ge = (t) => t * t * (3 - 2 * t), me = (t, n, m) => {
      const d = {
        length: Math.sqrt(Math.pow(m.x - n.x, 2) + Math.pow(m.y - n.y, 2)),
        angle: Math.atan2(m.y - n.y, m.x - n.x)
      }, y = d.angle + Math.PI, w = d.length * 0.2;
      return {
        x: t.x + Math.cos(y) * w,
        y: t.y + Math.sin(y) * w,
        time: t.time || 0
      };
    }, Q = (t, n) => {
      if (n.points.length < 2)
        return;
      const m = n.penStyle || s.penStyle || "pen", f = h.value;
      h.value = n, X(t, n.points, m), h.value = f;
    }, pe = (t) => {
      if (!c.value || !h.value || !O.value)
        return;
      const n = performance.now();
      if (n - v.value < Bt)
        return;
      v.value = n;
      const m = { ...t, time: n };
      h.value.points.push(m), h.value.startTime && (h.value.endTime = n, h.value.duration = n - h.value.startTime), s.realTimeMode ? Ye() : Le(), ve(), o("signature-drawing", l.value);
    }, ge = () => {
      if (!(!c.value || !h.value)) {
        if (c.value = !1, h.value.points.length > 0) {
          const t = h.value.points[h.value.points.length - 1];
          t.time && h.value.startTime && (h.value.endTime = t.time, h.value.duration = t.time - h.value.startTime);
        }
        l.value.paths.push(h.value), l.value.isEmpty = !1, l.value.timestamp = Date.now(), L(), J(), h.value = null, o("signature-end", l.value);
      }
    }, Qe = (t) => {
      t.preventDefault();
      const n = V(t.clientX, t.clientY);
      de(n);
    }, Ke = (t) => {
      if (t.preventDefault(), !c.value)
        return;
      const n = V(t.clientX, t.clientY);
      pe(n);
    }, fe = (t) => {
      t.preventDefault(), ge();
    }, Ze = (t) => {
      if (t.preventDefault(), t.touches.length !== 1)
        return;
      const n = t.touches[0], m = V(n.clientX, n.clientY);
      de(m);
    }, et = (t) => {
      if (t.preventDefault(), t.touches.length !== 1 || !c.value)
        return;
      const n = t.touches[0], m = V(n.clientX, n.clientY);
      pe(m);
    }, ye = (t) => {
      t.preventDefault(), ge();
    }, ve = () => {
      l.value.canvasSize = {
        width: k.value,
        height: S.value
      }, l.value.isEmpty = N(l.value);
    }, L = () => {
      u.value = u.value.slice(0, g.value + 1), u.value.push(B(l.value)), g.value = u.value.length - 1;
      const t = 50;
      u.value.length > t && (u.value = u.value.slice(-t), g.value = u.value.length - 1);
    }, J = () => {
      const t = Y();
      t && (t.clearRect(0, 0, k.value, S.value), s.backgroundColor && s.backgroundColor !== "transparent" && (t.fillStyle = s.backgroundColor, t.fillRect(0, 0, k.value, S.value)), l.value.paths.forEach((n) => {
        n.points.length > 0 && Q(t, n);
      }));
    }, U = () => {
      if (console.log("初始化回放控制器"), console.log("canvas引用是否存在:", !!i.value), !i.value) {
        console.error("canvas引用不存在，无法初始化回放控制器");
        return;
      }
      p.value && (console.log("销毁现有回放控制器"), p.value.destroy()), console.log("创建新的回放控制器"), p.value = new xt(i.value), console.log("回放控制器创建成功:", !!p.value), p.value.on("replay-start", () => {
        C.value = "playing", o("replay-start");
      }), p.value.on("replay-progress", (t, n) => {
        I.value = t, E.value = n, o("replay-progress", t, n);
      }), p.value.on("replay-pause", () => {
        C.value = "paused", o("replay-pause");
      }), p.value.on("replay-resume", () => {
        C.value = "playing", o("replay-resume");
      }), p.value.on("replay-stop", () => {
        C.value = "stopped", o("replay-stop");
      }), p.value.on("replay-complete", () => {
        C.value = "completed", o("replay-complete");
      }), p.value.on("replay-path-start", (t, n) => {
        o("replay-path-start", t, n);
      }), p.value.on("replay-path-end", (t, n) => {
        o("replay-path-end", t, n);
      }), p.value.on("replay-speed-change", (t) => {
        o("replay-speed-change", t);
      });
    }, xe = (t, n) => {
      if (p.value || U(), p.value) {
        x.value = !0;
        const m = {
          ...n,
          drawOptions: D.value,
          penStyle: s.penStyle
        };
        p.value.setReplayData(t, m), console.log("startReplay调用，自动播放:", n == null ? void 0 : n.autoPlay), (n == null ? void 0 : n.autoPlay) === !0 && p.value.play();
      }
    }, Ce = (t) => {
      x.value = t, !t && p.value && (p.value.stop(), J());
    }, tt = () => N(l.value) ? null : Ct(l.value), we = () => {
      console.log("play方法被调用"), console.log("回放控制器是否存在:", !!p.value), p.value || (console.log("回放控制器不存在，尝试初始化"), U()), p.value ? (console.log("调用回放控制器的play方法"), p.value.play()) : console.error("回放控制器初始化失败，无法播放");
    }, Te = () => {
      var t;
      (t = p.value) == null || t.pause();
    }, be = () => {
      var t;
      (t = p.value) == null || t.stop();
    }, ke = (t) => {
      var n;
      (n = p.value) == null || n.seek(t);
    }, Me = (t) => {
      var n;
      (n = p.value) == null || n.setSpeed(t);
    }, nt = () => {
      var t;
      return ((t = p.value) == null ? void 0 : t.getState()) || "idle";
    }, at = () => {
      var t;
      return ((t = p.value) == null ? void 0 : t.getCurrentTime()) || 0;
    }, K = () => {
      var t;
      return ((t = p.value) == null ? void 0 : t.getTotalDuration()) || 0;
    }, st = () => {
      var t;
      return ((t = p.value) == null ? void 0 : t.getProgress()) || 0;
    }, Se = (t) => {
      const n = Math.floor(t / 1e3), m = Math.floor(n / 60), f = n % 60;
      return `${m}:${f.toString().padStart(2, "0")}`;
    }, Pe = () => {
      O.value && (l.value = j(k.value, S.value), J(), L(), o("signature-clear"));
    }, De = () => {
      !he.value || !O.value || (g.value--, l.value = B(u.value[g.value]), J(), o("signature-undo", l.value));
    }, We = () => {
      !ce.value || !O.value || (g.value++, l.value = B(u.value[g.value]), J(), o("signature-redo", l.value));
    }, Re = (t) => {
      const n = i.value;
      return yt(n, l.value, t);
    }, Ie = () => N(l.value), Ee = async (t) => {
      if (!O.value)
        return;
      const n = i.value;
      await vt(n, t), l.value = j(k.value, S.value), l.value.isEmpty = !1, L();
    }, ot = () => B(l.value), it = (t) => {
      O.value && (l.value = B(t), J(), L());
    }, Oe = (t, n) => {
      const m = t || k.value, f = n || S.value, d = Re({ format: "png" });
      oe(() => {
        const y = i.value;
        y.width = m, y.height = f, Ie() || Ee(d), ve();
      });
    }, rt = () => {
      const t = i.value;
      t.width = k.value, t.height = S.value, l.value = j(k.value, S.value), u.value = [B(l.value)], g.value = 0, J();
    };
    return se([() => s.width, () => s.height], () => {
      oe(() => {
        i.value && Oe();
      });
    }), se(() => s.replayMode, (t) => {
      t !== void 0 && Ce(t);
    }), se(() => s.replayData, (t) => {
      if (console.log("watch监听到回放数据变化:", t), console.log("当前回放模式:", s.replayMode), console.log("回放控制器是否存在:", !!p.value), t && s.replayMode)
        if (p.value || (console.log("回放控制器未初始化，先初始化"), U()), p.value) {
          console.log("开始设置回放数据到控制器");
          const n = {
            ...s.replayOptions,
            drawOptions: D.value,
            penStyle: s.penStyle
          };
          p.value.setReplayData(t, n), console.log("回放数据已更新:", t);
        } else
          console.error("回放控制器初始化失败");
      else
        t || console.log("回放数据为空，跳过设置"), s.replayMode || console.log("不在回放模式，跳过设置");
    }, { immediate: !0 }), ut(() => {
      oe(() => {
        rt(), U(), s.replayMode && s.replayData && xe(s.replayData, s.replayOptions);
      });
    }), dt(() => {
      p.value && (p.value.destroy(), p.value = null);
    }), e({
      clear: Pe,
      undo: De,
      redo: We,
      save: Re,
      isEmpty: Ie,
      fromDataURL: Ee,
      getSignatureData: ot,
      setSignatureData: it,
      resize: Oe,
      // 回放相关方法
      startReplay: xe,
      getReplayData: tt,
      setReplayMode: Ce,
      play: we,
      pause: Te,
      stop: be,
      seek: ke,
      setSpeed: Me,
      getState: nt,
      getCurrentTime: at,
      getTotalDuration: K,
      getProgress: st
    }), (t, n) => ($(), z("div", {
      class: "electronic-signature",
      style: ie(Je.value)
    }, [
      b("canvas", {
        ref_key: "canvasRef",
        ref: i,
        width: k.value,
        height: S.value,
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
      ze.value ? ($(), z("div", {
        key: 0,
        class: "signature-placeholder",
        style: ie($e.value)
      }, re(t.placeholder), 5)) : le("", !0),
      t.showToolbar ? ($(), z("div", Pt, [
        b("button", {
          onClick: Pe,
          disabled: !O.value
        }, "清除", 8, Dt),
        b("button", {
          onClick: De,
          disabled: !O.value || !he.value
        }, "撤销", 8, Wt),
        b("button", {
          onClick: We,
          disabled: !O.value || !ce.value
        }, "重做", 8, Rt)
      ])) : le("", !0),
      Be.value ? ($(), z("div", It, [
        b("div", Et, [
          b("button", {
            onClick: n[0] || (n[0] = (m) => C.value === "playing" ? Te() : we()),
            disabled: C.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            C.value === "playing" ? ($(), z("span", _t, "⏸️")) : ($(), z("span", Ft, "▶️"))
          ], 8, Ot),
          b("button", {
            onClick: n[1] || (n[1] = (m) => be()),
            disabled: C.value === "idle",
            class: "replay-btn stop-btn"
          }, " ⏹️ ", 8, At)
        ]),
        b("div", Jt, [
          b("input", {
            type: "range",
            min: "0",
            max: K(),
            value: E.value,
            onInput: n[2] || (n[2] = (m) => ke(Number(m.target.value))),
            class: "progress-slider",
            disabled: C.value === "idle"
          }, null, 40, qt),
          b("div", $t, [
            b("span", null, re(Se(E.value)), 1),
            n[4] || (n[4] = b("span", null, "/", -1)),
            b("span", null, re(Se(K())), 1)
          ])
        ]),
        b("div", zt, [
          n[6] || (n[6] = b("label", null, "速度:", -1)),
          b("select", {
            onChange: n[3] || (n[3] = (m) => Me(Number(m.target.value))),
            class: "speed-select"
          }, n[5] || (n[5] = [
            b("option", { value: "0.5" }, "0.5x", -1),
            b("option", {
              value: "1",
              selected: ""
            }, "1x", -1),
            b("option", { value: "1.5" }, "1.5x", -1),
            b("option", { value: "2" }, "2x", -1)
          ]), 32)
        ])
      ])) : le("", !0)
    ], 4));
  }
});
const Xt = (r, e) => {
  const a = r.__vccOpts || r;
  for (const [s, o] of e)
    a[s] = o;
  return a;
}, Ae = /* @__PURE__ */ Xt(Yt, [["__scopeId", "data-v-259e6ad4"]]);
function Vt() {
  return window.devicePixelRatio || 1;
}
function Qt(r) {
  const e = r.getContext("2d"), a = Vt(), s = r.clientWidth, o = r.clientHeight;
  return r.width = s * a, r.height = o * a, e.scale(a, a), r.style.width = s + "px", r.style.height = o + "px", e;
}
function Lt(r) {
  if (r.paths.length === 0)
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0
    };
  let e = 1 / 0, a = 1 / 0, s = -1 / 0, o = -1 / 0;
  return r.paths.forEach((i) => {
    i.points.forEach((c) => {
      e = Math.min(e, c.x), a = Math.min(a, c.y), s = Math.max(s, c.x), o = Math.max(o, c.y);
    });
  }), {
    minX: e,
    minY: a,
    maxX: s,
    maxY: o,
    width: s - e,
    height: o - a
  };
}
function Kt(r, e, a = 10) {
  const s = Lt(e);
  if (s.width === 0 || s.height === 0) {
    const l = document.createElement("canvas");
    return l.width = 1, l.height = 1, l;
  }
  const o = document.createElement("canvas"), i = o.getContext("2d"), c = s.width + a * 2, h = s.height + a * 2;
  return o.width = c, o.height = h, i.drawImage(
    r,
    s.minX - a,
    s.minY - a,
    c,
    h,
    0,
    0,
    c,
    h
  ), o;
}
function Zt(r, e, a, s = !0) {
  const o = document.createElement("canvas"), i = o.getContext("2d");
  let c = e, h = a;
  if (s) {
    const l = r.width / r.height, u = e / a;
    l > u ? h = e / l : c = a * l;
  }
  return o.width = c, o.height = h, i.imageSmoothingEnabled = !0, i.imageSmoothingQuality = "high", i.drawImage(r, 0, 0, c, h), o;
}
function en(r, e, a = {}) {
  const {
    fontSize: s = 12,
    fontFamily: o = "Arial",
    color: i = "#999",
    opacity: c = 0.5,
    position: h = "bottom-right"
  } = a, l = document.createElement("canvas"), u = l.getContext("2d");
  l.width = r.width, l.height = r.height, u.drawImage(r, 0, 0), u.font = `${s}px ${o}`, u.fillStyle = i, u.globalAlpha = c;
  const v = u.measureText(e).width, p = s;
  let x, C;
  switch (h) {
    case "top-left":
      x = 10, C = p + 10;
      break;
    case "top-right":
      x = r.width - v - 10, C = p + 10;
      break;
    case "bottom-left":
      x = 10, C = r.height - 10;
      break;
    case "bottom-right":
      x = r.width - v - 10, C = r.height - 10;
      break;
    case "center":
      x = (r.width - v) / 2, C = (r.height + p) / 2;
      break;
    default:
      x = r.width - v - 10, C = r.height - 10;
  }
  return u.fillText(e, x, C), u.globalAlpha = 1, l;
}
function tn(r) {
  const e = document.createElement("canvas"), a = e.getContext("2d");
  e.width = r.width, e.height = r.height, a.drawImage(r, 0, 0);
  const s = a.getImageData(0, 0, r.width, r.height), o = s.data;
  for (let i = 0; i < o.length; i += 4) {
    const c = o[i] * 0.299 + o[i + 1] * 0.587 + o[i + 2] * 0.114;
    o[i] = c, o[i + 1] = c, o[i + 2] = c;
  }
  return a.putImageData(s, 0, 0), e;
}
const Ut = (r) => {
  r.component("ElectronicSignature", Ae);
}, nn = {
  install: Ut,
  ElectronicSignature: Ae
}, an = "1.0.0";
export {
  Ae as ElectronicSignature,
  Fe as PEN_STYLE_CONFIGS,
  xt as SignatureReplayController,
  en as addWatermark,
  gt as calculateStrokeWidth,
  B as cloneSignatureData,
  tn as convertToGrayscale,
  Mt as createDrawOptionsFromPenStyle,
  j as createEmptySignatureData,
  Ct as createReplayData,
  Kt as cropSignature,
  nn as default,
  jt as drawSmoothPath,
  yt as exportSignature,
  Gt as getAllPenStyles,
  mt as getAngle,
  pt as getControlPoint,
  Vt as getDevicePixelRatio,
  _e as getDistance,
  kt as getPenStyleConfig,
  Lt as getSignatureBounds,
  N as isSignatureEmpty,
  vt as loadImageToCanvas,
  Zt as resizeSignature,
  Qt as setupHighDPICanvas,
  ft as signatureToSVG,
  an as version
};
