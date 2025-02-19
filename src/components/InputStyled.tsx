/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */


import { Label } from '@/components/ui/label';
import { Input, InputProps as ShadcnInputProps } from '@/components/ui/input';

export type InputProps = {
  label: string;
  name: string;
  value?: string;
  onChange: Function;
  placeholder?: string
  disabled?: boolean
  type?: ShadcnInputProps["type"]
  pattern?: ShadcnInputProps["pattern"]

}

export function InputStyled(props: InputProps) {
  return (
    <div className='flex flex-col gap-2'>
      <Label>{props.label}</Label>
      <Input
        className='bg-gray-100  placeholder:text-gray-400 placeholder:font-light font-normal'
        name={props.name}
        type={props.type}
        placeholder={props.placeholder}
        value={props.value}
        onChange={(e) => {
          props.onChange((previousState: any) => ({
            ...previousState,
            [props.name]: e.target.value
          }));
        }}
        disabled={props.disabled}
        required
      />
    </div>
  );
}

