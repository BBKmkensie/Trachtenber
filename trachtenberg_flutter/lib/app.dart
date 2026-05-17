import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'app_state.dart';
import 'screens/difficulty_screen.dart';
import 'screens/game_screen.dart';
import 'screens/info_screen.dart';
import 'screens/main_screen.dart';
import 'screens/solution_screen.dart';
import 'screens/table_select_screen.dart';
import 'theme/app_theme.dart';

class TrachtenbergApp extends StatelessWidget {
  const TrachtenbergApp({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => AppState(),
      child: MaterialApp(
        title: 'Método Trachtenberg',
        debugShowCheckedModeBanner: false,
        theme: AppTheme.darkTheme,
        home: const _RootRouter(),
      ),
    );
  }
}

class _RootRouter extends StatelessWidget {
  const _RootRouter();

  @override
  Widget build(BuildContext context) {
    final screen = context.watch<AppState>().screen;
    switch (screen) {
      case AppScreen.main:
        return const MainScreen();
      case AppScreen.infoMenu:
        return const InfoMenuScreen();
      case AppScreen.trachtenbergInfo:
        return const TrachtenbergInfoScreen();
      case AppScreen.difficulty:
        return const DifficultyScreen();
      case AppScreen.tableSelect:
        return const TableSelectScreen();
      case AppScreen.game:
        return const GameScreen();
      case AppScreen.solution:
        return const SolutionScreen();
    }
  }
}
