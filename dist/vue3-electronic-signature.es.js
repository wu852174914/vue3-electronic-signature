var Ne = Object.defineProperty;
var je = (i, t, n) => t in i ? Ne(i, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : i[t] = n;
var C = (i, t, n) => (je(i, typeof t != "symbol" ? t + "" : t, n), n);
import { defineComponent as Ge, ref as D, computed as M, watch as N, nextTick as j, onMounted as Ve, onUnmounted as Qe, openBlock as J, createElementBlock as $, normalizeStyle as G, createElementVNode as b, toDisplayString as V, createCommentVNode as Q } from "vue";
function Ce(i, t) {
  return Math.sqrt(
    Math.pow(t.x - i.x, 2) + Math.pow(t.y - i.y, 2)
  );
}
function Ke(i, t) {
  return Math.atan2(t.y - i.y, t.x - i.x);
}
function Ze(i, t, n, a) {
  const l = t || i, s = n || i, h = 0.2, u = Ke(l, s) * (a ? 1 : -1), r = Ce(l, s) * h;
  return {
    x: i.x + Math.cos(u) * r,
    y: i.y + Math.sin(u) * r,
    time: i.time
  };
}
function et(i, t, n) {
  if (!n.pressure.enabled)
    return n.strokeWidth;
  const a = Ce(i, t), l = t.time - i.time, s = l > 0 ? a / l : 0, h = Math.max(0.1, Math.min(1, 1 - s * 0.01)), { min: u, max: r } = n.pressure;
  return u + (r - u) * h;
}
function It(i, t, n) {
  if (t.length < 2)
    return;
  if (i.strokeStyle = n.strokeColor, i.lineCap = "round", i.lineJoin = "round", !n.smoothing || t.length < 3) {
    i.beginPath(), i.lineWidth = n.strokeWidth, i.moveTo(t[0].x, t[0].y);
    for (let l = 1; l < t.length; l++)
      i.lineTo(t[l].x, t[l].y);
    i.stroke();
    return;
  }
  i.beginPath(), i.moveTo(t[0].x, t[0].y);
  for (let l = 1; l < t.length - 1; l++) {
    const s = t[l], h = t[l + 1];
    n.pressure.enabled ? i.lineWidth = et(t[l - 1], s, n) : i.lineWidth = n.strokeWidth;
    const u = Ze(s, t[l - 1], h);
    i.quadraticCurveTo(u.x, u.y, s.x, s.y);
  }
  const a = t[t.length - 1];
  i.lineTo(a.x, a.y), i.stroke();
}
function tt(i) {
  const { canvasSize: t, paths: n } = i;
  let a = `<svg width="${t.width}" height="${t.height}" xmlns="http://www.w3.org/2000/svg">`;
  return n.forEach((l) => {
    if (l.points.length < 2)
      return;
    let s = `M ${l.points[0].x} ${l.points[0].y}`;
    for (let h = 1; h < l.points.length; h++)
      s += ` L ${l.points[h].x} ${l.points[h].y}`;
    a += `<path d="${s}" stroke="${l.strokeColor}" stroke-width="${l.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), a += "</svg>", a;
}
function at(i, t, n = { format: "png" }) {
  const { format: a, quality: l = 0.9, size: s, backgroundColor: h } = n;
  if (a === "svg")
    return tt(t);
  const u = document.createElement("canvas"), r = u.getContext("2d");
  if (s) {
    u.width = s.width, u.height = s.height;
    const d = s.width / i.width, y = s.height / i.height;
    r.scale(d, y);
  } else
    u.width = i.width, u.height = i.height;
  switch (h && h !== "transparent" && (r.fillStyle = h, r.fillRect(0, 0, u.width, u.height)), r.drawImage(i, 0, 0), a) {
    case "jpeg":
      return u.toDataURL("image/jpeg", l);
    case "base64":
      return u.toDataURL("image/png").split(",")[1];
    case "png":
    default:
      return u.toDataURL("image/png");
  }
}
function nt(i, t) {
  return new Promise((n, a) => {
    const l = new Image();
    l.onload = () => {
      const s = i.getContext("2d");
      s.clearRect(0, 0, i.width, i.height), s.drawImage(l, 0, 0, i.width, i.height), n();
    }, l.onerror = a, l.src = t;
  });
}
function z(i) {
  return i.paths.length === 0 || i.paths.every((t) => t.points.length === 0);
}
function B(i, t) {
  return {
    paths: [],
    canvasSize: { width: i, height: t },
    timestamp: Date.now(),
    isEmpty: !0
  };
}
function F(i) {
  return JSON.parse(JSON.stringify(i));
}
class ot {
  constructor(t) {
    C(this, "canvas");
    C(this, "ctx");
    C(this, "replayData", null);
    C(this, "state", "idle");
    C(this, "currentTime", 0);
    C(this, "speed", 1);
    C(this, "animationId", null);
    C(this, "startTimestamp", 0);
    C(this, "pausedTime", 0);
    C(this, "options", {});
    // 事件回调
    C(this, "eventCallbacks", /* @__PURE__ */ new Map());
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
      const l = this.replayData.paths[a], s = l.startTime || 0, h = l.endTime || s + (l.duration || 0);
      if (t < s)
        break;
      if (t >= h) {
        this.drawCompletePath(l), !n && Math.abs(t - h) < 32 && this.emit("replay-path-end", a, l);
        continue;
      }
      n = !0;
      const u = Math.max(0, Math.min(1, (t - s) / Math.max(h - s, 1)));
      u > 0 && Math.abs(t - s) < 32 && this.emit("replay-path-start", a, l), this.drawPartialPath(l, u);
      break;
    }
  }
  /**
   * 绘制完整路径 - 使用与录制时相同的笔迹样式算法
   */
  drawCompletePath(t) {
    if (t.points.length < 2)
      return;
    const n = t.penStyle || this.options.penStyle || "pen";
    this.drawStyledStrokeForReplay(t.points, n, t.strokeColor, t.strokeWidth);
  }
  /**
   * 绘制部分路径 - 使用与录制时相同的笔迹样式算法
   */
  drawPartialPath(t, n) {
    if (t.points.length < 2)
      return;
    const a = t.startTime || 0, l = t.duration || 0, s = a + l * n, h = this.getPointsUpToTime(t.points, a, s);
    if (h.length < 2)
      return;
    const u = t.penStyle || this.options.penStyle || "pen";
    this.drawStyledStrokeForReplay(h, u, t.strokeColor, t.strokeWidth);
  }
  /**
   * 获取指定时间内的所有点
   */
  getPointsUpToTime(t, n, a) {
    const l = [];
    for (let s = 0; s < t.length; s++) {
      const h = t[s], u = n + (h.relativeTime || s * 50);
      if (u <= a)
        l.push(h);
      else {
        if (s > 0) {
          const r = t[s - 1], d = n + (r.relativeTime || (s - 1) * 50);
          if (d <= a) {
            const y = (a - d) / (u - d), c = {
              x: r.x + (h.x - r.x) * y,
              y: r.y + (h.y - r.y) * y,
              time: a,
              pressure: r.pressure ? r.pressure + (h.pressure || r.pressure - r.pressure) * y : h.pressure
            };
            l.push(c);
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
          const r = Math.sqrt(Math.pow(t.x - n.x, 2) + Math.pow(t.y - n.y, 2)), d = Math.max(1, (t.time || 0) - (n.time || 0)), y = r / d, c = Math.max(0.1, Math.min(3, 100 / Math.max(y, 1))), T = t.pressure || 0.5, v = 0.8 + Math.random() * 0.4;
          return Math.max(1, Math.min(20, l * c * (0.3 + T * 1.4) * v));
        }
        return l;
      case "marker":
        return 12;
      case "pencil":
        const s = t.pressure || 0.5, h = 0.9 + Math.random() * 0.2;
        return l * (0.7 + s * 0.6) * h;
      case "ballpoint":
        const u = t.pressure || 0.5;
        return l * (0.8 + u * 0.4);
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
            for (let s = 1; s < t.length - 1; s++) {
              const h = this.getControlPoint(t[s], t[s - 1], t[s + 1]);
              this.ctx.quadraticCurveTo(h.x, h.y, t[s].x, t[s].y);
            }
            this.ctx.lineTo(t[t.length - 1].x, t[t.length - 1].y);
          } else
            for (let s = 1; s < t.length; s++)
              this.ctx.lineTo(t[s].x, t[s].y);
          this.ctx.stroke();
          break;
        case "brush":
          this.ctx.lineCap = "round", this.ctx.lineJoin = "round";
          for (let s = 1; s < t.length; s++) {
            const h = t[s], u = t[s - 1], r = this.calculateDynamicStrokeWidth(h, u, n, l);
            this.ctx.lineWidth = r, this.ctx.beginPath(), this.ctx.moveTo(u.x, u.y), this.ctx.lineTo(h.x, h.y), this.ctx.stroke(), r > 8 && Math.random() > 0.6 && (this.ctx.globalAlpha = 0.2, this.ctx.beginPath(), this.ctx.arc(h.x, h.y, r * 0.3, 0, Math.PI * 2), this.ctx.fill(), this.ctx.globalAlpha = 1);
          }
          break;
        case "marker":
          this.ctx.globalAlpha = 0.7, this.ctx.lineWidth = 12, this.ctx.lineCap = "square", this.ctx.lineJoin = "bevel", this.ctx.beginPath(), this.ctx.moveTo(t[0].x, t[0].y);
          for (let s = 1; s < t.length; s++)
            this.ctx.lineTo(t[s].x, t[s].y);
          this.ctx.stroke(), this.ctx.globalAlpha = 0.3, this.ctx.lineWidth = 16, this.ctx.beginPath(), this.ctx.moveTo(t[0].x, t[0].y);
          for (let s = 1; s < t.length; s++)
            this.ctx.lineTo(t[s].x, t[s].y);
          this.ctx.stroke(), this.ctx.globalAlpha = 1;
          break;
        case "pencil":
          this.ctx.lineCap = "round", this.ctx.lineJoin = "round";
          for (let s = 1; s < t.length; s++) {
            const h = t[s], u = t[s - 1], r = this.calculateDynamicStrokeWidth(h, u, n, l);
            this.ctx.lineWidth = r, this.ctx.globalAlpha = 0.8, this.ctx.beginPath(), this.ctx.moveTo(u.x, u.y), this.ctx.lineTo(h.x, h.y), this.ctx.stroke();
            for (let d = 0; d < 3; d++)
              if (Math.random() > 0.5) {
                this.ctx.globalAlpha = 0.2, this.ctx.lineWidth = r * 0.3;
                const y = (Math.random() - 0.5) * 2, c = (Math.random() - 0.5) * 2;
                this.ctx.beginPath(), this.ctx.moveTo(u.x + y, u.y + c), this.ctx.lineTo(h.x + y, h.y + c), this.ctx.stroke();
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
          for (let s = 1; s < t.length; s++) {
            const h = t[s], u = t[s - 1], r = this.calculateDynamicStrokeWidth(h, u, n, l);
            if (Math.random() > 0.1) {
              if (this.ctx.lineWidth = r, this.ctx.globalAlpha = Math.random() > 0.2 ? 1 : 0.7, this.ctx.beginPath(), s < t.length - 1) {
                const d = t[s + 1], y = this.getControlPoint(h, u, d);
                this.ctx.moveTo(u.x, u.y), this.ctx.quadraticCurveTo(y.x, y.y, h.x, h.y);
              } else
                this.ctx.moveTo(u.x, u.y), this.ctx.lineTo(h.x, h.y);
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
    const s = {
      length: Math.sqrt(Math.pow(a.x - n.x, 2) + Math.pow(a.y - n.y, 2)),
      angle: Math.atan2(a.y - n.y, a.x - n.x)
    }, h = s.angle + Math.PI, u = s.length * 0.2;
    return {
      x: t.x + Math.cos(h) * u,
      y: t.y + Math.sin(h) * u,
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
   * 销毁控制器
   */
  destroy() {
    this.stop(), this.eventCallbacks.clear(), this.replayData = null;
  }
}
function it(i) {
  const t = i.paths.map((r) => {
    const d = r.points.map((c, T) => {
      var k;
      let v;
      if (c.time && r.points[0].time)
        v = c.time - r.points[0].time;
      else if (T === 0)
        v = 0;
      else {
        const E = r.points[T - 1], P = Math.sqrt(
          Math.pow(c.x - E.x, 2) + Math.pow(c.y - E.y, 2)
        ) / 100 * 1e3;
        v = (((k = d[T - 1]) == null ? void 0 : k.relativeTime) || 0) + Math.max(P, 16);
      }
      return {
        ...c,
        relativeTime: v
      };
    }), y = d.length > 0 ? d[d.length - 1].relativeTime : 0;
    return {
      ...r,
      points: d,
      duration: y
    };
  }), n = [];
  for (let r = 0; r < t.length; r++) {
    const d = t[r];
    let y;
    if (r === 0)
      y = 0;
    else {
      const v = n[r - 1], k = st(
        i.paths[r - 1].points,
        i.paths[r].points
      );
      y = v.endTime + k;
    }
    const c = y + d.duration, T = {
      ...d,
      startTime: y,
      endTime: c
    };
    console.log(`路径 ${r}: 开始时间=${y}, 结束时间=${c}, 持续时间=${d.duration}`), n.push(T);
  }
  const a = n.length > 0 ? n[n.length - 1].endTime : 0;
  console.log("回放数据生成完成:"), console.log("- 路径数量:", n.length), console.log("- 总时长:", a), console.log("- 路径详情:", n.map((r) => ({
    startTime: r.startTime,
    endTime: r.endTime,
    duration: r.duration,
    pointCount: r.points.length
  })));
  const l = n.reduce((r, d) => r + rt(d.points), 0), s = a > 0 ? l / (a / 1e3) : 0, h = n.slice(1).map((r, d) => {
    const y = n[d];
    return r.startTime - y.endTime;
  }), u = h.length > 0 ? h.reduce((r, d) => r + d, 0) / h.length : 0;
  return {
    paths: n,
    totalDuration: a,
    speed: 1,
    metadata: {
      deviceType: lt(i),
      averageSpeed: s,
      totalDistance: l,
      averagePauseTime: u
    }
  };
}
function st(i, t) {
  if (i.length === 0 || t.length === 0)
    return 200;
  const n = i[i.length - 1], a = t[0];
  if (n.time && a.time)
    return Math.max(a.time - n.time, 50);
  const l = Math.sqrt(
    Math.pow(a.x - n.x, 2) + Math.pow(a.y - n.y, 2)
  );
  return Math.min(Math.max(l * 2, 100), 1e3);
}
function lt(i) {
  const t = i.paths.reduce((s, h) => s + h.points.length, 0), n = i.paths.length;
  if (t === 0)
    return "touch";
  const a = t / n;
  return a > 20 ? "touch" : a < 10 ? "mouse" : i.paths.some(
    (s) => s.points.some((h) => h.pressure !== void 0)
  ) ? "pen" : "touch";
}
function rt(i) {
  let t = 0;
  for (let n = 1; n < i.length; n++) {
    const a = i[n].x - i[n - 1].x, l = i[n].y - i[n - 1].y;
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
function ht(i) {
  return Me[i];
}
function Et() {
  return Object.entries(Me).map(([i, t]) => ({
    key: i,
    config: t
  }));
}
function ut(i, t) {
  const n = ht(i);
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
}, mt = ["disabled"], pt = ["disabled"], gt = ["disabled"], yt = {
  key: 2,
  class: "replay-controls"
}, vt = { class: "replay-buttons" }, ft = ["disabled"], xt = { key: 0 }, bt = { key: 1 }, Tt = ["disabled"], kt = { class: "replay-progress" }, wt = ["max", "value", "disabled"], Ct = { class: "time-display" }, Mt = { class: "replay-speed" }, Pt = /* @__PURE__ */ Ge({
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
  setup(i, { expose: t, emit: n }) {
    const a = i, l = n, s = D(), h = D(!1), u = D(null), r = D(B(0, 0)), d = D([]), y = D(-1), c = D(null), T = D(!1), v = D("idle"), k = D(0), E = D(0), W = M(() => typeof a.width == "number" ? a.width : 800), P = M(() => typeof a.height == "number" ? a.height : 300), Se = M(() => ({
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
    })), _e = M(() => T.value ? !1 : a.placeholder && z(r.value)), K = M(() => y.value > 0), Z = M(() => y.value < d.value.length - 1), ee = M(() => T.value && c.value), _ = M(() => !ee.value && !a.disabled), Re = M(() => {
      var e;
      return ee.value && ((e = a.replayOptions) == null ? void 0 : e.showControls) !== !1;
    }), R = M(() => {
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
      return ((e = s.value) == null ? void 0 : e.getContext("2d")) || null;
    }, O = (e, o) => {
      const p = s.value, f = p.getBoundingClientRect(), m = p.width / f.width, g = p.height / f.height;
      return {
        x: (e - f.left) * m,
        y: (o - f.top) * g,
        time: Date.now()
      };
    }, ae = (e) => {
      if (!_.value)
        return;
      h.value = !0;
      const o = performance.now(), p = { ...e, time: o };
      u.value = {
        points: [p],
        strokeColor: a.strokeColor,
        strokeWidth: a.strokeWidth,
        penStyle: a.penStyle,
        // 保存笔迹样式
        startTime: o,
        endTime: o,
        duration: 0
      }, l("signature-start");
    }, L = (e, o, p, f) => {
      switch (p) {
        case "pen":
          return 1;
        case "brush":
          if (o) {
            const S = Math.sqrt(Math.pow(e.x - o.x, 2) + Math.pow(e.y - o.y, 2)), w = Math.max(1, (e.time || 0) - (o.time || 0)), I = S / w, X = Math.max(0.1, Math.min(3, 100 / Math.max(I, 1))), Ue = e.pressure || 0.5, He = 0.8 + Math.random() * 0.4;
            return Math.max(1, Math.min(20, f * X * (0.3 + Ue * 1.4) * He));
          }
          return f;
        case "marker":
          return 12;
        case "pencil":
          const m = e.pressure || 0.5, g = 0.9 + Math.random() * 0.2;
          return f * (0.7 + m * 0.6) * g;
        case "ballpoint":
          const x = e.pressure || 0.5;
          return f * (0.8 + x * 0.4);
        default:
          return f;
      }
    }, U = (e, o, p) => {
      var f;
      if (!(o.length < 2))
        switch (e.strokeStyle = ((f = u.value) == null ? void 0 : f.strokeColor) || R.value.strokeColor, e.lineCap = R.value.lineCap || "round", e.lineJoin = R.value.lineJoin || "round", p) {
          case "pen":
            if (e.lineWidth = 1, e.lineCap = "butt", e.lineJoin = "miter", e.beginPath(), e.moveTo(o[0].x, o[0].y), o.length >= 3) {
              for (let m = 1; m < o.length - 1; m++) {
                const g = ne(o[m], o[m - 1], o[m + 1]);
                e.quadraticCurveTo(g.x, g.y, o[m].x, o[m].y);
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
              const g = o[m], x = o[m - 1], S = L(g, x, p, R.value.strokeWidth), w = e.createLinearGradient(x.x, x.y, g.x, g.y);
              w.addColorStop(0, e.strokeStyle), w.addColorStop(1, e.strokeStyle), e.lineWidth = S, e.beginPath(), e.moveTo(x.x, x.y), e.lineTo(g.x, g.y), e.stroke(), S > 8 && Math.random() > 0.6 && (e.globalAlpha = 0.2, e.beginPath(), e.arc(g.x, g.y, S * 0.3, 0, Math.PI * 2), e.fill(), e.globalAlpha = 1);
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
              const g = o[m], x = o[m - 1], S = L(g, x, p, R.value.strokeWidth);
              e.lineWidth = S, e.globalAlpha = 0.8, e.beginPath(), e.moveTo(x.x, x.y), e.lineTo(g.x, g.y), e.stroke();
              for (let w = 0; w < 3; w++)
                if (Math.random() > 0.5) {
                  e.globalAlpha = 0.2, e.lineWidth = S * 0.3;
                  const I = (Math.random() - 0.5) * 2, X = (Math.random() - 0.5) * 2;
                  e.beginPath(), e.moveTo(x.x + I, x.y + X), e.lineTo(g.x + I, g.y + X), e.stroke();
                }
              if (Math.random() > 0.8) {
                e.globalAlpha = 0.4;
                for (let w = 0; w < 5; w++)
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
            for (let m = 1; m < o.length; m++) {
              const g = o[m], x = o[m - 1], S = L(g, x, p, R.value.strokeWidth);
              if (Math.random() > 0.1) {
                if (e.lineWidth = S, e.globalAlpha = Math.random() > 0.2 ? 1 : 0.7, e.beginPath(), R.value.smoothing && m < o.length - 1) {
                  const w = o[m + 1], I = ne(g, x, w);
                  e.moveTo(x.x, x.y), e.quadraticCurveTo(I.x, I.y, g.x, g.y);
                } else
                  e.moveTo(x.x, x.y), e.lineTo(g.x, g.y);
                e.stroke();
              }
              Math.random() > 0.95 && (e.globalAlpha = 0.8, e.beginPath(), e.arc(g.x, g.y, S * 0.8, 0, Math.PI * 2), e.fill());
            }
            e.globalAlpha = 1;
            break;
        }
    }, Ae = () => {
      if (!u.value || u.value.points.length < 2)
        return;
      const e = te();
      if (!e)
        return;
      const o = u.value.points, p = o.length, f = a.penStyle || "pen";
      if (p === 2)
        U(e, o, f);
      else if (p >= 3) {
        const m = o.slice(-3);
        U(e, m, f);
      }
    }, ne = (e, o, p) => {
      const m = {
        length: Math.sqrt(Math.pow(p.x - o.x, 2) + Math.pow(p.y - o.y, 2)),
        angle: Math.atan2(p.y - o.y, p.x - o.x)
      }, g = m.angle + Math.PI, x = m.length * 0.2;
      return {
        x: e.x + Math.cos(g) * x,
        y: e.y + Math.sin(g) * x,
        time: e.time || 0
      };
    }, Ie = (e, o) => {
      if (o.points.length < 2)
        return;
      const p = o.penStyle || a.penStyle || "pen", f = u.value;
      u.value = o, U(e, o.points, p), u.value = f;
    }, oe = (e) => {
      if (!h.value || !u.value || !_.value)
        return;
      const o = performance.now(), p = { ...e, time: o };
      u.value.points.push(p), u.value.startTime && (u.value.endTime = o, u.value.duration = o - u.value.startTime), Ae(), re(), l("signature-drawing", r.value);
    }, ie = () => {
      if (!(!h.value || !u.value)) {
        if (h.value = !1, u.value.points.length > 0) {
          const e = u.value.points[u.value.points.length - 1];
          e.time && u.value.startTime && (u.value.endTime = e.time, u.value.duration = e.time - u.value.startTime);
        }
        r.value.paths.push(u.value), r.value.isEmpty = !1, r.value.timestamp = Date.now(), q(), A(), u.value = null, l("signature-end", r.value);
      }
    }, Ee = (e) => {
      e.preventDefault();
      const o = O(e.clientX, e.clientY);
      ae(o);
    }, Je = (e) => {
      if (e.preventDefault(), !h.value)
        return;
      const o = O(e.clientX, e.clientY);
      oe(o);
    }, se = (e) => {
      e.preventDefault(), ie();
    }, $e = (e) => {
      if (e.preventDefault(), e.touches.length !== 1)
        return;
      const o = e.touches[0], p = O(o.clientX, o.clientY);
      ae(p);
    }, Fe = (e) => {
      if (e.preventDefault(), e.touches.length !== 1 || !h.value)
        return;
      const o = e.touches[0], p = O(o.clientX, o.clientY);
      oe(p);
    }, le = (e) => {
      e.preventDefault(), ie();
    }, re = () => {
      r.value.canvasSize = {
        width: W.value,
        height: P.value
      }, r.value.isEmpty = z(r.value);
    }, q = () => {
      d.value = d.value.slice(0, y.value + 1), d.value.push(F(r.value)), y.value = d.value.length - 1;
      const e = 50;
      d.value.length > e && (d.value = d.value.slice(-e), y.value = d.value.length - 1);
    }, A = () => {
      const e = te();
      e && (e.clearRect(0, 0, W.value, P.value), a.backgroundColor && a.backgroundColor !== "transparent" && (e.fillStyle = a.backgroundColor, e.fillRect(0, 0, W.value, P.value)), r.value.paths.forEach((o) => {
        o.points.length > 0 && Ie(e, o);
      }));
    }, Y = () => {
      if (console.log("初始化回放控制器"), console.log("canvas引用是否存在:", !!s.value), !s.value) {
        console.error("canvas引用不存在，无法初始化回放控制器");
        return;
      }
      c.value && (console.log("销毁现有回放控制器"), c.value.destroy()), console.log("创建新的回放控制器"), c.value = new ot(s.value), console.log("回放控制器创建成功:", !!c.value), c.value.on("replay-start", () => {
        v.value = "playing", l("replay-start");
      }), c.value.on("replay-progress", (e, o) => {
        k.value = e, E.value = o, l("replay-progress", e, o);
      }), c.value.on("replay-pause", () => {
        v.value = "paused", l("replay-pause");
      }), c.value.on("replay-resume", () => {
        v.value = "playing", l("replay-resume");
      }), c.value.on("replay-stop", () => {
        v.value = "stopped", l("replay-stop");
      }), c.value.on("replay-complete", () => {
        v.value = "completed", l("replay-complete");
      }), c.value.on("replay-path-start", (e, o) => {
        l("replay-path-start", e, o);
      }), c.value.on("replay-path-end", (e, o) => {
        l("replay-path-end", e, o);
      }), c.value.on("replay-speed-change", (e) => {
        l("replay-speed-change", e);
      });
    }, he = (e, o) => {
      if (c.value || Y(), c.value) {
        T.value = !0;
        const p = {
          ...o,
          drawOptions: R.value,
          penStyle: a.penStyle
        };
        c.value.setReplayData(e, p), console.log("startReplay调用，自动播放:", o == null ? void 0 : o.autoPlay), (o == null ? void 0 : o.autoPlay) === !0 && c.value.play();
      }
    }, ue = (e) => {
      T.value = e, !e && c.value && (c.value.stop(), A());
    }, Oe = () => z(r.value) ? null : it(r.value), ce = () => {
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
    }, qe = () => {
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
    }, ye = (e) => {
      const o = Math.floor(e / 1e3), p = Math.floor(o / 60), f = o % 60;
      return `${p}:${f.toString().padStart(2, "0")}`;
    }, ve = () => {
      _.value && (r.value = B(W.value, P.value), A(), q(), l("signature-clear"));
    }, fe = () => {
      !K.value || !_.value || (y.value--, r.value = F(d.value[y.value]), A(), l("signature-undo", r.value));
    }, xe = () => {
      !Z.value || !_.value || (y.value++, r.value = F(d.value[y.value]), A(), l("signature-redo", r.value));
    }, be = (e) => {
      const o = s.value;
      return at(o, r.value, e);
    }, Te = () => z(r.value), ke = async (e) => {
      if (!_.value)
        return;
      const o = s.value;
      await nt(o, e), r.value = B(W.value, P.value), r.value.isEmpty = !1, q();
    }, ze = () => F(r.value), Be = (e) => {
      _.value && (r.value = F(e), A(), q());
    }, we = (e, o) => {
      const p = e || W.value, f = o || P.value, m = be({ format: "png" });
      j(() => {
        const g = s.value;
        g.width = p, g.height = f, Te() || ke(m), re();
      });
    }, Le = () => {
      const e = s.value;
      e.width = W.value, e.height = P.value, r.value = B(W.value, P.value), d.value = [F(r.value)], y.value = 0, A();
    };
    return N([() => a.width, () => a.height], () => {
      j(() => {
        s.value && we();
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
      clear: ve,
      undo: fe,
      redo: xe,
      save: be,
      isEmpty: Te,
      fromDataURL: ke,
      getSignatureData: ze,
      setSignatureData: Be,
      resize: we,
      // 回放相关方法
      startReplay: he,
      getReplayData: Oe,
      setReplayMode: ue,
      play: ce,
      pause: de,
      stop: me,
      seek: pe,
      setSpeed: ge,
      getState: qe,
      getCurrentTime: Ye,
      getTotalDuration: H,
      getProgress: Xe
    }), (e, o) => (J(), $("div", {
      class: "electronic-signature",
      style: G(Se.value)
    }, [
      b("canvas", {
        ref_key: "canvasRef",
        ref: s,
        width: W.value,
        height: P.value,
        style: G(De.value),
        onMousedown: Ee,
        onMousemove: Je,
        onMouseup: se,
        onMouseleave: se,
        onTouchstart: $e,
        onTouchmove: Fe,
        onTouchend: le,
        onTouchcancel: le
      }, null, 44, ct),
      _e.value ? (J(), $("div", {
        key: 0,
        class: "signature-placeholder",
        style: G(We.value)
      }, V(e.placeholder), 5)) : Q("", !0),
      e.showToolbar ? (J(), $("div", dt, [
        b("button", {
          onClick: ve,
          disabled: !_.value
        }, "清除", 8, mt),
        b("button", {
          onClick: fe,
          disabled: !_.value || !K.value
        }, "撤销", 8, pt),
        b("button", {
          onClick: xe,
          disabled: !_.value || !Z.value
        }, "重做", 8, gt)
      ])) : Q("", !0),
      Re.value ? (J(), $("div", yt, [
        b("div", vt, [
          b("button", {
            onClick: o[0] || (o[0] = (p) => v.value === "playing" ? de() : ce()),
            disabled: v.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            v.value === "playing" ? (J(), $("span", xt, "⏸️")) : (J(), $("span", bt, "▶️"))
          ], 8, ft),
          b("button", {
            onClick: o[1] || (o[1] = (p) => me()),
            disabled: v.value === "idle",
            class: "replay-btn stop-btn"
          }, " ⏹️ ", 8, Tt)
        ]),
        b("div", kt, [
          b("input", {
            type: "range",
            min: "0",
            max: H(),
            value: E.value,
            onInput: o[2] || (o[2] = (p) => pe(Number(p.target.value))),
            class: "progress-slider",
            disabled: v.value === "idle"
          }, null, 40, wt),
          b("div", Ct, [
            b("span", null, V(ye(E.value)), 1),
            o[4] || (o[4] = b("span", null, "/", -1)),
            b("span", null, V(ye(H())), 1)
          ])
        ]),
        b("div", Mt, [
          o[6] || (o[6] = b("label", null, "速度:", -1)),
          b("select", {
            onChange: o[3] || (o[3] = (p) => ge(Number(p.target.value))),
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
const St = (i, t) => {
  const n = i.__vccOpts || i;
  for (const [a, l] of t)
    n[a] = l;
  return n;
}, Pe = /* @__PURE__ */ St(Pt, [["__scopeId", "data-v-37d68792"]]);
function Dt() {
  return window.devicePixelRatio || 1;
}
function Jt(i) {
  const t = i.getContext("2d"), n = Dt(), a = i.clientWidth, l = i.clientHeight;
  return i.width = a * n, i.height = l * n, t.scale(n, n), i.style.width = a + "px", i.style.height = l + "px", t;
}
function Wt(i) {
  if (i.paths.length === 0)
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0
    };
  let t = 1 / 0, n = 1 / 0, a = -1 / 0, l = -1 / 0;
  return i.paths.forEach((s) => {
    s.points.forEach((h) => {
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
function $t(i, t, n = 10) {
  const a = Wt(t);
  if (a.width === 0 || a.height === 0) {
    const r = document.createElement("canvas");
    return r.width = 1, r.height = 1, r;
  }
  const l = document.createElement("canvas"), s = l.getContext("2d"), h = a.width + n * 2, u = a.height + n * 2;
  return l.width = h, l.height = u, s.drawImage(
    i,
    a.minX - n,
    a.minY - n,
    h,
    u,
    0,
    0,
    h,
    u
  ), l;
}
function Ft(i, t, n, a = !0) {
  const l = document.createElement("canvas"), s = l.getContext("2d");
  let h = t, u = n;
  if (a) {
    const r = i.width / i.height, d = t / n;
    r > d ? u = t / r : h = n * r;
  }
  return l.width = h, l.height = u, s.imageSmoothingEnabled = !0, s.imageSmoothingQuality = "high", s.drawImage(i, 0, 0, h, u), l;
}
function Ot(i, t, n = {}) {
  const {
    fontSize: a = 12,
    fontFamily: l = "Arial",
    color: s = "#999",
    opacity: h = 0.5,
    position: u = "bottom-right"
  } = n, r = document.createElement("canvas"), d = r.getContext("2d");
  r.width = i.width, r.height = i.height, d.drawImage(i, 0, 0), d.font = `${a}px ${l}`, d.fillStyle = s, d.globalAlpha = h;
  const c = d.measureText(t).width, T = a;
  let v, k;
  switch (u) {
    case "top-left":
      v = 10, k = T + 10;
      break;
    case "top-right":
      v = i.width - c - 10, k = T + 10;
      break;
    case "bottom-left":
      v = 10, k = i.height - 10;
      break;
    case "bottom-right":
      v = i.width - c - 10, k = i.height - 10;
      break;
    case "center":
      v = (i.width - c) / 2, k = (i.height + T) / 2;
      break;
    default:
      v = i.width - c - 10, k = i.height - 10;
  }
  return d.fillText(t, v, k), d.globalAlpha = 1, r;
}
function qt(i) {
  const t = document.createElement("canvas"), n = t.getContext("2d");
  t.width = i.width, t.height = i.height, n.drawImage(i, 0, 0);
  const a = n.getImageData(0, 0, i.width, i.height), l = a.data;
  for (let s = 0; s < l.length; s += 4) {
    const h = l[s] * 0.299 + l[s + 1] * 0.587 + l[s + 2] * 0.114;
    l[s] = h, l[s + 1] = h, l[s + 2] = h;
  }
  return n.putImageData(a, 0, 0), t;
}
const _t = (i) => {
  i.component("ElectronicSignature", Pe);
}, Yt = {
  install: _t,
  ElectronicSignature: Pe
}, Xt = "1.0.0";
export {
  Pe as ElectronicSignature,
  Me as PEN_STYLE_CONFIGS,
  ot as SignatureReplayController,
  Ot as addWatermark,
  et as calculateStrokeWidth,
  F as cloneSignatureData,
  qt as convertToGrayscale,
  ut as createDrawOptionsFromPenStyle,
  B as createEmptySignatureData,
  it as createReplayData,
  $t as cropSignature,
  Yt as default,
  It as drawSmoothPath,
  at as exportSignature,
  Et as getAllPenStyles,
  Ke as getAngle,
  Ze as getControlPoint,
  Dt as getDevicePixelRatio,
  Ce as getDistance,
  ht as getPenStyleConfig,
  Wt as getSignatureBounds,
  z as isSignatureEmpty,
  nt as loadImageToCanvas,
  Ft as resizeSignature,
  Jt as setupHighDPICanvas,
  tt as signatureToSVG,
  Xt as version
};
