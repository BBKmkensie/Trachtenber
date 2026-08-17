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
        backgroundColor: AppTheme.solutionBg,
        body: Center(child: Text('Sin pasos de solución')),
      );
    }

    final safeStep = state.currentStep.clamp(0, state.solutionSteps.length - 1);
    final step = state.solutionSteps[safeStep];
    final rawNum1 = state.question.num1.toString();
    final num2Str = state.question.num2.toString();
    final paddedLHS = padUTMultiplicand(rawNum1, num2Str);
    final isPrep = step.isPrep;
    final isUt = state.gameMode == GameMode.ut;
    final utVisual = isUt
        ? (isPrep
            ? (paddedLHS: paddedLHS, pairs: <UtPair>[])
            : (step.utColumnIndex != null
                ? getUTMultiplyPairsForStep(rawNum1, num2Str, step.utColumnIndex!)
                : null))
        : null;

    return Scaffold(
      backgroundColor: AppTheme.solutionBg,
      body: SafeArea(
        child: Column(
          children: [
            _header(state, step, safeStep),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    ...step.calculations.map(
                      (c) => Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Column(
                          children: [
                            MarkupText(
                              c.text,
                              style: const TextStyle(color: Color(0xFFeaeaea), fontSize: 16),
                              underlinedStyle: const TextStyle(
                                color: AppTheme.currentAmber,
                                fontSize: 16,
                                decoration: TextDecoration.underline,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            if (c.hint != null)
                              Padding(
                                padding: const EdgeInsets.only(top: 4),
                                child: Text(
                                  c.hint!,
                                  textAlign: TextAlign.center,
                                  style: TextStyle(color: Colors.white.withOpacity(0.62), fontSize: 13),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ),
                    if (step.sumText != null) ...[
                      const SizedBox(height: 8),
                      MarkupText(
                        step.sumText!,
                        style: const TextStyle(color: Color(0xFFeaeaea), fontSize: 16, fontWeight: FontWeight.w700),
                        underlinedStyle: const TextStyle(
                          color: AppTheme.currentAmber,
                          fontSize: 16,
                          decoration: TextDecoration.underline,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (step.sumHint != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 6),
                          child: Text(
                            step.sumHint!,
                            textAlign: TextAlign.center,
                            style: TextStyle(color: Colors.white.withOpacity(0.62), fontSize: 13),
                          ),
                        ),
                    ],
                    const SizedBox(height: 22),
                    if (utVisual != null) ...[
                      Row(
                        children: [
                          _badge('L', AppTheme.badgeL),
                          const SizedBox(width: 8),
                          Expanded(
                            child: UtBridgeDiagram(
                              paddedLHS: utVisual.paddedLHS,
                              num2Str: num2Str,
                              pairs: utVisual.pairs,
                              resultCells: List.generate(paddedLHS.length, (i) {
                                final revealed = step.digitsRevealed;
                                final posFromRight = paddedLHS.length - 1 - i;
                                final d = i < step.partialResult.length ? step.partialResult[i] : null;
                                final visible = d != null && posFromRight < revealed;
                                final isCurrent = !isPrep && i == step.utColumnIndex;
                                return UtResultDigit(
                                  text: visible ? '$d' : '',
                                  current: isCurrent && visible,
                                  carry: (isCurrent && visible) ? step.carry : 0,
                                );
                              }),
                            ),
                          ),
                          const SizedBox(width: 8),
                          _badge('R', AppTheme.badgeR),
                        ],
                      ),
                      const SizedBox(height: 16),
                      Row(
                        children: [
                          Expanded(child: _operandBox('${state.question.num1}')),
                          const SizedBox(width: 12),
                          Expanded(child: _operandBox('${state.question.num2}')),
                        ],
                      ),
                    ] else ...[
                      _tableFallback(rawNum1.padLeft(5, '0'), num2Str, step),
                    ],
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: state.closeSolution,
                  style: TextButton.styleFrom(
                    backgroundColor: const Color(0xFF4b5563),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  child: const Text('CERRAR', style: TextStyle(fontWeight: FontWeight.w700)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _tableFallback(String num1Str, String num2Str, SolutionStep step) {
    return Column(
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: num1Str.split('').map((d) {
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Text(d, style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
            );
          }).toList(),
        ),
        const SizedBox(height: 6),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('×', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w700)),
            const SizedBox(width: 12),
            ...num2Str.split('').map((d) {
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: Text(d, style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w700)),
              );
            }),
          ],
        ),
        const SizedBox(height: 16),
        Wrap(
          alignment: WrapAlignment.center,
          children: List.generate(step.partialResult.length, (i) {
            final total = step.partialResult.length;
            final posFromRight = total - 1 - i;
            if (posFromRight >= step.stepNumber) return const SizedBox.shrink();
            final d = step.partialResult[i];
            final isCurrent = posFromRight == 0;
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 6),
              child: Column(
                children: [
                  if (isCurrent && step.carry > 0)
                    Text('·' * step.carry, style: const TextStyle(color: AppTheme.currentAmber)),
                  Text(
                    d == null ? '' : '$d',
                    style: TextStyle(
                      color: isCurrent ? AppTheme.currentAmber : Colors.white,
                      fontSize: 26,
                      fontWeight: FontWeight.w700,
                      decoration: isCurrent ? TextDecoration.underline : null,
                    ),
                  ),
                ],
              ),
            );
          }),
        ),
      ],
    );
  }

  Widget _badge(String t, Color c) {
    return Container(
      width: 36,
      height: 36,
      alignment: Alignment.center,
      decoration: BoxDecoration(color: c, borderRadius: BorderRadius.circular(6)),
      child: Text(t, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
    );
  }

  Widget _operandBox(String n) {
    return Container(
      height: 56,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: const Color(0xFFececec),
        border: Border.all(color: Colors.black26),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        n,
        style: const TextStyle(color: Colors.black, fontSize: 28, fontWeight: FontWeight.w700),
      ),
    );
  }

  Widget _header(AppState state, SolutionStep step, int safeStep) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
      child: Column(
        children: [
          const Align(
            alignment: Alignment.centerLeft,
            child: Text(
              'Solución paso a paso',
              style: TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600),
            ),
          ),
          const SizedBox(height: 8),
          Container(
            height: 3,
            decoration: const BoxDecoration(
              gradient: LinearGradient(colors: [Color(0xFF3b82f6), Color(0xFF60a5fa)]),
            ),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _bfBtn('B', safeStep > 0 ? state.prevStep : null),
              Expanded(
                child: Column(
                  children: [
                    Text(
                      'Paso ${step.stepNumber}',
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    if (step.title != null)
                      Text(
                        step.title!,
                        style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 13),
                      ),
                  ],
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
        color: onTap != null ? const Color(0xFF4b5563) : Colors.transparent,
        borderRadius: BorderRadius.circular(6),
        child: InkWell(
          onTap: onTap,
          child: Center(
            child: Text(
              label,
              style: TextStyle(
                color: onTap != null ? Colors.white : Colors.white38,
                fontWeight: FontWeight.w800,
                fontSize: 18,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
