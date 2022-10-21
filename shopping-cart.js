import './Card.js'
import './Cart.js'

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
        this.render()
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
                ${this.data.map((item) => {
                    return `
                        <div class="col mt-5">
                            <it-card data='${JSON.stringify(item)}'></it-card>
                        </div>
                    `
                }).join(' ')}
            </div>
        </div>
        `
    }
}

customElements.define('it-app', App)










export default class Card extends HTMLElement {
    constructor() {
        super();
        this.data = JSON.parse(this.getAttribute('data'));
    }

    onClick(evt) {
        if (evt.target.closest('.btn')) {
            const event = new CustomEvent('share-data', { bubbles: true, detail: this.data });
            this.dispatchEvent(event)
        }
    }

    connectedCallback() {
        this.render();
        this.addEventListener('click', this.onClick);
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

customElements.define('it-card', Card);




export default class Cart extends HTMLElement {
    constructor() {
        super();
        this.quantity = 0;
        this.isVisible = false
        this.data = [];
    }

    onToggleTable(evt) {
        if (evt.target.closest('.cart-link-icon')) {
            evt.preventDefault();
            this.isVisible = !this.isVisible;
            this.render();
        }
    }

    onDeleteItem(evt) {
        if (evt.target.closest('.btn')) {
            const productId = Number(evt.target.dataset.productId);
            this.data = this.data.filter((item) => item.id !== productId);
            this.render()
        }
    }

    onClick(evt) {
        this.onToggleTable(evt);
        this.onDeleteItem(evt);
    }

    watchOnData() {
        window.addEventListener('share-data', (evt) => {
            this.data.push(evt.detail);
            this.quantity = this.quantity + 1;
            this.render()
        })
    }

    connectedCallback() {
        this.render();
        this.addEventListener('click', this.onClick);
        this.watchOnData()
    }

    disconnectedCallback() {
        this.removeEventListener('click', this.onClick)
    }

    render() {
        this.innerHTML = `
        <a href='#' class="position-relative cart-link-icon">
            <img src='./images/cart.svg' width='50' height='50' class='cart-icon'/>
            <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
               ${this.quantity}
            </span>
        </a>

        ${this.isVisible ? `
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
                ${this.data.length ? `
                    ${this.data.map((item) => {
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
                      `
        })
                    }
                `: `
                    <tr>
                        <td>No Data</td>
                    </tr>
                `}
                </tbody>
            </table>
        `: ''}
    `;
    }
}

customElements.define('it-cart', Cart)
