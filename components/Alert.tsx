import React from 'react'
import { SuccessIcon, WarningIcon, ErrorIcon, InfoIcon } from './social-icons/icons'

const Alert = ({ kind, title, children }) => {
  const alertStyles = {
    success:
      'bg-green-100 border-green-500 text-green-900 rounded-b border-t-4 px-4 py-3 shadow-md',
    warning:
      'bg-yellow-100 border-yellow-500 text-yellow-900 rounded-b border-t-4 px-4 py-3 shadow-md',
    error: 'bg-red-100 border-red-500 text-red-900 rounded-b border-t-4 px-4 py-3 shadow-md',
    info: 'bg-blue-100 border-blue-500 text-blue-900 rounded-b border-t-4 px-4 py-3 shadow-md',
  }

  const alertIcons = {
    success: SuccessIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
  }

  const AlertIcon = alertIcons[kind]

  return (
    <div className={alertStyles[kind]}>
      <div className="flex">
        <div className="py-1">
          <AlertIcon className="mr-4 h-6 w-6 fill-current text-teal-500" />
        </div>
        <div>
          <p className="font-bold">{title}</p>
          <p className="text-sm">{children}</p>
        </div>
      </div>
    </div>
  )
}

export default Alert
