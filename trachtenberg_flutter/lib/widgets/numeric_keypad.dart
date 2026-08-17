import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class NumericKeypad extends StatelessWidget {
  final void Function(String) onKey;

  const NumericKeypad({super.key, required this.onKey});

  static const _keys = [
    ['1', '2', '3', 'CE'],
    ['4', '5', '6', '←'],
    ['7', '8', '9', '.'],
    ['', '0', '', '→'],
  ];

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: AppTheme.keypadBg,
      child: Padding(
        padding: const EdgeInsets.all(2),
        child: Column(
          children: [
            for (final row in _keys)
              Expanded(
                child: Row(
                  children: [
                    for (final k in row)
                      Expanded(
                        child: k.isEmpty
                            ? const ColoredBox(color: AppTheme.keypadBg)
                            : Material(
                                color: AppTheme.keypadBg,
                                child: InkWell(
                                  onTap: () => onKey(k),
                                  hoverColor: const Color(0xFF555555),
                                  child: LayoutBuilder(
                                    builder: (context, c) {
                                      final fs = (c.maxHeight * 0.38).clamp(16.0, 24.0);
                                      return Center(
                                        child: Text(
                                          k,
                                          style: TextStyle(
                                            fontSize: fs,
                                            fontWeight: FontWeight.w600,
                                            color: Colors.white,
                                          ),
                                        ),
                                      );
                                    },
                                  ),
                                ),
                              ),
                      ),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
