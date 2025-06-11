// ===== 1. frontend/src/hooks/useFormValidation.ts (CORRIGÉ) =====

import { useState, useCallback } from "react";
import { DataTransformer } from "../utils/transformers";

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

interface UseFormValidationOptions {
  schema?: any; // Yup schema
  transform?: boolean;
  entityType?: string;
}

export function useFormValidation(options: UseFormValidationOptions = {}) {
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: {},
    warnings: {},
  });

  const validateField = useCallback(
    async (
      fieldName: string,
      value: any,
      allValues?: any
    ): Promise<boolean> => {
      try {
        if (options.schema) {
          await options.schema.validateAt(fieldName, {
            [fieldName]: value,
            ...allValues,
          });
        }

        // ✅ CORRECTION: Assurer que errors est de type Record<string, string>
        setValidationResult((prev) => {
          const newErrors = { ...prev.errors };
          delete newErrors[fieldName]; // Supprimer l'erreur s'il n'y en a plus

          return {
            ...prev,
            errors: newErrors,
            isValid: Object.keys(newErrors).length === 0,
          };
        });

        return true;
      } catch (error: any) {
        setValidationResult((prev) => ({
          ...prev,
          errors: { ...prev.errors, [fieldName]: error.message },
          isValid: false,
          warnings: prev.warnings,
        }));

        return false;
      }
    },
    [options.schema]
  );

  const validateForm = useCallback(
    async (values: any): Promise<ValidationResult> => {
      try {
        let transformedValues = values;

        // Transformer les données si nécessaire
        if (options.transform && options.entityType) {
          switch (options.entityType) {
            case "seedlot":
              transformedValues =
                DataTransformer.transformSeedLotForAPI(values);
              break;
            case "variety":
              transformedValues =
                DataTransformer.transformVarietyForAPI(values);
              break;
            case "multiplier":
              transformedValues =
                DataTransformer.transformMultiplierForAPI(values);
              break;
          }
        }

        if (options.schema) {
          await options.schema.validate(transformedValues, {
            abortEarly: false,
          });
        }

        const result: ValidationResult = {
          isValid: true,
          errors: {},
          warnings: {},
        };

        setValidationResult(result);
        return result;
      } catch (error: any) {
        const errors: Record<string, string> = {};

        if (error.inner) {
          error.inner.forEach((err: any) => {
            if (err.path) {
              errors[err.path] = err.message;
            }
          });
        } else {
          errors.general = error.message;
        }

        const result: ValidationResult = {
          isValid: false,
          errors,
          warnings: {},
        };

        setValidationResult(result);
        return result;
      }
    },
    [options.schema, options.transform, options.entityType]
  );

  const clearValidation = useCallback(() => {
    setValidationResult({
      isValid: true,
      errors: {},
      warnings: {},
    });
  }, []);

  const setFieldError = useCallback((fieldName: string, message: string) => {
    setValidationResult((prev) => ({
      ...prev,
      errors: { ...prev.errors, [fieldName]: message },
      isValid: false,
      warnings: prev.warnings,
    }));
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setValidationResult((prev) => {
      const newErrors = { ...prev.errors };
      delete newErrors[fieldName];

      return {
        ...prev,
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0,
      };
    });
  }, []);

  return {
    validationResult,
    validateField,
    validateForm,
    clearValidation,
    setFieldError,
    clearFieldError,
    isValid: validationResult.isValid,
    errors: validationResult.errors,
    warnings: validationResult.warnings,
  };
}
