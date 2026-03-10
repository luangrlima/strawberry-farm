# Prompt Mestre: Post-Audit Correction Sprint

Atue como o `Full Game Director` do jogo Strawberry Farm.

Leia primeiro:
- `AGENTS.md`
- `README.md`
- o código atual do projeto
- o QA mais recente em `tests/reports/`
- o review mais recente em `agents/planning/reviews/`
- a auditoria anterior que motivou esta sprint

Tipo de sprint:
Technical

Objetivo:
[corrigir os problemas priorizados pela auditoria anterior sem abrir uma nova frente grande]

Contexto obrigatório:
- usar a auditoria anterior como fonte de prioridade
- transformar findings em correções pequenas e executáveis
- coordenar os seis papéis do time antes de fechar o escopo

Restrições:
- manter o escopo pequeno
- não adicionar novas mecânicas
- não rebalancear o jogo sem necessidade explícita
- preservar o loop atual
- preferir corrigir contratos quebrados antes de criar novas abstrações

Critérios esperados:
- corrigir os problemas de maior severidade e menor ambiguidade
- deixar evidência clara do que foi corrigido e do que ainda ficou pendente
- atualizar plano, notas de implementação, QA e review da sprint

Use `sprint_template.md` como estrutura lógica, mas gere os arquivos finais nos diretórios definidos em `AGENTS.md`.

Execute a sprint do começo ao fim.
