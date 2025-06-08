// frontend/src/components/forms/FormField.tsx
import {
  UseFormRegister,
  FieldError,
  Path,
  FieldValues,
} from "react-hook-form";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BaseFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  error?: FieldError;
  required?: boolean;
  description?: string;
  className?: string;
}

interface InputFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  type: "text" | "email" | "password" | "number" | "tel" | "url";
  register: UseFormRegister<T>;
  placeholder?: string;
  disabled?: boolean;
}

interface TextareaFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  type: "textarea";
  register: UseFormRegister<T>;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}

interface SelectFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  type: "select";
  options: { value: string; label: string }[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

type FormFieldProps<T extends FieldValues> =
  | InputFieldProps<T>
  | TextareaFieldProps<T>
  | SelectFieldProps<T>;

export function FormField<T extends FieldValues>(props: FormFieldProps<T>) {
  const { name, label, error, required, description, className } = props;

  const renderField = () => {
    switch (props.type) {
      case "textarea":
        return (
          <Textarea
            {...props.register(name)}
            placeholder={props.placeholder}
            disabled={props.disabled}
            rows={props.rows}
            className={error ? "border-red-500" : ""}
          />
        );

      case "select":
        return (
          <Select
            value={props.value}
            onValueChange={props.onChange}
            disabled={props.disabled}
          >
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={props.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {props.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      default:
        return (
          <Input
            type={props.type}
            {...props.register(name)}
            placeholder={props.placeholder}
            disabled={props.disabled}
            className={error ? "border-red-500" : ""}
          />
        );
    }
  };

  return (
    <div className={className}>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
      {description && (
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      )}
      {error && <p className="text-sm text-red-500 mt-1">{error.message}</p>}
    </div>
  );
}
