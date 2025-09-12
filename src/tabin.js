function Tabin(selector, options = {}) {
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

  this.panels = this._getPanels();

  if (this.tabs.length !== this.panels.length) return;

  this.opt = Object.assign(
    {
      activeClassName: "tabin--active",
      remember: false,
      onChange: null,
    },
    options
  );
  this._cleanRegex = /[^a-zA-Z0-9]/g;
  this.paramKey = selector.replace(this._cleanRegex, "");
  this._originalHTML = this.container.innerHTML;

  this._init();
}

Tabin.prototype._getPanels = function () {
  return (
    this.tabs
      .map((tab) => {
        const panel = document.querySelector(tab.getAttribute("href"));
        if (!panel) {
          console.error(
            `Tabin: No panel found for selector '${tab.getAttribute("href")}'`
          );
        }
        return panel;
      })
      // Loại bỏ các giá trị falsy
      .filter(Boolean)
  );
};

Tabin.prototype._init = function () {
  const param = new URLSearchParams(location.search);
  // Tự động giải mã không cần deCode
  const tabSelector = param.get(this.paramKey);
  const tab =
    (this.opt.remember &&
      tabSelector &&
      this.tabs.find(
        (tab) =>
          tab.getAttribute("href").replace(this._cleanRegex, "") === tabSelector
      )) ||
    this.tabs[0];

  this.currentTab = tab;
  this._activeTab(tab, false, false);

  this.tabs.forEach((tab) => {
    tab.onclick = (event) => {
      event.preventDefault();
      this._tryActivateTab(tab);
    };
  });
};

Tabin.prototype._tryActivateTab = function (tab) {
  if (this.currentTab !== tab) {
    this.currentTab = tab;
    this._activeTab(tab);
  }
};

Tabin.prototype._activeTab = function (
  tab,
  triggerOnChange = true,
  updateURL = this.opt.remember
) {
  this.tabs.forEach((tab) => {
    tab.closest("li").classList.remove(this.opt.activeClassName);
  });

  tab.closest("li").classList.add(this.opt.activeClassName);

  this.panels.forEach((panel) => (panel.hidden = true));

  const panelActive = document.querySelector(tab.getAttribute("href"));

  panelActive.hidden = false;

  if (updateURL) {
    const params = new URLSearchParams(location.search);
    // Tự động áp dụng enCodeURIComponent
    params.set(
      this.paramKey,
      tab.getAttribute("href").replace(this._cleanRegex, "")
    );
    history.replaceState(null, null, `?${params}`);
  }

  if (triggerOnChange && typeof this.opt.onChange === "function") {
    this.opt.onChange({
      tab,
      panel: panelActive,
    });
  }
};

Tabin.prototype.switch = function (input) {
  const tab =
    typeof input === "string"
      ? this.tabs.find((tab) => tab.getAttribute("href") === input)
      : this.tabs.includes(input)
      ? input
      : null;

  if (!tab) {
    console.error(`Tabin: Invalid input '${input}'`);
    return;
  }

  this._tryActivateTab(tab);
};

Tabin.prototype.destroy = function () {
  this.container.innerHTML = this._originalHTML;
  this.panels.forEach((panel) => (panel.hidden = false));
  this.container = null;
  this.tabs = null;
  this.panels = null;
  this.currentTab = null;
};

// Dùng để mã hóa các ký tự hợp phát của URL
// encodeURIComponent("#tab") ==> '%23tab'
