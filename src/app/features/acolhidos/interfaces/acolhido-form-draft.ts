export interface AcolhidoFormDraft {
  responsavelId: number | null;
  nome: string;
  cpf: string;
  dataNascimento: Date | null;
  email: string;
  telefone: string;
  cep: string;
  endereco: {
    logradouro: string;
    numero: number | null;
    bairro: string;
    cidade: string;
    estado: string | null;
    complemento: string;
  };
}
