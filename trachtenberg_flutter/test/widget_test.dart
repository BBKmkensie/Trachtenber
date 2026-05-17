import 'package:flutter_test/flutter_test.dart';
import 'package:trachtenberg_flutter/app.dart';

void main() {
  testWidgets('App loads main screen', (WidgetTester tester) async {
    await tester.pumpWidget(const TrachtenbergApp());
    expect(find.text('Modo de Juego'), findsOneWidget);
  });
}
