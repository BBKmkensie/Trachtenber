import 'dart:async';
import 'dart:math';

import 'package:flutter/foundation.dart';

import 'logic/table_math.dart';
import 'logic/ut_math.dart';

enum AppScreen {
  main,
  infoMenu,
  trachtenbergInfo,
  difficulty,
  tableSelect,
  game,
  solution,
  mnemotecnia,
  rule,
  rules112,
  ruleUt,
}

enum GameMode { ut, tables112 }

enum Difficulty { facil, medio, dificil }

class GameQuestion {
  final int num1;
  final int num2;
  final String operator;
  final int answer;
  const GameQuestion({
    required this.num1,
    required this.num2,
    required this.operator,
    required this.answer,
  });
}

class AppState extends ChangeNotifier {
  AppScreen screen = AppScreen.main;
  GameMode? gameMode;
  Difficulty difficulty = Difficulty.facil;
  int? selectedTable;
  int currentRuleTable = 2;

  int totalMultiplications = 5;
  int score = 0;
  int timeLeft = 60;
  bool gameActive = false;
  int correctAnswers = 0;
  int totalQuestions = 0;

  GameQuestion question =
      const GameQuestion(num1: 0, num2: 0, operator: '×', answer: 0);
  String userAnswer = '';
  final Map<int, int> carryDots = {};
  String feedback = '';

  List<SolutionStep> solutionSteps = [];
  int currentStep = 0;

  String utNumber1 = '123';
  String utNumber2 = '45';
  int utArrowStep = 0;

  Timer? _timer;
  bool _timerResetFlag = false;
  final _random = Random();

  int get accuracy =>
      totalQuestions > 0 ? ((correctAnswers / totalQuestions) * 100).round() : 0;

  bool get hasIncorrectFeedback => feedback.contains('Incorrecto');

  String paddedGameLhs() {
    if (gameMode == GameMode.ut) {
      return padUTMultiplicand(question.num1, question.num2);
    }
    return question.num1.toString().padLeft(5, '0');
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void reloadStats() {
    totalMultiplications = 0;
    notifyListeners();
  }

  void goTo(AppScreen s) {
    screen = s;
    if (s == AppScreen.solution) currentStep = 0;
    notifyListeners();
  }

  void selectGameModeInfo() => goTo(AppScreen.infoMenu);

  void selectUtMode() {
    gameMode = GameMode.ut;
    goTo(AppScreen.difficulty);
  }

  void selectTablesMode() {
    gameMode = GameMode.tables112;
    goTo(AppScreen.tableSelect);
  }

  void selectDifficulty(Difficulty d) {
    difficulty = d;
    startGame();
  }

  void selectTable(int table) {
    selectedTable = table;
    startGame();
  }

  void startGame() {
    screen = AppScreen.game;
    gameActive = true;
    score = 0;
    timeLeft = 60;
    correctAnswers = 0;
    totalQuestions = 0;
    userAnswer = '';
    carryDots.clear();
    feedback = '';
    _startTimer();
    generateQuestion();
  }

  void stopGame() {
    if (hasIncorrectFeedback) return;
    _timer?.cancel();
    gameActive = false;
    feedback = '';
    screen = AppScreen.main;
    gameMode = null;
    notifyListeners();
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!gameActive) return;
      if (screen == AppScreen.solution || screen == AppScreen.mnemotecnia) {
        return;
      }
      if (timeLeft > 0) {
        timeLeft--;
        _timerResetFlag = false;
        notifyListeners();
      } else if (!_timerResetFlag) {
        _timerResetFlag = true;
        timeLeft = 60;
        if (!hasIncorrectFeedback) {
          feedback =
              'Tiempo agotado; cronómetro reiniciado. El mismo ejercicio sigue hasta que respondas bien.';
        }
        notifyListeners();
      }
    });
  }

  void generateQuestion() {
    late int num1;
    late int num2;

    if (gameMode == GameMode.ut) {
      switch (difficulty) {
        case Difficulty.facil:
          num1 = _randDigits(1, 2);
          num2 = _randDigits(1, 2);
          break;
        case Difficulty.medio:
          num1 = _randDigits(2, 3);
          num2 = _randDigits(2, 3);
          break;
        case Difficulty.dificil:
          num1 = _randDigits(3, 5);
          num2 = _randDigits(3, 5);
          break;
      }
    } else if (gameMode == GameMode.tables112 && selectedTable != null) {
      num1 = selectedTable!;
      num2 = _rand(1, 12);
    } else {
      num1 = _rand(1, 12);
      num2 = _rand(1, 12);
    }

    question = GameQuestion(
      num1: num1,
      num2: num2,
      operator: '×',
      answer: num1 * num2,
    );
    userAnswer = '';
    carryDots.clear();
    feedback = '';
    solutionSteps = gameMode == GameMode.tables112 && selectedTable != null
        ? generateTableSolutionSteps(num1, selectedTable!)
        : generateUtSolutionSteps(num1, num2);
    currentStep = 0;
    notifyListeners();
  }

  int _rand(int min, int max) => min + _random.nextInt(max - min + 1);

  int _randDigits(int minDigits, int maxDigits) {
    final digits = _rand(minDigits, maxDigits);
    final min = digits == 1 ? 1 : pow(10, digits - 1).toInt();
    final max = pow(10, digits).toInt() - 1;
    return _rand(min, max);
  }

  void showSolution() {
    currentStep = 0;
    solutionSteps = gameMode == GameMode.tables112 && selectedTable != null
        ? generateTableSolutionSteps(question.num1, selectedTable!)
        : generateUtSolutionSteps(question.num1, question.num2);
    goTo(AppScreen.solution);
  }

  void closeSolution() => goTo(AppScreen.game);

  void showMnemotecnia() {
    if (hasIncorrectFeedback) return;
    goTo(AppScreen.mnemotecnia);
  }

  void showRule() => goTo(AppScreen.rule);

  void nextStep() {
    if (currentStep < solutionSteps.length - 1) {
      currentStep++;
      notifyListeners();
    }
  }

  void prevStep() {
    if (currentStep > 0) {
      currentStep--;
      notifyListeners();
    }
  }

  void setCurrentRuleTable(int table) {
    currentRuleTable = table;
    notifyListeners();
  }

  void setUtNumbers(String n1, String n2) {
    utNumber1 = n1.replaceAll(RegExp(r'[^0-9]'), '');
    utNumber2 = n2.replaceAll(RegExp(r'[^0-9]'), '');
    utArrowStep = 0;
    notifyListeners();
  }

  void utStepForward() {
    final padded = padUTMultiplicand(
      utNumber1.isEmpty ? '123' : utNumber1,
      utNumber2.isEmpty ? '45' : utNumber2,
    );
    if (utArrowStep < padded.length) {
      utArrowStep++;
      notifyListeners();
    }
  }

  void utStepBack() {
    if (utArrowStep > 0) {
      utArrowStep--;
      notifyListeners();
    }
  }

  void keypadInput(String value) {
    if (!gameActive) return;
    final maxDigits = paddedGameLhs().length;

    switch (value) {
      case 'CE':
        userAnswer = '';
        carryDots.clear();
        break;
      case '←':
        if (userAnswer.isNotEmpty) {
          final posRemove = userAnswer.length - 1;
          userAnswer = userAnswer.substring(1);
          final adjusted = <int, int>{};
          carryDots.forEach((pos, count) {
            if (pos > posRemove) {
              adjusted[pos - 1] = count;
            } else if (pos < posRemove) {
              adjusted[pos] = count;
            }
          });
          carryDots
            ..clear()
            ..addAll(adjusted);
        }
        break;
      case '→':
        checkAnswer();
        return;
      case '.':
        if (userAnswer.isNotEmpty) {
          final position = userAnswer.length - 1;
          carryDots[position] = ((carryDots[position] ?? 0) + 1).clamp(0, 3);
        }
        break;
      default:
        if (userAnswer.length < maxDigits) {
          userAnswer = value + userAnswer;
        }
    }
    notifyListeners();
  }

  void checkAnswer() {
    if (!gameActive || userAnswer.isEmpty) return;

    if (multiplicationAnswerMatches(userAnswer, question.answer)) {
      totalQuestions++;
      score += 10;
      correctAnswers++;
      totalMultiplications++;
      _timerResetFlag = false;
      feedback = '¡Correcto! +10 puntos';
      userAnswer = '';
      carryDots.clear();
      notifyListeners();
      Future.delayed(const Duration(seconds: 1), () {
        timeLeft = 60;
        generateQuestion();
        feedback = '';
        notifyListeners();
      });
    } else {
      final variants =
          getProductAnswerVariants(question.num1, question.num2, question.answer);
      final dual = variants.plain != variants.padded
          ? ' (${variants.plain} o ${variants.padded}; ambas formas son correctas)'
          : '';
      feedback =
          'Incorrecto. La respuesta correcta es ${variants.plain}$dual. Intenta de nuevo.';
      notifyListeners();
    }
  }
}
