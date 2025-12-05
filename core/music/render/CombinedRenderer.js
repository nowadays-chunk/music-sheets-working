import NotationRenderer from "./NotationRenderer.js";
import TabRenderer from "./TabRenderer.js";

export default class CombinedRenderer {
  constructor({ container, score, layout = {} }) {
    this.container = container;
    this.score = score;
    this.layout = layout;
  }

  render() {
    if (!this.container || !this.score) return;

    this.container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.gap = "30px";

    const notationDiv = document.createElement("div");
    const tabDiv = document.createElement("div");

    wrapper.appendChild(notationDiv);
    wrapper.appendChild(tabDiv);
    this.container.appendChild(wrapper);

    new NotationRenderer({
      container: notationDiv,
      score: this.score,
      layout: this.layout
    }).render();

    new TabRenderer({
      container: tabDiv,
      score: this.score,
      layout: this.layout
    }).render();
  }
}
