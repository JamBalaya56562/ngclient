import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ShipSelect } from '@ship-ui/core/ship-select';
import { ShipSpinner } from '@ship-ui/core/ship-spinner';
import { finalize } from 'rxjs';
import { SysinfoState } from '../core/states/sysinfo.state';
import { ServerSettingsService } from './server-settings.service';

const SYSTEM_DEFAULT = 'system-default';

@Component({
  selector: 'app-server-timezone-settings',
  imports: [FormsModule, ShipSelect, ShipSpinner],
  template: `
    <sh-select
      [options]="options()"
      value="value"
      label="label"
      [isClearable]="false"
      [inlineSearch]="true"
      [disabled]="disabled()">
      <input
        type="text"
        aria-label="Server time zone"
        i18n-aria-label
        [ngModel]="value()"
        (ngModelChange)="saveTimeZone($event)"
        [ngModelOptions]="{ standalone: true }" />
      <ng-template let-option>{{ option.label }}</ng-template>
      @if (saving()) {
        <sh-spinner prefix class="primary" aria-label="Saving server time zone" i18n-aria-label />
      }
    </sh-select>
  `,
  styles: ':host { display: block; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServerTimezoneSettingsComponent {
  #settings = inject(ServerSettingsService);
  #sysinfo = inject(SysinfoState);
  #destroyRef = inject(DestroyRef);

  saving = signal(false);
  value = computed(() => this.#settings.serverSettings()?.['server-timezone'] || SYSTEM_DEFAULT);
  disabled = computed(() => this.saving() || !this.#settings.serverSettings() || !this.#sysinfo.systemInfo());
  options = computed(() => {
    const info = this.#sysinfo.systemInfo();
    const systemZone = info?.ServerTimeZone || $localize`Unknown`;
    const options = [
      { value: SYSTEM_DEFAULT, label: $localize`Not set (system time zone: ${systemZone})` },
      ...(info?.TimeZones ?? []).flatMap((zone) =>
        zone.ID ? [{ value: zone.ID, label: zone.DisplayName || zone.ID }] : []
      ),
    ];
    // Keep a configured ID visible even if a different OS/list no longer supplies it.
    const value = this.value();
    if (!options.some((option) => option.value === value)) options.push({ value, label: value });
    return options;
  });

  saveTimeZone(value: string) {
    if (this.disabled() || value === this.value() || !this.options().some((option) => option.value === value)) return;
    this.saving.set(true);
    this.#settings
      .patchServerSetting('server-timezone', value === SYSTEM_DEFAULT ? '' : value)
      .pipe(
        takeUntilDestroyed(this.#destroyRef),
        finalize(() => this.saving.set(false))
      )
      // The settings service rolls back on error; the HTTP interceptor reports it.
      .subscribe({ error: () => {} });
  }
}
