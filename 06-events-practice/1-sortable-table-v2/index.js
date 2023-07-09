export default class SortableTable {
  constructor(headerConfig, {data = [], sorted = {}} = {}) {
    this._headerConfig = headerConfig;
    this._data = data;
    this._sorted = sorted;
    this._isSortLocally = !sorted;

    this.render();
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTable();

    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    this.setEventListener();
  }

  onSortClick = event => {
    const column = event.target.closest('[data-sortable="true"]');

    const orderChange = order => {
      const orders = {
        asc: "desc",
        desc: "asc",
      };

      return orders[order];
    };

    if (column) {
      const {id, order} = column.dataset;
      const newOrder = orderChange(order);
      const sortedData = this.sortData(id, newOrder);

      const arrow = column.querySelector('.sortable-table__sort-arrow');

      column.dataset.order = newOrder;

      if (!arrow) {
        column.append(this.subElements.arrow);
      }

      this.subElements.body.innerHTML = this.getTableRows(sortedData);
    }
  }

  sort(field, order) {
    if (this._isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer(field, order);
    }
  }

  sortOnClient(field, order) {
    const sortedData = this.sortData(field, order);
    const allColumns = this.element.querySelectorAll('.sortable-table__cell[data-id]');
    const currentColumn = this.element.querySelector(`.sortable-table__cell[data-id="${field}"]`);

    allColumns.forEach(column => {
      column.dataset.order = '';
    });

    currentColumn.dataset.order = order;
    this.subElements.body.innerHTML = this.getTableRows(sortedData);
  }

  sortOnServer(field, order) {
    throw new Error("Loading data from the server is not implemented yet");
  }

  setEventListener() {
    this.subElements.header.addEventListener('pointerdown', this.onSortClick);
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
    ${this._headerConfig.map(item => this.getHeaderRow(item)).join('')}</div>`;
  }

  getHeaderRow({id, title, sortable}) {
    return `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="asc">
      <span>${title}</span>
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    </div>`;
  }

  getTable() {
    return `<div class="sortable-table">
      ${this.getTableHeader()}
      ${this.getTableBody()}
    </div>`;
  }

  getTableBody() {
    return `<div data-element="body" class="sortable-table__body">
    ${this.getTableRows(this._data)}</div>`;
  }

  getTableRows(data = []) {
    return data.map(item => {
      return `
    <a href="/products/${item.id}" class="sortable-table__row">
    ${this.getTableRow(item)}</a>`;
    }).join('');
  }

  getTableRow(item) {
    const cells = this._headerConfig.map(({id, template}) => {
      return {
        id,
        template
      };
    });

    return cells.map(({id, template}) => {
      return template ? template(item[id]) : `<div class='sortable-table__cell'>${item[id]}</div>`;
    }).join('');
  }

  sortData(field, order) {
    const arr = [...this._data];
    const column = this._headerConfig.find(item => item.id === field);
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
      case 'custom' :
        return direction * customSorting(a, b);
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