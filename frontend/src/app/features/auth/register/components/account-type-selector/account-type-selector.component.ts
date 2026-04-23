import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { LucideBuilding2, LucideUserRound } from '@lucide/angular';
import { AccountType, AccountTypeOption } from '../../../domain/register.models';

@Component({
  selector: 'app-account-type-selector',
  imports: [LucideBuilding2, LucideUserRound],
  templateUrl: './account-type-selector.component.html',
  styleUrl: './account-type-selector.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountTypeSelectorComponent {
  @Input({ required: true }) selected!: AccountType;
  @Input({ required: true }) options: readonly AccountTypeOption[] = [];
  @Output() readonly selectedChange = new EventEmitter<AccountType>();

  protected select(value: AccountType): void {
    this.selectedChange.emit(value);
  }
}
