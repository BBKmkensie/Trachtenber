import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/app_card.dart';

class DifficultyScreen extends StatelessWidget {
  const DifficultyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.read<AppState>();
    return AppCard(
      padding: EdgeInsets.zero,
      child: Stack(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(40, 20, 40, 40),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Padding(
                  padding: EdgeInsets.only(top: 60, bottom: 50),
                  child: Text(
                    'Elegir Dificultad',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 29,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textDark,
                      decoration: TextDecoration.none,
                    ),
                  ),
                ),
                _opt('FÁCIL', () => state.selectDifficulty(Difficulty.facil)),
                const SizedBox(height: 2),
                _opt('MEDIO', () => state.selectDifficulty(Difficulty.medio)),
                const SizedBox(height: 2),
                _opt('DIFÍCIL', () => state.selectDifficulty(Difficulty.dificil)),
              ],
            ),
          ),
          Positioned(
            top: 20,
            left: 20,
            child: BackChip(onPressed: () => state.goTo(AppScreen.main)),
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
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 50, horizontal: 20),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 21,
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
