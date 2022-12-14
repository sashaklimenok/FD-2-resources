<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
    integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
</head>

<body>

  <it-app></it-app>

  <script src="./App.js" type="module"></script>
</body>

</html>


export const STORAGE_KEYS = {
  cartData: "cart-data",
};

class StorageService {
  constructor() {
    this.storage = window.localStorage;
  }

  dispatchEvent(key) {
    const event = new CustomEvent("storage", {
      detail: key ? { key, value: this.getItem(key) } : null,
      bubbles: true,
    });
    window.dispatchEvent(event);
  }

  getItem(key) {
    try {
      return JSON.parse(this.storage.getItem(key));
    } catch (error) {
      console.error(error.message);
    }
  }

  setItem(key, value) {
    try {
      this.storage.setItem(key, JSON.stringify(value));
      this.dispatchEvent(key);
    } catch (error) {
      console.error(error.message);
    }
  }

  removeItem(key) {
    this.storage.removeItem(key);
    this.dispatchEvent(key);
  }

  clear() {
    this.storage.clear();
    this.dispatchEvent();
  }
}

const storageService = new StorageService();
export default storageService;


import "./Card.js";
import "./Cart.js";

class App extends HTMLElement {
  constructor() {
    super();
    this.data = [
      {
        id: 1,
        title: "Product #1",
        preview: "./images/data.webp",
        description:
          "Redmi 10C оснащен производительным 8-ядерным процессором Snapdragon 680, построенном на флагманском 6-нм",
        price: 200,
      },
      {
        id: 2,
        title: "Product #2",
        preview: "./images/data.webp",
        description:
          "Redmi 10C оснащен производительным 8-ядерным процессором Snapdragon 680, построенном на флагманском 6-нм",
        price: 210,
      },
      {
        id: 3,
        title: "Product #3",
        preview: "./images/data.webp",
        description:
          "Redmi 10C оснащен производительным 8-ядерным процессором Snapdragon 680, построенном на флагманском 6-нм",
        price: 230,
      },
      {
        id: 4,
        title: "Product #4",
        preview: "./images/data.webp",
        description:
          "Redmi 10C оснащен производительным 8-ядерным процессором Snapdragon 680, построенном на флагманском 6-нм",
        price: 240,
      },
    ];
  }

  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
        <div class='container mt-5 mb-5'>
            <div class='col-12'>
                <it-cart></it-cart>
            </div>
        </div>
        <div class="container">
            <div class="row">
                ${this.data
                  .map((item) => {
                    return `
                        <div class="col mt-5">
                            <it-card data='${JSON.stringify(item)}'></it-card>
                        </div>
                    `;
                  })
                  .join(" ")}
            </div>
        </div>
        `;
  }
}

customElements.define("it-app", App);


import { STORAGE_KEYS } from "./constants/storage.js";
import storageService from "./services/StorageService.js";

export default class Card extends HTMLElement {
  constructor() {
    super();
    this.data = JSON.parse(this.getAttribute("data"));
  }

  onClick(evt) {
    if (evt.target.closest(".btn")) {
      const data = storageService.getItem(STORAGE_KEYS.cartData) ?? [];
      storageService.setItem(STORAGE_KEYS.cartData, [...data, this.data]);
    }
  }

  connectedCallback() {
    this.render();
    this.addEventListener("click", this.onClick);
  }

  render() {
    this.innerHTML = `
            <div class="card" style="width: 18rem;">
                <img src="${this.data.preview}" class="card-img-top" alt="${this.data.title}">
                <div class="card-body">
                    <h5 class="card-title">${this.data.title}</h5>
                    <p class="card-text">${this.data.description}</p>
                    <p><strong>${this.data.price}$</strong></p>
                    <button href="#" class="btn btn-primary">Add to cart</button>
                </div>
            </div>
      `;
  }
}

customElements.define("it-card", Card);

import storageService from "./services/StorageService.js";
import { STORAGE_KEYS } from "./constants/storage.js";

export default class Cart extends HTMLElement {
  constructor() {
    super();
    this.quantity = 0;
    this.isVisible = false;
    this.data = [];
  }

  cartDataAdapter(data) {
    const cartData = data
      .map((item, _, arr) => {
        return {
          ...item,
          quantity: item.quantity
            ? item.quantity
            : arr.filter((subItem) => subItem.id === item.id).length,
        };
      })
      .filter(
        (item, index, arr) =>
          arr.findIndex((finditem) => finditem.id === item.id) === index
      );

    this.quantity = cartData.reduce(
      (acc, current) => (acc += current.quantity),
      0
    );

    return cartData;
  }

  initializeData() {
    const data = storageService.getItem(STORAGE_KEYS.cartData);
    this.data = data ? this.cartDataAdapter(data) : [];
  }

  onToggleTable(evt) {
    if (evt.target.closest(".cart-link-icon")) {
      evt.preventDefault();
      this.isVisible = !this.isVisible;
      this.render();
    }
  }

  onDeleteItem(evt) {
    if (evt.target.closest(".btn")) {
      const productId = Number(evt.target.dataset.productId);
      const updatedData = this.data
        .map((item) => {
          if (item.id === productId) {
            return {
              ...item,
              quantity: item.quantity - 1,
            };
          }
          return item;
        })
        .filter((item) => Boolean(item.quantity));

      storageService.setItem(STORAGE_KEYS.cartData, updatedData);
      this.render();
    }
  }

  onClick(evt) {
    this.onToggleTable(evt);
    this.onDeleteItem(evt);
  }

  watchOnData() {
    window.addEventListener("storage", (evt) => {
      this.data = this.cartDataAdapter(evt.detail.value);
      this.render();
    });
  }

  connectedCallback() {
    this.initializeData();
    this.addEventListener("click", this.onClick);
    this.watchOnData();
    this.render();
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.onClick);
  }

  render() {
    this.innerHTML = `
        <a href='#' class="position-relative cart-link-icon">
            <img src='./images/cart.svg' width='50' height='50' class='cart-icon'/>
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
               ${this.quantity}
            </span>
        </a>
        ${
          this.isVisible
            ? `
            <table class="table mt-3">
                <thead>
                    <tr>
                        <th scope="col">id</th>
                        <th scope="col">Title</th>
                        <th scope="col">Preview</th>
                        <th scope="col">Description</th>
                        <th scope="col">Price</th>
                        <th scope="col">Quantity</th>
                    </tr>
                </thead>
                <tbody>
                ${
                  this.data.length
                    ? `
                    ${this.data
                      .map((item) => {
                        return `
                            <tr>
                                <th>${item.id}</th>
                                <td>${item.title}</td>
                                <th><img src='${item.preview}'/></th>
                                <td>${item.description}</td>
                                <td>${item.price}</td>
                                <td>${item.quantity}</td>
                                <td>
                                    <button data-product-id="${item.id}" class='btn btn-danger'>Delete</button>
                                </td>
                            </tr>
                      `;
                      })
                      .join(" ")}
                `
                    : `
                    <tr>
                        <td>No Data</td>
                    </tr>
                `
                }
                </tbody>
            </table>
        `
            : ""
        }
    `;
  }
}

customElements.define("it-cart", Cart);



