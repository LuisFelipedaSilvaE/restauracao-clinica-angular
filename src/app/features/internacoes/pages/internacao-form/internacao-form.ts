import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LucideBedSingle, LucidePencil, LucideUserPlus } from '@lucide/angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TextareaModule } from 'primeng/textarea';
import { Card } from '../../../../shared/components/card/card';
import { FormField } from '../../../../shared/components/form-field/form-field';
import { FormHeader } from '../../../../shared/components/form-header/form-header';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { TelefonePipe } from '../../../../shared/pipes/telefone-pipe';
import { AcolhidosService } from '../../../acolhidos/services/acolhidos-service';
import { TriagensService } from '../../../triagens/services/triagens-service';
import { Internacao } from '../../interfaces/internacao';
import { InternacoesMockService } from '../../services/internacoes-mock-service';

type ModoForm = 'registro' | 'atualizacao';

const dataValida: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (control.value === null) return null;
  return control.value instanceof Date && Number.isFinite(control.value.getTime())
    ? null
    : { dataInvalida: true };
};

const datasInternacaoCoerentes: ValidatorFn = (form: AbstractControl): ValidationErrors | null => {
  const admissao = form.get('dataAdmissao')?.value;
  const previsaoAlta = form.get('dataPrevisaoAlta')?.value;

  return admissao instanceof Date && previsaoAlta instanceof Date && previsaoAlta < admissao
    ? { previsaoAntesAdmissao: true }
    : null;
};

@Component({
  selector: 'app-internacao-form',
  host: {
    class: 'flex min-w-0 flex-col gap-6',
  },
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    DatePickerModule,
    DividerModule,
    InputTextModule,
    MessageModule,
    SelectModule,
    SkeletonModule,
    TextareaModule,
    Card,
    FormField,
    FormHeader,
    LucideUserPlus,
    TelefonePipe,
  ],
  templateUrl: './internacao-form.html',
  styleUrl: './internacao-form.css',
})
export class InternacaoForm implements OnInit {
  readonly id = input<string>();
  readonly acolhidoId = input<string>();
  readonly triagemId = input<string>();

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly acolhidosService = inject(AcolhidosService);
  private readonly triagensService = inject(TriagensService);
  private readonly internacoesService = inject(InternacoesMockService);

  protected readonly acolhidos = this.acolhidosService.acolhidos;
  protected readonly triagens = this.triagensService.triagens;
  protected readonly hoje = new Date();
  protected readonly etapasTratamento = [
    'Em tratamento',
    'Próximo da alta',
    'Alta vencida',
    'Alta concedida',
    'Desligado',
  ];
  protected readonly formSubmitted = signal(false);
  protected readonly salvando = signal(false);
  protected readonly carregando = signal(true);
  protected readonly registroAtual = signal<Internacao | null>(null);
  private readonly triagemSelecionadaId = signal<number | null>(null);
  private readonly acolhidoSelecionadoId = signal<number | null>(null);

  private readonly previsaoAltaInicial = (() => {
    const data = new Date();
    data.setMonth(data.getMonth() + 3);
    return data;
  })();

  protected readonly internacaoForm = this.fb.group(
    {
      triagemId: this.fb.control<number | null>(null, [Validators.required]),
      idAcolhido: this.fb.control<number | null>(null, [Validators.required]),
      idConvenio: this.fb.control<number | null>(null, [Validators.required]),
      dataAdmissao: this.fb.control<Date | null>(new Date(), [
        Validators.required,
        dataValida,
        (control) => {
          if (!(control.value instanceof Date)) return null;
          const admissao = new Date(control.value);
          const hoje = new Date();
          admissao.setHours(0, 0, 0, 0);
          hoje.setHours(0, 0, 0, 0);
          return admissao > hoje ? { admissaoFutura: true } : null;
        },
      ]),
      dataPrevisaoAlta: this.fb.control<Date | null>(this.previsaoAltaInicial, [
        Validators.required,
        dataValida,
      ]),
      etapaTratamento: this.fb.nonNullable.control('Em tratamento', [Validators.required]),
      observacaoIsencao: this.fb.nonNullable.control('', [Validators.maxLength(500)]),
    },
    { validators: datasInternacaoCoerentes },
  );

  protected readonly modo = computed<ModoForm>(() => (this.id() ? 'atualizacao' : 'registro'));
  protected readonly headerInfo = computed<InfoCardContent>(() => {
    const atualizacao = this.modo() === 'atualizacao';

    return {
      value: atualizacao ? 'Editar internação' : 'Nova internação',
      label: atualizacao
        ? 'Atualize os vínculos e os dados deste episódio de internação.'
        : 'Vincule a triagem ao acolhido e registre os dados da nova internação.',
      icon: atualizacao ? LucidePencil : LucideBedSingle,
      color: '#be222d',
    };
  });
  protected readonly actionBtnLabel = computed(() =>
    this.modo() === 'registro' ? 'Registrar internação' : 'Salvar alterações',
  );
  protected readonly triagensDisponiveis = computed(() => {
    const idAtual = this.registroAtual()?.id;
    const triagemAtual = this.registroAtual()?.idTriagem;

    return this.triagens().filter(
      (triagem) =>
        triagem.status === 'CONCLUIDA' &&
        (triagem.id === triagemAtual || !this.internacoesService.triagemEmUso(triagem.id, idAtual)),
    );
  });
  protected readonly triagemSelecionada = computed(() =>
    this.triagens().find((triagem) => triagem.id === this.triagemSelecionadaId()),
  );
  protected readonly acolhidosDisponiveis = computed(() => {
    const acolhidoAtualId = this.registroAtual()?.idAcolhido;
    return this.acolhidos().filter((acolhido) => acolhido.ativo || acolhido.id === acolhidoAtualId);
  });
  protected readonly acolhidoSelecionado = computed(() =>
    this.acolhidos().find((acolhido) => acolhido.id === this.acolhidoSelecionadoId()),
  );
  protected readonly dadosDivergentes = computed(() => {
    const triagem = this.triagemSelecionada();
    const acolhido = this.acolhidoSelecionado();
    if (!triagem || !acolhido) return false;

    const mesmoNome =
      this.normalizarTexto(triagem.nomePossivelAcolhido) === this.normalizarTexto(acolhido.nome);
    const mesmoTelefone =
      triagem.telefone.replace(/\D/g, '') === acolhido.telefone.replace(/\D/g, '');
    return !mesmoNome && !mesmoTelefone;
  });

  private readonly labels: Record<string, string> = {
    triagemId: 'Triagem',
    idAcolhido: 'Acolhido',
    idConvenio: 'Convênio',
    dataAdmissao: 'Data de admissão',
    dataPrevisaoAlta: 'Previsão de alta',
    etapaTratamento: 'Etapa de tratamento',
    observacaoIsencao: 'Observação sobre isenção',
  };

  ngOnInit(): void {
    forkJoin({
      triagens: this.triagensService.getAllTriagens(),
      acolhidos: this.acolhidosService.getAllAcolhidos(),
    }).subscribe({
      next: () => this.inicializarFormulario(),
      error: () => {
        this.carregando.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Não foi possível carregar os dados',
          detail: 'Tente novamente em alguns instantes.',
          life: 4000,
        });
      },
    });
  }

  protected onTriagemChange(idTriagem: number | null): void {
    this.triagemSelecionadaId.set(idTriagem);
    const triagem = this.triagens().find((item) => item.id === idTriagem);
    this.internacaoForm.patchValue({ idConvenio: triagem?.convenio.id ?? null });

    if (!triagem || this.acolhidoSelecionadoId() !== null) return;

    const nomeTriagem = this.normalizarTexto(triagem.nomePossivelAcolhido);
    const telefoneTriagem = triagem.telefone.replace(/\D/g, '');
    const sugestao = this.acolhidosDisponiveis().find(
      (acolhido) =>
        this.normalizarTexto(acolhido.nome) === nomeTriagem ||
        acolhido.telefone.replace(/\D/g, '') === telefoneTriagem,
    );

    if (sugestao) {
      this.internacaoForm.patchValue({ idAcolhido: sugestao.id });
      this.acolhidoSelecionadoId.set(sugestao.id);
    }
  }

  protected onAcolhidoChange(idAcolhido: number | null): void {
    this.acolhidoSelecionadoId.set(idAcolhido);
  }

  protected cadastrarNovoAcolhido(): void {
    const triagemId = this.internacaoForm.controls.triagemId.value;
    if (triagemId === null) {
      this.internacaoForm.controls.triagemId.markAsTouched();
      this.messageService.add({
        severity: 'warn',
        summary: 'Selecione uma triagem',
        detail: 'A triagem será usada para preencher os dados iniciais do novo acolhido.',
        life: 4000,
      });
      return;
    }

    this.internacoesService.salvarRascunho(this.internacaoForm.getRawValue());
    this.router.navigate(['/acolhidos/criar'], {
      queryParams: { triagemId, returnUrl: '/internacoes/criar' },
    });
  }

  protected isInvalid(campo: string): boolean {
    const control = this.internacaoForm.get(campo);
    return (
      !!control &&
      (control.touched || this.formSubmitted()) &&
      (control.invalid ||
        (campo === 'dataPrevisaoAlta' && this.internacaoForm.hasError('previsaoAntesAdmissao')))
    );
  }

  protected getErrorMessage(campo: string): string | null {
    if (!this.isInvalid(campo)) return null;
    const errors = this.internacaoForm.get(campo)?.errors;

    if (errors?.['required']) return `Preencha o campo ${this.labels[campo]}.`;
    if (errors?.['dataInvalida']) return 'Informe uma data válida.';
    if (errors?.['admissaoFutura']) return 'A data de admissão não pode estar no futuro.';
    if (errors?.['maxlength']) return 'A observação deve ter no máximo 500 caracteres.';
    if (campo === 'dataPrevisaoAlta' && this.internacaoForm.hasError('previsaoAntesAdmissao')) {
      return 'A previsão de alta não pode ser anterior à admissão.';
    }
    return `Verifique o campo ${this.labels[campo]}.`;
  }

  protected onSubmit(): void {
    if (this.salvando()) return;
    this.formSubmitted.set(true);
    this.internacaoForm.markAllAsTouched();
    if (this.internacaoForm.invalid) return;

    const valor = this.internacaoForm.getRawValue();
    const triagem = this.triagens().find((item) => item.id === valor.triagemId);
    const acolhido = this.acolhidos().find((item) => item.id === valor.idAcolhido);
    const idAtual = this.id() ? Number(this.id()) : undefined;
    const etapaTratamento = this.modo() === 'registro' ? 'Em tratamento' : valor.etapaTratamento;

    if (!triagem || triagem.status !== 'CONCLUIDA') {
      this.avisoFormulario('Selecione uma triagem concluída e disponível.');
      return;
    }
    if (this.internacoesService.triagemEmUso(triagem.id, idAtual)) {
      this.avisoFormulario('A triagem selecionada já está vinculada a outra internação.');
      return;
    }
    if (!acolhido) {
      this.avisoFormulario('Selecione um acolhido válido.');
      return;
    }
    if (!acolhido.ativo && this.registroAtual()?.idAcolhido !== acolhido.id) {
      this.avisoFormulario('Selecione um acolhido ativo para registrar a internação.');
      return;
    }
    if (valor.idConvenio !== triagem.convenio.id) {
      this.avisoFormulario('O convênio deve ser o mesmo definido na triagem.');
      return;
    }
    if (!this.etapasTratamento.includes(etapaTratamento)) {
      this.avisoFormulario('Selecione uma etapa de tratamento válida.');
      return;
    }

    const etapaEncerrada = ['Alta concedida', 'Desligado'].includes(etapaTratamento);
    if (!etapaEncerrada && this.internacoesService.possuiInternacaoAtiva(acolhido.id, idAtual)) {
      this.avisoFormulario('O acolhido selecionado já possui uma internação ativa.');
      return;
    }

    const dados: Omit<Internacao, 'id'> = {
      idAcolhido: acolhido.id,
      idConvenio: triagem.convenio.id,
      idTriagem: triagem.id,
      dataAdmissao: new Date(valor.dataAdmissao!),
      dataPrevisaoAlta: new Date(valor.dataPrevisaoAlta!),
      observacaoIsencao: valor.observacaoIsencao?.trim() || undefined,
      etapaTratamento,
    };

    this.salvando.set(true);
    const atualizado = idAtual
      ? this.internacoesService.atualizar(idAtual, dados)
      : !!this.internacoesService.criar(dados);

    if (!atualizado) {
      this.salvando.set(false);
      this.registroNaoEncontrado();
      return;
    }

    this.messageService.add({
      severity: 'success',
      summary: idAtual ? 'Internação atualizada!' : 'Internação registrada!',
      detail: 'Os dados foram salvos com sucesso.',
      life: 3000,
    });
    this.voltarParaLista();
  }

  protected voltarParaLista(): void {
    this.router.navigate(['/internacoes']);
  }

  private inicializarFormulario(): void {
    const id = this.id();
    if (id) {
      const idNumerico = Number(id);
      const internacao =
        Number.isSafeInteger(idNumerico) && idNumerico > 0
          ? this.internacoesService.buscar(idNumerico)
          : undefined;

      if (!internacao) {
        this.carregando.set(false);
        this.registroNaoEncontrado();
        return;
      }

      this.registroAtual.set(internacao);
      this.internacaoForm.patchValue({
        triagemId: internacao.idTriagem,
        idAcolhido: internacao.idAcolhido,
        idConvenio: internacao.idConvenio,
        dataAdmissao: new Date(internacao.dataAdmissao),
        dataPrevisaoAlta: new Date(internacao.dataPrevisaoAlta),
        etapaTratamento: internacao.etapaTratamento,
        observacaoIsencao: internacao.observacaoIsencao ?? '',
      });
      this.triagemSelecionadaId.set(internacao.idTriagem);
      this.acolhidoSelecionadoId.set(internacao.idAcolhido);
      this.carregando.set(false);
      return;
    }

    const rascunho = this.internacoesService.consumirRascunho();
    if (rascunho) this.internacaoForm.patchValue(rascunho);

    const triagemId = Number(this.triagemId() ?? rascunho?.triagemId);
    const acolhidoId = Number(this.acolhidoId() ?? rascunho?.idAcolhido);
    if (Number.isSafeInteger(triagemId) && triagemId > 0) {
      this.internacaoForm.patchValue({ triagemId });
      this.onTriagemChange(triagemId);
    }
    if (Number.isSafeInteger(acolhidoId) && acolhidoId > 0) {
      this.internacaoForm.patchValue({ idAcolhido: acolhidoId });
      this.acolhidoSelecionadoId.set(acolhidoId);
    }
    this.carregando.set(false);
  }

  private avisoFormulario(detalhe: string): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Revise o formulário',
      detail: detalhe,
      life: 4000,
    });
  }

  private registroNaoEncontrado(): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Internação não encontrada',
      detail: 'O registro solicitado não existe ou foi removido.',
      life: 4000,
    });
    this.voltarParaLista();
  }

  private normalizarTexto(valor: string): string {
    return valor
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\W_\u0300-\u036f]/g, '');
  }
}
