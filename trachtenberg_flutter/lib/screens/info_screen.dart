import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_state.dart';

class InfoMenuScreen extends StatelessWidget {
  const InfoMenuScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.read<AppState>();
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextButton(
              onPressed: () => state.goTo(AppScreen.main),
              child: const Align(
                alignment: Alignment.centerLeft,
                child: Text('Atrás'),
              ),
            ),
            const Text(
              'Info & Rules',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: () => state.goTo(AppScreen.trachtenbergInfo),
              child: const Text('Trachtenberg'),
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () {},
              child: const Text('Rules [1-12]'),
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: () {},
              child: const Text('Rule UT'),
            ),
          ],
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
    return SafeArea(
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Align(
              alignment: Alignment.centerLeft,
              child: TextButton(
                onPressed: () => state.goTo(AppScreen.infoMenu),
                child: const Text('Atrás'),
              ),
            ),
          ),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 24),
            child: Text(
              'El Método Trachtenberg',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
          ),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _section(
                    '¿Qué es el método Trachtenberg?',
                    'El método Trachtenberg es una forma de multiplicación que optimiza la velocidad '
                        'asignando la menor cantidad posible de números temporales que deben mantenerse '
                        'en memoria. Fue desarrollado por Jakow Trachtenberg.',
                  ),
                  _section(
                    'Convenciones',
                    'El sistema siempre comienza en el dígito más a la derecha y procede hacia la izquierda. '
                        'El acarreo se representa con un punto sobre la cifra.',
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _section(String title, String body) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(body, style: TextStyle(color: Colors.white.withOpacity(0.85), height: 1.5)),
        ],
      ),
    );
  }
}
