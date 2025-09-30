// needles-worker.js

// Importa a biblioteca Needles no worker via importScripts.
// Use a URL do CDN para a versão mais recente estável, ou local se preferir.
importScripts('https://cdn.jsdelivr.net/npm/@domchristie/needles@1.6.0/dist/needles.min.js');

// Cria a instância do LoudnessWorker (classe que a lib fornece para rodar no Worker)
const processor = new Needles.LoudnessWorker();

// Recebe mensagens do thread principal e passa para o processor
self.onmessage = (event) => {
  processor.onmessage(event);
};

// Recebe mensagens do processor e envia de volta para o thread principal
processor.onmessage = (event) => {
  self.postMessage(event.data);
};
