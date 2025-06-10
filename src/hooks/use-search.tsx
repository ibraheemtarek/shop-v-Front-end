
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseSearchProps {
  initialQuery?: string;
}

export const useSearch = ({ initialQuery = '' }: UseSearchProps = {}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchQuery = params.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
    }
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!query.trim()) {
      return;
    }

    setIsSearching(true);
    
    // Navigate to search results page with query parameter
    navigate(`/products?q=${encodeURIComponent(query.trim())}`);
    
    setIsSearching(false);
  };

  return {
    query,
    setQuery,
    isSearching,
    handleSearch
  };
};
