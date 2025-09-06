function Tabin(selector) {
  this.container = document.querySelector(selector);
  if (!this.container) {
    console.error(`Tabin: No container found for selector '${selector}'`);
    return;
  }

  this.tabs = Array.from(this.container.querySelectorAll("li a"));

  if (!this.tabs.length) {
    console.error(`Tabin: No container found for selector`);
    return;
  }

  let hasError = false;

  this.panels = this.tabs
    .map((tab) => {
      const panel = document.querySelector(tab.getAttribute("href"));
      if (!panel) {
        console.error(
          `Tabin: No panel found for selector '${tab.getAttribute("href")}'`
        );
      }
      return panel;
    })
    .filter(Boolean);

  if (this.tabs.length !== this.panels.length) return;

  this._init();
}

Tabin.prototype._init = function () {
  const tabActive = this.tabs[0];
  tabActive.closest("li").classList.add("tabin--active");

  this.panels.forEach((panel) => (panel.hidden = true));

  this.tabs.forEach((tab) => {
    tab.onclick = (event) => {
      this._handleTabClick(event, tab);
    };
  });

  const panelActive = this.panels[0];
  panelActive.hidden = false;
};

Tabin.prototype._handleTabClick = function (event, tab) {
  event.preventDefault();

  this.tabs.forEach((tab) => {
    tab.closest("li").classList.remove("tabin--active");
  });

  tab.closest("li").classList.add("tabin--active");

  this.panels.forEach((panel) => (panel.hidden = true));

  const panelActive = document.querySelector(tab.getAttribute("href"));

  panelActive.hidden = false;
};
