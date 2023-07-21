import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  constructor(headerConfig, { data = [], sorted = {}, isSortLocally, url, start, step, end } = {},) {
    this.headerConfig = headerConfig;
    this._data = data;
    this._isSortLocally = isSortLocally ?? false;
    this._start = start ?? 0;
    this._step = step ?? 20;
    this._end = end ?? this._start + this._step;

    this._sorted = {};
    this._sorted.id = sorted?.id ?? headerConfig.find(item => item.sortable).id;
    this._sorted.order = sorted?.order ?? 'asc';

    this._url = url
      ? new URL(url, BACKEND_URL)
      : new URL(BACKEND_URL);
    
    this.render();
  }
  
    infScroll = async() => {
      const {bottom} = this.element.getBoundingClientRect();
      const {id, order} = this._sorted;

      if (bottom < document.documentElement.clientHeight && !this.loading) {
        this._start = this._end;
        this._end = this._start + this._step;

        this.loading = true;

        const data = await this.loadData(id, order, this._start, this._end);

        this.update(data); 

        this.loading = false;
      }
    }
     
    async render() {
      const {id, order} = this._sorted;
      const wrapper = document.createElement('div');
      wrapper.innerHTML = this.getTable();
  
      this.element = wrapper.firstElementChild;
      this.subElements = this.getSubElements(this.element);
      const data = await this.loadData(id, order, this._start, this._end);

      this.renderRows(data);
      this.setEventListener();
    }
  
    onSortClick = event => { 
      const columnElement = event.target.closest('[data-sortable="true"]');
      
      const orderChange = order => {
        const orders = {
          asc: "desc",
          desc: "asc",
        };
        return orders[order];
      };
      
      if (columnElement) {
        const {id, order} = columnElement.dataset;
        const newOrder = orderChange(order);
        const sortedData = this.sort(id, newOrder);

        const arrowElement = columnElement.querySelector('.sortable-table__sort-arrow');

        columnElement.dataset.order = newOrder;

        if (!arrowElement) {
          columnElement.append(this.subElements.arrowElement);
        }
        this.subElements.body.innerHTML = this.getTableRowElements(sortedData);
      }
    }

    sort(id, order) { 
      if (this._isSortLocally) {
        this.sortOnClient(id, order);
      } else {
        this.sortOnServer(id, order);
      }
    }
  
    sortOnClient(id, order) {
      const sortedData = this.sortData(id, order);
      const allColumnElements = this.element.querySelectorAll('.sortable-table__cell[data-id]');
      const currentColumnElement = this.element.querySelector(`.sortable-table__cell[data-id="${id}"]`);
      
      allColumnElements.forEach(columnElement => {
        columnElement.dataset.order = '';
      });
  
      currentColumnElement.dataset.order = order;
      this.subElements.body.innerHTML = this.getTableRowElements(sortedData);
    }
  
    async sortOnServer(id, order) {
      const start = 0; 
      const end = start + this._step;

      const data = await this.loadData(id, order, start, end);

      this.renderRows(data);
    }

    update(data) {
      const rowElements = document.createElement('div');

      this._data = [...this._data, ...data];
      rowElements.innerHTML = this.getTableRowElementElements(data);

      this.subElements.body.append(...rowElements.childNodes);
    }

    renderRows(data) {
      if (data.length) {
        this.element.classList.remove('sortable-table_empty');
        this._data = data;
        this.subElements.body.innerHTML = this.getTableRowElements(data);
      }
      else {
        this.element.classList.add('sortable-table_empty');
      }
    }

    async loadData (...props) {
      const data = await this.load(...props);

      return data;
    }

    async load (field, order, start = this._start, end = this._end) {
      this._url.searchParams.set('_sort', field);
      this._url.searchParams.set('_order', order);
      this._url.searchParams.set('_start', start);
      this._url.searchParams.set('_end', end);

      return await fetchJson(this._url);
    }
  
    setEventListener() {
      this.subElements.header.addEventListener('pointerdown', this.onSortClick);

      if (!this._isSortLocally) {
        document.addEventListener('scroll', this.infScroll);
      }
    }
  
    getSubElements(element) {
      const result = {};
      const elements = element.querySelectorAll('[data-element]');
  
      for (const subElem of elements) {
        result[subElem.dataset.element] = subElem;
      }
  
      return result;
    }
  
    getHeaderElement() {
      return `<div data-element="header" class="sortable-table__header sortable-table__row">
      ${this.headerConfig.map(item => this.getHeaderRowElement(item)).join('')}</div>`;
    }
  
    getHeaderRowElement({id, title, sortable}) {
      return `<div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}" data-order="asc">
        <span>${title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>`;
    }
  
    getTable() {
      return `
      <div class="sortable-table">
        ${this.getHeaderElement()}
        ${this.getBodyElement()}
      </div>`;
    }

    getBodyElement() {
      return `<div data-element="body" class="sortable-table__body">
      ${this.getTableRowElements(this._data)}</div>`;
    }
  
    getTableRowElements(data = []) {
      return data.map(item => {
        return `
          <a href="/products/${item.id}" class="sortable-table__row">
          ${this.getTableRowElement(item)}</a>`;
      }).join('');
    }
  
    getTableRowElement(item) {
      const cells = this.headerConfig.map(({id, template}) => {
        return {
          id,
          template
        };
      });
  
      return cells.map(({id, template}) => {
        return template 
          ? template(item[id]) 
          : `<div class='sortable-table__cell'>${item[id]}</div>`;
      }).join('');
    }
  
    sortData(id, order) { 
      const arr = [...this._data];
      const columnElement = this.headerConfig.find(item => item.id === id);
      const { sortType } = columnElement;
      const directions = {
        asc: 1,
        desc: -1
      };
      const direction = directions[order];
      
      return arr.sort((a, b) => {
        switch (sortType) {
        case 'number':
          return direction * (a[id] - b[id]);
        case 'string' :
          return direction * a[id].localeCompare(b[id], ['ru', 'en']);
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