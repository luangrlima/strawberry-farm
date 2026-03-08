# Análise do Sprint 7

## Status do documento
Documento histórico, escrito antes da refatoração arquitetural do Sprint 9.

## Leitura do build atual
- O loop principal está sólido e já comporta decisões curtas com mercado, eventos, combo e helper.
- A economia inicial continua rápida: o jogador chega cedo aos upgrades, à expansão e ao helper.
- O helper melhorou conforto, mas não substitui plantio, venda nem combo manual.
- O jogo já tem progressão de curto prazo, mas ainda falta um objetivo cíclico de longo prazo.

## Avaliação por área

### Economia e pacing
- O early game é generoso e legível.
- O mid game acelera bastante depois de expansão, adubo e venda melhorada.
- O helper reduz atrito e melhora a regularidade da produção.
- Sem prestígio, o jogo hoje atinge um teto rápido de interesse.

### Progressão
- As metas atuais fecham uma sessão curta.
- Não existe reinício recompensador.
- O projeto está pronto para um sistema de reset voluntário com ganho permanente simples.

### Impacto da automação
- O helper aumenta conforto, não burst econômico.
- Isso é importante para o prestígio: o helper pode acelerar a chegada ao marco, mas não deve tornar o reset obrigatório cedo demais.

### Balanceamento dos upgrades
- Adubo rápido e Caixa premium seguem claros.
- Expansão e helper funcionam bem como degraus de meio de sessão.
- O prestígio deve ficar acima desse pacote para ser lido como meta de longo prazo.

### Clareza de UI
- O HUD já comunica bem tempo, preço, helper e eventos.
- Falta um espaço dedicado para progressão permanente.
- O prestígio precisa ser entendível em poucos segundos:
  - quando desbloqueia
  - o que perde
  - o que mantém
  - qual bônus permanente recebe

## Direção para o Sprint 7
- Introduzir `Strawberry Knowledge` como prestígio opcional.
- Usar um único bônus permanente, claro e forte.
- Escalar o requisito por nível para controlar a economia.
- Manter a interface simples: nível, bônus, requisito atual e botão de prestigiar.
