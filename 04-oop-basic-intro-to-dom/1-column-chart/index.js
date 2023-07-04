export default class ColumnChart {
  
  child = {};
  
  constructor({label = '', value = 0, link = '', data = [], formatHeading } = {}) {
    this.chartHeight = 50;

    this._label = label;
    this._link = link;
    this._data = data;

    this._value = formatHeading 
      ? formatHeading(value) 
      : value;

    this.render();
  }

  update(newData = []) {
    if (!newData) {
      this.element.classList.add("column-chart_loading");
    }
    this._data = newData;
    this.child.body.innerHTML = this.getDomBody();
  }

  destroy() {
    this.remove();
    this.element = {};
    this.child = {};
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }

  }

  createDomElem() {
    return `<div class="column-chart column-chart_loading" style="--chart-height: ${ColumnChart.chartHeight}">
              <div class="column-chart__title">
                Total ${this._label}
                ${this.getLink()}
              </div>
              <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">${this._value}</div>
                <div data-element="body" class="column-chart__chart">
                ${this.getDomBody()}
                </div>
              </div>
            </div>`;    
  }


  render() {
    const parentDiv = document.createElement('div');

    parentDiv.innerHTML = this.createDomElem();

    this.element = parentDiv.firstElementChild;

    if (this._data.length) {

      this.element.classList.remove("column-chart_loading");
    }

    this.child = this.getChild();

  }

  getLink() {
    return this._link 
      ? `<a class="column-chart__link" href="${this._link}">View all</a>`
      : "";
  }

  getChild() {
    const res = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const child of elements) {
      const name = child.dataset.element;
      res[name] = child;
    }
    return res;
  }
  getDomBody() {
    const maxValue = Math.max(...this._data);
    const scale = this.chartHeight / maxValue;
  
    return this._data.map(item => {
      const percent = (item / maxValue * 100).toFixed(0);
      return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%">
      </div>`;
    }).join("");
  }
}