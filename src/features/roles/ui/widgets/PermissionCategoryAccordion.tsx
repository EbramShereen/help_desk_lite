import { useState } from 'react';
import { cn } from '../../../../lib/cn';
import { getScopeType } from '../../../../core/data/models/response/admin/permission_response';
import type { PermissionCategory } from '../../../../core/data/models/response/admin/permission_catalogue_response';
import type { Permission } from '../../../../core/enums/admin/permission';
import type { PermissionGrant } from '../../../../core/data/models/response/admin/permission_response';
import { AppMultiSelect } from '../../../../core/widgets';
import type { MultiSelectOption } from '../../../../core/widgets';

export interface ScopeOptions {
  team: MultiSelectOption[];
  user: MultiSelectOption[];
  epic: MultiSelectOption[];
  label: MultiSelectOption[];
  workflow: MultiSelectOption[];
  role: MultiSelectOption[];
}

interface Props {
  category: PermissionCategory;
  grants: PermissionGrant[];
  scopeOptions: ScopeOptions;
  onToggle: (key: Permission) => void;
  onScopeChange: (key: Permission, scopeIds: string[]) => void;
  defaultOpen?: boolean;
}

export function PermissionCategoryAccordion({
  category,
  grants,
  scopeOptions,
  onToggle,
  onScopeChange,
  defaultOpen = false,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  const grantMap = new Map(grants.map((g) => [g.key, g]));
  const checkedCount = category.permissions.filter((p) => grantMap.has(p.key)).length;
  const allChecked = checkedCount === category.permissions.length;
  const someChecked = checkedCount > 0 && !allChecked;

  const toggleAll = () => {
    if (allChecked) {
      category.permissions.forEach((p) => {
        if (grantMap.has(p.key)) onToggle(p.key);
      });
    } else {
      category.permissions.forEach((p) => {
        if (!grantMap.has(p.key)) onToggle(p.key);
      });
    }
  };

  return (
    <div className="overflow-hidden rounded-control border border-surface-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-muted"
      >
        <div className="flex min-w-0 items-center gap-3">
          <input
            type="checkbox"
            checked={allChecked}
            ref={(el) => {
              if (el) el.indeterminate = someChecked;
            }}
            onClick={(e) => {
              e.stopPropagation();
              toggleAll();
            }}
            onChange={() => {}}
            className="shrink-0 accent-primary"
          />
          <span className="truncate text-sm font-semibold text-content">{category.label}</span>
          <span className="shrink-0 text-xs text-content-muted">
            {checkedCount}/{category.permissions.length}
          </span>
        </div>
        <svg
          className={cn(
            'h-4 w-4 shrink-0 text-content-muted transition-transform',
            open && 'rotate-180',
          )}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="flex flex-col gap-2 px-4 pb-3 pt-1">
          {category.permissions.map((p) => {
            const grant = grantMap.get(p.key);
            const isChecked = !!grant;
            // Derive scope type from the key name — no local map needed
            const scopeType = getScopeType(p.key);
            const options = scopeType ? scopeOptions[scopeType] : [];

            return (
              <div key={p.key} className="flex flex-col gap-1.5">
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-control border px-3 py-2 text-sm transition-colors',
                    isChecked
                      ? 'border-primary bg-primary-subtle text-primary'
                      : 'border-surface-border text-content-muted hover:bg-surface-muted',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggle(p.key)}
                    className="accent-primary"
                  />
                  {p.label}
                </label>

                {isChecked && scopeType && (
                  <div className="ml-6">
                    <AppMultiSelect
                      options={options}
                      value={grant.scopeIds}
                      onChange={(ids) => onScopeChange(p.key, ids)}
                      placeholder={`Select ${scopeType}s…`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
