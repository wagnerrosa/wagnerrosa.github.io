// Content of /favretto/ (in Portuguese). Edit here; the page renders it. Photos: public/favretto/photos.json (scripts/favretto-photos.mjs).
export const favretto = {
  title: 'Sítio à venda · antiga olaria às margens da BR-290',
  headline: 'Sítio de 25 hectares, antiga olaria, às margens da BR-290',
  summary: 'Sítio de cerca de 25 hectares às margens da BR-290, no Rio Grande do Sul. Galpões da antiga olaria, cabanha para ovelhas, casa de dois andares e açudes.',
  area: '≈ 25 ha',   // to be confirmed by the owner
  facts: [
    ['Área', '≈ 25 hectares'],
    ['Acesso', 'BR-290 (Freeway)'],
    ['Galpões', 'Antiga olaria'],
    ['Casa', '2 andares'],
    ['Cabanha', 'Ovelhas'],
    ['Água', 'Açudes'],
  ] as [string, string][],
  sections: [
    {
      title: 'O sítio',
      intro: 'Sítio com cerca de 25 hectares onde funcionou uma olaria. A área está às margens da BR-290, uma das principais rodovias do estado, com campo aberto, açudes e áreas de mata no entorno.',
    },
    {
      title: 'Construções',
      items: [
        'Galpões da antiga olaria, com estrutura de concreto e grandes vãos livres.',
        'Cabanha para ovelhas.',
        'Casa de dois andares.',
        'Açudes na área da sede.',
      ],
    },
    {
      title: 'Localização',
      intro: 'Às margens da BR-290, com a cidade e a área industrial logo ao fundo.',
    },
  ] as { title: string; intro?: string; items?: string[] }[],
  closing: 'Área ampla e bem localizada, com construções prontas para reaproveitar. Fotos aéreas feitas por drone.',
  // where the plot is (the Google Maps embed the owner shared)
  place: {
    lat: -29.959053837193643,
    lng: -51.01139598004109,
    embed: 'https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d3258.9319120364526!2d-51.01139598004109!3d-29.959053837193643!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1spt-BR!2sbr!4v1795550298873!5m2!1spt-BR!2sbr',
    link: 'https://maps.app.goo.gl/QaAyHW3WaphqeMiD8',
  },
  contact: {
    name: 'Odolir',
    phone: '+5551999132112',
    display: '(51) 99913-2112',
    wa: 'Olá, Odolir! Vi o anúncio do sítio e gostaria de saber mais.',
  },
};
