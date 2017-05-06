var quill = new Quill('#editor2', {
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

var aform = document.querySelector('#answer-form');
aform.onsubmit = function() {
  var a = document.querySelector('input[name=answerContent]');
  a.value = JSON.stringify(quill.getContents());

  $.post(window.location.pathname, aform.serialize(), function(data) {});

  return false;
};
