import { useState } from 'react';
import type { FormEvent } from 'react';
import { Search } from 'lucide-react';
import Input from './Input';
import Button from './Button';
import { TRANSLATIONS } from '../../utils/constants';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export default function SearchBar({ onSearch, placeholder, loading }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder || TRANSLATIONS.search_action}
        className="flex-1"
      />
      <Button type="submit" loading={loading}>
        <Search className="h-4 w-4" />
        {TRANSLATIONS.search_action}
      </Button>
    </form>
  );
}
