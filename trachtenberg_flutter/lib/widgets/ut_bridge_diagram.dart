import 'package:flutter/material.dart';

import '../logic/ut_math.dart';
import '../theme/app_theme.dart';

class UtBridgeDiagram extends StatelessWidget {
  final String paddedLHS;
  final String num2Str;
  final List<UtPair> pairs;
  final List<Widget> resultCells;
  final bool light;

  const UtBridgeDiagram({
    super.key,
    required this.paddedLHS,
    required this.num2Str,
    required this.pairs,
    this.resultCells = const [],
    this.light = false,
  });

  @override
  Widget build(BuildContext context) {
    final lhs = paddedLHS.split('');
    final rhs = num2Str.split('');
    final lhsLen = lhs.length;
    final totalCells = lhsLen + 1 + rhs.length;
    final ink = light ? AppTheme.textDark : const Color(0xFFeaeaea);
    final groups = <int, List<int>>{};
    for (final p in pairs) {
      groups.putIfAbsent(p.rhsIdx, () => []);
      if (!groups[p.rhsIdx]!.contains(p.lhsIdx)) {
        groups[p.rhsIdx]!.add(p.lhsIdx);
      }
    }
    final rhsOrder = groups.keys.toList()..sort((a, b) => b.compareTo(a));
    final svgH = (44.0 + rhsOrder.length * 10).clamp(44.0, 90.0);

    Widget cell(String d, {bool underline = false}) {
      return Container(
        alignment: Alignment.center,
        padding: const EdgeInsets.symmetric(vertical: 4),
        decoration: underline
            ? BoxDecoration(border: Border(bottom: BorderSide(color: ink, width: 2)))
            : null,
        child: Text(
          d,
          textAlign: TextAlign.center,
          style: TextStyle(
            color: ink,
            fontSize: 20,
            fontWeight: FontWeight.w700,
            fontFeatures: const [FontFeature.tabularFigures()],
          ),
        ),
      );
    }

    return Column(
      children: [
        SizedBox(
          height: svgH,
          width: double.infinity,
          child: CustomPaint(
            painter: _BridgePainter(
              groups: groups,
              rhsOrder: rhsOrder,
              lhsLen: lhsLen,
              totalCells: totalCells,
              color: ink,
            ),
          ),
        ),
        Row(
          children: [
            ...List.generate(lhsLen, (i) => Expanded(child: cell(lhs[i], underline: true))),
            Expanded(child: cell('×')),
            ...List.generate(rhs.length, (i) => Expanded(child: cell(rhs[i]))),
          ],
        ),
        if (resultCells.isNotEmpty)
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ...List.generate(lhsLen, (i) {
                return Expanded(
                  child: i < resultCells.length ? resultCells[i] : const SizedBox.shrink(),
                );
              }),
              ...List.generate(1 + rhs.length, (_) => const Expanded(child: SizedBox.shrink())),
            ],
          ),
      ],
    );
  }
}

class _BridgePainter extends CustomPainter {
  final Map<int, List<int>> groups;
  final List<int> rhsOrder;
  final int lhsLen;
  final int totalCells;
  final Color color;

  _BridgePainter({
    required this.groups,
    required this.rhsOrder,
    required this.lhsLen,
    required this.totalCells,
    required this.color,
  });

  double _x(int cell, double width) => ((cell + 0.5) / totalCells) * width;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1.3
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    final yBot = size.height - 4;

    for (var level = 0; level < rhsOrder.length; level++) {
      final rhsIdx = rhsOrder[level];
      final lhsIdxs = [...groups[rhsIdx]!]..sort();
      if (lhsIdxs.isEmpty) continue;
      final yTop = 4.0 + level * 9;
      final xR = _x(lhsLen + 1 + rhsIdx, size.width);
      final xLeft = _x(lhsIdxs.first, size.width);
      canvas.drawPath(
        Path()
          ..moveTo(xR, yBot)
          ..lineTo(xR, yTop)
          ..lineTo(xLeft, yTop),
        paint,
      );
      for (final li in lhsIdxs) {
        final x = _x(li, size.width);
        canvas.drawLine(Offset(x, yTop), Offset(x, yBot), paint);
        canvas.drawPath(
          Path()
            ..moveTo(x - 4, yBot - 7)
            ..lineTo(x, yBot)
            ..lineTo(x + 4, yBot - 7),
          paint,
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant _BridgePainter old) => true;
}

class UtResultDigit extends StatelessWidget {
  final String text;
  final bool current;
  final bool light;
  final int carry;

  const UtResultDigit({
    super.key,
    required this.text,
    this.current = false,
    this.light = false,
    this.carry = 0,
  });

  @override
  Widget build(BuildContext context) {
    final color = current
        ? (light ? const Color(0xFFb45309) : AppTheme.currentAmber)
        : (light ? AppTheme.textDark : Colors.white);
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Column(
        children: [
          SizedBox(
            height: 12,
            child: carry > 0
                ? Text('·' * carry, style: TextStyle(color: color, fontSize: 12, height: 1))
                : null,
          ),
          Text(
            text.isEmpty ? ' ' : text,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: color,
              fontSize: 20,
              fontWeight: FontWeight.w700,
              decoration: current ? TextDecoration.underline : null,
            ),
          ),
        ],
      ),
    );
  }
}
