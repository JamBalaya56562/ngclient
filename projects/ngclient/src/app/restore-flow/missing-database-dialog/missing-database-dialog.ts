import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { ShipButton } from '@ship-ui/core/ship-button';

/** What to do when a restore finds that the local database of its backup is missing */
export type MissingDatabaseChoice = 'recreate' | 'temporary';

@Component({
  selector: 'app-missing-database-dialog',
  imports: [ShipButton],
  templateUrl: './missing-database-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MissingDatabaseDialog {
  closed = output<MissingDatabaseChoice | null>();
}
