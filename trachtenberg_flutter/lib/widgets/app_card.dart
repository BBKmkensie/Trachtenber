import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

class AppCard extends StatelessWidget {
  final Widget child;
  final Color? color;
  final EdgeInsetsGeometry padding;
  final bool expand;

  const AppCard({
    super.key,
    required this.child,
    this.color,
    this.padding = const EdgeInsets.all(24),
    this.expand = false,
  });

  @override
  Widget build(BuildContext context) {
    final compact = AppTheme.isCompact(context);
    return Container(
      width: double.infinity,
      height: expand || compact ? double.infinity : null,
      margin: EdgeInsets.all(compact ? 8 : 16),
      child: Material(
        color: color ?? const Color(0xF2f0f0f0),
        elevation: 10,
        shadowColor: Colors.black45,
        borderRadius: BorderRadius.circular(20),
        clipBehavior: Clip.antiAlias,
        child: Padding(
          padding: padding,
          child: child,
        ),
      ),
    );
  }
}

class DarkMenuButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final double verticalPadding;

  const DarkMenuButton({
    super.key,
    required this.label,
    required this.onTap,
    this.verticalPadding = 22,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: onTap,
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF333333),
          foregroundColor: Colors.white,
          disabledForegroundColor: Colors.white70,
          padding: EdgeInsets.symmetric(vertical: verticalPadding, horizontal: 16),
          elevation: 0,
          shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w700,
            letterSpacing: 1.2,
          ),
        ),
      ),
    );
  }
}

class BackChip extends StatelessWidget {
  final VoidCallback? onPressed;
  const BackChip({super.key, this.onPressed});

  @override
  Widget build(BuildContext context) {
    final compact = AppTheme.isCompact(context);
    return Align(
      alignment: Alignment.centerLeft,
      child: TextButton(
        onPressed: onPressed,
        style: TextButton.styleFrom(
          backgroundColor: const Color(0xFF8B0000),
          foregroundColor: Colors.white,
          padding: EdgeInsets.symmetric(
            horizontal: compact ? 14 : 25,
            vertical: compact ? 8 : 10,
          ),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
        ),
        child: Text(
          'ATRÁS',
          style: TextStyle(
            fontWeight: FontWeight.w600,
            letterSpacing: 0.5,
            fontSize: compact ? 13 : 16,
          ),
        ),
      ),
    );
  }
}
