import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it } from 'vitest';
import { DestinationConfigState } from '../../../core/states/destinationconfig.state';
import { SysinfoState } from '../../../core/states/sysinfo.state';
import { DestinationListComponent } from './destination-list.component';

describe('destination visibility filter', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('shows deprecated destinations when requested and hides them again when cleared', () => {
    const options = [
      { key: 'file', displayName: 'Local folder', searchTerms: 'file', sortOrder: 0 },
      { key: 'legacy', displayName: 'Legacy destination', searchTerms: 'legacy', sortOrder: 0 },
    ];
    TestBed.configureTestingModule({
      imports: [DestinationListComponent],
      providers: [
        { provide: DestinationConfigState, useValue: { backendDestinationOptions: () => options } },
        { provide: SysinfoState, useValue: { backendModules: () => [{ Key: 'legacy', IsDeprecated: true }] } },
      ],
    });
    const fixture = TestBed.createComponent(DestinationListComponent);
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('sh-toggle input:not(.internal-input)') as HTMLInputElement;

    expect(fixture.nativeElement.textContent).not.toContain('Legacy destination');
    toggle.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Legacy destination');
    toggle.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Legacy destination');
  });
});
