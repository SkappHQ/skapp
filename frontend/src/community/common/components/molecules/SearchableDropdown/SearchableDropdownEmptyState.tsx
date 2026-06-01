'use client';

import React from 'react';
import { PlusIcon } from '@rootcodelabs/skapp-ui';
import { useTranslator } from '@/hooks/useTranslator';

export interface SearchableDropdownEmptyStateProps {
  isCustomersLoading: boolean;
  customersError: Error | null;
  customerSearch: string;
  onAddCustomer: (initialName?: string) => void;
}

const SearchableDropdownEmptyState: React.FC<SearchableDropdownEmptyStateProps> = ({
  isCustomersLoading,
  customersError,
  customerSearch,
  onAddCustomer,
}) => {
  const translateText = useTranslator('createProjectPage', 'form', 'fields', 'customer');
  return (
    <div className="flex flex-col w-full">
      <div className="px-4 py-3 text-center body2 text-secondary-text">
        {isCustomersLoading ? (
          translateText(['loading'])
        ) : customersError ? (
          <div className="flex flex-col items-center gap-1">
            <span className="subtitle3 text-primary-text">
              {translateText(['errors', 'loadErrorTitle'])}
            </span>
            <span className="body3 text-secondary-text">
              {translateText(['errors', 'loadErrorDescription'])}
            </span>
          </div>
        ) : customerSearch ? (
          translateText(['noMatchingCustomers'])
        ) : (
          translateText(['noCustomers'])
        )}
      </div>
      {!isCustomersLoading && (
        <button
          type="button"
          id="add-customer-dropdown-empty"
          className="group w-full bg-primary-background hover:bg-primary-background/80 focus:bg-primary-background/80 focus:ring-2 focus:ring-inset focus:ring-primary-accent active:scale-[0.99] border-t border-secondary-accent border-x-0 border-b-0 px-4 py-3 rounded-md flex items-center justify-between transition-all duration-200 outline-none"
          onClick={(e) => {
            e.preventDefault();
            onAddCustomer(customerSearch || undefined);
          }}
        >
          <div className="flex justify-start items-center gap-2 truncate">
            <span className="justify-start body2 text-primary-text truncate">
              {customerSearch
                ? translateText(['addCustomerQuery'], { name: customerSearch })
                : translateText(['addNewCustomer'])}
            </span>
          </div>
          <div className="size-4 shrink-0 flex items-center justify-center text-primary-text" aria-hidden="true">
            <PlusIcon />
          </div>
        </button>
      )}
    </div>
  );
};

export default SearchableDropdownEmptyState;
