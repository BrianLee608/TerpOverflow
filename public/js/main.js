$.get( "/api/questions", function(data) {
  initializePagination(data);
});

function initializePagination(data) {
  $('#pagination-demo').twbsPagination({
    totalPages: data.pageCount,
    visiblePages: 3,
    initiateStartPageClick: true,
    onPageClick: function (event, page) {

    }
  });
}

var tagsList = $('#tags-search-list');
$('#tag-search-input').keyup(function(evt) {
  var tagSearchQuery = $(this).val();
  if (tagSearchQuery.length === 0) return;

  $.get("/api/tags/?q=" + tagSearchQuery, function(data) {
    tagsList.empty();
    if (data.items.length === 0) {
      tagsList.append("<h5>No tags matching your search</h5>");
    }
    for (var i = 0; i < data.items.length; i++) {
      var tname = data.items[i].tagname;
      var turl = data.items[i].url;
      tagsList.append("<span class='question-card-tag'><a href='"+turl+"'>"+data.items[i].tagname+"</a></span>");
    }
  })
})
