import 'package:flutter/material.dart';

class AppTheme {
  static const Color darkBgStart = Color(0xFF1a1a2e);
  static const Color darkBgEnd = Color(0xFF16213e);
  static const Color solutionBg = Color(0xFF121212);
  static const Color gameBeige = Color(0xFFebe6dc);
  static const Color accent = Color(0xFF667eea);
  static const Color accent2 = Color(0xFF764ba2);
  static const Color solveGreen = Color(0xFF166534);
  static const Color backRed = Color(0xFF8B0000);
  static const Color keypadBg = Color(0xFF333333);
  static const Color pink = Color(0xFFff69b4);
  static const Color pinkDeep = Color(0xFFff1493);
  static const Color lightCard = Color(0xF2f0f0f0);
  static const Color textDark = Color(0xFF333333);
  static const Color badgeL = Color(0xFF1e3a8a);
  static const Color badgeR = Color(0xFF166534);
  static const Color widgetL = Color(0xFF1e40af);
  static const Color widgetR = Color(0xFF22c55e);
  static const Color oliveNav = Color(0xFF556b2f);
  static const Color menuDark = Color(0xFF333333);
  static const Color currentAmber = Color(0xFFfbbf24);

  static ThemeData get darkTheme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: darkBgStart,
        fontFamily: 'Segoe UI',
        colorScheme: const ColorScheme.dark(
          primary: accent,
          secondary: accent2,
          surface: Color(0xFF0f3460),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
        ),
      );

  static BoxDecoration get pageGradient => const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [darkBgStart, darkBgEnd],
        ),
      );

  /// Teléfono / pantalla estrecha (p. ej. Moto G53 6.8").
  static bool isCompact(BuildContext context) {
    return MediaQuery.sizeOf(context).shortestSide < 600;
  }
}
