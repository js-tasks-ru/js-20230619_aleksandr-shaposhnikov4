import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';
const DASHBOARD_ORDERS_URL = '/api/dashboard/orders';
const DASHBOARD_SALES_URL = '/api/dashboard/sales';
const DASHBOARD_CUSTOMERS_URL = '/api/dashboard/customers';
const BESTSELLERS_URL = `api/dashboard/bestsellers?from={0}&to={1}`;
const SALES_URL = '/sales';

export default class Page {
  constructor() {
    this.onRangePickerUpdate = this.onRangePickerUpdate.bind(this);
  }

  async render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.getTemplate();

    this.dateRange = this.dateRange ?? this.getDateRange();

    this.subElements = this.getSubElements();

    this.rangePicker = new RangePicker(this.dateRange);
    this.rangePicker.element.addEventListener("date-select", () => this.onRangePickerUpdate());
    this.subElements.rangePicker.append(this.rangePicker.element);

    this.ordersChart = this.createChart("orders", value => value, DASHBOARD_ORDERS_URL, new URL(SALES_URL, BACKEND_URL));
    this.salesChart = this.createChart("sales", value => "$" + value, DASHBOARD_SALES_URL);
    this.customersChart = this.createChart("customers", value => value, DASHBOARD_CUSTOMERS_URL);
    
    this.subElements.ordersChart.append(this.ordersChart.element);
    this.subElements.salesChart.append(this.salesChart.element);
    this.subElements.customersChart.append(this.customersChart.element);

    this.bestsellersTable = this.createTable();
    this.subElements.sortableTable.append(this.bestsellersTable.element);
  
    document.body.append(this.element);
    return this.element;
  }

  getSubElements() {
    const subElements = {};
    this.element.querySelectorAll('[data-element]').forEach(subElement => {
      subElements[subElement.dataset.element] = subElement;
    });

    return subElements;
  }

  getTemplate() {
    return `
    <div class="dashboard">
      <div class="content__top-panel">
        <h2 class="page-title">Dashboard</h2>
        <div data-element="rangePicker"></div>
      </div>
      <div data-element="chartsRoot" class="dashboard__charts">
        <div data-element="ordersChart" class="dashboard__chart_orders"></div>
        <div data-element="salesChart" class="dashboard__chart_sales"></div>
        <div data-element="customersChart" class="dashboard__chart_customers"></div>
      </div>
      <h3 class="block-title">Best sellers</h3>
      <div data-element="sortableTable"></div>
    </div>`;
  }

  getDateRange() {
    return {
      from: new Date(Date.now() - 2592e6),
      to: new Date()
    };
  }

  createChart(label, formatHeading, url, link) {
    const chart = new ColumnChart({
      label: label,
      link: link,
      formatHeading: formatHeading,
      url: url,
      range: this.dateRange
    });
    return chart;
  }
  
  createTable() {
    const bestsellersTable = new SortableTable(
      header, {
        url: this.bestsellersUrl,
        fieldsEnabled: ["images", "title", "category", "quantity", "price", "sales"],
        order: {
          field: "title",
          direction: 1
        }
      });
    return bestsellersTable;
  }

  formatString(template, ...values) {
    return template.replace(/{(\d+)}/g, (match, index) => {
      return values[index] !== undefined ? values[index] : match;
    });
  }

  get bestsellersUrl() {
    const formattedUrl = this.formatString(BESTSELLERS_URL, this.dateRange.from.toISOString(), this.dateRange.to.toISOString());
    return new URL(formattedUrl, BACKEND_URL);
  }

  async onRangePickerUpdate() {
    this.dateRange = this.rangePicker.selected;

    this.ordersChart.update(this.dateRange.from, this.dateRange.to);
    this.salesChart.update(this.dateRange.from, this.dateRange.to);
    this.customersChart.update(this.dateRange.from, this.dateRange.to);
    
    this.bestsellersTable.url.searchParams.set('from', this.dateRange.from.toISOString());
    this.bestsellersTable.url.searchParams.set('to', this.dateRange.to.toISOString());
    await this.bestsellersTable.sortOnServer();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
