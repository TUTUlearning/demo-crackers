(function () {
  function initLegalNotice() {
    const backdrop = document.getElementById("legalBackdrop");
    const button = document.getElementById("closeLegal");
    if (!backdrop || !button) return;

    function closeNotice(event) {
      if (event) { event.preventDefault(); event.stopPropagation(); }
      backdrop.classList.add("hidden");
      backdrop.setAttribute("aria-hidden", "true");
      try { sessionStorage.setItem("ci_legal_seen", "1"); } catch (_) {}
    }

    // A native button click handles mouse, touch, Enter, and Space without double-firing.
    button.addEventListener("click", closeNotice);
    backdrop.addEventListener("click", function (event) {
      if (event.target === backdrop) closeNotice(event);
    });

    let alreadySeen = false;
    try { alreadySeen = sessionStorage.getItem("ci_legal_seen") === "1"; } catch (_) {}
    if (alreadySeen) {
      backdrop.classList.add("hidden");
      backdrop.setAttribute("aria-hidden", "true");
    } else {
      backdrop.classList.remove("hidden");
      backdrop.setAttribute("aria-hidden", "false");
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initLegalNotice);
  else initLegalNotice();
})();
