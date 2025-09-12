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

  this.opt = Object.assign(
    {
      remember: false,
    },
    options
  );

  this.paramKey = selector.replace(/[^a-zA-Z0-9]/g, "");
  this._originalHTML = this.container.innerHTML;

  this._init();
}

Tabin.prototype._init = function () {
  const param = new URLSearchParams(location.search);
  // Tự động giải mã không cần deCode
  const tabSelector = param.get(this.paramKey);
  const tab =
    (this.opt.remember &&
      tabSelector &&
      this.tabs.find(
        (tab) =>
          tab.getAttribute("href").replace(/[^a-zA-Z0-9]/g, "") === tabSelector
      )) ||
    this.tabs[0];

  this._activeTab(tab);

  this.tabs.forEach((tab) => {
    tab.onclick = (event) => {
      this._handleTabClick(event, tab);
    };
  });
};

Tabin.prototype._handleTabClick = function (event, tab) {
  event.preventDefault();

  this._activeTab(tab);
};

Tabin.prototype._activeTab = function (tab) {
  this.tabs.forEach((tab) => {
    tab.closest("li").classList.remove("tabin--active");
  });

  tab.closest("li").classList.add("tabin--active");

  this.panels.forEach((panel) => (panel.hidden = true));

  const panelActive = document.querySelector(tab.getAttribute("href"));

  panelActive.hidden = false;

  if (this.opt.remember) {
    const params = new URLSearchParams(location.search);
    const paramValue = tab.getAttribute("href").replace(/[^a-zA-Z0-9]/g, "");
    // Tự động áp dụng enCodeURIComponent
    params.set(this.paramKey, paramValue);
    history.replaceState(null, null, `?${params}`);
  }
};

Tabin.prototype.switch = function (input) {
  let tabActive = null;
  if (typeof input === "string") {
    tabActive = this.tabs.find((tab) => tab.getAttribute("href") === input);

    if (!tabActive) {
      console.error(`Tabin: No panel found with ID '${input}'`);
      return;
    }
  } else if (this.tabs.includes(input)) {
    tabActive = input;
  }

  if (!tabActive) {
    console.error(`Tabin: Invalid input '${input}'`);
    return;
  }

  this._activeTab(tabActive);
};

Tabin.prototype.destroy = function () {
  this.container.innerHTML = this._originalHTML;

  this.panels.forEach((panel) => (panel.hidden = false));
  this.container = null;
  this.tabs = null;
  this.panels = null;
};

// Dùng để mã hóa các ký tự hợp phát của URL
// encodeURIComponent("#tab") ==> '%23tab'
