import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_state.dart';
import '../logic/mnemotecnia.dart';
import '../logic/table_rules.dart';
import '../theme/app_theme.dart';
import '../widgets/numeric_keypad.dart';

class GameScreen extends StatelessWidget {
  const GameScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final num1Str = state.paddedGameLhs();
    final num2Str = state.question.num2.toString();
    final blocked = state.hasIncorrectFeedback;
    final suggestions = getMnemotecniaSuggestions(state.userAnswer);

    return Theme(
      data: ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        fontFamily: 'Segoe UI',
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Material(
          color: AppTheme.gameBeige,
          elevation: 12,
          shadowColor: Colors.black54,
          borderRadius: BorderRadius.circular(20),
          clipBehavior: Clip.antiAlias,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 15, 20, 15),
                child: Row(
                  children: [
                    _hdrBtn('ATRÁS', AppTheme.backRed, blocked ? null : state.stopGame),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Center(
                        child: ConstrainedBox(
                          constraints: const BoxConstraints(maxWidth: 200),
                          child: _hdrBtn(
                            'mnemotecnia',
                            Colors.white,
                            blocked ? null : state.showMnemotecnia,
                            fg: AppTheme.textDark,
                            border: AppTheme.pink,
                            expand: true,
                          ),
                        ),
                      ),
                    ),
                    if (state.gameMode == GameMode.tables112) ...[
                      const SizedBox(width: 10),
                      _hdrBtn('REGLA', const Color(0xFF1e40af), state.showRule),
                    ],
                    const SizedBox(width: 10),
                    _hdrBtn('RESOLVER', AppTheme.solveGreen, blocked ? null : state.showSolution),
                  ],
                ),
              ),
              LayoutBuilder(
                builder: (context, constraints) {
                  final eqWidth = constraints.maxWidth - 40;
                  return Container(
                    width: double.infinity,
                    constraints: const BoxConstraints(minHeight: 260),
                    padding: const EdgeInsets.fromLTRB(20, 30, 20, 30),
                    alignment: Alignment.center,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _equation(num1Str, num2Str, state, eqWidth),
                        if (state.feedback.isNotEmpty) ...[
                          const SizedBox(height: 12),
                          Text(
                            state.feedback,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              decoration: TextDecoration.none,
                              color: state.feedback.contains('Incorrecto')
                                  ? const Color(0xFFef4444)
                                  : state.feedback.contains('Correcto')
                                      ? const Color(0xFF22c55e)
                                      : AppTheme.textDark,
                            ),
                          ),
                        ],
                        if (suggestions.recent.isNotEmpty || suggestions.all.isNotEmpty) ...[
                          const SizedBox(height: 16),
                          _suggestions(suggestions),
                        ],
                      ],
                    ),
                  );
                },
              ),
              SizedBox(
                height: 290,
                width: double.infinity,
                child: NumericKeypad(onKey: state.keypadInput),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _hdrBtn(
    String label,
    Color bg,
    VoidCallback? onTap, {
    Color fg = Colors.white,
    Color? border,
    bool expand = false,
  }) {
    final btn = TextButton(
      onPressed: onTap,
      style: TextButton.styleFrom(
        backgroundColor: bg,
        foregroundColor: fg,
        disabledForegroundColor: fg.withOpacity(0.5),
        padding: const EdgeInsets.symmetric(horizontal: 25, vertical: 10),
        minimumSize: const Size(0, 0),
        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
        side: border != null ? BorderSide(color: border, width: 3) : BorderSide.none,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontWeight: FontWeight.w600,
          fontSize: 16,
          letterSpacing: 0.5,
          color: fg,
        ),
      ),
    );
    if (!expand) return btn;
    return SizedBox(width: double.infinity, child: btn);
  }

  Widget _equation(String num1Str, String num2Str, AppState state, double maxW) {
    final lhs = num1Str.length;
    final rhs = num2Str.length;
    final lhsGaps = lhs > 1 ? lhs - 1 : 0;
    final rhsGaps = rhs > 1 ? rhs - 1 : 0;
    final units = lhs + rhs + 1;
    final avail = maxW.isFinite && maxW > 0 ? maxW : 560.0;

    double widthOf(double slot, double gap) {
      return lhs * slot +
          lhsGaps * gap +
          slot +
          2 * gap +
          rhs * slot +
          rhsGaps * gap;
    }

    var font = (avail * 0.68 / units).clamp(12.8, 30.4);
    var slot = font * 1.15;
    var gap = font * 0.22;
    while (font > 12.8 && widthOf(slot, gap) > avail) {
      font -= 0.4;
      slot = font * 1.15;
      gap = font * 0.22;
    }

    return SizedBox(
      width: avail,
      child: FittedBox(
        fit: BoxFit.scaleDown,
        alignment: Alignment.center,
        child: _EquationBlock(
          num1Str: num1Str,
          num2Str: num2Str,
          userAnswer: state.userAnswer,
          carryDots: state.carryDots,
          slot: slot,
          gap: gap,
          fontSize: font,
        ),
      ),
    );
  }

  Widget _suggestions(({List<MnemSuggestion> recent, List<MnemSuggestion> all}) suggestions) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFfff0f5),
        border: Border.all(color: AppTheme.pink, width: 2),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        children: [
          const Text(
            '💡 Sugerencias Mnemotécnicas:',
            textAlign: TextAlign.center,
            style: TextStyle(color: AppTheme.pinkDeep, fontWeight: FontWeight.w600, fontSize: 16),
          ),
          if (suggestions.recent.isNotEmpty) ...[
            const SizedBox(height: 12),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              alignment: WrapAlignment.center,
              children: suggestions.recent.map(_recentCard).toList(),
            ),
          ],
          if (suggestions.all.isNotEmpty) ...[
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 14),
              child: CustomPaint(
                painter: _DashedLinePainter(color: AppTheme.pink),
                child: const SizedBox(width: double.infinity, height: 2),
              ),
            ),
            const Text(
              'Todas las palabras (de izquierda a derecha):',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppTheme.pinkDeep, fontWeight: FontWeight.w600, fontSize: 14),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 10,
              runSpacing: 10,
              alignment: WrapAlignment.center,
              children: suggestions.all.map(_allCard).toList(),
            ),
          ],
        ],
      ),
    );
  }

  Widget _recentCard(MnemSuggestion s) {
    final pair = s.type == 'pair';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: pair ? AppTheme.pinkDeep : AppTheme.pink, width: 2),
        borderRadius: BorderRadius.circular(8),
        boxShadow: const [BoxShadow(color: Color(0x33ff69b4), blurRadius: 6, offset: Offset(0, 2))],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            constraints: const BoxConstraints(minWidth: 40),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            decoration: BoxDecoration(
              color: const Color(0xFFfff0f5),
              borderRadius: BorderRadius.circular(5),
            ),
            child: Text(
              '${s.number}',
              textAlign: TextAlign.center,
              style: const TextStyle(color: AppTheme.pinkDeep, fontWeight: FontWeight.w800, fontSize: 22),
            ),
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(s.objeto, style: const TextStyle(color: AppTheme.pinkDeep, fontWeight: FontWeight.w600, fontSize: 16)),
              Text(s.accion, style: const TextStyle(color: Color(0xFF666666), fontSize: 13, fontStyle: FontStyle.italic)),
            ],
          ),
          const SizedBox(width: 10),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: AppTheme.pink,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              s.type == 'single' ? '1 dígito' : '2 dígitos',
              style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
            ),
          ),
        ],
      ),
    );
  }

  Widget _allCard(MnemSuggestion s) {
    return Container(
      width: 110,
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: AppTheme.pink),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Column(
        children: [
          Text('${s.number}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.pinkDeep, fontSize: 18)),
          Text(s.objeto, style: const TextStyle(color: AppTheme.pinkDeep, fontSize: 13, fontWeight: FontWeight.w600)),
          Text(s.accion, style: const TextStyle(color: Color(0xFF666666), fontSize: 12, fontStyle: FontStyle.italic)),
        ],
      ),
    );
  }
}

class _EquationBlock extends StatelessWidget {
  const _EquationBlock({
    required this.num1Str,
    required this.num2Str,
    required this.userAnswer,
    required this.carryDots,
    required this.slot,
    required this.gap,
    required this.fontSize,
  });

  final String num1Str;
  final String num2Str;
  final String userAnswer;
  final Map<int, int> carryDots;
  final double slot;
  final double gap;
  final double fontSize;

  double get _lhsW => num1Str.length * slot + (num1Str.length - 1) * gap;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: _lhsW,
          child: Column(
            children: [
              _digitRow(num1Str),
              const Padding(
                padding: EdgeInsets.only(top: 6),
                child: Divider(thickness: 2, color: AppTheme.textDark, height: 8),
              ),
              Container(
                margin: const EdgeInsets.only(top: 10),
                width: _lhsW,
                height: fontSize * 2.5,
                decoration: BoxDecoration(
                  color: Colors.white,
                  border: Border.all(color: AppTheme.textDark, width: 3),
                  borderRadius: BorderRadius.circular(5),
                ),
                child: _answerRow(),
              ),
            ],
          ),
        ),
        Padding(
          padding: EdgeInsets.only(top: 4, left: gap, right: gap),
          child: Text(
            '×',
            style: TextStyle(
              fontSize: fontSize,
              fontWeight: FontWeight.w600,
              color: AppTheme.textDark,
              decoration: TextDecoration.none,
            ),
          ),
        ),
        _digitRow(num2Str),
      ],
    );
  }

  Widget _digitRow(String digits) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (var i = 0; i < digits.length; i++) ...[
          if (i > 0) SizedBox(width: gap),
          SizedBox(
            width: slot,
            child: Text(
              digits[i],
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: fontSize,
                fontWeight: FontWeight.w600,
                color: AppTheme.textDark,
                fontFeatures: const [FontFeature.tabularFigures()],
                decoration: TextDecoration.none,
              ),
            ),
          ),
        ],
      ],
    );
  }

  Widget _answerRow() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 6),
      child: Row(
        children: List.generate(num1Str.length, (i) {
          final empty = num1Str.length - userAnswer.length;
          Widget cell;
          if (i < empty) {
            cell = const SizedBox.shrink();
          } else {
            final ai = i - empty;
            final d = userAnswer[ai];
            final posFromRight = userAnswer.length - 1 - ai;
            final carry = carryDots[posFromRight] ?? 0;
            cell = Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                SizedBox(
                  height: 12,
                  child: carry > 0
                      ? Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: List.generate(
                            carry,
                            (_) => Container(
                              width: 4,
                              height: 4,
                              margin: const EdgeInsets.symmetric(horizontal: 1),
                              decoration: const BoxDecoration(
                                color: AppTheme.textDark,
                                shape: BoxShape.circle,
                              ),
                            ),
                          ),
                        )
                      : null,
                ),
                Text(
                  d,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: fontSize,
                    fontWeight: FontWeight.w600,
                    color: AppTheme.textDark,
                    fontFeatures: const [FontFeature.tabularFigures()],
                    decoration: TextDecoration.none,
                  ),
                ),
              ],
            );
          }
          return Expanded(child: cell);
        }),
      ),
    );
  }
}

class _DashedLinePainter extends CustomPainter {
  final Color color;
  _DashedLinePainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 2
      ..style = PaintingStyle.stroke;
    const dash = 6.0;
    const gap = 4.0;
    var x = 0.0;
    final y = size.height / 2;
    while (x < size.width) {
      canvas.drawLine(Offset(x, y), Offset((x + dash).clamp(0, size.width), y), paint);
      x += dash + gap;
    }
  }

  @override
  bool shouldRepaint(covariant _DashedLinePainter oldDelegate) => oldDelegate.color != color;
}

class GameRuleModal extends StatelessWidget {
  const GameRuleModal({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final table = state.selectedTable ?? 2;
    return Material(
      color: Colors.black54,
      child: Center(
        child: Container(
          margin: const EdgeInsets.all(24),
          padding: const EdgeInsets.all(20),
          constraints: const BoxConstraints(maxWidth: 420),
          decoration: BoxDecoration(
            color: const Color(0xFF333333),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                height: 3,
                margin: const EdgeInsets.only(bottom: 12),
                decoration: const BoxDecoration(
                  gradient: LinearGradient(colors: [Color(0xFF3b82f6), Color(0xFF60a5fa)]),
                ),
              ),
              Text(
                'Regla de multiplicación | $table',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 16),
              Text(
                getShortRuleForTable(table),
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.white70),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () => state.goTo(AppScreen.game),
                style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4b5563)),
                child: const Text('Cerrar'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
