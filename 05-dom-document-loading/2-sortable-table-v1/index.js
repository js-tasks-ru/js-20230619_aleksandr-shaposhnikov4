export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    
    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTable();

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
  }

  sort(field, order) {
    const sortedData = this.sortData(field, order);
    const columnElements = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentElement = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);

    columnElements.forEach(column => {
      column.dataset.order = '';
    });

    currentElement.dataset.order = order;

    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  getSubElements(element) {
    const result = {};
    const elements = element.querySelectorAll('[data-element]');

    for (const subElem of elements) {
      const name = subElem.dataset.element;
      result[name] = subElem;
    }

    return result;
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headerConfig.map(item => this.getHeaderRow(item)).join('')}
    </div>`;
  }

  getHeaderRow({id, title, sortable = false}) {
    return `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
      <span>${title}</span>
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    </div>`;
  }

  getTableBody() {
    return `<div data-element="body" class="sortable-table__body">${this.getTableRows(this.data)}
    </div>`;
  }

  getTableRows(data = []) {
    return data.map(item => {
      return `
    <a href="/products/${item.id}" class="sortable-table__row">
    ${this.getTableRow(item)}
    </a>`;
    }).join('');
  }

  getTableRow(item) {
    const cells = this.headerConfig.map(({id, template}) => {
      return {
        id,
        template
      };
    });

    return cells.map(({id, template}) => {
      return template ? template(item[id]) : `<div class='sortable-table__cell'>${item[id]}</div>`;
    }).join('');
  }

  getTable() {
    return `
    <div class="sortable-table">
    ${this.getTableHeader()}
    ${this.getTableBody()}
    </div>`;
  }

  sortData(field, order) {
    const arr = [...this.data];
    const column = this.headerConfig.find(item => item.id === field);
    const { sortType } = column;
    const directions = {
      asc: 1,
      desc: -1
    };
    const direction = directions[order];

    return arr.sort((a, b) => {
      switch (sortType) {
      case 'number':
        return direction * (a[field] - b[field]);
      case 'string' :
        return direction * a[field].localeCompare(b[field], ['ru', 'en']);
      default :
        throw new Error(`Unknown type ${sortType}`);   
      }
    });
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
  }
}