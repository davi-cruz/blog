type Project = {
  title: string
  description: string
  imgSrc: string
  href: string
}

type ProjectsData = {
  [locale: string]: Project[]
}

const projectsData: ProjectsData = {
  'en-US': [
    {
      title: 'General Security Repository',
      description: `Here you'll find several scripts and snippets you may find helpful for supporting you while
        implementing and maintaining security solutions, mostly Microsoft's.`,
      imgSrc: 'https://i.imgur.com/crOtXdV.jpg',
      href: 'https://github.com/davi-cruz/Security',
    },
    {
      title: 'MDC Shield',
      description: `A Security project to support easy remediation for Multicloud Environment from Microsoft Defender for Cloud.`,
      imgSrc: 'https://i.imgur.com/wwsAHil.png',
      href: 'https://github.com/davi-cruz/Security/tree/main/MDC/MDC-Shield',
    },
  ],

  'pt-BR': [
    {
      title: 'Repositório de Segurança Geral',
      description: `Aqui você encontrará vários scripts e trechos que podem ser úteis para ajudá-lo a implementar e manter soluções de segurança, principalmente da Microsoft.`,
      imgSrc: 'https://i.imgur.com/crOtXdV.jpg',
      href: 'https://github.com/davi-cruz/Security',
    },
    {
      title: 'MDC Shield',
      description: `Um projeto de segurança para suportar a remediação fácil para Ambiente Multicloud a partir do Microsoft Defender for Cloud.`,
      imgSrc: 'https://i.imgur.com/wwsAHil.png',
      href: 'https://github.com/davi-cruz/Security/tree/main/MDC/MDC-Shield',
    },
  ],
}

export default projectsData
