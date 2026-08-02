async function inspectTop() {
  const res = await fetch('https://abena.mobobi.com/playground/static/tts/js/server-tts.js');
  const code = await res.text();
  console.log(code.substring(0, 1500));
}

inspectTop();
