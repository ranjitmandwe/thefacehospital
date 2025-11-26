
import * as React from 'react';
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'default'|'secondary'|'outline', size?: 'sm'|'md'|'lg', className?: string };
export function Button({variant='default', size='md', className='', ...props}: Props){
  const base = 'inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition';
  const variants: Record<string,string> = {
    default: 'bg-black text-white hover:opacity-90',
    secondary: 'bg-gray-100 text-black hover:bg-gray-200',
    outline: 'border border-gray-300 text-black bg-white hover:bg-gray-50'
  };
  const sizes: Record<string,string> = { sm:'h-8 px-3', md:'h-10 px-4', lg:'h-12 px-5 text-base' };
  return <button {...props} className={[base, variants[variant], sizes[size], className].join(' ')} />;
}
export default Button;
