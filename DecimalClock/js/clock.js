(function () {
  var RING_OUTER = 2 * Math.PI * 82;
  var RING_INNER = 2 * Math.PI * 62;
  var HALF_DAY_MS = 12 * 3600000;
  var MONTHS = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
  ];
  var SVG_NS = "http://www.w3.org/2000/svg";

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function msSinceMidnight(now) {
    return (
      now.getHours() * 3600000 +
      now.getMinutes() * 60000 +
      now.getSeconds() * 1000 +
      now.getMilliseconds()
    );
  }

  function fractionOfDay(now) {
    return msSinceMidnight(now) / 86400000;
  }

  function toDecimal(fraction) {
    var tenths = fraction * 10;
    var rounded = Math.round(tenths * 100) / 100;
    if (rounded >= 10) rounded = 0;
    var major = Math.floor(rounded + 1e-9);
    var minor = Math.round((rounded - major) * 100);
    if (minor === 100) {
      major += 1;
      minor = 0;
    }
    if (major >= 10) major = 0;
    return { major: major, minor: minor };
  }

  function formatClassicFull(now) {
    return pad(now.getHours()) + ":" + pad(now.getMinutes());
  }

  function formatAmerican(now) {
    var hours = now.getHours() % 12;
    if (hours === 0) hours = 12;
    var period = now.getHours() < 12 ? "AM" : "PM";
    return hours + ":" + pad(now.getMinutes()) + " " + period;
  }

  function formatDecimal(decimal) {
    return decimal.major + "\u2022" + pad(decimal.minor);
  }

  function formatDate(now) {
    return now.getDate() + " " + MONTHS[now.getMonth()] + " " + now.getFullYear();
  }

  function setText(el, value) {
    if (el) el.textContent = value;
  }

  function setRing(el, circumference, fraction) {
    if (!el) return;
    var clamped = Math.max(0, Math.min(1, fraction));
    el.style.strokeDasharray = String(circumference);
    el.style.strokeDashoffset = String(circumference * (1 - clamped));
  }

  function addLine(parent, className, x1, y1, x2, y2) {
    var line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("class", className);
    line.setAttribute("x1", x1.toFixed(2));
    line.setAttribute("y1", y1.toFixed(2));
    line.setAttribute("x2", x2.toFixed(2));
    line.setAttribute("y2", y2.toFixed(2));
    parent.appendChild(line);
  }

  function addNum(parent, label, x, y) {
    var text = document.createElementNS(SVG_NS, "text");
    text.setAttribute("class", "dial-num");
    text.setAttribute("x", x.toFixed(2));
    text.setAttribute("y", y.toFixed(2));
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.textContent = String(label);
    parent.appendChild(text);
  }

  function clear(el) {
    if (!el) return;
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function placeClassicFace(ticks, nums) {
    if (!ticks || !nums) return;
    clear(ticks);
    clear(nums);
    var cx = 100;
    var cy = 100;
    for (var i = 0; i < 60; i++) {
      var isHour = i % 5 === 0;
      var angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
      var inner = isHour ? 86 : 88;
      var outer = 94;
      addLine(
        ticks,
        isHour ? "tick-hour" : "tick-minute",
        cx + Math.cos(angle) * inner,
        cy + Math.sin(angle) * inner,
        cx + Math.cos(angle) * outer,
        cy + Math.sin(angle) * outer
      );
    }
    for (var h = 1; h <= 12; h++) {
      var a = (h / 12) * 2 * Math.PI - Math.PI / 2;
      addNum(nums, h, cx + Math.cos(a) * 72, cy + Math.sin(a) * 72);
    }
  }

  function placeDecimalFace(ticks, marks) {
    if (!ticks || !marks) return;
    clear(ticks);
    clear(marks);
    var cx = 100;
    var cy = 100;
    for (var i = 0; i < 100; i++) {
      var isUnit = i % 10 === 0;
      var isHalf = i % 10 === 5;
      var angle = (i / 100) * 2 * Math.PI - Math.PI / 2;
      var inner = isUnit ? 74 : isHalf ? 77 : 80;
      var outer = isUnit ? 93 : isHalf ? 90 : 88;
      addLine(
        ticks,
        isUnit ? "tick-unit" : isHalf ? "tick-half" : "tick-tenth",
        cx + Math.cos(angle) * inner,
        cy + Math.sin(angle) * inner,
        cx + Math.cos(angle) * outer,
        cy + Math.sin(angle) * outer
      );
    }
    for (var u = 0; u < 10; u++) {
      var ua = (u / 10) * 2 * Math.PI - Math.PI / 2;
      addNum(marks, u, cx + Math.cos(ua) * 62, cy + Math.sin(ua) * 62);
    }
  }

  function start() {
    var classicTime = document.getElementById("classicTime");
    var classicAmPm = document.getElementById("classicAmPm");
    var decimalTime = document.getElementById("decimalTime");
    var dateLabel = document.getElementById("dateLabel");
    var ringProgress = document.getElementById("ringProgress");
    var ringAm = document.getElementById("ringAm");
    var ringPm = document.getElementById("ringPm");
    var ringTicks = document.getElementById("ringTicks");
    var ringMarks = document.getElementById("ringMarks");
    var classicTicks = document.getElementById("classicTicks");
    var classicNums = document.getElementById("classicNums");

    placeClassicFace(classicTicks, classicNums);
    placeDecimalFace(ringTicks, ringMarks);

    function tick() {
      var now = new Date();
      var elapsed = msSinceMidnight(now);
      var fraction = fractionOfDay(now);
      var decimal = toDecimal(fraction);
      var decimalLabel = formatDecimal(decimal);
      var classicLabel = formatClassicFull(now);
      var americanLabel = formatAmerican(now);
      var amFraction = Math.min(elapsed / HALF_DAY_MS, 1);
      var pmFraction = Math.max((elapsed - HALF_DAY_MS) / HALF_DAY_MS, 0);
      var hour12 = now.getHours() % 12;
      if (hour12 === 0) hour12 = 12;

      setText(classicTime, classicLabel);
      setText(classicAmPm, americanLabel);
      setText(decimalTime, decimalLabel);
      setText(dateLabel, formatDate(now));

      setRing(ringAm, RING_OUTER, amFraction);
      setRing(ringPm, RING_INNER, pmFraction);
      setRing(ringProgress, RING_OUTER, fraction);

      if (classicNums) {
        var hourMarks = classicNums.children;
        for (var h = 0; h < hourMarks.length; h++) {
          hourMarks[h].classList.toggle("now", Number(hourMarks[h].textContent) === hour12);
        }
      }

      if (ringMarks) {
        var marks = ringMarks.children;
        for (var i = 0; i < marks.length; i++) {
          marks[i].classList.toggle("now", i === decimal.major);
        }
      }
    }

    tick();
    setInterval(tick, 200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
