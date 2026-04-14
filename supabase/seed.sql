insert into public.profiles (id, full_name, academic_domain, skills)
values
  (gen_random_uuid(), 'A. Sharma', 'Software and AI', array['LLM', 'RAG', 'PATENT ANALYSIS']),
  (gen_random_uuid(), 'R. Banerjee', 'Software and AI', array['VECTOR DB', 'EMBEDDINGS', 'ML OPS']),
  (gen_random_uuid(), 'N. Verma', 'LegalTech', array['IP LAW', 'PRIOR ART', 'COMPLIANCE'])
on conflict do nothing;
