import { supabase } from "@/integrations/supabase/client";

export interface SEOAuditResult {
  score: number;
  last_run: string;
  issues: {
    type: 'error' | 'warning' | 'info';
    message: string;
    route: string;
  }[];
}

export const runSEOAudit = async (): Promise<SEOAuditResult> => {
  const issues: SEOAuditResult['issues'] = [];
  let score = 100;

  // 1. Check Meta Tags on the current page (client-side simulation)
  const title = document.title;
  if (!title || title.length < 30) {
    issues.push({ 
      type: 'warning', 
      message: 'Title tag is too short or missing', 
      route: window.location.pathname 
    });
    score -= 10;
  }

  const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
  if (!description || description.length < 50) {
    issues.push({ 
      type: 'error', 
      message: 'Meta description is missing or too short', 
      route: window.location.pathname 
    });
    score -= 20;
  }

  // 2. Check Images
  const images = Array.from(document.querySelectorAll('img'));
  images.forEach(img => {
    if (!img.alt) {
      issues.push({ 
        type: 'warning', 
        message: `Image missing alt text: ${img.src.split('/').pop()}`, 
        route: window.location.pathname 
      });
      score -= 5;
    }
  });

  // 3. Check Headings
  const h1 = document.querySelector('h1');
  if (!h1) {
    issues.push({ 
      type: 'error', 
      message: 'No H1 tag found', 
      route: window.location.pathname 
    });
    score -= 15;
  }

  const result: SEOAuditResult = {
    score: Math.max(0, score),
    last_run: new Date().toISOString(),
    issues
  };

  // Save to DB
  await supabase
    .from('site_settings')
    .update({ value: JSON.stringify(result) })
    .eq('key', 'seo_audit_results');

  return result;
};
