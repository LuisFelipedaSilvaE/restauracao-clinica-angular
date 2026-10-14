import { Acolhido } from '../interfaces/acolhido';

const nomes = [
  'André Luiz Moreira',
  'Bruno Henrique Lima',
  'Carlos Eduardo Alves',
  'Daniel Rocha Ferreira',
  'Eduardo Martins Costa',
  'Fábio Santos Oliveira',
  'Gabriel Pereira Souza',
  'Henrique Barros Nunes',
  'Igor Mendes Ribeiro',
  'João Victor Araújo',
  'Lucas Almeida Castro',
  'Marcelo Gomes Freitas',
  'Nicolas Teixeira Ramos',
  'Otávio Mendes Rocha',
  'Paulo Ricardo Dias',
  'Rafael Silva Campos',
  'Samuel Oliveira Braga',
  'Thiago Moura Lopes',
  'Vinícius Cardoso Reis',
  'Wesley Andrade Melo',
  'Yuri Barbosa Santos',
  'Alexandre Coelho Lima',
  'Caio Fernandes Moraes',
  'Diego Monteiro Leal',
  'Felipe Duarte Sales',
];

const datasNascimento = [
  new Date(1987, 2, 14),
  new Date(1991, 7, 22),
  new Date(1983, 10, 5),
  new Date(1979, 4, 18),
  new Date(1994, 1, 9),
  new Date(1989, 8, 27),
  new Date(1996, 5, 11),
  new Date(1985, 0, 30),
  new Date(1990, 3, 16),
  new Date(1981, 6, 3),
  new Date(1998, 9, 19),
  new Date(1977, 11, 8),
  new Date(1993, 4, 25),
  new Date(1986, 7, 12),
  new Date(1982, 1, 28),
  new Date(1995, 6, 7),
  new Date(1988, 2, 21),
  new Date(1980, 9, 2),
  new Date(1992, 5, 15),
  new Date(1984, 10, 24),
  new Date(1997, 3, 6),
  new Date(1978, 8, 17),
  new Date(1999, 0, 13),
  new Date(1983, 6, 26),
  new Date(1990, 11, 1),
];

const cidades = [
  { cidade: 'Belo Horizonte', estado: 'MG' },
  { cidade: 'Contagem', estado: 'MG' },
  { cidade: 'Betim', estado: 'MG' },
  { cidade: 'Nova Lima', estado: 'MG' },
  { cidade: 'Sabará', estado: 'MG' },
];

export const ACOLHIDOS_MOCK: Acolhido[] = nomes.map((nome, indice) => {
  const id = indice + 1;
  const localidade = cidades[indice % cidades.length];
  const emailNome = nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .split(' ')
    .slice(0, 2)
    .join('.');

  return {
    id,
    nome,
    email: `${emailNome}@example.com`,
    cpf: `123.456.789-${String(id).padStart(2, '0')}`,
    cep: `${String(30130 + indice * 10).padStart(5, '0')}-${String(id * 10).padStart(3, '0')}`,
    endereco: {
      logradouro: 'Rua das Acácias',
      numero: 100 + id,
      bairro: `Bairro ${String.fromCharCode(65 + (indice % 5))}`,
      cidade: localidade.cidade,
      estado: localidade.estado,
      complemento: indice % 3 === 0 ? `Casa ${id}` : '',
    },
    telefone: `(31) 98888-${String(1000 + id).slice(-4)}`,
    dataNascimento: datasNascimento[indice],
    ativo: id <= 21,
  };
});
