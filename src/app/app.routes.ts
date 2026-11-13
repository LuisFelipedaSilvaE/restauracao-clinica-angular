import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { ErrorPage } from './core/pages/error-page/error-page';
import { Dashboard } from './features/dashboard/dashboard';
import { AcolhidoForm } from './features/acolhidos/pages/acolhido-form/acolhido-form';
import { AcolhidosLista } from './features/acolhidos/pages/acolhidos-lista/acolhidos-lista';
import { Login } from './features/auth/pages/login/login';
import { ConvenioDetalhado } from './features/convenios/pages/convenio-detalhado/convenio-detalhado';
import { ConvenioForm } from './features/convenios/pages/convenio-form/convenio-form';
import { ConveniosLista } from './features/convenios/pages/convenios-lista/convenios-lista';
import { cargoExistenteGuard } from './features/funcionarios/guards/cargo-existente-guard';
import { FuncionarioDetalhado } from './features/funcionarios/pages/funcionario-detalhado/funcionario-detalhado';
import { FuncionarioForm } from './features/funcionarios/pages/funcionario-form/funcionario-form';
import { FuncionariosLista } from './features/funcionarios/pages/funcionarios-lista/funcionarios-lista';
import { InternacaoDetalhada } from './features/internacoes/pages/internacao-detalhada/internacao-detalhada';
import { InternacaoForm } from './features/internacoes/pages/internacao-form/internacao-form';
import { InternacoesLista } from './features/internacoes/pages/internacoes-lista/internacoes-lista';
import { MedicamentoDetalhado } from './features/medicamentos/pages/medicamento-detalhado/medicamento-detalhado';
import { MedicamentoForm } from './features/medicamentos/pages/medicamento-form/medicamento-form';
import { MedicamentosLista } from './features/medicamentos/pages/medicamentos-lista/medicamentos-lista';
import { Prontuario } from './features/prontuario/prontuario';
import { DadosGerais } from './features/prontuario/sections/dados-gerais/dados-gerais';
import { Internacoes as ProntuarioInternacoes } from './features/prontuario/sections/internacoes/internacoes';
import { Pagamentos as ProntuarioPagamentos } from './features/prontuario/sections/pagamentos/pagamentos';
import { ResponsavelForm } from './features/responsaveis/pages/responsavel-form/responsavel-form';
import { TriagemDetalhada } from './features/triagens/pages/triagem-detalhada/triagem-detalhada';
import { TriagemForm } from './features/triagens/pages/triagem-form/triagem-form';
import { TriagensLista } from './features/triagens/pages/triagens-lista/triagens-lista';
import { Layout } from './layout/layout';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Entrar',
    component: Login,
  },
  {
    path: 'acesso-negado',
    title: 'Acesso negado',
    component: ErrorPage,
    canActivate: [authGuard],
    data: { status: 403 },
  },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'acolhidos',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        title: 'Visão geral',
        component: Dashboard,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'convenios',
        title: 'Convênios',
        component: ConveniosLista,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'convenios/criar',
        title: 'Cadastrar — Convênios',
        component: ConvenioForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'convenios/:id/editar',
        title: 'Editar — Convênios',
        component: ConvenioForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'convenios/:id',
        title: 'Detalhes — Convênios',
        component: ConvenioDetalhado,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'internacoes',
        title: 'Internações',
        component: InternacoesLista,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'internacoes/criar',
        title: 'Cadastrar — Internações',
        component: InternacaoForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'internacoes/:id/editar',
        title: 'Editar — Internações',
        component: InternacaoForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'internacoes/:id',
        title: 'Detalhes — Internações',
        component: InternacaoDetalhada,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'acolhidos',
        title: 'Acolhidos',
        component: AcolhidosLista,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'acolhidos/criar',
        title: 'Cadastrar — Acolhidos',
        component: AcolhidoForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'acolhidos/:id/editar',
        title: 'Editar — Acolhidos',
        component: AcolhidoForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'responsaveis/criar',
        title: 'Cadastrar — Responsáveis',
        component: ResponsavelForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'responsaveis/:id/editar',
        title: 'Editar — Responsáveis',
        component: ResponsavelForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'acolhidos/:id/prontuario',
        redirectTo: 'prontuarios/:id',
      },
      {
        path: 'prontuarios/:acolhidoId',
        title: 'Prontuário',
        component: Prontuario,
        canActivate: [roleGuard('ADMIN', 'USER')],
        children: [
          {
            path: '',
            redirectTo: 'internacoes',
            pathMatch: 'full',
          },
          {
            path: 'internacoes',
            title: 'Internações',
            component: ProntuarioInternacoes,
          },
          {
            path: 'dados-pessoais',
            title: 'Dados pessoais do prontuário',
            component: DadosGerais,
          },
          {
            path: 'pagamentos',
            title: 'Pagamentos do prontuário',
            component: ProntuarioPagamentos,
          },
        ],
      },
      {
        path: 'funcionarios',
        title: 'Funcionários',
        component: FuncionariosLista,
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'funcionarios/criar',
        title: 'Cadastrar — Funcionários',
        component: FuncionarioForm,
        canActivate: [roleGuard('ADMIN'), cargoExistenteGuard],
      },
      {
        path: 'funcionarios/:id/editar',
        title: 'Editar — Funcionários',
        component: FuncionarioForm,
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'funcionarios/:id',
        title: 'Detalhes — Funcionários',
        component: FuncionarioDetalhado,
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'triagens/criar',
        title: 'Cadastrar — Triagens',
        component: TriagemForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'triagens',
        title: 'Triagens',
        component: TriagensLista,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'triagens/:id',
        title: 'Detalhes — Triagens',
        component: TriagemDetalhada,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'triagens/:id/editar',
        title: 'Editar — Triagens',
        component: TriagemForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'medicamentos/criar',
        title: 'Cadastrar — Medicamentos',
        component: MedicamentoForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'medicamentos',
        title: 'Medicamentos',
        component: MedicamentosLista,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'medicamentos/:id',
        title: 'Detalhes — Medicamentos',
        component: MedicamentoDetalhado,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'medicamentos/:id/editar',
        title: 'Editar — Medicamentos',
        component: MedicamentoForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
    ],
  },
  {
    path: '**',
    title: 'Página não encontrada',
    component: ErrorPage,
    data: { status: 404 },
  },
];
