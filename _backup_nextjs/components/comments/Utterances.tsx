import { useEffect, useCallback, useState } from 'react'
import { useTheme } from 'next-themes'

export interface UtterancesConfig {
  theme: string
  darkTheme: string
  repo: string
  label: string
  issueTerm: string
}

export const Utterances = ({ theme, darkTheme, repo, label, issueTerm }: UtterancesConfig) => {
  const { theme: nextTheme, resolvedTheme } = useTheme()
  const commentsTheme = nextTheme === 'dark' || resolvedTheme === 'dark' ? darkTheme : theme

  const COMMENTS_ID = 'comments-container'

  const LoadComments = useCallback(() => {
    const script = document.createElement('script')
    script.src = 'https://utteranc.es/client.js'
    script.setAttribute('theme', commentsTheme)
    script.setAttribute('repo', repo)
    script.setAttribute('label', label)
    script.setAttribute('issue-term', issueTerm)
    script.setAttribute('crossorigin', 'anonymous')
    script.async = true

    const comments = document.getElementById(COMMENTS_ID)
    if (comments) {
      comments.innerHTML = '' // Reset contents before appending a new Utterances script
      comments.appendChild(script)
    }

    return () => {
      const comments = document.getElementById(COMMENTS_ID)
      if (comments) comments.innerHTML = ''
    }
  }, [commentsTheme, issueTerm, label, repo])

  // Reload on theme change
  useEffect(() => {
    LoadComments()
  }, [LoadComments])

  // Added `relative` to fix a weird bug with `utterances-frame` position
  return <div className="utterances-frame relative" id={COMMENTS_ID} />
}

export type CommentsConfig = UtterancesConfig

export interface CommentsProps {
  commentsConfig: CommentsConfig
  slug?: string
}

export const Comments = ({ commentsConfig }: CommentsProps) => {
  return <Utterances {...commentsConfig} />
}
