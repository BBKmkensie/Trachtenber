import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_state.dart';
import '../logic/table_rules.dart';
import '../theme/app_theme.dart';
import '../widgets/app_card.dart';

class Rules112Screen extends StatelessWidget {
  const Rules112Screen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.watch<AppState>();
    const tables = tables112;
    final current = state.currentRuleTable;
    final idx = tables.indexOf(current);
    final rules = getRulesForTable(current);

    return AppCard(
      expand: true,
      padding: const EdgeInsets.fromLTRB(12, 16, 12, 0),
      child: Column(
        children: [
          BackChip(onPressed: () => state.goTo(AppScreen.infoMenu)),
          const SizedBox(height: 8),
          Text(
            'Reglas | Multiplicación por $current',
            textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600, color: AppTheme.textDark),
          ),
          const SizedBox(height: 16),
          Expanded(
            child: SingleChildScrollView(
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _navBtn('←', idx > 0 ? () => state.setCurrentRuleTable(tables[idx - 1]) : null),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            _d('0'),
                            _d('6'),
                            _d('5'),
                            _d('4'),
                            const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 8),
                              child: Text('×', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppTheme.textDark)),
                            ),
                            _d('$current'),
                          ],
                        ),
                        const SizedBox(height: 16),
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(vertical: 24),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            border: Border.all(color: const Color(0xFFdddddd), width: 2),
                            borderRadius: BorderRadius.circular(5),
                          ),
                          child: const Text(
                            '654',
                            textAlign: TextAlign.center,
                            style: TextStyle(fontSize: 36, fontWeight: FontWeight.bold, color: AppTheme.textDark),
                          ),
                        ),
                        const SizedBox(height: 16),
                        ...rules.map(
                          (r) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: Text(r, style: const TextStyle(color: AppTheme.textDark, height: 1.6)),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  _navBtn('→', idx < tables.length - 1 ? () => state.setCurrentRuleTable(tables[idx + 1]) : null),
                ],
              ),
            ),
          ),
          Container(
            width: double.infinity,
            color: AppTheme.menuDark,
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
            child: Wrap(
              alignment: WrapAlignment.center,
              spacing: 2,
              runSpacing: 2,
              children: tables
                  .map(
                    (t) => TextButton(
                      onPressed: () => state.setCurrentRuleTable(t),
                      style: TextButton.styleFrom(
                        backgroundColor: t == current ? const Color(0xFF4a9eff) : AppTheme.menuDark,
                        foregroundColor: Colors.white,
                        minimumSize: const Size(52, 48),
                        padding: const EdgeInsets.symmetric(horizontal: 12),
                      ),
                      child: Text('$t', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
                    ),
                  )
                  .toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _d(String t) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4),
      child: Text(t, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700, color: AppTheme.textDark)),
    );
  }

  Widget _navBtn(String label, VoidCallback? onTap) {
    return SizedBox(
      width: 44,
      height: 160,
      child: Material(
        color: onTap == null ? AppTheme.oliveNav.withOpacity(0.45) : AppTheme.oliveNav,
        borderRadius: BorderRadius.circular(5),
        child: InkWell(
          onTap: onTap,
          child: Center(
            child: Text(label, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold)),
          ),
        ),
      ),
    );
  }
}
