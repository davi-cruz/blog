import React from 'react'
import { SuccessIcon, WarningIcon, ErrorIcon, InfoIcon } from './social-icons/icons'

const Alert = ({ type, title, message }) => {
  const alertStyles = {
    success: 'bg-green-100 border-green-500 text-green-900',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-900',
    error: 'bg-red-100 border-red-500 text-red-900',
    info: 'bg-blue-100 border-blue-500 text-blue-900',
  }

  const alertIcons = {
    success: SuccessIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
  }

  return (
    <div className={`${alertStyles[type]} rounded-b border-t-4 px-4 py-3 shadow-md`} role="alert">
      <div className="flex">
        <div className="py-1">{alertIcons[type]}</div>
        <div>
          <p className="font-bold">{title}</p>
          <p className="text-sm">{message}</p>
        </div>
      </div>
    </div>
  )
}

export default Alert
