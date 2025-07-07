var Ne = Object.defineProperty;
var je = (s, t, n) => t in s ? Ne(s, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : s[t] = n;
var k = (s, t, n) => (je(s, typeof t != "symbol" ? t + "" : t, n), n);
import { defineComponent as Ge, ref as D, computed as M, watch as N, nextTick as j, onMounted as Ve, onUnmounted as Qe, openBlock as O, createElementBlock as J, normalizeStyle as G, createElementVNode as b, toDisplayString as V, createCommentVNode as Q } from "vue";
function we(s, t) {
  return Math.sqrt(
    Math.pow(t.x - s.x, 2) + Math.pow(t.y - s.y, 2)
  );
}
function Ke(s, t) {
  return Math.atan2(t.y - s.y, t.x - s.x);
}
function Ze(s, t, n, a) {
  const l = t || s, i = n || s, h = 0.2, c = Ke(l, i) * (a ? 1 : -1), r = we(l, i) * h;
  return {
    x: s.x + Math.cos(c) * r,
    y: s.y + Math.sin(c) * r,
    time: s.time
  };
}
function et(s, t, n) {
  if (!n.pressure.enabled)
    return n.strokeWidth;
  const a = we(s, t), l = t.time - s.time, i = l > 0 ? a / l : 0, h = Math.max(0.1, Math.min(1, 1 - i * 0.01)), { min: c, max: r } = n.pressure;
  return c + (r - c) * h;
}
function It(s, t, n) {
  if (t.length < 2)
    return;
  if (s.strokeStyle = n.strokeColor, s.lineCap = "round", s.lineJoin = "round", !n.smoothing || t.length < 3) {
    s.beginPath(), s.lineWidth = n.strokeWidth, s.moveTo(t[0].x, t[0].y);
    for (let l = 1; l < t.length; l++)
      s.lineTo(t[l].x, t[l].y);
    s.stroke();
    return;
  }
  s.beginPath(), s.moveTo(t[0].x, t[0].y);
  for (let l = 1; l < t.length - 1; l++) {
    const i = t[l], h = t[l + 1];
    n.pressure.enabled ? s.lineWidth = et(t[l - 1], i, n) : s.lineWidth = n.strokeWidth;
    const c = Ze(i, t[l - 1], h);
    s.quadraticCurveTo(c.x, c.y, i.x, i.y);
  }
  const a = t[t.length - 1];
  s.lineTo(a.x, a.y), s.stroke();
}
function tt(s) {
  const { canvasSize: t, paths: n } = s;
  let a = `<svg width="${t.width}" height="${t.height}" xmlns="http://www.w3.org/2000/svg">`;
  return n.forEach((l) => {
    if (l.points.length < 2)
      return;
    let i = `M ${l.points[0].x} ${l.points[0].y}`;
    for (let h = 1; h < l.points.length; h++)
      i += ` L ${l.points[h].x} ${l.points[h].y}`;
    a += `<path d="${i}" stroke="${l.strokeColor}" stroke-width="${l.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), a += "</svg>", a;
}
function at(s, t, n = { format: "png" }) {
  const { format: a, quality: l = 0.9, size: i, backgroundColor: h } = n;
  if (a === "svg")
    return tt(t);
  const c = document.createElement("canvas"), r = c.getContext("2d");
  if (i) {
    c.width = i.width, c.height = i.height;
    const d = i.width / s.width, f = i.height / s.height;
    r.scale(d, f);
  } else
    c.width = s.width, c.height = s.height;
  switch (h && h !== "transparent" && (r.fillStyle = h, r.fillRect(0, 0, c.width, c.height)), r.drawImage(s, 0, 0), a) {
    case "jpeg":
      return c.toDataURL("image/jpeg", l);
    case "base64":
      return c.toDataURL("image/png").split(",")[1];
    case "png":
    default:
      return c.toDataURL("image/png");
  }
}
function nt(s, t) {
  return new Promise((n, a) => {
    const l = new Image();
    l.onload = () => {
      const i = s.getContext("2d");
      i.clearRect(0, 0, s.width, s.height), i.drawImage(l, 0, 0, s.width, s.height), n();
    }, l.onerror = a, l.src = t;
  });
}
function X(s) {
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
    this.canvas = t, this.ctx = t.getContext("2d"), this.initializeOffscreenCanvas();
  }
  /**
   * 初始化离屏画布用于性能优化
   */
  initializeOffscreenCanvas() {
    this.offscreenCanvas = document.createElement("canvas"), this.offscreenCanvas.width = this.canvas.width, this.offscreenCanvas.height = this.canvas.height, this.offscreenCtx = this.offscreenCanvas.getContext("2d");
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
   * 渲染指定时间的帧 - 双缓冲技术，完全消除闪烁
   */
  renderFrame(t) {
    !this.replayData || !this.offscreenCanvas || !this.offscreenCtx || (this.renderToOffscreenCanvas(t), this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height), this.ctx.drawImage(this.offscreenCanvas, 0, 0));
  }
  /**
   * 在离屏画布上渲染完整帧
   */
  renderToOffscreenCanvas(t) {
    if (!this.replayData || !this.offscreenCtx)
      return;
    this.offscreenCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height);
    let n = !1;
    for (let a = 0; a < this.replayData.paths.length; a++) {
      const l = this.replayData.paths[a], i = l.startTime || 0, h = l.endTime || i + (l.duration || 0);
      if (t < i)
        break;
      if (t >= h) {
        this.drawCompletePathToOffscreen(l), !n && Math.abs(t - h) < 32 && this.emit("replay-path-end", a, l);
        continue;
      }
      n = !0;
      const c = Math.max(0, Math.min(1, (t - i) / Math.max(h - i, 1)));
      c > 0 && Math.abs(t - i) < 32 && this.emit("replay-path-start", a, l), this.drawPartialPathToOffscreen(l, c);
      break;
    }
  }
  /**
   * 获取指定时间内的所有点
   */
  getPointsUpToTime(t, n, a) {
    const l = [];
    for (let i = 0; i < t.length; i++) {
      const h = t[i], c = n + (h.relativeTime || i * 50);
      if (c <= a)
        l.push(h);
      else {
        if (i > 0) {
          const r = t[i - 1], d = n + (r.relativeTime || (i - 1) * 50);
          if (d <= a) {
            const f = (a - d) / (c - d), u = {
              x: r.x + (h.x - r.x) * f,
              y: r.y + (h.y - r.y) * f,
              time: a,
              pressure: r.pressure ? r.pressure + (h.pressure || r.pressure - r.pressure) * f : h.pressure
            };
            l.push(u);
          }
        }
        break;
      }
    }
    return l;
  }
  /**
   * 根据笔迹样式计算动态线宽（与录制时一致）
   */
  calculateDynamicStrokeWidth(t, n, a, l) {
    switch (a) {
      case "pen":
        return 1;
      case "brush":
        if (n) {
          const r = Math.sqrt(Math.pow(t.x - n.x, 2) + Math.pow(t.y - n.y, 2)), d = Math.max(1, (t.time || 0) - (n.time || 0)), f = r / d, u = Math.max(0.1, Math.min(3, 100 / Math.max(f, 1))), C = t.pressure || 0.5, v = 0.8 + Math.random() * 0.4;
          return Math.max(1, Math.min(20, l * u * (0.3 + C * 1.4) * v));
        }
        return l;
      case "marker":
        return 12;
      case "pencil":
        const i = t.pressure || 0.5, h = 0.9 + Math.random() * 0.2;
        return l * (0.7 + i * 0.6) * h;
      case "ballpoint":
        const c = t.pressure || 0.5;
        return l * (0.8 + c * 0.4);
      default:
        return l;
    }
  }
  /**
   * 根据笔迹样式绘制线段（与录制时完全一致）
   */
  drawStyledStrokeForReplay(t, n, a, l) {
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
            const h = t[i], c = t[i - 1], r = this.calculateDynamicStrokeWidth(h, c, n, l);
            this.ctx.lineWidth = r, this.ctx.beginPath(), this.ctx.moveTo(c.x, c.y), this.ctx.lineTo(h.x, h.y), this.ctx.stroke(), r > 8 && Math.random() > 0.6 && (this.ctx.globalAlpha = 0.2, this.ctx.beginPath(), this.ctx.arc(h.x, h.y, r * 0.3, 0, Math.PI * 2), this.ctx.fill(), this.ctx.globalAlpha = 1);
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
            const h = t[i], c = t[i - 1], r = this.calculateDynamicStrokeWidth(h, c, n, l);
            this.ctx.lineWidth = r, this.ctx.globalAlpha = 0.8, this.ctx.beginPath(), this.ctx.moveTo(c.x, c.y), this.ctx.lineTo(h.x, h.y), this.ctx.stroke();
            for (let d = 0; d < 3; d++)
              if (Math.random() > 0.5) {
                this.ctx.globalAlpha = 0.2, this.ctx.lineWidth = r * 0.3;
                const f = (Math.random() - 0.5) * 2, u = (Math.random() - 0.5) * 2;
                this.ctx.beginPath(), this.ctx.moveTo(c.x + f, c.y + u), this.ctx.lineTo(h.x + f, h.y + u), this.ctx.stroke();
              }
            if (Math.random() > 0.8) {
              this.ctx.globalAlpha = 0.4;
              for (let d = 0; d < 5; d++)
                this.ctx.beginPath(), this.ctx.arc(
                  h.x + (Math.random() - 0.5) * 3,
                  h.y + (Math.random() - 0.5) * 3,
                  Math.random() * 0.8,
                  0,
                  Math.PI * 2
                ), this.ctx.fill();
            }
          }
          this.ctx.globalAlpha = 1;
          break;
        case "ballpoint":
          this.ctx.lineCap = "round", this.ctx.lineJoin = "round";
          for (let i = 1; i < t.length; i++) {
            const h = t[i], c = t[i - 1], r = this.calculateDynamicStrokeWidth(h, c, n, l);
            if (Math.random() > 0.1) {
              if (this.ctx.lineWidth = r, this.ctx.globalAlpha = Math.random() > 0.2 ? 1 : 0.7, this.ctx.beginPath(), i < t.length - 1) {
                const d = t[i + 1], f = this.getControlPoint(h, c, d);
                this.ctx.moveTo(c.x, c.y), this.ctx.quadraticCurveTo(f.x, f.y, h.x, h.y);
              } else
                this.ctx.moveTo(c.x, c.y), this.ctx.lineTo(h.x, h.y);
              this.ctx.stroke();
            }
            Math.random() > 0.95 && (this.ctx.globalAlpha = 0.8, this.ctx.beginPath(), this.ctx.arc(h.x, h.y, r * 0.8, 0, Math.PI * 2), this.ctx.fill());
          }
          this.ctx.globalAlpha = 1;
          break;
      }
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
        const a = this.eventCallbacks.get(t), l = a.indexOf(n);
        l > -1 && a.splice(l, 1);
      } else
        this.eventCallbacks.delete(t);
  }
  /**
   * 触发事件
   */
  emit(t, ...n) {
    const a = this.eventCallbacks.get(t);
    a && a.forEach((l) => l(...n));
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
    const a = t.startTime || 0, l = t.duration || 0, i = a + l * n, h = this.getPointsUpToTime(t.points, a, i);
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
    this.stop(), this.eventCallbacks.clear(), this.replayData = null;
  }
}
function st(s) {
  const t = s.paths.map((r) => {
    const d = r.points.map((u, C) => {
      var T;
      let v;
      if (u.time && r.points[0].time)
        v = u.time - r.points[0].time;
      else if (C === 0)
        v = 0;
      else {
        const E = r.points[C - 1], P = Math.sqrt(
          Math.pow(u.x - E.x, 2) + Math.pow(u.y - E.y, 2)
        ) / 100 * 1e3;
        v = (((T = d[C - 1]) == null ? void 0 : T.relativeTime) || 0) + Math.max(P, 16);
      }
      return {
        ...u,
        relativeTime: v
      };
    }), f = d.length > 0 ? d[d.length - 1].relativeTime : 0;
    return {
      ...r,
      points: d,
      duration: f
    };
  }), n = [];
  for (let r = 0; r < t.length; r++) {
    const d = t[r];
    let f;
    if (r === 0)
      f = 0;
    else {
      const v = n[r - 1], T = it(
        s.paths[r - 1].points,
        s.paths[r].points
      );
      f = v.endTime + T;
    }
    const u = f + d.duration, C = {
      ...d,
      startTime: f,
      endTime: u
    };
    console.log(`路径 ${r}: 开始时间=${f}, 结束时间=${u}, 持续时间=${d.duration}`), n.push(C);
  }
  const a = n.length > 0 ? n[n.length - 1].endTime : 0;
  console.log("回放数据生成完成:"), console.log("- 路径数量:", n.length), console.log("- 总时长:", a), console.log("- 路径详情:", n.map((r) => ({
    startTime: r.startTime,
    endTime: r.endTime,
    duration: r.duration,
    pointCount: r.points.length
  })));
  const l = n.reduce((r, d) => r + rt(d.points), 0), i = a > 0 ? l / (a / 1e3) : 0, h = n.slice(1).map((r, d) => {
    const f = n[d];
    return r.startTime - f.endTime;
  }), c = h.length > 0 ? h.reduce((r, d) => r + d, 0) / h.length : 0;
  return {
    paths: n,
    totalDuration: a,
    speed: 1,
    metadata: {
      deviceType: lt(s),
      averageSpeed: i,
      totalDistance: l,
      averagePauseTime: c
    }
  };
}
function it(s, t) {
  if (s.length === 0 || t.length === 0)
    return 200;
  const n = s[s.length - 1], a = t[0];
  if (n.time && a.time)
    return Math.max(a.time - n.time, 50);
  const l = Math.sqrt(
    Math.pow(a.x - n.x, 2) + Math.pow(a.y - n.y, 2)
  );
  return Math.min(Math.max(l * 2, 100), 1e3);
}
function lt(s) {
  const t = s.paths.reduce((i, h) => i + h.points.length, 0), n = s.paths.length;
  if (t === 0)
    return "touch";
  const a = t / n;
  return a > 20 ? "touch" : a < 10 ? "mouse" : s.paths.some(
    (i) => i.points.some((h) => h.pressure !== void 0)
  ) ? "pen" : "touch";
}
function rt(s) {
  let t = 0;
  for (let n = 1; n < s.length; n++) {
    const a = s[n].x - s[n - 1].x, l = s[n].y - s[n - 1].y;
    t += Math.sqrt(a * a + l * l);
  }
  return t;
}
const Me = {
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
  return Me[s];
}
function Et() {
  return Object.entries(Me).map(([s, t]) => ({
    key: s,
    config: t
  }));
}
function ct(s, t) {
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
const ut = ["width", "height"], dt = {
  key: 1,
  class: "signature-toolbar"
}, mt = ["disabled"], gt = ["disabled"], pt = ["disabled"], ft = {
  key: 2,
  class: "replay-controls"
}, vt = { class: "replay-buttons" }, yt = ["disabled"], xt = { key: 0 }, bt = { key: 1 }, Ct = ["disabled"], Tt = { class: "replay-progress" }, kt = ["max", "value", "disabled"], wt = { class: "time-display" }, Mt = { class: "replay-speed" }, Pt = /* @__PURE__ */ Ge({
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
    const a = s, l = n, i = D(), h = D(!1), c = D(null), r = D(B(0, 0)), d = D([]), f = D(-1), u = D(null), C = D(!1), v = D("idle"), T = D(0), E = D(0), W = M(() => typeof a.width == "number" ? a.width : 800), P = M(() => typeof a.height == "number" ? a.height : 300), Se = M(() => ({
      position: "relative",
      display: "inline-block",
      width: typeof a.width == "string" ? a.width : `${a.width}px`,
      height: typeof a.height == "string" ? a.height : `${a.height}px`
    })), De = M(() => ({
      border: a.borderStyle,
      borderRadius: a.borderRadius,
      backgroundColor: a.backgroundColor,
      cursor: a.disabled ? "not-allowed" : "crosshair",
      display: "block",
      width: "100%",
      height: "100%"
    })), We = M(() => ({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "#999",
      fontSize: "14px",
      pointerEvents: "none",
      userSelect: "none"
    })), Re = M(() => C.value ? !1 : a.placeholder && X(r.value)), K = M(() => f.value > 0), Z = M(() => f.value < d.value.length - 1), ee = M(() => C.value && u.value), R = M(() => !ee.value && !a.disabled), _e = M(() => {
      var e;
      return ee.value && ((e = a.replayOptions) == null ? void 0 : e.showControls) !== !1;
    }), _ = M(() => {
      if (a.penStyle) {
        const e = ct(a.penStyle, a.strokeColor);
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
      return ((e = i.value) == null ? void 0 : e.getContext("2d")) || null;
    }, F = (e, o) => {
      const g = i.value, y = g.getBoundingClientRect(), m = g.width / y.width, p = g.height / y.height;
      return {
        x: (e - y.left) * m,
        y: (o - y.top) * p,
        time: Date.now()
      };
    }, ae = (e) => {
      if (!R.value)
        return;
      h.value = !0;
      const o = performance.now(), g = { ...e, time: o };
      c.value = {
        points: [g],
        strokeColor: a.strokeColor,
        strokeWidth: a.strokeWidth,
        penStyle: a.penStyle,
        // 保存笔迹样式
        startTime: o,
        endTime: o,
        duration: 0
      }, l("signature-start");
    }, L = (e, o, g, y) => {
      switch (g) {
        case "pen":
          return 1;
        case "brush":
          if (o) {
            const S = Math.sqrt(Math.pow(e.x - o.x, 2) + Math.pow(e.y - o.y, 2)), w = Math.max(1, (e.time || 0) - (o.time || 0)), I = S / w, Y = Math.max(0.1, Math.min(3, 100 / Math.max(I, 1))), Ue = e.pressure || 0.5, He = 0.8 + Math.random() * 0.4;
            return Math.max(1, Math.min(20, y * Y * (0.3 + Ue * 1.4) * He));
          }
          return y;
        case "marker":
          return 12;
        case "pencil":
          const m = e.pressure || 0.5, p = 0.9 + Math.random() * 0.2;
          return y * (0.7 + m * 0.6) * p;
        case "ballpoint":
          const x = e.pressure || 0.5;
          return y * (0.8 + x * 0.4);
        default:
          return y;
      }
    }, U = (e, o, g) => {
      var y;
      if (!(o.length < 2))
        switch (e.strokeStyle = ((y = c.value) == null ? void 0 : y.strokeColor) || _.value.strokeColor, e.lineCap = _.value.lineCap || "round", e.lineJoin = _.value.lineJoin || "round", g) {
          case "pen":
            if (e.lineWidth = 1, e.lineCap = "butt", e.lineJoin = "miter", e.beginPath(), e.moveTo(o[0].x, o[0].y), o.length >= 3) {
              for (let m = 1; m < o.length - 1; m++) {
                const p = ne(o[m], o[m - 1], o[m + 1]);
                e.quadraticCurveTo(p.x, p.y, o[m].x, o[m].y);
              }
              e.lineTo(o[o.length - 1].x, o[o.length - 1].y);
            } else
              for (let m = 1; m < o.length; m++)
                e.lineTo(o[m].x, o[m].y);
            e.stroke();
            break;
          case "brush":
            e.lineCap = "round", e.lineJoin = "round";
            for (let m = 1; m < o.length; m++) {
              const p = o[m], x = o[m - 1], S = L(p, x, g, _.value.strokeWidth), w = e.createLinearGradient(x.x, x.y, p.x, p.y);
              w.addColorStop(0, e.strokeStyle), w.addColorStop(1, e.strokeStyle), e.lineWidth = S, e.beginPath(), e.moveTo(x.x, x.y), e.lineTo(p.x, p.y), e.stroke(), S > 8 && Math.random() > 0.6 && (e.globalAlpha = 0.2, e.beginPath(), e.arc(p.x, p.y, S * 0.3, 0, Math.PI * 2), e.fill(), e.globalAlpha = 1);
            }
            break;
          case "marker":
            e.globalAlpha = 0.7, e.lineWidth = 12, e.lineCap = "square", e.lineJoin = "bevel", e.beginPath(), e.moveTo(o[0].x, o[0].y);
            for (let m = 1; m < o.length; m++)
              e.lineTo(o[m].x, o[m].y);
            e.stroke(), e.globalAlpha = 0.3, e.lineWidth = 16, e.beginPath(), e.moveTo(o[0].x, o[0].y);
            for (let m = 1; m < o.length; m++)
              e.lineTo(o[m].x, o[m].y);
            e.stroke(), e.globalAlpha = 1;
            break;
          case "pencil":
            e.lineCap = "round", e.lineJoin = "round";
            for (let m = 1; m < o.length; m++) {
              const p = o[m], x = o[m - 1], S = L(p, x, g, _.value.strokeWidth);
              e.lineWidth = S, e.globalAlpha = 0.8, e.beginPath(), e.moveTo(x.x, x.y), e.lineTo(p.x, p.y), e.stroke();
              for (let w = 0; w < 3; w++)
                if (Math.random() > 0.5) {
                  e.globalAlpha = 0.2, e.lineWidth = S * 0.3;
                  const I = (Math.random() - 0.5) * 2, Y = (Math.random() - 0.5) * 2;
                  e.beginPath(), e.moveTo(x.x + I, x.y + Y), e.lineTo(p.x + I, p.y + Y), e.stroke();
                }
              if (Math.random() > 0.8) {
                e.globalAlpha = 0.4;
                for (let w = 0; w < 5; w++)
                  e.beginPath(), e.arc(
                    p.x + (Math.random() - 0.5) * 3,
                    p.y + (Math.random() - 0.5) * 3,
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
            for (let m = 1; m < o.length; m++) {
              const p = o[m], x = o[m - 1], S = L(p, x, g, _.value.strokeWidth);
              if (Math.random() > 0.1) {
                if (e.lineWidth = S, e.globalAlpha = Math.random() > 0.2 ? 1 : 0.7, e.beginPath(), _.value.smoothing && m < o.length - 1) {
                  const w = o[m + 1], I = ne(p, x, w);
                  e.moveTo(x.x, x.y), e.quadraticCurveTo(I.x, I.y, p.x, p.y);
                } else
                  e.moveTo(x.x, x.y), e.lineTo(p.x, p.y);
                e.stroke();
              }
              Math.random() > 0.95 && (e.globalAlpha = 0.8, e.beginPath(), e.arc(p.x, p.y, S * 0.8, 0, Math.PI * 2), e.fill());
            }
            e.globalAlpha = 1;
            break;
        }
    }, Ae = () => {
      if (!c.value || c.value.points.length < 2)
        return;
      const e = te();
      if (!e)
        return;
      const o = c.value.points, g = o.length, y = a.penStyle || "pen";
      if (g === 2)
        U(e, o, y);
      else if (g >= 3) {
        const m = o.slice(-3);
        U(e, m, y);
      }
    }, ne = (e, o, g) => {
      const m = {
        length: Math.sqrt(Math.pow(g.x - o.x, 2) + Math.pow(g.y - o.y, 2)),
        angle: Math.atan2(g.y - o.y, g.x - o.x)
      }, p = m.angle + Math.PI, x = m.length * 0.2;
      return {
        x: e.x + Math.cos(p) * x,
        y: e.y + Math.sin(p) * x,
        time: e.time || 0
      };
    }, Ie = (e, o) => {
      if (o.points.length < 2)
        return;
      const g = o.penStyle || a.penStyle || "pen", y = c.value;
      c.value = o, U(e, o.points, g), c.value = y;
    }, oe = (e) => {
      if (!h.value || !c.value || !R.value)
        return;
      const o = performance.now(), g = { ...e, time: o };
      c.value.points.push(g), c.value.startTime && (c.value.endTime = o, c.value.duration = o - c.value.startTime), Ae(), re(), l("signature-drawing", r.value);
    }, se = () => {
      if (!(!h.value || !c.value)) {
        if (h.value = !1, c.value.points.length > 0) {
          const e = c.value.points[c.value.points.length - 1];
          e.time && c.value.startTime && (c.value.endTime = e.time, c.value.duration = e.time - c.value.startTime);
        }
        r.value.paths.push(c.value), r.value.isEmpty = !1, r.value.timestamp = Date.now(), q(), A(), c.value = null, l("signature-end", r.value);
      }
    }, Ee = (e) => {
      e.preventDefault();
      const o = F(e.clientX, e.clientY);
      ae(o);
    }, Oe = (e) => {
      if (e.preventDefault(), !h.value)
        return;
      const o = F(e.clientX, e.clientY);
      oe(o);
    }, ie = (e) => {
      e.preventDefault(), se();
    }, Je = (e) => {
      if (e.preventDefault(), e.touches.length !== 1)
        return;
      const o = e.touches[0], g = F(o.clientX, o.clientY);
      ae(g);
    }, $e = (e) => {
      if (e.preventDefault(), e.touches.length !== 1 || !h.value)
        return;
      const o = e.touches[0], g = F(o.clientX, o.clientY);
      oe(g);
    }, le = (e) => {
      e.preventDefault(), se();
    }, re = () => {
      r.value.canvasSize = {
        width: W.value,
        height: P.value
      }, r.value.isEmpty = X(r.value);
    }, q = () => {
      d.value = d.value.slice(0, f.value + 1), d.value.push($(r.value)), f.value = d.value.length - 1;
      const e = 50;
      d.value.length > e && (d.value = d.value.slice(-e), f.value = d.value.length - 1);
    }, A = () => {
      const e = te();
      e && (e.clearRect(0, 0, W.value, P.value), a.backgroundColor && a.backgroundColor !== "transparent" && (e.fillStyle = a.backgroundColor, e.fillRect(0, 0, W.value, P.value)), r.value.paths.forEach((o) => {
        o.points.length > 0 && Ie(e, o);
      }));
    }, z = () => {
      if (console.log("初始化回放控制器"), console.log("canvas引用是否存在:", !!i.value), !i.value) {
        console.error("canvas引用不存在，无法初始化回放控制器");
        return;
      }
      u.value && (console.log("销毁现有回放控制器"), u.value.destroy()), console.log("创建新的回放控制器"), u.value = new ot(i.value), console.log("回放控制器创建成功:", !!u.value), u.value.on("replay-start", () => {
        v.value = "playing", l("replay-start");
      }), u.value.on("replay-progress", (e, o) => {
        T.value = e, E.value = o, l("replay-progress", e, o);
      }), u.value.on("replay-pause", () => {
        v.value = "paused", l("replay-pause");
      }), u.value.on("replay-resume", () => {
        v.value = "playing", l("replay-resume");
      }), u.value.on("replay-stop", () => {
        v.value = "stopped", l("replay-stop");
      }), u.value.on("replay-complete", () => {
        v.value = "completed", l("replay-complete");
      }), u.value.on("replay-path-start", (e, o) => {
        l("replay-path-start", e, o);
      }), u.value.on("replay-path-end", (e, o) => {
        l("replay-path-end", e, o);
      }), u.value.on("replay-speed-change", (e) => {
        l("replay-speed-change", e);
      });
    }, he = (e, o) => {
      if (u.value || z(), u.value) {
        C.value = !0;
        const g = {
          ...o,
          drawOptions: _.value,
          penStyle: a.penStyle
        };
        u.value.setReplayData(e, g), console.log("startReplay调用，自动播放:", o == null ? void 0 : o.autoPlay), (o == null ? void 0 : o.autoPlay) === !0 && u.value.play();
      }
    }, ce = (e) => {
      C.value = e, !e && u.value && (u.value.stop(), A());
    }, Fe = () => X(r.value) ? null : st(r.value), ue = () => {
      console.log("play方法被调用"), console.log("回放控制器是否存在:", !!u.value), u.value || (console.log("回放控制器不存在，尝试初始化"), z()), u.value ? (console.log("调用回放控制器的play方法"), u.value.play()) : console.error("回放控制器初始化失败，无法播放");
    }, de = () => {
      var e;
      (e = u.value) == null || e.pause();
    }, me = () => {
      var e;
      (e = u.value) == null || e.stop();
    }, ge = (e) => {
      var o;
      (o = u.value) == null || o.seek(e);
    }, pe = (e) => {
      var o;
      (o = u.value) == null || o.setSpeed(e);
    }, qe = () => {
      var e;
      return ((e = u.value) == null ? void 0 : e.getState()) || "idle";
    }, ze = () => {
      var e;
      return ((e = u.value) == null ? void 0 : e.getCurrentTime()) || 0;
    }, H = () => {
      var e;
      return ((e = u.value) == null ? void 0 : e.getTotalDuration()) || 0;
    }, Ye = () => {
      var e;
      return ((e = u.value) == null ? void 0 : e.getProgress()) || 0;
    }, fe = (e) => {
      const o = Math.floor(e / 1e3), g = Math.floor(o / 60), y = o % 60;
      return `${g}:${y.toString().padStart(2, "0")}`;
    }, ve = () => {
      R.value && (r.value = B(W.value, P.value), A(), q(), l("signature-clear"));
    }, ye = () => {
      !K.value || !R.value || (f.value--, r.value = $(d.value[f.value]), A(), l("signature-undo", r.value));
    }, xe = () => {
      !Z.value || !R.value || (f.value++, r.value = $(d.value[f.value]), A(), l("signature-redo", r.value));
    }, be = (e) => {
      const o = i.value;
      return at(o, r.value, e);
    }, Ce = () => X(r.value), Te = async (e) => {
      if (!R.value)
        return;
      const o = i.value;
      await nt(o, e), r.value = B(W.value, P.value), r.value.isEmpty = !1, q();
    }, Xe = () => $(r.value), Be = (e) => {
      R.value && (r.value = $(e), A(), q());
    }, ke = (e, o) => {
      const g = e || W.value, y = o || P.value, m = be({ format: "png" });
      j(() => {
        const p = i.value;
        p.width = g, p.height = y, Ce() || Te(m), re();
      });
    }, Le = () => {
      const e = i.value;
      e.width = W.value, e.height = P.value, r.value = B(W.value, P.value), d.value = [$(r.value)], f.value = 0, A();
    };
    return N([() => a.width, () => a.height], () => {
      j(() => {
        i.value && ke();
      });
    }), N(() => a.replayMode, (e) => {
      e !== void 0 && ce(e);
    }), N(() => a.replayData, (e) => {
      if (console.log("watch监听到回放数据变化:", e), console.log("当前回放模式:", a.replayMode), console.log("回放控制器是否存在:", !!u.value), e && a.replayMode)
        if (u.value || (console.log("回放控制器未初始化，先初始化"), z()), u.value) {
          console.log("开始设置回放数据到控制器");
          const o = {
            ...a.replayOptions,
            drawOptions: _.value,
            penStyle: a.penStyle
          };
          u.value.setReplayData(e, o), console.log("回放数据已更新:", e);
        } else
          console.error("回放控制器初始化失败");
      else
        e || console.log("回放数据为空，跳过设置"), a.replayMode || console.log("不在回放模式，跳过设置");
    }, { immediate: !0 }), Ve(() => {
      j(() => {
        Le(), z(), a.replayMode && a.replayData && he(a.replayData, a.replayOptions);
      });
    }), Qe(() => {
      u.value && (u.value.destroy(), u.value = null);
    }), t({
      clear: ve,
      undo: ye,
      redo: xe,
      save: be,
      isEmpty: Ce,
      fromDataURL: Te,
      getSignatureData: Xe,
      setSignatureData: Be,
      resize: ke,
      // 回放相关方法
      startReplay: he,
      getReplayData: Fe,
      setReplayMode: ce,
      play: ue,
      pause: de,
      stop: me,
      seek: ge,
      setSpeed: pe,
      getState: qe,
      getCurrentTime: ze,
      getTotalDuration: H,
      getProgress: Ye
    }), (e, o) => (O(), J("div", {
      class: "electronic-signature",
      style: G(Se.value)
    }, [
      b("canvas", {
        ref_key: "canvasRef",
        ref: i,
        width: W.value,
        height: P.value,
        style: G(De.value),
        onMousedown: Ee,
        onMousemove: Oe,
        onMouseup: ie,
        onMouseleave: ie,
        onTouchstart: Je,
        onTouchmove: $e,
        onTouchend: le,
        onTouchcancel: le
      }, null, 44, ut),
      Re.value ? (O(), J("div", {
        key: 0,
        class: "signature-placeholder",
        style: G(We.value)
      }, V(e.placeholder), 5)) : Q("", !0),
      e.showToolbar ? (O(), J("div", dt, [
        b("button", {
          onClick: ve,
          disabled: !R.value
        }, "清除", 8, mt),
        b("button", {
          onClick: ye,
          disabled: !R.value || !K.value
        }, "撤销", 8, gt),
        b("button", {
          onClick: xe,
          disabled: !R.value || !Z.value
        }, "重做", 8, pt)
      ])) : Q("", !0),
      _e.value ? (O(), J("div", ft, [
        b("div", vt, [
          b("button", {
            onClick: o[0] || (o[0] = (g) => v.value === "playing" ? de() : ue()),
            disabled: v.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            v.value === "playing" ? (O(), J("span", xt, "⏸️")) : (O(), J("span", bt, "▶️"))
          ], 8, yt),
          b("button", {
            onClick: o[1] || (o[1] = (g) => me()),
            disabled: v.value === "idle",
            class: "replay-btn stop-btn"
          }, " ⏹️ ", 8, Ct)
        ]),
        b("div", Tt, [
          b("input", {
            type: "range",
            min: "0",
            max: H(),
            value: E.value,
            onInput: o[2] || (o[2] = (g) => ge(Number(g.target.value))),
            class: "progress-slider",
            disabled: v.value === "idle"
          }, null, 40, kt),
          b("div", wt, [
            b("span", null, V(fe(E.value)), 1),
            o[4] || (o[4] = b("span", null, "/", -1)),
            b("span", null, V(fe(H())), 1)
          ])
        ]),
        b("div", Mt, [
          o[6] || (o[6] = b("label", null, "速度:", -1)),
          b("select", {
            onChange: o[3] || (o[3] = (g) => pe(Number(g.target.value))),
            class: "speed-select"
          }, o[5] || (o[5] = [
            b("option", { value: "0.5" }, "0.5x", -1),
            b("option", {
              value: "1",
              selected: ""
            }, "1x", -1),
            b("option", { value: "1.5" }, "1.5x", -1),
            b("option", { value: "2" }, "2x", -1)
          ]), 32)
        ])
      ])) : Q("", !0)
    ], 4));
  }
});
const St = (s, t) => {
  const n = s.__vccOpts || s;
  for (const [a, l] of t)
    n[a] = l;
  return n;
}, Pe = /* @__PURE__ */ St(Pt, [["__scopeId", "data-v-37d68792"]]);
function Dt() {
  return window.devicePixelRatio || 1;
}
function Ot(s) {
  const t = s.getContext("2d"), n = Dt(), a = s.clientWidth, l = s.clientHeight;
  return s.width = a * n, s.height = l * n, t.scale(n, n), s.style.width = a + "px", s.style.height = l + "px", t;
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
  let t = 1 / 0, n = 1 / 0, a = -1 / 0, l = -1 / 0;
  return s.paths.forEach((i) => {
    i.points.forEach((h) => {
      t = Math.min(t, h.x), n = Math.min(n, h.y), a = Math.max(a, h.x), l = Math.max(l, h.y);
    });
  }), {
    minX: t,
    minY: n,
    maxX: a,
    maxY: l,
    width: a - t,
    height: l - n
  };
}
function Jt(s, t, n = 10) {
  const a = Wt(t);
  if (a.width === 0 || a.height === 0) {
    const r = document.createElement("canvas");
    return r.width = 1, r.height = 1, r;
  }
  const l = document.createElement("canvas"), i = l.getContext("2d"), h = a.width + n * 2, c = a.height + n * 2;
  return l.width = h, l.height = c, i.drawImage(
    s,
    a.minX - n,
    a.minY - n,
    h,
    c,
    0,
    0,
    h,
    c
  ), l;
}
function $t(s, t, n, a = !0) {
  const l = document.createElement("canvas"), i = l.getContext("2d");
  let h = t, c = n;
  if (a) {
    const r = s.width / s.height, d = t / n;
    r > d ? c = t / r : h = n * r;
  }
  return l.width = h, l.height = c, i.imageSmoothingEnabled = !0, i.imageSmoothingQuality = "high", i.drawImage(s, 0, 0, h, c), l;
}
function Ft(s, t, n = {}) {
  const {
    fontSize: a = 12,
    fontFamily: l = "Arial",
    color: i = "#999",
    opacity: h = 0.5,
    position: c = "bottom-right"
  } = n, r = document.createElement("canvas"), d = r.getContext("2d");
  r.width = s.width, r.height = s.height, d.drawImage(s, 0, 0), d.font = `${a}px ${l}`, d.fillStyle = i, d.globalAlpha = h;
  const u = d.measureText(t).width, C = a;
  let v, T;
  switch (c) {
    case "top-left":
      v = 10, T = C + 10;
      break;
    case "top-right":
      v = s.width - u - 10, T = C + 10;
      break;
    case "bottom-left":
      v = 10, T = s.height - 10;
      break;
    case "bottom-right":
      v = s.width - u - 10, T = s.height - 10;
      break;
    case "center":
      v = (s.width - u) / 2, T = (s.height + C) / 2;
      break;
    default:
      v = s.width - u - 10, T = s.height - 10;
  }
  return d.fillText(t, v, T), d.globalAlpha = 1, r;
}
function qt(s) {
  const t = document.createElement("canvas"), n = t.getContext("2d");
  t.width = s.width, t.height = s.height, n.drawImage(s, 0, 0);
  const a = n.getImageData(0, 0, s.width, s.height), l = a.data;
  for (let i = 0; i < l.length; i += 4) {
    const h = l[i] * 0.299 + l[i + 1] * 0.587 + l[i + 2] * 0.114;
    l[i] = h, l[i + 1] = h, l[i + 2] = h;
  }
  return n.putImageData(a, 0, 0), t;
}
const Rt = (s) => {
  s.component("ElectronicSignature", Pe);
}, zt = {
  install: Rt,
  ElectronicSignature: Pe
}, Yt = "1.0.0";
export {
  Pe as ElectronicSignature,
  Me as PEN_STYLE_CONFIGS,
  ot as SignatureReplayController,
  Ft as addWatermark,
  et as calculateStrokeWidth,
  $ as cloneSignatureData,
  qt as convertToGrayscale,
  ct as createDrawOptionsFromPenStyle,
  B as createEmptySignatureData,
  st as createReplayData,
  Jt as cropSignature,
  zt as default,
  It as drawSmoothPath,
  at as exportSignature,
  Et as getAllPenStyles,
  Ke as getAngle,
  Ze as getControlPoint,
  Dt as getDevicePixelRatio,
  we as getDistance,
  ht as getPenStyleConfig,
  Wt as getSignatureBounds,
  X as isSignatureEmpty,
  nt as loadImageToCanvas,
  $t as resizeSignature,
  Ot as setupHighDPICanvas,
  tt as signatureToSVG,
  Yt as version
};
