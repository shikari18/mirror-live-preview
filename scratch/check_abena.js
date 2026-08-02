async function checkAbena() {
  const htmlRes = await fetch('https://abena.mobobi.com/playground/sdk/');
  const html = await htmlRes.text();
  console.log('HTML length:', html.length);

  const matches = html.match(/\/playground\/static\/[^\s"'<>]*/g) || [];
  console.log('Matches:', matches);

  for (const m of matches) {
    if (m.endsWith('.js')) {
      const jsUrl = 'https://abena.mobobi.com' + m;
      const jsRes = await fetch(jsUrl);
      const js = await jsRes.text();
      console.log('JS File:', jsUrl, 'Length:', js.length);
      const apiMatches = js.match(/https?:\/\/[^\s"'`<>]+/g) || js.match(/\/api\/[^\s"'`<>]+/g) || js.match(/\/playground\/[^\s"'`<>]+/g) || [];
      console.log('API URLs in JS:', Array.from(new Set(apiMatches)).slice(0, 30));
    }
  }
}

checkAbena();
