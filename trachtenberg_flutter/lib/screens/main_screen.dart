import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_state.dart';
import '../theme/app_theme.dart';

class MainScreen extends StatelessWidget {
  const MainScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const Spacer(),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.06),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.white.withOpacity(0.1)),
              ),
              child: Column(
                children: [
                  Text(
                    'Total multiplicaciones resueltas',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.7),
                      fontSize: 14,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${state.totalMultiplications}',
                    style: const TextStyle(
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.accent,
                    ),
                  ),
                  const SizedBox(height: 16),
                  OutlinedButton(
                    onPressed: state.reloadStats,
                    child: const Text('RECARGAR'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),
            const Text(
              'Modo de Juego',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 20),
            _modeBtn(context, 'UT', () => state.selectUtMode()),
            const SizedBox(height: 12),
            _modeBtn(context, '1-12', () => state.selectTablesMode()),
            const SizedBox(height: 12),
            _modeBtn(context, 'Info', () => state.selectGameModeInfo(),
                outlined: true),
            const Spacer(flex: 2),
          ],
        ),
      ),
    );
  }

  Widget _modeBtn(BuildContext context, String label, VoidCallback onTap,
      {bool outlined = false}) {
    return SizedBox(
      width: double.infinity,
      child: outlined
          ? OutlinedButton(
              onPressed: onTap,
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.white,
                side: BorderSide(color: Colors.white.withOpacity(0.3)),
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: Text(label, style: const TextStyle(fontSize: 18)),
            )
          : ElevatedButton(
              onPressed: onTap,
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: Text(label, style: const TextStyle(fontSize: 18)),
            ),
    );
  }
}
