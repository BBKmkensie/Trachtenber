import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/app_card.dart';

class InfoMenuScreen extends StatelessWidget {
  const InfoMenuScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.read<AppState>();
    return AppCard(
      expand: true,
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          BackChip(onPressed: () => state.goTo(AppScreen.main)),
          const SizedBox(height: 24),
          const Text(
            'Info & Rules',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w600,
              color: AppTheme.textDark,
              decoration: TextDecoration.none,
            ),
          ),
          const SizedBox(height: 28),
          Expanded(
            child: Column(
              children: [
                Expanded(child: _opt('TRACHTENBERG', () => state.goTo(AppScreen.trachtenbergInfo))),
                const SizedBox(height: 2),
                Expanded(
                  child: _opt('RULES [1-12]', () {
                    state.setCurrentRuleTable(2);
                    state.goTo(AppScreen.rules112);
                  }),
                ),
                const SizedBox(height: 2),
                Expanded(child: _opt('RULE UT', () => state.goTo(AppScreen.ruleUt))),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _opt(String label, VoidCallback onTap) {
    return Material(
      color: AppTheme.menuDark,
      child: InkWell(
        onTap: onTap,
        hoverColor: const Color(0xFF555555),
        child: Center(
          child: Text(
            label,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 20,
              fontWeight: FontWeight.w600,
              letterSpacing: 1,
              decoration: TextDecoration.none,
            ),
          ),
        ),
      ),
    );
  }
}

class TrachtenbergInfoScreen extends StatelessWidget {
  const TrachtenbergInfoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.read<AppState>();
    return AppCard(
      expand: true,
      child: Column(
        children: [
          BackChip(onPressed: () => state.goTo(AppScreen.infoMenu)),
          const SizedBox(height: 8),
          const Text(
            'El Método Trachtenberg',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.textDark),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _section(
                    '¿Qué es el método Trachtenberg?',
                    'El método Trachtenberg es una forma de multiplicación que optimiza la velocidad '
                        'asignando la menor cantidad posible de números temporales que deben mantenerse '
                        'en memoria. Fue desarrollado por Jakow Trachtenberg para mantener su mente ocupada '
                        'mientras estaba en un campo de concentración nazi.',
                  ),
                  _section(
                    'Convenciones',
                    'El sistema Trachtenberg siempre comienza en el dígito más a la derecha y procede '
                        'a moverse hacia la izquierda. "El dígito actual" a menudo se denomina "el número" '
                        'mientras que el número a su derecha se denomina su "vecino".\n\n'
                        'Una de las características del sistema Trachtenberg es que nunca tienes que llevar '
                        'más de un 2 y debido a esto, cualquier acarreo se representa simplemente con un punto '
                        'en el sistema Trachtenberg — ver la figura a continuación:',
                  ),
                  _mathExample(),
                  const Padding(
                    padding: EdgeInsets.only(bottom: 20),
                    child: Text.rich(
                      TextSpan(
                        style: TextStyle(color: Color(0xFF444444), height: 1.5),
                        children: [
                          TextSpan(text: 'Nota que la regla para multiplicar por 11 es '),
                          TextSpan(
                            text: 'toma el número y suma el vecino',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                          TextSpan(
                            text: '; Por ejemplo: el primer número arriba es 5 + 0 = 5, el siguiente es 5 + 5 = ',
                          ),
                          TextSpan(
                            text: '10',
                            style: TextStyle(decoration: TextDecoration.underline),
                          ),
                          TextSpan(
                            text: ' con el dígito de las decenas siendo un acarreo (el punto), el siguiente es 5 + 5 = 10 y luego más el acarreo = ',
                          ),
                          TextSpan(
                            text: '11',
                            style: TextStyle(decoration: TextDecoration.underline),
                          ),
                          TextSpan(
                            text: ' con el dígito de las decenas siendo un acarreo (el punto), y así sucesivamente...',
                          ),
                        ],
                      ),
                    ),
                  ),
                  _section(
                    'Más Material',
                    "Si estás buscando más material sobre el método Trachtenberg, entonces recomiendo "
                        "altamente el libro 'El Sistema de Velocidad Trachtenberg de Matemáticas' de "
                        'Ann Cutler y Rudolph McShane. Es un libro profundo y fácil de seguir sobre todo '
                        'el sistema Trachtenberg.',
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _mathExample() {
    Widget digit(String d, {bool dot = false}) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 4),
        child: Column(
          children: [
            SizedBox(
              height: 10,
              child: dot
                  ? const Text('.', style: TextStyle(fontSize: 18, height: 0.6, color: AppTheme.textDark, fontWeight: FontWeight.bold))
                  : null,
            ),
            Text(d, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppTheme.textDark)),
          ],
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              digit('0'),
              digit('0'),
              digit('5'),
              digit('5'),
              digit('5'),
              digit('5'),
              const Padding(
                padding: EdgeInsets.symmetric(horizontal: 8),
                child: Text('×', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppTheme.textDark)),
              ),
              digit('1'),
              digit('1'),
            ],
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 24, vertical: 4),
            child: Divider(thickness: 2, color: AppTheme.textDark),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              digit('0'),
              digit('6', dot: true),
              digit('1', dot: true),
              digit('1', dot: true),
              digit('0'),
              digit('5'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _section(String title, String body) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppTheme.textDark)),
          const SizedBox(height: 8),
          Text(body, style: const TextStyle(color: Color(0xFF444444), height: 1.5)),
        ],
      ),
    );
  }
}
