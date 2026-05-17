import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/numeric_keypad.dart';

class GameScreen extends StatelessWidget {
  const GameScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final num1Str = state.question.num1.toString().padLeft(5, '0');
    final num2Str = state.question.num2.toString();
    final blocked = state.hasIncorrectFeedback;

    return Scaffold(
      backgroundColor: AppTheme.gameBeige,
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            children: [
              Row(
                children: [
                  TextButton(
                    onPressed: blocked ? null : state.stopGame,
                    child: Text('Atrás', style: TextStyle(color: blocked ? Colors.grey : Colors.black87)),
                  ),
                  const Spacer(),
                  ElevatedButton(
                    onPressed: blocked ? null : state.showSolution,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.solveGreen,
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('Resolver'),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _equation(num1Str, num2Str),
              const SizedBox(height: 12),
              _answerRow(num1Str, state.userAnswer, state.carryDots),
              if (state.feedback.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  state.feedback,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: state.feedback.contains('Incorrecto')
                        ? const Color(0xFFef4444)
                        : state.feedback.contains('Correcto')
                            ? const Color(0xFF22c55e)
                            : Colors.black87,
                  ),
                ),
              ],
              const Spacer(),
              NumericKeypad(onKey: state.keypadInput),
            ],
          ),
        ),
      ),
    );
  }

  Widget _equation(String num1Str, String num2Str) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Column(
          children: [
            Row(
              children: num1Str
                  .split('')
                  .map((d) => _digit(d, const Color(0xFF333333)))
                  .toList(),
            ),
            Container(
              height: 2,
              width: num1Str.length * 26.0,
              color: const Color(0xFF333333),
            ),
          ],
        ),
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 12),
          child: Text('×', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
        ),
        Row(
          children: num2Str.split('').map((d) => _digit(d, const Color(0xFF333333))).toList(),
        ),
      ],
    );
  }

  Widget _answerRow(String num1Str, String userAnswer, Map<int, int> carryDots) {
    final emptyCount = num1Str.length - userAnswer.length;
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        ...List.generate(emptyCount, (_) => const SizedBox(width: 26, height: 32)),
        ...userAnswer.split('').asMap().entries.map((e) {
          final i = e.key;
          final d = e.value;
          final posFromRight = userAnswer.length - 1 - i;
          final carryCount = carryDots[posFromRight] ?? 0;
          return SizedBox(
            width: 26,
            child: Column(
              children: [
                if (carryCount > 0)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(
                      carryCount,
                      (_) => Container(
                        width: 4,
                        height: 4,
                        margin: const EdgeInsets.symmetric(horizontal: 1),
                        decoration: const BoxDecoration(
                          color: Color(0xFF333333),
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                  )
                else
                  const SizedBox(height: 8),
                Text(
                  d,
                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _digit(String d, Color color) {
    return SizedBox(
      width: 26,
      child: Text(
        d,
        textAlign: TextAlign.center,
        style: TextStyle(fontSize: 22, fontWeight: FontWeight.w600, color: color),
      ),
    );
  }
}
