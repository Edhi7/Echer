"use strict";
window.onload = init;

function init() {
  download_defered_stylesheets();
  const body = document.getElementsByTagName("body")[0];
  body.classList.add("loaded");
  set_tab_onclick();
}

function download_defered_stylesheets() {
  Array.from(document.getElementsByTagName("link")).forEach(link => {
    link.removeAttribute("disabled");
  });
}

function set_tab_onclick() {
  const tabs = document.getElementsByClassName("tab");
  for (let tab of tabs) {
    tab.onclick = function () {
      for (let tab of tabs) {
        tab.classList.remove("active");
      }
      this.classList.add("active");
      set_active_tab_no(Array.from(tabs).indexOf(tab));
    };
  }
}

function set_active_tab_no(n) {
  const tabs = document.getElementsByClassName("tab-content");
  for (let tab of tabs) {
    // If not activated tab
    if (tabs[n] !== tab) {
      tab.classList.remove("active");
      window.setTimeout(function () {
        tab.style.display = "none";
      }, 240);
    }
  }

  tabs[n].style.display = "block";
  window.setTimeout(function () {
    tabs[n].classList.add("active");
  }, 120);
}