import 'package:flutter/material.dart';

class AppTheme {
  static const Color darkBg = Color(0xFF1a1a2e);
  static const Color solutionBg = Color(0xFF16213e);
  static const Color gameBeige = Color(0xFFebe6dc);
  static const Color accent = Color(0xFF667eea);
  static const Color accent2 = Color(0xFF764ba2);
  static const Color solveGreen = Color(0xFF2d5a3d);

  static ThemeData get darkTheme => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: darkBg,
        colorScheme: ColorScheme.dark(
          primary: accent,
          secondary: accent2,
          surface: const Color(0xFF0f3460),
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.transparent,
          elevation: 0,
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: accent,
            foregroundColor: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
      );
}
