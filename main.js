$(document).ready(function () {
    $("#create-comment").submit(function (e) {
        e.preventDefault();
        var serializedData = $(this).serialize();
        $.ajax({
            type: 'POST',
            url: $("#create-comment").data('url'),
            data: serializedData,
            success: function (response) {
                console.log(response)
                console.log('ajax response sucess')
                $("#create-comment")[0].reset();
                var data = JSON.parse(response["data"]);
                var profile_image = response.profile_image;
                // console.log(profile_image)
                var new_comment = data[0]["fields"];
                // console.log(new_comment)
                var formatedDate = getFormatedDate(new_comment.created_date);
                new_comment.created_date = formatedDate;

                $("#user-comment").prepend(
                    '<hr>' +
                    '<div class="w3-row">' +
                    '<div class="w3-col" style="width:60px">' +
                    '<img class="w3-circle" src="" width="50px" height="50px" id="user-image">' +
                    '</div>' +
                    '<div class="w3-rest">' +
                    '<div class="comment-author">' + new_comment.author + '</div>' +
                    '<div>' + new_comment.content + '</div>' +
                    '<div class="w3-small w3-text-grey">' + new_comment.created_date + '</div>' +
                    '</div>' +
                    '</div>'
                )

                document.getElementById("user-image").src = profile_image;
            },

            error: function (response) {
                console.log('ajax return error')
                window.location.href = '/login/';
            }
        });
    });
});

function getFormatedDate(date) {
    // console.log(date)
    var newDate = new Date(date);
    // console.log(newDate)
    var year = newDate.getFullYear();
    var month = newDate.getMonth() + 1;
    var day = newDate.getDate();
    var hour = newDate.getHours();
    var minute = newDate.getMinutes();
    if (hour < 10) {
        hour = '0' + hour;
    }
    if (minute < 10) {
        minute = '0' + minute;
    }
    var formatedDate = year + '年' + month + '月' + day + '日' + ' ' + hour + ":" + minute;
    return formatedDate;
}
