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
    component: Login,
  },
  {
    path: 'acesso-negado',
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
        component: Dashboard,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'convenios',
        component: ConveniosLista,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'convenios/criar',
        component: ConvenioForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'convenios/:id/editar',
        component: ConvenioForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'convenios/:id',
        component: ConvenioDetalhado,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'internacoes',
        component: InternacoesLista,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'internacoes/criar',
        component: InternacaoForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'internacoes/:id/editar',
        component: InternacaoForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'internacoes/:id',
        component: InternacaoDetalhada,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'acolhidos',
        component: AcolhidosLista,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'acolhidos/criar',
        component: AcolhidoForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'acolhidos/:id/editar',
        component: AcolhidoForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'responsaveis/criar',
        component: ResponsavelForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'responsaveis/:id/editar',
        component: ResponsavelForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'acolhidos/:id/prontuario',
        redirectTo: 'prontuarios/:id',
      },
      {
        path: 'prontuarios/:acolhidoId',
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
            component: ProntuarioInternacoes,
          },
          {
            path: 'dados-pessoais',
            component: DadosGerais,
          },
          {
            path: 'pagamentos',
            component: ProntuarioPagamentos,
          },
        ],
      },
      {
        path: 'funcionarios',
        component: FuncionariosLista,
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'funcionarios/criar',
        component: FuncionarioForm,
        canActivate: [roleGuard('ADMIN'), cargoExistenteGuard],
      },
      {
        path: 'funcionarios/:id/editar',
        component: FuncionarioForm,
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'funcionarios/:id',
        component: FuncionarioDetalhado,
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'triagens/criar',
        component: TriagemForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'triagens',
        component: TriagensLista,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'triagens/:id',
        component: TriagemDetalhada,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'triagens/:id/editar',
        component: TriagemForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'medicamentos/criar',
        component: MedicamentoForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'medicamentos',
        component: MedicamentosLista,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'medicamentos/:id',
        component: MedicamentoDetalhado,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
      {
        path: 'medicamentos/:id/editar',
        component: MedicamentoForm,
        canActivate: [roleGuard('ADMIN', 'USER')],
      },
    ],
  },
  {
    path: '**',
    component: ErrorPage,
    data: { status: 404 },
  },
];
