class CalcArea extends HTMLElement {

    constructor() {
        super();

        // any external prop can be defined here
        this.props = {};

        // our application level state is defined here, with initial values
        this.state = {
            length: 0,
            width: 0,
            area: 0
        };

        // give this component a shadowDOM
        this.attachShadow({ mode: 'open' });

        // add shadowDOM and slot in the lightDOM
        this.shadowRoot.innerHTML = `
        <style>
        </style>

        <!-- slot if to contain child components -->
        <h1>Calc Area</h1>
        <p>
            <input type="number" id="length" value="20" />
        </p>
        <p>
            <input type="number" id="width" value="10" />
        </p>
        <p>
            <button id="submit-calculation">Calculate</button>
        </p>
        <p>
            Area: <span id="area"></span>
        </p>
        `;

        // listeners
        this.shadowRoot.querySelector('#submit-calculation').addEventListener('click', (value) => {
            this.onCalcArea(value);
        });

        // bindings
        this.onCalcArea = this.onCalcArea.bind(this);
    }

    connectedCallback() {
        // update the shadowDOM with the intitial props/state
    }

    updateOutput() {
        const area = this.shadowRoot.querySelector('#area');

        area.innerText = this.state.area;
    }

    onCalcArea(event) {
        console.log("calculating");
        const length = this.shadowRoot.querySelector('#length');
        const width = this.shadowRoot.querySelector('#width');
        this.state.length = length.value;
        this.state.width = width.value;
        this.state.area = this.state.length * this.state.width;

        this.updateOutput();
        // update any children
    }
}

customElements.define("calc-area", CalcArea);