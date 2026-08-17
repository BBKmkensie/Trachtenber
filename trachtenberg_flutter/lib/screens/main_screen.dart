import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_state.dart';
import '../theme/app_theme.dart';
import '../widgets/app_card.dart';

class MainScreen extends StatelessWidget {
  const MainScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    return AppCard(
      expand: true,
      padding: const EdgeInsets.fromLTRB(28, 28, 28, 24),
      child: Column(
        children: [
          const Text(
            'TOTAL MULTIPLICACIONES RESUELTAS',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Color(0xFF666666),
              fontSize: 13,
              letterSpacing: 1,
              decoration: TextDecoration.none,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '${state.totalMultiplications}',
            style: const TextStyle(
              fontSize: 48,
              fontWeight: FontWeight.bold,
              color: AppTheme.textDark,
              decoration: TextDecoration.none,
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton(
            onPressed: state.reloadStats,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.menuDark,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
            ),
            child: const Text('RECARGAR', style: TextStyle(letterSpacing: 1, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 28),
          const Text(
            'Modo de Juego',
            style: TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w600,
              color: AppTheme.textDark,
              decoration: TextDecoration.none,
            ),
          ),
          const SizedBox(height: 20),
          Expanded(
            child: Column(
              children: [
                Expanded(
                  flex: 3,
                  child: Row(
                    children: [
                      Expanded(child: _modeBtn('UT', state.selectUtMode)),
                      const SizedBox(width: 2),
                      Expanded(child: _modeBtn('1-12', state.selectTablesMode)),
                    ],
                  ),
                ),
                const SizedBox(height: 2),
                Expanded(
                  flex: 2,
                  child: _modeBtn('INFO', state.selectGameModeInfo),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _modeBtn(String label, VoidCallback onTap) {
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
              fontSize: 24,
              fontWeight: FontWeight.bold,
              letterSpacing: 2,
              decoration: TextDecoration.none,
            ),
          ),
        ),
      ),
    );
  }
}
