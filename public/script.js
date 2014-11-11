
$(function() {
    $("#todo-add").submit(function(event) {
        var todo = $("#todo-input-box")[0].value;
        $("#todo-input-box")[0].value = "";

        var newItem = document.createElement('li');
        newItem.className = "todo-item";
        newItem.textContent = todo;

        $('#todo-list').append(newItem);
    });
});
