var quill = new Quill('#editor', {
  modules: {
    syntax: false,
    formula: true,
    toolbar: [
      ['bold', 'italic'],
      ['link', 'blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      ['formula']
    ]
  },
  placeholder: 'Compose an epic question...',
  theme: 'snow'
});

var qform = document.querySelector('#question-form');
qform.onsubmit = function() {
  var q = document.querySelector('input[name=questionContent]');
  q.value = JSON.stringify(quill.getContents());
  console.log(q);
  $.post("/questions/ask", qform.serialize(), function(data) {});

  return false;
};
