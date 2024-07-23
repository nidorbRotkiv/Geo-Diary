import { useEffect } from 'react';

interface RefObject<T> {
  readonly current: T | null;
}

type SetIsComponentVisible = (visible: boolean) => void;

const useHideOnClickOutside = (
  ref: RefObject<HTMLElement>,
  setIsComponentVisible: SetIsComponentVisible
): void => {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsComponentVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, setIsComponentVisible]);
};

export default useHideOnClickOutside;