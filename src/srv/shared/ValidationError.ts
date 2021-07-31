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

  static async validateArrayAsync<T extends object>(cls: Array<ncm.Type<T>>, value: Array<T>) {
    const errors = await validateArrayAsync(cls, value);
    if (errors.length) throw new ValidationError('Validation failed', errors, value);
    return value;
  }

  static async validateSingleAsync<T extends object>(cls: ncm.Type<T>, value: T) {
    const errors = await validateSingleAsync(cls, value);
    if (errors.length) throw new ValidationError('Validation failed', errors, value);
    return value;
  }
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

async function validateArrayAsync<T extends object>(cls: Array<ncm.Type<T>>, value: Array<T>) {
  const validationErrors = await Promise.all(value.map(x => validateSingleAsync(cls[0], x)));
  validationErrors.forEach((x, i) => x.forEach(y => y.property = `[${i}].${y.property}`));
  return validationErrors.reduce((p, c) => p.concat(c), []);
}

async function validateSingleAsync<T extends object>(cls: ncm.Type<T>, value: T) {
  if (value instanceof cls) return await clv.validate(value);
  return await clv.validate(clt.plainToClass(cls, value));
}
