const display = document.getElementById('display');
let currentValue = '0';
let previousValue = null;
let operator = null;
let shouldResetDisplay = false;

function updateDisplay() {
    display.textContent = currentValue;
}

function appendNumber(number) {
    if (shouldResetDisplay) {
        currentValue = '';
        shouldResetDisplay = false;
    }
    if (number === '.' && currentValue.includes('.')) return;
    if (currentValue === '0' && number !== '.') {
        currentValue = number;
    } else {
        currentValue += number;
    }
    updateDisplay();
}

function chooseOperator(op) {
    if (operator !== null) {
        calculate();
    }
    previousValue = currentValue;
    operator = op;
    shouldResetDisplay = true;
}

function calculate() {
    if (operator === null || previousValue === null) return;

    const prev = parseFloat(previousValue);
    const curr = parseFloat(currentValue);
    let result;

    switch (operator) {
        case 'add':
            result = prev + curr;
            break;
        case 'subtract':
            result = prev - curr;
            break;
        case 'multiply':
            result = prev * curr;
            break;
        case 'divide':
            result = curr === 0 ? 'Error' : prev / curr;
            break;
        default:
            return;
    }

    currentValue = typeof result === 'number'
        ? (Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(10)).toString())
        : result;
    operator = null;
    previousValue = null;
    shouldResetDisplay = true;
    updateDisplay();
}

function clear() {
    currentValue = '0';
    previousValue = null;
    operator = null;
    shouldResetDisplay = false;
    updateDisplay();
}

function backspace() {
    if (currentValue === 'Error') {
        clear();
        return;
    }
    currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : '0';
    updateDisplay();
}

// Keyboard support
function handleKey(key) {
    if (key >= '0' && key <= '9') {
        appendNumber(key);
        return;
    }
    if (key === '.') {
        appendNumber('.');
        return;
    }
    switch (key) {
        case '+': chooseOperator('add'); break;
        case '-': chooseOperator('subtract'); break;
        case '*': chooseOperator('multiply'); break;
        case '/': chooseOperator('divide'); break;
        case 'Enter':
        case '=':
            calculate();
            break;
        case 'Escape':
        case 'c':
        case 'C':
            clear();
            break;
        case 'Backspace':
            backspace();
            break;
    }
}

// Event delegation for button clicks
document.querySelector('.buttons').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    if (btn.dataset.action === 'equals') {
        calculate();
    } else if (btn.dataset.action) {
        const action = btn.dataset.action;
        switch (action) {
            case 'clear': clear(); break;
            case 'backspace': backspace(); break;
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
                chooseOperator(action);
                break;
            case 'decimal':
                appendNumber('.');
                break;
        }
    } else if (btn.dataset.value) {
        appendNumber(btn.dataset.value);
    }
});

// Keyboard event listener
document.addEventListener('keydown', (e) => {
    handleKey(e.key);
});