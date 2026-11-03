import { useEffect, useMemo, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { useSearchIndex } from '@/hooks/queries'
import { useUiStore } from '@/stores/ui-store'

const ORDER = ['Page', 'Invoice', 'Document'] as const

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { data } = useSearchIndex()
  const open = useUiStore((s) => s.searchOpen)
  const setOpen = useUiStore((s) => s.setSearchOpen)

  const groups = useMemo(() => {
    const term = query.trim().toLowerCase()
    const items = (data?.items ?? []).filter((item) =>
      !term || `${item.type} ${item.label} ${item.sub}`.toLowerCase().includes(term),
    )
    return ORDER.map((type) => ({ type, items: items.filter((item) => item.type === type).slice(0, 10) }))
      .filter((group) => group.items.length > 0)
  }, [data, query])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
        setOpen(true)
      }
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setOpen])

  const choose = (type: string, id: string) => {
    setQuery('')
    setOpen(false)
    if (type === 'Page') navigate(`/${id}`)
    else if (type === 'Invoice') navigate(`/invoices?focus=${id}`)
    else navigate(`/documents?doc=${id}`)
  }

  return (
    <Popover open={open && Boolean(query.trim() || focused)} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-2 size-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => { setQuery(event.target.value); setOpen(true) }}
            onFocus={() => { setFocused(true); setOpen(true) }}
            onBlur={() => setFocused(false)}
            placeholder="Search documents, invoices, matches"
            aria-label="Global search"
            className="h-7 w-[252px] rounded-md border border-input bg-background pl-7 pr-9 text-[11.5px] outline-none focus:border-primary focus:ring-[3px] focus:ring-primary/10"
          />
          <kbd className="pointer-events-none absolute right-1.5 top-1.5 rounded border bg-card px-1 text-[9px] text-muted-foreground">⌘K</kbd>
        </div>
      </PopoverAnchor>
      <PopoverContent align="end" className="w-[370px] p-1" onOpenAutoFocus={(e) => e.preventDefault()}>
        <Command shouldFilter={false}>
          <CommandList>
            <CommandEmpty className="py-4 text-center text-[11.5px] text-muted-foreground">
              No matches for “{query}”.
            </CommandEmpty>
            {groups.map((group) => (
              <CommandGroup key={group.type} heading={`${group.type}${group.items.length > 1 ? 's' : ''}`}>
                {group.items.map((item) => (
                  <CommandItem
                    key={`${item.type}-${item.id}`}
                    value={`${item.type}-${item.id}`}
                    onSelect={() => choose(item.type, item.id)}
                    className="text-[11.5px]"
                  >
                    <span className="flex-1 truncate">{item.label}</span>
                    <span className="ml-auto truncate text-[9px] uppercase tracking-wide text-muted-foreground">{item.sub}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
