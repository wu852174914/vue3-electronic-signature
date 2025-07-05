import { defineComponent as ce, ref as b, computed as w, watch as he, nextTick as W, onMounted as de, onUnmounted as ge, openBlock as R, createElementBlock as T, normalizeStyle as I, createElementVNode as _, toDisplayString as fe, createCommentVNode as Q } from "vue";
function Z(e, o) {
  return Math.sqrt(
    Math.pow(o.x - e.x, 2) + Math.pow(o.y - e.y, 2)
  );
}
function ve(e, o) {
  return Math.atan2(o.y - e.y, o.x - e.x);
}
function me(e, o, r, t) {
  const n = o || e, i = r || e, s = 0.2, u = ve(n, i) * (t ? 1 : -1), l = Z(n, i) * s;
  return {
    x: e.x + Math.cos(u) * l,
    y: e.y + Math.sin(u) * l,
    time: e.time
  };
}
function pe(e, o, r) {
  if (!r.pressure.enabled)
    return r.strokeWidth;
  const t = Z(e, o), n = o.time - e.time, i = n > 0 ? t / n : 0, s = Math.max(0.1, Math.min(1, 1 - i * 0.01)), { min: u, max: l } = r.pressure;
  return u + (l - u) * s;
}
function K(e, o, r) {
  if (o.length < 2)
    return;
  if (e.strokeStyle = r.strokeColor, e.lineCap = "round", e.lineJoin = "round", !r.smoothing || o.length < 3) {
    e.beginPath(), e.lineWidth = r.strokeWidth, e.moveTo(o[0].x, o[0].y);
    for (let n = 1; n < o.length; n++)
      e.lineTo(o[n].x, o[n].y);
    e.stroke();
    return;
  }
  e.beginPath(), e.moveTo(o[0].x, o[0].y);
  for (let n = 1; n < o.length - 1; n++) {
    const i = o[n], s = o[n + 1];
    r.pressure.enabled ? e.lineWidth = pe(o[n - 1], i, r) : e.lineWidth = r.strokeWidth;
    const u = me(i, o[n - 1], s);
    e.quadraticCurveTo(u.x, u.y, i.x, i.y);
  }
  const t = o[o.length - 1];
  e.lineTo(t.x, t.y), e.stroke();
}
function we(e) {
  const { canvasSize: o, paths: r } = e;
  let t = `<svg width="${o.width}" height="${o.height}" xmlns="http://www.w3.org/2000/svg">`;
  return r.forEach((n) => {
    if (n.points.length < 2)
      return;
    let i = `M ${n.points[0].x} ${n.points[0].y}`;
    for (let s = 1; s < n.points.length; s++)
      i += ` L ${n.points[s].x} ${n.points[s].y}`;
    t += `<path d="${i}" stroke="${n.strokeColor}" stroke-width="${n.strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }), t += "</svg>", t;
}
function ye(e, o, r = { format: "png" }) {
  const { format: t, quality: n = 0.9, size: i, backgroundColor: s } = r;
  if (t === "svg")
    return we(o);
  const u = document.createElement("canvas"), l = u.getContext("2d");
  if (i) {
    u.width = i.width, u.height = i.height;
    const h = i.width / e.width, g = i.height / e.height;
    l.scale(h, g);
  } else
    u.width = e.width, u.height = e.height;
  switch (s && s !== "transparent" && (l.fillStyle = s, l.fillRect(0, 0, u.width, u.height)), l.drawImage(e, 0, 0), t) {
    case "jpeg":
      return u.toDataURL("image/jpeg", n);
    case "base64":
      return u.toDataURL("image/png").split(",")[1];
    case "png":
    default:
      return u.toDataURL("image/png");
  }
}
function be(e, o) {
  return new Promise((r, t) => {
    const n = new Image();
    n.onload = () => {
      const i = e.getContext("2d");
      i.clearRect(0, 0, e.width, e.height), i.drawImage(n, 0, 0, e.width, e.height), r();
    }, n.onerror = t, n.src = o;
  });
}
function P(e) {
  return e.paths.length === 0 || e.paths.every((o) => o.points.length === 0);
}
function E(e, o) {
  return {
    paths: [],
    canvasSize: { width: e, height: o },
    timestamp: Date.now(),
    isEmpty: !0
  };
}
function k(e) {
  return JSON.parse(JSON.stringify(e));
}
const ke = ["width", "height"], xe = {
  key: 1,
  class: "signature-toolbar"
}, Ce = ["disabled"], Se = ["disabled"], De = ["disabled"], _e = /* @__PURE__ */ ce({
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
    borderRadius: { default: "4px" }
  },
  emits: ["signature-start", "signature-drawing", "signature-end", "signature-clear", "signature-undo", "signature-redo"],
  setup(e, { expose: o, emit: r }) {
    const t = e, n = r, i = b(), s = b(!1), u = b(null), l = b(E(0, 0)), h = b([]), g = b(-1), d = w(() => typeof t.width == "number" ? t.width : 800), f = w(() => typeof t.height == "number" ? t.height : 300), m = w(() => ({
      position: "relative",
      display: "inline-block",
      width: typeof t.width == "string" ? t.width : `${t.width}px`,
      height: typeof t.height == "string" ? t.height : `${t.height}px`
    })), p = w(() => ({
      border: t.borderStyle,
      borderRadius: t.borderRadius,
      backgroundColor: t.backgroundColor,
      cursor: t.disabled ? "not-allowed" : "crosshair",
      display: "block",
      width: "100%",
      height: "100%"
    })), te = w(() => ({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      color: "#999",
      fontSize: "14px",
      pointerEvents: "none",
      userSelect: "none"
    })), ne = w(() => t.placeholder && P(l.value)), $ = w(() => g.value > 0), z = w(() => g.value < h.value.length - 1), X = w(() => ({
      strokeColor: t.strokeColor,
      strokeWidth: t.strokeWidth,
      smoothing: t.smoothing,
      pressure: {
        enabled: t.pressureSensitive,
        min: t.minStrokeWidth,
        max: t.maxStrokeWidth
      }
    })), Y = () => {
      var a;
      return ((a = i.value) == null ? void 0 : a.getContext("2d")) || null;
    }, C = (a, c) => {
      const v = i.value, y = v.getBoundingClientRect(), M = v.width / y.width, D = v.height / y.height;
      return {
        x: (a - y.left) * M,
        y: (c - y.top) * D,
        time: Date.now()
      };
    }, B = (a) => {
      t.disabled || (s.value = !0, u.value = {
        points: [a],
        strokeColor: t.strokeColor,
        strokeWidth: t.strokeWidth
      }, n("signature-start"));
    }, H = (a) => {
      if (!s.value || !u.value || t.disabled)
        return;
      u.value.points.push(a);
      const c = Y();
      c && K(c, u.value.points, X.value), O(), n("signature-drawing", l.value);
    }, U = () => {
      !s.value || !u.value || (s.value = !1, l.value.paths.push(u.value), l.value.isEmpty = !1, l.value.timestamp = Date.now(), S(), u.value = null, n("signature-end", l.value));
    }, oe = (a) => {
      a.preventDefault();
      const c = C(a.clientX, a.clientY);
      B(c);
    }, ae = (a) => {
      if (a.preventDefault(), !s.value)
        return;
      const c = C(a.clientX, a.clientY);
      H(c);
    }, A = (a) => {
      a.preventDefault(), U();
    }, ie = (a) => {
      if (a.preventDefault(), a.touches.length !== 1)
        return;
      const c = a.touches[0], v = C(c.clientX, c.clientY);
      B(v);
    }, re = (a) => {
      if (a.preventDefault(), a.touches.length !== 1 || !s.value)
        return;
      const c = a.touches[0], v = C(c.clientX, c.clientY);
      H(v);
    }, L = (a) => {
      a.preventDefault(), U();
    }, O = () => {
      l.value.canvasSize = {
        width: d.value,
        height: f.value
      }, l.value.isEmpty = P(l.value);
    }, S = () => {
      h.value = h.value.slice(0, g.value + 1), h.value.push(k(l.value)), g.value = h.value.length - 1;
      const a = 50;
      h.value.length > a && (h.value = h.value.slice(-a), g.value = h.value.length - 1);
    }, x = () => {
      const a = Y();
      a && (a.clearRect(0, 0, d.value, f.value), t.backgroundColor && t.backgroundColor !== "transparent" && (a.fillStyle = t.backgroundColor, a.fillRect(0, 0, d.value, f.value)), l.value.paths.forEach((c) => {
        if (c.points.length > 0) {
          const v = {
            strokeColor: c.strokeColor,
            strokeWidth: c.strokeWidth,
            smoothing: t.smoothing,
            pressure: X.value.pressure
          };
          K(a, c.points, v);
        }
      }));
    }, N = () => {
      t.disabled || (l.value = E(d.value, f.value), x(), S(), n("signature-clear"));
    }, j = () => {
      !$.value || t.disabled || (g.value--, l.value = k(h.value[g.value]), x(), n("signature-undo", l.value));
    }, q = () => {
      !z.value || t.disabled || (g.value++, l.value = k(h.value[g.value]), x(), n("signature-redo", l.value));
    }, J = (a) => {
      const c = i.value;
      return ye(c, l.value, a);
    }, V = () => P(l.value), F = async (a) => {
      if (t.disabled)
        return;
      const c = i.value;
      await be(c, a), l.value = E(d.value, f.value), l.value.isEmpty = !1, S();
    }, le = () => k(l.value), se = (a) => {
      t.disabled || (l.value = k(a), x(), S());
    }, G = (a, c) => {
      const v = a || d.value, y = c || f.value, M = J({ format: "png" });
      W(() => {
        const D = i.value;
        D.width = v, D.height = y, V() || F(M), O();
      });
    }, ue = () => {
      const a = i.value;
      a.width = d.value, a.height = f.value, l.value = E(d.value, f.value), h.value = [k(l.value)], g.value = 0, x();
    };
    return he([() => t.width, () => t.height], () => {
      W(() => {
        i.value && G();
      });
    }), de(() => {
      W(() => {
        ue();
      });
    }), ge(() => {
    }), o({
      clear: N,
      undo: j,
      redo: q,
      save: J,
      isEmpty: V,
      fromDataURL: F,
      getSignatureData: le,
      setSignatureData: se,
      resize: G
    }), (a, c) => (R(), T("div", {
      class: "electronic-signature",
      style: I(m.value)
    }, [
      _("canvas", {
        ref_key: "canvasRef",
        ref: i,
        width: d.value,
        height: f.value,
        style: I(p.value),
        onMousedown: oe,
        onMousemove: ae,
        onMouseup: A,
        onMouseleave: A,
        onTouchstart: ie,
        onTouchmove: re,
        onTouchend: L,
        onTouchcancel: L
      }, null, 44, ke),
      ne.value ? (R(), T("div", {
        key: 0,
        class: "signature-placeholder",
        style: I(te.value)
      }, fe(a.placeholder), 5)) : Q("", !0),
      a.showToolbar ? (R(), T("div", xe, [
        _("button", {
          onClick: N,
          disabled: a.disabled
        }, "清除", 8, Ce),
        _("button", {
          onClick: j,
          disabled: a.disabled || !$.value
        }, "撤销", 8, Se),
        _("button", {
          onClick: q,
          disabled: a.disabled || !z.value
        }, "重做", 8, De)
      ])) : Q("", !0)
    ], 4));
  }
});
const Ee = (e, o) => {
  const r = e.__vccOpts || e;
  for (const [t, n] of o)
    r[t] = n;
  return r;
}, ee = /* @__PURE__ */ Ee(_e, [["__scopeId", "data-v-6e7c2000"]]);
function Me() {
  return window.devicePixelRatio || 1;
}
function Ie(e) {
  const o = e.getContext("2d"), r = Me(), t = e.clientWidth, n = e.clientHeight;
  return e.width = t * r, e.height = n * r, o.scale(r, r), e.style.width = t + "px", e.style.height = n + "px", o;
}
function We(e) {
  if (e.paths.length === 0)
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0
    };
  let o = 1 / 0, r = 1 / 0, t = -1 / 0, n = -1 / 0;
  return e.paths.forEach((i) => {
    i.points.forEach((s) => {
      o = Math.min(o, s.x), r = Math.min(r, s.y), t = Math.max(t, s.x), n = Math.max(n, s.y);
    });
  }), {
    minX: o,
    minY: r,
    maxX: t,
    maxY: n,
    width: t - o,
    height: n - r
  };
}
function Pe(e, o, r = 10) {
  const t = We(o);
  if (t.width === 0 || t.height === 0) {
    const l = document.createElement("canvas");
    return l.width = 1, l.height = 1, l;
  }
  const n = document.createElement("canvas"), i = n.getContext("2d"), s = t.width + r * 2, u = t.height + r * 2;
  return n.width = s, n.height = u, i.drawImage(
    e,
    t.minX - r,
    t.minY - r,
    s,
    u,
    0,
    0,
    s,
    u
  ), n;
}
function $e(e, o, r, t = !0) {
  const n = document.createElement("canvas"), i = n.getContext("2d");
  let s = o, u = r;
  if (t) {
    const l = e.width / e.height, h = o / r;
    l > h ? u = o / l : s = r * l;
  }
  return n.width = s, n.height = u, i.imageSmoothingEnabled = !0, i.imageSmoothingQuality = "high", i.drawImage(e, 0, 0, s, u), n;
}
function ze(e, o, r = {}) {
  const {
    fontSize: t = 12,
    fontFamily: n = "Arial",
    color: i = "#999",
    opacity: s = 0.5,
    position: u = "bottom-right"
  } = r, l = document.createElement("canvas"), h = l.getContext("2d");
  l.width = e.width, l.height = e.height, h.drawImage(e, 0, 0), h.font = `${t}px ${n}`, h.fillStyle = i, h.globalAlpha = s;
  const d = h.measureText(o).width, f = t;
  let m, p;
  switch (u) {
    case "top-left":
      m = 10, p = f + 10;
      break;
    case "top-right":
      m = e.width - d - 10, p = f + 10;
      break;
    case "bottom-left":
      m = 10, p = e.height - 10;
      break;
    case "bottom-right":
      m = e.width - d - 10, p = e.height - 10;
      break;
    case "center":
      m = (e.width - d) / 2, p = (e.height + f) / 2;
      break;
    default:
      m = e.width - d - 10, p = e.height - 10;
  }
  return h.fillText(o, m, p), h.globalAlpha = 1, l;
}
function Xe(e) {
  const o = document.createElement("canvas"), r = o.getContext("2d");
  o.width = e.width, o.height = e.height, r.drawImage(e, 0, 0);
  const t = r.getImageData(0, 0, e.width, e.height), n = t.data;
  for (let i = 0; i < n.length; i += 4) {
    const s = n[i] * 0.299 + n[i + 1] * 0.587 + n[i + 2] * 0.114;
    n[i] = s, n[i + 1] = s, n[i + 2] = s;
  }
  return r.putImageData(t, 0, 0), o;
}
const Re = (e) => {
  e.component("ElectronicSignature", ee);
}, Ye = {
  install: Re,
  ElectronicSignature: ee
}, Be = "1.0.0";
export {
  ee as ElectronicSignature,
  ze as addWatermark,
  pe as calculateStrokeWidth,
  k as cloneSignatureData,
  Xe as convertToGrayscale,
  E as createEmptySignatureData,
  Pe as cropSignature,
  Ye as default,
  K as drawSmoothPath,
  ye as exportSignature,
  ve as getAngle,
  me as getControlPoint,
  Me as getDevicePixelRatio,
  Z as getDistance,
  We as getSignatureBounds,
  P as isSignatureEmpty,
  be as loadImageToCanvas,
  $e as resizeSignature,
  Ie as setupHighDPICanvas,
  we as signatureToSVG,
  Be as version
};
