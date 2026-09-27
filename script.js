var design = anime({
  targets: 'svg #XMLID5',
  keyframes: [
    {translateX: -500},
    {rotateY: 180},
    {translateX: 920},
    {rotateY: 0},
    {translateX: -500},
    {rotateY: 180},
    {translateX: -500},
  ],
  easing: 'easeInOutSine',
  duration: 60000,
});

anime({
  targets: '#dust-paarticle path',
  translateY: [10, -150],
  direction: 'alternate',
  loop: true,
  delay: function(el, i, l) {
    return i * 100;
  },
  endDelay: function(el, i, l) {
    return (l - i) * 100;
  }
});

// -------- AUTH PANEL TOGGLER --------
document.addEventListener("DOMContentLoaded", function () {
  const togglers = document.querySelectorAll(".lnk-toggler");
  const panels = document.querySelectorAll(".authfy-panel");

  togglers.forEach(toggler => {
    toggler.addEventListener("click", function (e) {
      e.preventDefault();

      const targetPanel = this.getAttribute("data-panel");

      // remove active from all panels
      panels.forEach(panel => {
        panel.classList.remove("active");
      });

      // add active to selected panel
      const panelToShow = document.querySelector(targetPanel);
      if (panelToShow) {
        panelToShow.classList.add("active");
      }
    });
  });
});
