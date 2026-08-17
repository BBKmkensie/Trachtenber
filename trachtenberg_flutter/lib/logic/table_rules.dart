const tables112 = [2, 3, 4, 5, 6, 7, 8, 9, 11, 12];

List<String> getRulesForTable(int table) {
  switch (table) {
    case 2:
      return ['Regla - Duplica el número'];
    case 3:
      return [
        'Regla 1.) - Primer dígito: resta de 10 y duplica; Suma 5 si el número es impar',
        'Regla 2.) - Dígitos medios: Resta el número de 9 y duplica lo que obtengas, luego suma la mitad del vecino; suma 5 si el número es impar',
        'Regla 3.) - Último dígito: resta 2 de la mitad del dígito más a la izquierda en el número',
      ];
    case 4:
      return [
        'Regla 1.) - Primer dígito: resta de 10',
        'Regla 2.) - Dígitos medios: Resta el número de 9 y suma la mitad del vecino; suma 5 si el número es impar',
        'Regla 3.) - Último dígito: resta 1 de la mitad del dígito más a la izquierda en el número',
      ];
    case 5:
      return ['Regla - La mitad del vecino; más 5 si el "número" es impar.'];
    case 6:
      return ['Regla - A cada "número" suma la mitad del vecino; más 5 si el "número" es impar.'];
    case 7:
      return ['Regla - Duplica el número y suma la mitad del vecino; suma 5 si el número es impar.'];
    case 8:
      return [
        'Regla 1.) - Primer dígito: resta de 10 y duplica',
        'Regla 2.) - Dígitos medios: Resta el número de 9 y duplica lo que obtengas, luego suma el vecino',
        'Regla 3.) - Último dígito: resta 2 del dígito más a la izquierda en el número',
      ];
    case 9:
      return ['Regla - Resta el número de 10 y suma el vecino'];
    case 11:
      return ['Regla - A cada número suma su vecino'];
    case 12:
      return ['Regla - Duplica cada número y suma su vecino'];
    default:
      return [];
  }
}

String getShortRuleForTable(int table) {
  const rules = {
    1: 'Multiplica el número por 1 (el número permanece igual)',
    2: 'Duplica el número',
    3: 'Triplica el número y suma los acarreos',
    4: 'Duplica dos veces el número',
    5: 'Multiplica por 10 y divide por 2',
    6: 'Multiplica por 3 y luego duplica',
    7: 'Multiplica por 10 y resta 3 veces el número',
    8: 'Duplica tres veces el número',
    9: 'Multiplica por 10 y resta el número',
    10: 'Agrega un cero al final',
    11: 'Suma el número consigo mismo desplazado',
    12: 'Multiplica por 10 y suma el doble del número',
  };
  return rules[table] ?? 'Regla general de multiplicación';
}

const utMethodIntro =
    'El método de multiplicación unidades-decenas (método UT) es un método para multiplicar '
    'enteros arbitrarios con una cantidad mínima de resultados temporales que deben mantenerse '
    'en memoria. Las reglas para multiplicar dos números, abc y de usando multiplicación UT '
    'son las siguientes:';

const utPrepText =
    'Agrega una cantidad de ceros iniciales, al término izquierdo en el producto, igual al '
    'número de dígitos en el lado derecho del producto. Por ejemplo, escribe el número 123 '
    'como 000123 si 123 se multiplica por un número de 3 dígitos (esto se hace automáticamente '
    'en esta aplicación).';

const utCalcParagraphs = [
  'Para encontrar el primer dígito de la respuesta, toma el dígito de las unidades de '
      'multiplicar el dígito más a la derecha de los términos izquierdo y derecho en el producto, '
      'por ejemplo 3*5 = 15.',
  'Para encontrar el segundo dígito de la respuesta, suma el dígito de las unidades de '
      'multiplicar el segundo dígito del término izquierdo por el primer dígito del término '
      'derecho, leído desde la derecha, por ejemplo 2 * 5 = 10. Suma esto al dígito de las '
      'decenas de multiplicar el dígito más a la derecha en los términos derecho e izquierdo, '
      'por ejemplo 3 * 5 = 15 y finalmente suma el dígito de las unidades del segundo término '
      'desde la izquierda del término derecho con el dígito más a la derecha en el término '
      'izquierdo, por ejemplo 3 * 4 = 12. Entonces 0+1+2 = 3.',
  'Para encontrar el dígito número n de la respuesta, toma el dígito de las unidades del '
      'resultado de multiplicar el primer dígito en el término derecho con el n-ésimo dígito '
      'del término izquierdo y suma el dígito de las decenas de multiplicar el primer dígito '
      'en el término derecho con el (n-1)-ésimo dígito del término izquierdo. Luego toma el '
      'dígito de las unidades del resultado de multiplicar el segundo dígito en el término '
      'derecho con el (n-1)-ésimo dígito del término izquierdo y suma el dígito de las decenas '
      'de multiplicar el segundo dígito en el término derecho con el (n-2)-ésimo dígito del '
      'término izquierdo.',
  'Continúa así hasta que te quedes sin dígitos de una forma u otra. Finalmente, suma todos '
      'los resultados intermedios y posiblemente los acarreos de dígitos anteriores. La respuesta '
      'es el dígito de las unidades de este resultado, el acarreo es el dígito de las decenas '
      'del resultado.',
  'La mejor manera de entender este proceso es practicando: usa el widget de arriba con '
      'tus propios números e intenta seguir el proceso.',
];

const utVerifyTitle = '3. Verificación:';
const utVerifyText =
    'Multiplica la raíz digital (definición a continuación) del término izquierdo con la raíz '
    'digital del término derecho, toma la suma de dígitos (definición a continuación) del '
    'resultado y compárala con la raíz digital de tu respuesta.';

const utDefinitionsTitle = 'Definiciones:';
const utDigitSumText =
    'Suma de dígitos: la suma de los dígitos en un número, por ejemplo la '
    'suma de dígitos de 1234 → 1+2+3+4=10 y la suma de dígitos de 6283 → 6+2+8+3=19.';
const utDigitalRootText =
    'Raíz digital: el resultado de hacer repetidamente la suma de dígitos '
    'de un número hasta que el resultado esté en un solo dígito, por ejemplo la raíz digital '
    'de 1234 → 1+2+3+4=10→1+0=1 y la raíz digital de 6283 → 6+2+8+3=19→1+9=10→1+0=1.';
