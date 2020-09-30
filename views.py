from django.shortcuts import render, get_object_or_404, redirect
from .models import Song, Contact, Comment
from .forms import CommentForm
from django.views.generic import ListView
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.core import serializers


# def index(request):
#     # 从数据库获取歌曲并传递给index.html
#     song_list = Song.objects.all()
#     # print(song_list)
#     return render(request, 'mysite/index.html', {'song_list': song_list})


class SongListView(ListView):
    model = Song
    template_name = 'mysite/index.html'
    context_object_name = 'song_list'


def song_detail(request, pk):
    # 根据歌曲id，从数据库获取对应的数据，如不存在，返回404
    song = get_object_or_404(Song, pk=pk)
    # 播放次数+1后保存到数据库
    song.view_count = song.view_count+1
    song.save()
    # 获取歌曲对应的comments
    comments = song.comments.all()
    # 创建空的comment_form实例
    comment_form = CommentForm()

    # 跳转到song_detail.html，并把多个变量传递过去
    return render(request, 'mysite/song_detail.html', {'song': song, 'comment_form': comment_form, 'comments': comments})


def create_comment(request, pk):
    song = get_object_or_404(Song, pk=pk)
    # 如果用户已登录则发表评论，没登录则转到登录页面
    if request.user.is_authenticated:
        if request.is_ajax and request.method == "POST":
            comment_form = CommentForm(request.POST)
            if comment_form.is_valid():
                # set comment author to request user
                comment_form.instance.author = request.user
                # get user profile image url
                profile_image = request.user.profile.image.url
                # Create Comment object but don't save to database yet
                new_comment = comment_form.save(commit=False)
                # Assign the current song to the comment
                new_comment.song = song
                # Save the comment to the database
                new_comment.save()
                serialized_new_comment = serializers.serialize(
                    'json', [new_comment, ], use_natural_foreign_keys=True)
                return JsonResponse({"data": serialized_new_comment, "profile_image": profile_image}, status=200)
            else:
                return JsonResponse({"error": comment_form.errors}, status=400)
        else:
            return JsonResponse({"error": ""}, status=400)
    else:
        return JsonResponse({"error": "redirect"}, status=400)


def sheet_music(request, pk):
    # 根据歌曲id，从数据库获取对应的数据，如不存在，返回404
    song = get_object_or_404(Song, pk=pk)
    return render(request, 'mysite/sheet_music.html', {'song': song})


def album(request):
    return render(request, 'mysite/album.html')


def practice(request):
    return render(request, 'mysite/practice.html')


def contact(request):
    if request.method == 'POST':
        # 获取contact页面form里的内容
        get_email = request.POST.get('email')  # form input里的name
        get_subject = request.POST.get('subject')
        get_message = request.POST.get('message')

        # 把获取的内容保存到数据库
        c = Contact(email=get_email, subject=get_subject, message=get_message)
        c.save()

        # 提交后在转到thank.html
        return render(request, 'mysite/thank.html')

    else:
        return render(request, 'mysite/contact.html')
