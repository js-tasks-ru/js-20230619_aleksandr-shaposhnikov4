export default class NotificationMessage {
    static lastMessage = null;

    constructor(message = '', params = {}) {
      const { duration = 1000, type = '' } = params;
    
      this._message = message;
      this.duration = duration;
      this._type = type;
    
      this.render();
    }
    
    render() {
      const parent = document.createElement('div');
      parent.innerHTML = this.getTemplate();
      this.element = parent.firstElementChild;
      
      const notificationBodyElement = this.element.querySelector('.notification-body');
      notificationBodyElement.textContent = this._message;
    }

    show(parentElement = document.body) {
      if (NotificationMessage.lastMessage) { 
        NotificationMessage.lastMessage.remove();
      }

      parentElement.append(this.element);
      
      this.timerShowId = setTimeout(() => {
        this.destroy();
      }, this.duration);
      
      NotificationMessage.lastMessage = this;
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
