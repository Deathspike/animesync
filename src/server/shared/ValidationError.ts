import * as clt from 'class-transformer';
import * as clv from 'class-validator';
import * as ncm from '@nestjs/common';

export class ValidationError<T> extends Error {
  private readonly validationErrors: Array<clv.ValidationError>;
  private readonly value: Array<T> | T;

  private constructor(message: string, validationErrors: Array<clv.ValidationError>, value: Array<T> | T) {
    super(message);
    this.validationErrors = validationErrors;
    this.value = value;
  }

  get data() {
    const errors = publishArray(this.validationErrors);
    const value = this.value;
    return {errors, value};
  }

  static async validateArrayAsync<T extends object>(cls: ncm.Type<T>, unsafeValues: Array<T>) {
    const values = unsafeValues.map(x => ensureType(cls, x));
    const errors = await validateArrayAsync(values);
    if (errors.length) throw new ValidationError('Validation failed', errors, values);
    return values;
  }

  static async validateSingleAsync<T extends object>(cls: ncm.Type<T>, unsafeValue: T) {
    const value = ensureType(cls, unsafeValue);
    const errors = await clv.validate(value);
    if (errors.length) throw new ValidationError('Validation failed', errors, value);
    return value;
  }
}

function ensureType<T extends object>(cls: ncm.Type<T>, value: T) {
  return value instanceof cls ? value : clt.plainToClass(cls, value);
}

function publishArray(errors: Array<clv.ValidationError>, previousProperty?: string) {
  const result: Array<{constraints: Record<string, string>, property: string}> = [];
  errors.forEach(error => publishSingle(error, result, previousProperty));
  return result;
}

function publishSingle(error: clv.ValidationError, result: Array<{constraints: Record<string, string>, property: string}>, previousProperty?: string) {
  const property = previousProperty ? `${previousProperty}.${error.property}` : error.property;
  if (error.constraints) result.push(({property, constraints: error.constraints}))
  if (error.children) result.push(...publishArray(error.children, property));
}

async function validateArrayAsync<T extends object>(values: Array<T>) {
  const validationErrors = await Promise.all(values.map(x => clv.validate(x)));
  validationErrors.forEach((x, i) => x.forEach(y => y.property = `[${i}].${y.property}`));
  return validationErrors.flatMap(x => x);
}
