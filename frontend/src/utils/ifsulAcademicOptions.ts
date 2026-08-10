type SelectOption = {
  value: string
  label: string
}

const option = (value: string): SelectOption => ({ value, label: value })

export const IFSUL_CAMPUS_OPTIONS: SelectOption[] = [
  'Bagé',
  'Camaquã',
  'Charqueadas',
  'Gravataí',
  'Jaguarão',
  'Lajeado',
  'Novo Hamburgo',
  'Passo Fundo',
  'Pelotas',
  'Pelotas - Visconde da Graça',
  'Santana do Livramento',
  'Sapiranga',
  'Sapucaia do Sul',
  'Venâncio Aires',
].map(option)

// Lista geral de cursos superiores do IFSul.
// O curso não depende do campus selecionado neste formulário.
export const IFSUL_HIGHER_EDUCATION_COURSE_OPTIONS: SelectOption[] = [
  'Análise e Desenvolvimento de Sistemas',
  'Ciência da Computação',
  'Design',
  'Engenharia Agronômica',
  'Engenharia Civil',
  'Engenharia de Controle e Automação',
  'Engenharia de Produção',
  'Engenharia Elétrica',
  'Engenharia Mecânica',
  'Engenharia Química',
  'Gestão Ambiental',
  'Gestão de Cooperativas',
  'Licenciatura em Ciências Biológicas',
  'Licenciatura em Computação',
  'Licenciatura em Física',
  'Licenciatura em Pedagogia',
  'Licenciatura em Química',
  'Processos Gerenciais',
  'Saneamento Ambiental',
  'Sistemas para Internet',
  'Tecnologia em Agroindústria',
  'Tecnologia em Alimentos',
  'Viticultura e Enologia',
].map(option)
