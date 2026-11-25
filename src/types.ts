export type Profile = 'morador' | 'sindico' | 'portaria';

export interface Resident {
  id: string;
  nome: string;
  sobrenome: string;
  nascimento: string;
  cpf: string;
  bloco: string;
  apartamento: string;
  telefone: string;
  vaga: string;
  avatarSeed: string;
  unidadeId: string;
}

export interface Unidade {
  id: string;
  bloco: string;
  apartamento: string;
}

export interface Vehicle {
  id: string;
  unidadeId: string;
  modelo: string;
  cor: string;
  placa: string;
  tipo: 'Carro' | 'Moto';
  vaga: string;
}

export interface Colaborador {
  id: string;
  nome: string;
  cargo: string;
  turno: string;
  cpf: string;
  telefone: string;
}

export interface Visitor {
  id: string;
  nome: string;
  documento: string;
  dataPrevista: string;
  tipo: 'Visita social' | 'Delivery' | 'Serviço';
  autorizadoPor: string; // resident id or 'sindico'
  unidadeId: string;
  status: 'Autorizado' | 'Revogado';
  entradaEm?: string;
  saidaEm?: string;
  avulso?: boolean;
}

export interface Package_ {
  id: string;
  unidadeId: string;
  residentId: string;
  descricao: string;
  transportadora: string;
  observacao: string;
  chegadaEm: string;
  status: 'Aguardando retirada' | 'Retirado';
  retiradoPor?: string;
  retiradoEm?: string;
}

export interface FinanceEntry {
  id: string;
  unidadeId: string;
  residentId: string;
  tipo: 'Taxa Condominial' | 'Multa' | 'Conta Extra';
  descricao: string;
  valor: number;
  vencimento: string;
  status: 'Em aberto' | 'Pago' | 'Vencido';
  codigo: string;
  criadoEm: string;
  rateio?: RateioPart[];
}

export interface RateioPart {
  nome: string;
  valor: number;
  pago: boolean;
}

export interface Booking {
  id: string;
  espacoId: string;
  unidadeId: string;
  residentId: string;
  data: string;
  horario: string;
  criadoEm: string;
}

export interface Espaco {
  id: string;
  nome: string;
  descricao: string;
  nota: number;
  comodidades: string[];
  gradiente: string;
  capacidade: number;
}

export interface Occurrence {
  id: string;
  unidadeId: string;
  residentId: string;
  categoria: 'Barulho' | 'Manutenção' | 'Segurança' | 'Sugestão';
  titulo: string;
  descricao: string;
  criadoEm: string;
  status: 'Aberta' | 'Em andamento' | 'Resolvida';
  resposta?: string;
}

export interface ScheduleEvent {
  id: string;
  diaSemana: number; // 0-6
  titulo: string;
  horario: string;
  local: string;
  tipo: 'Rotina' | 'Evento' | 'Manutenção';
}

export interface Notification {
  id: string;
  targetProfile: Profile | 'all';
  targetUnidadeId?: string;
  titulo: string;
  corpo: string;
  criadoEm: string;
  lida: boolean;
}

export interface ChatMessage {
  id: string;
  de: Profile;
  autorNome: string;
  corpo: string;
  criadoEm: string;
}

export interface AppState {
  perfilAtivo: Profile;
  moradorAtualId: string;
  tema: 'light' | 'dark';
  ocultarValores: boolean;
  residents: Resident[];
  vehicles: Vehicle[];
  colaboradores: Colaborador[];
  visitors: Visitor[];
  packages: Package_[];
  finance: FinanceEntry[];
  bookings: Booking[];
  occurrences: Occurrence[];
  schedule: ScheduleEvent[];
  notifications: Notification[];
  chatSindicoPortaria: ChatMessage[];
  chatSindicoMorador: ChatMessage[];
}
