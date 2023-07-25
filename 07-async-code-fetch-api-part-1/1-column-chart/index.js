import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ColumnChart {
  constructor({label = '', value = 0, link = '', data = [], formatHeading, url = '', range = {}} = {}) {
    this.chartHeight = 50;
    
    this._label = label;
    this._link = link;
    this._data = data;
    this._url = new URL(url, BACKEND_URL);

    this.formatHeading = formatHeading ?? ((value) => value);
    this._value = this.formatHeading(value);

    this._range = {};
    this._range.from = range?.from ?? new Date();
    this._range.to = range?.to ?? new Date();

    this.render();
  }

  async update(from, to) {
    
    this.element.classList.add("column-chart_loading");
    
    const data = await this.loadData(from, to);
    
    this._range.from = from;
    this._range.to = to;

    if (data && Object.values(data).length) {
      this.subElements.header.textContent = this.formatHeading(Object.values(data).reduce((a, b) => a + b, 0));
      this.subElements.body.innerHTML = this.createTemplate(data);
      this.element.classList.remove("column-chart_loading");
    }

    this._data = data;
    return this._data;
  }

  async loadData(from, to) {
    this._url.searchParams.set('from', from.toISOString());
    this._url.searchParams.set('to', to.toISOString());

    return await fetchJson(this._url);
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

  getTemplate() {
    return `<div class="column-chart column-chart_loading" style="--chart-height: ${ColumnChart.chartHeight}">
              <div class="column-chart__title">
                Total ${this._label}
                ${this.createLinkTemplate()}
              </div>
              <div class="column-chart__container">
                <div data-element="header" class="column-chart__header">${this._value}</div>
                <div data-element="body" class="column-chart__chart">
                ${this.createTemplate(this._data)}
                </div>
              </div>
            </div>`;    
  }

  render() {
    const parentDiv = document.createElement('div');

    parentDiv.innerHTML = this.getTemplate();

    this.element = parentDiv.firstElementChild;

    if (this._data.length) {
      this.element.classList.remove("column-chart_loading");
    }

    this.subElements = this.getSubElements();
    this.update(this._range.from, this._range.to);
  }

  createLinkTemplate() {
    return this._link 
      ? `<a class="column-chart__link" href="${this._link}">View all</a>`
      : "";
  }

  getSubElements() {
    const res = {};
    const elements = this.element.querySelectorAll("[data-element]");

    for (const sub of elements) {
      res[sub.dataset.element] = sub;
    }
    return res;
  }

  createTemplate(data) {
    const maxValue = Math.max(...Object.values(data));
    const scale = this.chartHeight / maxValue;
  
    return Object.values(data).map(value => {
      const percent = (value / maxValue * 100).toFixed(0);
      return `<div style="--value: ${Math.floor(value * scale)}" data-tooltip="${percent}%"></div>`;
    }).join("");
  }
}
