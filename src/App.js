import React, { useState, useEffect, useRef, useId } from 'react';
import './App.css';

/**
 * Cuadrícula única: flechas, multiplicando × multiplicador y resultado
 * comparten las mismas columnas para que cada dígito quede alineado.
 * Las flechas se agrupan por cifra de la derecha (como en la app de referencia).
 */
function UTStepBridgeDiagram({ paddedLHS, num2Str, pairs, children, theme = 'dark' }) {
  const uid = useId().replace(/:/g, '');
  const arrowId = `ut-arr-${uid}`;
  const lhs = paddedLHS.split('');
  const rhs = String(num2Str).split('');
  const lhsLen = lhs.length;
  const totalCells = lhsLen + 1 + rhs.length;
  const cellXPct = (cellIndex) => ((cellIndex + 0.5) / totalCells) * 100;
  const stroke = theme === 'light' ? '#333' : '#eaeaea';

  const bridgesByRhs = new Map();
  (pairs || []).forEach((p) => {
    if (!bridgesByRhs.has(p.rhsIdx)) bridgesByRhs.set(p.rhsIdx, []);
    if (!bridgesByRhs.get(p.rhsIdx).includes(p.lhsIdx)) {
      bridgesByRhs.get(p.rhsIdx).push(p.lhsIdx);
    }
  });
  const rhsOrder = [...bridgesByRhs.keys()].sort((a, b) => b - a);
  const yBot = 40;
  const viewH = Math.max(44, 12 + rhsOrder.length * 10);

  return (
    <div
      className={`ut-bridge-diagram ut-theme-${theme}`}
      style={{ '--ut-cols': totalCells }}
      aria-label={`Multiplicación ${paddedLHS} por ${num2Str}`}
    >
      <div className="ut-bridge-grid">
        <div className="ut-bridge-svg-layer" aria-hidden style={{ height: viewH }}>
          <svg
            className="ut-bridge-svg"
            viewBox={`0 0 100 ${viewH}`}
            preserveAspectRatio="none"
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
                <path d="M0,0 L5,2.5 L0,5 Z" fill={stroke} />
              </marker>
            </defs>
            {rhsOrder.map((rhsIdx, level) => {
              const lhsIdxs = bridgesByRhs.get(rhsIdx).slice().sort((a, b) => a - b);
              const yTop = 4 + level * 9;
              const xR = cellXPct(lhsLen + 1 + rhsIdx);
              const xLeft = cellXPct(lhsIdxs[0]);
              return (
                <g key={`br-${rhsIdx}`}>
                  <path
                    d={`M ${xR} ${yBot} L ${xR} ${yTop} L ${xLeft} ${yTop}`}
                    fill="none"
                    stroke={stroke}
                    strokeWidth="0.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {lhsIdxs.map((li) => (
                    <path
                      key={`drop-${rhsIdx}-${li}`}
                      d={`M ${cellXPct(li)} ${yTop} L ${cellXPct(li)} ${yBot}`}
                      fill="none"
                      stroke={stroke}
                      strokeWidth="0.7"
                      strokeLinecap="round"
                      markerEnd={`url(#${arrowId})`}
                    />
                  ))}
                </g>
              );
            })}
          </svg>
        </div>
        {lhs.map((d, i) => (
          <span
            key={`l-${i}`}
            className="ut-eq-cell ut-eq-cell--lhs"
            style={{ gridRow: 2, gridColumn: i + 1 }}
          >
            {d}
          </span>
        ))}
        <span className="ut-eq-op" style={{ gridRow: 2, gridColumn: lhsLen + 1 }}>
          ×
        </span>
        {rhs.map((d, i) => (
          <span
            key={`r-${i}`}
            className="ut-eq-cell ut-eq-cell--rhs"
            style={{ gridRow: 2, gridColumn: lhsLen + 2 + i }}
          >
            {d}
          </span>
        ))}
        <div
          className="ut-equation-ref-rule"
          style={{ gridRow: 3, gridColumn: `1 / span ${lhsLen}` }}
        />
        {React.Children.map(children, (child, i) =>
          child
            ? React.cloneElement(child, {
                style: {
                  ...(child.props.style || {}),
                  gridRow: 4,
                  gridColumn: i + 1
                }
              })
            : child
        )}
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
function getProductAnswerVariants(num1, num2, answer) {
  const w = getUTMultiplicandWidth(num1, num2 ?? String(num1).length);
  const plain = String(answer);
  const padded = plain.padStart(w, '0');
  return { plain, padded };
}

/** Ceros a la izquierda = cifras del multiplicador (regla UT). 19 × 72 → 0019. */
function getUTMultiplicandWidth(num1Raw, num2Raw) {
  const s1 = String(num1Raw);
  const s2 = String(num2Raw);
  return s1.length + s2.length;
}

function padUTMultiplicand(num1Raw, num2Raw) {
  return String(num1Raw).padStart(getUTMultiplicandWidth(num1Raw, num2Raw), '0');
}

function randomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Número aleatorio con entre minDigits y maxDigits cifras, sin ceros a la izquierda. */
function randomByDigits(minDigits, maxDigits) {
  const digits = randomIntInclusive(minDigits, maxDigits);
  const min = digits === 1 ? 1 : 10 ** (digits - 1);
  const max = 10 ** digits - 1;
  return randomIntInclusive(min, max);
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

  const generateQuestion = (opts = {}) => {
    const mode = opts.mode ?? gameMode;
    const diff = opts.difficulty ?? difficulty;
    let num1, num2, answer;
    
    // Generar pregunta según el modo de juego
    if (mode === 'ut') {
      // Unit Tables: multiplicaciones según dificultad
      if (diff === 'facil') {
        num1 = randomByDigits(1, 2);
        num2 = randomByDigits(1, 2);
      } else if (diff === 'medio') {
        num1 = randomByDigits(2, 3);
        num2 = randomByDigits(2, 3);
      } else {
        num1 = randomByDigits(3, 5);
        num2 = randomByDigits(3, 5);
      }
      answer = num1 * num2;
      const newQuestion = { num1, num2, operator: '×', answer };
      setQuestion(newQuestion);
      // Generar pasos de solución después de actualizar la pregunta
      setTimeout(() => generateSolutionSteps(num1, num2), 0);
    } else if (mode === '1-12') {
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
      
      switch (diff) {
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
          if (diff === 'facil') {
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

  const startGame = (mode = null, difficultyForQuestion = null) => {
    const nextMode = mode || gameMode;
    const nextDiff = difficultyForQuestion || difficulty;
    if (mode) {
      setGameMode(mode);
    }
    if (difficultyForQuestion) {
      setDifficulty(difficultyForQuestion);
    }
    setScreen('game');
    setGameActive(true);
    setScore(0);
    setTimeLeft(60);
    setCorrectAnswers(0);
    setTotalQuestions(0);
    generateQuestion({ mode: nextMode, difficulty: nextDiff });
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
    startGame(gameMode, selectedDifficulty);
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
    const placeNames = [
      'unidades',
      'decenas',
      'centenas',
      'millares',
      'decenas de millar',
      'centenas de millar'
    ];
    const fromRight = LHS.length - 1 - stepIndex;
    const placeLabel = placeNames[fromRight] || `posición ${fromRight + 1} desde la derecha`;

    const res = [];
    const calculations = [];

    for (let i = 0; i < RHS.length; i++) {
      const rhsIdx = RHS.length - i - 1;
      const lhsIdx = stepIndex + i;

      if (lhsIdx >= LHS.length) break;

      const a = parseInt(LHS[lhsIdx], 10);
      const b = parseInt(RHS[rhsIdx], 10);
      const mult1 = String(a * b).padStart(2, '0');
      res.push(parseInt(mult1[1], 10));
      calculations.push({
        text: `${a} × ${b} = ${mult1[0]}${mult1[1]}  →  unidades [u]${mult1[1]}[/u]`,
        product: a * b,
        underlined: mult1[1],
        hint: `Flecha: ${a} (izquierda) × ${b} (derecha). Nos quedamos con las unidades.`
      });

      if (lhsIdx + 1 < LHS.length) {
        const a2 = parseInt(LHS[lhsIdx + 1], 10);
        const mult2 = String(a2 * b).padStart(2, '0');
        res.push(parseInt(mult2[0], 10));
        calculations.push({
          text: `${a2} × ${b} = ${mult2[0]}${mult2[1]}  →  decenas [u]${mult2[0]}[/u]`,
          product: a2 * b,
          underlined: mult2[0],
          hint: `Del mismo ${b}: ${a2} × ${b}. Nos quedamos con las decenas.`
        });
      }
    }

    const sum = res.reduce((a, b) => a + b, 0);
    const carryFromPartial = sum >= 10 ? Math.floor(sum / 10) : 0;

    if (carryFromPartial > 0 && sum % 10 !== parseInt(answer[stepIndex], 10)) {
      const adjustedCarry = (parseInt(answer[stepIndex], 10) - (sum % 10) + 10) % 10;
      if (adjustedCarry > 0) {
        calculations.push({
          text: `Acarreo de la cifra anterior: [u]${adjustedCarry}[/u]`,
          product: adjustedCarry,
          underlined: String(adjustedCarry),
          hint: 'Se suma lo que se llevó de la columna de la derecha.'
        });
        res.push(adjustedCarry);
      }
    }

    const finalSum = res.reduce((a, b) => a + b, 0);
    const finalSumStr = String(finalSum);
    const digit = finalSum % 10;
    const carryOut = Math.floor(finalSum / 10);
    const sumLine =
      (res.length > 1 ? res.join(' + ') + ' = ' : '') +
      (finalSumStr.length > 1
        ? `${finalSumStr[0]}[u]${finalSumStr[1]}[/u]`
        : `[u]${finalSumStr}[/u]`);

    let sumHint = `Cifra del resultado: ${digit} (${placeLabel}).`;
    if (carryOut > 0) {
      sumHint += ` El ${carryOut} se lleva a la siguiente columna (hacia la izquierda).`;
    }

    return {
      title: `Cifra de las ${placeLabel}`,
      calculations,
      resultDigit: parseInt(answer[stepIndex], 10),
      carry: carryOut,
      sumText: sumLine,
      sumHint
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
      const RHS = num2Str;
      const paddedLHS = padUTMultiplicand(num1Str, RHS);
      const answer = (num1 * num2).toString().padStart(paddedLHS.length, '0');
      const zerosAdded = RHS.length;

      steps.push({
        stepNumber: 1,
        isPrep: true,
        title: 'Preparación',
        utColumnIndex: null,
        digitsRevealed: 0,
        calculations: [
          {
            text: `${num2} tiene ${zerosAdded} cifra${zerosAdded === 1 ? '' : 's'}, así que añadimos ${zerosAdded} cero${zerosAdded === 1 ? '' : 's'} a la izquierda de ${num1}.`,
            hint: `Queda ${paddedLHS.split('').join(' ')} × ${RHS.split('').join(' ')}.`
          },
          {
            text: 'Ahora calculamos cada cifra del resultado de derecha a izquierda (unidades, decenas, centenas…).',
            hint: 'Las flechas marcan qué dígitos se multiplican en cada paso.'
          }
        ],
        partialResult: paddedLHS.split('').map(() => ''),
        currentDigit: null,
        carry: 0
      });

      for (let stepIdx = paddedLHS.length - 1; stepIdx >= 0; stepIdx--) {
        const utStep = calculateUTStep(num1Str, RHS, stepIdx);
        const digitsRevealed = paddedLHS.length - stepIdx;
        const partialResult = [];
        for (let j = 0; j < paddedLHS.length; j++) {
          if (j < stepIdx) {
            partialResult.push('');
          } else {
            partialResult.push(parseInt(answer[j], 10));
          }
        }

        steps.push({
          stepNumber: steps.length + 1,
          isPrep: false,
          title: utStep.title,
          utColumnIndex: stepIdx,
          digitsRevealed,
          multiplier: parseInt(RHS, 10),
          calculations: utStep.calculations,
          sumText: utStep.sumText,
          sumHint: utStep.sumHint,
          partialResult,
          currentDigit: utStep.resultDigit,
          carry: utStep.carry
        });
      }
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
      const num1Str = gameMode === 'ut'
        ? padUTMultiplicand(question.num1, question.num2)
        : question.num1.toString().padStart(5, '0');
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
    setCurrentStep(0);
    solutionScreenEnteredRef.current = false;
    if (question && question.num1 != null && question.num2 != null) {
      generateSolutionSteps(question.num1, question.num2);
    }
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
      const { plain, padded } = getProductAnswerVariants(question.num1, question.num2, question.answer);
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
                const padded = padUTMultiplicand(utNumber1 || '123', utNumber2 || '45');
                setUtArrowStep((s) => Math.min(s + 1, padded.length));
              }}
            >
              L
            </button>
            <div className="rule-ut-diagram">
              {(() => {
                const n1 = utNumber1 || '123';
                const n2 = utNumber2 || '45';
                const paddedLHS = padUTMultiplicand(n1, n2);
                const product = ((parseInt(n1, 10) || 0) * (parseInt(n2, 10) || 0))
                  .toString()
                  .padStart(paddedLHS.length, '0');
                const totalSteps = paddedLHS.length;
                const revealed = Math.max(0, Math.min(utArrowStep, totalSteps));
                const stepIndex = revealed === 0 ? null : paddedLHS.length - revealed;
                const pairs = stepIndex === null
                  ? []
                  : getUTMultiplyPairsForStep(n1, n2, stepIndex).pairs;
                const utStep = stepIndex === null ? null : calculateUTStep(n1, n2, stepIndex);
                return (
                  <>
                    <UTStepBridgeDiagram
                      theme="light"
                      paddedLHS={paddedLHS}
                      num2Str={n2}
                      pairs={pairs}
                    >
                      {product.split('').map((d, i) => {
                        const positionFromRight = product.length - 1 - i;
                        const visible = positionFromRight < revealed;
                        const isCurrent = stepIndex !== null && i === stepIndex;
                        return (
                          <span
                            key={`res-${i}`}
                            className={`ut-res-slot ${visible ? 'ut-res-slot--visible' : 'ut-res-slot--placeholder'}`}
                          >
                            <span className={`result-digit ${isCurrent ? 'current' : ''}`}>
                              {visible ? d : '\u00a0'}
                            </span>
                          </span>
                        );
                      })}
                    </UTStepBridgeDiagram>
                    <div className="rule-ut-step-help">
                      {revealed === 0 ? (
                        <>
                          <strong>Preparación</strong>
                          <p>
                            {n2} tiene {n2.length} cifra{n2.length === 1 ? '' : 's'}, así que
                            escribimos {n1} como {paddedLHS.split('').join(' ')}.
                            Pulsa <b>L</b> para el paso 1 de {totalSteps} (de derecha a izquierda).
                          </p>
                        </>
                      ) : (
                        <>
                          <strong>
                            Paso {revealed} de {totalSteps}
                            {utStep && utStep.title ? ` · ${utStep.title}` : ''}
                          </strong>
                          {utStep && utStep.calculations.map((calc, idx) => (
                            <p key={idx}>
                              {parseMarkupText(calc.text).map((part, partIdx) => (
                                part.underlined ? (
                                  <span key={partIdx} className="underlined">{part.text}</span>
                                ) : (
                                  <span key={partIdx}>{part.text}</span>
                                )
                              ))}
                              {calc.hint ? <span className="rule-ut-step-hint"> {calc.hint}</span> : null}
                            </p>
                          ))}
                          {utStep && utStep.sumText && (
                            <p className="rule-ut-step-sum">
                              {parseMarkupText(utStep.sumText).map((part, partIdx) => (
                                part.underlined ? (
                                  <span key={partIdx} className="underlined">{part.text}</span>
                                ) : (
                                  <span key={partIdx}>{part.text}</span>
                                )
                              ))}
                              {utStep.sumHint ? ` ${utStep.sumHint}` : ''}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
            <button 
              className="widget-btn widget-btn-right" 
              onClick={() => {
                setUtArrowStep((s) => Math.max(s - 1, 0));
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
                  setUtArrowStep(0);
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
                  setUtArrowStep(0);
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
    const num2Str = question.num2.toString();
    const rawNum1 = question.num1.toString();
    const paddedLHS = padUTMultiplicand(rawNum1, num2Str);
    const num1Str = gameMode === 'ut' ? paddedLHS : rawNum1.padStart(5, '0');
    const isUTMode = gameMode === 'ut';
    const isUTCalcStep = step && !step.isPrep && typeof step.utColumnIndex === 'number';
    const utVisual = isUTMode
      ? (isUTCalcStep
          ? getUTMultiplyPairsForStep(rawNum1, num2Str, step.utColumnIndex)
          : { paddedLHS, pairs: [] })
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
                {step && step.title ? (
                  <span className="solution-step-title"> · {step.title}</span>
                ) : null}
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
                  {utVisual ? (
                    <>
                      <div className="ut-solution-stage">
                        <span className="ut-badge ut-badge-l" title="Término izquierdo">L</span>
                        <UTStepBridgeDiagram
                          paddedLHS={utVisual.paddedLHS}
                          num2Str={num2Str}
                          pairs={utVisual.pairs}
                        >
                          {(step.partialResult || paddedLHS.split('')).map((d, i) => {
                            const totalDigits = (step.partialResult || paddedLHS).length;
                            const revealed = typeof step.digitsRevealed === 'number' ? step.digitsRevealed : 0;
                            const positionFromRight = totalDigits - 1 - i;
                            const visible = d !== '' && d !== undefined && positionFromRight < revealed;
                            const isCurrentDigit = isUTCalcStep && i === step.utColumnIndex;
                            const carryValue = step.carry || 0;
                            const showCarry = carryValue > 0 && isCurrentDigit;
                            return (
                              <span
                                key={i}
                                className={`ut-res-slot ${visible ? 'ut-res-slot--visible' : 'ut-res-slot--placeholder'}`}
                              >
                                <span className="result-digit-container">
                                  {visible && showCarry && (
                                    <span className="carry-dots">
                                      {Array.from({ length: carryValue }, (_, idx) => (
                                        <span key={idx} className="carry-dot">
                                          .
                                        </span>
                                      ))}
                                    </span>
                                  )}
                                  <span className={`result-digit ${isCurrentDigit ? 'current' : ''}`}>
                                    {visible ? d : '\u00a0'}
                                  </span>
                                </span>
                              </span>
                            );
                          })}
                        </UTStepBridgeDiagram>
                        <span className="ut-badge ut-badge-r" title="Término derecho">R</span>
                      </div>
                      <div className="ut-operand-boxes">
                        <div className="ut-operand-box">{question.num1}</div>
                        <div className="ut-operand-box">{question.num2}</div>
                      </div>
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
                  {!isUTMode && (
                  <p className="solution-partial-note">
                    <strong>Resultado parcial:</strong> solo aparecen las cifras ya calculadas (de derecha a
                    izquierda). El <strong>resultado final</strong> de la multiplicación es{' '}
                    {(() => {
                      const { plain, padded } = getProductAnswerVariants(question.num1, question.num2, question.answer);
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
                  {!isUTMode && <div className="divider-line divider-line--ut"></div>}
                  {!isUTMode && (
                  <div className="result-display">
                    {step.partialResult &&
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
                    })}
                    {step.finalResult && !step.partialResult && (
                      step.finalResult.split('').map((d, i) => (
                        <span key={i} className="result-digit">{d}</span>
                      ))
                    )}
                  </div>
                  )}
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
    const num1Str = gameMode === 'ut'
      ? padUTMultiplicand(question.num1, question.num2)
      : question.num1.toString().padStart(5, '0');
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
            <div
              className="ut-game-equation"
              aria-label="Enunciado"
              style={{ '--eq-units': num1Str.length + num2Str.length + 1 }}
            >
              <div className="ut-game-lhs">
                <div className="ut-game-lhs-digits">
                  {num1Str.split('').map((d, i) => (
                    <span key={i} className="problem-digit">
                      {d}
                    </span>
                  ))}
                </div>
                <div className="ut-game-lhs-rule" />
                <div className="answer-field-container">
                  <div className="answer-digits-row">
                    {num1Str.split('').slice(0, num1Str.length - userAnswer.length).map((_, i) => (
                      <span key={`empty-${i}`} className="answer-digit empty-digit"></span>
                    ))}
                    {userAnswer.split('').map((d, i) => {
                      const positionFromRight = userAnswer.length - 1 - i;
                      const carryCount = carryDots[positionFromRight] || 0;
                      return (
                        <span key={i} className="answer-digit-container" style={{ position: 'relative', display: 'inline-block' }}>
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
              <div className="ut-game-rhs-block">
                <span className="problem-operator ut-game-op">×</span>
                <div className="ut-game-rhs">
                  {num2Str.split('').map((d, i) => (
                    <span key={i} className="problem-digit">
                      {d}
                    </span>
                  ))}
                </div>
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

