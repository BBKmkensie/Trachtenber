import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_state.dart';
import '../logic/table_rules.dart';
import '../theme/app_theme.dart';
import '../widgets/app_card.dart';

class TableSelectScreen extends StatelessWidget {
  const TableSelectScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.read<AppState>();
    return AppCard(
      expand: true,
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 16),
      child: Column(
        children: [
          BackChip(onPressed: () => state.goTo(AppScreen.main)),
          const SizedBox(height: 8),
          const Text(
            'Multiplicación 1-12',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w600,
              color: AppTheme.textDark,
              decoration: TextDecoration.none,
            ),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: LayoutBuilder(
              builder: (context, constraints) {
                const cols = 2;
                const rows = 5;
                const gap = 2.0;
                final cellW = (constraints.maxWidth - gap) / cols;
                final cellH = (constraints.maxHeight - gap * (rows - 1)) / rows;
                return GridView.count(
                  crossAxisCount: cols,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: gap,
                  crossAxisSpacing: gap,
                  childAspectRatio: cellW / cellH,
                  children: tables112.map((t) {
                    return Material(
                      color: AppTheme.menuDark,
                      child: InkWell(
                        onTap: () => state.selectTable(t),
                        hoverColor: const Color(0xFF555555),
                        child: Center(
                          child: Text(
                            '$t',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 28,
                              fontWeight: FontWeight.w600,
                              decoration: TextDecoration.none,
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
