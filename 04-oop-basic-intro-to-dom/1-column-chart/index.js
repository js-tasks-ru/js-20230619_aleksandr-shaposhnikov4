export default class ColumnChart {

  constructor( { data = [], label = '', link = '', value = 0, formatHeading } = {}) {
    this._data = data;
    this._label = label;
    this._link = link;

    this._value = formatHeading ? formatHeading(value) : value;

    this.init();
  }

  init() {
    this.chartHeight = 50;

    const element = this.createElement();
    const subElements = this.createSubElements();
    this.element.body = this.getBody(this._data);
  }

  createElement(){
    const element = document.createElement('div');

    //this.getTemplate();
    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;

    if (this._data.length) {
      this.element.classList.remove('column-chart_loading');
    }
  }

  getTemplate() {
    return `
      <div class="column-chart_loading" style="--chart-height: ${this.chartHeight}">
        <div class="column-chart__title">${this._label}</div>
        <div class="column-chart__link">${this.getLink()}</div>
        <div class="column-chart__container">
          <div data-element="header" class="column-chart__header">${this._value}</div>
          <div data-element="body" class="column-chart__chart">
            ${this.getBody(this._data)}
          </div>
        </div>
      </div>
    `;
  }

  createSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    const subElements = {};

    elements.forEach(subElement => {
      subElements[subElement.dataset.element] = subElement;
    });
    
    return subElements;
  }

  getLink() {
    return this._link ? '<a class="column-chart__link" href="${this._link}">View all</a>' : '';
  }

  update({header, body}) {
    this.subElements.header.textContent = header;
    this.subElements.body.innerHTML = this.getBody(body);
  }

  getBody(data) {
    const max = Math.max(...data);

    return data.reduce((accum, item) => {
        return accum + `<div style="--value: ${Math.floor(item * (this.chartHeight / max))}" data-tooltip="${(item / max * 100).toFixed(0)}%"></div>`;
    }, '');
  }

  remove () {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.subElements = {};
  }
}
