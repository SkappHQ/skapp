export interface FilterSection {
  title: string;
  items: string[];
}

export interface SelectedFiltersDisplayProps {
  filterSections: FilterSection[];
  headerText?: string;
  noFiltersText?: string;
}

const SelectedFiltersDisplay = ({
  filterSections,
  headerText,
  noFiltersText = "No filters selected"
}: SelectedFiltersDisplayProps) => {
  const totalFilterCount = filterSections.reduce(
    (count, section) => count + section.items.length,
    0
  );

  const renderChip = (label: string) => {
    return (
      <div key={label}>
        <div className="flex items-center px-3 rounded-full bg-primary-background text-primary-text text-sm h-8 border border-primary-accent">
          <p className="body2" title={label}>
            {label}
          </p>
        </div>
      </div>
    );
  };

  const renderSection = (section: FilterSection) => {
    if (!section.items.length) return null;

    return (
      <div key={section.title} className="mb-4 flex flex-col gap-2">
        <p className="subtitle4 text-secondary-text">{section.title}</p>
        <div className="flex flex-row space-x-1 gap-2 flex-wrap">
          {section.items.map(renderChip)}
        </div>
      </div>
    );
  };

  return (
    <div className="px-6 flex flex-col overflow-y-auto h-full">
      {totalFilterCount > 0 ? (
        <>
          <p className="mb-4 body2 text-secondary-text">
            {headerText || `${totalFilterCount} filter(s) selected`}
          </p>
          {filterSections.map(renderSection)}
        </>
      ) : (
        <p className="mb-4 body2 text-secondary-text">{noFiltersText}</p>
      )}
    </div>
  );
};

export default SelectedFiltersDisplay;
