# Sprint Review

## Evaluation of the sprint outcome

### what worked
- o upgrade novo encaixou no sistema existente do `Farm Helper` sem criar infraestrutura nova
- o helper continuou sendo suporte e nao substituto do jogador
- a regra "colhe primeiro, planta depois" manteve o play ativo mais eficiente
- save/load e regressao completa passaram com a nova mecanica

### what did not work
- a regressao antiga do combo dependia de um texto exato e precisou ser tornada mais resiliente
- parte do QA do helper dependia de timing real de crescimento e precisou ser estabilizada com estado controlado

### remaining risks
- o custo do upgrade pode precisar de ajuste fino apos playtests mais longos
- o texto do helper ainda concentra bastante informacao operacional em pouco espaco

### next priorities
- observar se o custo `22` entrega pacing suficiente entre `Helper` e `Plantio assistido`
- considerar um limite visual melhor para indicar falta de sementes enquanto o plantio assistido esta ativo
- avaliar em sprint futuro se vale permitir configuracao de prioridade manual entre colher e plantar
