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
    final compact = AppTheme.isCompact(context);
    return AppCard(
      padding: EdgeInsets.zero,
      child: Stack(
        children: [
          Padding(
            padding: EdgeInsets.fromLTRB(compact ? 16 : 40, compact ? 12 : 20, compact ? 16 : 40, compact ? 16 : 40),
            child: Column(
              mainAxisSize: compact ? MainAxisSize.max : MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Padding(
                  padding: EdgeInsets.only(top: compact ? 44 : 60, bottom: compact ? 20 : 50),
                  child: Text(
                    'Elegir Dificultad',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: compact ? 22 : 29,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.textDark,
                      decoration: TextDecoration.none,
                    ),
                  ),
                ),
                _opt('FÁCIL', () => state.selectDifficulty(Difficulty.facil), compact),
                const SizedBox(height: 2),
                _opt('MEDIO', () => state.selectDifficulty(Difficulty.medio), compact),
                const SizedBox(height: 2),
                _opt('DIFÍCIL', () => state.selectDifficulty(Difficulty.dificil), compact),
              ],
            ),
          ),
          Positioned(
            top: compact ? 12 : 20,
            left: compact ? 12 : 20,
            child: BackChip(onPressed: () => state.goTo(AppScreen.main)),
          ),
        ],
      ),
    );
  }

  Widget _opt(String label, VoidCallback onTap, bool compact) {
    final button = Material(
      color: AppTheme.menuDark,
      child: InkWell(
        onTap: onTap,
        hoverColor: const Color(0xFF555555),
        child: compact
            ? Center(
                child: Text(
                  label,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 1,
                    decoration: TextDecoration.none,
                  ),
                ),
              )
            : Padding(
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
    if (!compact) return button;
    return Expanded(child: button);
  }
}
