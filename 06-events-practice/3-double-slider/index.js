export default class DoubleSlider {
  constructor(request = { min: 0, max: 100, formatValue: (value => value), selected: {} }) {
    this.min = request.min;
    this.max = request.max;
    this._formatValue = request.formatValue;
    this._selected = {};
    this._selected.from = request?.selected?.from ?? this.min;
    this._selected.to = request?.selected?.to ?? this.max;
    this.onThumbPointerMove = this.onThumbPointerMove.bind(this);
    this.onThumbPointerUp = this.onThumbPointerUp.bind(this);
    this.render();
  }
  
  render() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.getTemplate();        
    this.fillElements();
    this.addEventListener();
    this.update();
    document.body.append(this.element);
  }
  
  fillElements() {
    this.elements = {};
    for (const element of this.element.querySelectorAll("[data-element]")) {
      this.elements[element.dataset.element] = element;
    }
  }
  
  getTemplate() {
    return `
          <div class="range-slider">
            <span data-element="from"></span>
            <div class="range-slider__inner" data-element="inner">
              <span class="range-slider__progress" data-element="progress"></span>
              <span class="range-slider__thumb-left" data-element="thumbLeft"></span>
              <span class="range-slider__thumb-right" data-element="thumbRight"></span>
            </div>
            <span data-element="to"></span>
          </div>`;
  }
  
  addEventListener() {
    this.elements.thumbLeft.addEventListener("pointerdown", e=>this.onThumbPointerDown(e));
    this.elements.thumbRight.addEventListener("pointerdown", e=>this.onThumbPointerDown(e));
  }
  
  update() {
    const left = this.calcSide('left');
    const right = this.calcSide('right');
    this.elements.from.innerHTML = this._formatValue(this._selected.from);
    this.elements.to.innerHTML = this._formatValue(this._selected.to);
    this.elements.progress.style.left = left;
    this.elements.progress.style.right = right;
    this.elements.thumbLeft.style.left = left;
    this.elements.thumbRight.style.right = right;
  }
  
  calcSide(sideType) {
    const num = sideType === 'left'
      ? this._selected.from - this.min
      : this.max - this._selected.to;

    return Math.floor(this.percentWithCheck(num, this.max - this.min)) + "%";
  }

  onThumbPointerDown(e) {
    this.currentPosition = this.getPosition(e);
    this.dragging = e.target;
    this.element.classList.add("range-slider_dragging");
    document.addEventListener("pointermove", this.onThumbPointerMove);
    document.addEventListener("pointerup", this.onThumbPointerUp);
    this.element.dispatchEvent(new CustomEvent("range-select", { detail: this.getValue() }));
  }
  
  getPosition(e) {
    switch (e.target) {
    case this.elements.thumbLeft:
      return e.target.getBoundingClientRect().right - e.clientX;
    case this.elements.thumbRight:
      return e.target.getBoundingClientRect().left - e.clientX;
    default: throw new Error("Invalid thumb type");
    }
  }
  
  percentWithCheck(min, max, otherValue) {
    let res = min / max;
    res = res < 0 ? 0 : res * 100;
    res = res + otherValue > 100 ? 100 - otherValue : res;
    return res;
  }
  
  onThumbPointerMove(e) {
    const value = this.dragging === this.elements.thumbLeft
      ? this.percentWithCheck(e.clientX - this.elements.inner.getBoundingClientRect().left + this.currentPosition, this.elements.inner.offsetWidth, parseFloat(this.elements.thumbRight.style.right))
      : this.percentWithCheck(this.elements.inner.getBoundingClientRect().right - e.clientX - this.currentPosition, this.elements.inner.offsetWidth, parseFloat(this.elements.thumbLeft.style.left));
          
    if (this.dragging === this.elements.thumbLeft) {
      this.dragging.style.left = this.elements.progress.style.left = value + "%";
      this._selected.from = this.getValueFrom();
      this.elements.from.innerHTML = this._formatValue(this.getValue().from);
    } else {
      this.dragging.style.right = this.elements.progress.style.right = value + "%";
      this._selected.to = this.getValueTo();
      this.elements.to.innerHTML = this._formatValue(this.getValue().to);
    }
    this.element.dispatchEvent(new CustomEvent("range-select", { detail: this.getValue() }));
  }
  
  reset() {
    this.setValue({
      from: this.min,
      to: this.max
    });
  }
  
  setValue(values) {
    this._selected = values;
    this.update();
  }
  
  getValueFrom = () => Math.round(this.min + .01 * parseFloat(this.elements.thumbLeft.style.left) * (this.max - this.min));

  getValueTo = () => Math.round(this.max - .01 * parseFloat(this.elements.thumbRight.style.right) * (this.max - this.min));

  getValue() {
    return {
      from: this.getValueFrom(),
      to: this.getValueTo()
    };
  }
  
  onThumbPointerUp() {
    this.element.classList.remove("range-slider_dragging");
    document.removeEventListener("pointermove", this.onThumbPointerMove);
    document.removeEventListener("pointerup", this.onThumbPointerUp);
    this.element.dispatchEvent(new CustomEvent("range-select", { detail: this.getValue() }));
  }
  
    
  remove() {
    if (this.elementent) {
      this.elementent.remove();
    }
  }
  
  destroy() {
    this.remove();
    this.element = null;
  
    document.removeEventListener("pointermove", this.onThumbPointerMove);
    document.removeEventListener("pointerup", this.onThumbPointerUp);
  }    
}