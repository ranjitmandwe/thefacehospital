
import * as React from 'react';
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>){
  return <input {...props} className={"w-full h-10 rounded-xl border px-3 text-sm " + (props.className||"")} />;
}
export default Input;
