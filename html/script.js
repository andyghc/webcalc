const display = document.getElementById('display');
let currentValue = '0';
let previousValue = null;
let operator = null;
let shouldResetDisplay = false;

// Scientific mode state
let angleMode = 'deg';        // 'deg' or 'rad'
let invMode = false;          // true = inverse trig (asin, acos, atan)
let scientificMode = false;
let pendingBinary = null;     // for x^y: stores the base, operator = 'pow'

// DOM refs
const calculator = document.getElementById('calculator');
const sciButtons = document.getElementById('sciButtons');
const modeCheckbox = document.getElementById('modeCheckbox');
const modeIndicator = document.getElementById('modeIndicator');
const modeLabels = document.querySelectorAll('.mode-label');

// ─── Display ───────────────────────────────────────────────

function updateDisplay() {
    display.textContent = currentValue;
    display.classList.remove('error');
}

function showError(msg) {
    currentValue = msg;
    display.textContent = msg;
    display.classList.add('error');
    operator = null;
    previousValue = null;
    shouldResetDisplay = true;
}

// ─── Mode Toggle ───────────────────────────────────────────

function setMode(scientific) {
    scientificMode = scientific;
    if (scientific) {
        calculator.classList.add('scientific');
        sciButtons.style.display = 'block';
        modeIndicator.textContent = 'Scientific';
    } else {
        calculator.classList.remove('scientific');
        sciButtons.style.display = 'none';
        modeIndicator.textContent = 'Basic';
    }
    modeLabels.forEach(l => {
        l.classList.toggle('active', l.dataset.mode === (scientific ? 'scientific' : 'basic'));
    });
}

modeCheckbox.addEventListener('change', () => {
    setMode(modeCheckbox.checked);
});

// ─── Basic Operations ──────────────────────────────────────

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

    if (isNaN(prev) || isNaN(curr)) {
        showError('Error');
        return;
    }

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
        case 'pow':
            result = Math.pow(prev, curr);
            break;
        default:
            return;
    }

    if (result === 'Error') {
        showError('Error');
        return;
    }

    currentValue = typeof result === 'number'
        ? (Number.isInteger(result) && isFinite(result)
            ? result.toString()
            : parseFloat(result.toFixed(10)).toString())
        : result;

    operator = null;
    previousValue = null;
    shouldResetDisplay = true;
    updateDisplay();
}

function clearDisplay() {
    currentValue = '0';
    previousValue = null;
    operator = null;
    shouldResetDisplay = false;
    updateDisplay();
}

function backspace() {
    if (currentValue === 'Error' || currentValue === 'Infinity' || currentValue === '-Infinity') {
        clearDisplay();
        return;
    }
    currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : '0';
    updateDisplay();
}

function toggleSign() {
    if (currentValue === '0' || currentValue === 'Error') return;
    currentValue = currentValue.startsWith('-') ? currentValue.slice(1) : '-' + currentValue;
    updateDisplay();
}

// ─── Scientific Unary Functions ────────────────────────────

function toRadians(deg) {
    return deg * (Math.PI / 180);
}

function toDegrees(rad) {
    return rad * (180 / Math.PI);
}

function applySciFunction(fn) {
    const val = parseFloat(currentValue);
    if (isNaN(val)) {
        showError('Error');
        return;
    }

    let result;

    switch (fn) {
        // Trig
        case 'sin': {
            const input = angleMode === 'deg' ? toRadians(val) : val;
            result = invMode ? Math.asin(input) : Math.sin(input);
            break;
        }
        case 'cos': {
            const input = angleMode === 'deg' ? toRadians(val) : val;
            result = invMode ? Math.acos(input) : Math.cos(input);
            break;
        }
        case 'tan': {
            const input = angleMode === 'deg' ? toRadians(val) : val;
            result = invMode ? Math.atan(input) : Math.tan(input);
            break;
        }
        // Logs
        case 'log':
            result = Math.log10(val);
            break;
        case 'ln':
            result = Math.log(val);
            break;
        // Roots and powers
        case 'sqrt':
            result = Math.sqrt(val);
            break;
        case 'square':
            result = val * val;
            break;
        case 'cube':
            result = val * val * val;
            break;
        case 'reciprocal':
            result = val === 0 ? 'Error' : 1 / val;
            break;
        case 'factorial':
            if (val < 0 || !Number.isInteger(val)) {
                showError('Error');
                return;
            }
            result = factorial(Math.floor(val));
            break;
        case 'percent':
            result = val / 100;
            break;
        // INV mode result conversion for trig
        case 'inv-result':
            // Used when INV mode changes the interpretation of the result
            result = val;
            break;
        default:
            return;
    }

    if (result === 'Error' || result === Infinity || result === -Infinity || (typeof result === 'number' && isNaN(result))) {
        showError('Error');
        return;
    }

    // For inverse trig, convert radian results to degrees if in deg mode
    if (invMode && ['sin', 'cos', 'tan'].includes(fn) && angleMode === 'deg' && typeof result === 'number') {
        result = toDegrees(result);
    }

    currentValue = typeof result === 'number'
        ? (Number.isInteger(result) && isFinite(result) && Math.abs(result) < 1e15
            ? result.toString()
            : parseFloat(result.toFixed(10)).toString())
        : result;

    shouldResetDisplay = true;
    updateDisplay();
}

function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

// ─── Constants ─────────────────────────────────────────────

function insertConstant(constant) {
    if (constant === 'pi') {
        currentValue = Math.PI.toString();
    } else if (constant === 'euler') {
        currentValue = Math.E.toString();
    }
    shouldResetDisplay = true;
    updateDisplay();
}

// ─── EE (Scientific Notation Entry) ────────────────────────

function enterEE() {
    if (shouldResetDisplay) {
        currentValue = '1e';
        shouldResetDisplay = false;
    } else if (currentValue.includes('e')) {
        return; // Already in exponent mode
    } else if (currentValue === '0') {
        currentValue = '1e';
    } else {
        currentValue += 'e';
    }
    updateDisplay();
}

// ─── Angle Mode Toggle ─────────────────────────────────────

function toggleAngleMode(btn) {
    angleMode = angleMode === 'deg' ? 'rad' : 'deg';
    btn.textContent = angleMode.toUpperCase();
}

// ─── INV Mode Toggle ──────────────────────────────────────

function toggleInvMode(btn) {
    invMode = !invMode;
    btn.classList.toggle('active', invMode);
    btn.textContent = invMode ? 'INV' : 'INV';
}

// ─── Input Parsing ─────────────────────────────────────────

function parseAndSet(val) {
    if (shouldResetDisplay) {
        currentValue = '';
        shouldResetDisplay = false;
    }
    if (currentValue === '0') {
        currentValue = val;
    } else {
        currentValue += val;
    }
}

// ─── Scientific Button Handler ─────────────────────────────

function handleSciAction(action, btn) {
    switch (action) {
        // Unary functions
        case 'sin':
        case 'cos':
        case 'tan':
        case 'log':
        case 'ln':
        case 'sqrt':
        case 'square':
        case 'cube':
        case 'reciprocal':
        case 'factorial':
        case 'percent':
            applySciFunction(action);
            break;

        // Binary operators
        case 'pow':
            chooseOperator('pow');
            break;

        // Constants
        case 'pi':
        case 'euler':
            if (operator === 'pow' && previousValue !== null) {
                // Don't interrupt a binary op
            }
            insertConstant(action);
            break;

        // Other
        case 'toggle-sign':
            toggleSign();
            break;
        case 'exp':
            enterEE();
            break;
        case 'angle-mode':
            toggleAngleMode(btn);
            break;
        case 'inv':
            toggleInvMode(btn);
            break;
        case 'paren-open':
        case 'paren-close':
            // Simple paren insertion — display-only, for basic expression entry
            // Actual paren evaluation would need expression parsing (complex)
            // For now, insert as text (nice display but won't auto-evaluate)
            if (shouldResetDisplay) {
                currentValue = action === 'paren-open' ? '(' : '';
                shouldResetDisplay = false;
            } else {
                currentValue += action === 'paren-open' ? '(' : ')';
            }
            updateDisplay();
            break;
    }
}

// ─── Event Delegation ──────────────────────────────────────

// Basic buttons
document.querySelector('.buttons').addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;

    // Ignore clicks on scientific buttons (handled separately)
    if (btn.closest('.sci-buttons')) return;

    if (btn.dataset.action === 'equals') {
        calculate();
    } else if (btn.dataset.action) {
        const action = btn.dataset.action;
        switch (action) {
            case 'clear': clearDisplay(); break;
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

// Scientific buttons
document.querySelector('.sci-buttons').addEventListener('click', (e) => {
    const btn = e.target.closest('.sci-btn');
    if (!btn) return;
    handleSciAction(btn.dataset.sciAction, btn);
});

// ─── Keyboard Support ──────────────────────────────────────

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
            clearDisplay();
            break;
        case 'Backspace':
            backspace();
            break;
        // Scientific keyboard shortcuts (when in scientific mode)
        case 's': if (scientificMode) applySciFunction('sin'); break;
        case 'o': if (scientificMode) applySciFunction('cos'); break;
        case 't': if (scientificMode) applySciFunction('tan'); break;
        case 'l': if (scientificMode) applySciFunction('log'); break;
        case 'n': if (scientificMode) applySciFunction('ln'); break;
        case 'r': if (scientificMode) applySciFunction('sqrt'); break;
        case 'q': if (scientificMode) applySciFunction('square'); break;
        case '^': if (scientificMode) chooseOperator('pow'); break;
        case 'p': if (scientificMode) insertConstant('pi'); break;
        case 'E': if (scientificMode) enterEE(); break;
    }
}

document.addEventListener('keydown', (e) => {
    handleKey(e.key);
});
