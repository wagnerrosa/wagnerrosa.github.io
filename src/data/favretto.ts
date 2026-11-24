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
  // where the plot is (the Google Maps link the owner shared; offered under the site plan, whose Satélite view replaced the map section)
  place: {
    lat: -29.959053837193643,
    lng: -51.01139598004109,
    link: 'https://maps.app.goo.gl/QaAyHW3WaphqeMiD8',
  },
  contact: {
    name: 'Odolir',
    phone: '+5551999132112',
    display: '(51) 99913-2112',
    wa: 'Olá, Odolir! Vi o anúncio do sítio e gostaria de saber mais.',
  },
};
