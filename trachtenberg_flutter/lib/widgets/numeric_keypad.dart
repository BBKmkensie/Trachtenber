import 'package:flutter/material.dart';

class NumericKeypad extends StatelessWidget {
  final void Function(String) onKey;

  const NumericKeypad({super.key, required this.onKey});

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 4,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 8,
      crossAxisSpacing: 8,
      childAspectRatio: 1.4,
      children: [
        _keyBtn('1'),
        _keyBtn('2'),
        _keyBtn('3'),
        _keyBtn('CE', label: 'CE'),
        _keyBtn('4'),
        _keyBtn('5'),
        _keyBtn('6'),
        _keyBtn('←', label: '←'),
        _keyBtn('7'),
        _keyBtn('8'),
        _keyBtn('9'),
        _keyBtn('.', label: '.'),
        const _EmptyKey(),
        _keyBtn('0'),
        const _EmptyKey(),
        _keyBtn('→', label: '→', color: const Color(0xFF2d5a3d)),
      ],
    );
  }

  Widget _keyBtn(String key, {String? label, Color? color}) {
    return Material(
      color: color ?? const Color(0xFFf5f0e6),
      borderRadius: BorderRadius.circular(8),
      child: InkWell(
        onTap: () => onKey(key),
        borderRadius: BorderRadius.circular(8),
        child: Center(
          child: Text(
            label ?? key,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: color != null ? Colors.white : const Color(0xFF333333),
            ),
          ),
        ),
      ),
    );
  }
}

class _EmptyKey extends StatelessWidget {
  const _EmptyKey();

  @override
  Widget build(BuildContext context) => const SizedBox.shrink();
}
