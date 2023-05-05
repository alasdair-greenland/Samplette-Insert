Array.from(document.body.children).forEach( ele => ele.style.display = "none" );

alert($("#samplette-btn"));

function htmlToElement(html) {
  let template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild;
}

let html = "";
