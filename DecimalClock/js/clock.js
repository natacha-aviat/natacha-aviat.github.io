(function () {
  var CIRCUMFERENCE = 2 * Math.PI * 82;
  var MONTHS = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
  ];

  var pairLine = document.getElementById("pairLine");
  var classicTime = document.getElementById("classicTime");
  var decimalTime = document.getElementById("decimalTime");
  var dateLabel = document.getElementById("dateLabel");
  var ringProgress = document.getElementById("ringProgress");
  var ringTicks = document.getElementById("ringTicks");
  var ringMarks = document.getElementById("ringMarks");

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function fractionOfDay(now) {
    var ms =
      now.getHours() * 3600000 +
      now.getMinutes() * 60000 +
      now.getSeconds() * 1000 +
      now.getMilliseconds();
    return ms / 86400000;
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
    return { major: major, minor: minor, raw: tenths };
  }

  function formatClassic(now) {
    return now.getHours() + "h" + pad(now.getMinutes());
  }

  function formatClassicFull(now) {
    return pad(now.getHours()) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds());
  }

  function formatDecimal(decimal) {
    return decimal.major + "\u2022" + pad(decimal.minor);
  }

  function formatDate(now) {
    return now.getDate() + " " + MONTHS[now.getMonth()] + " " + now.getFullYear();
  }

  function placeTicks() {
    if (!ringTicks) return;
    var svgNS = "http://www.w3.org/2000/svg";
    while (ringTicks.firstChild) {
      ringTicks.removeChild(ringTicks.firstChild);
    }
    var cx = 100;
    var cy = 100;
    for (var i = 0; i < 100; i++) {
      var isUnit = i % 10 === 0;
      var angle = (i / 100) * 2 * Math.PI;
      var inner = isUnit ? 73 : 78;
      var outer = isUnit ? 94 : 88;
      var line = document.createElementNS(svgNS, "line");
      line.setAttribute("class", isUnit ? "tick-unit" : "tick-tenth");
      line.setAttribute("x1", (cx + Math.cos(angle) * inner).toFixed(2));
      line.setAttribute("y1", (cy + Math.sin(angle) * inner).toFixed(2));
      line.setAttribute("x2", (cx + Math.cos(angle) * outer).toFixed(2));
      line.setAttribute("y2", (cy + Math.sin(angle) * outer).toFixed(2));
      ringTicks.appendChild(line);
    }
  }

  function placeMarks() {
    var html = "";
    for (var i = 0; i < 10; i++) {
      var angle = (i / 10) * 2 * Math.PI - Math.PI / 2;
      var x = 50 + Math.cos(angle) * 32;
      var y = 50 + Math.sin(angle) * 32;
      html +=
        '<li data-unit="' + i + '" style="left:' + x + "%;top:" + y + '%">' +
        i +
        "</li>";
    }
    ringMarks.innerHTML = html;
  }

  function tick() {
    var now = new Date();
    var fraction = fractionOfDay(now);
    var decimal = toDecimal(fraction);
    var decimalLabel = formatDecimal(decimal);

    if (classicTime) classicTime.textContent = formatClassicFull(now);
    if (decimalTime) decimalTime.textContent = decimalLabel;
    if (pairLine) pairLine.textContent = formatClassic(now) + "  —  " + decimalLabel;
    if (dateLabel) dateLabel.textContent = formatDate(now);

    if (ringProgress) {
      ringProgress.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - fraction));
    }

    if (ringMarks) {
      var marks = ringMarks.children;
      for (var i = 0; i < marks.length; i++) {
        marks[i].classList.toggle("now", i === decimal.major);
      }
    }
  }

  try {
    placeTicks();
    placeMarks();
  } catch (err) {
    /* l’horloge continue même si les graduations échouent */
  }
  tick();
  setInterval(tick, 200);
})();
