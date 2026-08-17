import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_state.dart';
import '../logic/mnemotecnia.dart';
import '../theme/app_theme.dart';
import '../widgets/app_card.dart';

class MnemotecniaScreen extends StatelessWidget {
  const MnemotecniaScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final state = context.read<AppState>();
    return AppCard(
      expand: true,
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Column(
        children: [
          BackChip(onPressed: () => state.goTo(AppScreen.game)),
          const SizedBox(height: 8),
          const Text(
            'Tabla Mnemotécnica',
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppTheme.textDark),
          ),
          const SizedBox(height: 8),
          const Text(
            'Esta tabla te ayudará a recordar números en la multiplicación mediante la asociación de objetos y acciones.',
            textAlign: TextAlign.center,
            style: TextStyle(color: Color(0xFF555555), fontSize: 13),
          ),
          const SizedBox(height: 12),
          Expanded(
            child: ListView(
              children: [
                const Text('Correspondencia fonética', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.textDark)),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  children: correspondenciaFonetica
                      .map(
                        (c) => Chip(
                          label: Text('${c.num} = ${c.letras}'),
                          backgroundColor: const Color(0xFFfff0f5),
                          labelStyle: const TextStyle(color: AppTheme.textDark, fontSize: 12),
                        ),
                      )
                      .toList(),
                ),
                const SizedBox(height: 16),
                DataTable(
                  headingRowColor: WidgetStateProperty.all(const Color(0xFFff69b4)),
                  columnSpacing: 12,
                  headingTextStyle: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  columns: const [
                    DataColumn(label: Text('Nº')),
                    DataColumn(label: Text('Objeto')),
                    DataColumn(label: Text('Acción')),
                  ],
                  rows: mnemotecniaTable
                      .map(
                        (e) => DataRow(
                          cells: [
                            DataCell(Text('${e.num}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.pinkDeep))),
                            DataCell(Text(e.objeto, style: const TextStyle(color: AppTheme.textDark))),
                            DataCell(Text(e.accion, style: const TextStyle(color: Color(0xFF777777), fontStyle: FontStyle.italic))),
                          ],
                        ),
                      )
                      .toList(),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
