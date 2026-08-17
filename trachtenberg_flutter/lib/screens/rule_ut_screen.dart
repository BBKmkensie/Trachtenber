import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../app_state.dart';
import '../logic/table_rules.dart';
import '../logic/ut_math.dart';
import '../theme/app_theme.dart';
import '../widgets/app_card.dart';
import '../widgets/markup_text.dart';
import '../widgets/ut_bridge_diagram.dart';

class RuleUtScreen extends StatelessWidget {
  const RuleUtScreen({super.key});

  static const _body = TextStyle(
    color: AppTheme.textDark,
    fontSize: 15,
    height: 1.45,
    decoration: TextDecoration.none,
    fontWeight: FontWeight.w400,
  );

  static const _heading = TextStyle(
    color: AppTheme.textDark,
    fontSize: 16,
    fontWeight: FontWeight.w700,
    decoration: TextDecoration.none,
  );

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    final n1 = state.utNumber1.isEmpty ? '123' : state.utNumber1;
    final n2 = state.utNumber2.isEmpty ? '45' : state.utNumber2;
    final paddedLHS = padUTMultiplicand(n1, n2);
    final product = ((int.tryParse(n1) ?? 0) * (int.tryParse(n2) ?? 0))
        .toString()
        .padLeft(paddedLHS.length, '0');
    final totalSteps = paddedLHS.length;
    final revealed = state.utArrowStep.clamp(0, totalSteps);
    final stepIndex = revealed == 0 ? null : paddedLHS.length - revealed;
    final pairs = stepIndex == null
        ? <UtPair>[]
        : getUTMultiplyPairsForStep(n1, n2, stepIndex).pairs;
    final utStep = stepIndex == null ? null : calculateUTStep(n1, n2, stepIndex);

    return Theme(
      data: ThemeData(
        useMaterial3: true,
        brightness: Brightness.light,
        fontFamily: 'Segoe UI',
        colorScheme: const ColorScheme.light(
          primary: AppTheme.accent,
          surface: Color(0xFFf0f0f0),
        ),
        textTheme: const TextTheme(
          bodyLarge: _body,
          bodyMedium: _body,
          bodySmall: _body,
        ),
      ),
      child: AppCard(
        expand: true,
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
        child: DefaultTextStyle(
          style: _body,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              BackChip(onPressed: () => state.goTo(AppScreen.infoMenu)),
              const SizedBox(height: 8),
              const Text(
                'Reglas | Multiplicación UT',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: AppTheme.textDark,
                  decoration: TextDecoration.none,
                ),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _sideBtn('L', AppTheme.widgetL, state.utStepForward),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Container(
                              padding: const EdgeInsets.all(10),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                border: Border.all(color: const Color(0xFFdddddd), width: 2),
                                borderRadius: BorderRadius.circular(5),
                              ),
                              child: Column(
                                children: [
                                  UtBridgeDiagram(
                                    light: true,
                                    paddedLHS: paddedLHS,
                                    num2Str: n2,
                                    pairs: pairs,
                                    resultCells: List.generate(paddedLHS.length, (i) {
                                      final posFromRight = product.length - 1 - i;
                                      final visible = posFromRight < revealed;
                                      final isCurrent = stepIndex != null && i == stepIndex;
                                      return UtResultDigit(
                                        light: true,
                                        text: visible ? product[i] : '',
                                        current: isCurrent && visible,
                                      );
                                    }),
                                  ),
                                  const SizedBox(height: 10),
                                  _stepHelp(revealed, totalSteps, n1, n2, paddedLHS, utStep),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          _sideBtn('R', AppTheme.widgetR, state.utStepBack),
                        ],
                      ),
                      const SizedBox(height: 14),
                      Row(
                        children: [
                          Expanded(
                            child: _UtNumberField(
                              value: state.utNumber1,
                              hint: '123',
                              onChanged: (v) => state.setUtNumbers(v, state.utNumber2),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _UtNumberField(
                              value: state.utNumber2,
                              hint: '45',
                              onChanged: (v) => state.setUtNumbers(state.utNumber1, v),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 22),
                      const Text(utMethodIntro, style: _body),
                      const SizedBox(height: 14),
                      const Text('1. Preparación:', style: _heading),
                      const SizedBox(height: 6),
                      const Text(utPrepText, style: _body),
                      const SizedBox(height: 14),
                      const Text(
                        '2. Cálculo (consejo: intenta seguir los pasos aquí en el widget de arriba):',
                        style: _heading,
                      ),
                      const SizedBox(height: 6),
                      ...utCalcParagraphs.map(
                        (p) => Padding(
                          padding: const EdgeInsets.only(bottom: 10),
                          child: Text(p, style: _body),
                        ),
                      ),
                      const Text(utVerifyTitle, style: _heading),
                      const SizedBox(height: 6),
                      const Text(utVerifyText, style: _body),
                      const SizedBox(height: 14),
                      const Text(utDefinitionsTitle, style: _heading),
                      const SizedBox(height: 6),
                      const Text.rich(
                        TextSpan(
                          style: _body,
                          children: [
                            TextSpan(text: 'Suma de dígitos: ', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textDark)),
                            TextSpan(text: 'la suma de los dígitos en un número, por ejemplo la suma de dígitos de 1234 → 1+2+3+4=10 y la suma de dígitos de 6283 → 6+2+8+3=19.'),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),
                      const Text.rich(
                        TextSpan(
                          style: _body,
                          children: [
                            TextSpan(text: 'Raíz digital: ', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textDark)),
                            TextSpan(text: 'el resultado de hacer repetidamente la suma de dígitos de un número hasta que el resultado esté en un solo dígito, por ejemplo la raíz digital de 1234 → 1+2+3+4=10→1+0=1 y la raíz digital de 6283 → 6+2+8+3=19→1+9=10→1+0=1.'),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _stepHelp(
    int revealed,
    int totalSteps,
    String n1,
    String n2,
    String paddedLHS,
    UtStepResult? utStep,
  ) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFFf7f7f4),
        border: Border.all(color: const Color(0xFFdddddd)),
        borderRadius: BorderRadius.circular(6),
      ),
      child: revealed == 0
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Preparación', style: _heading),
                const SizedBox(height: 4),
                Text(
                  '$n2 tiene ${n2.length} cifra${n2.length == 1 ? '' : 's'}, así que escribimos $n1 como ${paddedLHS.split('').join(' ')}. Pulsa L para el paso 1 de $totalSteps (de derecha a izquierda).',
                  style: _body.copyWith(fontSize: 13),
                ),
              ],
            )
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Paso $revealed de $totalSteps${utStep != null ? ' · ${utStep.title}' : ''}',
                  style: _heading,
                ),
                if (utStep != null) ...[
                  ...utStep.calculations.map(
                    (c) => Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          MarkupText(
                            c.text,
                            style: _body.copyWith(fontSize: 13),
                            underlinedStyle: const TextStyle(
                              color: Color(0xFFb45309),
                              fontSize: 13,
                              decoration: TextDecoration.underline,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          if (c.hint != null)
                            Text(c.hint!, style: const TextStyle(color: Color(0xFF555555), fontSize: 12, decoration: TextDecoration.none)),
                        ],
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: MarkupText(
                      utStep.sumText,
                      style: _body.copyWith(fontSize: 13, fontWeight: FontWeight.w700),
                      underlinedStyle: const TextStyle(
                        color: Color(0xFFb45309),
                        fontSize: 13,
                        decoration: TextDecoration.underline,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  Text(utStep.sumHint, style: const TextStyle(color: Color(0xFF555555), fontSize: 12, decoration: TextDecoration.none)),
                ],
              ],
            ),
    );
  }

  Widget _sideBtn(String label, Color color, VoidCallback onTap) {
    return SizedBox(
      width: 50,
      height: 160,
      child: Material(
        color: color,
        borderRadius: BorderRadius.circular(5),
        child: InkWell(
          onTap: onTap,
          child: Center(
            child: Text(
              label,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold,
                decoration: TextDecoration.none,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _UtNumberField extends StatefulWidget {
  const _UtNumberField({
    required this.value,
    required this.hint,
    required this.onChanged,
  });

  final String value;
  final String hint;
  final ValueChanged<String> onChanged;

  @override
  State<_UtNumberField> createState() => _UtNumberFieldState();
}

class _UtNumberFieldState extends State<_UtNumberField> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.value);
  }

  @override
  void didUpdateWidget(covariant _UtNumberField oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.value != widget.value && _controller.text != widget.value) {
      _controller.value = TextEditingValue(
        text: widget.value,
        selection: TextSelection.collapsed(offset: widget.value.length),
      );
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(4),
        side: const BorderSide(color: Colors.black87, width: 1.5),
      ),
      child: SizedBox(
        height: 64,
        child: TextField(
          controller: _controller,
          keyboardType: TextInputType.number,
          inputFormatters: [FilteringTextInputFormatter.digitsOnly],
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 32,
            fontWeight: FontWeight.w700,
            color: Colors.black,
            decoration: TextDecoration.none,
          ),
          cursorColor: AppTheme.textDark,
          decoration: InputDecoration(
            border: InputBorder.none,
            enabledBorder: InputBorder.none,
            focusedBorder: InputBorder.none,
            hintText: widget.hint,
            hintStyle: const TextStyle(color: Colors.black38, fontSize: 32, fontWeight: FontWeight.w700),
            contentPadding: const EdgeInsets.symmetric(vertical: 12),
            isDense: true,
          ),
          onChanged: widget.onChanged,
        ),
      ),
    );
  }
}
