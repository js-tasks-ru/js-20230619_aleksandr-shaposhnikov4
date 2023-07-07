export default class NotificationMessage {
    static instance = null;
    
    constructor(message, {duration, type} = {}) {
      this._message = message ?? '';
      this.duration = duration ?? 1000;
      this._type = type ?? '';

      this.render();
    }
    
    render() {
      const parent = document.createElement('div');
      parent.innerHTML = this.getTemplate();
      this.element = parent.firstElementChild;
      
      const notificationBody = this.element.querySelector('.notification-body');
      notificationBody.textContent = this._message;
    }

    show(parentElement = document.body) {
      if (NotificationMessage.instance) { 
        NotificationMessage.instance.remove();
      }

      parentElement.append(this.element);
      
      this.timerShowId = setTimeout(() => {
        this.destroy();
      }, this.duration);
      
      NotificationMessage.instance = this;
    }

    remove() {
      clearTimeout(this.timerShowId);
      if (this.element) {
        this.element.remove();
      }
    }
  
    destroy() {
      this.remove();
      this.element = null;
      NotificationMessage.instance = null;
    }
  
    getTemplate() {
      const typeClass = this._type ? ` ${this._type}` : '';
        
      return `<div class="notification${typeClass}" style="--value:${this.duration / 1000 + "s"}">
          <div class="timer"></div>
          <div class="inner-wrapper">
            <div class="notification-header">${this._type}</div>
            <div class="notification-body">
              ${this._message}
            </div>
          </div>
        </div>`;
    }
}
