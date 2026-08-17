import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { Label as LabelPrimitive } from 'radix-ui';
import { cn } from '../../lib/utils';

type LabelProps = ComponentPropsWithoutRef<typeof LabelPrimitive.Root>;

const Label = forwardRef<HTMLLabelElement, LabelProps>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn('text-sm font-medium leading-none text-slate-700', className)}
    {...props}
  />
));
Label.displayName = 'Label';

export { Label };
