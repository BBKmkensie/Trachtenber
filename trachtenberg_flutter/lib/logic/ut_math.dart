// Lógica UT del método Trachtenberg (port de App.js).

class MarkupPart {
  final String text;
  final bool underlined;
  const MarkupPart(this.text, {this.underlined = false});
}

class UtCalculation {
  final String text;
  final int product;
  final String? underlined;
  final String? hint;
  const UtCalculation({
    required this.text,
    required this.product,
    this.underlined,
    this.hint,
  });
}

class UtStepResult {
  final String title;
  final List<UtCalculation> calculations;
  final int resultDigit;
  final int carry;
  final String sumText;
  final String sumHint;
  const UtStepResult({
    required this.title,
    required this.calculations,
    required this.resultDigit,
    required this.carry,
    required this.sumText,
    required this.sumHint,
  });
}

class UtPair {
  final int lhsIdx;
  final int rhsIdx;
  final String lhsDigit;
  final String rhsDigit;
  const UtPair({
    required this.lhsIdx,
    required this.rhsIdx,
    required this.lhsDigit,
    required this.rhsDigit,
  });
}

class SolutionStep {
  final int stepNumber;
  final bool isPrep;
  final String? title;
  final int? utColumnIndex;
  final int digitsRevealed;
  final List<UtCalculation> calculations;
  final String? sumText;
  final String? sumHint;
  final List<int?> partialResult;
  final int? currentDigit;
  final int carry;
  final String? finalResult;

  const SolutionStep({
    required this.stepNumber,
    this.isPrep = false,
    this.title,
    this.utColumnIndex,
    this.digitsRevealed = 0,
    required this.calculations,
    this.sumText,
    this.sumHint,
    required this.partialResult,
    this.currentDigit,
    this.carry = 0,
    this.finalResult,
  });
}

/// Ceros a la izquierda = cifras del multiplicador. 19 × 72 → 0019.
int getUTMultiplicandWidth(Object num1Raw, Object num2Raw) {
  return num1Raw.toString().length + num2Raw.toString().length;
}

String padUTMultiplicand(Object num1Raw, Object num2Raw) {
  return num1Raw.toString().padLeft(getUTMultiplicandWidth(num1Raw, num2Raw), '0');
}

bool multiplicationAnswerMatches(String userInput, int correctAnswer) {
  final t = userInput.trim();
  if (t.isEmpty) return false;
  final n = int.tryParse(t);
  return n != null && n == correctAnswer;
}

({String plain, String padded}) getProductAnswerVariants(
  Object num1,
  Object num2,
  int answer,
) {
  final w = getUTMultiplicandWidth(num1, num2);
  final plain = answer.toString();
  return (plain: plain, padded: plain.padLeft(w, '0'));
}

List<MarkupPart> parseMarkupText(String text) {
  final parts = <MarkupPart>[];
  final regex = RegExp(r'\[u\](.*?)\[/u\]');
  var lastIndex = 0;
  for (final match in regex.allMatches(text)) {
    if (match.start > lastIndex) {
      parts.add(MarkupPart(text.substring(lastIndex, match.start)));
    }
    parts.add(MarkupPart(match.group(1)!, underlined: true));
    lastIndex = match.end;
  }
  if (lastIndex < text.length) {
    parts.add(MarkupPart(text.substring(lastIndex)));
  }
  if (parts.isEmpty) {
    parts.add(MarkupPart(text));
  }
  return parts;
}

const _placeNames = [
  'unidades',
  'decenas',
  'centenas',
  'millares',
  'decenas de millar',
  'centenas de millar',
];

UtStepResult calculateUTStep(String num1Str, String num2Str, int stepIndex) {
  final lhs = padUTMultiplicand(num1Str, num2Str);
  final rhs = num2Str;
  final product = int.parse(num1Str) * int.parse(num2Str);
  final answer = product.toString().padLeft(lhs.length, '0');
  final fromRight = lhs.length - 1 - stepIndex;
  final placeLabel = fromRight < _placeNames.length
      ? _placeNames[fromRight]
      : 'posición ${fromRight + 1} desde la derecha';

  final res = <int>[];
  final calculations = <UtCalculation>[];

  for (var i = 0; i < rhs.length; i++) {
    final rhsIdx = rhs.length - i - 1;
    final lhsIdx = stepIndex + i;
    if (lhsIdx >= lhs.length) break;

    final a = int.parse(lhs[lhsIdx]);
    final b = int.parse(rhs[rhsIdx]);
    final mult1 = (a * b).toString().padLeft(2, '0');
    res.add(int.parse(mult1[1]));
    calculations.add(UtCalculation(
      text: '$a × $b = ${mult1[0]}${mult1[1]}  →  unidades [u]${mult1[1]}[/u]',
      product: a * b,
      underlined: mult1[1],
      hint: 'Flecha: $a (izquierda) × $b (derecha). Nos quedamos con las unidades.',
    ));

    if (lhsIdx + 1 < lhs.length) {
      final a2 = int.parse(lhs[lhsIdx + 1]);
      final mult2 = (a2 * b).toString().padLeft(2, '0');
      res.add(int.parse(mult2[0]));
      calculations.add(UtCalculation(
        text: '$a2 × $b = ${mult2[0]}${mult2[1]}  →  decenas [u]${mult2[0]}[/u]',
        product: a2 * b,
        underlined: mult2[0],
        hint: 'Del mismo $b: $a2 × $b. Nos quedamos con las decenas.',
      ));
    }
  }

  var sum = res.fold<int>(0, (a, b) => a + b);
  final carryFromPartial = sum >= 10 ? sum ~/ 10 : 0;

  if (carryFromPartial > 0 && sum % 10 != int.parse(answer[stepIndex])) {
    final adjustedCarry = (int.parse(answer[stepIndex]) - (sum % 10) + 10) % 10;
    if (adjustedCarry > 0) {
      calculations.add(UtCalculation(
        text: 'Acarreo de la cifra anterior: [u]$adjustedCarry[/u]',
        product: adjustedCarry,
        underlined: '$adjustedCarry',
        hint: 'Se suma lo que se llevó de la columna de la derecha.',
      ));
      res.add(adjustedCarry);
    }
  }

  sum = res.fold<int>(0, (a, b) => a + b);
  final finalSumStr = sum.toString();
  final digit = sum % 10;
  final carryOut = sum ~/ 10;
  final sumLine = (res.length > 1 ? '${res.join(' + ')} = ' : '') +
      (finalSumStr.length > 1
          ? '${finalSumStr[0]}[u]${finalSumStr[1]}[/u]'
          : '[u]$finalSumStr[/u]');

  var sumHint = 'Cifra del resultado: $digit ($placeLabel).';
  if (carryOut > 0) {
    sumHint += ' El $carryOut se lleva a la siguiente columna (hacia la izquierda).';
  }

  return UtStepResult(
    title: 'Cifra de las $placeLabel',
    calculations: calculations,
    resultDigit: int.parse(answer[stepIndex]),
    carry: carryOut,
    sumText: sumLine,
    sumHint: sumHint,
  );
}

({String paddedLHS, List<UtPair> pairs}) getUTMultiplyPairsForStep(
  String num1Raw,
  String num2Raw,
  int stepIndex,
) {
  final lhs = padUTMultiplicand(num1Raw, num2Raw);
  final rhs = num2Raw;
  final pairs = <UtPair>[];

  for (var i = 0; i < rhs.length; i++) {
    final rhsIdx = rhs.length - i - 1;
    final lhsIdx = stepIndex + i;
    if (lhsIdx >= lhs.length) break;
    pairs.add(UtPair(
      lhsIdx: lhsIdx,
      rhsIdx: rhsIdx,
      lhsDigit: lhs[lhsIdx],
      rhsDigit: rhs[rhsIdx],
    ));
    if (lhsIdx + 1 < lhs.length) {
      pairs.add(UtPair(
        lhsIdx: lhsIdx + 1,
        rhsIdx: rhsIdx,
        lhsDigit: lhs[lhsIdx + 1],
        rhsDigit: rhs[rhsIdx],
      ));
    }
  }
  return (paddedLHS: lhs, pairs: pairs);
}

List<SolutionStep> generateUtSolutionSteps(int num1, int num2) {
  final num1Str = num1.toString();
  final num2Str = num2.toString();
  final paddedLHS = padUTMultiplicand(num1Str, num2Str);
  final answer = (num1 * num2).toString().padLeft(paddedLHS.length, '0');
  final zerosAdded = num2Str.length;
  final steps = <SolutionStep>[];

  steps.add(SolutionStep(
    stepNumber: 1,
    isPrep: true,
    title: 'Preparación',
    digitsRevealed: 0,
    calculations: [
      UtCalculation(
        text:
            '$num2 tiene $zerosAdded cifra${zerosAdded == 1 ? '' : 's'}, así que añadimos $zerosAdded cero${zerosAdded == 1 ? '' : 's'} a la izquierda de $num1.',
        product: 0,
        hint: 'Queda ${paddedLHS.split('').join(' ')} × ${num2Str.split('').join(' ')}.',
      ),
      const UtCalculation(
        text:
            'Ahora calculamos cada cifra del resultado de derecha a izquierda (unidades, decenas, centenas…).',
        product: 0,
        hint: 'Las flechas marcan qué dígitos se multiplican en cada paso.',
      ),
    ],
    partialResult: List<int?>.filled(paddedLHS.length, null),
  ));

  for (var stepIdx = paddedLHS.length - 1; stepIdx >= 0; stepIdx--) {
    final utStep = calculateUTStep(num1Str, num2Str, stepIdx);
    final digitsRevealed = paddedLHS.length - stepIdx;
    final partialResult = <int?>[];
    for (var j = 0; j < paddedLHS.length; j++) {
      if (j < stepIdx) {
        partialResult.add(null);
      } else {
        partialResult.add(int.parse(answer[j]));
      }
    }
    steps.add(SolutionStep(
      stepNumber: steps.length + 1,
      title: utStep.title,
      utColumnIndex: stepIdx,
      digitsRevealed: digitsRevealed,
      calculations: utStep.calculations,
      sumText: utStep.sumText,
      sumHint: utStep.sumHint,
      partialResult: partialResult,
      currentDigit: utStep.resultDigit,
      carry: utStep.carry,
    ));
  }

  if (steps.isNotEmpty) {
    final last = steps.last;
    steps[steps.length - 1] = SolutionStep(
      stepNumber: last.stepNumber,
      isPrep: last.isPrep,
      title: last.title,
      utColumnIndex: last.utColumnIndex,
      digitsRevealed: last.digitsRevealed,
      calculations: last.calculations,
      sumText: last.sumText,
      sumHint: last.sumHint,
      partialResult: last.partialResult,
      currentDigit: last.currentDigit,
      carry: last.carry,
      finalResult: (num1 * num2).toString(),
    );
  }

  return steps;
}
