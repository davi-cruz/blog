export interface Project {
  title: string;
  description: string;
  imgSrc: string;
  href: string;
  tags?: string[];
}

export const projectsData: Record<'pt-br' | 'en' | 'es', Project[]> = {
  'pt-br': [
    {
      title: 'Repositório de Segurança Geral',
      description:
        'Scripts, ferramentas e trechos de código desenvolvidos para auxiliar na implementação, automação e sustentação de soluções de segurança Microsoft e Linux.',
      imgSrc: 'https://i.imgur.com/crOtXdV.jpg',
      href: 'https://github.com/davi-cruz/Security',
      tags: ['Security', 'PowerShell', 'Bash', 'Microsoft Sentinel'],
    },
    {
      title: 'MDC Shield',
      description:
        'Projeto de segurança voltado a facilitar a remediação ágil e automatizada em ambientes multicloud a partir do Microsoft Defender for Cloud.',
      imgSrc: 'https://i.imgur.com/wwsAHil.png',
      href: 'https://github.com/davi-cruz/Security/tree/main/MDC/MDC-Shield',
      tags: ['Defender for Cloud', 'Multicloud', 'Azure', 'AWS', 'GCP'],
    },
  ],
  en: [
    {
      title: 'General Security Repository',
      description:
        'Scripts, tools, and snippets built to support administrators and security engineers implementing, automating, and maintaining Microsoft security solutions.',
      imgSrc: 'https://i.imgur.com/crOtXdV.jpg',
      href: 'https://github.com/davi-cruz/Security',
      tags: ['Security', 'PowerShell', 'Bash', 'Microsoft Sentinel'],
    },
    {
      title: 'MDC Shield',
      description:
        'A security automation project to enable streamlined remediation across multicloud environments utilizing Microsoft Defender for Cloud.',
      imgSrc: 'https://i.imgur.com/wwsAHil.png',
      href: 'https://github.com/davi-cruz/Security/tree/main/MDC/MDC-Shield',
      tags: ['Defender for Cloud', 'Multicloud', 'Azure', 'AWS', 'GCP'],
    },
  ],
  es: [
    {
      title: 'Repositorio General de Seguridad',
      description:
        'Scripts, herramientas y fragmentos de código diseñados para apoyar la implementación, automatización y mantenimiento de soluciones de seguridad Microsoft y Linux.',
      imgSrc: 'https://i.imgur.com/crOtXdV.jpg',
      href: 'https://github.com/davi-cruz/Security',
      tags: ['Seguridad', 'PowerShell', 'Bash', 'Microsoft Sentinel'],
    },
    {
      title: 'MDC Shield',
      description:
        'Proyecto de seguridad para facilitar la remediación automatizada y ágil en entornos multinube desde Microsoft Defender for Cloud.',
      imgSrc: 'https://i.imgur.com/wwsAHil.png',
      href: 'https://github.com/davi-cruz/Security/tree/main/MDC/MDC-Shield',
      tags: ['Defender for Cloud', 'Multicloud', 'Azure', 'AWS', 'GCP'],
    },
  ],
};

