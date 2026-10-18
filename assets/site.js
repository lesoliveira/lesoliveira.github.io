(function () {
  // mobile menu
  var btn = document.querySelector(".menu-btn"), nav = document.getElementById("nav");
  if (btn && nav) btn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  // e-mail, assembled at runtime to keep it away from scrapers
  document.querySelectorAll("a.mail").forEach(function (a) {
    var addr = a.dataset.u + "@" + a.dataset.d;
    a.href = "mailto:" + addr;
    a.lastChild.textContent = addr;
  });

  // people: filter former students
  var fbtns = document.querySelectorAll(".filter button");
  fbtns.forEach(function (b) {
    b.addEventListener("click", function () {
      fbtns.forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      var f = b.dataset.f;
      document.querySelectorAll("table.alumni tbody tr").forEach(function (tr) {
        tr.hidden = !(f === "all" || tr.dataset.kind === f);
      });
    });
  });

  // publications: tabs + search
  var tabs = document.querySelectorAll(".tabs button");
  if (!tabs.length) return;
  var panes = document.querySelectorAll(".pane");
  var q = document.getElementById("q"), note = document.getElementById("pub-note");
  var current = tabs[0].dataset.t;

  function show(id) {
    current = id;
    tabs.forEach(function (t) { t.setAttribute("aria-selected", t.dataset.t === id ? "true" : "false"); });
    panes.forEach(function (p) { p.hidden = p.id !== id; });
    try { history.replaceState(null, "", "#" + id); } catch (e) {}
    filter();
  }
  // theme filter, arriving from the word cloud on the research page (?theme=key)
  var themes = {}, theme = null;
  try { themes = JSON.parse(document.getElementById("themes").textContent); } catch (e) {}
  try {
    var key = new URLSearchParams(location.search).get("theme");
    if (key && themes[key]) theme = { label: themes[key][0], re: new RegExp(themes[key][1], "i") };
  } catch (e) {}

  function filter() {
    var terms = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    var th = current === "papers" ? theme : null;
    var pane = document.getElementById(current), n = 0;
    pane.querySelectorAll(".yr-group").forEach(function (g) {
      var vis = 0;
      g.querySelectorAll("li").forEach(function (li) {
        var s = li.dataset.s;
        var ok = terms.every(function (t) { return s.indexOf(t) !== -1; }) && (!th || th.re.test(li.dataset.ti || ""));
        li.hidden = !ok; if (ok) vis++;
      });
      g.hidden = vis === 0; n += vis;
    });
    note.textContent = "";
    if (th) {
      note.append(n + (n === 1 ? " paper" : " papers") + " on " + th.label.toLowerCase() + ". ");
      var clear = document.createElement("button");
      clear.type = "button"; clear.className = "linkish"; clear.textContent = "Show all papers";
      clear.addEventListener("click", function () {
        theme = null;
        try { history.replaceState(null, "", location.pathname + location.hash); } catch (e) {}
        filter();
      });
      note.append(clear);
    } else if (terms.length) {
      note.textContent = n + (n === 1 ? " match" : " matches") + " in this list";
    }
  }
  tabs.forEach(function (t) { t.addEventListener("click", function () { show(t.dataset.t); }); });
  q.addEventListener("input", filter);
  var h = location.hash.slice(1);
  if (h && document.getElementById(h) && document.getElementById(h).classList.contains("pane")) show(h);
  else if (theme) show("papers");
})();
