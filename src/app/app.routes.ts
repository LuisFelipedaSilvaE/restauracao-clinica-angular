import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { Layout } from './layout/layout';
import { ModalidadesLista } from './features/modalidades/pages/modalidades-lista/modalidades-lista';
import { ModalidadeCadastro } from './features/modalidades/pages/modalidade-cadastro/modalidade-cadastro';
import { ModalidadeDetalhada } from './features/modalidades/pages/modalidade-detalhada/modalidade-detalhada';
import { FuncionariosLista } from './features/funcionarios/pages/funcionarios-lista/funcionarios-lista';
import { ErrorPage } from './core/pages/error-page/error-page';
import { FuncionarioDetalhado } from './features/funcionarios/pages/funcionario-detalhado/funcionario-detalhado';
import { FuncionarioCadastro } from './features/funcionarios/pages/funcionario-cadastro/funcionario-cadastro';
import { FuncionarioAtualizacao } from './features/funcionarios/pages/funcionario-atualizacao/funcionario-atualizacao';

export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
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
        redirectTo: 'modalidades',
        pathMatch: 'full',
      },
      {
        path: 'modalidades',
        component: ModalidadesLista,
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'modalidades/criar',
        component: ModalidadeCadastro,
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'modalidades/:id/editar',
        component: ModalidadeCadastro,
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'modalidades/:id',
        component: ModalidadeDetalhada,
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'funcionarios',
        component: FuncionariosLista,
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'funcionarios/novo-funcionario',
        component: FuncionarioCadastro,
        canActivate: [roleGuard('ADMIN')],
      },
      {
        path: 'funcionarios/editar-funcionario/:id',
        component: FuncionarioAtualizacao,
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
