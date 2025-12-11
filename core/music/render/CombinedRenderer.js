// core/music/render/CombinedRenderer.js
import NotationRenderer from "./NotationRenderer";
import TabRenderer from "./TabRenderer";

export default class CombinedRenderer {
  constructor({ notationContainer, tabContainer, score }) {
    this.notationContainer = notationContainer;
    this.tabContainer = tabContainer;
    this.score = score;
  }

  render() {
    this.notationContainer.innerHTML = "";
    this.tabContainer.innerHTML = "";

    new NotationRenderer({
      container: this.notationContainer,
      score: this.score
    }).render();

    new TabRenderer({
      container: this.tabContainer,
      score: this.score
    }).render();
  }
}
