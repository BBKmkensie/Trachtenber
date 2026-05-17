import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_state.dart';

class TableSelectScreen extends StatelessWidget {
  const TableSelectScreen({super.key});

  static const tables = [2, 3, 4, 5, 6, 7, 8, 9, 11, 12];

  @override
  Widget build(BuildContext context) {
    final state = context.read<AppState>();
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton(
                onPressed: () => state.goTo(AppScreen.main),
                child: const Text('Atrás'),
              ),
            ),
            const Text(
              'Multiplicación 1-12',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 24),
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                ),
                itemCount: tables.length,
                itemBuilder: (_, i) {
                  final t = tables[i];
                  return ElevatedButton(
                    onPressed: () => state.selectTable(t),
                    child: Text('$t', style: const TextStyle(fontSize: 22)),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
