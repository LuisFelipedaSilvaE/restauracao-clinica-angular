import { Component, computed, inject, input, model, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideArrowDownToLine, LucideArrowUpFromLine, LucideDynamicIcon } from '@lucide/angular';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MessageModule } from 'primeng/message';
import { FormField } from '../../../../shared/components/form-field/form-field';
import { Medicamento } from '../../interfaces/medicamento';
import { MedicamentosService } from '../../services/medicamentos-service';

@Component({
  selector: 'dialog-movimentacao-medicamento',
  imports: [
    ButtonModule,
    DialogModule,
    MessageModule,
    ReactiveFormsModule,
    FormField,
    InputNumberModule,
    LucideDynamicIcon,
  ],
  templateUrl: './dialog-movimentacao-medicamento.html',
  styleUrl: './dialog-movimentacao-medicamento.css',
})
export class DialogMovimentacaoMedicamento {
  readonly medicamento = input.required<Medicamento>();
  readonly visible = model.required<boolean>();
  readonly onSucess = output<Medicamento>();
  protected fb = inject(FormBuilder);
  protected medicamentosService = inject(MedicamentosService);
  protected messageService = inject(MessageService);
  protected form = this.fb.group({
    quantidade: this.fb.control<number | null>(null, [Validators.required]),
  });
  readonly type = model.required<'entrada' | 'saida' | null>();
  readonly confirmLabel = input<string>('Confirmar');
  readonly loading = input(false);
  private readonly formSubmitted = signal<boolean>(false);
  private readonly labels: Record<string, string> = {
    quantidade: 'Quantidade',
  };
  protected readonly config = computed(() => {
    const mode = this.type();

    return {
      title: mode === 'entrada' ? 'Aumentar quantidadeEstoque' : 'Reduzir quantidadeEstoque',
      severity: mode === 'entrada' ? 'success' : 'warn',
      btnLabel: mode === 'entrada' ? 'Registrar entrada' : 'Registrar saída',
      msgIcon: mode === 'entrada' ? LucideArrowDownToLine : LucideArrowUpFromLine,
    };
  });

  protected isInvalid(controlName: string): boolean {
    const control = this.form.get(controlName);
    return !!control?.invalid && (control.touched || this.formSubmitted());
  }

  protected getErrorMessage(controlName: string): string | null {
    const control = this.form.get(controlName);

    if (!this.isInvalid(controlName) || !control?.errors) return null;

    if (controlName === 'confirmarNovaSenha') {
      if (control.errors['required']) {
        return `Confirme a nova senha`;
      }

      if (control.errors['novaSenhaInvalida']) {
        return `Informe senhas iguais`;
      }
    }

    if (control.errors['required']) {
      return `${this.labels[controlName]} é obrigatório`;
    }

    return `${this.labels[controlName]} é inválido`;
  }

  limparFormulario(): void {
    this.visible.set(false);

    setTimeout(() => {
      this.form.reset();
    }, 200);
  }

  atualizarQuantidadeEstoque(): void {
    if (this.form.invalid) {
      this.form.markAllAsDirty();
      return;
    }

    const mode = this.type();
    const quantidade = this.form.controls.quantidade.value!;

    const acao$ =
      mode === 'entrada'
        ? this.medicamentosService.updateMedicamentoAumentarQuantidadeEstoque(
            this.medicamento().id,
            quantidade,
          )
        : this.medicamentosService.updateMedicamentoReduzirQuantidadeEstoque(
            this.medicamento().id,
            quantidade,
          );

    acao$.subscribe({
      next: (res) => {
        this.visible.set(false);
        this.limparFormulario();
        this.messageService.add({
          severity: 'success',
          summary: 'Medicamento atualizado!',
          detail: 'Estoque foi atualizado com sucesso.',
          life: 3000,
        });

        this.onSucess.emit(res);
      },
    });
  }
}
