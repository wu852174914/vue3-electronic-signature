var Xt = Object.defineProperty;
var Yt = (e, t, i) => t in e ? Xt(e, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : e[t] = i;
var y = (e, t, i) => (Yt(e, typeof t != "symbol" ? t + "" : t, i), i);
import { defineComponent as zt, ref as w, computed as f, watch as A, nextTick as B, onMounted as Ot, onUnmounted as At, openBlock as M, createElementBlock as P, normalizeStyle as F, createElementVNode as p, toDisplayString as H, createCommentVNode as U } from "vue";
function yt(e, t) {
  return Math.sqrt(
    Math.pow(t.x - e.x, 2) + Math.pow(t.y - e.y, 2)
  );
}
function Bt(e, t) {
  return Math.atan2(t.y - e.y, t.x - e.x);
}
function Ft(e, t, i, a) {
  const n = t || e, o = i || e, u = 0.2, h = Bt(n, o) * (a ? 1 : -1), l = yt(n, o) * u;
  return {
    x: e.x + Math.cos(h) * l,
    y: e.y + Math.sin(h) * l,
    time: e.time
  };
}
function Ht(e, t, i) {
  if (!i.pressure.enabled)
    return i.strokeWidth;
  const a = yt(e, t), n = t.time - e.time, o = n > 0 ? a / n : 0, u = Math.max(0.1, Math.min(1, 1 - o * 0.01)), { min: h, max: l } = i.pressure;
  return h + (l - h) * u;
}
function vt(e, t, i) {
  if (t.length < 2)
    return;
  if (e.strokeStyle = i.strokeColor, e.lineCap = "round", e.lineJoin = "round", !i.smoothing || t.length < 3) {
    e.beginPath(), e.lineWidth = i.strokeWidth, e.moveTo(t[0].x, t[0].y);
    for (let n = 1; n < t.length; n++)
      e.lineTo(t[n].x, t[n].y);
    e.stroke();
    return;
  }
  e.beginPath(), e.moveTo(t[0].x, t[0].y);
  for (let n = 1; n < t.length - 1; n++) {
    const o = t[n], u = t[n + 1];
    i.pressure.enabled ? e.lineWidth = Ht(t[n - 1], o, i) : e.lineWidth = i.strokeWidth;
    const h = Ft(o, t[n - 1], u);
    e.quadraticCurveTo(h.x, h.y, o.x, o.y);
  }
  const a = t[t.length - 1];
  e.lineTo(a.x, a.y), e.stroke();
}
function Ut(e) {
  const { canvasSize: t, paths: i } = e;
  let a = `<svg width="${t.width}" height="${t.height}" xmlns="http://www.w3.org/2000/svg">`;
  return i.forEach((n) => {
    if (n.points.length < 2)
      return;
    let o = `M ${n.points[0].x} ${n.points[0].y}`;
    for (let u = 1; u < n.points.length; u++)
      o += ` L ${n.points[u].x} ${n.points[u].y}`;
    a += `<path d="${o}" stroke="${n.strokeColor}" stroke-width="${n.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), a += "</svg>", a;
}
function Nt(e, t, i = { format: "png" }) {
  const { format: a, quality: n = 0.9, size: o, backgroundColor: u } = i;
  if (a === "svg")
    return Ut(t);
  const h = document.createElement("canvas"), l = h.getContext("2d");
  if (o) {
    h.width = o.width, h.height = o.height;
    const d = o.width / e.width, v = o.height / e.height;
    l.scale(d, v);
  } else
    h.width = e.width, h.height = e.height;
  switch (u && u !== "transparent" && (l.fillStyle = u, l.fillRect(0, 0, h.width, h.height)), l.drawImage(e, 0, 0), a) {
    case "jpeg":
      return h.toDataURL("image/jpeg", n);
    case "base64":
      return h.toDataURL("image/png").split(",")[1];
    case "png":
    default:
      return h.toDataURL("image/png");
  }
}
function qt(e, t) {
  return new Promise((i, a) => {
    const n = new Image();
    n.onload = () => {
      const o = e.getContext("2d");
      o.clearRect(0, 0, e.width, e.height), o.drawImage(n, 0, 0, e.width, e.height), i();
    }, n.onerror = a, n.src = t;
  });
}
function W(e) {
  return e.paths.length === 0 || e.paths.every((t) => t.points.length === 0);
}
function $(e, t) {
  return {
    paths: [],
    canvasSize: { width: e, height: t },
    timestamp: Date.now(),
    isEmpty: !0
  };
}
function _(e) {
  return JSON.parse(JSON.stringify(e));
}
class Jt {
  constructor(t) {
    y(this, "canvas");
    y(this, "ctx");
    y(this, "replayData", null);
    y(this, "state", "idle");
    y(this, "currentTime", 0);
    y(this, "speed", 1);
    y(this, "animationId", null);
    y(this, "startTimestamp", 0);
    y(this, "pausedTime", 0);
    y(this, "options", {});
    // 事件回调
    y(this, "eventCallbacks", /* @__PURE__ */ new Map());
    this.canvas = t, this.ctx = t.getContext("2d");
  }
  /**
   * 设置回放数据
   */
  setReplayData(t, i = {}) {
    this.replayData = t, this.options = { ...i }, this.speed = i.speed || t.speed || 1, this.currentTime = i.startTime || 0, this.state = "idle";
  }
  /**
   * 开始播放
   */
  play() {
    !this.replayData || this.state === "playing" || (this.state === "paused" ? (this.state = "playing", this.startTimestamp = performance.now() - this.pausedTime, this.emit("replay-resume")) : (this.state = "playing", this.startTimestamp = performance.now(), this.pausedTime = 0, this.currentTime = this.options.startTime || 0, this.clearCanvas(), this.emit("replay-start")), this.animate());
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
    const i = this.options.endTime || this.replayData.totalDuration;
    this.currentTime = Math.max(0, Math.min(t, i)), this.state === "playing" ? this.startTimestamp = performance.now() - this.currentTime / this.speed : this.pausedTime = this.currentTime / this.speed, this.renderFrame(this.currentTime);
  }
  /**
   * 设置播放速度
   */
  setSpeed(t) {
    const i = this.state === "playing";
    i && this.pause(), this.speed = Math.max(0.1, Math.min(5, t)), this.emit("replay-speed-change", this.speed), i && this.play();
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
    const i = this.options.endTime || this.replayData.totalDuration;
    if (this.currentTime >= i) {
      this.currentTime = i, this.state = "completed", this.renderFrame(this.currentTime), this.emit("replay-complete"), this.options.loop && setTimeout(() => {
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
    let i = -1;
    for (let a = 0; a < this.replayData.paths.length; a++) {
      const n = this.replayData.paths[a], o = n.startTime || 0, u = n.endTime || o + (n.duration || 0);
      if (t < o)
        break;
      if (t >= u) {
        this.drawCompletePath(n);
        continue;
      }
      i = a;
      const h = (t - o) / (u - o);
      this.drawPartialPath(n, h), h > 0 && h < 0.1 && this.emit("replay-path-start", a, n);
      break;
    }
    if (i >= 0) {
      const a = this.replayData.paths[i], n = a.endTime || (a.startTime || 0) + (a.duration || 0);
      Math.abs(t - n) < 50 && this.emit("replay-path-end", i, a);
    }
  }
  /**
   * 绘制完整路径
   */
  drawCompletePath(t) {
    if (!(t.points.length < 2)) {
      this.ctx.beginPath(), this.ctx.strokeStyle = t.strokeColor, this.ctx.lineWidth = t.strokeWidth, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", this.ctx.moveTo(t.points[0].x, t.points[0].y);
      for (let i = 1; i < t.points.length; i++)
        this.ctx.lineTo(t.points[i].x, t.points[i].y);
      this.ctx.stroke();
    }
  }
  /**
   * 绘制部分路径
   */
  drawPartialPath(t, i) {
    if (t.points.length < 2)
      return;
    const a = t.points.length, n = Math.floor(a * i);
    if (!(n < 1)) {
      this.ctx.beginPath(), this.ctx.strokeStyle = t.strokeColor, this.ctx.lineWidth = t.strokeWidth, this.ctx.lineCap = "round", this.ctx.lineJoin = "round", this.ctx.moveTo(t.points[0].x, t.points[0].y);
      for (let o = 1; o <= n; o++)
        this.ctx.lineTo(t.points[o].x, t.points[o].y);
      if (i < 1 && n < a - 1) {
        const o = a * i - n, u = t.points[n], h = t.points[n + 1], l = u.x + (h.x - u.x) * o, d = u.y + (h.y - u.y) * o;
        this.ctx.lineTo(l, d);
      }
      this.ctx.stroke();
    }
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
  on(t, i) {
    this.eventCallbacks.has(t) || this.eventCallbacks.set(t, []), this.eventCallbacks.get(t).push(i);
  }
  /**
   * 移除事件监听器
   */
  off(t, i) {
    if (this.eventCallbacks.has(t))
      if (i) {
        const a = this.eventCallbacks.get(t), n = a.indexOf(i);
        n > -1 && a.splice(n, 1);
      } else
        this.eventCallbacks.delete(t);
  }
  /**
   * 触发事件
   */
  emit(t, ...i) {
    const a = this.eventCallbacks.get(t);
    a && a.forEach((n) => n(...i));
  }
  /**
   * 销毁控制器
   */
  destroy() {
    this.stop(), this.eventCallbacks.clear(), this.replayData = null;
  }
}
function Lt(e) {
  const t = e.paths.map((o, u) => {
    const h = o.points.map((c, k) => ({
      ...c,
      relativeTime: k * 50
      // 假设每个点间隔50ms
    })), l = u > 0 ? e.paths[u - 1].endTime + 200 : (
      // 笔画间200ms间隔
      0
    ), d = h.length * 50, v = l + d;
    return {
      ...o,
      points: h,
      startTime: l,
      endTime: v,
      duration: d
    };
  }), i = t.length > 0 ? t[t.length - 1].endTime : 0, a = t.reduce((o, u) => o + jt(u.points), 0), n = i > 0 ? a / (i / 1e3) : 0;
  return {
    paths: t,
    totalDuration: i,
    speed: 1,
    metadata: {
      deviceType: "touch",
      // 可以根据实际情况检测
      averageSpeed: n,
      totalDistance: a,
      averagePauseTime: 200
    }
  };
}
function jt(e) {
  let t = 0;
  for (let i = 1; i < e.length; i++) {
    const a = e[i].x - e[i - 1].x, n = e[i].y - e[i - 1].y;
    t += Math.sqrt(a * a + n * n);
  }
  return t;
}
const Vt = ["width", "height"], Gt = {
  key: 1,
  class: "signature-toolbar"
}, Qt = ["disabled"], Kt = ["disabled"], Zt = ["disabled"], te = {
  key: 2,
  class: "replay-controls"
}, ee = { class: "replay-buttons" }, ae = ["disabled"], ne = { key: 0 }, se = { key: 1 }, ie = ["disabled"], oe = { class: "replay-progress" }, re = ["max", "value", "disabled"], le = { class: "time-display" }, ue = { class: "replay-speed" }, he = /* @__PURE__ */ zt({
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
  setup(e, { expose: t, emit: i }) {
    const a = e, n = i, o = w(), u = w(!1), h = w(null), l = w($(0, 0)), d = w([]), v = w(-1), c = w(null), k = w(!1), m = w("idle"), T = w(0), X = w(0), b = f(() => typeof a.width == "number" ? a.width : 800), C = f(() => typeof a.height == "number" ? a.height : 300), wt = f(() => ({
      position: "relative",
      display: "inline-block",
      width: typeof a.width == "string" ? a.width : `${a.width}px`,
      height: typeof a.height == "string" ? a.height : `${a.height}px`
    })), xt = f(() => ({
      border: a.borderStyle,
      borderRadius: a.borderRadius,
      backgroundColor: a.backgroundColor,
      cursor: a.disabled ? "not-allowed" : "crosshair",
      display: "block",
      width: "100%",
      height: "100%"
    })), kt = f(() => ({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "#999",
      fontSize: "14px",
      pointerEvents: "none",
      userSelect: "none"
    })), Tt = f(() => a.placeholder && W(l.value)), N = f(() => v.value > 0), q = f(() => v.value < d.value.length - 1), J = f(() => k.value && c.value), x = f(() => !J.value && !a.disabled), bt = f(() => {
      var s;
      return J.value && ((s = a.replayOptions) == null ? void 0 : s.showControls) !== !1;
    }), L = f(() => ({
      strokeColor: a.strokeColor,
      strokeWidth: a.strokeWidth,
      smoothing: a.smoothing,
      pressure: {
        enabled: a.pressureSensitive,
        min: a.minStrokeWidth,
        max: a.maxStrokeWidth
      }
    })), j = () => {
      var s;
      return ((s = o.value) == null ? void 0 : s.getContext("2d")) || null;
    }, R = (s, r) => {
      const g = o.value, D = g.getBoundingClientRect(), O = g.width / D.width, I = g.height / D.height;
      return {
        x: (s - D.left) * O,
        y: (r - D.top) * I,
        time: Date.now()
      };
    }, V = (s) => {
      x.value && (u.value = !0, h.value = {
        points: [s],
        strokeColor: a.strokeColor,
        strokeWidth: a.strokeWidth
      }, n("signature-start"));
    }, G = (s) => {
      if (!u.value || !h.value || !x.value)
        return;
      h.value.points.push(s);
      const r = j();
      r && vt(r, h.value.points, L.value), tt(), n("signature-drawing", l.value);
    }, Q = () => {
      !u.value || !h.value || (u.value = !1, l.value.paths.push(h.value), l.value.isEmpty = !1, l.value.timestamp = Date.now(), E(), h.value = null, n("signature-end", l.value));
    }, Ct = (s) => {
      s.preventDefault();
      const r = R(s.clientX, s.clientY);
      V(r);
    }, Dt = (s) => {
      if (s.preventDefault(), !u.value)
        return;
      const r = R(s.clientX, s.clientY);
      G(r);
    }, K = (s) => {
      s.preventDefault(), Q();
    }, St = (s) => {
      if (s.preventDefault(), s.touches.length !== 1)
        return;
      const r = s.touches[0], g = R(r.clientX, r.clientY);
      V(g);
    }, Mt = (s) => {
      if (s.preventDefault(), s.touches.length !== 1 || !u.value)
        return;
      const r = s.touches[0], g = R(r.clientX, r.clientY);
      G(g);
    }, Z = (s) => {
      s.preventDefault(), Q();
    }, tt = () => {
      l.value.canvasSize = {
        width: b.value,
        height: C.value
      }, l.value.isEmpty = W(l.value);
    }, E = () => {
      d.value = d.value.slice(0, v.value + 1), d.value.push(_(l.value)), v.value = d.value.length - 1;
      const s = 50;
      d.value.length > s && (d.value = d.value.slice(-s), v.value = d.value.length - 1);
    }, S = () => {
      const s = j();
      s && (s.clearRect(0, 0, b.value, C.value), a.backgroundColor && a.backgroundColor !== "transparent" && (s.fillStyle = a.backgroundColor, s.fillRect(0, 0, b.value, C.value)), l.value.paths.forEach((r) => {
        if (r.points.length > 0) {
          const g = {
            strokeColor: r.strokeColor,
            strokeWidth: r.strokeWidth,
            smoothing: a.smoothing,
            pressure: L.value.pressure
          };
          vt(s, r.points, g);
        }
      }));
    }, et = () => {
      o.value && (c.value && c.value.destroy(), c.value = new Jt(o.value), c.value.on("replay-start", () => {
        m.value = "playing", n("replay-start");
      }), c.value.on("replay-progress", (s, r) => {
        T.value = s, X.value = r, n("replay-progress", s, r);
      }), c.value.on("replay-pause", () => {
        m.value = "paused", n("replay-pause");
      }), c.value.on("replay-resume", () => {
        m.value = "playing", n("replay-resume");
      }), c.value.on("replay-stop", () => {
        m.value = "stopped", n("replay-stop");
      }), c.value.on("replay-complete", () => {
        m.value = "completed", n("replay-complete");
      }), c.value.on("replay-path-start", (s, r) => {
        n("replay-path-start", s, r);
      }), c.value.on("replay-path-end", (s, r) => {
        n("replay-path-end", s, r);
      }), c.value.on("replay-speed-change", (s) => {
        n("replay-speed-change", s);
      }));
    }, Y = (s, r) => {
      c.value || et(), c.value && (k.value = !0, c.value.setReplayData(s, r), (r == null ? void 0 : r.autoPlay) !== !1 && c.value.play());
    }, at = (s) => {
      k.value = s, !s && c.value && (c.value.stop(), S());
    }, Pt = () => W(l.value) ? null : Lt(l.value), nt = () => {
      var s;
      (s = c.value) == null || s.play();
    }, st = () => {
      var s;
      (s = c.value) == null || s.pause();
    }, it = () => {
      var s;
      (s = c.value) == null || s.stop();
    }, ot = (s) => {
      var r;
      (r = c.value) == null || r.seek(s);
    }, rt = (s) => {
      var r;
      (r = c.value) == null || r.setSpeed(s);
    }, _t = () => {
      var s;
      return ((s = c.value) == null ? void 0 : s.getState()) || "idle";
    }, Rt = () => {
      var s;
      return ((s = c.value) == null ? void 0 : s.getCurrentTime()) || 0;
    }, z = () => {
      var s;
      return ((s = c.value) == null ? void 0 : s.getTotalDuration()) || 0;
    }, Et = () => {
      var s;
      return ((s = c.value) == null ? void 0 : s.getProgress()) || 0;
    }, lt = (s) => {
      const r = Math.floor(s / 1e3), g = Math.floor(r / 60), D = r % 60;
      return `${g}:${D.toString().padStart(2, "0")}`;
    }, ut = () => {
      x.value && (l.value = $(b.value, C.value), S(), E(), n("signature-clear"));
    }, ht = () => {
      !N.value || !x.value || (v.value--, l.value = _(d.value[v.value]), S(), n("signature-undo", l.value));
    }, ct = () => {
      !q.value || !x.value || (v.value++, l.value = _(d.value[v.value]), S(), n("signature-redo", l.value));
    }, dt = (s) => {
      const r = o.value;
      return Nt(r, l.value, s);
    }, pt = () => W(l.value), gt = async (s) => {
      if (!x.value)
        return;
      const r = o.value;
      await qt(r, s), l.value = $(b.value, C.value), l.value.isEmpty = !1, E();
    }, It = () => _(l.value), Wt = (s) => {
      x.value && (l.value = _(s), S(), E());
    }, mt = (s, r) => {
      const g = s || b.value, D = r || C.value, O = dt({ format: "png" });
      B(() => {
        const I = o.value;
        I.width = g, I.height = D, pt() || gt(O), tt();
      });
    }, $t = () => {
      const s = o.value;
      s.width = b.value, s.height = C.value, l.value = $(b.value, C.value), d.value = [_(l.value)], v.value = 0, S();
    };
    return A([() => a.width, () => a.height], () => {
      B(() => {
        o.value && mt();
      });
    }), A(() => a.replayMode, (s) => {
      s !== void 0 && at(s);
    }), A(() => a.replayData, (s) => {
      s && a.replayMode && Y(s, a.replayOptions);
    }), Ot(() => {
      B(() => {
        $t(), et(), a.replayMode && a.replayData && Y(a.replayData, a.replayOptions);
      });
    }), At(() => {
      c.value && (c.value.destroy(), c.value = null);
    }), t({
      clear: ut,
      undo: ht,
      redo: ct,
      save: dt,
      isEmpty: pt,
      fromDataURL: gt,
      getSignatureData: It,
      setSignatureData: Wt,
      resize: mt,
      // 回放相关方法
      startReplay: Y,
      getReplayData: Pt,
      setReplayMode: at,
      play: nt,
      pause: st,
      stop: it,
      seek: ot,
      setSpeed: rt,
      getState: _t,
      getCurrentTime: Rt,
      getTotalDuration: z,
      getProgress: Et
    }), (s, r) => (M(), P("div", {
      class: "electronic-signature",
      style: F(wt.value)
    }, [
      p("canvas", {
        ref_key: "canvasRef",
        ref: o,
        width: b.value,
        height: C.value,
        style: F(xt.value),
        onMousedown: Ct,
        onMousemove: Dt,
        onMouseup: K,
        onMouseleave: K,
        onTouchstart: St,
        onTouchmove: Mt,
        onTouchend: Z,
        onTouchcancel: Z
      }, null, 44, Vt),
      Tt.value ? (M(), P("div", {
        key: 0,
        class: "signature-placeholder",
        style: F(kt.value)
      }, H(s.placeholder), 5)) : U("", !0),
      s.showToolbar ? (M(), P("div", Gt, [
        p("button", {
          onClick: ut,
          disabled: !x.value
        }, "清除", 8, Qt),
        p("button", {
          onClick: ht,
          disabled: !x.value || !N.value
        }, "撤销", 8, Kt),
        p("button", {
          onClick: ct,
          disabled: !x.value || !q.value
        }, "重做", 8, Zt)
      ])) : U("", !0),
      bt.value ? (M(), P("div", te, [
        p("div", ee, [
          p("button", {
            onClick: r[0] || (r[0] = (g) => m.value === "playing" ? st() : nt()),
            disabled: m.value === "idle",
            class: "replay-btn play-pause-btn"
          }, [
            m.value === "playing" ? (M(), P("span", ne, "⏸️")) : (M(), P("span", se, "▶️"))
          ], 8, ae),
          p("button", {
            onClick: r[1] || (r[1] = (g) => it()),
            disabled: m.value === "idle",
            class: "replay-btn stop-btn"
          }, " ⏹️ ", 8, ie)
        ]),
        p("div", oe, [
          p("input", {
            type: "range",
            min: "0",
            max: z(),
            value: X.value,
            onInput: r[2] || (r[2] = (g) => ot(Number(g.target.value))),
            class: "progress-slider",
            disabled: m.value === "idle"
          }, null, 40, re),
          p("div", le, [
            p("span", null, H(lt(X.value)), 1),
            r[4] || (r[4] = p("span", null, "/", -1)),
            p("span", null, H(lt(z())), 1)
          ])
        ]),
        p("div", ue, [
          r[6] || (r[6] = p("label", null, "速度:", -1)),
          p("select", {
            onChange: r[3] || (r[3] = (g) => rt(Number(g.target.value))),
            class: "speed-select"
          }, r[5] || (r[5] = [
            p("option", { value: "0.5" }, "0.5x", -1),
            p("option", {
              value: "1",
              selected: ""
            }, "1x", -1),
            p("option", { value: "1.5" }, "1.5x", -1),
            p("option", { value: "2" }, "2x", -1)
          ]), 32)
        ])
      ])) : U("", !0)
    ], 4));
  }
});
const ce = (e, t) => {
  const i = e.__vccOpts || e;
  for (const [a, n] of t)
    i[a] = n;
  return i;
}, ft = /* @__PURE__ */ ce(he, [["__scopeId", "data-v-7095fbe0"]]);
function de() {
  return window.devicePixelRatio || 1;
}
function ye(e) {
  const t = e.getContext("2d"), i = de(), a = e.clientWidth, n = e.clientHeight;
  return e.width = a * i, e.height = n * i, t.scale(i, i), e.style.width = a + "px", e.style.height = n + "px", t;
}
function pe(e) {
  if (e.paths.length === 0)
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0
    };
  let t = 1 / 0, i = 1 / 0, a = -1 / 0, n = -1 / 0;
  return e.paths.forEach((o) => {
    o.points.forEach((u) => {
      t = Math.min(t, u.x), i = Math.min(i, u.y), a = Math.max(a, u.x), n = Math.max(n, u.y);
    });
  }), {
    minX: t,
    minY: i,
    maxX: a,
    maxY: n,
    width: a - t,
    height: n - i
  };
}
function fe(e, t, i = 10) {
  const a = pe(t);
  if (a.width === 0 || a.height === 0) {
    const l = document.createElement("canvas");
    return l.width = 1, l.height = 1, l;
  }
  const n = document.createElement("canvas"), o = n.getContext("2d"), u = a.width + i * 2, h = a.height + i * 2;
  return n.width = u, n.height = h, o.drawImage(
    e,
    a.minX - i,
    a.minY - i,
    u,
    h,
    0,
    0,
    u,
    h
  ), n;
}
function we(e, t, i, a = !0) {
  const n = document.createElement("canvas"), o = n.getContext("2d");
  let u = t, h = i;
  if (a) {
    const l = e.width / e.height, d = t / i;
    l > d ? h = t / l : u = i * l;
  }
  return n.width = u, n.height = h, o.imageSmoothingEnabled = !0, o.imageSmoothingQuality = "high", o.drawImage(e, 0, 0, u, h), n;
}
function xe(e, t, i = {}) {
  const {
    fontSize: a = 12,
    fontFamily: n = "Arial",
    color: o = "#999",
    opacity: u = 0.5,
    position: h = "bottom-right"
  } = i, l = document.createElement("canvas"), d = l.getContext("2d");
  l.width = e.width, l.height = e.height, d.drawImage(e, 0, 0), d.font = `${a}px ${n}`, d.fillStyle = o, d.globalAlpha = u;
  const c = d.measureText(t).width, k = a;
  let m, T;
  switch (h) {
    case "top-left":
      m = 10, T = k + 10;
      break;
    case "top-right":
      m = e.width - c - 10, T = k + 10;
      break;
    case "bottom-left":
      m = 10, T = e.height - 10;
      break;
    case "bottom-right":
      m = e.width - c - 10, T = e.height - 10;
      break;
    case "center":
      m = (e.width - c) / 2, T = (e.height + k) / 2;
      break;
    default:
      m = e.width - c - 10, T = e.height - 10;
  }
  return d.fillText(t, m, T), d.globalAlpha = 1, l;
}
function ke(e) {
  const t = document.createElement("canvas"), i = t.getContext("2d");
  t.width = e.width, t.height = e.height, i.drawImage(e, 0, 0);
  const a = i.getImageData(0, 0, e.width, e.height), n = a.data;
  for (let o = 0; o < n.length; o += 4) {
    const u = n[o] * 0.299 + n[o + 1] * 0.587 + n[o + 2] * 0.114;
    n[o] = u, n[o + 1] = u, n[o + 2] = u;
  }
  return i.putImageData(a, 0, 0), t;
}
const ge = (e) => {
  e.component("ElectronicSignature", ft);
}, Te = {
  install: ge,
  ElectronicSignature: ft
}, be = "1.0.0";
export {
  ft as ElectronicSignature,
  Jt as SignatureReplayController,
  xe as addWatermark,
  Ht as calculateStrokeWidth,
  _ as cloneSignatureData,
  ke as convertToGrayscale,
  $ as createEmptySignatureData,
  Lt as createReplayData,
  fe as cropSignature,
  Te as default,
  vt as drawSmoothPath,
  Nt as exportSignature,
  Bt as getAngle,
  Ft as getControlPoint,
  de as getDevicePixelRatio,
  yt as getDistance,
  pe as getSignatureBounds,
  W as isSignatureEmpty,
  qt as loadImageToCanvas,
  we as resizeSignature,
  ye as setupHighDPICanvas,
  Ut as signatureToSVG,
  be as version
};
