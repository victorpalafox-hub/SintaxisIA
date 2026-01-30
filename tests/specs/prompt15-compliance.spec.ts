/**
 * @fileoverview Tests para Compliance Validator
 *
 * Valida el sistema de deteccion de "marcadores humanos" en scripts.
 * El validador detecta 6 tipos de marcadores y requiere minimo 4 para pasar.
 *
 * Marcadores evaluados:
 * 1. Primera persona (yo, mi, creo, etc.)
 * 2. Opinion subjetiva
 * 3. Admision de incertidumbre
 * 4. Pregunta reflexiva
 * 5. Evita lenguaje corporativo
 * 6. Uso de analogias
 *
 * @author Sintaxis IA
 * @version 1.0.0
 * @since Prompt 15
 */

import { test, expect } from '@playwright/test';
import {
  ComplianceValidator,
  validateScriptCompliance,
  quickHumanCheck,
} from '../../automation/src/services/compliance-validator';
import type { GeneratedScript } from '../../automation/src/types/script.types';

// =============================================================================
// TEST SUITE: COMPLIANCE VALIDATOR
// =============================================================================

test.describe('Prompt 15 - Compliance Validator', () => {
  let validator: ComplianceValidator;

  test.beforeEach(() => {
    validator = new ComplianceValidator();
  });

  // ===========================================================================
  // TESTS: SCRIPTS QUE PASAN COMPLIANCE
  // ===========================================================================

  test.describe('Scripts que pasan compliance (score >= 4/6)', () => {
    test('should pass script with all human markers (6/6)', () => {
      // Arrange - Script con todos los marcadores humanos (sin palabras corporativas)
      const script: GeneratedScript = {
        hook: 'Hay un detalle que todos estan pasando por alto.',
        body: 'Anthropic mejoro la inferencia manteniendo calidad. Esto es como mejorar un motor sin perder potencia.',
        opinion:
          'Lo que me parece interesante es que probablemente esto cambie como pensamos sobre eficiencia en IA.',
        cta: 'Crees que este enfoque es sostenible? Dejame tu analisis.',
        duration: 52,
      };

      // Act
      const report = validator.validateHumanElements(script);

      // Assert
      expect(report.passed).toBe(true);
      expect(report.humanScore).toBeGreaterThanOrEqual(4);
      expect(report.markers.hasFirstPerson).toBe(true);
      expect(report.markers.hasOpinion).toBe(true);
      expect(report.markers.admitsUncertainty).toBe(true);
      expect(report.markers.hasReflectiveQuestion).toBe(true);
      expect(report.markers.avoidsCorpSpeak).toBe(true);
      expect(report.markers.hasAnalogy).toBe(true);
    });

    test('should pass script with minimum markers (4/6)', () => {
      // Arrange - Script con exactamente 4 marcadores
      const script: GeneratedScript = {
        hook: 'Algo interesante paso esta semana.',
        body: 'La empresa lanzo un nuevo producto con mejoras significativas.',
        opinion: 'Yo creo que esto podria ser importante para el mercado.',
        cta: 'Piensas que esto funcionara? Comentame.',
        duration: 50,
      };

      // Act
      const report = validator.validateHumanElements(script);

      // Assert
      expect(report.humanScore).toBeGreaterThanOrEqual(4);
      // Debe tener al menos: primera persona, opinion, incertidumbre, pregunta
      expect(report.markers.hasFirstPerson).toBe(true);
    });

    test('should detect first person usage correctly', () => {
      // Arrange - Script con primera persona
      const script: GeneratedScript = {
        hook: 'Yo creo que esto es importante.',
        body: 'En mi analisis, noto que hay patrones interesantes.',
        opinion: 'Me parece que estamos viendo un cambio.',
        cta: 'Que piensas tu?',
        duration: 50,
      };

      // Act
      const report = validator.validateHumanElements(script);

      // Assert
      expect(report.markers.hasFirstPerson).toBe(true);
    });

    test('should detect uncertainty admission correctly', () => {
      // Arrange - Script que admite incertidumbre
      const script: GeneratedScript = {
        hook: 'Aun no esta claro si esto funcionara.',
        body: 'Probablemente veamos cambios, pero es dificil saber con certeza.',
        opinion: 'Tal vez esto sea significativo, quiza no.',
        cta: 'Piensas que funcionara?',
        duration: 50,
      };

      // Act
      const report = validator.validateHumanElements(script);

      // Assert
      expect(report.markers.admitsUncertainty).toBe(true);
    });

    test('should detect analogies correctly', () => {
      // Arrange - Script con analogias
      const script: GeneratedScript = {
        hook: 'Esta tecnologia es como un cerebro digital.',
        body: 'Similar a como funciona el aprendizaje humano.',
        opinion: 'Me recuerda a los avances de los 90s.',
        cta: 'Crees que se parece a algo que hayas visto?',
        duration: 50,
      };

      // Act
      const report = validator.validateHumanElements(script);

      // Assert
      expect(report.markers.hasAnalogy).toBe(true);
    });
  });

  // ===========================================================================
  // TESTS: SCRIPTS QUE NO PASAN COMPLIANCE
  // ===========================================================================

  test.describe('Scripts que NO pasan compliance (score < 4/6)', () => {
    test('should fail script without human markers', () => {
      // Arrange - Script robotico sin marcadores humanos
      const script: GeneratedScript = {
        hook: 'Anthropic lanza Claude 3.5.',
        body: 'La compania presenta mejoras revolucionarias. El sistema optimiza todos los procesos.',
        opinion: 'Este lanzamiento cambia el paradigma de la industria.',
        cta: 'Que opinas?',
        duration: 45,
      };

      // Act
      const report = validator.validateHumanElements(script);

      // Assert
      expect(report.passed).toBe(false);
      expect(report.humanScore).toBeLessThan(4);
      expect(report.markers.hasFirstPerson).toBe(false);
      expect(report.markers.avoidsCorpSpeak).toBe(false); // Usa "revolucionarias", "paradigma"
      expect(report.issues.length).toBeGreaterThan(0);
    });

    test('should fail script with only corporate speak', () => {
      // Arrange - Script con lenguaje corporativo
      const script: GeneratedScript = {
        hook: 'Innovacion disruptiva revolucionaria.',
        body: 'Este game-changer optimiza paradigmas y potencia sinergias.',
        opinion: 'Transformacional para la industria.',
        cta: 'Que opinas?',
        duration: 40,
      };

      // Act
      const report = validator.validateHumanElements(script);

      // Assert
      expect(report.markers.avoidsCorpSpeak).toBe(false);
      expect(report.issues).toContain('Usa lenguaje corporativo o frases hechas');
    });

    test('should detect missing first person', () => {
      // Arrange - Script sin primera persona
      const script: GeneratedScript = {
        hook: 'La empresa anuncia novedades.',
        body: 'El producto mejora significativamente.',
        opinion: 'Esto representa un avance.',
        cta: 'Dejanos tu opinion.',
        duration: 45,
      };

      // Act
      const report = validator.validateHumanElements(script);

      // Assert
      expect(report.markers.hasFirstPerson).toBe(false);
      expect(report.issues).toContain(
        "Falta uso de primera persona ('yo creo', 'me parece', 'noto que')"
      );
    });

    test('should detect missing reflective question', () => {
      // Arrange - Script sin pregunta reflexiva (sin ? o sin palabras reflexivas)
      const script: GeneratedScript = {
        hook: 'Algo paso.',
        body: 'El desarrollo continua.',
        opinion: 'Yo creo que esto es significativo.',
        cta: 'Comenta abajo.', // No es pregunta reflexiva
        duration: 45,
      };

      // Act
      const report = validator.validateHumanElements(script);

      // Assert
      expect(report.markers.hasReflectiveQuestion).toBe(false);
    });
  });

  // ===========================================================================
  // TESTS: RECOMENDACIONES Y FEEDBACK
  // ===========================================================================

  test.describe('Recomendaciones y feedback', () => {
    test('should provide improvement recommendations for low scores', () => {
      // Arrange - Script muy robotico
      const script: GeneratedScript = {
        hook: 'Nueva tecnologia.',
        body: 'Mejora el proceso.',
        opinion: 'Es bueno.',
        cta: 'Opina.',
        duration: 30,
      };

      // Act
      const report = validator.validateHumanElements(script);

      // Assert
      expect(report.recommendation).toBeTruthy();
      expect(report.recommendation).toContain('robotico');
      expect(report.issues.length).toBeGreaterThan(0);
    });

    test('should identify strengths in good scripts', () => {
      // Arrange - Script con varios marcadores
      const script: GeneratedScript = {
        hook: 'Acabo de notar algo interesante.',
        body: 'En mi analisis, esto es como cuando vimos X en 2020. Probablemente cambie Y.',
        opinion:
          'Me parece que aun no esta claro si Z, pero considero que vale la pena observar.',
        cta: 'Crees que esto es sostenible? Dejame tu perspectiva.',
        duration: 52,
      };

      // Act
      const report = validator.validateHumanElements(script);

      // Assert
      expect(report.strengths.length).toBeGreaterThan(0);
      expect(report.passed).toBe(true);
    });

    test('should provide borderline recommendation for score 3', () => {
      // Arrange - Script borderline con score ~3
      const script: GeneratedScript = {
        hook: 'Algo interesante.',
        body: 'Yo creo que es importante. Como un avance tecnologico.',
        opinion: 'Esto podria cambiar las cosas.',
        cta: 'Comentalo.', // No es pregunta reflexiva
        duration: 45,
      };

      // Act
      const report = validator.validateHumanElements(script);

      // Assert
      if (report.humanScore === 3) {
        expect(report.recommendation).toContain('borderline');
      }
    });
  });

  // ===========================================================================
  // TESTS: FUNCIONES AUXILIARES
  // ===========================================================================

  test.describe('Funciones auxiliares', () => {
    test('validateScriptCompliance standalone function should work', () => {
      // Arrange
      const script: GeneratedScript = {
        hook: 'Me parece interesante esto.',
        body: 'Probablemente sea significativo, como lo que vimos antes.',
        opinion: 'Yo creo que tiene potencial.',
        cta: 'Crees que funcionara?',
        duration: 50,
      };

      // Act
      const report = validateScriptCompliance(script);

      // Assert
      expect(report).toBeDefined();
      expect(typeof report.humanScore).toBe('number');
      expect(typeof report.passed).toBe('boolean');
    });

    test('quickHumanCheck should detect basic human tone', () => {
      // Arrange - Texto con tono humano basico
      const humanText = 'Yo creo que esto es importante y me parece significativo.';
      const roboticText = 'Esta innovacion disruptiva revoluciona el paradigma.';

      // Act & Assert
      expect(quickHumanCheck(humanText)).toBe(true);
      expect(quickHumanCheck(roboticText)).toBe(false);
    });

    test('countCorpSpeakWords should count corporate words', () => {
      // Arrange
      const corpText = 'Innovador y revolucionario, este game-changer optimiza paradigmas.';

      // Act
      const count = validator.countCorpSpeakWords(corpText);

      // Assert
      expect(count).toBeGreaterThan(0);
    });
  });

  // ===========================================================================
  // TESTS: CASOS EDGE
  // ===========================================================================

  test.describe('Casos edge', () => {
    test('should handle empty script gracefully', () => {
      // Arrange
      const script: GeneratedScript = {
        hook: '',
        body: '',
        opinion: '',
        cta: '',
        duration: 0,
      };

      // Act
      const report = validator.validateHumanElements(script);

      // Assert
      expect(report.passed).toBe(false);
      // Un script vacio obtiene score 1 porque avoidsCorpSpeak es true por defecto
      // (no contiene palabras corporativas porque no tiene ninguna palabra)
      expect(report.humanScore).toBeLessThanOrEqual(1);
    });

    test('should handle script with only whitespace', () => {
      // Arrange
      const script: GeneratedScript = {
        hook: '   ',
        body: '\n\n',
        opinion: '\t\t',
        cta: '  ',
        duration: 0,
      };

      // Act
      const report = validator.validateHumanElements(script);

      // Assert
      expect(report.passed).toBe(false);
    });

    test('should be case insensitive for pattern matching', () => {
      // Arrange - Texto con mayusculas
      const script: GeneratedScript = {
        hook: 'YO CREO que esto es importante.',
        body: 'PROBABLEMENTE veamos cambios.',
        opinion: 'ME PARECE significativo.',
        cta: 'CREES que funcionara?',
        duration: 50,
      };

      // Act
      const report = validator.validateHumanElements(script);

      // Assert
      expect(report.markers.hasFirstPerson).toBe(true);
      expect(report.markers.admitsUncertainty).toBe(true);
    });
  });
});
