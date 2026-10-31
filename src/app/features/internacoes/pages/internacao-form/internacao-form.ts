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
import { LucideBedSingle, LucidePencil, LucideUserPlus } from '@lucide/angular';
import { forkJoin, Observable } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { Card } from '../../../../shared/components/card/card';
import { FormField } from '../../../../shared/components/form-field/form-field';
import { FormHeader } from '../../../../shared/components/form-header/form-header';
import { InfoCardContent } from '../../../../shared/interfaces/info-card-content';
import { CpfPipe } from '../../../../shared/pipes/cpf-pipe';
import { TelefonePipe } from '../../../../shared/pipes/telefone-pipe';
import { dateToLocalDate, localDateToDate } from '../../../../shared/utils/local-date';
import { AcolhidosService } from '../../../acolhidos/services/acolhidos-service';
import { ConveniosService } from '../../../convenios/services/convenios-service';
import { StatusTriagem } from '../../../triagens/enums/status-triagem';
import { TriagensService } from '../../../triagens/services/triagens-service';
import { EtapaTratamento } from '../../enums/etapa-tratamento';
import { ETAPA_TRATAMENTO_CONFIG } from '../../interfaces/etapa-tratamento-config';
import { Internacao } from '../../interfaces/internacao';
import { InternacaoCreateRequest } from '../../interfaces/internacao-create-request';
import { InternacaoUpdateRequest } from '../../interfaces/internacao-update-request';
import { InternacaoFormStateService } from '../../services/internacao-form-state-service';
import { InternacoesService } from '../../services/internacoes-service';

type ModoForm = 'registro' | 'atualizacao';

const dataValida: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  if (control.value === null) return null;
  return control.value instanceof Date && Number.isFinite(control.value.getTime())
    ? null
    : { dataInvalida: true };
};

const datasInternacaoCoerentes: ValidatorFn = (form: AbstractControl): ValidationErrors | null => {
  const entrada = form.get('dataEntrada')?.value;
  const saidaPrevista = form.get('dataSaidaPrevista')?.value;

  return entrada instanceof Date && saidaPrevista instanceof Date && saidaPrevista < entrada
    ? { saidaPrevistaAntesEntrada: true }
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
    InputNumberModule,
    MessageModule,
    SelectModule,
    SkeletonModule,
    Card,
    FormField,
    FormHeader,
    LucideUserPlus,
    CpfPipe,
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
  private readonly conveniosService = inject(ConveniosService);
  private readonly triagensService = inject(TriagensService);
  private readonly internacoesService = inject(InternacoesService);
  private readonly formStateService = inject(InternacaoFormStateService);

  protected readonly acolhidos = this.acolhidosService.acolhidos;
  protected readonly convenios = this.conveniosService.convenios;
  protected readonly triagens = this.triagensService.triagens;
  protected readonly hoje = new Date();
  protected readonly etapasTratamento = Object.values(EtapaTratamento).map((value) => ({
    value,
    label: ETAPA_TRATAMENTO_CONFIG[value].label,
  }));
  protected readonly formSubmitted = signal(false);
  protected readonly salvando = signal(false);
  protected readonly carregando = signal(true);
  protected readonly registroAtual = signal<Internacao | null>(null);
  private readonly triagemSelecionadaId = signal<number | null>(null);
  private readonly acolhidoSelecionadoId = signal<number | null>(null);
  private readonly convenioSelecionadoId = signal<number | null>(null);

  private readonly saidaPrevistaInicial = (() => {
    const data = new Date();
    data.setMonth(data.getMonth() + 9);
    return data;
  })();

  protected readonly internacaoForm = this.fb.group(
    {
      triagemId: this.fb.control<number | null>(null, [Validators.required]),
      acolhidoId: this.fb.control<number | null>(null, [Validators.required]),
      convenioId: this.fb.control<number | null>(null, [Validators.required]),
      dataEntrada: this.fb.control<Date | null>(new Date(), [
        Validators.required,
        dataValida,
        (control) => {
          if (!(control.value instanceof Date)) return null;
          const entrada = new Date(control.value);
          const hoje = new Date();
          entrada.setHours(0, 0, 0, 0);
          hoje.setHours(0, 0, 0, 0);
          return entrada > hoje ? { entradaFutura: true } : null;
        },
      ]),
      dataSaidaPrevista: this.fb.control<Date | null>(this.saidaPrevistaInicial, [
        Validators.required,
        dataValida,
      ]),
      etapaTratamento: this.fb.nonNullable.control(EtapaTratamento.EM_TRATAMENTO, [
        Validators.required,
      ]),
      valorMensalidade: this.fb.control<number | null>(null, [Validators.required]),
    },
    { validators: datasInternacaoCoerentes },
  );

  protected readonly modo = computed<ModoForm>(() => (this.id() ? 'atualizacao' : 'registro'));
  protected readonly headerInfo = computed<InfoCardContent>(() => {
    const atualizacao = this.modo() === 'atualizacao';

    return {
      value: atualizacao ? 'Editar internação' : 'Nova internação',
      label: atualizacao
        ? 'Atualize os dados permitidos deste episódio de internação.'
        : 'Selecione uma triagem concluída e registre os dados da nova internação.',
      icon: atualizacao ? LucidePencil : LucideBedSingle,
      color: '#be222d',
    };
  });
  protected readonly actionBtnLabel = computed(() =>
    this.modo() === 'registro' ? 'Registrar internação' : 'Salvar alterações',
  );
  protected readonly triagensDisponiveis = computed(() =>
    this.triagens().filter((triagem) => triagem.status === StatusTriagem.CONCLUIDA),
  );
  protected readonly triagemSelecionada = computed(() =>
    this.triagens().find((triagem) => triagem.id === this.triagemSelecionadaId()),
  );
  protected readonly acolhidosDisponiveis = computed(() =>
    this.acolhidos().filter((acolhido) => acolhido.ativo),
  );
  protected readonly acolhidoSelecionado = computed(() =>
    this.acolhidos().find((acolhido) => acolhido.id === this.acolhidoSelecionadoId()),
  );
  protected readonly conveniosDisponiveis = computed(() => {
    const convenioAtual = this.registroAtual()?.convenio.id;
    return this.convenios().filter((convenio) => convenio.ativo || convenio.id === convenioAtual);
  });
  protected readonly convenioSelecionado = computed(() => {
    const convenioId = this.convenioSelecionadoId();
    return this.convenios().find((convenio) => convenio.id === convenioId) ?? null;
  });
  protected readonly dadosDivergentes = computed(() => {
    const triagem = this.triagemSelecionada();
    const acolhido = this.acolhidoSelecionado();
    if (!triagem || !acolhido) return false;

    const mesmoNome =
      this.normalizarTexto(triagem.nomePossivelAcolhido) === this.normalizarTexto(acolhido.nome);
    const mesmoTelefone =
      triagem.telefone.replace(/\D/g, '') === acolhido.telefone.replace(/\D/g, '');
    return !mesmoNome || !mesmoTelefone;
  });

  private readonly labels: Record<string, string> = {
    triagemId: 'Triagem',
    acolhidoId: 'Acolhido',
    convenioId: 'Convênio',
    dataEntrada: 'Data de entrada',
    dataSaidaPrevista: 'Previsão de saída',
    etapaTratamento: 'Etapa de tratamento',
    valorMensalidade: 'Valor da mensalidade',
  };

  ngOnInit(): void {
    if (this.modo() === 'atualizacao') {
      const triagemControl = this.internacaoForm.controls.triagemId;
      triagemControl.clearValidators();
      triagemControl.updateValueAndValidity();
      this.carregarEdicao();
      return;
    }

    forkJoin({
      triagens: this.triagensService.getAllTriagens(),
      acolhidos: this.acolhidosService.getAllAcolhidos(),
      convenios: this.conveniosService.getAllConvenios(),
    }).subscribe({
      next: () => this.inicializarCriacao(),
      error: () => this.falhaAoCarregar(),
    });
  }

  protected onTriagemChange(triagemId: number | null): void {
    this.triagemSelecionadaId.set(triagemId);
    const triagem = this.triagens().find((item) => item.id === triagemId);

    if (!triagem) return;

    this.internacaoForm.patchValue({ convenioId: triagem.convenio.id });
    this.configurarMensalidade(triagem.convenio.id);

    if (this.acolhidoSelecionadoId() !== null) return;

    const nomeTriagem = this.normalizarTexto(triagem.nomePossivelAcolhido);
    const telefoneTriagem = triagem.telefone.replace(/\D/g, '');
    const sugestao = this.acolhidosDisponiveis().find(
      (acolhido) =>
        this.normalizarTexto(acolhido.nome) === nomeTriagem ||
        acolhido.telefone.replace(/\D/g, '') === telefoneTriagem,
    );

    if (sugestao) {
      this.internacaoForm.patchValue({ acolhidoId: sugestao.id });
      this.acolhidoSelecionadoId.set(sugestao.id);
    }
  }

  protected onAcolhidoChange(acolhidoId: number | null): void {
    this.acolhidoSelecionadoId.set(acolhidoId);
  }

  protected onConvenioChange(convenioId: number | null): void {
    this.convenioSelecionadoId.set(convenioId);
    this.configurarMensalidade(convenioId);
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

    this.formStateService.salvarRascunho(this.internacaoForm.getRawValue());
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
        (campo === 'dataSaidaPrevista' &&
          this.internacaoForm.hasError('saidaPrevistaAntesEntrada')))
    );
  }

  protected getErrorMessage(campo: string): string | null {
    if (!this.isInvalid(campo)) return null;
    const errors = this.internacaoForm.get(campo)?.errors;

    if (errors?.['required']) return `Preencha o campo ${this.labels[campo]}.`;
    if (errors?.['dataInvalida']) return 'Informe uma data válida.';
    if (errors?.['entradaFutura']) return 'A data de entrada não pode estar no futuro.';
    if (errors?.['min']) return 'O valor da mensalidade deve ser maior que zero.';
    if (errors?.['max']) {
      return this.convenioSelecionado()?.pagamento
        ? 'Informe um valor de mensalidade válido.'
        : 'Este convênio não permite cobrança de mensalidade.';
    }
    if (
      campo === 'dataSaidaPrevista' &&
      this.internacaoForm.hasError('saidaPrevistaAntesEntrada')
    ) {
      return 'A previsão de saída não pode ser anterior à data de entrada.';
    }
    return `Verifique o campo ${this.labels[campo]}.`;
  }

  protected onSubmit(): void {
    if (this.salvando()) return;
    this.formSubmitted.set(true);
    this.internacaoForm.markAllAsTouched();
    if (this.internacaoForm.invalid) return;

    if (this.modo() === 'registro') {
      this.criarInternacao();
      return;
    }

    this.atualizarInternacao();
  }

  protected voltarParaLista(): void {
    this.router.navigate(['/internacoes']);
  }

  private criarInternacao(): void {
    const valor = this.internacaoForm.getRawValue();
    const triagem = this.triagens().find((item) => item.id === valor.triagemId);
    const acolhido = this.acolhidos().find((item) => item.id === valor.acolhidoId);
    const convenio = this.convenios().find((item) => item.id === valor.convenioId);

    if (!triagem || triagem.status !== StatusTriagem.CONCLUIDA) {
      this.avisoFormulario('Selecione uma triagem concluída.');
      return;
    }
    if (!acolhido?.ativo) {
      this.avisoFormulario('Selecione um acolhido ativo.');
      return;
    }
    if (!convenio?.ativo) {
      this.avisoFormulario('Selecione um convênio ativo.');
      return;
    }
    if (valor.dataEntrada! < localDateToDate(acolhido.dataNascimento)) {
      this.avisoFormulario('A data de entrada não pode ser anterior ao nascimento do acolhido.');
      return;
    }

    const dados: InternacaoCreateRequest = {
      acolhidoId: acolhido.id,
      convenioId: convenio.id,
      dataEntrada: dateToLocalDate(valor.dataEntrada!),
      etapaTratamento: EtapaTratamento.EM_TRATAMENTO,
      valorMensalidade: convenio.pagamento ? valor.valorMensalidade : null,
    };

    this.salvar(this.internacoesService.createInternacao(dados), false);
  }

  private atualizarInternacao(): void {
    const id = Number(this.id());
    const valor = this.internacaoForm.getRawValue();

    if (!Number.isSafeInteger(id) || id <= 0 || !this.registroAtual()) {
      this.registroNaoEncontrado();
      return;
    }

    const dados: InternacaoUpdateRequest = {
      dataSaidaPrevista: dateToLocalDate(valor.dataSaidaPrevista!),
      etapaTratamento: valor.etapaTratamento,
      valorMensalidade: valor.valorMensalidade!,
    };

    this.salvar(this.internacoesService.updateInternacao(id, dados), true);
  }

  private salvar(request$: Observable<Internacao>, edicao: boolean): void {
    this.salvando.set(true);
    request$.subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: edicao ? 'Internação atualizada!' : 'Internação registrada!',
          detail: 'Os dados foram salvos com sucesso.',
          life: 3000,
        });
        this.voltarParaLista();
      },
      error: () => this.salvando.set(false),
    });
  }

  private carregarEdicao(): void {
    const id = Number(this.id());
    if (!Number.isSafeInteger(id) || id <= 0) {
      this.carregando.set(false);
      this.registroNaoEncontrado();
      return;
    }

    forkJoin({
      internacao: this.internacoesService.getInternacaoById(id),
      convenios: this.conveniosService.getAllConvenios(),
    }).subscribe({
      next: ({ internacao }) => {
        if (!internacao.ativo) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Internação encerrada',
            detail: 'Uma internação encerrada não pode ser editada.',
            life: 4000,
          });
          this.router.navigate(['/internacoes', internacao.id]);
          return;
        }

        this.registroAtual.set(internacao);
        this.convenioSelecionadoId.set(internacao.convenio.id);
        this.internacaoForm.patchValue({
          acolhidoId: internacao.acolhido.id,
          convenioId: internacao.convenio.id,
          dataEntrada: localDateToDate(internacao.dataEntrada),
          dataSaidaPrevista: localDateToDate(internacao.dataSaidaPrevista),
          etapaTratamento: internacao.etapaTratamento,
          valorMensalidade: internacao.valorMensalidade,
        });
        this.configurarMensalidade(internacao.convenio.id, true);
        this.carregando.set(false);
      },
      error: () => this.falhaAoCarregar(),
    });
  }

  private inicializarCriacao(): void {
    const rascunho = this.formStateService.consumirRascunho();
    if (rascunho) this.internacaoForm.patchValue(rascunho);

    const triagemId = Number(this.triagemId() ?? rascunho?.triagemId);
    const acolhidoId = Number(this.acolhidoId() ?? rascunho?.acolhidoId);

    if (Number.isSafeInteger(triagemId) && triagemId > 0) {
      this.internacaoForm.patchValue({ triagemId });
      this.triagemSelecionadaId.set(triagemId);
      if (!rascunho) this.onTriagemChange(triagemId);
    }
    if (Number.isSafeInteger(acolhidoId) && acolhidoId > 0) {
      this.internacaoForm.patchValue({ acolhidoId });
      this.acolhidoSelecionadoId.set(acolhidoId);
    } else if (rascunho?.acolhidoId) {
      this.acolhidoSelecionadoId.set(rascunho.acolhidoId);
    }

    this.configurarMensalidade(this.internacaoForm.controls.convenioId.value, true);
    this.carregando.set(false);
  }

  private configurarMensalidade(convenioId: number | null, preservarValor = false): void {
    this.convenioSelecionadoId.set(convenioId);
    const convenio = this.convenios().find((item) => item.id === convenioId);
    const control = this.internacaoForm.controls.valorMensalidade;

    if (convenio?.pagamento) {
      control.setValidators([
        Validators.required,
        Validators.min(0.01),
        Validators.max(99_999_999.99),
      ]);
      if (!preservarValor && control.value === 0) control.setValue(null);
    } else {
      control.setValidators([Validators.required, Validators.min(0), Validators.max(0)]);
      if (!preservarValor || control.value === null) control.setValue(0);
    }

    control.updateValueAndValidity();
  }

  private falhaAoCarregar(): void {
    this.carregando.set(false);
    this.messageService.add({
      severity: 'error',
      summary: 'Não foi possível carregar os dados',
      detail: 'Tente novamente em alguns instantes.',
      life: 4000,
    });
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
