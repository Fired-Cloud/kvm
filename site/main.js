/* Fired Cloud design mockup: purely visual interactions, no network calls. */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- hero sparks ---------- */
  var canvas = document.getElementById("sparks");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var w = 0, h = 0, dpr = 1, sparks = [];
    var resize = function () {
      var r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    var spawn = function (anyY) {
      return {
        x: Math.random() * w,
        y: anyY ? Math.random() * h : h + Math.random() * 40,
        r: 0.6 + Math.random() * 1.8,
        vy: 0.25 + Math.random() * 0.9,
        sway: Math.random() * Math.PI * 2,
        hue: 18 + Math.random() * 22
      };
    };
    var count = function () { return Math.round(Math.min(90, w / 14)); };
    var draw = function () {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < sparks.length; i++) {
        var s = sparks[i];
        var life = Math.max(0, Math.min(1, s.y / h));
        ctx.beginPath();
        ctx.fillStyle = "hsla(" + s.hue + ",100%," + (55 + (1 - life) * 10) + "%," + (life * 0.85) + ")";
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    var tick = function () {
      for (var i = 0; i < sparks.length; i++) {
        var s = sparks[i];
        s.y -= s.vy; s.sway += 0.02; s.x += Math.sin(s.sway) * 0.35;
        if (s.y < -10) sparks[i] = spawn(false);
      }
      draw();
      if (!document.hidden) requestAnimationFrame(tick); else paused = true;
    };
    var paused = false;
    resize();
    for (var i = 0; i < count(); i++) sparks.push(spawn(true));
    window.addEventListener("resize", function () {
      resize();
      while (sparks.length < count()) sparks.push(spawn(true));
      sparks.length = count();
      if (reduce) draw();
    });
    if (reduce) { draw(); }
    else {
      requestAnimationFrame(tick);
      document.addEventListener("visibilitychange", function () {
        if (!document.hidden && paused) { paused = false; requestAnimationFrame(tick); }
      });
    }
  }

  /* ---------- billing toggle ---------- */
  var fmt = function (n) { return n.toLocaleString("ru-RU").replace(/ /g, " ") + " ₽"; };
  var billButtons = document.querySelectorAll(".billing button");
  Array.prototype.forEach.call(billButtons, function (btn) {
    btn.addEventListener("click", function () {
      var yearly = btn.getAttribute("data-period") === "year";
      Array.prototype.forEach.call(billButtons, function (b) { b.setAttribute("aria-pressed", String(b === btn)); });
      Array.prototype.forEach.call(document.querySelectorAll(".price-num"), function (el) {
        var m = Number(el.getAttribute("data-month"));
        el.textContent = fmt(yearly ? Math.round(m * 0.85 / 10) * 10 : m);
        el.nextElementSibling.textContent = yearly ? "/ мес при оплате за год" : "/ мес";
      });
    });
  });

  /* ---------- control panel preview ---------- */
  var servers = [
    { name: "fc-msk-web-01", os: "Ubuntu 24.04", spec: "4 vCPU, 8 ГБ RAM", ip: "185.212.47.19", up: "аптайм 38 дней",
      cores: 4, ram: 8, disk: 120, cpu: 38, mem: 61, used: 53, on: true,
      traffic: [60, 54, 48, 40, 36, 38, 52, 90, 130, 160, 172, 180, 176, 190, 205, 198, 186, 210, 240, 232, 220, 206, 214, 212] },
    { name: "fc-ams-vpn", os: "Debian 12", spec: "1 vCPU, 1 ГБ RAM", ip: "45.137.20.8", up: "аптайм 112 дней",
      cores: 1, ram: 1, disk: 20, cpu: 7, mem: 32, used: 4, on: true,
      traffic: [12, 10, 8, 6, 5, 5, 7, 14, 22, 26, 24, 28, 30, 27, 25, 29, 34, 41, 48, 52, 46, 38, 30, 31] },
    { name: "fc-ekb-ci-02", os: "Rocky Linux 9", spec: "8 vCPU, 16 ГБ RAM", ip: "91.204.12.77", up: "выключен 2 часа назад",
      cores: 8, ram: 16, disk: 240, cpu: 0, mem: 0, used: 125, on: false,
      traffic: [80, 340, 410, 120, 60, 380, 420, 90, 50, 300, 360, 70, 40, 20, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0] }
  ];
  var current = 0;
  var C = 2 * Math.PI * 40;
  var $ = function (id) { return document.getElementById(id); };
  var num = function (n) { return String(Math.round(n * 10) / 10).replace(".", ","); };

  var setGauge = function (key, pct, label) {
    $("g-" + key).setAttribute("stroke-dashoffset", String(C * (1 - pct / 100)));
    $("g-" + key + "-t").textContent = Math.round(pct) + "%";
    $("g-" + key + "-l").textContent = label;
  };
  var drawTraffic = function (pts, on) {
    var max = 450, n = pts.length, step = 300 / (n - 1);
    var y = function (v) { return 76 - (v / max) * 68; };
    var line = pts.map(function (v, i) { return (i ? "L" : "M") + (i * step).toFixed(1) + " " + y(v).toFixed(1); }).join(" ");
    $("t-line").setAttribute("d", line);
    $("t-area").setAttribute("d", line + " L300 80 L0 80 Z");
    $("t-now").textContent = on ? pts[n - 1] + " Мбит/с" : "0 Мбит/с";
  };
  var pillFor = function (s) {
    return s.state === "reboot" ? ["pill-warn", "Перезагрузка"] : s.on ? ["pill-ok", "Работает"] : ["pill-off", "Выключен"];
  };
  var render = function () {
    var s = servers[current];
    var p = pillFor(s);
    $("d-name").textContent = s.name;
    $("d-pill").className = "pill " + p[0];
    $("d-pill").textContent = p[1];
    var sub = $("d-sub"), code = document.createElement("code");
    code.textContent = s.ip;
    sub.textContent = s.os + " · " + s.spec + " · ";
    sub.appendChild(code);
    sub.appendChild(document.createTextNode(" · " + s.up));
    var cpu = s.on ? s.cpu : 0, mem = s.on ? s.mem : 0;
    setGauge("cpu", cpu, num(s.cores * cpu / 100) + " из " + s.cores + " ядер");
    setGauge("ram", mem, num(s.ram * mem / 100) + " из " + s.ram + " ГБ");
    setGauge("disk", s.used / s.disk * 100, s.used + " из " + s.disk + " ГБ");
    drawTraffic(s.traffic, s.on);
    $("p-on").disabled = s.on || s.state === "reboot";
    $("p-off").disabled = !s.on || s.state === "reboot";
    $("p-reboot").disabled = !s.on || s.state === "reboot";
    Array.prototype.forEach.call(document.querySelectorAll(".srv"), function (b) {
      var i = Number(b.getAttribute("data-i"));
      b.setAttribute("aria-current", String(i === current));
      var pp = pillFor(servers[i]);
      var pill = b.querySelector("[data-pill]");
      pill.className = "pill " + pp[0];
      pill.textContent = pp[1];
    });
  };

  Array.prototype.forEach.call(document.querySelectorAll(".srv"), function (b) {
    b.addEventListener("click", function () { current = Number(b.getAttribute("data-i")); render(); });
  });
  if ($("p-on")) {
    $("p-on").addEventListener("click", function () {
      var s = servers[current]; s.on = true; s.cpu = s.cpu || 12; s.mem = s.mem || 18; s.up = "аптайм меньше минуты"; render();
    });
    $("p-off").addEventListener("click", function () {
      var s = servers[current]; s.on = false; s.up = "выключен только что"; render();
    });
    $("p-reboot").addEventListener("click", function () {
      var s = servers[current], idx = current; s.state = "reboot"; render();
      setTimeout(function () { servers[idx].state = null; servers[idx].up = "аптайм меньше минуты"; render(); }, 1800);
    });
    $("p-vnc").addEventListener("click", function () {
      var btn = $("p-vnc"); var old = btn.lastChild.textContent;
      btn.lastChild.textContent = "Здесь откроется консоль";
      setTimeout(function () { btn.lastChild.textContent = old; }, 1600);
    });
    render();
  }
})();
