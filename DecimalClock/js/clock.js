(function () {
  var CIRCUMFERENCE = 2 * Math.PI * 82;
  var MONTHS = [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
  ];

  var pairLine = document.getElementById("pairLine");
  var classicTime = document.getElementById("classicTime");
  var beatTime = document.getElementById("beatTime");
  var dateLabel = document.getElementById("dateLabel");
  var ringProgress = document.getElementById("ringProgress");
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

  function toBeat(fraction) {
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

  function formatBeat(beat) {
    return beat.major + ":" + pad(beat.minor);
  }

  function formatDate(now) {
    return now.getDate() + " " + MONTHS[now.getMonth()] + " " + now.getFullYear();
  }

  function placeMarks() {
    var html = "";
    for (var i = 0; i < 10; i++) {
      var angle = (i / 10) * 2 * Math.PI - Math.PI / 2;
      var x = 50 + Math.cos(angle) * 38;
      var y = 50 + Math.sin(angle) * 38;
      html +=
        '<li data-beat="' + i + '" style="left:' + x + "%;top:" + y + '%">' +
        i +
        "</li>";
    }
    ringMarks.innerHTML = html;
  }

  function tick() {
    var now = new Date();
    var fraction = fractionOfDay(now);
    var beat = toBeat(fraction);

    classicTime.textContent = formatClassicFull(now);
    beatTime.textContent = formatBeat(beat) + " .beat";
    pairLine.textContent = formatClassic(now) + "  —  " + formatBeat(beat) + " .beat";
    dateLabel.textContent = formatDate(now);

    ringProgress.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - fraction));

    var marks = ringMarks.children;
    for (var i = 0; i < marks.length; i++) {
      marks[i].classList.toggle("now", i === beat.major);
    }
  }

  placeMarks();
  tick();
  setInterval(tick, 200);
})();
