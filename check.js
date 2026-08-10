fetch('http://localhost:3000/candidato/408202')
  .then(res => res.text())
  .then(html => {
    const metas = html.match(/<meta property="og:[^>]*>/g);
    console.log(metas ? metas.join('\n') : 'no og tags found');
  });
