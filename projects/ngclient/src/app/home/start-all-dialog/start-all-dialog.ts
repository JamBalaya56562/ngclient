import { ChangeDetectionStrategy, Component, computed, input, linkedSignal, output, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { ShipButton } from '@ship-ui/core/ship-button';
import { ShipCheckbox } from '@ship-ui/core/ship-checkbox';
import { ShipSelect } from '@ship-ui/core/ship-select';
import { QueueCompletionAction } from '../../core/openapi';

export type StartAllDialogBackup = { id: string; name: string };

// The picked backups, and what to do with the computer when they have all completed
export type StartAllDialogResult = { ids: string[]; afterAction: QueueCompletionAction };

export type StartAllDialogAfterActionOption = { value: QueueCompletionAction; label: string };

// The order the actions are listed in
const AFTER_ACTION_LABELS: StartAllDialogAfterActionOption[] = [
  { value: 'Shutdown', label: $localize`Shut down the computer` },
  { value: 'Reboot', label: $localize`Restart the computer` },
  { value: 'RunScript', label: $localize`Run the script from the settings` },
];

@Component({
  selector: 'app-start-all-dialog',
  imports: [FormField, ShipButton, ShipCheckbox, ShipSelect],
  templateUrl: './start-all-dialog.html',
  styleUrl: './start-all-dialog.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StartAllDialog {
  // afterActions holds the actions the server is allowed to perform on its computer, which can be none
  data = input<{ backups: StartAllDialogBackup[]; afterActions: QueueCompletionAction[] }>();
  closed = output<StartAllDialogResult | null>();

  backups = computed(() => this.data()?.backups ?? []);
  // The actions the server can perform, which holds a script only when one is set in the server settings
  supportedAfterActions = computed(() => {
    const supported = this.data()?.afterActions ?? [];
    return AFTER_ACTION_LABELS.filter((x) => supported.includes(x.value));
  });
  // The choices in the dropdown, which always starts with doing nothing
  afterActionOptions = computed<StartAllDialogAfterActionOption[]>(() => [
    { value: 'None', label: $localize`Do nothing` },
    ...this.supportedAfterActions(),
  ]);
  selected = linkedSignal(() => this.selectionForAll(true));
  selectionForm = form(this.selected);
  selectedIds = computed(() =>
    this.backups()
      .filter(({ id }) => this.selected()[id])
      .map(({ id }) => id)
  );
  allSelected = computed(() => this.selectedIds().length === this.backups().length);
  noneSelected = computed(() => this.selectedIds().length === 0);

  readonly afterActionModel = signal({ afterAction: 'None' });
  readonly afterActionForm = form(this.afterActionModel);
  readonly afterAction = this.afterActionForm.afterAction().value;

  private selectionForAll(checked: boolean): Record<string, boolean> {
    return Object.fromEntries(this.backups().map(({ id }) => [id, checked]));
  }

  selectAll() {
    this.selected.set(this.selectionForAll(true));
  }

  selectNone() {
    this.selected.set(this.selectionForAll(false));
  }

  setAfterAction(action: QueueCompletionAction | null) {
    this.afterAction.set(action ?? 'None');
  }

  submit() {
    // Emit in the listed order, as the backups are queued one after another

    const afterAction =
      this.supportedAfterActions().find((option) => option.value === this.afterAction())?.value ?? 'None';
    this.closed.emit({
      ids: this.selectedIds(),
      afterAction,
    });
  }
}
