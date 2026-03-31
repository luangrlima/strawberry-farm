# Sprint 22 — Review

## Objetivo do sprint
Substituir o emoji dos canteiros por sprites de estado, preservando o loop principal e a leitura rápida do grid.

## Status
CONCLUIDO E APROVADO

## Entregas
- resolvedor de sprite por estado no sistema de plots
- canteiro com solo visual e sprite local de morango
- asset CC0 versionado com crédito no repositório
- smoke e e2e cobrindo `data-sprite`
- correção do frame inicial para mostrar semente após o plantio

## Resultado de QA
- `npm run test:smoke`: aprovado
- `npm run test:e2e`: aprovado
- cenários de plantio, reload e apodrecimento: aprovados

## O que funcionou bem
1. A mudança ficou isolada na camada visual do plot.
2. O uso de `data-sprite` simplificou a verificação automatizada sem acoplar os testes ao CSS detalhado.
3. O ajuste do mapeamento invertido foi pequeno e direto depois da inspeção do spritesheet.

## Riscos residuais
1. O estado vazio ainda usa solo estilizado em CSS, não um tile externo dedicado.
2. Se o jogo ganhar múltiplas culturas, o resolvedor atual precisará virar uma tabela de assets por cultura.

## Backlog sugerido
1. Adicionar um tile externo de solo arado para reduzir a parte procedural do canteiro vazio.
2. Explorar frames adicionais intermediários do spritesheet para crescimento ainda mais suave.
3. Considerar uma legenda visual compacta do ciclo semente -> maduro para onboarding.
