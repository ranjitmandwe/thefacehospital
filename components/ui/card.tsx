
import * as React from 'react';
export function Card({className='', children}:{className?:string, children:React.ReactNode}){
  return <div className={['border rounded-2xl bg-white', className].join(' ')}>{children}</div>
}
export function CardHeader({className='', children}:{className?:string, children:React.ReactNode}){
  return <div className={['px-4 py-3 border-b', className].join(' ')}>{children}</div>
}
export function CardTitle({className='', children}:{className?:string, children:React.ReactNode}){
  return <div className={['text-lg font-semibold', className].join(' ')}>{children}</div>
}
export function CardContent({className='', children}:{className?:string, children:React.ReactNode}){
  return <div className={['px-4 py-3', className].join(' ')}>{children}</div>
}
