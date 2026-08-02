async function findAbenaEndpoints() {
  const pages = [
    'https://abena.mobobi.com/playground/',
    'https://abena.mobobi.com/playground/tts/',
    'https://abena.mobobi.com/playground/sdk/api-keys/'
  ];

  for (const page of pages) {
    try {
      const res = await fetch(page);
      const text = await res.text();
      console.log('Page:', page, 'Status:', res.status, 'Length:', text.length);
      const jsFiles = text.match(/\/playground\/[^\s"'<>]*\.js/g) || [];
      console.log('JS files on page:', Array.from(new Set(jsFiles)));

      for (const jsPath of Array.from(new Set(jsFiles))) {
        const jsRes = await fetch('https://abena.mobobi.com' + jsPath);
        const jsCode = await jsRes.text();
        const urls = jsCode.match(/https?:\/\/[^\s"'`<>]+/g) || [];
        const endpoints = jsCode.match(/\/api\/[^\s"'`<>]+/g) || jsCode.match(/\/v1\/[^\s"'`<>]+/g) || [];
        console.log('Found in', jsPath, 'Endpoints:', Array.from(new Set([...urls, ...endpoints])).slice(0, 15));
      }
    } catch (e) {
      console.error('Error fetching page:', page, e);
    }
  }
}

findAbenaEndpoints();
