import { z } from 'zod';

/**
 * Middleware factory to validate request body, query, or params with a Zod schema.
 *
 * Usage:
 *   router.post('/items', validate(createItemSchema), createItemHandler);
 *
 * @param {import('zod').AnyZodObject} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} target - Which part of the request to validate
 */
export const validate =
  (schema, target = 'body') =>
  (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));

      return res.status(422).json({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    // Replace request target with the parsed (and coerced/transformed) data
    req[target] = result.data;
    next();
  };
