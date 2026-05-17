import 'package:flutter/material.dart';

import '../logic/ut_math.dart';

class UtBridgeDiagram extends StatelessWidget {
  final String paddedLHS;
  final String num2Str;
  final List<UtPair> pairs;

  const UtBridgeDiagram({
    super.key,
    required this.paddedLHS,
    required this.num2Str,
    required this.pairs,
  });

  @override
  Widget build(BuildContext context) {
    final lhs = paddedLHS.split('');
    final rhs = num2Str.split('');
    final lhsLen = lhs.length;
    final totalCells = lhsLen + 1 + rhs.length;

    double cellXPct(int cellIndex) => ((cellIndex + 0.5) / totalCells) * 100;

    return LayoutBuilder(
      builder: (context, constraints) {
        final w = constraints.maxWidth;
        final h = 80.0;
        return SizedBox(
          height: h + 44,
          child: Stack(
            children: [
              Positioned(
                top: 0,
                left: 0,
                right: 0,
                height: h,
                child: CustomPaint(
                  size: Size(w, h),
                  painter: _BridgePainter(
                    pairs: pairs,
                    lhsLen: lhsLen,
                    cellXPct: cellXPct,
                  ),
                ),
              ),
              Positioned(
                left: 0,
                right: 0,
                bottom: 0,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Column(
                      children: [
                        Row(
                          children: lhs
                              .map((d) => _digitCell(d))
                              .toList(),
                        ),
                        Container(
                          height: 2,
                          width: lhs.length * 28.0,
                          color: const Color(0xFFeaeaea),
                        ),
                      ],
                    ),
                    const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 10),
                      child: Text(
                        '×',
                        style: TextStyle(
                          color: Color(0xFFeaeaea),
                          fontSize: 22,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    Row(
                      children: rhs.map((d) => _digitCell(d)).toList(),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _digitCell(String d) {
    return SizedBox(
      width: 28,
      child: Text(
        d,
        textAlign: TextAlign.center,
        style: const TextStyle(
          color: Color(0xFFeaeaea),
          fontSize: 22,
          fontWeight: FontWeight.w500,
          fontFeatures: [FontFeature.tabularFigures()],
        ),
      ),
    );
  }
}

class _BridgePainter extends CustomPainter {
  final List<UtPair> pairs;
  final int lhsLen;
  final double Function(int) cellXPct;

  _BridgePainter({
    required this.pairs,
    required this.lhsLen,
    required this.cellXPct,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = const Color(0xFFeaeaea)
      ..strokeWidth = 1.2
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    for (final p in pairs) {
      final xi = cellXPct(p.lhsIdx) / 100 * size.width;
      final xj = cellXPct(lhsLen + 1 + p.rhsIdx) / 100 * size.width;
      const yTop = 6.0;
      final yBot = size.height - 8;
      final path = Path()
        ..moveTo(xj, yBot)
        ..lineTo(xj, yTop)
        ..lineTo(xi, yTop)
        ..lineTo(xi, yBot);
      canvas.drawPath(path, paint);
    }
  }

  @override
  bool shouldRepaint(covariant _BridgePainter old) =>
      old.pairs != pairs || old.lhsLen != lhsLen;
}
