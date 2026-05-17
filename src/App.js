import React, { useState, useEffect, useRef, useId } from 'react';
import './App.css';

/**
 * Una fila tipo «0 0 1 7 6 × 1 1» con puentes en ángulo recto (estilo app de referencia).
 */
function UTStepBridgeDiagram({ paddedLHS, num2Str, pairs }) {
  const uid = useId().replace(/:/g, '');
  const arrowId = `ut-arr-${uid}`;
  const lhs = paddedLHS.split('');
  const rhs = num2Str.split('');
  const lhsLen = lhs.length;
  const totalCells = lhsLen + 1 + rhs.length;
  const cellXPct = (cellIndex) => ((cellIndex + 0.5) / totalCells) * 100;

  return (
    <div className="ut-bridge-diagram">
      <div className="ut-bridge-svg-layer" aria-hidden>
        <svg
          className="ut-bridge-svg"
          viewBox="0 0 100 26"
          preserveAspectRatio="xMidYMin meet"
        >
          <defs>
            <marker
              id={arrowId}
              markerWidth="5"
              markerHeight="5"
              refX="2.5"
              refY="2.5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <path d="M0,0 L5,2.5 L0,5 Z" fill="#eaeaea" />
            </marker>
          </defs>
          {pairs.map((p, idx) => {
            const xi = cellXPct(p.lhsIdx);
            const xj = cellXPct(lhsLen + 1 + p.rhsIdx);
            const yTop = 3;
            const yBot = 23;
            const d = `M ${xj} ${yBot} L ${xj} ${yTop} L ${xi} ${yTop} L ${xi} ${yBot}`;
            return (
              <path
                key={`${p.lhsIdx}-${p.rhsIdx}-${idx}`}
                d={d}
                fill="none"
                stroke="#eaeaea"
                strokeWidth="0.65"
                strokeLinecap="round"
                strokeLinejoin="round"
                markerEnd={`url(#${arrowId})`}
              />
            );
          })}
        </svg>
      </div>
      {/* Una sola línea como en la app de referencia: 0 0 1 7 6 × 1 1; raya solo bajo el multiplicando */}
      <div className="ut-equation-ref" aria-label={`Multiplicación ${paddedLHS} por ${num2Str}`}>
        <div className="ut-equation-ref-lhs">
          <div className="ut-equation-ref-digits">
            {lhs.map((d, i) => (
              <span key={`l-${i}`} className="ut-eq-cell">
                {d}
              </span>
            ))}
          </div>
          <div className="ut-equation-ref-rule" />
        </div>
        <span className="ut-eq-op ut-equation-ref-op">×</span>
        <div className="ut-equation-ref-rhs">
          {rhs.map((d, i) => (
            <span key={`r-${i}`} className="ut-eq-cell">
              {d}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Compara respuesta escrita con el resultado (válido con o sin ceros a la izquierda). */
function multiplicationAnswerMatches(userInput, correctAnswer) {
  const t = String(userInput).trim();
  if (t === '') return false;
  const n = parseInt(t, 10);
  return Number.isFinite(n) && n === correctAnswer;
}

/**
 * Número natural y la misma cifra rellenada a la anchura del multiplicando en pantalla (p. ej. 1936 y 01936).
 */
function getProductAnswerVariants(num1, answer) {
  const num1Str = String(num1).padStart(5, '0');
  const w = num1Str.length;
  const plain = String(answer);
  const padded = plain.padStart(w, '0');
  return { plain, padded };
}

/** Misma anchura que el teclado UT: mínimo 5 cifras, o len(multiplicando)+len(multiplicador). */
function getUTMultiplicandWidth(num1Raw, num2Raw) {
  const s1 = String(num1Raw);
  const s2 = String(num2Raw);
  return Math.max(5, s1.length + s2.length);
}

function padUTMultiplicand(num1Raw, num2Raw) {
  return String(num1Raw).padStart(getUTMultiplicandWidth(num1Raw, num2Raw), '0');
}

function App() {
  const [screen, setScreen] = useState('main'); // 'main', 'difficulty', 'game', 'info', 'info-menu', 'solution', 'table-select', 'rule', 'trachtenberg-info', 'rules-1-12', 'rule-ut', 'mnemotecnia'
  const [currentRuleTable, setCurrentRuleTable] = useState(2); // Tabla actual en la pantalla de reglas
  const [gameMode, setGameMode] = useState(null); // 'ut', '1-12', null
  const [selectedTable, setSelectedTable] = useState(null); // Tabla seleccionada para 1-12
  const [utNumber1, setUtNumber1] = useState('123'); // Primer número en UT rules
  const [utNumber2, setUtNumber2] = useState('45'); // Segundo número en UT rules
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(false);
  const [question, setQuestion] = useState({ num1: 0, num2: 0, operator: '+', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [carryDots, setCarryDots] = useState({}); // Almacenar puntos de acarreo por posición: {0: 1, 1: 2} significa 1 punto en posición 0, 2 puntos en posición 1
  const [difficulty, setDifficulty] = useState('facil'); // facil, medio, dificil
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [totalMultiplications, setTotalMultiplications] = useState(5); // Total resuelto (persistente)
  const [solutionSteps, setSolutionSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [utArrowStep, setUtArrowStep] = useState(0); // Paso actual de las flechas en UT (0 = sin flechas)
  const solutionScreenEnteredRef = useRef(false); // Rastrear si acabamos de entrar a la pantalla de solución
  const sameExerciseTimerResetRef = useRef(false); // Evitar bucles al reiniciar tiempo en 0

  const operators = [
    { symbol: '+', name: 'Suma' },
    { symbol: '-', name: 'Resta' },
    { symbol: '×', name: 'Multiplicación' },
    { symbol: '÷', name: 'División' }
  ];

  const generateQuestion = () => {
    let num1, num2, answer;
    
    // Generar pregunta según el modo de juego
    if (gameMode === 'ut') {
      // Unit Tables: multiplicaciones según dificultad
      if (difficulty === 'facil') {
        // Easy: multiplicaciones por un número y por dos (1-2 dígitos)
        // Número de 1-2 dígitos (1-99)
        num1 = Math.floor(Math.random() * 99) + 1;
        // Multiplicador de 1-2 dígitos (1-99)
        num2 = Math.floor(Math.random() * 99) + 1;
      } else if (difficulty === 'medio') {
        // Medium: multiplicaciones de 2 o 3 dígitos
        // Número de 2-3 dígitos (10-999)
        num1 = Math.floor(Math.random() * 990) + 10;
        // Multiplicador de 2-3 dígitos (10-999)
        num2 = Math.floor(Math.random() * 990) + 10;
      } else {
        // Hard: multiplicaciones de 3, 4 y 5 dígitos
        // Número de 3-5 dígitos (100-99999)
        num1 = Math.floor(Math.random() * 99800) + 100;
        // Multiplicador de 3-5 dígitos (100-99999)
        num2 = Math.floor(Math.random() * 99800) + 100;
      }
      answer = num1 * num2;
      const newQuestion = { num1, num2, operator: '×', answer };
      setQuestion(newQuestion);
      // Generar pasos de solución después de actualizar la pregunta
      setTimeout(() => generateSolutionSteps(num1, num2), 0);
    } else if (gameMode === '1-12') {
      // Tablas del 1-12: multiplicaciones con la tabla seleccionada
      if (selectedTable) {
        num1 = selectedTable;
        num2 = Math.floor(Math.random() * 12) + 1;
      } else {
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
      }
      answer = num1 * num2;
      const newQuestion = { num1, num2, operator: '×', answer };
      setQuestion(newQuestion);
      // Generar pasos de solución para 1-12 también
      setTimeout(() => generateSolutionSteps(num1, num2), 0);
    } else {
      // Modo mixto (por defecto)
      const op = operators[Math.floor(Math.random() * operators.length)];
      
      switch (difficulty) {
        case 'facil':
          num1 = Math.floor(Math.random() * 20) + 1;
          num2 = Math.floor(Math.random() * 20) + 1;
          break;
        case 'medio':
          num1 = Math.floor(Math.random() * 50) + 1;
          num2 = Math.floor(Math.random() * 50) + 1;
          break;
        case 'dificil':
          num1 = Math.floor(Math.random() * 100) + 1;
          num2 = Math.floor(Math.random() * 100) + 1;
          break;
        default:
          num1 = Math.floor(Math.random() * 20) + 1;
          num2 = Math.floor(Math.random() * 20) + 1;
      }

      switch (op.symbol) {
        case '+':
          answer = num1 + num2;
          break;
        case '-':
          if (num1 < num2) [num1, num2] = [num2, num1];
          answer = num1 - num2;
          break;
        case '×':
          if (difficulty === 'facil') {
            num1 = Math.floor(Math.random() * 10) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
          }
          answer = num1 * num2;
          break;
        case '÷':
          num2 = Math.floor(Math.random() * 10) + 1;
          answer = Math.floor(Math.random() * 10) + 1;
          num1 = num2 * answer;
          break;
        default:
          answer = num1 + num2;
      }
      setQuestion({ num1, num2, operator: op.symbol, answer });
    }

    setUserAnswer('');
    setFeedback('');
  };

  const startGame = (mode = null) => {
    if (mode) {
      setGameMode(mode);
    }
    setScreen('game');
    setGameActive(true);
    setScore(0);
    setTimeLeft(60);
    setCorrectAnswers(0);
    setTotalQuestions(0);
    generateQuestion();
  };

  const stopGame = () => {
    // Solo permitir salir si no hay una respuesta incorrecta pendiente
    // Verificar si el feedback indica una respuesta incorrecta
    if (feedback.includes('Incorrecto')) {
      // No permitir salir si hay una respuesta incorrecta
      return;
    }
    setGameActive(false);
    setFeedback('');
    setScreen('main');
    setGameMode(null);
  };

  const handleGameModeSelect = (mode) => {
    if (mode === 'info') {
      setScreen('info-menu');
    } else if (mode === 'ut') {
      // Solo UT muestra la pantalla de selección de dificultad
      setGameMode(mode);
      setScreen('difficulty');
    } else if (mode === '1-12') {
      // 1-12 muestra la pantalla de selección de tablas
      setGameMode(mode);
      setScreen('table-select');
    }
  };

  const selectDifficulty = (selectedDifficulty) => {
    setDifficulty(selectedDifficulty);
    setScreen('game');
    startGame(gameMode);
  };

  const selectTable = (table) => {
    setSelectedTable(table);
    setScreen('game');
    startGame('1-12');
  };

  const reloadStats = () => {
    setTotalMultiplications(0);
  };

  // ========== FUNCIONES DE CÁLCULO TRACHTENBERG POR TABLA ==========
  
  // Calcular dígito usando regla de tabla 2: Duplicar el número
  const calculateTable2 = (digit, neighbor, position, totalDigits) => {
    return digit * 2;
  };

  // Calcular dígito usando regla de tabla 3
  const calculateTable3 = (digit, neighbor, position, totalDigits) => {
    if (position === totalDigits - 1) {
      // Primer dígito (más a la derecha)
      return 2 * (10 - digit) + 5 * (digit % 2);
    } else if (position === 0) {
      // Último dígito (más a la izquierda)
      return Math.floor(neighbor / 2) - 2;
    } else {
      // Dígitos medios
      return 2 * (9 - digit) + Math.floor(neighbor / 2) + 5 * (digit % 2);
    }
  };

  // Calcular dígito usando regla de tabla 4
  const calculateTable4 = (digit, neighbor, position, totalDigits) => {
    if (position === totalDigits - 1) {
      // Primer dígito
      return (10 - digit) + 5 * (digit % 2);
    } else if (position === 0) {
      // Último dígito
      return Math.floor(neighbor / 2) - 1;
    } else {
      // Dígitos medios
      return (9 - digit) + Math.floor(neighbor / 2) + 5 * (digit % 2);
    }
  };

  // Calcular dígito usando regla de tabla 5: Mitad del vecino + 5 si es impar
  const calculateTable5 = (digit, neighbor, position, totalDigits) => {
    return Math.floor(neighbor / 2) + 5 * (digit % 2);
  };

  // Calcular dígito usando regla de tabla 6: Número + mitad del vecino + 5 si es impar
  const calculateTable6 = (digit, neighbor, position, totalDigits) => {
    return digit + Math.floor(neighbor / 2) + 5 * (digit % 2);
  };

  // Calcular dígito usando regla de tabla 7: Doblar número + mitad del vecino + 5 si es impar
  const calculateTable7 = (digit, neighbor, position, totalDigits) => {
    return 2 * digit + Math.floor(neighbor / 2) + 5 * (digit % 2);
  };

  // Calcular dígito usando regla de tabla 8
  const calculateTable8 = (digit, neighbor, position, totalDigits) => {
    if (position === totalDigits - 1) {
      // Primer dígito
      return 2 * (10 - digit);
    } else if (position === 0) {
      // Último dígito
      return neighbor - 2;
    } else {
      // Dígitos medios
      return 2 * (9 - digit) + neighbor;
    }
  };

  // Calcular dígito usando regla de tabla 9
  const calculateTable9 = (digit, neighbor, position, totalDigits) => {
    if (position === totalDigits - 1) {
      // Primer dígito
      return 10 - digit;
    } else if (position === 0) {
      // Último dígito
      return neighbor - 1;
    } else {
      // Dígitos medios
      return (9 - digit) + neighbor;
    }
  };

  // Calcular dígito usando regla de tabla 11: Número + vecino
  const calculateTable11 = (digit, neighbor, position, totalDigits) => {
    return digit + neighbor;
  };

  // Calcular dígito usando regla de tabla 12: Doblar número + vecino
  const calculateTable12 = (digit, neighbor, position, totalDigits) => {
    return 2 * digit + neighbor;
  };

  // Obtener función de cálculo según la tabla
  const getTableCalculationFunction = (table) => {
    const functions = {
      2: calculateTable2,
      3: calculateTable3,
      4: calculateTable4,
      5: calculateTable5,
      6: calculateTable6,
      7: calculateTable7,
      8: calculateTable8,
      9: calculateTable9,
      11: calculateTable11,
      12: calculateTable12
    };
    return functions[table] || null;
  };

  // Generar explicación para tabla específica
  const generateTableExplanation = (table, digit, neighbor, position, totalDigits, result, carry) => {
    const explanations = [];
    
    switch (table) {
      case 2:
        explanations.push(`${digit} times 2 is ${String(digit * 2).padStart(2, '0')}`);
        break;
      case 3:
        if (position === totalDigits - 1) {
          explanations.push(`2 times (10 minus ${digit})${digit % 2 === 1 ? ' plus 5' : ''} equals ${result}`);
        } else if (position === 0) {
          explanations.push(`half of ${neighbor} minus 2 equals ${result}`);
        } else {
          explanations.push(`2 times (9 minus ${digit}) plus half ${neighbor}${digit % 2 === 1 ? ' plus 5' : ''} equals ${result}`);
        }
        break;
      case 4:
        if (position === totalDigits - 1) {
          explanations.push(`10 minus ${digit}${digit % 2 === 1 ? ' plus 5' : ''} equals ${result}`);
        } else if (position === 0) {
          explanations.push(`half of ${neighbor} minus 1 equals ${result}`);
        } else {
          explanations.push(`9 minus ${digit} plus half ${neighbor}${digit % 2 === 1 ? ' plus 5' : ''} equals ${result}`);
        }
        break;
      case 5:
        explanations.push(`half ${neighbor}${digit % 2 === 1 ? ' plus 5' : ''} equals ${result}`);
        break;
      case 6:
        explanations.push(`${digit} plus half ${neighbor}${digit % 2 === 1 ? ' plus 5' : ''} equals ${result}`);
        break;
      case 7:
        explanations.push(`2 times ${digit} plus half ${neighbor}${digit % 2 === 1 ? ' plus 5' : ''} equals ${result}`);
        break;
      case 8:
        if (position === totalDigits - 1) {
          explanations.push(`2 times (10 minus ${digit}) equals ${result}`);
        } else if (position === 0) {
          explanations.push(`${neighbor} minus 2 equals ${result}`);
        } else {
          explanations.push(`2 times (9 minus ${digit}) plus ${neighbor} equals ${result}`);
        }
        break;
      case 9:
        if (position === totalDigits - 1) {
          explanations.push(`10 minus ${digit} equals ${result}`);
        } else if (position === 0) {
          explanations.push(`${neighbor} minus 1 equals ${result}`);
        } else {
          explanations.push(`(9 minus ${digit}) plus ${neighbor} equals ${result}`);
        }
        break;
      case 11:
        explanations.push(`${digit} plus ${neighbor} equals ${result}`);
        break;
      case 12:
        explanations.push(`(2 times ${digit}) plus ${neighbor} equals ${result}`);
        break;
    }
    
    if (carry > 0) {
      explanations.push(`Add carried ${carry}`);
    }
    
    return explanations;
  };

  // Método UT preciso (basado en prod_plotter del Python)
  const calculateUTStep = (num1Str, num2Str, stepIndex) => {
    const LHS = padUTMultiplicand(num1Str, num2Str);
    const RHS = num2Str;
    const answer = (parseInt(num1Str) * parseInt(num2Str)).toString().padStart(LHS.length, '0');
    
    const res = [];
    const calculations = [];
    
    // Calcular para cada dígito del multiplicador
    for (let i = 0; i < RHS.length; i++) {
      const rhsIdx = RHS.length - i - 1;
      const lhsIdx = stepIndex + i;
      
      if (lhsIdx >= LHS.length) break;
      
      const mult1 = String(parseInt(LHS[lhsIdx]) * parseInt(RHS[rhsIdx])).padStart(2, '0');
      res.push(parseInt(mult1[1]));
      calculations.push({
        text: `${LHS[lhsIdx]} por ${RHS[rhsIdx]} es ${mult1[0]}[u]${mult1[1]}[/u]`,
        product: parseInt(mult1),
        underlined: mult1[1],
        hint: 'Para este producto usamos la cifra de la derecha (unidades).'
      });
      
      if (lhsIdx + 1 < LHS.length) {
        const mult2 = String(parseInt(LHS[lhsIdx + 1]) * parseInt(RHS[rhsIdx])).padStart(2, '0');
        res.push(parseInt(mult2[0]));
        calculations.push({
          text: `${LHS[lhsIdx + 1]} por ${RHS[rhsIdx]} es [u]${mult2[0]}[/u]${mult2[1]}`,
          product: parseInt(mult2),
          underlined: mult2[0],
          hint: 'Para este producto usamos la cifra de la izquierda (decenas).'
        });
      }
    }
    
    const sum = res.reduce((a, b) => a + b, 0);
    const carryFromPartial = sum >= 10 ? Math.floor(sum / 10) : 0;

    if (carryFromPartial > 0 && sum % 10 !== parseInt(answer[stepIndex])) {
      const adjustedCarry = (parseInt(answer[stepIndex]) - sum % 10 + 10) % 10;
      if (adjustedCarry > 0) {
        calculations.push({
          text: `Agregar [u]${adjustedCarry}[/u] llevado`,
          product: adjustedCarry,
          underlined: String(adjustedCarry),
          hint: 'Lo que arrastramos de la columna anterior.'
        });
        res.push(adjustedCarry);
      }
    }
    
    const finalSum = res.reduce((a, b) => a + b, 0);
    const finalSumStr = String(finalSum);
    const sumPrefix = '';
    const sumLine =
      sumPrefix +
      res.join(' + ') +
      ' = ' +
      (finalSumStr.length > 1 ? `${finalSumStr[0]}[u]${finalSumStr[1]}[/u]` : `[u]${finalSumStr}[/u]`);
    
    return {
      calculations,
      resultDigit: parseInt(answer[stepIndex]),
      carry: Math.floor(finalSum / 10),
      sumText: sumLine,
      sumHint:
        res.length > 1
          ? 'El dígito subrayado del total es la cifra del resultado en esta columna; lo de más a la izquierda es el arrastre.'
          : 'Esta cifra es el dígito del resultado en esta columna.'
    };
  };

  // Pares (cifra superior × cifra del multiplicador) para un paso UT — misma lógica que calculateUTStep
  const getUTMultiplyPairsForStep = (num1Raw, num2Raw, stepIndex) => {
    const n1 = num1Raw.toString();
    const n2 = num2Raw.toString();
    const LHS = padUTMultiplicand(n1, n2);
    const RHS = n2;
    const pairs = [];
    for (let i = 0; i < RHS.length; i++) {
      const rhsIdx = RHS.length - i - 1;
      const lhsIdx = stepIndex + i;
      if (lhsIdx >= LHS.length) break;
      pairs.push({
        lhsIdx,
        rhsIdx,
        lhsDigit: LHS[lhsIdx],
        rhsDigit: RHS[rhsIdx]
      });
      if (lhsIdx + 1 < LHS.length) {
        pairs.push({
          lhsIdx: lhsIdx + 1,
          rhsIdx,
          lhsDigit: LHS[lhsIdx + 1],
          rhsDigit: RHS[rhsIdx]
        });
      }
    }
    return { paddedLHS: LHS, pairs };
  };

  // Generar pasos de solución usando método Trachtenberg
  const generateSolutionSteps = (num1, num2) => {
    const steps = [];
    const num1Str = num1.toString();
    const num2Str = num2.toString();
    
    // Si estamos en modo 1-12 y tenemos una tabla seleccionada
    if (gameMode === '1-12' && selectedTable) {
      const tableFunc = getTableCalculationFunction(selectedTable);
      if (tableFunc) {
        // Preparar número con ceros iniciales
        const paddedNum1 = num1Str.padStart(num1Str.length + 1, '0');
        const digits = paddedNum1.split('').reverse().map(Number);
        const result = [];
        let carry = 0;
        
        // Calcular de derecha a izquierda
        for (let i = 0; i < digits.length; i++) {
          const digit = digits[i];
          const neighbor = i < digits.length - 1 ? digits[i + 1] : 0;
          const position = digits.length - 1 - i;
          
          // Calcular usando la función específica de la tabla
          let tempResult = tableFunc(digit, neighbor, position, digits.length);
          tempResult += carry;
          
          const resultDigit = tempResult % 10;
          const newCarry = Math.floor(tempResult / 10);
          
          // Generar explicación
          const explanations = generateTableExplanation(
            selectedTable, 
            digit, 
            neighbor, 
            position, 
            digits.length, 
            tempResult - carry, 
            carry
          );
          
          const stepCalculations = explanations.map(exp => ({
            text: exp,
            product: tempResult,
            underlined: String(resultDigit)
          }));
          
          // Construir resultado parcial
          const partialResult = [];
          for (let j = digits.length - 1; j >= 0; j--) {
            if (j > i) {
              partialResult.push(0);
            } else if (j === i) {
              partialResult.push(resultDigit);
            } else {
              partialResult.push(result[digits.length - 1 - j]);
            }
          }
          
          // Texto de suma
          const sumParts = [tempResult - carry];
          if (carry > 0) sumParts.push(carry);
          const sum = sumParts.reduce((a, b) => a + b, 0);
          const sumStr = String(sum);
          const sumText = sumParts.join('+') + ' = ' + 
            (sumStr.length > 1 ? `${sumStr[0]}[u]${sumStr[1]}[/u]` : `[u]${sumStr}[/u]`);
          
          steps.push({
            stepNumber: i + 1,
            multiplier: selectedTable,
            calculations: stepCalculations,
            sumText: sumText,
            partialResult: partialResult,
            currentDigit: resultDigit,
            carry: newCarry
          });
          
          result.push(resultDigit);
          carry = newCarry;
        }
        
        // Si queda acarreo al final
        if (carry > 0) {
          const finalResult = [...result, carry].reverse();
          steps.push({
            stepNumber: steps.length + 1,
            calculations: [{
              text: `Add carried ${carry}`,
              product: carry
            }],
            partialResult: finalResult,
            carry: 0
          });
        }
      }
    } else if (gameMode === 'ut') {
      // Método UT preciso
      const RHS = num2Str;
      const paddedLHS = padUTMultiplicand(num1Str, RHS);
      const answer = (num1 * num2).toString().padStart(paddedLHS.length, '0');
      
      // Calcular cada dígito del resultado (de derecha a izquierda)
      for (let stepIdx = paddedLHS.length - 1; stepIdx >= 0; stepIdx--) {
        const utStep = calculateUTStep(num1Str, RHS, stepIdx);
        
        // Construir resultado parcial
        const partialResult = [];
        for (let j = 0; j < paddedLHS.length; j++) {
          if (j < stepIdx) {
            partialResult.push(0);
          } else if (j === stepIdx) {
            partialResult.push(utStep.resultDigit);
          } else {
            partialResult.push(parseInt(answer[j], 10));
          }
        }
        // Orden izquierda→derecha: columna j alinea con cifra j del multiplicando y del resultado

        steps.push({
          stepNumber: paddedLHS.length - stepIdx,
          utColumnIndex: stepIdx, // índice de columna desde la izquierda (0 = primera cifra del relleno)
          multiplier: parseInt(RHS),
          calculations: utStep.calculations,
          sumText: utStep.sumText,
          sumHint: utStep.sumHint,
          partialResult: partialResult,
          currentDigit: utStep.resultDigit,
          carry: utStep.carry
        });
      }
      // Orden en pantalla: índice 0 = Paso 1 (cifra de las unidades, columna derecha del relleno),
      // luego Paso 2, … hasta la última cifra a la izquierda. No usar reverse(): el bucle ya va de derecha a izquierda.
    } else {
      // Método simple (fallback)
      const num1StrPadded = num1Str.padStart(5, '0');
      const digits1 = num1StrPadded.split('').reverse().map(Number);
      const digits2 = num2Str.split('').reverse().map(Number);
      
      if (digits2.length === 1) {
        const multiplier = digits2[0];
        const result = [];
        let carry = 0;
        
        for (let i = 0; i < digits1.length; i++) {
          const digit = digits1[i];
          const product = digit * multiplier + carry;
          const resultDigit = product % 10;
          const newCarry = Math.floor(product / 10);
          
          const stepCalculations = [{
            text: `${digit} times ${multiplier} is ${String(product).padStart(2, '0')}`,
            product: product,
            underlined: String(product).padStart(2, '0')
          }];
          
          if (newCarry > 0 && i < digits1.length - 1) {
            stepCalculations.push({
              text: `Add carried ${newCarry}`,
              product: newCarry,
              underlined: String(newCarry)
            });
          }
          
          const partialResult = [];
          for (let j = digits1.length - 1; j >= 0; j--) {
            if (j > i) {
              partialResult.push(0);
            } else if (j === i) {
              partialResult.push(resultDigit);
            } else {
              partialResult.push(result[digits1.length - 1 - j]);
            }
          }
          
          const sumText = newCarry > 0 && i < digits1.length - 1 
            ? `${resultDigit}+${newCarry} = ${resultDigit + newCarry}`
            : `${resultDigit} = ${resultDigit}`;
          
          steps.push({
            stepNumber: i + 1,
            multiplier: multiplier,
            calculations: stepCalculations,
            sumText: sumText,
            partialResult: partialResult,
            currentDigit: resultDigit,
            carry: newCarry
          });
          
          result.push(resultDigit);
          carry = newCarry;
        }
        
        if (carry > 0) {
          const finalResult = [...result, carry].reverse();
          steps.push({
            stepNumber: steps.length + 1,
            calculations: [{
              text: `Add carried ${carry}`,
              product: carry
            }],
            partialResult: finalResult,
            carry: 0
          });
        }
      }
    }
    
    // Calcular resultado final
    const finalResult = (num1 * num2).toString();
    // En UT el resultado se alinea al mismo ancho que el multiplicando rellenado (p. ej. 435 → "00435")
    const finalResultForUtColumns =
      gameMode === 'ut'
        ? finalResult.padStart(getUTMultiplicandWidth(num1Str, num2Str), '0')
        : finalResult;

    // Asegurar que el último paso tenga el resultado completo
    if (steps.length > 0) {
      const lastStep = steps[steps.length - 1];
      lastStep.finalResult = finalResult;
      const compareJoin = gameMode === 'ut' ? finalResultForUtColumns : finalResult;
      if (!lastStep.partialResult || lastStep.partialResult.join('') !== compareJoin) {
        lastStep.partialResult = compareJoin.split('').map(Number);
      }
    }

    setSolutionSteps(steps);
    setCurrentStep(0);
  };

  const handleKeypadInput = (value) => {
    if (value === 'CE') {
      setUserAnswer('');
      setCarryDots({});
    } else if (value === '←') {
      // Eliminar el primer dígito (el más a la izquierda en la cadena)
      setUserAnswer(prev => {
        const newAnswer = prev.slice(1);
        // Eliminar el punto de acarreo de la posición que se eliminó
        if (prev.length > 0) {
          const positionToRemove = prev.length - 1;
          setCarryDots(prev => {
            const newCarryDots = { ...prev };
            delete newCarryDots[positionToRemove];
            // Ajustar las posiciones de los puntos restantes
            const adjusted = {};
            Object.keys(newCarryDots).forEach(pos => {
              const posNum = parseInt(pos);
              if (posNum > positionToRemove) {
                adjusted[posNum - 1] = newCarryDots[pos];
              } else {
                adjusted[posNum] = newCarryDots[pos];
              }
            });
            return adjusted;
          });
        }
        return newAnswer;
      });
    } else if (value === '→') {
      checkAnswer();
    } else if (value === '.') {
      // Agregar un punto de acarreo en la posición del último dígito escrito
      // La posición es desde la derecha (0 = último dígito, 1 = penúltimo, etc.)
      if (userAnswer.length > 0) {
        const position = userAnswer.length - 1; // Posición desde la derecha
        setCarryDots(prev => {
          const currentCarry = prev[position] || 0;
          // Máximo 3 puntos por posición (acarreo máximo de 3)
          const newCarry = Math.min(currentCarry + 1, 3);
          return { ...prev, [position]: newCarry };
        });
      }
      return;
    } else {
      // Agregar dígitos al PRINCIPIO de la cadena para que visualmente
      // el último dígito escrito siempre esté alineado con el último dígito del multiplicando
      // Ejemplo: escribes "9" -> userAnswer = "9" (se muestra con espacios a la izquierda)
      //          escribes "3" -> userAnswer = "39" (el "3" aparece a la izquierda del "9")
      const num1Str = question.num1.toString().padStart(5, '0');
      const maxDigits = num1Str.length;
      // Limitar el número de dígitos al número de dígitos del multiplicando
      setUserAnswer(prev => {
        if (prev.length >= maxDigits) {
          return prev; // No permitir más dígitos
        }
        return value + prev; // Agregar al principio
      });
    }
  };

  const showSolution = () => {
    // Asegurar que siempre comience desde el paso 1 (índice 0)
    // Resetear inmediatamente y de forma síncrona
    setCurrentStep(0);
    // Resetear la referencia para que el useEffect detecte que acabamos de entrar
    solutionScreenEnteredRef.current = false;
    // Usar setTimeout para asegurar que el estado se actualice antes de cambiar la pantalla
    setTimeout(() => {
      setScreen('solution');
    }, 0);
  };

  const showRule = () => {
    setScreen('rule');
  };

  const showMnemotecnia = () => {
    setScreen('mnemotecnia');
  };

  // Función para obtener palabras mnemotécnicas
  const getMnemotecniaWord = (num) => {
    const mnemotecniaData = {
      0: { objeto: 'aro', accion: 'ara' },
      1: { objeto: 'té', accion: 'excita' },
      2: { objeto: 'huña', accion: 'garra' },
      3: { objeto: 'humo', accion: 'tose' },
      4: { objeto: 'k.o', accion: 'noquea' },
      5: { objeto: 'ala', accion: 'vuela' },
      6: { objeto: 'oso', accion: 'gruñe' },
      7: { objeto: 'avión', accion: 'vuela' },
      8: { objeto: 'hacha', accion: 'corta' },
      9: { objeto: 'boa', accion: 'muerde' },
      10: { objeto: 'toro', accion: 'enviste' },
      11: { objeto: 'dedo', accion: 'señala' },
      12: { objeto: 'tuna', accion: 'pincha' },
      13: { objeto: 'dama', accion: 'encoje' },
      14: { objeto: 'dique', accion: 'soporta' },
      15: { objeto: 'duelo', accion: 'mata' },
      16: { objeto: 'tiza', accion: 'empolva' },
      17: { objeto: 'teja', accion: 'cubre' },
      18: { objeto: 'ducha', accion: 'moja' },
      19: { objeto: 'topo', accion: 'cava' },
      20: { objeto: 'noria', accion: 'da vueltas' },
      21: { objeto: 'nata', accion: 'decora' },
      22: { objeto: 'niño', accion: 'chupa piruleta' },
      23: { objeto: 'gnomo', accion: 'sombrero verde' },
      24: { objeto: 'anca', accion: 'salta' },
      25: { objeto: 'nilo', accion: 'navega' },
      26: { objeto: 'anís', accion: 'emborracha' },
      27: { objeto: 'hinojo', accion: 'enoja' },
      28: { objeto: 'hongo', accion: 'multiplica' },
      29: { objeto: 'naipe', accion: 'mezcla' },
      30: { objeto: 'muro', accion: 'delimita' },
      31: { objeto: 'mate', accion: 'chupa' },
      32: { objeto: 'mano', accion: 'Hi-5' },
      33: { objeto: 'momia', accion: 'anda a tumbos' },
      34: { objeto: 'moco', accion: 'estornuda' },
      35: { objeto: 'miel', accion: 'pegajosa' },
      36: { objeto: 'mesa', accion: 'apoyo' },
      37: { objeto: 'mafia', accion: 'fuma' },
      38: { objeto: 'macho', accion: 'alfa' },
      39: { objeto: 'mopa', accion: 'barre' },
      40: { objeto: 'coro', accion: 'canta' },
      41: { objeto: 'codo', accion: 'clava' },
      42: { objeto: 'cuna', accion: 'hamaca' },
      43: { objeto: 'cama', accion: 'duerme' },
      44: { objeto: 'coco', accion: 'cae' },
      45: { objeto: 'cola', accion: 'caga' },
      46: { objeto: 'casa', accion: 'revive' },
      47: { objeto: 'cojo', accion: 'cojea' },
      48: { objeto: 'coche', accion: 'corre' },
      49: { objeto: 'copa', accion: 'invoca' },
      50: { objeto: 'loro', accion: 'enjaulado' },
      51: { objeto: 'lata', accion: 'molesta' },
      52: { objeto: 'lana', accion: 'abriga' },
      53: { objeto: 'lima', accion: 'desgasta' },
      54: { objeto: 'laca', accion: 'endurece' },
      55: { objeto: 'lila', accion: 'florece' },
      56: { objeto: 'luz', accion: 'alumbra' },
      57: { objeto: 'alf', accion: 'está en el espacio' },
      58: { objeto: 'lego', accion: 'construye' },
      59: { objeto: 'lobo', accion: 'aúlla' },
      60: { objeto: 'zorro', accion: 'usa antifaz' },
      61: { objeto: 'soda', accion: 'burbujea' },
      62: { objeto: 'asno', accion: 'carga' },
      63: { objeto: 'sumo', accion: 'lucha' },
      64: { objeto: 'saco', accion: 'guarda' },
      65: { objeto: 'sal', accion: 'da sed' },
      66: { objeto: 'huesos', accion: 'lamer' },
      67: { objeto: 'sofá', accion: 'sienta' },
      68: { objeto: 'soga', accion: 'ata' },
      69: { objeto: 'sopa', accion: 'toma en cucharas' },
      70: { objeto: 'faro', accion: 'guía' },
      71: { objeto: 'foto', accion: 'enmarca' },
      72: { objeto: 'faena', accion: 'trabajo' },
      73: { objeto: 'fama', accion: 'estrella' },
      74: { objeto: 'foca', accion: 'aplaude' },
      75: { objeto: 'fila', accion: 'espera' },
      76: { objeto: 'juez', accion: 'martilla' },
      77: { objeto: 'faja', accion: 'aprieta' },
      78: { objeto: 'fuego', accion: 'quema' },
      79: { objeto: 'japo', accion: 'lucha con espadas' },
      80: { objeto: 'gorro', accion: 'tapa cabeza' },
      81: { objeto: 'gato', accion: 'hace miau' },
      82: { objeto: 'genio', accion: 'levita' },
      83: { objeto: 'goma', accion: 'lanza' },
      84: { objeto: 'chica', accion: 'seduce' },
      85: { objeto: 'gol', accion: 'meter' },
      86: { objeto: 'chus', accion: 'enfada' },
      87: { objeto: 'gofio', accion: 'atraganta' },
      88: { objeto: 'gaga', accion: 'baila' },
      89: { objeto: 'chavo', accion: 'llora' },
      90: { objeto: 'barro', accion: 'ensucia' },
      91: { objeto: 'bota', accion: 'en pies' },
      92: { objeto: 'vino', accion: 'catar' },
      93: { objeto: 'pomo', accion: 'cierra' },
      94: { objeto: 'boca', accion: 'habla' },
      95: { objeto: 'bola', accion: 'desinfla' },
      96: { objeto: 'vaso', accion: 'bebe' },
      97: { objeto: 'abeja', accion: 'zumba' },
      98: { objeto: 'bicho', accion: 'aplasta' },
      99: { objeto: 'pipa', accion: 'cruje' }
    };
    return mnemotecniaData[num] || null;
  };

  // Función para obtener sugerencias mnemotécnicas basadas en los dígitos escritos
  const getMnemotecniaSuggestions = (answer) => {
    if (!answer || answer.length === 0) return { recent: [], all: [] };
    
    const answerStr = answer.toString();
    const recent = [];
    const all = [];
    
    // Obtener el último dígito (más reciente)
    const lastDigit = parseInt(answerStr[answerStr.length - 1]);
    const lastWord = getMnemotecniaWord(lastDigit);
    if (lastWord) {
      recent.push({
        type: 'single',
        number: lastDigit,
        objeto: lastWord.objeto,
        accion: lastWord.accion
      });
    }
    
    // Solo 2 sugerencias de 2 dígitos, sin la del medio:
    // - 4 dígitos (5452): primera (54) y última (52); no la del medio (45).
    // - 5 dígitos (65455): posiciones (1,2) y (3,4) → 54 y 55; no 65 ni 45.
    if (answerStr.length >= 2) {
      const addPair = (i) => {
        const pair = parseInt(answerStr[i] + answerStr[i + 1]);
        const pairWord = getMnemotecniaWord(pair);
        if (pairWord) {
          recent.push({
            type: 'pair',
            number: pair,
            objeto: pairWord.objeto,
            accion: pairWord.accion
          });
        }
      };
      const K = answerStr.length - 1; // número de parejas
      if (answerStr.length === 4) {
        addPair(0); addPair(2); // 54 y 52 en 5452; se excluye 45
      } else if (answerStr.length === 5) {
        addPair(1); addPair(3); // 54 y 55 en 65455; se excluyen 65 y 45
      } else if (K <= 2) {
        for (let i = 0; i < K; i++) addPair(i);
      } else {
        addPair(0); addPair(K - 1); // primera y última pareja
      }
    }
    
    // Obtener palabras para todos los dígitos escritos (de izquierda a derecha)
    for (let i = 0; i < answerStr.length; i++) {
      const digit = parseInt(answerStr[i]);
      const word = getMnemotecniaWord(digit);
      if (word) {
        all.push({
          number: digit,
          objeto: word.objeto,
          accion: word.accion
        });
      }
    }
    
    return { recent, all };
  };

  const nextStep = () => {
    if (currentStep < solutionSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Función para parsear texto con markup [u]...[/u] y renderizarlo
  const parseMarkupText = (text) => {
    const parts = [];
    let currentIndex = 0;
    const regex = /\[u\](.*?)\[\/u\]/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      // Agregar texto antes del markup
      if (match.index > lastIndex) {
        parts.push({
          text: text.substring(lastIndex, match.index),
          underlined: false
        });
      }
      // Agregar texto subrayado
      parts.push({
        text: match[1],
        underlined: true
      });
      lastIndex = regex.lastIndex;
    }

    // Agregar texto restante después del último markup
    if (lastIndex < text.length) {
      parts.push({
        text: text.substring(lastIndex),
        underlined: false
      });
    }

    // Si no hay markup, devolver el texto completo
    if (parts.length === 0) {
      parts.push({
        text: text,
        underlined: false
      });
    }

    return parts;
  };

  const checkAnswer = () => {
    if (!gameActive || userAnswer === '') return;

    if (multiplicationAnswerMatches(userAnswer, question.answer)) {
      setTotalQuestions(totalQuestions + 1);
      setScore(score + 10);
      setCorrectAnswers(correctAnswers + 1);
      setTotalMultiplications(totalMultiplications + 1);
      sameExerciseTimerResetRef.current = false;
      setFeedback('¡Correcto! +10 puntos');
      // Limpiar respuesta inmediatamente
      setUserAnswer('');
      setCarryDots({}); // Limpiar puntos de acarreo
      setTimeout(() => {
        setTimeLeft(60);
        generateQuestion();
        setFeedback('');
      }, 1000);
    } else {
      // Si la respuesta es incorrecta, mostrar el mensaje pero NO avanzar
      // El usuario debe corregir la respuesta antes de poder continuar
      // NO incrementar totalQuestions hasta que sea correcta
      const { plain, padded } = getProductAnswerVariants(question.num1, question.answer);
      const dual =
        question.operator === '×' && plain !== padded
          ? ` (${plain} o ${padded}; ambas formas son correctas)`
          : '';
      setFeedback(`Incorrecto. La respuesta correcta es ${plain}${dual}. Intenta de nuevo.`);
      // NO limpiar la respuesta para que el usuario pueda corregirla
      // NO generar una nueva pregunta
      // NO permitir volver al menú hasta que sea correcta
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && gameActive) {
      checkAnswer();
    }
  };

  useEffect(() => {
    // No ejecutar el timer si estamos en la pantalla de mnemotecnia
    if (screen === 'mnemotecnia') {
      return;
    }

    if (gameActive && timeLeft > 0) {
      sameExerciseTimerResetRef.current = false;
      const timer = setTimeout(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // El ejercicio no cambia hasta respuesta correcta: no cerrar la partida al llegar a 0.
    // Se reinicia el cronómetro para seguir con la misma multiplicación.
    if (timeLeft === 0 && gameActive && !sameExerciseTimerResetRef.current) {
      sameExerciseTimerResetRef.current = true;
      setTimeLeft(60);
      setFeedback((f) => {
        if (f && f.includes('Incorrecto')) {
          return f;
        }
        return 'Tiempo agotado; cronómetro reiniciado. El mismo ejercicio sigue hasta que respondas bien.';
      });
    }
  }, [gameActive, timeLeft, screen]);

  // Asegurar que siempre comience desde el paso 1 cuando se muestra la solución
  useEffect(() => {
    if (screen === 'solution') {
      // SIEMPRE resetear a 0 cuando se entra a la pantalla de solución
      // Usar función de actualización para forzar el reseteo
      setCurrentStep(() => 0);
      solutionScreenEnteredRef.current = true;
    } else {
      // Resetear la referencia cuando salimos de la pantalla de solución
      solutionScreenEnteredRef.current = false;
    }
  }, [screen]);

  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  // Pantalla principal con menú
  if (screen === 'main') {
    return (
      <div className="App">
        <div className="container main-container">
          <div className="stats-section">
            <div className="total-multiplications">
              <div className="total-label">Total multiplicaciones resueltas</div>
              <div className="total-value">{totalMultiplications}</div>
            </div>
            <button className="reload-button" onClick={reloadStats}>
              RECARGAR
            </button>
          </div>

          <div className="game-mode-section">
            <h2 className="game-mode-title">Modo de Juego</h2>
            <div className="game-mode-buttons">
              <button 
                className="game-mode-btn" 
                onClick={() => handleGameModeSelect('ut')}
              >
                UT
              </button>
              <button 
                className="game-mode-btn" 
                onClick={() => handleGameModeSelect('1-12')}
              >
                1-12
              </button>
              <button 
                className="game-mode-btn info-btn" 
                onClick={() => handleGameModeSelect('info')}
              >
                Info
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de menú de información
  if (screen === 'info-menu') {
    return (
      <div className="App">
        <div className="container info-menu-container">
          <button className="back-top-button" onClick={() => setScreen('main')}>
            Atrás
          </button>
          <h2 className="info-menu-title">Info & Rules</h2>
          <div className="info-menu-options">
            <button 
              className="info-menu-btn"
              onClick={() => setScreen('trachtenberg-info')}
            >
              Trachtenberg
            </button>
            <button 
              className="info-menu-btn"
              onClick={() => {
                setCurrentRuleTable(2);
                setScreen('rules-1-12');
              }}
            >
              Rules [1-12]
            </button>
            <button 
              className="info-menu-btn"
              onClick={() => setScreen('rule-ut')}
            >
              Rule UT
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de información sobre Trachtenberg
  if (screen === 'trachtenberg-info') {
    return (
      <div className="App">
        <div className="container trachtenberg-info-container">
          <button className="back-top-button" onClick={() => setScreen('info-menu')}>
            Atrás
          </button>
          <h1 className="trachtenberg-info-title">El Método Trachtenberg</h1>
          <div className="trachtenberg-info-content">
            <section className="info-section">
              <h2>¿Qué es el método Trachtenberg?</h2>
              <p>
                El método Trachtenberg es una forma de multiplicación que optimiza la velocidad 
                asignando la menor cantidad posible de números temporales que deben mantenerse 
                en memoria. Fue desarrollado por Jakow Trachtenberg para mantener su mente ocupada 
                mientras estaba en un campo de concentración nazi.
              </p>
            </section>

            <section className="info-section">
              <h2>Convenciones</h2>
              <p>
                El sistema Trachtenberg siempre comienza en el dígito más a la derecha y procede 
                a moverse hacia la izquierda. 'El dígito actual' a menudo se denomina 'el número' 
                mientras que el número a su derecha se denomina su 'vecino'.
              </p>
              <p>
                Una de las características del sistema Trachtenberg es que nunca tienes que llevar 
                más de un 2 y debido a esto, cualquier acarreo se representa simplemente con un punto 
                en el sistema Trachtenberg - ver la figura a continuación:
              </p>
            </section>

            <section className="info-section">
              <div className="math-example">
                <div className="math-line">
                  <span className="math-digit">0</span>
                  <span className="math-digit">0</span>
                  <span className="math-digit">5</span>
                  <span className="math-digit">5</span>
                  <span className="math-digit">5</span>
                  <span className="math-digit">5</span>
                  <span className="math-operator">×</span>
                  <span className="math-digit">1</span>
                  <span className="math-digit">1</span>
                </div>
                <div className="math-divider-container">
                  <div className="math-divider-line"></div>
                </div>
                <div className="math-result-line">
                  <span className="math-digit">0</span>
                  <span className="math-digit-with-dot">
                    <span className="math-digit">6</span>
                    <span className="math-dot-superscript">.</span>
                  </span>
                  <span className="math-digit-with-dot">
                    <span className="math-digit">1</span>
                    <span className="math-dot-superscript">.</span>
                  </span>
                  <span className="math-digit-with-dot">
                    <span className="math-digit">1</span>
                    <span className="math-dot-superscript">.</span>
                  </span>
                  <span className="math-digit">0</span>
                  <span className="math-digit">5</span>
                </div>
              </div>
            </section>

            <section className="info-section">
              <p>
                Nota que la regla para multiplicar por 11 es <strong>toma el número y suma el vecino</strong>; 
                Por ejemplo: el primer número arriba es 5 + 0 = 5, el siguiente es 5 + 5 = <span className="underlined">10</span> con 
                el dígito de las decenas siendo un acarreo (el punto), el siguiente es 5 + 5 = 10 y luego más el acarreo = <span className="underlined">11</span> con 
                el dígito de las decenas siendo un acarreo (el punto), y así sucesivamente...
              </p>
            </section>

            <section className="info-section">
              <h2>Más Material</h2>
              <p>
                Si estás buscando más material sobre el método Trachtenberg, entonces recomiendo 
                altamente el libro <em>'El Sistema de Velocidad Trachtenberg de Matemáticas'</em> de 
                Ann Cutler y Rudolph McShane. Es un libro profundo y fácil de seguir sobre todo 
                el sistema Trachtenberg.
              </p>
            </section>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de reglas para 1-12
  if (screen === 'rules-1-12') {
    const tables = [2, 3, 4, 5, 6, 7, 8, 9, 11, 12];
    const currentIndex = tables.indexOf(currentRuleTable);
    
    const getRulesForTable = (table) => {
      const rules = {
        2: ["Regla - Duplica el número"],
        3: [
          "Regla 1.) - Primer dígito: resta de 10 y duplica; Suma 5 si el número es impar",
          "Regla 2.) - Dígitos medios: Resta el número de 9 y duplica lo que obtengas, luego suma la mitad del vecino; suma 5 si el número es impar",
          "Regla 3.) - Último dígito: resta 2 de la mitad del dígito más a la izquierda en el número"
        ],
        4: [
          "Regla 1.) - Primer dígito: resta de 10",
          "Regla 2.) - Dígitos medios: Resta el número de 9 y suma la mitad del vecino; suma 5 si el número es impar",
          "Regla 3.) - Último dígito: resta 1 de la mitad del dígito más a la izquierda en el número"
        ],
        5: ["Regla - La mitad del vecino; más 5 si el \"número\" es impar."],
        6: ["Regla - A cada \"número\" suma la mitad del vecino; más 5 si el \"número\" es impar."],
        7: ["Regla - Duplica el número y suma la mitad del vecino; suma 5 si el número es impar."],
        8: [
          "Regla 1.) - Primer dígito: resta de 10 y duplica",
          "Regla 2.) - Dígitos medios: Resta el número de 9 y duplica lo que obtengas, luego suma el vecino",
          "Regla 3.) - Último dígito: resta 2 del dígito más a la izquierda en el número"
        ],
        9: ["Regla - Resta el número de 10 y suma el vecino"],
        11: ["Regla - A cada número suma su vecino"],
        12: ["Regla - Duplica cada número y suma su vecino"]
      };
      return rules[table] || [];
    };

    const nextTable = () => {
      if (currentIndex < tables.length - 1) {
        setCurrentRuleTable(tables[currentIndex + 1]);
      }
    };

    const prevTable = () => {
      if (currentIndex > 0) {
        setCurrentRuleTable(tables[currentIndex - 1]);
      }
    };

    const selectTable = (table) => {
      setCurrentRuleTable(table);
    };

    return (
      <div className="App">
        <div className="container rules-1-12-container">
          <button className="back-top-button" onClick={() => setScreen('info-menu')}>
            Atrás
          </button>
          <h2 className="rules-1-12-title">Reglas | Multiplicación por {currentRuleTable}</h2>
          
          <div className="rules-1-12-content">
            <button 
              className="nav-arrow-btn left"
              onClick={prevTable}
              disabled={currentIndex === 0}
            >
              ←
            </button>
            
            <div className="rules-problem-area">
              <div className="rules-multiplication-display">
                <span className="rules-digit">0</span>
                <span className="rules-digit">6</span>
                <span className="rules-digit">5</span>
                <span className="rules-digit">4</span>
                <span className="rules-operator">×</span>
                <span className="rules-multiplier">{currentRuleTable}</span>
              </div>
              
              <div className="rules-result-box">
                <span className="rules-result-number">654</span>
              </div>
              
              <div className="rules-text">
                {getRulesForTable(currentRuleTable).map((rule, idx) => (
                  <p key={idx} className="rule-text-line">{rule}</p>
                ))}
              </div>
            </div>
            
            <button 
              className="nav-arrow-btn right"
              onClick={nextTable}
              disabled={currentIndex === tables.length - 1}
            >
              →
            </button>
          </div>

          <div className="rules-number-pad">
            {tables.map((table) => (
              <button
                key={table}
                className={`rules-number-btn ${table === currentRuleTable ? 'active' : ''}`}
                onClick={() => selectTable(table)}
              >
                {table}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de regla UT
  if (screen === 'rule-ut') {
    return (
      <div className="App rule-ut-app-wrapper">
        <div className="container rule-ut-container">
          <button className="back-top-button" onClick={() => setScreen('info-menu')}>
            Atrás
          </button>
          <h2 className="rule-ut-title">Reglas | Multiplicación UT</h2>
          
          <div className="rule-ut-widget">
            <button 
              className="widget-btn widget-btn-left" 
              onClick={() => {
                const num1Str = (utNumber1 || '123').padStart(5, '0');
                const num2Str = utNumber2 || '45';
                const maxSteps = num1Str.length + (num2Str.length * 4); // Aproximadamente el número máximo de flechas
                if (utArrowStep < maxSteps) {
                  setUtArrowStep(utArrowStep + 1);
                }
              }}
            >
              L
            </button>
            <div className="rule-ut-diagram">
              <div className="diagram-top-row">
                {(() => {
                  const num1Str = (utNumber1 || '123').padStart(5, '0');
                  const num2Str = utNumber2 || '45';
                  return (
                    <>
                      {num1Str.split('').map((d, i) => (
                        <span key={`top-${i}`} className="diagram-digit" data-index={i}>{d}</span>
                      ))}
                      <span className="diagram-operator">×</span>
                      {num2Str.split('').map((d, i) => (
                        <span key={`mult-${i}`} className="diagram-digit" data-index={num1Str.length + 1 + i}>{d}</span>
                      ))}
                    </>
                  );
                })()}
              </div>
              <div className="diagram-arrows-container">
                <svg className="diagram-arrows" viewBox="0 0 400 80" preserveAspectRatio="xMidYMid meet">
                  {(() => {
                    const num1Str = (utNumber1 || '123').padStart(5, '0');
                    const num2Str = utNumber2 || '45';
                    const num1 = parseInt(utNumber1) || 123;
                    const num2 = parseInt(utNumber2) || 45;
                    const result = (num1 * num2).toString().padStart(5, '0');
                    const arrows = [];
                    let arrowIndex = 0;
                    
                    // Calcular posiciones - ajustadas para el layout real
                    const digitWidth = 33; // 25px ancho + 8px gap
                    const operatorWidth = 50; // espacio para el operador ×
                    const startX = 12.5; // centro del primer dígito
                    const topY = 35; // Arriba del SVG (donde está el número superior) - ajustado para incluir línea horizontal y más espacio
                    const bottomY = 65; // Abajo del SVG (donde está el resultado)
                    
                    // Crear lista de todas las flechas en orden de izquierda a derecha
                    const allArrows = [];
                    
                    // Método Trachtenberg UT: generar flechas para cualquier par de números
                    // El método empieza desde la derecha y va hacia la izquierda
                    const arrowSpacing = 18; // Espaciado vertical entre flechas (ajustado para el viewBox más grande)
                    const arrowToY = topY + 25; // Altura donde apuntan las flechas (cerca de los números)
                    let stepCount = 0;
                    
                    // Paso 1: Multiplicar los últimos dígitos (de derecha a izquierda)
                    // Ejemplo: 3 × 5 en 123 × 45
                    const lastMultIdx = num2Str.length - 1; // Último dígito del multiplicador
                    const lastNum1Idx = num1Str.length - 1; // Último dígito del número izquierdo
                    const multX1 = startX + (num1Str.length * digitWidth) + operatorWidth + (lastMultIdx * digitWidth);
                    const num1X1 = startX + (lastNum1Idx * digitWidth);
                    
                    allArrows.push({
                      type: 'double-arrow',
                      key: `step-${stepCount}`,
                      multX: multX1,
                      multY: arrowToY,
                      num1X: num1X1,
                      num1Y: arrowToY,
                      arrowY: topY - 5 - (stepCount * arrowSpacing),
                      step: stepCount++
                    });
                    
                    // Pasos siguientes: Para cada dígito del multiplicador (de derecha a izquierda, empezando por el segundo)
                    // Se multiplica con los dígitos correspondientes del número izquierdo
                    for (let multOffset = 1; multOffset < num2Str.length; multOffset++) {
                      const multIdx = num2Str.length - 1 - multOffset; // Índice del dígito del multiplicador
                      const multX = startX + (num1Str.length * digitWidth) + operatorWidth + (multIdx * digitWidth);
                      
                      // Determinar qué dígitos del número izquierdo se multiplican con este dígito del multiplicador
                      const num1Indices = [];
                      // El dígito del multiplicador se multiplica con los últimos (multOffset + 1) dígitos del número izquierdo
                      for (let i = 0; i <= multOffset && (num1Str.length - 1 - i) >= 0; i++) {
                        const num1Idx = num1Str.length - 1 - i;
                        if (num1Idx >= 0) {
                          num1Indices.push(num1Idx);
                        }
                      }
                      
                      // Ordenar de izquierda a derecha
                      num1Indices.sort((a, b) => a - b);
                      
                      if (num1Indices.length > 0) {
                        if (num1Indices.length === 1) {
                          // Una sola conexión: flecha simple
                          const num1X = startX + (num1Indices[0] * digitWidth);
                          allArrows.push({
                            type: 'double-arrow',
                            key: `step-${stepCount}`,
                            multX: multX,
                            multY: arrowToY,
                            num1X: num1X,
                            num1Y: arrowToY,
                            arrowY: topY - 10 - (stepCount * arrowSpacing),
                            step: stepCount++
                          });
                        } else {
                          // Múltiples conexiones: flecha con múltiples puntas
                          allArrows.push({
                            type: 'multi-arrow',
                            key: `step-${stepCount}`,
                            multX: multX,
                            multY: arrowToY,
                            num1Indices: num1Indices,
                            num1Y: arrowToY,
                            arrowY: topY - 10 - (stepCount * arrowSpacing),
                            startX: startX,
                            digitWidth: digitWidth,
                            step: stepCount++
                          });
                        }
                      }
                    }
                    
                    // También crear flechas para combinaciones adicionales según el método UT
                    // Para cada dígito del número izquierdo (de derecha a izquierda, empezando por el segundo)
                    for (let num1Offset = 1; num1Offset < num1Str.length; num1Offset++) {
                      const num1Idx = num1Str.length - 1 - num1Offset;
                      const num1X = startX + (num1Idx * digitWidth);
                      
                      // Este dígito se multiplica con los últimos dígitos del multiplicador
                      for (let multOffset = 0; multOffset < num2Str.length && multOffset <= num1Offset; multOffset++) {
                        const multIdx = num2Str.length - 1 - multOffset;
                        const multX = startX + (num1Str.length * digitWidth) + operatorWidth + (multIdx * digitWidth);
                        
                        // Solo crear si no es la primera combinación (ya la tenemos)
                        if (!(num1Idx === num1Str.length - 1 && multIdx === num2Str.length - 1)) {
                          // Verificar si esta combinación ya existe
                          const exists = allArrows.some(arrow => {
                            if (arrow.type === 'double-arrow') {
                              return arrow.num1X === num1X && arrow.multX === multX;
                            } else if (arrow.type === 'multi-arrow') {
                              return arrow.multX === multX && arrow.num1Indices.includes(num1Idx);
                            }
                            return false;
                          });
                          
                          if (!exists) {
                            allArrows.push({
                              type: 'double-arrow',
                              key: `step-${stepCount}`,
                              multX: multX,
                              multY: arrowToY,
                              num1X: num1X,
                              num1Y: arrowToY,
                              arrowY: topY - 10 - (stepCount * arrowSpacing),
                              step: stepCount++
                            });
                          }
                        }
                      }
                    }
                    
                    // Separar la primera flecha de las demás
                    // La primera flecha tiene su propia línea horizontal
                    // Las demás flechas (2, 3, etc.) se unen arriba con una línea horizontal compartida
                    const firstArrow = allArrows[0];
                    const otherArrows = allArrows.slice(1);
                    
                    // Calcular todos los puntos X de las flechas visibles (excepto la primera) para crear una línea horizontal compartida arriba
                    const allVisibleXPoints = [];
                    const visibleOtherArrows = [];
                    let tempIndex = 0;
                    
                    // Primero renderizar la primera flecha con su propia línea horizontal
                    // Esta es la PRIMERA línea horizontal (línea 1)
                    if (utArrowStep > 0 && firstArrow) {
                      if (firstArrow.type === 'double-arrow') {
                        arrows.push(
                          <g key={firstArrow.key}>
                            {/* PRIMERA línea horizontal propia de la primera flecha */}
                            <line
                              x1={firstArrow.num1X}
                              y1={firstArrow.arrowY}
                              x2={firstArrow.multX}
                              y2={firstArrow.arrowY}
                              stroke="#333"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            {/* Flecha vertical apuntando al dígito del multiplicador */}
                            <line
                              x1={firstArrow.multX}
                              y1={firstArrow.arrowY}
                              x2={firstArrow.multX}
                              y2={firstArrow.multY}
                              stroke="#333"
                              strokeWidth="1.5"
                              markerEnd="url(#arrowhead)"
                            />
                            {/* Flecha vertical apuntando al dígito del número izquierdo */}
                            <line
                              x1={firstArrow.num1X}
                              y1={firstArrow.arrowY}
                              x2={firstArrow.num1X}
                              y2={firstArrow.num1Y}
                              stroke="#333"
                              strokeWidth="1.5"
                              markerEnd="url(#arrowhead)"
                            />
                          </g>
                        );
                      }
                      tempIndex++;
                    }
                    
                    // Ahora procesar las demás flechas (2, 3, etc.)
                    otherArrows.forEach((arrow) => {
                      if (tempIndex < utArrowStep) {
                        visibleOtherArrows.push(arrow);
                        if (arrow.type === 'double-arrow') {
                          allVisibleXPoints.push(arrow.num1X, arrow.multX);
                        } else if (arrow.type === 'multi-arrow' && arrow.num1Indices && arrow.num1Indices.length > 0) {
                          const num1Xs = arrow.num1Indices.map(idx => arrow.startX + (idx * arrow.digitWidth));
                          allVisibleXPoints.push(...num1Xs, arrow.multX);
                        }
                        tempIndex++;
                      }
                    });
                    
                    // Renderizar las demás flechas (2, 3, etc.)
                    // Cuando hay 3 o más flechas, cada una tiene su propia línea horizontal separada
                    // Asegurar que se muestren todas las flechas hasta utArrowStep
                    tempIndex = 1; // Empezar desde la segunda flecha
                    
                    if (utArrowStep >= 2) {
                      // Renderizar cada flecha adicional con su propia línea horizontal
                      // Iterar sobre otherArrows y mostrar cada una hasta utArrowStep
                      for (let i = 0; i < otherArrows.length && tempIndex < utArrowStep; i++) {
                        const arrow = otherArrows[i];
                        const arrowY = arrow.arrowY; // Altura de esta flecha
                        const currentStep = tempIndex; // Guardar el paso actual antes de incrementar
                        
                        if (arrow.type === 'double-arrow') {
                          // Calcular los puntos X para esta flecha
                          const arrowMinX = Math.min(arrow.num1X, arrow.multX);
                          const arrowMaxX = Math.max(arrow.num1X, arrow.multX);
                          
                          // Dibujar línea horizontal para esta flecha
                          arrows.push(
                            <line
                              key={`horizontal-line-${arrow.key}`}
                              x1={arrowMinX}
                              y1={arrowY}
                              x2={arrowMaxX}
                              y2={arrowY}
                              stroke="#333"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          );
                          
                          // Si es la tercera flecha (currentStep = 2), usar flechas diagonales
                          // Si es la segunda flecha (currentStep = 1), usar flechas verticales
                          if (utArrowStep >= 3 && currentStep === 2) {
                            // Tercera flecha: flechas diagonales
                            arrows.push(
                              <g key={arrow.key}>
                                {/* Flecha diagonal desde la línea horizontal hasta el multiplicador */}
                                <line
                                  x1={arrow.multX}
                                  y1={arrowY}
                                  x2={arrow.multX + 5}
                                  y2={arrow.multY}
                                  stroke="#333"
                                  strokeWidth="1.5"
                                  markerEnd="url(#arrowhead)"
                                />
                                {/* Flecha diagonal desde la línea horizontal hasta el número izquierdo */}
                                <line
                                  x1={arrow.num1X}
                                  y1={arrowY}
                                  x2={arrow.num1X - 5}
                                  y2={arrow.num1Y}
                                  stroke="#333"
                                  strokeWidth="1.5"
                                  markerEnd="url(#arrowhead)"
                                />
                              </g>
                            );
                          } else {
                            // Segunda flecha: flechas verticales
                            arrows.push(
                              <g key={arrow.key}>
                                {/* Flecha vertical desde la línea horizontal hasta el multiplicador */}
                                <line
                                  x1={arrow.multX}
                                  y1={arrowY}
                                  x2={arrow.multX}
                                  y2={arrow.multY}
                                  stroke="#333"
                                  strokeWidth="1.5"
                                  markerEnd="url(#arrowhead)"
                                />
                                {/* Flecha vertical desde la línea horizontal hasta el número izquierdo */}
                                <line
                                  x1={arrow.num1X}
                                  y1={arrowY}
                                  x2={arrow.num1X}
                                  y2={arrow.num1Y}
                                  stroke="#333"
                                  strokeWidth="1.5"
                                  markerEnd="url(#arrowhead)"
                                />
                              </g>
                            );
                          }
                        } else if (arrow.type === 'multi-arrow') {
                          if (arrow.num1Indices && arrow.num1Indices.length > 0) {
                            const num1Xs = arrow.num1Indices.map(idx => arrow.startX + (idx * arrow.digitWidth));
                            const allXs = [...num1Xs, arrow.multX];
                            const arrowMinX = Math.min(...allXs);
                            const arrowMaxX = Math.max(...allXs);
                            
                            // Dibujar línea horizontal para esta flecha
                            arrows.push(
                              <line
                                key={`horizontal-line-${arrow.key}`}
                                x1={arrowMinX}
                                y1={arrowY}
                                x2={arrowMaxX}
                                y2={arrowY}
                                stroke="#333"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            );
                            
                            arrows.push(
                              <g key={arrow.key}>
                                {/* Flecha vertical desde la línea horizontal hasta el multiplicador */}
                                <line
                                  x1={arrow.multX}
                                  y1={arrowY}
                                  x2={arrow.multX}
                                  y2={arrow.multY}
                                  stroke="#333"
                                  strokeWidth="1.5"
                                  markerEnd="url(#arrowhead)"
                                />
                                {/* Flechas verticales desde la línea horizontal hasta cada dígito del número izquierdo */}
                                {num1Xs.map((num1X, idx) => (
                                  <line
                                    key={`num1-${idx}`}
                                    x1={num1X}
                                    y1={arrowY}
                                    x2={num1X}
                                    y2={arrow.num1Y}
                                    stroke="#333"
                                    strokeWidth="1.5"
                                    markerEnd="url(#arrowhead)"
                                  />
                                ))}
                              </g>
                            );
                          }
                        }
                        tempIndex++;
                      }
                    }
                    
                    // Calcular puntos de acarreo para cada paso
                    const carryDots = [];
                    const LHS = padUTMultiplicand(num1Str, num2Str);
                    const answer = (num1 * num2).toString().padStart(LHS.length, '0');
                    
                    // Calcular acarreos para cada dígito del resultado
                    for (let stepIdx = LHS.length - 1; stepIdx >= 0; stepIdx--) {
                      if (stepIdx >= LHS.length - utArrowStep) {
                        const utStep = calculateUTStep(num1Str, num2Str, stepIdx);
                        const carry = utStep.carry;
                        
                        if (carry > 0 && stepIdx > 0) {
                          // Calcular posición X del dígito donde se muestra el acarreo
                          const resultDigitIdx = LHS.length - 1 - stepIdx;
                          const resultX = startX + (resultDigitIdx * digitWidth);
                          const carryY = bottomY - 15; // Posición Y para los puntos (arriba del resultado)
                          
                          // Renderizar puntos de acarreo (1 punto = acarreo 1, 2 puntos = acarreo 2, 3 puntos = acarreo 3, etc.)
                          if (carry > 0) {
                            const dots = [];
                            const dotSpacing = 4; // Espacio entre puntos
                            const startX = resultX - (carry - 1) * dotSpacing / 2; // Centrar los puntos
                            
                            for (let i = 0; i < carry; i++) {
                              dots.push(
                                <circle
                                  key={`carry-${stepIdx}-${i}`}
                                  cx={startX + (i * dotSpacing)}
                                  cy={carryY}
                                  r="2.5"
                                  fill="#333"
                                />
                              );
                            }
                            
                            carryDots.push(
                              <g key={`carry-${stepIdx}`}>
                                {dots}
                              </g>
                            );
                          }
                        }
                      }
                    }
                    
                    return (
                      <>
                        <defs>
                          <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="7" refY="2.5" orient="auto">
                            <polygon points="0 0, 8 2.5, 0 5" fill="#333" />
                          </marker>
                          <marker id="arrowhead-left" markerWidth="8" markerHeight="8" refX="1" refY="2.5" orient="auto">
                            <polygon points="8 0, 0 2.5, 8 5" fill="#333" />
                          </marker>
                        </defs>
                        {arrows}
                        {carryDots}
                      </>
                    );
                  })()}
                </svg>
              </div>
              <div className="diagram-bottom-row">
                {(() => {
                  const num1 = parseInt(utNumber1) || 123;
                  const num2 = parseInt(utNumber2) || 45;
                  const result = (num1 * num2).toString().padStart(5, '0');
                  return result.split('').map((d, i) => (
                    <span key={`bottom-${i}`} className="diagram-digit" data-index={i}>{d}</span>
                  ));
                })()}
              </div>
            </div>
            <button 
              className="widget-btn widget-btn-right" 
              onClick={() => {
                if (utArrowStep > 0) {
                  setUtArrowStep(utArrowStep - 1);
                }
              }}
            >
              R
            </button>
          </div>

          <div className="rule-ut-inputs">
            <div className="rule-ut-input-box">
              <input
                type="text"
                className="rule-ut-input-number"
                value={utNumber1}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setUtNumber1(value);
                }}
                placeholder="123"
              />
            </div>
            <div className="rule-ut-input-box">
              <input
                type="text"
                className="rule-ut-input-number"
                value={utNumber2}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setUtNumber2(value);
                }}
                placeholder="45"
              />
            </div>
          </div>

          <div className="rule-ut-content">
            <p>
              El método de multiplicación unidades-decenas (método UT) es un método para multiplicar 
              enteros arbitrarios con una cantidad mínima de resultados temporales que deben mantenerse 
              en memoria. Las reglas para multiplicar dos números, abc y de usando multiplicación UT 
              son las siguientes:
            </p>

            <h3>1. Preparación:</h3>
            <p>
              Agrega una cantidad de ceros iniciales, al término izquierdo en el producto, igual al 
              número de dígitos en el lado derecho del producto. Por ejemplo, escribe el número 123 
              como 000123 si 123 se multiplica por un número de 3 dígitos (esto se hace automáticamente 
              en esta aplicación).
            </p>

            <h3>2. Cálculo (consejo: intenta seguir los pasos aquí en el widget de arriba):</h3>
            <p>
              Para encontrar el primer dígito de la respuesta, toma el dígito de las unidades de 
              multiplicar el dígito más a la derecha de los términos izquierdo y derecho en el producto, 
              por ejemplo 3*5 = 15.
            </p>
            <p>
              Para encontrar el segundo dígito de la respuesta, suma el dígito de las unidades de 
              multiplicar el segundo dígito del término izquierdo por el primer dígito del término 
              derecho, leído desde la derecha, por ejemplo 2 * 5 = 10. Suma esto al dígito de las 
              decenas de multiplicar el dígito más a la derecha en los términos derecho e izquierdo, 
              por ejemplo 3 * 5 = 15 y finalmente suma el dígito de las unidades del segundo término 
              desde la izquierda del término derecho con el dígito más a la derecha en el término 
              izquierdo, por ejemplo 3 * 4 = 12. Entonces 0+1+2 = 3.
            </p>
            <p>
              Para encontrar el dígito número n de la respuesta, toma el dígito de las unidades del 
              resultado de multiplicar el primer dígito en el término derecho con el n-ésimo dígito 
              del término izquierdo y suma el dígito de las decenas de multiplicar el primer dígito 
              en el término derecho con el (n-1)-ésimo dígito del término izquierdo. Luego toma el 
              dígito de las unidades del resultado de multiplicar el segundo dígito en el término 
              derecho con el (n-1)-ésimo dígito del término izquierdo y suma el dígito de las decenas 
              de multiplicar el segundo dígito en el término derecho con el (n-2)-ésimo dígito del 
              término izquierdo. Luego toma el dígito de las unidades del resultado de multiplicar 
              el tercer dígito en el término derecho con el (n-2)-ésimo dígito del término izquierdo 
              y suma el dígito de las decenas de multiplicar el tercer dígito en el término derecho 
              con el (n-3)-ésimo dígito del término izquierdo.
            </p>
            <p>
              Continúa así hasta que te quedes sin dígitos de una forma u otra. Finalmente, suma todos 
              los resultados intermedios y posiblemente los acarreos de dígitos anteriores. La respuesta 
              es el dígito de las unidades de este resultado, el acarreo es el dígito de las decenas 
              del resultado.
            </p>
            <p>
              La mejor manera de entender este proceso es practicando - usa el widget de arriba con 
              tus propios números e intenta seguir el proceso.
            </p>

            <h3>3. Verificación:</h3>
            <p>
              Multiplica la raíz digital (definición a continuación) del término izquierdo con la raíz 
              digital del término derecho, toma la suma de dígitos (definición a continuación) del 
              resultado y compárala con la raíz digital de tu respuesta.
            </p>

            <h3>Definiciones:</h3>
            <p>
              <strong>Suma de dígitos:</strong> la suma de los dígitos en un número, por ejemplo la 
              suma de dígitos de 1234 → 1+2+3+4=10 y la suma de dígitos de 6283 → 6+2+8+3=19.
            </p>
            <p>
              <strong>Raíz digital:</strong> el resultado de hacer repetidamente la suma de dígitos 
              de un número hasta que el resultado esté en un solo dígito, por ejemplo la raíz digital 
              de 1234 → 1+2+3+4=10→1+0=1 y la raíz digital de 6283 → 6+2+8+3=19→1+9=10→1+0=1.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de selección de dificultad
  if (screen === 'difficulty') {
    return (
      <div className="App">
        <div className="container difficulty-container">
          <button className="back-top-button" onClick={() => setScreen('main')}>
            Atrás
          </button>
          <h2 className="difficulty-title">Elegir Dificultad</h2>
          <div className="difficulty-options">
            <button 
              className="difficulty-option-btn"
              onClick={() => selectDifficulty('facil')}
            >
              Fácil
            </button>
            <button 
              className="difficulty-option-btn"
              onClick={() => selectDifficulty('medio')}
            >
              Medio
            </button>
            <button 
              className="difficulty-option-btn"
              onClick={() => selectDifficulty('dificil')}
            >
              Difícil
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de selección de tablas de multiplicar (1-12)
  if (screen === 'table-select') {
    const tables = [2, 3, 4, 5, 6, 7, 8, 9, 11, 12];
    
    return (
      <div className="App">
        <div className="container table-select-container">
          <button className="back-top-button" onClick={() => setScreen('main')}>
            Atrás
          </button>
          <h2 className="table-select-title">Multiplicación 1-12</h2>
          <div className="tables-grid">
            {tables.map((table) => (
              <button
                key={table}
                className="table-btn"
                onClick={() => selectTable(table)}
              >
                {table}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de solución paso a paso
  if (screen === 'solution') {
    // Asegurar que currentStep esté dentro del rango válido
    // El useEffect se encargará de resetear currentStep a 0 cuando se entra a esta pantalla
    const safeCurrentStep = solutionSteps.length > 0 
      ? Math.max(0, Math.min(currentStep, solutionSteps.length - 1))
      : 0;
    const step = solutionSteps[safeCurrentStep];
    const num1Str = question.num1.toString().padStart(5, '0');
    const num2Str = question.num2.toString();
    const rawNum1 = question.num1.toString();
    const isUTStep = step && typeof step.utColumnIndex === 'number';
    const utVisual =
      isUTStep && step
        ? getUTMultiplyPairsForStep(rawNum1, num2Str, step.utColumnIndex)
        : null;

    return (
      <div className="App">
        <div className="container solution-container solution-screen">
          <header className="solution-header solution-header--reference">
            <div className="solution-header-top">
              <span className="solution-title-reference">Solución paso a paso</span>
              <div className="solution-progress-line" />
            </div>
            <div className="solution-nav-bf">
              {safeCurrentStep > 0 ? (
              <button
                type="button"
                className="solution-bf-btn"
                onClick={prevStep}
                aria-label="Paso anterior"
                title="Anterior"
              >
                B
              </button>
              ) : (
                <span className="solution-bf-spacer" aria-hidden />
              )}
              <span className="solution-step-center">
                Paso{' '}
                {step && typeof step.stepNumber === 'number'
                  ? step.stepNumber
                  : safeCurrentStep + 1}
              </span>
              <button
                type="button"
                className="solution-bf-btn"
                onClick={nextStep}
                disabled={safeCurrentStep === solutionSteps.length - 1}
                aria-label="Paso siguiente"
                title="Siguiente"
              >
                F
              </button>
            </div>
          </header>

          <div className="solution-content solution-content--reference">
            {step && (
              <>
                <div className="solution-text">
                  <div className="calc-steps">
                  {step.calculations && step.calculations.map((calc, idx) => (
                    <p key={idx} className="calc-line calc-line-plain">
                      <span className="calc-line-inner">
                      {parseMarkupText(calc.text).map((part, partIdx) => (
                        part.underlined ? (
                          <span key={partIdx} className="underlined">{part.text}</span>
                        ) : (
                          <span key={partIdx}>{part.text}</span>
                        )
                      ))}
                      </span>
                      {calc.hint && <span className="calc-hint">{calc.hint}</span>}
                    </p>
                  ))}
                  </div>
                  {step.sumText && (
                    <div className="solution-sum-block">
                      <div className="calc-line calc-line-sum">
                      {parseMarkupText(step.sumText).map((part, partIdx) => (
                        part.underlined ? (
                          <span key={partIdx} className="underlined">{part.text}</span>
                        ) : (
                          <span key={partIdx}>{part.text}</span>
                        )
                      ))}
                      </div>
                      {step.sumHint && <p className="solution-sum-hint">{step.sumHint}</p>}
                    </div>
                  )}
                </div>

                <div className="solution-visual solution-visual--reference">
                  {utVisual && utVisual.pairs.length > 0 ? (
                    <>
                      <UTStepBridgeDiagram
                        paddedLHS={utVisual.paddedLHS}
                        num2Str={num2Str}
                        pairs={utVisual.pairs}
                      />
                    </>
                  ) : (
                    <div className="solution-visual-fallback">
                      <div className="multiplication-display-horizontal" style={{ marginBottom: '5px', paddingLeft: '0' }}>
                        {num1Str.split('').map((d, i) => (
                          <span key={i} className="digit">{d}</span>
                        ))}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '1.8rem',
                          fontWeight: '600',
                          paddingRight: '20px'
                        }}
                      >
                        <span className="operator" style={{ margin: '0 12px' }}>×</span>
                        {num2Str.split('').map((d, i) => (
                          <span key={i} className="digit">{d}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {!isUTStep && (
                  <p className="solution-partial-note">
                    <strong>Resultado parcial:</strong> solo aparecen las cifras ya calculadas (de derecha a
                    izquierda). El <strong>resultado final</strong> de la multiplicación es{' '}
                    {(() => {
                      const { plain, padded } = getProductAnswerVariants(question.num1, question.answer);
                      if (question.operator === '×' && plain !== padded) {
                        return (
                          <>
                            <strong>{plain}</strong> (o <strong>{padded}</strong> con ceros a la izquierda)
                          </>
                        );
                      }
                      return <strong>{question.answer}</strong>;
                    })()}
                    ; al avanzar todos los pasos coincidirá con ese número.
                  </p>
                  )}
                  {!isUTStep && <div className="divider-line divider-line--ut"></div>}
                  <div className={`result-display ${isUTStep ? 'result-display--ut' : ''}`}>
                    {step.partialResult && isUTStep && typeof step.utColumnIndex === 'number' ? (
                      (() => {
                        const totalDigits = step.partialResult.length;
                        const stepNumber = step.stepNumber || (safeCurrentStep + 1);
                        const carryValue = step.carry || 0;
                        const colActive = step.utColumnIndex;
                        return (
                          <div className="ut-partial-answer">
                            {step.partialResult.map((d, i) => {
                              const positionFromRight = totalDigits - 1 - i;
                              const visible = positionFromRight < stepNumber;
                              const isCurrentDigit = i === colActive;
                              const showCarry = carryValue > 0 && isCurrentDigit;
                              return (
                                <span
                                  key={i}
                                  className={`ut-res-slot ${visible ? 'ut-res-slot--visible' : 'ut-res-slot--placeholder'}`}
                                >
                                  <span className="result-digit-container">
                                    {visible && isCurrentDigit && (
                                      <span className="ut-answer-step-dot" aria-hidden>
                                        ·
                                      </span>
                                    )}
                                    <span className={`result-digit ${isCurrentDigit ? 'current' : ''}`}>
                                      {visible ? d : '\u00a0'}
                                    </span>
                                    {visible && showCarry && (
                                      <span className="carry-dots">
                                        {Array.from({ length: carryValue }, (_, idx) => (
                                          <span key={idx} className="carry-dot">
                                            .
                                          </span>
                                        ))}
                                      </span>
                                    )}
                                  </span>
                                </span>
                              );
                            })}
                          </div>
                        );
                      })()
                    ) : (
                    step.partialResult &&
                    step.partialResult.map((d, i) => {
                      const totalDigits = step.partialResult.length;
                      const stepNumber = step.stepNumber || (safeCurrentStep + 1);
                      const positionFromRight = totalDigits - 1 - i;
                      if (positionFromRight >= stepNumber) {
                        return null;
                      }
                      const isCurrentDigit = positionFromRight === 0;
                      const carryValue = step.carry || 0;
                      const showCarry = carryValue > 0 && positionFromRight === 0;
                      return (
                        <span key={i} className="result-digit-container">
                          <span className={`result-digit ${isCurrentDigit ? 'current' : ''}`}>{d}</span>
                          {showCarry && carryValue > 0 && (
                            <span className="carry-dots">
                              {Array.from({ length: carryValue }, (_, idx) => (
                                <span key={idx} className="carry-dot">
                                  .
                                </span>
                              ))}
                            </span>
                          )}
                        </span>
                      );
                    })
                    )}
                    {step.finalResult && !step.partialResult && (
                      step.finalResult.split('').map((d, i) => (
                        <span key={i} className="result-digit">{d}</span>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <button className="close-solution-btn" onClick={() => setScreen('game')}>
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // Pantalla de mnemotecnia
  if (screen === 'mnemotecnia') {
    const mnemotecniaData = [
      { num: 0, objeto: 'aro', accion: 'ara' },
      { num: 1, objeto: 'té', accion: 'excita' },
      { num: 2, objeto: 'huña', accion: 'garra' },
      { num: 3, objeto: 'humo', accion: 'tose' },
      { num: 4, objeto: 'k.o', accion: 'noquea' },
      { num: 5, objeto: 'ala', accion: 'vuela' },
      { num: 6, objeto: 'oso', accion: 'gruñe' },
      { num: 7, objeto: 'avión', accion: 'vuela' },
      { num: 8, objeto: 'hacha', accion: 'corta' },
      { num: 9, objeto: 'boa', accion: 'muerde' },
      { num: 10, objeto: 'toro', accion: 'enviste' },
      { num: 11, objeto: 'dedo', accion: 'señala' },
      { num: 12, objeto: 'tuna', accion: 'pincha' },
      { num: 13, objeto: 'dama', accion: 'encoje' },
      { num: 14, objeto: 'dique', accion: 'soporta' },
      { num: 15, objeto: 'duelo', accion: 'mata' },
      { num: 16, objeto: 'tiza', accion: 'empolva' },
      { num: 17, objeto: 'teja', accion: 'cubre' },
      { num: 18, objeto: 'ducha', accion: 'moja' },
      { num: 19, objeto: 'topo', accion: 'cava' },
      { num: 20, objeto: 'noria', accion: 'da vueltas' },
      { num: 21, objeto: 'nata', accion: 'decora' },
      { num: 22, objeto: 'niño', accion: 'chupa piruleta' },
      { num: 23, objeto: 'gnomo', accion: 'sombrero verde' },
      { num: 24, objeto: 'anca', accion: 'salta' },
      { num: 25, objeto: 'nilo', accion: 'navega' },
      { num: 26, objeto: 'anís', accion: 'emborracha' },
      { num: 27, objeto: 'hinojo', accion: 'enoja' },
      { num: 28, objeto: 'hongo', accion: 'multiplica' },
      { num: 29, objeto: 'naipe', accion: 'mezcla' },
      { num: 30, objeto: 'muro', accion: 'delimita' },
      { num: 31, objeto: 'mate', accion: 'chupa' },
      { num: 32, objeto: 'mano', accion: 'Hi-5' },
      { num: 33, objeto: 'momia', accion: 'anda a tumbos' },
      { num: 34, objeto: 'moco', accion: 'estornuda' },
      { num: 35, objeto: 'miel', accion: 'pegajosa' },
      { num: 36, objeto: 'mesa', accion: 'apoyo' },
      { num: 37, objeto: 'mafia', accion: 'fuma' },
      { num: 38, objeto: 'macho', accion: 'alfa' },
      { num: 39, objeto: 'mopa', accion: 'barre' },
      { num: 40, objeto: 'coro', accion: 'canta' },
      { num: 41, objeto: 'codo', accion: 'clava' },
      { num: 42, objeto: 'cuna', accion: 'hamaca' },
      { num: 43, objeto: 'cama', accion: 'duerme' },
      { num: 44, objeto: 'coco', accion: 'cae' },
      { num: 45, objeto: 'cola', accion: 'caga' },
      { num: 46, objeto: 'casa', accion: 'revive' },
      { num: 47, objeto: 'cojo', accion: 'cojea' },
      { num: 48, objeto: 'coche', accion: 'corre' },
      { num: 49, objeto: 'copa', accion: 'invoca' },
      { num: 50, objeto: 'loro', accion: 'enjaulado' },
      { num: 51, objeto: 'lata', accion: 'molesta' },
      { num: 52, objeto: 'lana', accion: 'abriga' },
      { num: 53, objeto: 'lima', accion: 'desgasta' },
      { num: 54, objeto: 'laca', accion: 'endurece' },
      { num: 55, objeto: 'lila', accion: 'florece' },
      { num: 56, objeto: 'luz', accion: 'alumbra' },
      { num: 57, objeto: 'alf', accion: 'está en el espacio' },
      { num: 58, objeto: 'lego', accion: 'construye' },
      { num: 59, objeto: 'lobo', accion: 'aúlla' },
      { num: 60, objeto: 'zorro', accion: 'usa antifaz' },
      { num: 61, objeto: 'soda', accion: 'burbujea' },
      { num: 62, objeto: 'asno', accion: 'carga' },
      { num: 63, objeto: 'sumo', accion: 'lucha' },
      { num: 64, objeto: 'saco', accion: 'guarda' },
      { num: 65, objeto: 'sal', accion: 'da sed' },
      { num: 66, objeto: 'huesos', accion: 'lamer' },
      { num: 67, objeto: 'sofá', accion: 'sienta' },
      { num: 68, objeto: 'soga', accion: 'ata' },
      { num: 69, objeto: 'sopa', accion: 'toma en cucharas' },
      { num: 70, objeto: 'faro', accion: 'guía' },
      { num: 71, objeto: 'foto', accion: 'enmarca' },
      { num: 72, objeto: 'faena', accion: 'trabajo' },
      { num: 73, objeto: 'fama', accion: 'estrella' },
      { num: 74, objeto: 'foca', accion: 'aplaude' },
      { num: 75, objeto: 'fila', accion: 'espera' },
      { num: 76, objeto: 'juez', accion: 'martilla' },
      { num: 77, objeto: 'faja', accion: 'aprieta' },
      { num: 78, objeto: 'fuego', accion: 'quema' },
      { num: 79, objeto: 'japo', accion: 'lucha con espadas' },
      { num: 80, objeto: 'gorro', accion: 'tapa cabeza' },
      { num: 81, objeto: 'gato', accion: 'hace miau' },
      { num: 82, objeto: 'genio', accion: 'levita' },
      { num: 83, objeto: 'goma', accion: 'lanza' },
      { num: 84, objeto: 'chica', accion: 'seduce' },
      { num: 85, objeto: 'gol', accion: 'meter' },
      { num: 86, objeto: 'chus', accion: 'enfada' },
      { num: 87, objeto: 'gofio', accion: 'atraganta' },
      { num: 88, objeto: 'gaga', accion: 'baila' },
      { num: 89, objeto: 'chavo', accion: 'llora' },
      { num: 90, objeto: 'barro', accion: 'ensucia' },
      { num: 91, objeto: 'bota', accion: 'en pies' },
      { num: 92, objeto: 'vino', accion: 'catar' },
      { num: 93, objeto: 'pomo', accion: 'cierra' },
      { num: 94, objeto: 'boca', accion: 'habla' },
      { num: 95, objeto: 'bola', accion: 'desinfla' },
      { num: 96, objeto: 'vaso', accion: 'bebe' },
      { num: 97, objeto: 'abeja', accion: 'zumba' },
      { num: 98, objeto: 'bicho', accion: 'aplasta' },
      { num: 99, objeto: 'pipa', accion: 'cruje' }
    ];

    const correspondenciaFonetica = [
      { num: 0, letras: 'r, rr' },
      { num: 1, letras: 't, d' },
      { num: 2, letras: 'n, ñ' },
      { num: 3, letras: 'm, w' },
      { num: 4, letras: 'c, k, q' },
      { num: 5, letras: 'l, ll' },
      { num: 6, letras: 's, z' },
      { num: 7, letras: 'f, j' },
      { num: 8, letras: 'g, ch' },
      { num: 9, letras: 'b, p, v' }
    ];

    return (
      <div className="App">
        <div className="container mnemotecnia-container">
          <button className="back-top-button" onClick={() => setScreen('game')}>
            Atrás
          </button>
          <h1 className="mnemotecnia-title">Tabla Mnemotécnica</h1>
          <div className="mnemotecnia-content">
            <section className="info-section">
              <h2>Guía de Memoria para Números</h2>
              <p>
                Esta tabla te ayudará a recordar números en la multiplicación mediante la asociación 
                de objetos y acciones. Cada número del 0 al 99 tiene un objeto y una acción asociada 
                que puedes visualizar para recordarlo mejor.
              </p>
            </section>

            <div className="mnemotecnia-layout">
              <div className="mnemotecnia-left">
                <h3 className="correspondencia-title">Correspondencia Fonética</h3>
                <div className="correspondencia-table-container">
                  <table className="correspondencia-table">
                    <thead>
                      <tr>
                        <th>N°</th>
                        <th>Letras</th>
                      </tr>
                    </thead>
                    <tbody>
                      {correspondenciaFonetica.map((item) => (
                        <tr key={item.num}>
                          <td className="correspondencia-num">{item.num}</td>
                          <td className="correspondencia-letras">{item.letras}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mnemotecnia-right">
                <h3 className="palabras-title">Palabras Mnemotécnicas (0-99)</h3>
                <div className="mnemotecnia-table-container">
                  <table className="mnemotecnia-table">
                    <thead>
                      <tr>
                        <th>N°</th>
                        <th>Objeto</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mnemotecniaData.map((item) => (
                        <tr key={item.num}>
                          <td className="mnemotecnia-num">{item.num}</td>
                          <td className="mnemotecnia-objeto">{item.objeto}</td>
                          <td className="mnemotecnia-accion">{item.accion}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de reglas (Modal)
  if (screen === 'rule') {
    const getRuleForTable = (table) => {
      const rules = {
        1: "Multiplica el número por 1 (el número permanece igual)",
        2: "Duplica el número",
        3: "Triplica el número y suma los acarreos",
        4: "Duplica dos veces el número",
        5: "Multiplica por 10 y divide por 2",
        6: "Multiplica por 3 y luego duplica",
        7: "Multiplica por 10 y resta 3 veces el número",
        8: "Duplica tres veces el número",
        9: "Multiplica por 10 y resta el número",
        10: "Agrega un cero al final",
        11: "Suma el número consigo mismo desplazado",
        12: "Multiplica por 10 y suma el doble del número"
      };
      return rules[table] || "Regla general de multiplicación";
    };

    return (
      <div className="App">
        <div className="rule-modal-overlay" onClick={() => setScreen('game')}>
          <div className="rule-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rule-modal-header">
              <div className="rule-modal-title-line"></div>
              <h2 className="rule-modal-title">
                Regla de multiplicación | {selectedTable}
              </h2>
            </div>
            <div className="rule-modal-content">
              <p className="rule-text">{getRuleForTable(selectedTable)}</p>
            </div>
            <button className="close-rule-modal-btn" onClick={() => setScreen('game')}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de juego
  // Si es modo UT o 1-12, mostrar interfaz con teclado numérico
  if ((gameMode === 'ut' || gameMode === '1-12') && gameActive) {
    const num1Str = question.num1.toString().padStart(5, '0');
    const num2Str = question.num2.toString();
    
    return (
      <div className="App">
        <div className="container ut-game-container">
          <div className="ut-header">
            <button 
              className="back-top-button" 
              onClick={stopGame}
              disabled={feedback.includes('Incorrecto')}
              style={{ opacity: feedback.includes('Incorrecto') ? 0.5 : 1, cursor: feedback.includes('Incorrecto') ? 'not-allowed' : 'pointer' }}
            >
              Atrás
            </button>
            <button 
              className="mnemotecnia-button" 
              onClick={showMnemotecnia}
              disabled={feedback.includes('Incorrecto')}
              style={{ opacity: feedback.includes('Incorrecto') ? 0.5 : 1, cursor: feedback.includes('Incorrecto') ? 'not-allowed' : 'pointer' }}
            >
              mnemotecnia
            </button>
            {gameMode === '1-12' && (
              <button className="rule-button" onClick={showRule}>
                Regla
              </button>
            )}
            <button 
              className="solve-button" 
              onClick={showSolution}
              disabled={feedback.includes('Incorrecto')}
              style={{ opacity: feedback.includes('Incorrecto') ? 0.5 : 1, cursor: feedback.includes('Incorrecto') ? 'not-allowed' : 'pointer' }}
            >
              Resolver
            </button>
          </div>

          <div className="ut-problem-area">
            <div className="ut-game-equation" aria-label="Enunciado">
              <div className="ut-game-lhs">
                <div className="ut-game-lhs-digits">
                  {num1Str.split('').map((d, i) => (
                    <span key={i} className="problem-digit">
                      {d}
                    </span>
                  ))}
                </div>
                <div className="ut-game-lhs-rule" />
              </div>
              <span className="problem-operator ut-game-op">×</span>
              <div className="ut-game-rhs">
                {num2Str.split('').map((d, i) => (
                  <span key={i} className="problem-digit">
                    {d}
                  </span>
                ))}
              </div>
            </div>
            <div className="answer-field-container">
              <div className="answer-digits-row">
                {/* Espacios vacíos para alinear con los dígitos iniciales del primer número */}
                {/* El resultado siempre debe tener el mismo número de dígitos que el multiplicando */}
                {num1Str.split('').slice(0, num1Str.length - userAnswer.length).map((_, i) => (
                  <span key={`empty-${i}`} className="answer-digit empty-digit"></span>
                ))}
                {/* Dígitos del resultado alineados con los últimos dígitos del primer número */}
                {/* Los dígitos se muestran en el orden en que se escribieron, pero alineados desde la derecha */}
                {userAnswer.split('').map((d, i) => {
                  // La posición desde la derecha (0 = último dígito, 1 = penúltimo, etc.)
                  const positionFromRight = userAnswer.length - 1 - i;
                  const carryCount = carryDots[positionFromRight] || 0;
                  return (
                    <span key={i} className="answer-digit-container" style={{ position: 'relative', display: 'inline-block' }}>
                      {/* Mostrar puntos de acarreo arriba del dígito */}
                      {carryCount > 0 && (
                        <span className="user-carry-dots" style={{
                          position: 'absolute',
                          top: '-12px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          display: 'flex',
                          gap: '3px',
                          justifyContent: 'center'
                        }}>
                          {Array.from({ length: carryCount }, (_, idx) => (
                            <span key={idx} style={{
                              display: 'inline-block',
                              width: '4px',
                              height: '4px',
                              borderRadius: '50%',
                              backgroundColor: '#333',
                              margin: '0 1px'
                            }}></span>
                          ))}
                        </span>
                      )}
                      <span className="answer-digit">{d}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sugerencias mnemotécnicas */}
          {userAnswer && userAnswer.length > 0 && (() => {
            const { recent, all } = getMnemotecniaSuggestions(userAnswer);
            
            return (
              <div className="mnemotecnia-suggestions">
                <div className="mnemotecnia-suggestions-title">💡 Sugerencias Mnemotécnicas:</div>
                
                {/* Sugerencias del último dígito y par */}
                {recent.length > 0 && (
                  <div className="mnemotecnia-suggestions-list">
                    {recent.map((suggestion, idx) => (
                      <div key={idx} className={`mnemotecnia-suggestion ${suggestion.type}`}>
                        <div className="suggestion-number">{suggestion.number}</div>
                        <div className="suggestion-content">
                          <div className="suggestion-objeto">
                            <strong>{suggestion.objeto}</strong>
                          </div>
                          <div className="suggestion-accion">{suggestion.accion}</div>
                        </div>
                        <div className="suggestion-type-badge">
                          {suggestion.type === 'single' ? '1 dígito' : '2 dígitos'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Todas las palabras de todos los dígitos escritos */}
                {all.length > 0 && (
                  <div className="mnemotecnia-all-suggestions">
                    <div className="all-suggestions-title">Todas las palabras (de izquierda a derecha):</div>
                    <div className="all-suggestions-grid">
                      {all.map((sug, idx) => (
                        <div key={idx} className="all-suggestion-item">
                          <div className="all-suggestion-number">{sug.number}</div>
                          <div className="all-suggestion-objeto">{sug.objeto}</div>
                          <div className="all-suggestion-accion">{sug.accion}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Mostrar feedback si existe */}
          {feedback && (
            <div className="ut-feedback" style={{ 
              color: feedback.includes('Incorrecto') ? '#ef4444' : 
                     feedback.includes('Correcto') ? '#22c55e' : 
                     feedback.includes('decimales') ? '#f59e0b' : '#333',
              textAlign: 'center',
              padding: '10px',
              marginTop: '10px',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              {feedback}
            </div>
          )}

          <div className="numeric-keypad">
            <button className="keypad-btn" onClick={() => handleKeypadInput('1')}>1</button>
            <button className="keypad-btn" onClick={() => handleKeypadInput('2')}>2</button>
            <button className="keypad-btn" onClick={() => handleKeypadInput('3')}>3</button>
            <button className="keypad-btn" onClick={() => handleKeypadInput('CE')}>CE</button>
            
            <button className="keypad-btn" onClick={() => handleKeypadInput('4')}>4</button>
            <button className="keypad-btn" onClick={() => handleKeypadInput('5')}>5</button>
            <button className="keypad-btn" onClick={() => handleKeypadInput('6')}>6</button>
            <button className="keypad-btn" onClick={() => handleKeypadInput('←')}>←</button>
            
            <button className="keypad-btn" onClick={() => handleKeypadInput('7')}>7</button>
            <button className="keypad-btn" onClick={() => handleKeypadInput('8')}>8</button>
            <button className="keypad-btn" onClick={() => handleKeypadInput('9')}>9</button>
            <button className="keypad-btn" onClick={() => handleKeypadInput('.')}>.</button>
            
            <button className="keypad-btn empty"></button>
            <button className="keypad-btn" onClick={() => handleKeypadInput('0')}>0</button>
            <button className="keypad-btn empty"></button>
            <button className="keypad-btn" onClick={() => handleKeypadInput('→')}>→</button>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de juego normal (para otros modos)
  return (
    <div className="App">
      <div className="container">
        <header className="header">
          <h1>🧮 Método Trachtenberg</h1>
          <p className="subtitle">Sistema de cálculo mental rápido</p>
        </header>

        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-label">Puntuación</div>
            <div className="stat-value">{score}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Tiempo</div>
            <div className="stat-value time">{timeLeft}s</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Precisión</div>
            <div className="stat-value">{accuracy}%</div>
          </div>
        </div>

        {gameActive ? (
          <div className="game-screen">
            <div className="question-container">
              <div className="question">
                <span className="number">{question.num1}</span>
                <span className="operator">{question.operator}</span>
                <span className="number">{question.num2}</span>
                <span className="equals">=</span>
                <input
                  type="number"
                  className="answer-input"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  autoFocus
                  placeholder="?"
                />
              </div>
            </div>

            <div className="feedback">{feedback}</div>

            <div className="game-controls">
              <button className="check-button" onClick={checkAnswer}>
                Verificar
              </button>
              <button className="stop-button" onClick={stopGame}>
                Detener
              </button>
            </div>
          </div>
        ) : (
          <div className="menu-screen">
            <div className="difficulty-selector">
              <h2>Selecciona la dificultad:</h2>
              <div className="difficulty-buttons">
                <button
                  className={`difficulty-btn ${difficulty === 'facil' ? 'active' : ''}`}
                  onClick={() => setDifficulty('facil')}
                >
                  Fácil
                </button>
                <button
                  className={`difficulty-btn ${difficulty === 'medio' ? 'active' : ''}`}
                  onClick={() => setDifficulty('medio')}
                >
                  Medio
                </button>
                <button
                  className={`difficulty-btn ${difficulty === 'dificil' ? 'active' : ''}`}
                  onClick={() => setDifficulty('dificil')}
                >
                  Difícil
                </button>
              </div>
            </div>
            <button className="start-button" onClick={() => startGame()}>
              ▶️ Iniciar Juego
            </button>
          </div>
        )}

        {!gameActive && totalQuestions > 0 && (
          <div className="results">
            <h3>Resultados Finales</h3>
            <p>Puntuación: {score} puntos</p>
            <p>Respuestas correctas: {correctAnswers} / {totalQuestions}</p>
            <p>Precisión: {accuracy}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

