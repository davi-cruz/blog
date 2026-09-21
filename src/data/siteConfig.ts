import type { Lang } from '../i18n/ui';

export interface HeaderConfig {
  greeting: string;
  name: string;
  title: string;
  description: string;
  topicsLabel: string;
}

export interface SiteConfig {
  siteUrl: string;
  author: string;
  gtmId?: string;
  header: Record<Lang, HeaderConfig>;
}

export const siteConfig: SiteConfig = {
  siteUrl: 'https://davicruz.com',
  author: 'Davi Cruz',
  gtmId: process.env.PUBLIC_GTM_ID || 'GTM-XXXXXXX',
  header: {
    'pt-br': {
      greeting: 'Olá, sou',
      name: 'Davi Cruz',
      title: 'Davi Cruz | Cibersegurança & Infraestrutura',
      description:
        'Bem-vindo ao meu blog técnico. Aqui compartilho reflexões e pesquisas sobre Operações de Segurança, Threat Intelligence e Ciência de Dados — além de alguns write-ups de máquinas de CTF quando o tempo permite.',
      topicsLabel: 'Tópicos:',
    },
    en: {
      greeting: "Hi, I'm",
      name: 'Davi Cruz',
      title: 'Davi Cruz | Cybersecurity & Infrastructure',
      description:
        'Welcome to my technical blog. Here I share my thoughts and research on Security Operations, Threat Intelligence, and Data Science — plus the occasional CTF machine write-up whenever time permits.',
      topicsLabel: 'Topics:',
    },
    es: {
      greeting: 'Hola, soy',
      name: 'Davi Cruz',
      title: 'Davi Cruz | Ciberseguridad e Infraestructura',
      description:
        'Bienvenido a mi blog técnico. Aquí comparto reflexiones e investigaciones sobre Operaciones de Seguridad, Inteligencia de Amenazas y Ciencia de Datos — y, cuando el tiempo lo permite, algunos write-ups de máquinas CTF.',
      topicsLabel: 'Temas:',
    },
  },
};

