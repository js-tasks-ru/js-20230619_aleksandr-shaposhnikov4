import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const IMGUR_URL = 'https://api.imgur.com/3/upload';
const BACKEND_URL = 'https://course-js.javascript.ru';
const CATEGORY_URL = 'api/rest/categories?_sort=weight&_refs=subcategory';
const PRODUCT_URL = 'api/rest/products';

export default class ProductForm {
  defaultFormData = [{
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    images: [],
    price: 100,
    discount: 0
  }];
  
  constructor (productId) {
    this.productId = productId;
    this.urlCategory = new URL(CATEGORY_URL, BACKEND_URL);
    this.urlProduct = new URL(PRODUCT_URL, BACKEND_URL);
    
    if (this.productId) {
      this.urlProduct.searchParams.set('id', this.productId);
    }
  }

  async render() {
    this.data = await this.load(this.productId);
    this.show();
  }

  show() {
    this.element = document.createElement('div');
    this.element.innerHTML = this.getTemplate();
    this.element = this.element.firstElementChild;
    this.subElements = this.getSubElements(this.element);
    
    this.initEventListeners();
    document.body.append(this.element);

    return this.element;
  }
  
  async load (productId) {
    return {
      categoryData: await fetchJson(this.urlCategory),

      productData: productId
        ? await fetchJson(this.urlProduct)
        : this.defaultFormData
    };
  }

  getCategoryOptions(categoryData) {
    return categoryData.map(item => { return this.getSubcategories(item.subcategories, item.title); }).join('');
  }

  getSubcategories(categoryData, categoryId) {
    return categoryData.map(item => {
      return this.data.categoryData[0].subcategory === item.id ? `<option value='${item.id}' selected>${categoryId + ' > ' + item.title}</option>` : `<option value='${item.id}'>${categoryId + ' > ' + item.title}</option>`; 
    }).join('');
  }
  
  getStatus() {
    return this.data.productData[0].status === 1
      ? `<option value='1' selected>Активен</option><option value='0'>Не активен</option>`
      : `<option value='1'>Активен</option><option value='0' selected>Не активен</option>`;
  }

  getImage() {
    if (this.data.productData[0].images && Array.isArray(this.data.productData[0].images)) {
      return this.data.productData[0].images.map(item => {
        return `<li class="products-edit__imagelist-item sortable-list__item" style="">
          <input type="hidden" name="url" value="${item.url}">
          <input type="hidden" name="source" value="${item.source}">
          <span>
            <img src="icon-grab.svg" data-grab-handle="" alt="grab">
            <img class="sortable-table__cell-img" alt="Image" src="${item.url}">
            <span>${item.source}</span>
          </span>
          <button type="button">
            <img src="icon-trash.svg" data-delete-handle="" alt="delete">
          </button></li>`;
      }).join('');
    }
  }

  initEventListeners() {
    const {productForm, uploadImage} = this.subElements;
    productForm.addEventListener('submit', this.onSubmit);
    uploadImage.addEventListener('click', this.uploadImage);
  }

  getSubElements(element) {
    const subElements = {};
    const elements = element.querySelectorAll('[data-element]');
  
    for (const subElem of elements) { 
      subElements[subElem.dataset.element] = subElem;
    }
  
    subElements.productForm = element;
    return subElements;
  }

  getTemplate() {
    const { categoryData, productData } = this.data;
    
    return `<div class="product-form">
    <form data-element="productForm" class="form-grid">
        <div class="form-group form-group__half_left">
          <fieldset>
            <label class="form-label">Название товара</label>
            <input id="title" data-element="title" required="" type="text" name="title" class="form-control" placeholder="Название товара" value = '${productData[0].title}'>
          </fieldset>
        </div>
        <div class="form-group form-group__wide">
          <label class="form-label">Описание</label>
          <textarea id="description" required="" class="form-control" name="description" data-element="description" placeholder="Описание товара">${productData[0].description}</textarea>
        </div>
        <div class="form-group form-group__wide" data-element="sortable-list-container">
          <label class="form-label">Фото</label>
          <div id="images" data-element="images"><ul class="sortable-list" data-element="imageListContainer">${this.getImage()}</ul></div>
          <button type="button" name="uploadImage" data-element="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
        </div>
        <div class="form-group form-group__half_left">
          <label class="form-label">Категория</label>
          <select class="form-control" id="subcategory" name="subcategory" data-element="subcategory">
          ${this.getCategoryOptions(categoryData)}
          </select>
        </div>
        <div class="form-group form-group__half_left form-group__two-col">
          <fieldset>
            <label class="form-label">Цена ($)</label>
            <input id="price" data-element="price" required="" type="number" name="price" class="form-control" placeholder="100" value="${this.data.productData[0].price}">
          </fieldset>
          <fieldset>
            <label class="form-label">Скидка ($)</label>
            <input id="discount" data-element="discount" required="" type="number" name="discount" class="form-control" placeholder="0" value="${this.data.productData[0].discount}">
          </fieldset>
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Количество</label>
          <input id="quantity" data-element="quantity" required="" type="number" class="form-control" name="quantity" placeholder="1" value="${this.data.productData[0].quantity}">
        </div>
        <div class="form-group form-group__part-half">
          <label class="form-label">Статус</label>
          <select id="status" class="form-control" name="status" data-element="status">
            ${this.getStatus()}
          </select>
        </div>
        <div class="form-buttons">
          <button type="submit" data-element="productForm" name="save" class="button-primary-outline">
            Сохранить товар
          </button>
        </div>
      </form>
    </div>`;
  }

  onSubmit = event => {
    event.preventDefault();
    this.save();
  }

  uploadImage = () => {
    const fileInput = document.createElement('input');
    const url = new URL(IMGUR_URL);
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.click();
    fileInput.onchange = async () => {
      const [file] = fileInput.files;

      if (file) {
        const formData = new FormData();
        const { sortableImageList } = this.subElements;

        formData.append('image', file);
        formData.append('name', 'file');
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
            },
            body: {
              'formData': formData
            }});

          let result = await response.json();
          
          this.data.productData[0].images.push({
            url: `${result.data.link}`,
            sourse: `${result.data.id}`
          });
          imageListContainer.innerHTML = this.getImage();

        } catch (error) {
          console.error('Error: ', error);
        }
      }
    };
  }

  async save() {
    fetchJson(this.urlProduct, {
      method: this.data.productData[0].id ? 'PATCH' : "PUT",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.data.productData[0])
    })
    
    try {
      const event = this.productId
        ? new CustomEvent("product-updated")
        : new CustomEvent("product-saved");

      this.element.dispatchEvent(event);
    }
    catch {
      throw new Error("Error saving/updating product");
    }
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