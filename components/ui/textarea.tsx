
import * as React from 'react';
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>){
  return <textarea {...props} className={"w-full rounded-xl border px-3 py-2 text-sm min-h-[90px] " + (props.className||"")} />;
}
export default Textarea;
