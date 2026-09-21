import React from 'react'
import {
  SuccessIcon,
  WarningIcon,
  ErrorIcon,
  InfoIcon,
  TipIcon,
  NoticeIcon,
} from './social-icons/icons'

const Alert = ({ kind, title, children, size = 5 }) => {
  const alertStyles = {
    success: 'bg-green-100 border-green-500 text-green-900',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-900',
    error: 'bg-red-100 border-red-500 text-red-900',
    info: 'bg-blue-100 border-blue-500 text-blue-900',
    tip: 'bg-blue-100 border-blue-500 text-blue-900',
    notice: 'bg-gray-100 border-gray-500 text-gray-900',
  }

  const alertIcons = {
    success: SuccessIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
    tip: TipIcon,
    notice: NoticeIcon,
  }

  const AlertIcon = alertIcons[kind]

  return (
    <div
      className={`${alertStyles[kind]} not-prose mt-3 rounded border-l-4 p-4 shadow-md`}
      role="alert"
    >
      <div className="flex py-1">
        <AlertIcon className={`mr-4 h-${size} w-${size} text-teal-500" fill-current`} />
        <p className="font-bold">{title}</p>
      </div>
      <div>{children}</div>
    </div>
  )
}

export default Alert
