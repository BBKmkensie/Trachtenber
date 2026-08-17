import 'ut_math.dart';

int calculateTableDigit(
  int table,
  int digit,
  int neighbor,
  int position,
  int totalDigits,
) {
  switch (table) {
    case 2:
      return digit * 2;
    case 3:
      if (position == totalDigits - 1) {
        return 2 * (10 - digit) + 5 * (digit % 2);
      } else if (position == 0) {
        return (neighbor ~/ 2) - 2;
      }
      return 2 * (9 - digit) + (neighbor ~/ 2) + 5 * (digit % 2);
    case 4:
      if (position == totalDigits - 1) {
        return (10 - digit) + 5 * (digit % 2);
      } else if (position == 0) {
        return (neighbor ~/ 2) - 1;
      }
      return (9 - digit) + (neighbor ~/ 2) + 5 * (digit % 2);
    case 5:
      return (neighbor ~/ 2) + 5 * (digit % 2);
    case 6:
      return digit + (neighbor ~/ 2) + 5 * (digit % 2);
    case 7:
      return 2 * digit + (neighbor ~/ 2) + 5 * (digit % 2);
    case 8:
      if (position == totalDigits - 1) {
        return 2 * (10 - digit);
      } else if (position == 0) {
        return neighbor - 2;
      }
      return 2 * (9 - digit) + neighbor;
    case 9:
      if (position == totalDigits - 1) {
        return 10 - digit;
      } else if (position == 0) {
        return neighbor - 1;
      }
      return (9 - digit) + neighbor;
    case 11:
      return digit + neighbor;
    case 12:
      return 2 * digit + neighbor;
    default:
      return digit * table;
  }
}

List<String> generateTableExplanation(
  int table,
  int digit,
  int neighbor,
  int position,
  int totalDigits,
  int result,
  int carry,
) {
  final explanations = <String>[];
  final odd = digit % 2 == 1;
  switch (table) {
    case 2:
      explanations.add('$digit times 2 is ${(digit * 2).toString().padLeft(2, '0')}');
      break;
    case 3:
      if (position == totalDigits - 1) {
        explanations.add('2 times (10 minus $digit)${odd ? ' plus 5' : ''} equals $result');
      } else if (position == 0) {
        explanations.add('half of $neighbor minus 2 equals $result');
      } else {
        explanations.add('2 times (9 minus $digit) plus half $neighbor${odd ? ' plus 5' : ''} equals $result');
      }
      break;
    case 4:
      if (position == totalDigits - 1) {
        explanations.add('10 minus $digit${odd ? ' plus 5' : ''} equals $result');
      } else if (position == 0) {
        explanations.add('half of $neighbor minus 1 equals $result');
      } else {
        explanations.add('9 minus $digit plus half $neighbor${odd ? ' plus 5' : ''} equals $result');
      }
      break;
    case 5:
      explanations.add('half $neighbor${odd ? ' plus 5' : ''} equals $result');
      break;
    case 6:
      explanations.add('$digit plus half $neighbor${odd ? ' plus 5' : ''} equals $result');
      break;
    case 7:
      explanations.add('2 times $digit plus half $neighbor${odd ? ' plus 5' : ''} equals $result');
      break;
    case 8:
      if (position == totalDigits - 1) {
        explanations.add('2 times (10 minus $digit) equals $result');
      } else if (position == 0) {
        explanations.add('$neighbor minus 2 equals $result');
      } else {
        explanations.add('2 times (9 minus $digit) plus $neighbor equals $result');
      }
      break;
    case 9:
      if (position == totalDigits - 1) {
        explanations.add('10 minus $digit equals $result');
      } else if (position == 0) {
        explanations.add('$neighbor minus 1 equals $result');
      } else {
        explanations.add('(9 minus $digit) plus $neighbor equals $result');
      }
      break;
    case 11:
      explanations.add('$digit plus $neighbor equals $result');
      break;
    case 12:
      explanations.add('(2 times $digit) plus $neighbor equals $result');
      break;
  }
  if (carry > 0) {
    explanations.add('Add carried $carry');
  }
  return explanations;
}

List<SolutionStep> generateTableSolutionSteps(int num1, int table) {
  final num1Str = num1.toString();
  final paddedNum1 = num1Str.padLeft(num1Str.length + 1, '0');
  final digits = paddedNum1.split('').reversed.map(int.parse).toList();
  final result = <int>[];
  var carry = 0;
  final steps = <SolutionStep>[];

  for (var i = 0; i < digits.length; i++) {
    final digit = digits[i];
    final neighbor = i < digits.length - 1 ? digits[i + 1] : 0;
    final position = digits.length - 1 - i;
    var tempResult = calculateTableDigit(table, digit, neighbor, position, digits.length);
    tempResult += carry;
    final resultDigit = tempResult % 10;
    final newCarry = tempResult ~/ 10;
    final explanations = generateTableExplanation(
      table,
      digit,
      neighbor,
      position,
      digits.length,
      tempResult - carry,
      carry,
    );
    final partialResult = <int?>[];
    for (var j = digits.length - 1; j >= 0; j--) {
      if (j > i) {
        partialResult.add(0);
      } else if (j == i) {
        partialResult.add(resultDigit);
      } else {
        partialResult.add(result[digits.length - 1 - j]);
      }
    }
    final sumParts = <int>[tempResult - carry];
    if (carry > 0) sumParts.add(carry);
    final sum = sumParts.fold<int>(0, (a, b) => a + b);
    final sumStr = sum.toString();
    final sumText = '${sumParts.join('+')} = ${sumStr.length > 1 ? '${sumStr[0]}[u]${sumStr[1]}[/u]' : '[u]$sumStr[/u]'}';

    steps.add(SolutionStep(
      stepNumber: i + 1,
      calculations: explanations
          .map((exp) => UtCalculation(text: exp, product: tempResult, underlined: '$resultDigit'))
          .toList(),
      sumText: sumText,
      partialResult: partialResult,
      currentDigit: resultDigit,
      carry: newCarry,
      digitsRevealed: i + 1,
    ));
    result.add(resultDigit);
    carry = newCarry;
  }

  if (carry > 0) {
    final finalResult = [...result, carry].reversed.toList();
    steps.add(SolutionStep(
      stepNumber: steps.length + 1,
      calculations: [UtCalculation(text: 'Add carried $carry', product: carry)],
      partialResult: finalResult,
      carry: 0,
      digitsRevealed: finalResult.length,
      finalResult: finalResult.join(),
    ));
  }

  return steps;
}
