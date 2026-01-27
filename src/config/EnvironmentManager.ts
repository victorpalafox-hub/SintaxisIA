// ===================================
// ENVIRONMENT MANAGER
// Gestión centralizada de configuración y variables de entorno
// ===================================

import * as fs from 'fs';
import * as path from 'path';

// ===================================
// TIPOS
// ===================================

export type Environment = 'development' | 'staging' | 'production';

export interface VariableDefinition<T = string> {
  required?: boolean;
  default?: T;
  transform?: (value: string) => T;
  validate?: (value: T) => boolean | string;
  description?: string;
}

export interface EnvironmentManagerOptions {
  /** Entorno actual (dev, staging, prod) */
  environment?: Environment;
  /** Ruta base para buscar archivos .env */
  basePath?: string;
  /** Si debe lanzar error cuando faltan variables requeridas */
  throwOnMissing?: boolean;
  /** Si debe cargar automáticamente el archivo .env correspondiente */
  autoLoad?: boolean;
}

interface ParsedEnvFile {
  [key: string]: string;
}

// ===================================
// TRANSFORMADORES INCORPORADOS
// ===================================

export const Transformers = {
  toString: (value: string): string => value,
  toNumber: (value: string): number => {
    const parsed = Number(value);
    if (isNaN(parsed)) {
      throw new Error(`No se puede convertir "${value}" a número`);
    }
    return parsed;
  },
  toInteger: (value: string): number => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) {
      throw new Error(`No se puede convertir "${value}" a entero`);
    }
    return parsed;
  },
  toFloat: (value: string): number => {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) {
      throw new Error(`No se puede convertir "${value}" a decimal`);
    }
    return parsed;
  },
  toBoolean: (value: string): boolean => {
    const normalized = value.toLowerCase().trim();
    if (['true', '1', 'yes', 'on'].includes(normalized)) return true;
    if (['false', '0', 'no', 'off'].includes(normalized)) return false;
    throw new Error(`No se puede convertir "${value}" a booleano`);
  },
  toArray: (separator: string = ',') => (value: string): string[] => {
    return value.split(separator).map(item => item.trim()).filter(Boolean);
  },
  toJson: <T>(value: string): T => {
    try {
      return JSON.parse(value) as T;
    } catch {
      throw new Error(`No se puede parsear JSON: "${value}"`);
    }
  },
};

// ===================================
// VALIDADORES INCORPORADOS
// ===================================

export const Validators = {
  isNotEmpty: (value: string): boolean | string => {
    return value.length > 0 || 'El valor no puede estar vacío';
  },
  isUrl: (value: string): boolean | string => {
    try {
      new URL(value);
      return true;
    } catch {
      return `"${value}" no es una URL válida`;
    }
  },
  isEmail: (value: string): boolean | string => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) || `"${value}" no es un email válido`;
  },
  isPort: (value: number): boolean | string => {
    return (value >= 1 && value <= 65535) || `Puerto ${value} fuera de rango (1-65535)`;
  },
  isInRange: (min: number, max: number) => (value: number): boolean | string => {
    return (value >= min && value <= max) || `Valor ${value} fuera de rango (${min}-${max})`;
  },
  isOneOf: <T>(allowed: T[]) => (value: T): boolean | string => {
    return allowed.includes(value) || `Valor debe ser uno de: ${allowed.join(', ')}`;
  },
  matchesPattern: (pattern: RegExp, message?: string) => (value: string): boolean | string => {
    return pattern.test(value) || message || `Valor no coincide con el patrón esperado`;
  },
};

// ===================================
// CLASE PRINCIPAL
// ===================================

export class EnvironmentManager {
  private variables: Map<string, string> = new Map();
  private definitions: Map<string, VariableDefinition<unknown>> = new Map();
  private environment: Environment;
  private basePath: string;
  private throwOnMissing: boolean;
  private loaded: boolean = false;
  private validationErrors: string[] = [];

  constructor(options: EnvironmentManagerOptions = {}) {
    this.environment = options.environment ?? this.detectEnvironment();
    this.basePath = options.basePath ?? process.cwd();
    this.throwOnMissing = options.throwOnMissing ?? true;

    if (options.autoLoad !== false) {
      this.load();
    }
  }

  // ===================================
  // DETECCIÓN DE ENTORNO
  // ===================================

  private detectEnvironment(): Environment {
    const nodeEnv = process.env.NODE_ENV?.toLowerCase();

    if (nodeEnv === 'production' || nodeEnv === 'prod') {
      return 'production';
    }
    if (nodeEnv === 'staging' || nodeEnv === 'stage') {
      return 'staging';
    }
    return 'development';
  }

  // ===================================
  // CARGA DE ARCHIVOS .ENV
  // ===================================

  /**
   * Carga las variables de entorno desde los archivos .env correspondientes
   * Orden de carga (las últimas sobrescriben las anteriores):
   * 1. .env (base)
   * 2. .env.local (local, no versionado)
   * 3. .env.[environment] (específico del entorno)
   * 4. .env.[environment].local (local específico del entorno)
   */
  public load(): this {
    const envFiles = this.getEnvFilesToLoad();

    for (const envFile of envFiles) {
      const filePath = path.resolve(this.basePath, envFile);
      if (fs.existsSync(filePath)) {
        const parsed = this.parseEnvFile(filePath);
        for (const [key, value] of Object.entries(parsed)) {
          this.variables.set(key, value);
        }
      }
    }

    // También cargar variables del proceso actual
    for (const [key, value] of Object.entries(process.env)) {
      if (value !== undefined) {
        this.variables.set(key, value);
      }
    }

    this.loaded = true;
    return this;
  }

  private getEnvFilesToLoad(): string[] {
    const envShortName = this.getEnvironmentShortName();

    return [
      '.env',
      '.env.local',
      `.env.${envShortName}`,
      `.env.${envShortName}.local`,
    ];
  }

  private getEnvironmentShortName(): string {
    switch (this.environment) {
      case 'development': return 'dev';
      case 'staging': return 'staging';
      case 'production': return 'prod';
    }
  }

  private parseEnvFile(filePath: string): ParsedEnvFile {
    const content = fs.readFileSync(filePath, 'utf-8');
    const result: ParsedEnvFile = {};

    const lines = content.split('\n');

    for (const line of lines) {
      // Ignorar líneas vacías y comentarios
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }

      // Buscar el primer '=' para separar clave y valor
      const equalIndex = trimmedLine.indexOf('=');
      if (equalIndex === -1) {
        continue;
      }

      const key = trimmedLine.substring(0, equalIndex).trim();
      let value = trimmedLine.substring(equalIndex + 1).trim();

      // Remover comillas si existen
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      // Expandir variables de entorno en el valor (${VAR} o $VAR)
      value = this.expandVariables(value, result);

      result[key] = value;
    }

    return result;
  }

  private expandVariables(value: string, context: ParsedEnvFile): string {
    // Reemplazar ${VAR} y $VAR con sus valores
    return value.replace(/\$\{([^}]+)\}|\$([A-Z_][A-Z0-9_]*)/gi, (_, bracedVar, unbracedVar) => {
      const varName = bracedVar || unbracedVar;
      return context[varName] ?? this.variables.get(varName) ?? process.env[varName] ?? '';
    });
  }

  // ===================================
  // DEFINICIÓN DE VARIABLES
  // ===================================

  /**
   * Define una variable con su configuración
   */
  public define<T>(name: string, definition: VariableDefinition<T>): this {
    this.definitions.set(name, definition as VariableDefinition<unknown>);
    return this;
  }

  /**
   * Define múltiples variables a la vez
   */
  public defineMany(definitions: Record<string, VariableDefinition<unknown>>): this {
    for (const [name, definition] of Object.entries(definitions)) {
      this.define(name, definition);
    }
    return this;
  }

  // ===================================
  // OBTENCIÓN DE VALORES
  // ===================================

  /**
   * Obtiene el valor de una variable
   */
  public get<T = string>(name: string): T {
    const rawValue = this.variables.get(name);
    const definition = this.definitions.get(name) as VariableDefinition<T> | undefined;

    // Si no hay valor y hay definición con default, usar default
    if (rawValue === undefined) {
      if (definition?.default !== undefined) {
        return definition.default;
      }
      if (definition?.required !== false && this.throwOnMissing) {
        throw new Error(`Variable de entorno requerida "${name}" no está definida`);
      }
      return undefined as T;
    }

    // Transformar el valor si hay transformador
    let value: T;
    if (definition?.transform) {
      try {
        value = definition.transform(rawValue);
      } catch (error) {
        throw new Error(`Error transformando "${name}": ${(error as Error).message}`);
      }
    } else {
      value = rawValue as unknown as T;
    }

    // Validar el valor si hay validador
    if (definition?.validate) {
      const validationResult = definition.validate(value);
      if (validationResult !== true) {
        const message = typeof validationResult === 'string'
          ? validationResult
          : `Validación fallida para "${name}"`;
        throw new Error(message);
      }
    }

    return value;
  }

  /**
   * Obtiene el valor como string
   */
  public getString(name: string, defaultValue?: string): string {
    const value = this.variables.get(name);
    if (value === undefined) {
      if (defaultValue !== undefined) return defaultValue;
      if (this.throwOnMissing) {
        throw new Error(`Variable "${name}" no definida`);
      }
      return '';
    }
    return value;
  }

  /**
   * Obtiene el valor como número
   */
  public getNumber(name: string, defaultValue?: number): number {
    const value = this.variables.get(name);
    if (value === undefined) {
      if (defaultValue !== undefined) return defaultValue;
      if (this.throwOnMissing) {
        throw new Error(`Variable "${name}" no definida`);
      }
      return 0;
    }
    const parsed = Number(value);
    if (isNaN(parsed)) {
      throw new Error(`Variable "${name}" no es un número válido: "${value}"`);
    }
    return parsed;
  }

  /**
   * Obtiene el valor como booleano
   */
  public getBoolean(name: string, defaultValue?: boolean): boolean {
    const value = this.variables.get(name);
    if (value === undefined) {
      if (defaultValue !== undefined) return defaultValue;
      if (this.throwOnMissing) {
        throw new Error(`Variable "${name}" no definida`);
      }
      return false;
    }
    const normalized = value.toLowerCase().trim();
    return ['true', '1', 'yes', 'on'].includes(normalized);
  }

  /**
   * Obtiene el valor como array
   */
  public getArray(name: string, separator: string = ',', defaultValue: string[] = []): string[] {
    const value = this.variables.get(name);
    if (value === undefined) return defaultValue;
    return value.split(separator).map(item => item.trim()).filter(Boolean);
  }

  // ===================================
  // VALIDACIÓN
  // ===================================

  /**
   * Valida que todas las variables requeridas estén definidas
   */
  public validate(): { valid: boolean; errors: string[] } {
    this.validationErrors = [];

    for (const [name, definition] of this.definitions.entries()) {
      const value = this.variables.get(name);

      // Verificar si es requerida
      if (definition.required !== false && value === undefined && definition.default === undefined) {
        this.validationErrors.push(`Variable requerida "${name}" no está definida`);
        continue;
      }

      // Si hay valor, validar
      if (value !== undefined && definition.validate) {
        try {
          const transformedValue = definition.transform
            ? definition.transform(value)
            : value;
          const result = definition.validate(transformedValue);
          if (result !== true) {
            const message = typeof result === 'string' ? result : `Validación fallida para "${name}"`;
            this.validationErrors.push(message);
          }
        } catch (error) {
          this.validationErrors.push(`Error validando "${name}": ${(error as Error).message}`);
        }
      }
    }

    return {
      valid: this.validationErrors.length === 0,
      errors: this.validationErrors,
    };
  }

  /**
   * Valida y lanza error si hay problemas
   */
  public validateOrThrow(): this {
    const { valid, errors } = this.validate();
    if (!valid) {
      throw new Error(`Errores de configuración:\n${errors.map(e => `  - ${e}`).join('\n')}`);
    }
    return this;
  }

  // ===================================
  // UTILIDADES
  // ===================================

  /**
   * Verifica si una variable existe
   */
  public has(name: string): boolean {
    return this.variables.has(name);
  }

  /**
   * Obtiene el entorno actual
   */
  public getEnvironment(): Environment {
    return this.environment;
  }

  /**
   * Verifica si está en desarrollo
   */
  public isDevelopment(): boolean {
    return this.environment === 'development';
  }

  /**
   * Verifica si está en staging
   */
  public isStaging(): boolean {
    return this.environment === 'staging';
  }

  /**
   * Verifica si está en producción
   */
  public isProduction(): boolean {
    return this.environment === 'production';
  }

  /**
   * Establece manualmente una variable
   */
  public set(name: string, value: string): this {
    this.variables.set(name, value);
    return this;
  }

  /**
   * Obtiene todas las variables cargadas
   */
  public getAll(): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of this.variables.entries()) {
      result[key] = value;
    }
    return result;
  }

  /**
   * Obtiene las variables que coinciden con un prefijo
   */
  public getByPrefix(prefix: string): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of this.variables.entries()) {
      if (key.startsWith(prefix)) {
        result[key] = value;
      }
    }
    return result;
  }

  /**
   * Imprime un resumen de la configuración (ocultando valores sensibles)
   */
  public printSummary(sensitiveKeys: string[] = ['KEY', 'SECRET', 'PASSWORD', 'TOKEN']): void {
    console.log(`\n=== Configuración de Entorno ===`);
    console.log(`Entorno: ${this.environment}`);
    console.log(`Variables cargadas: ${this.variables.size}`);
    console.log(`\nVariables:`);

    for (const [key, value] of this.variables.entries()) {
      const isSensitive = sensitiveKeys.some(s => key.toUpperCase().includes(s));
      const displayValue = isSensitive ? '********' : value;
      console.log(`  ${key}: ${displayValue}`);
    }
    console.log(`================================\n`);
  }
}

// ===================================
// INSTANCIA SINGLETON
// ===================================

let defaultInstance: EnvironmentManager | null = null;

/**
 * Obtiene la instancia singleton del EnvironmentManager
 */
export function getEnvironmentManager(options?: EnvironmentManagerOptions): EnvironmentManager {
  if (!defaultInstance) {
    defaultInstance = new EnvironmentManager(options);
  }
  return defaultInstance;
}

/**
 * Resetea la instancia singleton (útil para testing)
 */
export function resetEnvironmentManager(): void {
  defaultInstance = null;
}

export default EnvironmentManager;
