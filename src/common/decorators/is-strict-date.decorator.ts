import { Type, type TypeHelpOptions } from 'class-transformer'
import {
  IsDateString,
  ValidateBy,
  isDateString,
  buildMessage,
  type ValidationArguments,
  type ValidationOptions,
} from 'class-validator'

const ZULU_OR_OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/
const ISO_DATE_MESSAGE = '$property must be a valid ISO 8601 date string'

function readProperty(source: object, property: string): unknown {
  const descriptor = Object.getOwnPropertyDescriptor(source, property)
  return descriptor?.value as unknown
}

function keepIncomingDateType(): PropertyDecorator {
  return Type((options?: TypeHelpOptions): DateConstructor | StringConstructor => {
    if (!options) {
      return String
    }
    const value = readProperty(options.object, options.property)
    return value instanceof Date ? Date : String
  })
}

function isStrictIsoDate(value: string): boolean {
  return isDateString(value, { strict: true }) && ZULU_OR_OFFSET.test(value)
}

function passesTimezoneRule(value: unknown): boolean {
  if (typeof value !== 'string' || !isDateString(value, { strict: true })) {
    return true
  }
  return ZULU_OR_OFFSET.test(value)
}

function isZuluOrOffset(validationOptions?: ValidationOptions): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isZuluOrOffset',
      validator: {
        validate: (value: unknown): boolean => passesTimezoneRule(value),
        defaultMessage: buildMessage((eachPrefix) => eachPrefix + ISO_DATE_MESSAGE, validationOptions),
      },
    },
    validationOptions,
  )
}

function assignDate(args: ValidationArguments, value: string): void {
  if (typeof args.object !== 'object' || args.object === null) {
    return
  }
  Reflect.set(args.object, args.property, new Date(value))
}

function toDate(): PropertyDecorator {
  return ValidateBy({
    name: 'toDate',
    validator: {
      validate: (value: unknown, args?: ValidationArguments): boolean => {
        if (!args || typeof value !== 'string' || !isStrictIsoDate(value)) {
          return true
        }
        assignDate(args, value)
        return true
      },
      defaultMessage: () => ISO_DATE_MESSAGE,
    },
  })
}

export function IsStrictDate(validationOptions?: ValidationOptions): PropertyDecorator {
  return (target: object, propertyKey: string | symbol): void => {
    if (typeof propertyKey !== 'string') {
      return
    }
    keepIncomingDateType()(target, propertyKey)
    IsDateString({ strict: true }, validationOptions)(target, propertyKey)
    isZuluOrOffset(validationOptions)(target, propertyKey)
    toDate()(target, propertyKey)
  }
}
