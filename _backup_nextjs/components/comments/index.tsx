'use client'

import { Utterances } from './Utterances'
import { useState } from 'react'
import siteMetadata from '@/data/siteMetadata'
import { useParams } from 'next/navigation'
import { LocaleTypes } from 'app/[locale]/i18n/settings'
import { useTranslation } from 'app/[locale]/i18n/client'

type Props = {
  slug: string
}

export default function Comments({ slug }: Props) {
  const [loadComments, setLoadComments] = useState(false)
  const locale = useParams()?.locale as LocaleTypes
  const { t } = useTranslation(locale, 'home')

  const utterancesConfig = {
    theme: 'github-light',
    darkTheme: 'github-dark',
    repo: process.env.NEXT_PUBLIC_UTTERANCES_REPO || '',
    label: process.env.NEXT_PUBLIC_UTTERANCES_LABEL || 'comment',
  }

  return (
    <>
      {!loadComments && <button onClick={() => setLoadComments(true)}> {t('comment')}</button>}
      {siteMetadata.comments && loadComments && (
        // <CommentsComponent commentsConfig={siteMetadata.comments} slug={slug} />
        <Utterances
          theme={utterancesConfig.theme}
          darkTheme={utterancesConfig.darkTheme}
          repo={utterancesConfig.repo}
          label={utterancesConfig.label}
          issueTerm={slug}
        />
      )}
    </>
  )
}
