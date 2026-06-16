import { AppTextField, AppDropdown, AppMultiSelect } from './index';
import type { DropdownOption } from './AppDropdown';
import type { MultiSelectOption } from './AppMultiSelect';
import { cn } from '../../lib/cn';

export interface SearchFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  epicOptions?: DropdownOption[];
  epicValue?: string;
  onEpicChange?: (value: string) => void;

  assigneeOptions?: DropdownOption[];
  assigneeValue?: string;
  onAssigneeChange?: (value: string) => void;

  statusOptions?: DropdownOption[];
  statusValue?: string;
  onStatusChange?: (value: string) => void;

  labelOptions?: MultiSelectOption[];
  labelValue?: string[];
  onLabelChange?: (value: string[]) => void;

  className?: string;
}

/**
 * Shared search + filter bar for Backlog and Board. Purely presentational —
 * options and selected values are supplied by the view from its controllers.
 */
export function SearchFilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  epicOptions,
  epicValue,
  onEpicChange,
  assigneeOptions,
  assigneeValue,
  onAssigneeChange,
  statusOptions,
  statusValue,
  onStatusChange,
  labelOptions,
  labelValue,
  onLabelChange,
  className,
}: SearchFilterBarProps) {
  return (
    <div className={cn('flex flex-wrap items-end gap-3', className)}>
      <div className="min-w-48 flex-1">
        <AppTextField
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label="Search"
        />
      </div>
      {epicOptions && onEpicChange && (
        <div className="min-w-40">
          <AppDropdown
            placeholder="All epics"
            value={epicValue ?? ''}
            onChange={(e) => onEpicChange(e.target.value)}
            options={epicOptions}
          />
        </div>
      )}
      {assigneeOptions && onAssigneeChange && (
        <div className="min-w-40">
          <AppDropdown
            placeholder="All assignees"
            value={assigneeValue ?? ''}
            onChange={(e) => onAssigneeChange(e.target.value)}
            options={assigneeOptions}
          />
        </div>
      )}
      {statusOptions && onStatusChange && (
        <div className="min-w-40">
          <AppDropdown
            placeholder="All statuses"
            value={statusValue ?? ''}
            onChange={(e) => onStatusChange(e.target.value)}
            options={statusOptions}
          />
        </div>
      )}
      {labelOptions && onLabelChange && (
        <div className="min-w-48">
          <AppMultiSelect
            placeholder="Labels"
            value={labelValue ?? []}
            onChange={onLabelChange}
            options={labelOptions}
          />
        </div>
      )}
    </div>
  );
}
