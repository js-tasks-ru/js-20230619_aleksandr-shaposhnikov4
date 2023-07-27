export default class SortableList {
  constructor({items}) {
    this.items = items;
    
    this.onDocumentPointerMove = this.onDocumentPointerMove.bind(this);
    this.onDocumentPointerUp = this.onDocumentPointerUp.bind(this);

    this.initialization();  
  }

  initialization() {
    this.render();
    this.addEventListener();
  }

  render() {
    this.element = document.createElement("ul");
    this.element.className = "sortable-list";
    
    this.items.forEach(item => {
      this.addItem(item);
    });
  }

  addEventListener() {
    this.element.addEventListener("pointerdown", e=>this.onPointerDown(e));
  }

  addItem(item) {
    item.classList.add("sortable-list__item");
    this.element.append(item);
  }

  deleteItem(item) {
    item.remove();
    this.element.dispatchEvent(new CustomEvent("sortable-list-delete", { bubbles: true, details: { item: item }}));
  }

  onPointerDown(e) {
    if (e.which !== 1) {return false;}
        
    const listElement = e.target.closest(".sortable-list__item");
        
    if (listElement) {
      const grabHandleElement = e.target.closest("[data-grab-handle]");
      const deleteHandleElement = e.target.closest("[data-delete-handle]");
          
      if (grabHandleElement) {
        e.preventDefault();
        this.drag(listElement, e);
      }
          
      if (deleteHandleElement) {
        e.preventDefault();
        this.deleteItem(listElement);
      }
    }
  }

  drag(grabElement, { horizontalPoint, verticalPoint }) {
    this.elementInitialIndex = [...this.element.children].indexOf(grabElement);
    this.draggingElement = grabElement;

    this.pointerInitial = {
      x: horizontalPoint - grabElement.getBoundingClientRect().x,
      y: verticalPoint - grabElement.getBoundingClientRect().y
    };
        
    this.placeholderElement = document.createElement("div");
    this.placeholderElement.className = "sortable-list__placeholder";
        
    grabElement.style.width = grabElement.offsetWidth + "px";
    grabElement.style.height = grabElement.offsetHeight + "px";
        
    this.placeholderElement.style.width = grabElement.style.width;
    this.placeholderElement.style.height = grabElement.style.height;
        
    grabElement.classList.add("sortable-list__item_dragging");
    grabElement.after(this.placeholderElement);
        
    this.element.append(grabElement);
    this.move(horizontalPoint, verticalPoint);
        
    document.addEventListener("pointermove", this.onDocumentPointerMove);
    document.addEventListener("pointerup", this.onDocumentPointerUp);
  }

  move(horizontalOffset, varticalOffset) {
    this.draggingElement.style.left = horizontalOffset - this.pointerInitial.x + "px";
    this.draggingElement.style.top = varticalOffset - this.pointerInitial.y + "px";
  }

  movePlaceholder(index) {
    if (this.element.children[index] !== this.placeholderElement) {
      this.element.insertBefore(this.placeholderElement, this.element.children[index]);
    }
  }

  onDocumentPointerMove(e) {
    this.move(e.clientX, e.clientY);
        
    const top = this.element.firstElementChild.getBoundingClientRect().top;
    const bottom = this.element.lastElementChild.getBoundingClientRect().bottom;

    const children = this.element.children;

    const isBetween = (element) => 
      e.clientY > element.getBoundingClientRect().top && e.clientY < element.getBoundingClientRect().bottom;

    if (e.clientY < top) {
      this.movePlaceholder(0);
    } else if (e.clientY > bottom) {
      this.movePlaceholder(children.length);
    } else {
      for (let i = 0; i < children.length; i++) {
        let child = children[i];
        if (child !== this.draggingElement && isBetween(child)) {
          if (e.clientY < child.getBoundingClientRect().top + child.offsetHeight / 2) {
            this.movePlaceholder(i);
            break;
          } else {
            this.movePlaceholder(i + 1);
            break;
          }
        }
      }
    }
  }

  onDocumentPointerUp() {
    const placeholderIndex = [...this.element.children].indexOf(this.placeholderElement);
        
    this.placeholderElement.replaceWith(this.draggingElement);
    this.draggingElement.classList.remove("sortable-list__item_dragging");
        
    this.draggingElement.style.left = "";
    this.draggingElement.style.top = "";
    this.draggingElement.style.width = "";
    this.draggingElement.style.height = "";
        
    document.removeEventListener("pointermove", this.onDocumentPointerMove);
    document.removeEventListener("pointerup", this.onDocumentPointerUp);
        
    this.draggingElement = null;
        
    if (placeholderIndex !== this.elementInitialIndex) {
          
      const values = { from: this.elementInitialIndex, to: placeholderIndex };
      this.element.dispatchEvent(new CustomEvent("sortable-list-reorder", { bubbles: true, detail: values}));
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
      this.element.removeEventListener("pointerdown", this.onPointerDown);
    }
  }
    
  destroy() {
    this.remove();
    this.element = null;
    this.items = null;
    this.placeholderElement = null;
  }
}
