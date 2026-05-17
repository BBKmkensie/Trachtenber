import 'package:flutter/material.dart';

import '../logic/ut_math.dart';

class MarkupText extends StatelessWidget {
  final String text;
  final TextStyle? style;
  final TextStyle? underlinedStyle;

  const MarkupText(
    this.text, {
    super.key,
    this.style,
    this.underlinedStyle,
  });

  @override
  Widget build(BuildContext context) {
    final base = style ?? Theme.of(context).textTheme.bodyLarge;
    final under = underlinedStyle ??
        base?.copyWith(
          decoration: TextDecoration.underline,
          decorationThickness: 2,
          fontWeight: FontWeight.w600,
        );
    final parts = parseMarkupText(text);
    return Text.rich(
      TextSpan(
        children: parts
            .map((p) => TextSpan(
                  text: p.text,
                  style: p.underlined ? under : base,
                ))
            .toList(),
      ),
    );
  }
}
