var Ne = Object.defineProperty;
var je = (l, e, n) => e in l ? Ne(l, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : l[e] = n;
var w = (l, e, n) => (je(l, typeof e != "symbol" ? e + "" : e, n), n);
import { defineComponent as Ge, ref as D, computed as M, watch as N, nextTick as j, onMounted as Ve, onUnmounted as Qe, openBlock as F, createElementBlock as J, normalizeStyle as G, createElementVNode as b, toDisplayString as V, createCommentVNode as Q } from "vue";
function ke(l, e) {
  return Math.sqrt(
    Math.pow(e.x - l.x, 2) + Math.pow(e.y - l.y, 2)
  );
}
function Ke(l, e) {
  return Math.atan2(e.y - l.y, e.x - l.x);
}
function Ze(l, e, n, a) {
  const s = e || l, o = n || l, r = 0.2, u = Ke(s, o) * (a ? 1 : -1), h = ke(s, o) * r;
  return {
    x: l.x + Math.cos(u) * h,
    y: l.y + Math.sin(u) * h,
    time: l.time
  };
}
function et(l, e, n) {
  if (!n.pressure.enabled)
    return n.strokeWidth;
  const a = ke(l, e), s = e.time - l.time, o = s > 0 ? a / s : 0, r = Math.max(0.1, Math.min(1, 1 - o * 0.01)), { min: u, max: h } = n.pressure;
  return u + (h - u) * r;
}
function _t(l, e, n) {
  if (e.length < 2)
    return;
  if (l.strokeStyle = n.strokeColor, l.lineCap = "round", l.lineJoin = "round", !n.smoothing || e.length < 3) {
    l.beginPath(), l.lineWidth = n.strokeWidth, l.moveTo(e[0].x, e[0].y);
    for (let s = 1; s < e.length; s++)
      l.lineTo(e[s].x, e[s].y);
    l.stroke();
    return;
  }
  l.beginPath(), l.moveTo(e[0].x, e[0].y);
  for (let s = 1; s < e.length - 1; s++) {
    const o = e[s], r = e[s + 1];
    n.pressure.enabled ? l.lineWidth = et(e[s - 1], o, n) : l.lineWidth = n.strokeWidth;
    const u = Ze(o, e[s - 1], r);
    l.quadraticCurveTo(u.x, u.y, o.x, o.y);
  }
  const a = e[e.length - 1];
  l.lineTo(a.x, a.y), l.stroke();
}
function tt(l) {
  const { canvasSize: e, paths: n } = l;
  let a = `<svg width="${e.width}" height="${e.height}" xmlns="http://www.w3.org/2000/svg">`;
  return n.forEach((s) => {
    if (s.points.length < 2)
      return;
    let o = `M ${s.points[0].x} ${s.points[0].y}`;
    for (let r = 1; r < s.points.length; r++)
      o += ` L ${s.points[r].x} ${s.points[r].y}`;
    a += `<path d="${o}" stroke="${s.strokeColor}" stroke-width="${s.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), a += "</svg>", a;
}
function at(l, e, n = { format: "png" }) {
  const { format: a, quality: s = 0.9, size: o, backgroundColor: r } = n;
  if (a === "svg")
    return tt(e);
  const u = document.createElement("canvas"), h = u.getContext("2d");
  if (o) {
    u.width = o.width, u.height = o.height;
    const d = o.width / l.width, f = o.height / l.height;
    h.scale(d, f);
  } else
    u.width = l.width, u.height = l.height;
  switch (r && r !== "transparent" && (h.fillStyle = r, h.fillRect(0, 0, u.width, u.height)), h.drawImage(l, 0, 0), a) {
    case "jpeg":
      return u.toDataURL("image/jpeg", s);
    case "base64":
      return u.toDataURL("image/png").split(",")[1];
    case "png":
    default:
      return u.toDataURL("image/png");
  }
}
function nt(l, e) {
  return new Promise((n, a) => {
    const s = new Image();
    s.onload = () => {
      const o = l.getContext("2d");
      o.clearRect(0, 0, l.width, l.height), o.drawImage(s, 0, 0, l.width, l.height), n();
    }, s.onerror = a, s.src = e;
  });
}
function B(l) {
  return l.paths.length === 0 || l.paths.every((e) => e.points.length === 0);
}
function X(l, e) {
  return {
    paths: [],
    canvasSize: { width: l, height: e },
    timestamp: Date.now(),
    isEmpty: !0
  };
}
function O(l) {
  return JSON.parse(JSON.stringify(l));
}
class st {
  constructor(e) {
    w(this, "canvas");
    w(this, "ctx");
    w(this, "replayData", null);
    w(this, "state", "idle");
    w(this, "currentTime", 0);
    w(this, "speed", 1);
    w(this, "animationId", null);
    w(this, "startTimestamp", 0);
    w(this, "pausedTime", 0);
    w(this, "options", {});
    // 事件回调
    w(this, "eventCallbacks", /* @__PURE__ */ new Map());
    // 性能优化相关
    w(this, "lastRenderedTime", -1);
    w(this, "completedPaths", /* @__PURE__ */ new Set());
    w(this, "offscreenCanvas", null);
    w(this, "offscreenCtx", null);
    w(this, "needsFullRedraw", !0);
    this.canvas = e, this.ctx = e.getContext("2d"), this.initializeOffscreenCanvas();
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
  setReplayData(e, n = {}) {
    console.log("设置回放数据:", e), console.log("回放选项:", n), this.replayData = e, this.options = { ...n }, this.speed = n.speed || e.speed || 1, this.currentTime = n.startTime || 0, this.state = "idle", this.resetOptimizationState(), console.log("回放数据设置完成，路径数量:", e.paths.length), console.log("总时长:", e.totalDuration);
  }
  /**
   * 重置优化状态
   */
  resetOptimizationState() {
    this.lastRenderedTime = -1, this.completedPaths.clear(), this.needsFullRedraw = !0, this.offscreenCanvas && (this.offscreenCanvas.width = this.canvas.width, this.offscreenCanvas.height = this.canvas.height);
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
    const n = this.options.endTime || this.replayData.totalDuration;
    this.currentTime = Math.max(0, Math.min(e, n)), this.needsFullRedraw = !0, this.state === "playing" ? this.startTimestamp = performance.now() - this.currentTime / this.speed : this.pausedTime = this.currentTime / this.speed, this.renderFrame(this.currentTime);
  }
  /**
   * 设置播放速度
   */
  setSpeed(e) {
    const n = this.state === "playing";
    n && this.pause(), this.speed = Math.max(0.1, Math.min(5, e)), this.emit("replay-speed-change", this.speed), n && this.play();
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
   * 渲染指定时间的帧 - 优化版本，减少重绘
   */
  renderFrame(e) {
    if (!this.replayData)
      return;
    this.needsFullRedraw || e < this.lastRenderedTime ? (this.renderFullFrame(e), this.needsFullRedraw = !1) : this.renderIncrementalFrame(e), this.lastRenderedTime = e;
  }
  /**
   * 完全重绘帧（用于初始化或时间倒退）
   */
  renderFullFrame(e) {
    if (!this.replayData)
      return;
    this.clearCanvas(), this.completedPaths.clear();
    let n = !1;
    for (let a = 0; a < this.replayData.paths.length; a++) {
      const s = this.replayData.paths[a], o = s.startTime || 0, r = s.endTime || o + (s.duration || 0);
      if (e < o)
        break;
      if (e >= r) {
        this.drawCompletePath(s), this.completedPaths.add(a), !n && Math.abs(e - r) < 32 && this.emit("replay-path-end", a, s);
        continue;
      }
      n = !0;
      const u = Math.max(0, Math.min(1, (e - o) / Math.max(r - o, 1)));
      u > 0 && Math.abs(e - o) < 32 && this.emit("replay-path-start", a, s), this.drawPartialPath(s, u);
      break;
    }
  }
  /**
   * 增量渲染帧（只更新变化的部分）
   */
  renderIncrementalFrame(e) {
    if (this.replayData)
      for (let n = 0; n < this.replayData.paths.length; n++) {
        const a = this.replayData.paths[n], s = a.startTime || 0, o = a.endTime || s + (a.duration || 0);
        if (e < s)
          break;
        if (e >= o) {
          this.completedPaths.has(n) || (this.drawCompletePath(a), this.completedPaths.add(n), this.emit("replay-path-end", n, a));
          continue;
        }
        this.renderActivePathOptimized(a, e, s, o, n);
        break;
      }
  }
  /**
   * 优化的活动路径渲染
   */
  renderActivePathOptimized(e, n, a, s, o) {
    if (!this.offscreenCanvas || !this.offscreenCtx)
      return;
    const r = Math.max(0, Math.min(1, (n - a) / Math.max(s - a, 1)));
    r > 0 && Math.abs(n - a) < 32 && this.emit("replay-path-start", o, e);
    const u = this.getPathBounds(e, r);
    u && (this.ctx.clearRect(u.x - 10, u.y - 10, u.width + 20, u.height + 20), this.redrawCompletedPathsInBounds(u)), this.drawPartialPath(e, r);
  }
  /**
   * 获取路径的边界框
   */
  getPathBounds(e, n) {
    if (e.points.length === 0)
      return null;
    const a = Math.ceil(e.points.length * n), s = e.points.slice(0, a);
    if (s.length === 0)
      return null;
    let o = s[0].x, r = s[0].x, u = s[0].y, h = s[0].y;
    for (const d of s)
      o = Math.min(o, d.x), r = Math.max(r, d.x), u = Math.min(u, d.y), h = Math.max(h, d.y);
    return {
      x: o,
      y: u,
      width: r - o,
      height: h - u
    };
  }
  /**
   * 在指定边界内重绘已完成的路径
   */
  redrawCompletedPathsInBounds(e) {
    if (this.replayData) {
      for (let n = 0; n < this.replayData.paths.length; n++)
        if (this.completedPaths.has(n)) {
          const a = this.replayData.paths[n];
          this.pathIntersectsBounds(a, e) && this.drawCompletePath(a);
        }
    }
  }
  /**
   * 检查路径是否与边界相交
   */
  pathIntersectsBounds(e, n) {
    for (const a of e.points)
      if (a.x >= n.x && a.x <= n.x + n.width && a.y >= n.y && a.y <= n.y + n.height)
        return !0;
    return !1;
  }
  /**
   * 绘制完整路径 - 使用与录制时相同的笔迹样式算法
   */
  drawCompletePath(e) {
    if (e.points.length < 2)
      return;
    const n = e.penStyle || this.options.penStyle || "pen";
    this.drawStyledStrokeForReplay(e.points, n, e.strokeColor, e.strokeWidth);
  }
  /**
   * 绘制部分路径 - 使用与录制时相同的笔迹样式算法
   */
  drawPartialPath(e, n) {
    if (e.points.length < 2)
      return;
    const a = e.startTime || 0, s = e.duration || 0, o = a + s * n, r = this.getPointsUpToTime(e.points, a, o);
    if (r.length < 2)
      return;
    const u = e.penStyle || this.options.penStyle || "pen";
    this.drawStyledStrokeForReplay(r, u, e.strokeColor, e.strokeWidth);
  }
  /**
   * 获取指定时间内的所有点
   */
  getPointsUpToTime(e, n, a) {
    const s = [];
    for (let o = 0; o < e.length; o++) {
      const r = e[o], u = n + (r.relativeTime || o * 50);
      if (u <= a)
        s.push(r);
      else {
        if (o > 0) {
          const h = e[o - 1], d = n + (h.relativeTime || (o - 1) * 50);
          if (d <= a) {
            const f = (a - d) / (u - d), c = {
              x: h.x + (r.x - h.x) * f,
              y: h.y + (r.y - h.y) * f,
              time: a,
              pressure: h.pressure ? h.pressure + (r.pressure || h.pressure - h.pressure) * f : r.pressure
            };
            s.push(c);
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
  calculateDynamicStrokeWidth(e, n, a, s) {
    switch (a) {
      case "pen":
        return 1;
      case "brush":
        if (n) {
          const h = Math.sqrt(Math.pow(e.x - n.x, 2) + Math.pow(e.y - n.y, 2)), d = Math.max(1, (e.time || 0) - (n.time || 0)), f = h / d, c = Math.max(0.1, Math.min(3, 100 / Math.max(f, 1))), T = e.pressure || 0.5, y = 0.8 + Math.random() * 0.4;
          return Math.max(1, Math.min(20, s * c * (0.3 + T * 1.4) * y));
        }
        return s;
      case "marker":
        return 12;
      case "pencil":
        const o = e.pressure || 0.5, r = 0.9 + Math.random() * 0.2;
        return s * (0.7 + o * 0.6) * r;
      case "ballpoint":
        const u = e.pressure || 0.5;
        return s * (0.8 + u * 0.4);
      default:
        return s;
    }
  }
  /**
   * 根据笔迹样式绘制线段（与录制时完全一致）
   */
  drawStyledStrokeForReplay(e, n, a, s) {
    if (!(e.length < 2))
      switch (this.ctx.strokeStyle = a, n) {
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
            const r = e[o], u = e[o - 1], h = this.calculateDynamicStrokeWidth(r, u, n, s);
            this.ctx.lineWidth = h, this.ctx.beginPath(), this.ctx.moveTo(u.x, u.y), this.ctx.lineTo(r.x, r.y), this.ctx.stroke(), h > 8 && Math.random() > 0.6 && (this.ctx.globalAlpha = 0.2, this.ctx.beginPath(), this.ctx.arc(r.x, r.y, h * 0.3, 0, Math.PI * 2), this.ctx.fill(), this.ctx.globalAlpha = 1);
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
            const r = e[o], u = e[o - 1], h = this.calculateDynamicStrokeWidth(r, u, n, s);
            this.ctx.lineWidth = h, this.ctx.globalAlpha = 0.8, this.ctx.beginPath(), this.ctx.moveTo(u.x, u.y), this.ctx.lineTo(r.x, r.y), this.ctx.stroke();
            for (let d = 0; d < 3; d++)
              if (Math.random() > 0.5) {
                this.ctx.globalAlpha = 0.2, this.ctx.lineWidth = h * 0.3;
                const f = (Math.random() - 0.5) * 2, c = (Math.random() - 0.5) * 2;
                this.ctx.beginPath(), this.ctx.moveTo(u.x + f, u.y + c), this.ctx.lineTo(r.x + f, r.y + c), this.ctx.stroke();
              }
            if (Math.random() > 0.8) {
              this.ctx.globalAlpha = 0.4;
              for (let d = 0; d < 5; d++)
                this.ctx.beginPath(), this.ctx.arc(
                  r.x + (Math.random() - 0.5) * 3,
                  r.y + (Math.random() - 0.5) * 3,
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
          for (let o = 1; o < e.length; o++) {
            const r = e[o], u = e[o - 1], h = this.calculateDynamicStrokeWidth(r, u, n, s);
            if (Math.random() > 0.1) {
              if (this.ctx.lineWidth = h, this.ctx.globalAlpha = Math.random() > 0.2 ? 1 : 0.7, this.ctx.beginPath(), o < e.length - 1) {
                const d = e[o + 1], f = this.getControlPoint(r, u, d);
                this.ctx.moveTo(u.x, u.y), this.ctx.quadraticCurveTo(f.x, f.y, r.x, r.y);
              } else
                this.ctx.moveTo(u.x, u.y), this.ctx.lineTo(r.x, r.y);
              this.ctx.stroke();
            }
            Math.random() > 0.95 && (this.ctx.globalAlpha = 0.8, this.ctx.beginPath(), this.ctx.arc(r.x, r.y, h * 0.8, 0, Math.PI * 2), this.ctx.fill());
          }
          this.ctx.globalAlpha = 1;
          break;
      }
  }
  /**
   * 获取控制点（用于贝塞尔曲线平滑） - 与signature.ts中的实现一致
   */
  getControlPoint(e, n, a) {
    const o = {
      length: Math.sqrt(Math.pow(a.x - n.x, 2) + Math.pow(a.y - n.y, 2)),
      angle: Math.atan2(a.y - n.y, a.x - n.x)
    }, r = o.angle + Math.PI, u = o.length * 0.2;
    return {
      x: e.x + Math.cos(r) * u,
      y: e.y + Math.sin(r) * u,
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
  on(e, n) {
    this.eventCallbacks.has(e) || this.eventCallbacks.set(e, []), this.eventCallbacks.get(e).push(n);
  }
  /**
   * 移除事件监听器
   */
  off(e, n) {
    if (this.eventCallbacks.has(e))
      if (n) {
        const a = this.eventCallbacks.get(e), s = a.indexOf(n);
        s > -1 && a.splice(s, 1);
      } else
        this.eventCallbacks.delete(e);
  }
  /**
   * 触发事件
   */
  emit(e, ...n) {
    const a = this.eventCallbacks.get(e);
    a && a.forEach((s) => s(...n));
  }
  /**
   * 销毁控制器
   */
  destroy() {
    this.stop(), this.eventCallbacks.clear(), this.replayData = null;
  }
}
function ot(l) {
  const e = l.paths.map((h) => {
    const d = h.points.map((c, T) => {
      var C;
      let y;
      if (c.time && h.points[0].time)
        y = c.time - h.points[0].time;
      else if (T === 0)
        y = 0;
      else {
        const E = h.points[T - 1], P = Math.sqrt(
          Math.pow(c.x - E.x, 2) + Math.pow(c.y - E.y, 2)
        ) / 100 * 1e3;
        y = (((C = d[T - 1]) == null ? void 0 : C.relativeTime) || 0) + Math.max(P, 16);
      }
      return {
        ...c,
        relativeTime: y
      };
    }), f = d.length > 0 ? d[d.length - 1].relativeTime : 0;
    return {
      ...h,
      points: d,
      duration: f
    };
  }), n = [];
  for (let h = 0; h < e.length; h++) {
    const d = e[h];
    let f;
    if (h === 0)
      f = 0;
    else {
      const y = n[h - 1], C = it(
        l.paths[h - 1].points,
        l.paths[h].points
      );
      f = y.endTime + C;
    }
    const c = f + d.duration, T = {
      ...d,
      startTime: f,
      endTime: c
    };
    console.log(`路径 ${h}: 开始时间=${f}, 结束时间=${c}, 持续时间=${d.duration}`), n.push(T);
  }
  const a = n.length > 0 ? n[n.length - 1].endTime : 0;
  console.log("回放数据生成完成:"), console.log("- 路径数量:", n.length), console.log("- 总时长:", a), console.log("- 路径详情:", n.map((h) => ({
    startTime: h.startTime,
    endTime: h.endTime,
    duration: h.duration,
    pointCount: h.points.length
  })));
  const s = n.reduce((h, d) => h + rt(d.points), 0), o = a > 0 ? s / (a / 1e3) : 0, r = n.slice(1).map((h, d) => {
    const f = n[d];
    return h.startTime - f.endTime;
  }), u = r.length > 0 ? r.reduce((h, d) => h + d, 0) / r.length : 0;
  return {
    paths: n,
    totalDuration: a,
    speed: 1,
    metadata: {
      deviceType: lt(l),
      averageSpeed: o,
      totalDistance: s,
      averagePauseTime: u
    }
  };
}
function it(l, e) {
  if (l.length === 0 || e.length === 0)
    return 200;
  const n = l[l.length - 1], a = e[0];
  if (n.time && a.time)
    return Math.max(a.time - n.time, 50);
  const s = Math.sqrt(
    Math.pow(a.x - n.x, 2) + Math.pow(a.y - n.y, 2)
  );
  return Math.min(Math.max(s * 2, 100), 1e3);
}
function lt(l) {
  const e = l.paths.reduce((o, r) => o + r.points.length, 0), n = l.paths.length;
  if (e === 0)
    return "touch";
  const a = e / n;
  return a > 20 ? "touch" : a < 10 ? "mouse" : l.paths.some(
    (o) => o.points.some((r) => r.pressure !== void 0)
  ) ? "pen" : "touch";
}
function rt(l) {
  let e = 0;
  for (let n = 1; n < l.length; n++) {
    const a = l[n].x - l[n - 1].x, s = l[n].y - l[n - 1].y;
    e += Math.sqrt(a * a + s * s);
  }
  return e;
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
function ht(l) {
  return Me[l];
}
function Et() {
  return Object.entries(Me).map(([l, e]) => ({
    key: l,
    config: e
  }));
}
function ut(l, e) {
  const n = ht(l);
  return {
    strokeWidth: n.strokeWidth,
    smoothing: n.smoothing,
    pressure: n.pressure,
    lineCap: n.lineCap,
    lineJoin: n.lineJoin,
    strokeColor: e || n.recommendedColor || "#000000"
  };
}
const ct = ["width", "height"], dt = {
  key: 1,
  class: "signature-toolbar"
}, mt = ["disabled"], pt = ["disabled"], gt = ["disabled"], ft = {
  key: 2,
  class: "replay-controls"
}, yt = { class: "replay-buttons" }, vt = ["disabled"], xt = { key: 0 }, bt = { key: 1 }, wt = ["disabled"], Tt = { class: "replay-progress" }, Ct = ["max", "value", "disabled"], kt = { class: "time-display" }, Mt = { class: "replay-speed" }, Pt = /* @__PURE__ */ Ge({
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
  setup(l, { expose: e, emit: n }) {
    const a = l, s = n, o = D(), r = D(!1), u = D(null), h = D(X(0, 0)), d = D([]), f = D(-1), c = D(null), T = D(!1), y = D("idle"), C = D(0), E = D(0), W = M(() => typeof a.width == "number" ? a.width : 800), P = M(() => typeof a.height == "number" ? a.height : 300), Se = M(() => ({
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
    })), Re = M(() => T.value ? !1 : a.placeholder && B(h.value)), K = M(() => f.value > 0), Z = M(() => f.value < d.value.length - 1), ee = M(() => T.value && c.value), R = M(() => !ee.value && !a.disabled), Ie = M(() => {
      var t;
      return ee.value && ((t = a.replayOptions) == null ? void 0 : t.showControls) !== !1;
    }), I = M(() => {
      if (a.penStyle) {
        const t = ut(a.penStyle, a.strokeColor);
        return {
          strokeColor: t.strokeColor,
          strokeWidth: a.strokeWidth || t.strokeWidth,
          smoothing: a.smoothing !== void 0 ? a.smoothing : t.smoothing,
          pressure: {
            enabled: a.pressureSensitive !== void 0 ? a.pressureSensitive : t.pressure.enabled,
            min: a.minStrokeWidth || t.pressure.min,
            max: a.maxStrokeWidth || t.pressure.max
          },
          lineCap: t.lineCap,
          lineJoin: t.lineJoin
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
      var t;
      return ((t = o.value) == null ? void 0 : t.getContext("2d")) || null;
    }, $ = (t, i) => {
      const p = o.value, v = p.getBoundingClientRect(), m = p.width / v.width, g = p.height / v.height;
      return {
        x: (t - v.left) * m,
        y: (i - v.top) * g,
        time: Date.now()
      };
    }, ae = (t) => {
      if (!R.value)
        return;
      r.value = !0;
      const i = performance.now(), p = { ...t, time: i };
      u.value = {
        points: [p],
        strokeColor: a.strokeColor,
        strokeWidth: a.strokeWidth,
        penStyle: a.penStyle,
        // 保存笔迹样式
        startTime: i,
        endTime: i,
        duration: 0
      }, s("signature-start");
    }, L = (t, i, p, v) => {
      switch (p) {
        case "pen":
          return 1;
        case "brush":
          if (i) {
            const S = Math.sqrt(Math.pow(t.x - i.x, 2) + Math.pow(t.y - i.y, 2)), k = Math.max(1, (t.time || 0) - (i.time || 0)), _ = S / k, Y = Math.max(0.1, Math.min(3, 100 / Math.max(_, 1))), Ue = t.pressure || 0.5, He = 0.8 + Math.random() * 0.4;
            return Math.max(1, Math.min(20, v * Y * (0.3 + Ue * 1.4) * He));
          }
          return v;
        case "marker":
          return 12;
        case "pencil":
          const m = t.pressure || 0.5, g = 0.9 + Math.random() * 0.2;
          return v * (0.7 + m * 0.6) * g;
        case "ballpoint":
          const x = t.pressure || 0.5;
          return v * (0.8 + x * 0.4);
        default:
          return v;
      }
    }, U = (t, i, p) => {
      var v;
      if (!(i.length < 2))
        switch (t.strokeStyle = ((v = u.value) == null ? void 0 : v.strokeColor) || I.value.strokeColor, t.lineCap = I.value.lineCap || "round", t.lineJoin = I.value.lineJoin || "round", p) {
          case "pen":
            if (t.lineWidth = 1, t.lineCap = "butt", t.lineJoin = "miter", t.beginPath(), t.moveTo(i[0].x, i[0].y), i.length >= 3) {
              for (let m = 1; m < i.length - 1; m++) {
                const g = ne(i[m], i[m - 1], i[m + 1]);
                t.quadraticCurveTo(g.x, g.y, i[m].x, i[m].y);
              }
              t.lineTo(i[i.length - 1].x, i[i.length - 1].y);
            } else
              for (let m = 1; m < i.length; m++)
                t.lineTo(i[m].x, i[m].y);
            t.stroke();
            break;
          case "brush":
            t.lineCap = "round", t.lineJoin = "round";
            for (let m = 1; m < i.length; m++) {
              const g = i[m], x = i[m - 1], S = L(g, x, p, I.value.strokeWidth), k = t.createLinearGradient(x.x, x.y, g.x, g.y);
              k.addColorStop(0, t.strokeStyle), k.addColorStop(1, t.strokeStyle), t.lineWidth = S, t.beginPath(), t.moveTo(x.x, x.y), t.lineTo(g.x, g.y), t.stroke(), S > 8 && Math.random() > 0.6 && (t.globalAlpha = 0.2, t.beginPath(), t.arc(g.x, g.y, S * 0.3, 0, Math.PI * 2), t.fill(), t.globalAlpha = 1);
            }
            break;
          case "marker":
            t.globalAlpha = 0.7, t.lineWidth = 12, t.lineCap = "square", t.lineJoin = "bevel", t.beginPath(), t.moveTo(i[0].x, i[0].y);
            for (let m = 1; m < i.length; m++)
              t.lineTo(i[m].x, i[m].y);
            t.stroke(), t.globalAlpha = 0.3, t.lineWidth = 16, t.beginPath(), t.moveTo(i[0].x, i[0].y);
            for (let m = 1; m < i.length; m++)
              t.lineTo(i[m].x, i[m].y);
            t.stroke(), t.globalAlpha = 1;
            break;
          case "pencil":
            t.lineCap = "round", t.lineJoin = "round";
            for (let m = 1; m < i.length; m++) {
              const g = i[m], x = i[m - 1], S = L(g, x, p, I.value.strokeWidth);
              t.lineWidth = S, t.globalAlpha = 0.8, t.beginPath(), t.moveTo(x.x, x.y), t.lineTo(g.x, g.y), t.stroke();
              for (let k = 0; k < 3; k++)
                if (Math.random() > 0.5) {
                  t.globalAlpha = 0.2, t.lineWidth = S * 0.3;
                  const _ = (Math.random() - 0.5) * 2, Y = (Math.random() - 0.5) * 2;
                  t.beginPath(), t.moveTo(x.x + _, x.y + Y), t.lineTo(g.x + _, g.y + Y), t.stroke();
                }
              if (Math.random() > 0.8) {
                t.globalAlpha = 0.4;
                for (let k = 0; k < 5; k++)
                  t.beginPath(), t.arc(
                    g.x + (Math.random() - 0.5) * 3,
                    g.y + (Math.random() - 0.5) * 3,
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
            for (let m = 1; m < i.length; m++) {
              const g = i[m], x = i[m - 1], S = L(g, x, p, I.value.strokeWidth);
              if (Math.random() > 0.1) {
                if (t.lineWidth = S, t.globalAlpha = Math.random() > 0.2 ? 1 : 0.7, t.beginPath(), I.value.smoothing && m < i.length - 1) {
                  const k = i[m + 1], _ = ne(g, x, k);
                  t.moveTo(x.x, x.y), t.quadraticCurveTo(_.x, _.y, g.x, g.y);
                } else
                  t.moveTo(x.x, x.y), t.lineTo(g.x, g.y);
                t.stroke();
              }
              Math.random() > 0.95 && (t.globalAlpha = 0.8, t.beginPath(), t.arc(g.x, g.y, S * 0.8, 0, Math.PI * 2), t.fill());
            }
            t.globalAlpha = 1;
            break;
        }
    }, Ae = () => {
      if (!u.value || u.value.points.length < 2)
        return;
      const t = te();
      if (!t)
        return;
      const i = u.value.points, p = i.length, v = a.penStyle || "pen";
      if (p === 2)
        U(t, i, v);
      else if (p >= 3) {
        const m = i.slice(-3);
        U(t, m, v);
      }
    }, ne = (t, i, p) => {
      const m = {
        length: Math.sqrt(Math.pow(p.x - i.x, 2) + Math.pow(p.y - i.y, 2)),
        angle: Math.atan2(p.y - i.y, p.x - i.x)
      }, g = m.angle + Math.PI, x = m.length * 0.2;
      return {
        x: t.x + Math.cos(g) * x,
        y: t.y + Math.sin(g) * x,
        time: t.time || 0
      };
    }, _e = (t, i) => {
      if (i.points.length < 2)
        return;
      const p = i.penStyle || a.penStyle || "pen", v = u.value;
      u.value = i, U(t, i.points, p), u.value = v;
    }, se = (t) => {
      if (!r.value || !u.value || !R.value)
        return;
      const i = performance.now(), p = { ...t, time: i };
      u.value.points.push(p), u.value.startTime && (u.value.endTime = i, u.value.duration = i - u.value.startTime), Ae(), re(), s("signature-drawing", h.value);
    }, oe = () => {
      if (!(!r.value || !u.value)) {
        if (r.value = !1, u.value.points.length > 0) {
          const t = u.value.points[u.value.points.length - 1];
          t.time && u.value.startTime && (u.value.endTime = t.time, u.value.duration = t.time - u.value.startTime);
        }
        h.value.paths.push(u.value), h.value.isEmpty = !1, h.value.timestamp = Date.now(), q(), A(), u.value = null, s("signature-end", h.value);
      }
    }, Ee = (t) => {
      t.preventDefault();
      const i = $(t.clientX, t.clientY);
      ae(i);
    }, Fe = (t) => {
      if (t.preventDefault(), !r.value)
        return;
      const i = $(t.clientX, t.clientY);
      se(i);
    }, ie = (t) => {
      t.preventDefault(), oe();
    }, Je = (t) => {
      if (t.preventDefault(), t.touches.length !== 1)
        return;
      const i = t.touches[0], p = $(i.clientX, i.clientY);
      ae(p);
    }, Oe = (t) => {
      if (t.preventDefault(), t.touches.length !== 1 || !r.value)
        return;
      const i = t.touches[0], p = $(i.clientX, i.clientY);
      se(p);
    }, le = (t) => {
      t.preventDefault(), oe();
    }, re = () => {
      h.value.canvasSize = {
        width: W.value,
        height: P.value
      }, h.value.isEmpty = B(h.value);
    }, q = () => {
      d.value = d.value.slice(0, f.value + 1), d.value.push(O(h.value)), f.value = d.value.length - 1;
      const t = 50;
      d.value.length > t && (d.value = d.value.slice(-t), f.value = d.value.length - 1);
    }, A = () => {
      const t = te();
      t && (t.clearRect(0, 0, W.value, P.value), a.backgroundColor && a.backgroundColor !== "transparent" && (t.fillStyle = a.backgroundColor, t.fillRect(0, 0, W.value, P.value)), h.value.paths.forEach((i) => {
        i.points.length > 0 && _e(t, i);
      }));
    }, z = () => {
      if (console.log("初始化回放控制器"), console.log("canvas引用是否存在:", !!o.value), !o.value) {
        console.error("canvas引用不存在，无法初始化回放控制器");
        return;
      }
      c.value && (console.log("销毁现有回放控制器"), c.value.destroy()), console.log("创建新的回放控制器"), c.value = new st(o.value), console.log("回放控制器创建成功:", !!c.value), c.value.on("replay-start", () => {
        y.value = "playing", s("replay-start");
      }), c.value.on("replay-progress", (t, i) => {
        C.value = t, E.value = i, s("replay-progress", t, i);
      }), c.value.on("replay-pause", () => {
        y.value = "paused", s("replay-pause");
      }), c.value.on("replay-resume", () => {
        y.value = "playing", s("replay-resume");
      }), c.value.on("replay-stop", () => {
        y.value = "stopped", s("replay-stop");
      }), c.value.on("replay-complete", () => {
        y.value = "completed", s("replay-complete");
      }), c.value.on("replay-path-start", (t, i) => {
        s("replay-path-start", t, i);
      }), c.value.on("replay-path-end", (t, i) => {
        s("replay-path-end", t, i);
      }), c.value.on("replay-speed-change", (t) => {
        s("replay-speed-change", t);
      });
    }, he = (t, i) => {
      if (c.value || z(), c.value) {
        T.value = !0;
        const p = {
          ...i,
          drawOptions: I.value,
          penStyle: a.penStyle
        };
        c.value.setReplayData(t, p), console.log("startReplay调用，自动播放:", i == null ? void 0 : i.autoPlay), (i == null ? void 0 : i.autoPlay) === !0 && c.value.play();
      }
    }, ue = (t) => {
      T.value = t, !t && c.value && (c.value.stop(), A());
    }, $e = () => B(h.value) ? null : ot(h.value), ce = () => {
      console.log("play方法被调用"), console.log("回放控制器是否存在:", !!c.value), c.value || (console.log("回放控制器不存在，尝试初始化"), z()), c.value ? (console.log("调用回放控制器的play方法"), c.value.play()) : console.error("回放控制器初始化失败，无法播放");
    }, de = () => {
      var t;
      (t = c.value) == null || t.pause();
    }, me = () => {
      var t;
      (t = c.value) == null || t.stop();
    }, pe = (t) => {
      var i;
      (i = c.value) == null || i.seek(t);
    }, ge = (t) => {
      var i;
      (i = c.value) == null || i.setSpeed(t);
    }, qe = () => {
      var t;
      return ((t = c.value) == null ? void 0 : t.getState()) || "idle";
    }, ze = () => {
      var t;
      return ((t = c.value) == null ? void 0 : t.getCurrentTime()) || 0;
    }, H = () => {
      var t;
      return ((t = c.value) == null ? void 0 : t.getTotalDuration()) || 0;
    }, Ye = () => {
      var t;
      return ((t = c.value) == null ? void 0 : t.getProgress()) || 0;
    }, fe = (t) => {
      const i = Math.floor(t / 1e3), p = Math.floor(i / 60), v = i % 60;
      return `${p}:${v.toString().padStart(2, "0")}`;
    }, ye = () => {
      R.value && (h.value = X(W.value, P.value), A(), q(), s("signature-clear"));
    }, ve = () => {
      !K.value || !R.value || (f.value--, h.value = O(d.value[f.value]), A(), s("signature-undo", h.value));
    }, xe = () => {
      !Z.value || !R.value || (f.value++, h.value = O(d.value[f.value]), A(), s("signature-redo", h.value));
    }, be = (t) => {
      const i = o.value;
      return at(i, h.value, t);
    }, we = () => B(h.value), Te = async (t) => {
      if (!R.value)
        return;
      const i = o.value;
      await nt(i, t), h.value = X(W.value, P.value), h.value.isEmpty = !1, q();
    }, Be = () => O(h.value), Xe = (t) => {
      R.value && (h.value = O(t), A(), q());
    }, Ce = (t, i) => {
      const p = t || W.value, v = i || P.value, m = be({ format: "png" });
      j(() => {
        const g = o.value;
        g.width = p, g.height = v, we() || Te(m), re();
      });
    }, Le = () => {
      const t = o.value;
      t.width = W.value, t.height = P.value, h.value = X(W.value, P.value), d.value = [O(h.value)], f.value = 0, A();
    };
    return N([() => a.width, () => a.height], () => {
      j(() => {
        o.value && Ce();
      });
    }), N(() => a.replayMode, (t) => {
      t !== void 0 && ue(t);
    }), N(() => a.replayData, (t) => {
      if (console.log("watch监听到回放数据变化:", t), console.log("当前回放模式:", a.replayMode), console.log("回放控制器是否存在:", !!c.value), t && a.replayMode)
        if (c.value || (console.log("回放控制器未初始化，先初始化"), z()), c.value) {
          console.log("开始设置回放数据到控制器");
          const i = {
            ...a.replayOptions,
            drawOptions: I.value,
            penStyle: a.penStyle
          };
          c.value.setReplayData(t, i), console.log("回放数据已更新:", t);
        } else
          console.error("回放控制器初始化失败");
      else
        t || console.log("回放数据为空，跳过设置"), a.replayMode || console.log("不在回放模式，跳过设置");
    }, { immediate: !0 }), Ve(() => {
      j(() => {
        Le(), z(), a.replayMode && a.replayData && he(a.replayData, a.replayOptions);
      });
    }), Qe(() => {
      c.value && (c.value.destroy(), c.value = null);
    }), e({
      clear: ye,
      undo: ve,
      redo: xe,
      save: be,
      isEmpty: we,
      fromDataURL: Te,
      getSignatureData: Be,
      setSignatureData: Xe,
      resize: Ce,
      // 回放相关方法
      startReplay: he,
      getReplayData: $e,
      setReplayMode: ue,
      play: ce,
      pause: de,
      stop: me,
      seek: pe,
      setSpeed: ge,
      getState: qe,
      getCurrentTime: ze,
      getTotalDuration: H,
      getProgress: Ye
    }), (t, i) => (F(), J("div", {
      class: "electronic-signature",
      style: G(Se.value)
    }, [
      b("canvas", {
        ref_key: "canvasRef",
        ref: o,
        width: W.value,
        height: P.value,
        style: G(De.value),
        onMousedown: Ee,
        onMousemove: Fe,
        onMouseup: ie,
        onMouseleave: ie,
        onTouchstart: Je,
        onTouchmove: Oe,
        onTouchend: le,
        onTouchcancel: le
      }, null, 44, ct),
      Re.value ? (F(), J("div", {
        key: 0,
        class: "signature-placeholder",
        style: G(We.value)
      }, V(t.placeholder), 5)) : Q("", !0),
      t.showToolbar ? (F(), J("div", dt, [
        b("button", {
          onClick: ye,
          disabled: !R.value
        }, "清除", 8, mt),
        b("button", {
          onClick: ve,
          disabled: !R.value || !K.value
        }, "撤销", 8, pt),
        b("button", {
          onClick: xe,
          disabled: !R.value || !Z.value
        }, "重做", 8, gt)
      ])) : Q("", !0),
      Ie.value ? (F(), J("div", ft, [
        b("div", yt, [
          b("button", {
            onClick: i[0] || (i[0] = (p) => y.value === "playing" ? de() : ce()),
            disabled: y.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            y.value === "playing" ? (F(), J("span", xt, "⏸️")) : (F(), J("span", bt, "▶️"))
          ], 8, vt),
          b("button", {
            onClick: i[1] || (i[1] = (p) => me()),
            disabled: y.value === "idle",
            class: "replay-btn stop-btn"
          }, " ⏹️ ", 8, wt)
        ]),
        b("div", Tt, [
          b("input", {
            type: "range",
            min: "0",
            max: H(),
            value: E.value,
            onInput: i[2] || (i[2] = (p) => pe(Number(p.target.value))),
            class: "progress-slider",
            disabled: y.value === "idle"
          }, null, 40, Ct),
          b("div", kt, [
            b("span", null, V(fe(E.value)), 1),
            i[4] || (i[4] = b("span", null, "/", -1)),
            b("span", null, V(fe(H())), 1)
          ])
        ]),
        b("div", Mt, [
          i[6] || (i[6] = b("label", null, "速度:", -1)),
          b("select", {
            onChange: i[3] || (i[3] = (p) => ge(Number(p.target.value))),
            class: "speed-select"
          }, i[5] || (i[5] = [
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
const St = (l, e) => {
  const n = l.__vccOpts || l;
  for (const [a, s] of e)
    n[a] = s;
  return n;
}, Pe = /* @__PURE__ */ St(Pt, [["__scopeId", "data-v-37d68792"]]);
function Dt() {
  return window.devicePixelRatio || 1;
}
function Ft(l) {
  const e = l.getContext("2d"), n = Dt(), a = l.clientWidth, s = l.clientHeight;
  return l.width = a * n, l.height = s * n, e.scale(n, n), l.style.width = a + "px", l.style.height = s + "px", e;
}
function Wt(l) {
  if (l.paths.length === 0)
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0
    };
  let e = 1 / 0, n = 1 / 0, a = -1 / 0, s = -1 / 0;
  return l.paths.forEach((o) => {
    o.points.forEach((r) => {
      e = Math.min(e, r.x), n = Math.min(n, r.y), a = Math.max(a, r.x), s = Math.max(s, r.y);
    });
  }), {
    minX: e,
    minY: n,
    maxX: a,
    maxY: s,
    width: a - e,
    height: s - n
  };
}
function Jt(l, e, n = 10) {
  const a = Wt(e);
  if (a.width === 0 || a.height === 0) {
    const h = document.createElement("canvas");
    return h.width = 1, h.height = 1, h;
  }
  const s = document.createElement("canvas"), o = s.getContext("2d"), r = a.width + n * 2, u = a.height + n * 2;
  return s.width = r, s.height = u, o.drawImage(
    l,
    a.minX - n,
    a.minY - n,
    r,
    u,
    0,
    0,
    r,
    u
  ), s;
}
function Ot(l, e, n, a = !0) {
  const s = document.createElement("canvas"), o = s.getContext("2d");
  let r = e, u = n;
  if (a) {
    const h = l.width / l.height, d = e / n;
    h > d ? u = e / h : r = n * h;
  }
  return s.width = r, s.height = u, o.imageSmoothingEnabled = !0, o.imageSmoothingQuality = "high", o.drawImage(l, 0, 0, r, u), s;
}
function $t(l, e, n = {}) {
  const {
    fontSize: a = 12,
    fontFamily: s = "Arial",
    color: o = "#999",
    opacity: r = 0.5,
    position: u = "bottom-right"
  } = n, h = document.createElement("canvas"), d = h.getContext("2d");
  h.width = l.width, h.height = l.height, d.drawImage(l, 0, 0), d.font = `${a}px ${s}`, d.fillStyle = o, d.globalAlpha = r;
  const c = d.measureText(e).width, T = a;
  let y, C;
  switch (u) {
    case "top-left":
      y = 10, C = T + 10;
      break;
    case "top-right":
      y = l.width - c - 10, C = T + 10;
      break;
    case "bottom-left":
      y = 10, C = l.height - 10;
      break;
    case "bottom-right":
      y = l.width - c - 10, C = l.height - 10;
      break;
    case "center":
      y = (l.width - c) / 2, C = (l.height + T) / 2;
      break;
    default:
      y = l.width - c - 10, C = l.height - 10;
  }
  return d.fillText(e, y, C), d.globalAlpha = 1, h;
}
function qt(l) {
  const e = document.createElement("canvas"), n = e.getContext("2d");
  e.width = l.width, e.height = l.height, n.drawImage(l, 0, 0);
  const a = n.getImageData(0, 0, l.width, l.height), s = a.data;
  for (let o = 0; o < s.length; o += 4) {
    const r = s[o] * 0.299 + s[o + 1] * 0.587 + s[o + 2] * 0.114;
    s[o] = r, s[o + 1] = r, s[o + 2] = r;
  }
  return n.putImageData(a, 0, 0), e;
}
const Rt = (l) => {
  l.component("ElectronicSignature", Pe);
}, zt = {
  install: Rt,
  ElectronicSignature: Pe
}, Yt = "1.0.0";
export {
  Pe as ElectronicSignature,
  Me as PEN_STYLE_CONFIGS,
  st as SignatureReplayController,
  $t as addWatermark,
  et as calculateStrokeWidth,
  O as cloneSignatureData,
  qt as convertToGrayscale,
  ut as createDrawOptionsFromPenStyle,
  X as createEmptySignatureData,
  ot as createReplayData,
  Jt as cropSignature,
  zt as default,
  _t as drawSmoothPath,
  at as exportSignature,
  Et as getAllPenStyles,
  Ke as getAngle,
  Ze as getControlPoint,
  Dt as getDevicePixelRatio,
  ke as getDistance,
  ht as getPenStyleConfig,
  Wt as getSignatureBounds,
  B as isSignatureEmpty,
  nt as loadImageToCanvas,
  Ot as resizeSignature,
  Ft as setupHighDPICanvas,
  tt as signatureToSVG,
  Yt as version
};
