import React from 'react'
import { SuccessIcon, WarningIcon, ErrorIcon, InfoIcon, TipIcon } from './social-icons/icons'

const Alert = ({ kind, title, children, size = 5 }) => {
  const alertStyles = {
    success:
      'bg-green-100 border-green-500 text-green-900 rounded-b border-t-4 px-4 py-3 shadow-md',
    warning:
      'bg-yellow-100 border-yellow-500 text-yellow-900 rounded-b border-t-4 px-4 py-3 shadow-md',
    error: 'bg-red-100 border-red-500 text-red-900 rounded-b border-t-4 px-4 py-3 shadow-md',
    info: 'bg-blue-100 border-blue-500 text-blue-900 rounded-b border-t-4 px-4 py-3 shadow-md',
    tip: 'bg-blue-100 border-blue-500 text-blue-900 rounded-b border-t-4 px-4 py-3 shadow-md',
  }

  const alertIcons = {
    success: SuccessIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
    tip: TipIcon,
  }

  const AlertIcon = alertIcons[kind]
  console.log(children)

  return (
    <div className={alertStyles[kind]} role="alert">
      <div className="not-prose flex">
        <div className="py-1">
          <AlertIcon className={`mr-4 h-${size} w-${size} text-teal-500" fill-current`} />
        </div>
        <div>
          <p className="font-bold">{title}</p>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Alert
