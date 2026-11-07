import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FilterComponent } from './filter.component';

describe('folder filters', () => {
  afterEach(() => {
    // The component emits the new path in a timeout; let it run before the component goes away
    vi.runAllTimers();
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  function folderFilter(expression: string, osType = 'Linux') {
    vi.useFakeTimers();
    TestBed.configureTestingModule({ imports: [FilterComponent] });
    const fixture = TestBed.createComponent(FilterComponent);
    fixture.componentRef.setInput('path', osType === 'Windows' ? '-C:\\start\\' : '-/start/');
    fixture.componentRef.setInput('osType', osType);
    fixture.detectChanges();

    const component = fixture.componentInstance;
    component.updateStateType('-Folder');
    component.updateStateExpression(expression);
    return component.pathState()!.path;
  }

  it('adds the missing leading separator once', () => {
    expect(folderFilter('test/test/')).toBe('-/test/test/');
  });

  it('adds the missing trailing separator once', () => {
    expect(folderFilter('/test/test')).toBe('-/test/test/');
  });

  it('keeps a folder that has both separators', () => {
    expect(folderFilter('/test/test/')).toBe('-/test/test/');
  });

  it('adds both separators when neither is there', () => {
    expect(folderFilter('test/test')).toBe('-/test/test/');
  });

  it('adds only the trailing separator to a Windows folder with a drive', () => {
    expect(folderFilter('C:\\test\\test', 'Windows')).toBe('-C:\\test\\test\\');
  });

  it('keeps a Windows folder that already ends with a separator', () => {
    expect(folderFilter('C:\\test\\test\\', 'Windows')).toBe('-C:\\test\\test\\');
  });
});
