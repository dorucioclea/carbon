"use client";

import type { ComponentPropsWithoutRef, ElementRef } from "react";
import { forwardRef } from "react";
import { useFormControlContext } from "./FormControl";

import * as ReactAria from "react-aria-components";

export const FormLabel = forwardRef<
  ElementRef<typeof ReactAria.Label>,
  ComponentPropsWithoutRef<typeof ReactAria.Label>
>((props, ref) => {
  const { className, children, ...rest } = props;

  const field = useFormControlContext();
  const labelProps = field?.getLabelProps(rest, ref) ?? { ref, ...rest };

  return (
    <ReactAria.Label {...labelProps} ref={ref} className={className} {...props}>
      {children}
      {field?.isRequired && <span className="text-destructive"> *</span>}
    </ReactAria.Label>
  );
});

FormLabel.displayName = "FormLabel";
