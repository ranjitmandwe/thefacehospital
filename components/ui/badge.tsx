
import * as React from 'react';
export function Badge({children, className='', variant='default'}:{children:React.ReactNode, className?:string, variant?:'default'|'secondary'}){
  const base = 'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium';
  const styles = variant==='secondary' ? 'bg-gray-100 text-black' : 'bg-black text-white';
  return <span className={[base, styles, className].join(' ')}>{children}</span>;
}
export default Badge;
