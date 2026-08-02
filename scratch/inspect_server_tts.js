async function inspectServerTtsJs() {
  const res = await fetch('https://abena.mobobi.com/playground/static/tts/js/server-tts.js');
  const code = await res.text();
  console.log('=== server-tts.js ===');
  console.log(code);
}

inspectServerTtsJs();
