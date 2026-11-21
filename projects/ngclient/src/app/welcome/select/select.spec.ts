import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RemoteControlState } from '../../settings/remote-control/remote-control.state';
import { ServerSettingsService } from '../../settings/server-settings.service';
import Select from './select';

describe('welcome console connection', () => {
  afterEach(() => TestBed.resetTestingModule());

  it.each([
    [false, '/welcome/connect/logon'],
    [true, '/welcome/connect/link'],
  ])('chooses the connection route when the link checkbox is %s', (checked, route) => {
    const navigate = vi.fn();
    TestBed.configureTestingModule({
      imports: [Select],
      providers: [
        { provide: RemoteControlState, useValue: { state: signal('inactive') } },
        { provide: ServerSettingsService, useValue: {} },
        { provide: Router, useValue: { navigate } },
      ],
    });
    const fixture = TestBed.createComponent(Select);
    fixture.detectChanges();
    const checkbox = fixture.nativeElement.querySelector('input[type=checkbox]') as HTMLInputElement;
    if (checked) checkbox.click();
    (fixture.nativeElement.querySelector('button.connect') as HTMLButtonElement).click();

    expect(navigate).toHaveBeenCalledExactlyOnceWith([route]);
  });
});
