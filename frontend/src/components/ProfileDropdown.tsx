import { useState, useRef, useEffect } from 'react';

interface ProfileDropdownProps {
  username: string;
  handle?: string;
  avatarUrl?: string;
  onLogout: () => void;
  hideLogout?: boolean;
}

export default function ProfileDropdown({ username, handle, avatarUrl, onLogout, hideLogout }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        className="flex items-center gap-2 focus:outline-none"
        onClick={() => setOpen((o) => !o)}
      >
        <img
          src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`}
          alt="avatar"
          className="w-10 h-10 rounded-full border"
        />
        <span className="font-semibold">{username}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded shadow-lg z-50 p-4 flex flex-col items-center">
          <img
            src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random`}
            alt="avatar"
            className="w-16 h-16 rounded-full border mb-2"
          />
          <div className="font-bold text-lg">{username}</div>
          {handle && <div className="text-gray-500 mb-2">@{handle}</div>}
          {!hideLogout && (
            <button
              className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
              onClick={onLogout}
            >
              Logout
            </button>
          )}
        </div>
      )}
    </div>
  );
}
