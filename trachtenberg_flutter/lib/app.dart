import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'app_state.dart';
import 'screens/difficulty_screen.dart';
import 'screens/game_screen.dart';
import 'screens/info_screen.dart';
import 'screens/main_screen.dart';
import 'screens/mnemotecnia_screen.dart';
import 'screens/rule_ut_screen.dart';
import 'screens/rules_112_screen.dart';
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
    Widget page;
    switch (screen) {
      case AppScreen.main:
        page = const MainScreen();
        break;
      case AppScreen.infoMenu:
        page = const InfoMenuScreen();
        break;
      case AppScreen.trachtenbergInfo:
        page = const TrachtenbergInfoScreen();
        break;
      case AppScreen.difficulty:
        page = const DifficultyScreen();
        break;
      case AppScreen.tableSelect:
        page = const TableSelectScreen();
        break;
      case AppScreen.game:
        page = const GameScreen();
        break;
      case AppScreen.solution:
        page = const SolutionScreen();
        break;
      case AppScreen.mnemotecnia:
        page = const MnemotecniaScreen();
        break;
      case AppScreen.rule:
        page = const GameRuleModal();
        break;
      case AppScreen.rules112:
        page = const Rules112Screen();
        break;
      case AppScreen.ruleUt:
        page = const RuleUtScreen();
        break;
    }

    final fullBleed = screen == AppScreen.solution || screen == AppScreen.rule;
    final tallCard = screen == AppScreen.main ||
        screen == AppScreen.tableSelect ||
        screen == AppScreen.infoMenu;
    final narrow = tallCard ||
        screen == AppScreen.game ||
        screen == AppScreen.difficulty ||
        screen == AppScreen.infoMenu;

    return DecoratedBox(
      decoration: AppTheme.pageGradient,
      child: SafeArea(
        child: fullBleed
            ? page
            : LayoutBuilder(
                builder: (context, constraints) {
                  final compact = AppTheme.isCompact(context);
                  return Align(
                    alignment: Alignment.center,
                    child: ConstrainedBox(
                      constraints: BoxConstraints(
                        maxWidth: compact
                            ? constraints.maxWidth
                            : (narrow ? 600 : 800),
                        maxHeight: constraints.maxHeight,
                        minHeight: (compact || tallCard) ? constraints.maxHeight : 0,
                      ),
                      child: page,
                    ),
                  );
                },
              ),
      ),
    );
  }
}
