// Apply theme immediately before React loads to prevent flash
(function() {
  const getSystemTheme = (): 'light' | 'dark' => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const stored = localStorage.getItem('theme');
  const theme = stored || 'system';
  
  let resolvedTheme: 'light' | 'dark';
  if (theme === 'system') {
    resolvedTheme = getSystemTheme();
  } else {
    resolvedTheme = theme as 'light' | 'dark';
  }

  const root = document.documentElement;
  if (resolvedTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
})();

