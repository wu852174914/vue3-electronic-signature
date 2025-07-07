var Xe = Object.defineProperty;
var Ye = (t, e, n) => e in t ? Xe(t, e, { enumerable: !0, configurable: !0, writable: !0, value: n }) : t[e] = n;
var w = (t, e, n) => (Ye(t, typeof e != "symbol" ? e + "" : e, n), n);
import { defineComponent as ze, ref as b, computed as T, watch as O, nextTick as q, onMounted as Ae, onUnmounted as Oe, openBlock as M, createElementBlock as _, normalizeStyle as B, createElementVNode as v, toDisplayString as F, createCommentVNode as U } from "vue";
function xe(t, e) {
  return Math.sqrt(
    Math.pow(e.x - t.x, 2) + Math.pow(e.y - t.y, 2)
  );
}
function qe(t, e) {
  return Math.atan2(e.y - t.y, e.x - t.x);
}
function Be(t, e, n, a) {
  const s = e || t, o = n || t, h = 0.2, l = qe(s, o) * (a ? 1 : -1), r = xe(s, o) * h;
  return {
    x: t.x + Math.cos(l) * r,
    y: t.y + Math.sin(l) * r,
    time: t.time
  };
}
function Fe(t, e, n) {
  if (!n.pressure.enabled)
    return n.strokeWidth;
  const a = xe(t, e), s = e.time - t.time, o = s > 0 ? a / s : 0, h = Math.max(0.1, Math.min(1, 1 - o * 0.01)), { min: l, max: r } = n.pressure;
  return l + (r - l) * h;
}
function fe(t, e, n) {
  if (e.length < 2)
    return;
  if (t.strokeStyle = n.strokeColor, t.lineCap = "round", t.lineJoin = "round", !n.smoothing || e.length < 3) {
    t.beginPath(), t.lineWidth = n.strokeWidth, t.moveTo(e[0].x, e[0].y);
    for (let s = 1; s < e.length; s++)
      t.lineTo(e[s].x, e[s].y);
    t.stroke();
    return;
  }
  t.beginPath(), t.moveTo(e[0].x, e[0].y);
  for (let s = 1; s < e.length - 1; s++) {
    const o = e[s], h = e[s + 1];
    n.pressure.enabled ? t.lineWidth = Fe(e[s - 1], o, n) : t.lineWidth = n.strokeWidth;
    const l = Be(o, e[s - 1], h);
    t.quadraticCurveTo(l.x, l.y, o.x, o.y);
  }
  const a = e[e.length - 1];
  t.lineTo(a.x, a.y), t.stroke();
}
function Ue(t) {
  const { canvasSize: e, paths: n } = t;
  let a = `<svg width="${e.width}" height="${e.height}" xmlns="http://www.w3.org/2000/svg">`;
  return n.forEach((s) => {
    if (s.points.length < 2)
      return;
    let o = `M ${s.points[0].x} ${s.points[0].y}`;
    for (let h = 1; h < s.points.length; h++)
      o += ` L ${s.points[h].x} ${s.points[h].y}`;
    a += `<path d="${o}" stroke="${s.strokeColor}" stroke-width="${s.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), a += "</svg>", a;
}
function He(t, e, n = { format: "png" }) {
  const { format: a, quality: s = 0.9, size: o, backgroundColor: h } = n;
  if (a === "svg")
    return Ue(e);
  const l = document.createElement("canvas"), r = l.getContext("2d");
  if (o) {
    l.width = o.width, l.height = o.height;
    const d = o.width / t.width, g = o.height / t.height;
    r.scale(d, g);
  } else
    l.width = t.width, l.height = t.height;
  switch (h && h !== "transparent" && (r.fillStyle = h, r.fillRect(0, 0, l.width, l.height)), r.drawImage(t, 0, 0), a) {
    case "jpeg":
      return l.toDataURL("image/jpeg", s);
    case "base64":
      return l.toDataURL("image/png").split(",")[1];
    case "png":
    default:
      return l.toDataURL("image/png");
  }
}
function Le(t, e) {
  return new Promise((n, a) => {
    const s = new Image();
    s.onload = () => {
      const o = t.getContext("2d");
      o.clearRect(0, 0, t.width, t.height), o.drawImage(s, 0, 0, t.width, t.height), n();
    }, s.onerror = a, s.src = e;
  });
}
function $(t) {
  return t.paths.length === 0 || t.paths.every((e) => e.points.length === 0);
}
function X(t, e) {
  return {
    paths: [],
    canvasSize: { width: t, height: e },
    timestamp: Date.now(),
    isEmpty: !0
  };
}
function R(t) {
  return JSON.parse(JSON.stringify(t));
}
class Ne {
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
    this.canvas = e, this.ctx = e.getContext("2d");
  }
  /**
   * 设置回放数据
   */
  setReplayData(e, n = {}) {
    console.log("设置回放数据:", e), console.log("回放选项:", n), this.replayData = e, this.options = { ...n }, this.speed = n.speed || e.speed || 1, this.currentTime = n.startTime || 0, this.state = "idle", console.log("回放数据设置完成，路径数量:", e.paths.length), console.log("总时长:", e.totalDuration);
  }
  /**
   * 开始播放
   */
  play() {
    if (console.log("播放方法调用，回放数据:", this.replayData), console.log("当前状态:", this.state), !this.replayData) {
      console.error("没有回放数据，无法播放");
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
    this.currentTime = Math.max(0, Math.min(e, n)), this.state === "playing" ? this.startTimestamp = performance.now() - this.currentTime / this.speed : this.pausedTime = this.currentTime / this.speed, this.renderFrame(this.currentTime);
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
   * 渲染指定时间的帧
   */
  renderFrame(e) {
    if (!this.replayData)
      return;
    this.clearCanvas();
    let n = !1;
    for (let a = 0; a < this.replayData.paths.length; a++) {
      const s = this.replayData.paths[a], o = s.startTime || 0, h = s.endTime || o + (s.duration || 0);
      if (e < o)
        break;
      if (e >= h) {
        this.drawCompletePath(s), !n && Math.abs(e - h) < 32 && this.emit("replay-path-end", a, s);
        continue;
      }
      n = !0;
      const l = Math.max(0, Math.min(1, (e - o) / Math.max(h - o, 1)));
      l > 0 && Math.abs(e - o) < 32 && this.emit("replay-path-start", a, s), this.drawPartialPath(s, l);
      break;
    }
  }
  /**
   * 绘制完整路径
   */
  drawCompletePath(e) {
    if (!(e.points.length < 2)) {
      this.ctx.beginPath(), this.ctx.strokeStyle = e.strokeColor, this.ctx.lineWidth = e.strokeWidth, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", this.ctx.moveTo(e.points[0].x, e.points[0].y);
      for (let n = 1; n < e.points.length; n++)
        this.ctx.lineTo(e.points[n].x, e.points[n].y);
      this.ctx.stroke();
    }
  }
  /**
   * 绘制部分路径
   */
  drawPartialPath(e, n) {
    if (e.points.length < 2)
      return;
    const a = e.startTime || 0, s = e.duration || 0, o = a + s * n, h = this.getPointsUpToTime(e.points, a, o);
    h.length < 2 || (this.ctx.beginPath(), this.ctx.strokeStyle = e.strokeColor, this.ctx.lineWidth = e.strokeWidth, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", this.drawSmoothCurve(h), this.ctx.stroke());
  }
  /**
   * 获取指定时间内的所有点
   */
  getPointsUpToTime(e, n, a) {
    const s = [];
    for (let o = 0; o < e.length; o++) {
      const h = e[o], l = n + (h.relativeTime || o * 50);
      if (l <= a)
        s.push(h);
      else {
        if (o > 0) {
          const r = e[o - 1], d = n + (r.relativeTime || (o - 1) * 50);
          if (d <= a) {
            const g = (a - d) / (l - d), c = {
              x: r.x + (h.x - r.x) * g,
              y: r.y + (h.y - r.y) * g,
              time: a,
              pressure: r.pressure ? r.pressure + (h.pressure || r.pressure - r.pressure) * g : h.pressure
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
   * 绘制平滑曲线，与原始绘制保持一致
   */
  drawSmoothCurve(e) {
    if (e.length < 2)
      return;
    if (this.ctx.moveTo(e[0].x, e[0].y), e.length === 2) {
      this.ctx.lineTo(e[1].x, e[1].y);
      return;
    }
    for (let s = 1; s < e.length - 1; s++) {
      const o = e[s], h = e[s + 1], l = (o.x + h.x) / 2, r = (o.y + h.y) / 2;
      this.ctx.quadraticCurveTo(o.x, o.y, l, r);
    }
    const n = e[e.length - 1], a = e[e.length - 2];
    this.ctx.quadraticCurveTo(a.x, a.y, n.x, n.y);
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
function Je(t) {
  const e = t.paths.map((l, r) => {
    const d = l.points.map((p, y) => {
      var f;
      let S;
      if (p.time && l.points[0].time)
        S = p.time - l.points[0].time;
      else if (y === 0)
        S = 0;
      else {
        const x = l.points[y - 1], Y = Math.sqrt(
          Math.pow(p.x - x.x, 2) + Math.pow(p.y - x.y, 2)
        ) / 100 * 1e3;
        S = (((f = d[y - 1]) == null ? void 0 : f.relativeTime) || 0) + Math.max(Y, 16);
      }
      return {
        ...p,
        relativeTime: S
      };
    });
    let g;
    if (r === 0)
      g = 0;
    else {
      const p = e[r - 1], y = je(
        t.paths[r - 1].points,
        l.points
      );
      g = p.endTime + y;
    }
    const c = d.length > 0 ? d[d.length - 1].relativeTime : 0, D = g + c;
    return {
      ...l,
      points: d,
      startTime: g,
      endTime: D,
      duration: c
    };
  }), n = e.length > 0 ? e[e.length - 1].endTime : 0, a = e.reduce((l, r) => l + Ge(r.points), 0), s = n > 0 ? a / (n / 1e3) : 0, o = e.slice(1).map((l, r) => {
    const d = e[r];
    return l.startTime - d.endTime;
  }), h = o.length > 0 ? o.reduce((l, r) => l + r, 0) / o.length : 0;
  return {
    paths: e,
    totalDuration: n,
    speed: 1,
    metadata: {
      deviceType: Ve(t),
      averageSpeed: s,
      totalDistance: a,
      averagePauseTime: h
    }
  };
}
function je(t, e) {
  if (t.length === 0 || e.length === 0)
    return 200;
  const n = t[t.length - 1], a = e[0];
  if (n.time && a.time)
    return Math.max(a.time - n.time, 50);
  const s = Math.sqrt(
    Math.pow(a.x - n.x, 2) + Math.pow(a.y - n.y, 2)
  );
  return Math.min(Math.max(s * 2, 100), 1e3);
}
function Ve(t) {
  const e = t.paths.reduce((o, h) => o + h.points.length, 0), n = t.paths.length;
  if (e === 0)
    return "touch";
  const a = e / n;
  return a > 20 ? "touch" : a < 10 ? "mouse" : t.paths.some(
    (o) => o.points.some((h) => h.pressure !== void 0)
  ) ? "pen" : "touch";
}
function Ge(t) {
  let e = 0;
  for (let n = 1; n < t.length; n++) {
    const a = t[n].x - t[n - 1].x, s = t[n].y - t[n - 1].y;
    e += Math.sqrt(a * a + s * s);
  }
  return e;
}
const Qe = ["width", "height"], Ke = {
  key: 1,
  class: "signature-toolbar"
}, Ze = ["disabled"], et = ["disabled"], tt = ["disabled"], at = {
  key: 2,
  class: "replay-controls"
}, st = { class: "replay-buttons" }, nt = ["disabled"], it = { key: 0 }, ot = { key: 1 }, rt = ["disabled"], lt = { class: "replay-progress" }, ut = ["max", "value", "disabled"], ht = { class: "time-display" }, ct = { class: "replay-speed" }, dt = /* @__PURE__ */ ze({
  __name: "ElectronicSignature",
  props: {
    showToolbar: { type: Boolean, default: !1 },
    width: { default: "100%" },
    height: { default: 300 },
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
  setup(t, { expose: e, emit: n }) {
    const a = t, s = n, o = b(), h = b(!1), l = b(null), r = b(X(0, 0)), d = b([]), g = b(-1), c = b(null), D = b(!1), p = b("idle"), y = b(0), S = b(0), f = T(() => typeof a.width == "number" ? a.width : 800), x = T(() => typeof a.height == "number" ? a.height : 300), H = T(() => ({
      position: "relative",
      display: "inline-block",
      width: typeof a.width == "string" ? a.width : `${a.width}px`,
      height: typeof a.height == "string" ? a.height : `${a.height}px`
    })), Y = T(() => ({
      border: a.borderStyle,
      borderRadius: a.borderRadius,
      backgroundColor: a.backgroundColor,
      cursor: a.disabled ? "not-allowed" : "crosshair",
      display: "block",
      width: "100%",
      height: "100%"
    })), Te = T(() => ({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "#999",
      fontSize: "14px",
      pointerEvents: "none",
      userSelect: "none"
    })), ke = T(() => a.placeholder && $(r.value)), L = T(() => g.value > 0), N = T(() => g.value < d.value.length - 1), J = T(() => D.value && c.value), C = T(() => !J.value && !a.disabled), be = T(() => {
      var i;
      return J.value && ((i = a.replayOptions) == null ? void 0 : i.showControls) !== !1;
    }), j = T(() => ({
      strokeColor: a.strokeColor,
      strokeWidth: a.strokeWidth,
      smoothing: a.smoothing,
      pressure: {
        enabled: a.pressureSensitive,
        min: a.minStrokeWidth,
        max: a.maxStrokeWidth
      }
    })), V = () => {
      var i;
      return ((i = o.value) == null ? void 0 : i.getContext("2d")) || null;
    }, W = (i, u) => {
      const m = o.value, k = m.getBoundingClientRect(), A = m.width / k.width, I = m.height / k.height;
      return {
        x: (i - k.left) * A,
        y: (u - k.top) * I,
        time: Date.now()
      };
    }, G = (i) => {
      if (!C.value)
        return;
      h.value = !0;
      const u = performance.now(), m = { ...i, time: u };
      l.value = {
        points: [m],
        strokeColor: a.strokeColor,
        strokeWidth: a.strokeWidth,
        startTime: u,
        endTime: u,
        duration: 0
      }, s("signature-start");
    }, Q = (i) => {
      if (!h.value || !l.value || !C.value)
        return;
      const u = performance.now(), m = { ...i, time: u };
      l.value.points.push(m), l.value.startTime && (l.value.endTime = u, l.value.duration = u - l.value.startTime);
      const k = V();
      k && fe(k, l.value.points, j.value), te(), s("signature-drawing", r.value);
    }, K = () => {
      if (!(!h.value || !l.value)) {
        if (h.value = !1, l.value.points.length > 0) {
          const i = l.value.points[l.value.points.length - 1];
          i.time && l.value.startTime && (l.value.endTime = i.time, l.value.duration = i.time - l.value.startTime);
        }
        r.value.paths.push(l.value), r.value.isEmpty = !1, r.value.timestamp = Date.now(), E(), l.value = null, s("signature-end", r.value);
      }
    }, Ce = (i) => {
      i.preventDefault();
      const u = W(i.clientX, i.clientY);
      G(u);
    }, De = (i) => {
      if (i.preventDefault(), !h.value)
        return;
      const u = W(i.clientX, i.clientY);
      Q(u);
    }, Z = (i) => {
      i.preventDefault(), K();
    }, Se = (i) => {
      if (i.preventDefault(), i.touches.length !== 1)
        return;
      const u = i.touches[0], m = W(u.clientX, u.clientY);
      G(m);
    }, Pe = (i) => {
      if (i.preventDefault(), i.touches.length !== 1 || !h.value)
        return;
      const u = i.touches[0], m = W(u.clientX, u.clientY);
      Q(m);
    }, ee = (i) => {
      i.preventDefault(), K();
    }, te = () => {
      r.value.canvasSize = {
        width: f.value,
        height: x.value
      }, r.value.isEmpty = $(r.value);
    }, E = () => {
      d.value = d.value.slice(0, g.value + 1), d.value.push(R(r.value)), g.value = d.value.length - 1;
      const i = 50;
      d.value.length > i && (d.value = d.value.slice(-i), g.value = d.value.length - 1);
    }, P = () => {
      const i = V();
      i && (i.clearRect(0, 0, f.value, x.value), a.backgroundColor && a.backgroundColor !== "transparent" && (i.fillStyle = a.backgroundColor, i.fillRect(0, 0, f.value, x.value)), r.value.paths.forEach((u) => {
        if (u.points.length > 0) {
          const m = {
            strokeColor: u.strokeColor,
            strokeWidth: u.strokeWidth,
            smoothing: a.smoothing,
            pressure: j.value.pressure
          };
          fe(i, u.points, m);
        }
      }));
    }, ae = () => {
      o.value && (c.value && c.value.destroy(), c.value = new Ne(o.value), c.value.on("replay-start", () => {
        p.value = "playing", s("replay-start");
      }), c.value.on("replay-progress", (i, u) => {
        y.value = i, S.value = u, s("replay-progress", i, u);
      }), c.value.on("replay-pause", () => {
        p.value = "paused", s("replay-pause");
      }), c.value.on("replay-resume", () => {
        p.value = "playing", s("replay-resume");
      }), c.value.on("replay-stop", () => {
        p.value = "stopped", s("replay-stop");
      }), c.value.on("replay-complete", () => {
        p.value = "completed", s("replay-complete");
      }), c.value.on("replay-path-start", (i, u) => {
        s("replay-path-start", i, u);
      }), c.value.on("replay-path-end", (i, u) => {
        s("replay-path-end", i, u);
      }), c.value.on("replay-speed-change", (i) => {
        s("replay-speed-change", i);
      }));
    }, se = (i, u) => {
      c.value || ae(), c.value && (D.value = !0, c.value.setReplayData(i, u || {}), console.log("startReplay调用，自动播放:", u == null ? void 0 : u.autoPlay), (u == null ? void 0 : u.autoPlay) === !0 && c.value.play());
    }, ne = (i) => {
      D.value = i, !i && c.value && (c.value.stop(), P());
    }, Me = () => $(r.value) ? null : Je(r.value), ie = () => {
      var i;
      (i = c.value) == null || i.play();
    }, oe = () => {
      var i;
      (i = c.value) == null || i.pause();
    }, re = () => {
      var i;
      (i = c.value) == null || i.stop();
    }, le = (i) => {
      var u;
      (u = c.value) == null || u.seek(i);
    }, ue = (i) => {
      var u;
      (u = c.value) == null || u.setSpeed(i);
    }, _e = () => {
      var i;
      return ((i = c.value) == null ? void 0 : i.getState()) || "idle";
    }, Re = () => {
      var i;
      return ((i = c.value) == null ? void 0 : i.getCurrentTime()) || 0;
    }, z = () => {
      var i;
      return ((i = c.value) == null ? void 0 : i.getTotalDuration()) || 0;
    }, We = () => {
      var i;
      return ((i = c.value) == null ? void 0 : i.getProgress()) || 0;
    }, he = (i) => {
      const u = Math.floor(i / 1e3), m = Math.floor(u / 60), k = u % 60;
      return `${m}:${k.toString().padStart(2, "0")}`;
    }, ce = () => {
      C.value && (r.value = X(f.value, x.value), P(), E(), s("signature-clear"));
    }, de = () => {
      !L.value || !C.value || (g.value--, r.value = R(d.value[g.value]), P(), s("signature-undo", r.value));
    }, pe = () => {
      !N.value || !C.value || (g.value++, r.value = R(d.value[g.value]), P(), s("signature-redo", r.value));
    }, me = (i) => {
      const u = o.value;
      return He(u, r.value, i);
    }, ge = () => $(r.value), ve = async (i) => {
      if (!C.value)
        return;
      const u = o.value;
      await Le(u, i), r.value = X(f.value, x.value), r.value.isEmpty = !1, E();
    }, Ee = () => R(r.value), Ie = (i) => {
      C.value && (r.value = R(i), P(), E());
    }, ye = (i, u) => {
      const m = i || f.value, k = u || x.value, A = me({ format: "png" });
      q(() => {
        const I = o.value;
        I.width = m, I.height = k, ge() || ve(A), te();
      });
    }, $e = () => {
      const i = o.value;
      i.width = f.value, i.height = x.value, r.value = X(f.value, x.value), d.value = [R(r.value)], g.value = 0, P();
    };
    return O([() => a.width, () => a.height], () => {
      q(() => {
        o.value && ye();
      });
    }), O(() => a.replayMode, (i) => {
      i !== void 0 && ne(i);
    }), O(() => a.replayData, (i) => {
      i && a.replayMode && c.value && (c.value.setReplayData(i, a.replayOptions || {}), console.log("回放数据已更新:", i));
    }), Ae(() => {
      q(() => {
        $e(), ae(), a.replayMode && a.replayData && se(a.replayData, a.replayOptions);
      });
    }), Oe(() => {
      c.value && (c.value.destroy(), c.value = null);
    }), e({
      clear: ce,
      undo: de,
      redo: pe,
      save: me,
      isEmpty: ge,
      fromDataURL: ve,
      getSignatureData: Ee,
      setSignatureData: Ie,
      resize: ye,
      // 回放相关方法
      startReplay: se,
      getReplayData: Me,
      setReplayMode: ne,
      play: ie,
      pause: oe,
      stop: re,
      seek: le,
      setSpeed: ue,
      getState: _e,
      getCurrentTime: Re,
      getTotalDuration: z,
      getProgress: We
    }), (i, u) => (M(), _("div", {
      class: "electronic-signature",
      style: B(H.value)
    }, [
      v("canvas", {
        ref_key: "canvasRef",
        ref: o,
        width: f.value,
        height: x.value,
        style: B(Y.value),
        onMousedown: Ce,
        onMousemove: De,
        onMouseup: Z,
        onMouseleave: Z,
        onTouchstart: Se,
        onTouchmove: Pe,
        onTouchend: ee,
        onTouchcancel: ee
      }, null, 44, Qe),
      ke.value ? (M(), _("div", {
        key: 0,
        class: "signature-placeholder",
        style: B(Te.value)
      }, F(i.placeholder), 5)) : U("", !0),
      i.showToolbar ? (M(), _("div", Ke, [
        v("button", {
          onClick: ce,
          disabled: !C.value
        }, "清除", 8, Ze),
        v("button", {
          onClick: de,
          disabled: !C.value || !L.value
        }, "撤销", 8, et),
        v("button", {
          onClick: pe,
          disabled: !C.value || !N.value
        }, "重做", 8, tt)
      ])) : U("", !0),
      be.value ? (M(), _("div", at, [
        v("div", st, [
          v("button", {
            onClick: u[0] || (u[0] = (m) => p.value === "playing" ? oe() : ie()),
            disabled: p.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            p.value === "playing" ? (M(), _("span", it, "⏸️")) : (M(), _("span", ot, "▶️"))
          ], 8, nt),
          v("button", {
            onClick: u[1] || (u[1] = (m) => re()),
            disabled: p.value === "idle",
            class: "replay-btn stop-btn"
          }, " ⏹️ ", 8, rt)
        ]),
        v("div", lt, [
          v("input", {
            type: "range",
            min: "0",
            max: z(),
            value: S.value,
            onInput: u[2] || (u[2] = (m) => le(Number(m.target.value))),
            class: "progress-slider",
            disabled: p.value === "idle"
          }, null, 40, ut),
          v("div", ht, [
            v("span", null, F(he(S.value)), 1),
            u[4] || (u[4] = v("span", null, "/", -1)),
            v("span", null, F(he(z())), 1)
          ])
        ]),
        v("div", ct, [
          u[6] || (u[6] = v("label", null, "速度:", -1)),
          v("select", {
            onChange: u[3] || (u[3] = (m) => ue(Number(m.target.value))),
            class: "speed-select"
          }, u[5] || (u[5] = [
            v("option", { value: "0.5" }, "0.5x", -1),
            v("option", {
              value: "1",
              selected: ""
            }, "1x", -1),
            v("option", { value: "1.5" }, "1.5x", -1),
            v("option", { value: "2" }, "2x", -1)
          ]), 32)
        ])
      ])) : U("", !0)
    ], 4));
  }
});
const pt = (t, e) => {
  const n = t.__vccOpts || t;
  for (const [a, s] of e)
    n[a] = s;
  return n;
}, we = /* @__PURE__ */ pt(dt, [["__scopeId", "data-v-7184cb09"]]);
function mt() {
  return window.devicePixelRatio || 1;
}
function xt(t) {
  const e = t.getContext("2d"), n = mt(), a = t.clientWidth, s = t.clientHeight;
  return t.width = a * n, t.height = s * n, e.scale(n, n), t.style.width = a + "px", t.style.height = s + "px", e;
}
function gt(t) {
  if (t.paths.length === 0)
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0
    };
  let e = 1 / 0, n = 1 / 0, a = -1 / 0, s = -1 / 0;
  return t.paths.forEach((o) => {
    o.points.forEach((h) => {
      e = Math.min(e, h.x), n = Math.min(n, h.y), a = Math.max(a, h.x), s = Math.max(s, h.y);
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
function wt(t, e, n = 10) {
  const a = gt(e);
  if (a.width === 0 || a.height === 0) {
    const r = document.createElement("canvas");
    return r.width = 1, r.height = 1, r;
  }
  const s = document.createElement("canvas"), o = s.getContext("2d"), h = a.width + n * 2, l = a.height + n * 2;
  return s.width = h, s.height = l, o.drawImage(
    t,
    a.minX - n,
    a.minY - n,
    h,
    l,
    0,
    0,
    h,
    l
  ), s;
}
function Tt(t, e, n, a = !0) {
  const s = document.createElement("canvas"), o = s.getContext("2d");
  let h = e, l = n;
  if (a) {
    const r = t.width / t.height, d = e / n;
    r > d ? l = e / r : h = n * r;
  }
  return s.width = h, s.height = l, o.imageSmoothingEnabled = !0, o.imageSmoothingQuality = "high", o.drawImage(t, 0, 0, h, l), s;
}
function kt(t, e, n = {}) {
  const {
    fontSize: a = 12,
    fontFamily: s = "Arial",
    color: o = "#999",
    opacity: h = 0.5,
    position: l = "bottom-right"
  } = n, r = document.createElement("canvas"), d = r.getContext("2d");
  r.width = t.width, r.height = t.height, d.drawImage(t, 0, 0), d.font = `${a}px ${s}`, d.fillStyle = o, d.globalAlpha = h;
  const c = d.measureText(e).width, D = a;
  let p, y;
  switch (l) {
    case "top-left":
      p = 10, y = D + 10;
      break;
    case "top-right":
      p = t.width - c - 10, y = D + 10;
      break;
    case "bottom-left":
      p = 10, y = t.height - 10;
      break;
    case "bottom-right":
      p = t.width - c - 10, y = t.height - 10;
      break;
    case "center":
      p = (t.width - c) / 2, y = (t.height + D) / 2;
      break;
    default:
      p = t.width - c - 10, y = t.height - 10;
  }
  return d.fillText(e, p, y), d.globalAlpha = 1, r;
}
function bt(t) {
  const e = document.createElement("canvas"), n = e.getContext("2d");
  e.width = t.width, e.height = t.height, n.drawImage(t, 0, 0);
  const a = n.getImageData(0, 0, t.width, t.height), s = a.data;
  for (let o = 0; o < s.length; o += 4) {
    const h = s[o] * 0.299 + s[o + 1] * 0.587 + s[o + 2] * 0.114;
    s[o] = h, s[o + 1] = h, s[o + 2] = h;
  }
  return n.putImageData(a, 0, 0), e;
}
const vt = (t) => {
  t.component("ElectronicSignature", we);
}, Ct = {
  install: vt,
  ElectronicSignature: we
}, Dt = "1.0.0";
export {
  we as ElectronicSignature,
  Ne as SignatureReplayController,
  kt as addWatermark,
  Fe as calculateStrokeWidth,
  R as cloneSignatureData,
  bt as convertToGrayscale,
  X as createEmptySignatureData,
  Je as createReplayData,
  wt as cropSignature,
  Ct as default,
  fe as drawSmoothPath,
  He as exportSignature,
  qe as getAngle,
  Be as getControlPoint,
  mt as getDevicePixelRatio,
  xe as getDistance,
  gt as getSignatureBounds,
  $ as isSignatureEmpty,
  Le as loadImageToCanvas,
  Tt as resizeSignature,
  xt as setupHighDPICanvas,
  Ue as signatureToSVG,
  Dt as version
};
