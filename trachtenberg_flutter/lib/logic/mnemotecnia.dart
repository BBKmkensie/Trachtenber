class MnemItem {
  final int num;
  final String objeto;
  final String accion;
  const MnemItem(this.num, this.objeto, this.accion);
}

const mnemotecniaTable = <MnemItem>[
  MnemItem(0, 'aro', 'ara'),
  MnemItem(1, 'té', 'excita'),
  MnemItem(2, 'huña', 'garra'),
  MnemItem(3, 'humo', 'tose'),
  MnemItem(4, 'k.o', 'noquea'),
  MnemItem(5, 'ala', 'vuela'),
  MnemItem(6, 'oso', 'gruñe'),
  MnemItem(7, 'avión', 'vuela'),
  MnemItem(8, 'hacha', 'corta'),
  MnemItem(9, 'boa', 'muerde'),
  MnemItem(10, 'toro', 'enviste'),
  MnemItem(11, 'dedo', 'señala'),
  MnemItem(12, 'tuna', 'pincha'),
  MnemItem(13, 'dama', 'encoje'),
  MnemItem(14, 'dique', 'soporta'),
  MnemItem(15, 'duelo', 'mata'),
  MnemItem(16, 'tiza', 'empolva'),
  MnemItem(17, 'teja', 'cubre'),
  MnemItem(18, 'ducha', 'moja'),
  MnemItem(19, 'topo', 'cava'),
  MnemItem(20, 'noria', 'da vueltas'),
  MnemItem(21, 'nata', 'decora'),
  MnemItem(22, 'niño', 'chupa piruleta'),
  MnemItem(23, 'gnomo', 'sombrero verde'),
  MnemItem(24, 'anca', 'salta'),
  MnemItem(25, 'nilo', 'navega'),
  MnemItem(26, 'anís', 'emborracha'),
  MnemItem(27, 'hinojo', 'enoja'),
  MnemItem(28, 'hongo', 'multiplica'),
  MnemItem(29, 'naipe', 'mezcla'),
  MnemItem(30, 'muro', 'delimita'),
  MnemItem(31, 'mate', 'chupa'),
  MnemItem(32, 'mano', 'Hi-5'),
  MnemItem(33, 'momia', 'anda a tumbos'),
  MnemItem(34, 'moco', 'estornuda'),
  MnemItem(35, 'miel', 'pegajosa'),
  MnemItem(36, 'mesa', 'apoyo'),
  MnemItem(37, 'mafia', 'fuma'),
  MnemItem(38, 'macho', 'alfa'),
  MnemItem(39, 'mopa', 'barre'),
  MnemItem(40, 'coro', 'canta'),
  MnemItem(41, 'codo', 'clava'),
  MnemItem(42, 'cuna', 'hamaca'),
  MnemItem(43, 'cama', 'duerme'),
  MnemItem(44, 'coco', 'cae'),
  MnemItem(45, 'cola', 'caga'),
  MnemItem(46, 'casa', 'revive'),
  MnemItem(47, 'cojo', 'cojea'),
  MnemItem(48, 'coche', 'corre'),
  MnemItem(49, 'copa', 'invoca'),
  MnemItem(50, 'loro', 'enjaulado'),
  MnemItem(51, 'lata', 'molesta'),
  MnemItem(52, 'lana', 'abriga'),
  MnemItem(53, 'lima', 'desgasta'),
  MnemItem(54, 'laca', 'endurece'),
  MnemItem(55, 'lila', 'florece'),
  MnemItem(56, 'luz', 'alumbra'),
  MnemItem(57, 'alf', 'está en el espacio'),
  MnemItem(58, 'lego', 'construye'),
  MnemItem(59, 'lobo', 'aúlla'),
  MnemItem(60, 'zorro', 'usa antifaz'),
  MnemItem(61, 'soda', 'burbujea'),
  MnemItem(62, 'asno', 'carga'),
  MnemItem(63, 'sumo', 'lucha'),
  MnemItem(64, 'saco', 'guarda'),
  MnemItem(65, 'sal', 'da sed'),
  MnemItem(66, 'huesos', 'lamer'),
  MnemItem(67, 'sofá', 'sienta'),
  MnemItem(68, 'soga', 'ata'),
  MnemItem(69, 'sopa', 'toma en cucharas'),
  MnemItem(70, 'faro', 'guía'),
  MnemItem(71, 'foto', 'enmarca'),
  MnemItem(72, 'faena', 'trabajo'),
  MnemItem(73, 'fama', 'estrella'),
  MnemItem(74, 'foca', 'aplaude'),
  MnemItem(75, 'fila', 'espera'),
  MnemItem(76, 'juez', 'martilla'),
  MnemItem(77, 'faja', 'aprieta'),
  MnemItem(78, 'fuego', 'quema'),
  MnemItem(79, 'japo', 'lucha con espadas'),
  MnemItem(80, 'gorro', 'tapa cabeza'),
  MnemItem(81, 'gato', 'hace miau'),
  MnemItem(82, 'genio', 'levita'),
  MnemItem(83, 'goma', 'lanza'),
  MnemItem(84, 'chica', 'seduce'),
  MnemItem(85, 'gol', 'meter'),
  MnemItem(86, 'chus', 'enfada'),
  MnemItem(87, 'gofio', 'atraganta'),
  MnemItem(88, 'gaga', 'baila'),
  MnemItem(89, 'chavo', 'llora'),
  MnemItem(90, 'barro', 'ensucia'),
  MnemItem(91, 'bota', 'en pies'),
  MnemItem(92, 'vino', 'catar'),
  MnemItem(93, 'pomo', 'cierra'),
  MnemItem(94, 'boca', 'habla'),
  MnemItem(95, 'bola', 'desinfla'),
  MnemItem(96, 'vaso', 'bebe'),
  MnemItem(97, 'abeja', 'zumba'),
  MnemItem(98, 'bicho', 'aplasta'),
  MnemItem(99, 'pipa', 'cruje'),
];

const correspondenciaFonetica = <({int num, String letras})>[
  (num: 0, letras: 'r, rr'),
  (num: 1, letras: 't, d'),
  (num: 2, letras: 'n, ñ'),
  (num: 3, letras: 'm, w'),
  (num: 4, letras: 'c, k, q'),
  (num: 5, letras: 'l, ll'),
  (num: 6, letras: 's, z'),
  (num: 7, letras: 'f, j'),
  (num: 8, letras: 'g, ch'),
  (num: 9, letras: 'b, p, v'),
];

MnemItem? getMnemotecniaWord(int num) {
  for (final item in mnemotecniaTable) {
    if (item.num == num) return item;
  }
  return null;
}

class MnemSuggestion {
  final String type;
  final int number;
  final String objeto;
  final String accion;
  const MnemSuggestion({
    required this.type,
    required this.number,
    required this.objeto,
    required this.accion,
  });
}

({List<MnemSuggestion> recent, List<MnemSuggestion> all}) getMnemotecniaSuggestions(
  String answer,
) {
  if (answer.isEmpty) return (recent: [], all: []);
  final recent = <MnemSuggestion>[];
  final lastDigit = int.parse(answer[answer.length - 1]);
  final lastWord = getMnemotecniaWord(lastDigit);
  if (lastWord != null) {
    recent.add(MnemSuggestion(
      type: 'single',
      number: lastDigit,
      objeto: lastWord.objeto,
      accion: lastWord.accion,
    ));
  }
  if (answer.length >= 2) {
    void addPair(int i) {
      final pair = int.parse(answer[i] + answer[i + 1]);
      final pairWord = getMnemotecniaWord(pair);
      if (pairWord != null) {
        recent.add(MnemSuggestion(
          type: 'pair',
          number: pair,
          objeto: pairWord.objeto,
          accion: pairWord.accion,
        ));
      }
    }

    final k = answer.length - 1;
    if (answer.length == 4) {
      addPair(0);
      addPair(2);
    } else if (answer.length == 5) {
      addPair(1);
      addPair(3);
    } else if (k <= 2) {
      for (var i = 0; i < k; i++) {
        addPair(i);
      }
    } else {
      addPair(0);
      addPair(k - 1);
    }
  }

  final all = <MnemSuggestion>[];
  for (var i = 0; i < answer.length; i++) {
    final digit = int.parse(answer[i]);
    final word = getMnemotecniaWord(digit);
    if (word != null) {
      all.add(MnemSuggestion(
        type: 'single',
        number: digit,
        objeto: word.objeto,
        accion: word.accion,
      ));
    }
  }
  return (recent: recent, all: all);
}
