function resetGame(element) {
    element.dispatchEvent(new CustomEvent('reset-game', { bubbles: true, composed: true, detail: {} }));
}

// (PARENT) our app container, app-wide state is managed here
class GameContainer extends HTMLElement {
    constructor() {
        super();

        this.state = {
            target: Number(Math.floor(Math.random() * 100)), // random number between 1 and 100
            remainingGuesses: 10,
            lastGuess: 0,
            result: "",
            hint: ""
        };

        console.log(this.state.target);

        this.attachShadow({ mode: 'open' });
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

        <h1>Higher or Lower</h1>
        <slot></slot>
        `;

        this.addEventListener('on-guess', this.onGuess);
        document.addEventListener('reset-game', (value) => {
            console.log(value);
            this.resetGame();
        });
        this.onGuess = this.onGuess.bind(this);
    }

    resetGame() {
        this.state = {
            target: Number(Math.floor(Math.random() * 100)), // random number between 1 and 100
            remainingGuesses: 10,
            lastGuess: 0,
            result: "",
            hint: ""
        };

        /**
         * Only re-add these tags if state is win or lose,
         * as they will have been removed, else no need to re-add
         */
        if (true) {
            let gameCard = document.querySelector("#game-card");

            if (gameCard) {
                gameCard.innerHTML += '<hr id="divider" />';
            }

            let gamePlay = new GamePlay();
            gamePlay.id = "game-play-element";
            this.appendChild(gamePlay);
        }

        this.updateChildren();
    }

    connectedCallback() {
        this.updateChildren();
    }

    calculateHint() {
        if (this.state.remainingGuesses > 0) {
            return this.state.lastGuess < this.state.target ? "higher" : "lower";
        } else {
            return "";
        }
    }

    endPlay() {
        // Remove GamePlay element so user can't make anymore guesses
        let element = document.querySelector("#game-play-element");
        element.parentNode.removeChild(element);

        let divider = document.querySelector("#divider");

        if (divider) {
            divider.parentNode.removeChild(divider);
        }

        this.state.hint = "";
    }

    onGuess(event) {
        if (this.state.remainingGuesses === 0) {
            // No more guesses, decalares a loss and ends
            this.endPlay();
            return;
        } else if (Number(event.detail.lastGuess) === this.state.target) {
            // Checks guess is a match, if so ends play
            this.state.result = "You Win!";
            this.endPlay();
        } else if (this.state.remainingGuesses === 1) {
            // Last guess so ends play
            // Decrements one guess
            this.state.remainingGuesses -= 1;
            this.state.result = "You Lose!";
            this.endPlay();
        } else {

            // Decrements one guess
            this.state.remainingGuesses -= 1;

            // Update last guess
            this.state.lastGuess = Number(event.detail.lastGuess);

            // Updates hint
            this.state.hint = String(this.calculateHint());
        }

        // Updates child components
        this.updateChildren();
    }

    updateChildren() {
        this.querySelector('game-output').remainingGuesses = Number(this.state.remainingGuesses);
        this.querySelector('game-output').hint = String(this.state.hint);
        this.querySelector("game-output").result = String(this.state.result);
    }
}

// (CHILD 1)
class GameOutput extends HTMLElement {
    constructor() {
        super();

        this.props = {
            remainingGuesses: 0,
            hint: "",
            result: "",
            target: 0
        };

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
        <style>
            #result-p {
                text-align: center;
                /* color: white; */
                background: lime;
                padding: 10px;
                margin-bottom: 0;
                font-weight: 600;
            }
        </style>
        
        <p>Remaining guesses: <span id="remaining-guesses"></span></p>
        <p>Hint: <span id="hint"></span></p>
        <p id="result-p"><span id="result"></span></p>
`;
    }

    connectedCallback() {
        Object.keys(this.props).forEach((propName) => {
            if (this.hasOwnProperty(propName)) {
                let value = this[propName];
                delete this[propName];
                this[propName] = value;
            }
        });

        this.updateChildren();
    }

    set hint(value) {
        this.props.hint = String(value);

        this.updateChildren();
    }

    get hint() {
        return this.props.hint;
    }

    set remainingGuesses(value) {
        this.props.remainingGuesses = Number(value);

        this.updateChildren();
    }

    set result(value) {
        this.props.result = String(value);

        this.updateChildren();
    }

    get result() {
        this.props.result;
    }

    get remainingGuesses() {
        return this.props.remainingGuesses;
    }

    updateElement(elementId) {
        let element = this.shadowRoot.querySelector(`#${elementId} `);

        if (this.props[elementId] === "") {
            element.parentElement.style.display = "none"; // parent p tag
        } else {
            element.parentElement.style.display = "block"; // parent p tag
            element.innerText = String(this.props[elementId]);
        }
    }

    updateChildren() {
        this.shadowRoot.querySelector('#remaining-guesses').innerText = Number(this.props.remainingGuesses);
        this.updateElement("hint");
        this.updateElement("result");
    }
}

// (CHILD 2)
class GamePlay extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
        <style>
            .controls {
                max-width: 270px;
                max-height: 25px;
                display: flex;
                justify-content: space-between;
            }

            .guess {
                width: 30%;
                align-items: center;
                display: flex;
            }

            .form-input {
                width: 40%;
                text-align: center;
            }

            input#guess {
                width: 50%;
                height: 100%;
                padding-left: 5px;
                box-sizing: border-box;
            }

            .actions {
                width: 30%;
                text-align: end;
            }

            button {
                width: fit-content;

            }
        </style>

        <section class="controls">
            <div class="guess">
                <label for="guess">Guess</label>
            </div>

            <div class="form-input">
                <input type="number" id="guess" value="0">
            </div>

            <div class="actions">
                <button id="submit-guess">Guess</button>
            </div>
        </section>
        `;

        this.shadowRoot.querySelector('#submit-guess').addEventListener('click', (value) => {
            this.onGuess(value);
        });
    }

    onGuess(event) {
        let guess = Number(this.shadowRoot.querySelector("#guess").value);
        const lastGuess = parseInt(guess, 10);

        this.dispatchEvent(new CustomEvent('on-guess', {
            bubbles: true,
            composed: true,
            detail: {
                lastGuess,
            },
        }));
    }
}

// set the element names for our components
customElements.define('game-container', GameContainer);
customElements.define('game-output', GameOutput);
customElements.define('game-play', GamePlay);