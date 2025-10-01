let historial = JSON.parse(localStorage.getItem('historialCalculadora')) || [];
        
// Referencias del DOM
const display = document.getElementById('display');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history-btn');

// Variables de estado de la calculadora
let valorActual = '0';
let operacionCompleta = '';
let operadorAnterior = null;
let valorAnterior = null;
let nuevaOperacion = true;

function actualizarDisplay() {
    if (operacionCompleta !== '') {
        display.value = operacionCompleta + ' ' + valorActual;
    } else {
        display.value = valorActual;
    }
}

function agregarNumero(num) {
    if (nuevaOperacion) {
        valorActual = num;
        nuevaOperacion = false;
    } else {
        if (valorActual === '0' && num !== '.') {
            valorActual = num;
        } else {
            if (num === '.' && valorActual.includes('.')) return;
            valorActual += num;
        }
    }
    actualizarDisplay();
}

function agregarOperador(op) {
    if (operadorAnterior !== null && !nuevaOperacion) {
        calcular();
    }
    valorAnterior = parseFloat(valorActual);
    operadorAnterior = op;
    
    let simbolo = op === '*' ? '×' : op === '/' ? '÷' : op;
    operacionCompleta = valorActual + ' ' + simbolo;
    nuevaOperacion = true;
    actualizarDisplay();
}

function calcular() {
    if (operadorAnterior === null || nuevaOperacion) return;
    
    const valorActualNum = parseFloat(valorActual);
    let resultado;
    
    let simboloDisplay = operadorAnterior === '*' ? '×' : operadorAnterior === '/' ? '÷' : operadorAnterior;
    let operacionTexto = `${valorAnterior} ${simboloDisplay} ${valorActual}`;

    switch(operadorAnterior) {
        case '+':
            resultado = valorAnterior + valorActualNum;
            break;
        case '-':
            resultado = valorAnterior - valorActualNum;
            break;
        case '*':
            resultado = valorAnterior * valorActualNum;
            break;
        case '/':
            if (valorActualNum === 0) {
                alert('Error: División por cero');
                limpiar();
                return;
            }
            resultado = valorAnterior / valorActualNum;
            break;
        default:
            return;
    }

    resultado = parseFloat(resultado.toFixed(10));

    agregarAlHistorial(operacionTexto, resultado);
    valorActual = resultado.toString();
    operacionCompleta = '';
    operadorAnterior = null;
    valorAnterior = null;
    nuevaOperacion = true;
    actualizarDisplay();
}

function limpiar() {
    valorActual = '0';
    operacionCompleta = '';
    operadorAnterior = null;
    valorAnterior = null;
    nuevaOperacion = true;
    actualizarDisplay();
}

function borrar() {
    if (valorActual.length > 1) {
        valorActual = valorActual.slice(0, -1);
    } else {
        valorActual = '0';
    }
    actualizarDisplay();
}

// uso de localstorage apra almacenar el historial aunque se cierre la pestaña

function agregarAlHistorial(operacion, resultado) {
    const item = {
        operacion: operacion,
        resultado: resultado,
        fecha: new Date().toLocaleString()
    };
    historial.unshift(item);
    localStorage.setItem('historialCalculadora', JSON.stringify(historial));
    mostrarHistorial();
}

function mostrarHistorial() {
    if (!historyList) return; 
    
    if (historial.length === 0) {
        historyList.innerHTML = '<li class="vacio">No hay operaciones aún</li>';
        return;
    }

    historyList.innerHTML = '';
    historial.forEach(item => {
        const li = document.createElement('li');
        li.className = 'item-historial';
        li.innerHTML = `
            <div class="operacion">${item.operacion} =</div>
            <div class="resultado-hist">${item.resultado}</div>
        `;
        historyList.appendChild(li);
    });
}

function confirmarEliminar() {
    historial = [];
    localStorage.removeItem('historialCalculadora');
    mostrarHistorial();
}

document.addEventListener('DOMContentLoaded', () => {
    const buttons = document.querySelectorAll('.buttons button');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const operation = button.dataset.operation;
            const action = button.dataset.action;
            const number = button.textContent.trim();

            if (operation === '=') {
                calcular();
            } else if (['+', '-', '*', '/'].includes(operation)) {
                agregarOperador(operation);
            } else if (action === 'clear-all') {
                limpiar();
            } else if (action === 'delete') {
                borrar();
            } else if (number >= '0' || number === '.') {
                agregarNumero(number);
            }
        });
    });

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', confirmarEliminar);
    }

    document.addEventListener('keydown', function(e) {
        if (e.key >= '0' && e.key <= '9') agregarNumero(e.key);
        if (e.key === '.') agregarNumero('.');
        if (e.key === '+') agregarOperador('+');
        if (e.key === '-') agregarOperador('-');
        if (e.key === '*') agregarOperador('*');
        if (e.key === '/') { e.preventDefault(); agregarOperador('/'); } // Prevenir scroll/otro
        if (e.key === 'Enter') { e.preventDefault(); calcular(); }
        if (e.key === 'Escape') limpiar();
        if (e.key === 'Backspace') borrar();
    });

    actualizarDisplay();
    mostrarHistorial();
});