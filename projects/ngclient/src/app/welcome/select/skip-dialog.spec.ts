import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, expect, it, vi } from 'vitest';
import { RemoteControlState } from '../../settings/remote-control/remote-control.state';
import { ServerSettingsService } from '../../settings/server-settings.service';
import Select from './select';

afterEach(() => TestBed.resetTestingModule());

it('opens and dismisses the skip confirmation without saving the welcome setting', () => {
  const setShownWelcomePage = vi.fn();
  const navigate = vi.fn();
  TestBed.configureTestingModule({
    providers: [
      { provide: Router, useValue: { navigate } },
      { provide: RemoteControlState, useValue: { state: signal('inactive') } },
      { provide: ServerSettingsService, useValue: { setShownWelcomePage } },
    ],
  });
  const component = TestBed.runInInjectionContext(() => new Select());
  expect(component.skipDialogIsOpen()).toBe(false);
  component.openSkipDialog();
  expect(component.skipDialogField().value()).toBe(true);
  component.skipDialogIsOpen.set(false);
  expect(component.skipDialogField().value()).toBe(false);
  expect(setShownWelcomePage).not.toHaveBeenCalled();
  expect(navigate).not.toHaveBeenCalled();
});
