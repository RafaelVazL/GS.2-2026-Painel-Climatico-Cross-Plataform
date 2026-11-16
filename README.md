# Painel Municipal de Chuva

Aplicativo de apoio a gestores municipais no planejamento de atividades externas. O painel mostra os próximos 48 intervalos horários de chuva e destaca os que atingem o limite de alerta definido pelo usuário.

## Como rodar no Android

1. Instale Node.js 24 e pnpm 11. No celular, instale o [Expo Go compatível com o SDK 57](https://expo.dev/go?device=true&platform=android&sdkVersion=57).
2. Abra a pasta do projeto no terminal e rode:

   ```sh
   pnpm install --frozen-lockfile
   pnpm start --go --lan
   ```

3. Com celular e computador na mesma rede, use o leitor de QR Code do Expo Go para abrir o app. Se a rede da apresentação bloquear a conexão local, rode `pnpm start --go --tunnel` e abra o novo QR Code.

Para visualizar o mesmo app no navegador, rode `pnpm web`. Para verificar os tipos e testar a regra de alertas, rode:

```sh
pnpm exec tsc --noEmit
pnpm test
```

## Roteiro de demonstração

1. Abra o **Painel** em São Paulo e confira a hora da consulta, a marca da FIAP e os dois gráficos. Selecione uma barra para ler o horário e o valor.
2. Em **Preferências**, busque outra localidade pelo nome, confira a sigla do estado e selecione um resultado. No **Painel**, confirme a mudança de localidade.
3. Em **Preferências**, tente salvar `101` e confira a mensagem de validação. Depois salve um limite inteiro entre 1 e 100. Escolha uma localidade com previsão de chuva para demonstrar os cartões na aba **Alertas**.
4. Feche e reabra o app e confira a localidade e o limite salvos. Com a previsão já carregada, desligue a conexão do celular e tente atualizar. Confira a indicação **Previsão salva** e o horário da última consulta.
5. Com o TalkBack, focalize a logo e um ponto de cada gráfico. O ponto tem nome da métrica, intervalo de horário, valor e unidade.

## Dados, alertas e privacidade

- A [API de previsão do Open-Meteo](https://open-meteo.com/en/docs) fornece a chance de precipitação acima de 0,1 mm e o volume estimado, ambos referentes à hora anterior ao timestamp. O painel usa o fuso informado pela API.
- A [busca do Open-Meteo](https://open-meteo.com/en/docs/geocoding-api) usa localidades do GeoNames. O app envia o nome pesquisado e, para a previsão, as coordenadas públicas escolhidas. A localidade, o limite e a última previsão ficam no dispositivo via AsyncStorage.
- O padrão é 70%. Cada intervalo que atinge o limite recebe um alerta. As faixas descritivas do app são baixa abaixo de 50%, moderada de 50% a menos de 80% e alta a partir de 80%. Elas expressam a probabilidade de precipitação no intervalo e o volume permanece uma estimativa do modelo.
- A previsão representa a área de uma grade meteorológica. As condições podem variar dentro da localidade. O gestor avalia as condições e decide como ajustar as atividades externas.
- Em caso de falha de consulta, o cache traz apenas os intervalos ainda em andamento ou futuros da mesma localidade, com o horário da consulta. Os dados de previsão do Open-Meteo são disponibilizados sob [CC BY 4.0](https://open-meteo.com/en/terms), com acesso gratuito para uso não comercial.

## Referência

A organização em telas, componentes e estilos segue o [sistemas-consultas-mobile](https://github.com/RafaelVazL/sistemas-consultas-mobile). A logo da FIAP foi extraída do enunciado da Global Solution.

## Integrantes

| Nome completo | RM |
| --- | --- |
| Rafael Vaz de Lima | 566429 |
| André Martins | 563297 |
| Kauã Peres | 563977 |
