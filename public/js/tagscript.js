$(".select2-input").select2({
  multiple: true,
  allowClear: true,
  placeholder: {
    id: "",
    placeholder: "Leave blank to ..."
  },
  ajax: {
    // url: "https://api.github.com/search/repositories",
    url: "/api/tags",
    dataType: 'json',
    delay: 250,
    width: '100%',
    crossDomain: true,
    data: function (params) {
      console.log(params)
      return {
        q: params.term, // search term
        page: params.page
      };
    },
    processResults: function (data, params) {
      // parse the results into the format expected by Select2
      // since we are using custom formatting functions we do not need to
      // alter the remote JSON data, except to indicate that infinite
      // scrolling can be used
      console.log(data);
      params.page = params.page || 1;
      for (var i = 0; i < data.items.length; i++) {
        data.items[i]['id'] = data.items[i]['tagname'];
        delete data.items[i]['_id'];
      }
      return {
        results: data.items,
        pagination: {
          more: (params.page * 30) < data.total_count
        }
      };
    },
    cache: true
  },
  escapeMarkup: function (markup) { return markup; }, // let our custom formatter work
  minimumInputLength: 1,
  templateResult: formatTag, // omitted for brevity, see the source of this page
  templateSelection: formatTagSelection
});

function formatTag (tag) {
  if (tag.loading) return tag.text;
  return tag.tagname;
}

function formatTagSelection (tag) {
  return tag.tagname || tag.text;
}

$('.select2').width('100%');
