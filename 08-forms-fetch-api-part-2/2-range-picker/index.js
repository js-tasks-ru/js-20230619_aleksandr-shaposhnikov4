export default class RangePicker {
  constructor(params = {}) {
    this.selected = {};
    this.selected.from = params?.from ?? new Date();
    this.selected.to = params?.to ?? new Date();

    this.showFrom = new Date(this.selected.from);
    this.selectingFrom = true;

    this.onSelectorClick = this.onSelectorClick.bind(this);
    this.onDocumentClick = this.onDocumentClick.bind(this);

    this.render();
  }

  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.getTemplate();
    this.element = this.element.firstElementChild;
    this.subElements = this.getSubElements();

    this.initEventListeners();
    
    document.body.append(this.element);
    
    return this.element;
  }

  getTemplate() {
    return `
      <div class="rangepicker">
        <div class="rangepicker__input" data-element="input">
          <span data-element="from">${this.dateToString(this.selected.from)}</span>
          <span data-element="to">${this.dateToString(this.selected.to)}</span>
        </div>
        <div class="rangepicker__selector" data-element="selector"></div>
      </div>`;
  }

  getSubElements() {
    const subElements = {};
    for (let element of this.element.querySelectorAll("[data-element]")) {
      subElements[element.dataset.element] = element;
    }
        
    return subElements;
  }

  initEventListeners() {
    this.element.onmousedown = () => false;
    this.subElements.input.onclick = ()=> this.toggle();
    this.subElements.selector.addEventListener("click", this.onSelectorClick);
    document.addEventListener("click", this.onDocumentClick, true);
  }

  dateToString(date) {
    return date.toLocaleString("ru", { dateStyle: "short" });
  }

  renderSelector() {
    const from = new Date(this.showFrom);
    const to = new Date(this.showFrom);
    to.setMonth(to.getMonth() + 1);
    
    this.subElements.selector.innerHTML = this.getSelectorElement(from, to);

    this.subElements.selector.querySelector(".rangepicker__selector-control-left").onclick = () => this.prev();
    this.subElements.selector.querySelector(".rangepicker__selector-control-right").onclick = () => this.next();
    this.renderHighlight();
  }

  getSelectorElement(from, to) {
    return `
      <div class="rangepicker__selector-arrow"></div>
      <div class="rangepicker__selector-control-left"></div>
      <div class="rangepicker__selector-control-right"></div>
      ${this.renderCalendar(from)}
      ${this.renderCalendar(to)}`;
  }

  renderCalendar(e) {
    let currentDate = new Date(e);
    currentDate.setDate(1);
    let monthName = currentDate.toLocaleString("ru", { month: "long" });
    let calendarHTML = `
      <div class="rangepicker__calendar">
        <div class="rangepicker__month-indicator">
          <time datetime="${monthName}">${monthName}</time>
        </div>
        <div class="rangepicker__day-of-week">
          ${this.daysOfWeek()}
        </div>
      <div class="rangepicker__date-grid">`;

    calendarHTML += `<button type="button" class="rangepicker__cell" data-value="${currentDate.toISOString()}" style="--start-from: ${this.getDay(currentDate) + 1}">${currentDate.getDate()}</button>`;
    currentDate.setDate(2);

    while (currentDate.getMonth() === e.getMonth()) {
      calendarHTML += `<button type="button" class="rangepicker__cell" data-value="${currentDate.toISOString()}">${currentDate.getDate()}</button>`;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    calendarHTML += "</div></div>";

    return calendarHTML;
  }

  daysOfWeek = () => ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => `<div>${day}</div>`).join('');

  renderHighlight() {
    const cells = this.element.querySelectorAll(".rangepicker__cell");
  
    cells.forEach((cell) => {
      cell.classList.remove("rangepicker__selected-from");
      cell.classList.remove("rangepicker__selected-between");
      cell.classList.remove("rangepicker__selected-to");
  
      if (this.selected.from && cell.dataset.value === this.selected.from.toISOString()) {
        cell.classList.add("rangepicker__selected-from");
      } else if (this.selected.to && cell.dataset.value === this.selected.to.toISOString()) {
        cell.classList.add("rangepicker__selected-to");
      } else if (this.selected.from && this.selected.to && new Date(cell.dataset.value) >= this.selected.from && new Date(cell.dataset.value) <= this.selected.to) {
        cell.classList.add("rangepicker__selected-between");
      }
    });
  
    const selectedFromCell = this.element.querySelector(`[data-value="${this.selected.from?.toISOString()}"]`);
    if (selectedFromCell) {
      selectedFromCell.closest(".rangepicker__cell").classList.add("rangepicker__selected-from");
    }

    const selectedToCell = this.element.querySelector(`[data-value="${this.selected.to?.toISOString()}"]`);
    if (selectedToCell) {
      selectedToCell.closest(".rangepicker__cell").classList.add("rangepicker__selected-to");
    }
  }

  prev() {
    this.showFrom.setMonth(this.showFrom.getMonth() - 1);
    this.renderSelector();
  }
    
  next() {
    this.showFrom.setMonth(this.showFrom.getMonth() + 1);
    this.renderSelector();
  }

  toggle() {
    this.element.classList.toggle("rangepicker_open");
    this.renderSelector();
  }

  close() {
    this.element.classList.remove("rangepicker_open");
  }

  getDay(date) {
    let day = date.getDay();
    return day === 0 ? 6 : day - 1;
  }

  onSelectorClick(e) {
    if (e.target.classList.contains("rangepicker__cell")) {
      this.onRangePickerCellClick(e);
    }
  }

  onRangePickerCellClick(e) {
    const { value } = e.target.dataset;
  
    if (!value) return;
  
    const date = new Date(value);
  
    this.selected = {
      from: this.selectingFrom ? date : (date > this.selected.from ? this.selected.from : date),
      to: this.selectingFrom ? null : (date > this.selected.from ? date : this.selected.from)
    };
  
    this.selectingFrom = !this.selectingFrom;
    this.renderHighlight();
  
    if (this.selected.from && this.selected.to) {
      this.subElements.from.innerHTML = this.dateToString(this.selected.from);
      this.subElements.to.innerHTML = this.dateToString(this.selected.to);
      this.element.dispatchEvent(new CustomEvent('date-select', {
        bubbles: true,
        detail: this.selected
      }));
      this.close();
    }
  }

  onDocumentClick(e) {
    if (this.isOpen() && !this.element.contains(e.target)) {
      this.close();
    }
  }

  isOpen = () => this.element.classList.contains("rangepicker_open");

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = null;
    document.removeEventListener("click", this.onDocumentClick, true);
  }
}
