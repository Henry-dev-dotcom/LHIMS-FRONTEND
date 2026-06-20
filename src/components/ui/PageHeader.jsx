import { useEffect } from 'react';

export const PAGE_HEADER_EVENT = 'diagnosis-center-page-header';

export function PageHeader({ eyebrow, title, description, actions }) {
  useEffect(() => {
    window.dispatchEvent(new CustomEvent(PAGE_HEADER_EVENT, {
      detail: {
        eyebrow: eyebrow || '',
        title: title || '',
        description: description || '',
        actions: actions || null
      }
    }));
  }, [eyebrow, title, description, actions]);

  return null;
}
