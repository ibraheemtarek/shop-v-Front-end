
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon } from 'lucide-react';
import { useSearch } from '@/hooks/use-search';

interface SearchProps {
  variant?: 'default' | 'mobile';
  className?: string;
}

const Search = ({ variant = 'default', className = '' }: SearchProps) => {
  const { query, setQuery, handleSearch } = useSearch();

  if (variant === 'mobile') {
    return (
      <Button
        variant="ghost"
        className={className}
        onClick={() => {
          const searchElement = document.getElementById('mobile-search-container');
          if (searchElement) {
            searchElement.classList.toggle('hidden');
            searchElement.querySelector('input')?.focus();
          }
        }}
      >
        <SearchIcon className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative w-full">
        <Input
          type="search"
          placeholder="Search products..."
          className="w-full pr-10"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full"
        >
          <SearchIcon className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
};

export default Search;
