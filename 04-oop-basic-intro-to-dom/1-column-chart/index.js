export default class ColumnChart {
  
  subElements = {};
  
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
    const bodyElement = this.element.querySelector("[data-element='body']");
    bodyElement.innerHTML = this.createColumnsTemplate();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  createMainTemplate() {
    return `<div class="column-chart column-chart_loading" style="--chart-height: ${ColumnChart.chartHeight}">
              <div class="column-chart__title">
                Total ${this._label}
                ${this.createLinkTemplate()}
              </div>
              <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">${this._value}</div>
                <div data-element="body" class="column-chart__chart">
                ${this.createColumnsTemplate()}
                </div>
              </div>
            </div>`;    
  }


  render() {
    const parentDiv = document.createElement('div');

    parentDiv.innerHTML = this.createMainTemplate();

    this.element = parentDiv.firstElementChild;

    if (this._data.length) {

      this.element.classList.remove("column-chart_loading");
    }

    this.subElements = this.getSubElements();

  }

  createLinkTemplate() {
    return this._link 
      ? `<a class="column-chart__link" href="${this._link}">View all</a>`
      : "";
  }

  getSubElements() {
    const res = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const child of elements) {
      const name = child.dataset.element;
      res[name] = child;
    }
    return res;
  }

  createColumnsTemplate = () => this._data.map(item => this.createColumnTemplate(item)).join("");

  createColumnTemplate(item) {
    const maxValue = Math.max(...this._data);
    const scale = this.chartHeight / maxValue;
    const percent = (item / maxValue * 100).toFixed(0);

    return `<div style="--value: ${Math.floor(item * scale)}" data-tooltip="${percent}%"></div>`;
  }
}