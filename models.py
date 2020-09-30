from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

# 创建model，然后makemigrations，接着migrate，最后到admin.py注册model


class Song(models.Model):
    song_name = models.CharField(max_length=140)
    composer = models.CharField(max_length=140)
    performancer = models.CharField(max_length=140)
    image_url = models.TextField()
    video_url = models.TextField()
    sheet_music = models.TextField()
    description = models.TextField()
    view_count = models.IntegerField()

    def __str__(self):
        return self.song_name


class UserManager(models.Manager):
    def unatural_key(self):
        return self.username
    User.natural_key = unatural_key


class Comment(models.Model):
    # many to one关系, related_name ='comments'使得可以从Song model里直接调用song.comments.all
    song = models.ForeignKey(
        Song, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_date = models.DateTimeField(default=timezone.now)

    # 修改comment的排序，最新的在最上面
    class Meta:
        ordering = ['-created_date']

    def __str__(self):
        return self.content


class Like(models.Model):
    song = models.ForeignKey(Song, on_delete=models.CASCADE)


class Contact(models.Model):
    email = models.EmailField()
    subject = models.CharField(max_length=140)
    message = models.TextField()

    def __str__(self):
        return self.subject
