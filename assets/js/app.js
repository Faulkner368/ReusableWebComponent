// (PARENT) our app container, app-wide state is managed here
class XContainer extends HTMLElement {
    constructor() {
        super();

        // any external prop can be defined here
        this.props = {};

        // our application level state is defined here, with initial values
        this.state = {
            amount: 2, // the step amount to increment/decrement
            total: 0,  // the running total
        };

        // give this component a shadowDOM
        this.attachShadow({ mode: 'open' });

        // add shadowDOM and slot in the lightDOM
        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
                background-color: white;
            }

            h1 {
                margin-top: 0;
                font-size: 1.8em;
            }
        </style>

        <h1>Web Comp. Counter</h1>
        <slot></slot>
        `;

        // add our event listeners for listening to state change requests
        this.addEventListener('x-increment', this.onIncrement);
        this.addEventListener('x-decrement', this.onDecrement);
        this.addEventListener('x-update-amount', this.onUpdateAmount);

        // ensure our callbacks are bound to the component context
        this.onIncrement = this.onIncrement.bind(this);
        this.onDecrement = this.onDecrement.bind(this);
        this.onUpdateAmount = this.onUpdateAmount.bind(this);
    }

    connectedCallback() {
        // update the shadowDOM with the intitial props/state
        this.updateChildren();
    }

    onDecrement(event) {
        // decrement our total by the current amount
        this.state.total = this.state.total - this.state.amount;

        // update the shadowDOM with the current props/state
        this.updateChildren();
    }

    onIncrement(event) {
        // increment our total by the current amount
        this.state.total = this.state.total + this.state.amount;

        // update the shadowDOM with the current props/state
        this.updateChildren();
    }

    onUpdateAmount(event) {
        // update our state to the desired amount
        this.state.amount = event.detail.amount;

        // update the shadowDOM with the current props/state
        this.updateChildren();
    }

    updateChildren() {
        // set the props of our child components (one-way data binding)
        this.querySelector('x-controls').amount = this.state.amount;
        this.querySelector('x-counter').total = this.state.total;
    }
}

// (CHILD 1)
class XCounter extends HTMLElement {
    constructor() {
        super();

        // initialise the props for the component
        this.props = {
            total: 0,
        };

        // no internal state for this component
        this.state = {};

        // add shadowDOM
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
        <style>
            h2 {
                font-size: 1.3em;
            }
        </style>
        
        <h2>Total: <span id="total">0</span></h2>`;
    }

    connectedCallback() {
        // ensure any initial properties set before the component was initialised our passed
        // through our setters
        Object.keys(this.props).forEach((propName) => {
            if (this.hasOwnProperty(propName)) {
                let value = this[propName];
                delete this[propName];
                this[propName] = value;
            }
        });

        // update the shadowDOM with the intitial props/state
        this.updateChildren();
    }

    set total(value) {
        // update our props with new value
        this.props.total = value;

        this.updateChildren();
    }

    get total() {
        // return the prop
        return this.props.total;
    }

    updateChildren() {
        // set the props of our child components (one-way data binding)
        this.shadowRoot.querySelector('#total').innerText = this.props.total;
    }
}

// (CHILD 2)
class XControls extends HTMLElement {
    constructor() {
        super();

        // initialise the props for the component
        this.props = {
            amount: 1,
        };

        // no internal state for this component
        this.state = {};

        // add shadowDOM
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
      <style>
            .controls {
                max-width: 270px;
                max-height: 25px;
                display: flex;
                justify-content: space-between;
            }

            .amount {
                width: 20%;
                align-items: center;
                display: flex;
            }

            .form-input {
                width: 50%;
            }

            input#amount {
                width: 100%;
                height: 100%;
                padding-left: 5px;
                box-sizing: border-box;
            }

            .actions {
                width: 20%;
            }

            button {
                width: 25px;
                height: 25px;
            }
      </style>

      <section class="controls">
        <div class="amount">
            <label for="amount">Amount</label>
        </div>

        <div class="form-input">
            <input type="number" id="amount">
        </div>

        <div class="actions">
            <button id="increment">+</button>
            <button id="decrement">-</button>
        </div>
      </section>
    `;

        // add our event listeners for our component controls
        this.shadowRoot.querySelector('#amount').addEventListener('input', this.onUpdateAmount);
        this.shadowRoot.querySelector('#increment').addEventListener('click', this.onIncrement);
        this.shadowRoot.querySelector('#decrement').addEventListener('click', this.onDecrement);

        // ensure our callbacks are bound to the component context
        this.onUpdateAmount = this.onUpdateAmount.bind(this);
        this.onIncrement = this.onIncrement.bind(this);
        this.onDecrement = this.onDecrement.bind(this);
    }

    connectedCallback() {
        // ensure any initial properties set before the component was initialised our passed
        // through our setters
        Object.keys(this.props).forEach((propName) => {
            if (this.hasOwnProperty(propName)) {
                let value = this[propName];
                delete this[propName];
                this[propName] = value;
            }
        });

        // update the shadowDOM with the intitial props/state
        this.updateChildren();
    }

    set amount(value) {
        // update our props with new value
        this.props.amount = value;

        this.updateChildren();
    }

    get amount() {
        // return the prop
        return this.props.amount;
    }

    onUpdateAmount(event) {
        // get value from input
        const amount = parseInt(event.target.value, 10);

        // dispatch event to update our container state
        this.dispatchEvent(new CustomEvent('x-update-amount', {
            bubbles: true,
            composed: true,
            detail: {
                amount,
            },
        }));
    }

    onIncrement(event) {
        // dispatch event to update our container state
        this.dispatchEvent(new CustomEvent('x-increment', {
            bubbles: true,
            composed: true,
        }));
    }

    onDecrement(event) {
        // dispatch event to update our container state
        this.dispatchEvent(new CustomEvent('x-decrement', {
            bubbles: true,
            composed: true,
        }));
    }

    updateChildren() {
        // set the props of our child components (one-way data binding)
        this.shadowRoot.querySelector('#amount').value = this.props.amount;
    }
}


// set the element names for our components
customElements.define('x-container', XContainer);
customElements.define('x-controls', XControls);
customElements.define('x-counter', XCounter);