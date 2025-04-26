function transitionEndEventName() {
  const el = document.createElement("div");
  const transitions = {
    WebkitTransition: "webkitTransitionEnd",
    MozTransition: "transitionend",
    OTransition: "oTransitionEnd otransitionend",
    transition: "transitionend",
  };

  for (const name in transitions) {
    if (el.style[name] !== undefined) {
      return transitions[name];
    }
  }

  return null; // No transition support
}

// Emulates transition end for cases where the event doesn't fire
HTMLElement.prototype.emulateTransitionEnd = function (duration) {
  let called = false;
  const el = this;
  
  const callback = function () {
    if (!called) {
      el.dispatchEvent(new Event(transitionEndEventName()));
    }
  };

  this.addEventListener(transitionEndEventName(), () => (called = true), { once: true });
  setTimeout(callback, duration);
};

class Collapse {
  static TRANSITION_DURATION = 350;

  constructor(element, options = {}) {
    this.element = typeof element === "string" ? document.querySelector(element) : element;
    if (!this.element) {
      throw new Error("Collapse target not found.");
    }

    this.options = { toggle: true, ...options };
    this.triggerElements = [...document.querySelectorAll("[data-toggle='collapse']")].filter(trigger => {
      const target = trigger.getAttribute("data-target") || trigger.getAttribute("href");
      return target && document.querySelector(target) === this.element;
    });

    this.transitioning = false;

    if (this.options.toggle) this.toggle();
  }

  toggle() {
    this.element.classList.contains("in") ? this.hide() : this.show();
  }

  show() {
    if (this.transitioning || this.element.classList.contains("in")) return;

    const event = new Event("show.bs.collapse");
    this.element.dispatchEvent(event);
    if (event.defaultPrevented) return;

    this.element.classList.remove("collapse");
    this.element.classList.add("collapsing");
    this.element.style.display = "block";
    
    // Get full height dynamically
    const fullHeight = this.element.scrollHeight + "px";
    this.element.style.height = "0px";
    this.element.setAttribute("aria-expanded", "true");

    this.triggerElements.forEach(trigger => {
      trigger.classList.remove("collapsed");
      trigger.setAttribute("aria-expanded", "true");
    });

    this.transitioning = true;

    requestAnimationFrame(() => {
      this.element.style.height = fullHeight;
    });

    setTimeout(() => {
      this.element.classList.remove("collapsing");
      this.element.classList.add("collapse", "in");
      this.element.style.height = "";
      this.transitioning = false;
      this.element.dispatchEvent(new Event("shown.bs.collapse"));
    }, Collapse.TRANSITION_DURATION);
  }

  hide() {
    if (this.transitioning || !this.element.classList.contains("in")) return;

    const event = new Event("hide.bs.collapse");
    this.element.dispatchEvent(event);
    if (event.defaultPrevented) return;

    // Set explicit height to allow transition
    this.element.style.height = `${this.element.scrollHeight}px`;
    this.element.offsetHeight; // Force reflow

    this.element.classList.add("collapsing");
    this.element.classList.remove("collapse", "in");
    this.element.setAttribute("aria-expanded", "false");

    this.triggerElements.forEach(trigger => {
      trigger.classList.add("collapsed");
      trigger.setAttribute("aria-expanded", "false");
    });

    this.transitioning = true;

    requestAnimationFrame(() => {
      this.element.style.height = "0px";
    });

    setTimeout(() => {
      this.transitioning = false;
      this.element.style.display = "none";
      this.element.classList.remove("collapsing");
      this.element.classList.add("collapse");
      this.element.dispatchEvent(new Event("hidden.bs.collapse"));
    }, Collapse.TRANSITION_DURATION);
  }

  static getInstance(element) {
    return element._collapseInstance || null;
  }

  static init(element, options = {}) {
    element = typeof element === "string" ? document.querySelector(element) : element;
    if (!element) {
      console.error("Collapse target not found.");
      return;
    }
    const instance = new Collapse(element, options);
    element._collapseInstance = instance;
    return instance;
  }
}

// Collapse Data API
document.addEventListener("click", (e) => {
  const trigger = e.target.closest("[data-toggle='collapse']");
  if (!trigger) return;

  e.preventDefault();
  const targetSelector = trigger.getAttribute("data-target") || trigger.getAttribute("href");
  if (!targetSelector) return;

  const target = document.querySelector(targetSelector);
  if (!target) return;

  let instance = Collapse.getInstance(target);
  if (!instance) {
    instance = Collapse.init(target, { toggle: true });
  }

  instance.toggle();
});