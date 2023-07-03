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

    const parentDiv = document.createElement('div');
  
    parentDiv.innerHTML = this.createDomElem();
  
    this.element = parentDiv.firstElementChild;
  
    if(this._data.length) {
  
      this.element.classList.remove("column-chart_loading");
    }
  
    this._child = this.getChild()
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
            </div>`    
  }

  createSubElements() {
    const elements = this.element.querySelectorAll('[data-element]');
    const subElements = {};

    elements.forEach(subElement => {
      subElements[subElement.dataset.element] = subElement;
    });
    
    return subElements;
  }

  update(newData = []) {
    if (!newData) {
      this.element.classList.add("column-chart_loading");
    }
    this._data = newData;
    this._child.body.innerHTML = this.getDomBody();
  }

  getChild(){
    const res = {};
    const elements = this.element.querySelectorAll("[data-element]");
  
    for (const child of elements) {
      const name = child.dataset.element;
      res[name] = child;
    }
    return res
  }

  getDomBody() {
    const maxValue = Math.max(...this._data);
    const scale = this.chartHeight / maxValue;
  
    return this._data.map(item => {
      const percent = (item / maxValue * 100).toFixed(0);
      return `<div style="--value: ${Math.floor(item*scale)}" data-tooltip="${percent}%">
      </div>`;
    }).join("");
  }

  getLink() {
    return this.link 
      ? `<a class="column-chart__link" href="${this.link}">View all</a>`
      : "";
  }

  destroy(){
    this.remove();
    this.element = {};
    this.child = {};
  }

  remove() {
    if(this.element)
      this.element.remove();
  }
}
