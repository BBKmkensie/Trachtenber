import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_state.dart';
import '../logic/ut_math.dart';
import '../theme/app_theme.dart';
import '../widgets/markup_text.dart';
import '../widgets/ut_bridge_diagram.dart';

class SolutionScreen extends StatelessWidget {
  const SolutionScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    if (state.solutionSteps.isEmpty) {
      return const Scaffold(
        body: Center(child: Text('Sin pasos de solución')),
      );
    }

    final safeStep = state.currentStep.clamp(0, state.solutionSteps.length - 1);
    final step = state.solutionSteps[safeStep];
    final rawNum1 = state.question.num1.toString();
    final num2Str = state.question.num2.toString();
    final isUT = step.utColumnIndex != null;
    final utVisual = isUT
        ? getUTMultiplyPairsForStep(rawNum1, num2Str, step.utColumnIndex!)
        : null;

    return Scaffold(
      backgroundColor: AppTheme.solutionBg,
      body: SafeArea(
        child: Column(
          children: [
            _header(context, state, step, safeStep),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    ...step.calculations.map(
                      (c) => Padding(
                        padding: const EdgeInsets.only(bottom: 8),
                        child: MarkupText(
                          c.text,
                          style: const TextStyle(color: Color(0xFFeaeaea), fontSize: 16),
                          underlinedStyle: const TextStyle(
                            color: Color(0xFFeaeaea),
                            fontSize: 16,
                            decoration: TextDecoration.underline,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    if (step.sumText != null) ...[
                      const SizedBox(height: 8),
                      MarkupText(
                        step.sumText!,
                        style: const TextStyle(color: Color(0xFFeaeaea), fontSize: 16),
                        underlinedStyle: const TextStyle(
                          color: Color(0xFFeaeaea),
                          fontSize: 16,
                          decoration: TextDecoration.underline,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                    const SizedBox(height: 24),
                    if (utVisual != null && utVisual.pairs.isNotEmpty)
                      UtBridgeDiagram(
                        paddedLHS: utVisual.paddedLHS,
                        num2Str: num2Str,
                        pairs: utVisual.pairs,
                      ),
                    const SizedBox(height: 16),
                    if (isUT && step.partialResult.isNotEmpty)
                      _partialAnswer(step),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: state.closeSolution,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Colors.white54),
                  ),
                  child: const Text('Cerrar'),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _header(
    BuildContext context,
    AppState state,
    SolutionStep step,
    int safeStep,
  ) {
    return Container(
      width: double.infinity,
      color: const Color(0xFF0f3460),
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
      child: Column(
        children: [
          const Text(
            'Solución paso a paso',
            style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 8),
          Container(height: 3, color: AppTheme.accent),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (safeStep > 0)
                _bfBtn('B', state.prevStep)
              else
                const SizedBox(width: 48),
              Expanded(
                child: Text(
                  'Paso ${step.stepNumber}',
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              _bfBtn(
                'F',
                safeStep < state.solutionSteps.length - 1 ? state.nextStep : null,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _bfBtn(String label, VoidCallback? onTap) {
    return SizedBox(
      width: 48,
      height: 48,
      child: Material(
        color: onTap != null ? Colors.white.withOpacity(0.15) : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(8),
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                color: onTap != null ? Colors.white : Colors.white38,
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _partialAnswer(SolutionStep step) {
    final total = step.partialResult.length;
    final stepNumber = step.stepNumber;
    final colActive = step.utColumnIndex!;
    final carryValue = step.carry;

    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(total, (i) {
        final posFromRight = total - 1 - i;
        final visible = posFromRight < stepNumber;
        final isCurrent = i == colActive;
        final showCarry = carryValue > 0 && isCurrent;

        return SizedBox(
          width: 28,
          child: Column(
            children: [
              if (visible && isCurrent)
                const Text('·', style: TextStyle(color: Color(0xFFf093fb), fontSize: 20))
              else
                const SizedBox(height: 20),
              Text(
                visible ? '${step.partialResult[i]}' : ' ',
                style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: isCurrent && visible ? const Color(0xFFf093fb) : const Color(0xFFeaeaea),
                ),
              ),
              if (visible && showCarry)
                Text('.' * carryValue, style: const TextStyle(color: Color(0xFFf093fb))),
            ],
          ),
        );
      }),
    );
  }
}
