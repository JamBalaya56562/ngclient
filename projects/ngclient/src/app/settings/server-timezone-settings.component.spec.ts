import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DuplicatiServer, SystemInfoDto } from '../core/openapi';
import { ServerStateService } from '../core/services/server-state.service';
import { ServerStatusWebSocketService } from '../core/services/server-status-websocket.service';
import { SysinfoState } from '../core/states/sysinfo.state';
import { ServerSettingsService } from './server-settings.service';
import { ServerTimezoneSettingsComponent } from './server-timezone-settings.component';

describe('server time zone settings', () => {
  let fixture: ComponentFixture<ServerTimezoneSettingsComponent>;
  afterEach(() => {
    fixture?.destroy();
    TestBed.resetTestingModule();
  });
  async function setup(stored?: string) {
    const response = new Subject<void>();
    const patch = vi.fn(() => response);
    const systemInfo = signal({
      ServerTimeZone: 'Europe/Prague',
      TimeZones: [
        { ID: 'Europe/Prague', DisplayName: '(UTC+01:00) Prague', CurrentUTCOffset: '01:00:00' },
        { ID: 'Asia/Tokyo', DisplayName: '(UTC+09:00) Tokyo', CurrentUTCOffset: '09:00:00' },
      ],
    } as SystemInfoDto);
    const settings = stored === undefined ? {} : { 'server-timezone': stored };
    TestBed.configureTestingModule({
      imports: [ServerTimezoneSettingsComponent],
      providers: [
        ServerSettingsService,
        {
          provide: DuplicatiServer,
          useValue: { getApiV1Serversettings: () => of(settings), patchApiV1Serversettings: patch },
        },
        { provide: SysinfoState, useValue: { systemInfo } },
        { provide: ServerStateService, useValue: { getConnectionMethod: () => 'longpoll' } },
        { provide: ServerStatusWebSocketService, useValue: { serverSettings: signal(null), subscribe: vi.fn() } },
      ],
    });
    fixture = TestBed.createComponent(ServerTimezoneSettingsComponent);
    const service = TestBed.inject(ServerSettingsService);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    const text = () => fixture.nativeElement.querySelector('.selected-value')?.textContent.trim();
    return { patch, response, service, systemInfo, text };
  }

  it.each([undefined, ''])('shows %s as unset without writing the OS zone into settings', async (stored) => {
    const { patch, text, service } = await setup(stored);
    expect(text()).toBe('Not set (system time zone: Europe/Prague)');
    expect(service.serverSettings()?.['server-timezone']).toBe(stored);
    expect(patch).not.toHaveBeenCalled();
  });
  it('distinguishes an explicit OS zone from an unset value', async () => {
    const { text, patch } = await setup('Europe/Prague');
    expect(text()).toBe('(UTC+01:00) Prague');
    expect(patch).not.toHaveBeenCalled();
  });
  it('preserves an existing zone not present in the current server list', async () => {
    const { text, patch } = await setup('Custom/Existing');
    expect(text()).toBe('Custom/Existing');
    expect(patch).not.toHaveBeenCalled();
  });
  it.each([
    ['Asia/Tokyo', 'Asia/Tokyo'],
    ['system-default', ''],
  ])('saves %s using the existing settings PATCH', async (value, stored) => {
    const { patch, response, service } = await setup('Europe/Prague');
    fixture.componentInstance.saveTimeZone(value);
    fixture.componentInstance.saveTimeZone('Europe/Prague');
    expect(patch).toHaveBeenCalledExactlyOnceWith({ body: { 'server-timezone': stored } });
    expect(service.serverSettings()?.['server-timezone']).toBe(stored);
    response.next();
    response.complete();
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
  });
  it('restores a rejected value and allows retry', async () => {
    const { patch, response, service, text } = await setup('Europe/Prague');
    fixture.componentInstance.saveTimeZone('Asia/Tokyo');
    response.error(new Error('rejected'));
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(service.serverSettings()?.['server-timezone']).toBe('Europe/Prague');
    expect(text()).toBe('(UTC+01:00) Prague');
    patch.mockReturnValue(new Subject<void>());
    fixture.componentInstance.saveTimeZone('Asia/Tokyo');
    expect(patch).toHaveBeenCalledTimes(2);
  });
});
