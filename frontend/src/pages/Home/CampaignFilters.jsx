import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useState, useCallback } from 'react';

export default function CampaignFilters({ searchQuery, setSearchQuery, setCategoryFilter, campaigns }) {
  // Generate dynamic categories from actual campaign data
  const uniqueCategories = [...new Set(
    campaigns
      .map(c => c.category?.trim()) // Trim whitespace
      .filter(cat => cat && cat !== '') // Filter out empty/null categories
  )];
  const categories = ['All', ...uniqueCategories];
  
  // Debug logging
  console.log('All campaigns:', campaigns.length);
  console.log('Campaign categories:', campaigns.map(c => c.category));
  console.log('Unique categories:', uniqueCategories);
  console.log('Final categories:', categories);
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Memoize the search handler to prevent unnecessary re-renders
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, [setSearchQuery]);

  const handleCategoryChange = useCallback((value) => {
    if (value) {
      setSelectedCategory(value);
      setCategoryFilter(value);
    }
  }, [setCategoryFilter]);

  return (
    <div className="filter-controls w-full max-w-6xl mx-auto mb-12 px-4 sm:px-0">
      {/* Search Box */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search campaigns, NGOs, or keywords..."
          className="w-full pl-10 h-12 rounded-lg"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {/* Category Filters */}
      <div className="w-full overflow-x-auto">
        <ToggleGroup
          type="single"
          value={selectedCategory}
          onValueChange={handleCategoryChange}
          className="flex flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-1 lg:gap-4  pb-2 "
        >
          {categories.map((cat) => (
            <ToggleGroupItem
              key={cat}
              value={cat}
              aria-label={`Filter by ${cat}`}
              className="rounded px-4 sm:px-6 lg:px-8 py-2 text-sm font-medium whitespace-nowrap flex-shrink-0
                         data-[state=on]:bg-primary data-[state=on]:text-primary-foreground
                         hover:bg-muted/80 transition-colors duration-200"
            >
              {cat}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}