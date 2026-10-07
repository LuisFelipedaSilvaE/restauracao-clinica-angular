import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { Layout } from './layout/layout';
import { ModalidadesLista } from './features/modalidades/pages/modalidades-lista/modalidades-lista';
import { ModalidadeForm } from './features/modalidades/pages/modalidade-form/modalidade-form';
import { ModalidadeDetalhada } from './features/modalidades/pages/modalidade-detalhada/modalidade-detalhada';
import { FuncionariosLista } from './features/funcionarios/pages/funcionarios-lista/funcionarios-lista';
import { ErrorPage } from './core/pages/error-page/error-page';
import { FuncionarioDetalhado } from './features/funcionarios/pages/funcionario-detalhado/funcionario-detalhado';
import { FuncionarioForm } from './features/funcionarios/pages/funcionario-form/funcionario-form';
import { AcolhidosLista } from './features/acolhidos/pages/acolhidos-lista/acolhidos-lista';
import { AcolhidoForm } from './features/acolhidos/pages/acolhido-form/acolhido-form';
import { Login } from './features/auth/pages/login/login';
import { Prontuario } from './features/prontuario/prontuario';
import { DadosGerais } from './features/prontuario/sections/dados-gerais/dados-gerais';

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
        path: 'modalidades',
        component: ModalidadesLista,
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'modalidades/criar',
        component: ModalidadeForm,
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'modalidades/:id/editar',
        component: ModalidadeForm,
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'modalidades/:id',
        component: ModalidadeDetalhada,
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'acolhidos',
        component: AcolhidosLista,
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'acolhidos/criar',
        component: AcolhidoForm,
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'acolhidos/:id/editar',
        component: AcolhidoForm,
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'acolhidos/:id/prontuario',
        component: Prontuario,
        canActivate: [roleGuard('ADMIN')],
        children: [
          {
            path: '',
            redirectTo: 'dados-gerais',
            pathMatch: 'full',
          },
          {
            path: 'dados-gerais',
            component: DadosGerais,
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
        canActivate: [roleGuard('ADMIN')],
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
    ],
  },
  {
    path: '**',
    component: ErrorPage,
    data: { status: 404 },
  },
];
