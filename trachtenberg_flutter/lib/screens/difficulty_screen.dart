import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_state.dart';

class DifficultyScreen extends StatelessWidget {
  const DifficultyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.read<AppState>();
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton(
                onPressed: () => state.goTo(AppScreen.main),
                child: const Text('Atrás'),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Elegir Dificultad',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const Spacer(),
            _opt('Fácil', () => state.selectDifficulty(Difficulty.facil)),
            const SizedBox(height: 12),
            _opt('Medio', () => state.selectDifficulty(Difficulty.medio)),
            const SizedBox(height: 12),
            _opt('Difícil', () => state.selectDifficulty(Difficulty.dificil)),
            const Spacer(flex: 2),
          ],
        ),
      ),
    );
  }

  Widget _opt(String label, VoidCallback onTap) {
    return ElevatedButton(
      onPressed: onTap,
      style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 18)),
      child: Text(label, style: const TextStyle(fontSize: 18)),
    );
  }
}
