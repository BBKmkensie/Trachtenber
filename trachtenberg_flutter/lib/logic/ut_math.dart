// Lógica UT del método Trachtenberg (port desde App.js).

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
  final List<UtCalculation> calculations;
  final int resultDigit;
  final int carry;
  final String sumText;
  final String sumHint;
  const UtStepResult({
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
  final int? utColumnIndex;
  final List<UtCalculation> calculations;
  final String? sumText;
  final String? sumHint;
  final List<int> partialResult;
  final int currentDigit;
  final int carry;
  final String? finalResult;

  const SolutionStep({
    required this.stepNumber,
    this.utColumnIndex,
    required this.calculations,
    this.sumText,
    this.sumHint,
    required this.partialResult,
    required this.currentDigit,
    required this.carry,
    this.finalResult,
  });
}

int getUTMultiplicandWidth(String num1Raw, String num2Raw) {
  return [5, num1Raw.length + num2Raw.length].reduce((a, b) => a > b ? a : b);
}

String padUTMultiplicand(String num1Raw, String num2Raw) {
  return num1Raw.padLeft(getUTMultiplicandWidth(num1Raw, num2Raw), '0');
}

bool multiplicationAnswerMatches(String userInput, int correctAnswer) {
  final t = userInput.trim();
  if (t.isEmpty) return false;
  final n = int.tryParse(t);
  return n != null && n == correctAnswer;
}

({String plain, String padded}) getProductAnswerVariants(int num1, int answer) {
  final num1Str = num1.toString().padLeft(5, '0');
  final w = num1Str.length;
  final plain = answer.toString();
  final padded = plain.padLeft(w, '0');
  return (plain: plain, padded: padded);
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

UtStepResult calculateUTStep(String num1Str, String num2Str, int stepIndex) {
  final lhs = padUTMultiplicand(num1Str, num2Str);
  final rhs = num2Str;
  final product = int.parse(num1Str) * int.parse(num2Str);
  final answer = product.toString().padLeft(lhs.length, '0');

  final res = <int>[];
  final calculations = <UtCalculation>[];

  for (var i = 0; i < rhs.length; i++) {
    final rhsIdx = rhs.length - i - 1;
    final lhsIdx = stepIndex + i;
    if (lhsIdx >= lhs.length) break;

    final mult1 = (int.parse(lhs[lhsIdx]) * int.parse(rhs[rhsIdx])).toString().padLeft(2, '0');
    res.add(int.parse(mult1[1]));
    calculations.add(UtCalculation(
      text: '${lhs[lhsIdx]} por ${rhs[rhsIdx]} es ${mult1[0]}[u]${mult1[1]}[/u]',
      product: int.parse(mult1),
      underlined: mult1[1],
      hint: 'Para este producto usamos la cifra de la derecha (unidades).',
    ));

    if (lhsIdx + 1 < lhs.length) {
      final mult2 =
          (int.parse(lhs[lhsIdx + 1]) * int.parse(rhs[rhsIdx])).toString().padLeft(2, '0');
      res.add(int.parse(mult2[0]));
      calculations.add(UtCalculation(
        text: '${lhs[lhsIdx + 1]} por ${rhs[rhsIdx]} es [u]${mult2[0]}[/u]${mult2[1]}',
        product: int.parse(mult2),
        underlined: mult2[0],
        hint: 'Para este producto usamos la cifra de la izquierda (decenas).',
      ));
    }
  }

  var sum = res.fold<int>(0, (a, b) => a + b);
  final carryFromPartial = sum >= 10 ? sum ~/ 10 : 0;

  if (carryFromPartial > 0 && sum % 10 != int.parse(answer[stepIndex])) {
    final adjustedCarry = (int.parse(answer[stepIndex]) - sum % 10 + 10) % 10;
    if (adjustedCarry > 0) {
      calculations.add(UtCalculation(
        text: 'Agregar [u]$adjustedCarry[/u] llevado',
        product: adjustedCarry,
        underlined: adjustedCarry.toString(),
        hint: 'Lo que arrastramos de la columna anterior.',
      ));
      res.add(adjustedCarry);
    }
  }

  sum = res.fold<int>(0, (a, b) => a + b);
  final finalSumStr = sum.toString();
  final sumLine = res.length > 1
      ? '${res.join(' + ')} = ${finalSumStr.length > 1 ? '${finalSumStr[0]}[u]${finalSumStr[1]}[/u]' : '[u]$finalSumStr[/u]'}'
      : '[u]$finalSumStr[/u]';

  return UtStepResult(
    calculations: calculations,
    resultDigit: int.parse(answer[stepIndex]),
    carry: sum ~/ 10,
    sumText: sumLine,
    sumHint: res.length > 1
        ? 'El dígito subrayado del total es la cifra del resultado en esta columna; lo de más a la izquierda es el arrastre.'
        : 'Esta cifra es el dígito del resultado en esta columna.',
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
  final rhs = num2Str;
  final paddedLHS = padUTMultiplicand(num1Str, rhs);
  final answer = (num1 * num2).toString().padLeft(paddedLHS.length, '0');
  final steps = <SolutionStep>[];

  for (var stepIdx = paddedLHS.length - 1; stepIdx >= 0; stepIdx--) {
    final utStep = calculateUTStep(num1Str, rhs, stepIdx);
    final partialResult = <int>[];
    for (var j = 0; j < paddedLHS.length; j++) {
      if (j < stepIdx) {
        partialResult.add(0);
      } else if (j == stepIdx) {
        partialResult.add(utStep.resultDigit);
      } else {
        partialResult.add(int.parse(answer[j]));
      }
    }

    steps.add(SolutionStep(
      stepNumber: paddedLHS.length - stepIdx,
      utColumnIndex: stepIdx,
      calculations: utStep.calculations,
      sumText: utStep.sumText,
      sumHint: utStep.sumHint,
      partialResult: partialResult,
      currentDigit: utStep.resultDigit,
      carry: utStep.carry,
    ));
  }

  if (steps.isNotEmpty) {
    final finalResult = (num1 * num2).toString();
    final finalPadded = finalResult.padLeft(getUTMultiplicandWidth(num1Str, num2Str), '0');
    final last = steps.last;
    final compare = finalPadded;
    if (last.partialResult.join() != compare) {
      steps[steps.length - 1] = SolutionStep(
        stepNumber: last.stepNumber,
        utColumnIndex: last.utColumnIndex,
        calculations: last.calculations,
        sumText: last.sumText,
        sumHint: last.sumHint,
        partialResult: compare.split('').map(int.parse).toList(),
        currentDigit: last.currentDigit,
        carry: last.carry,
        finalResult: finalResult,
      );
    } else {
      steps[steps.length - 1] = SolutionStep(
        stepNumber: last.stepNumber,
        utColumnIndex: last.utColumnIndex,
        calculations: last.calculations,
        sumText: last.sumText,
        sumHint: last.sumHint,
        partialResult: last.partialResult,
        currentDigit: last.currentDigit,
        carry: last.carry,
        finalResult: finalResult,
      );
    }
  }

  return steps;
}
