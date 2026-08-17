-- Seed SEO and Performance settings
INSERT INTO public.site_settings (key, value)
VALUES 
  ('google_analytics_id', ''),
  ('google_search_console_tag', ''),
  ('performance_lazy_loading', 'true'),
  ('performance_image_optimization', 'true'),
  ('seo_audit_results', '{"last_run": null, "score": 0, "issues": []}')
ON CONFLICT (key) DO NOTHING;
