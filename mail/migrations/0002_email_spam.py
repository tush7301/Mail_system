# Generated by Django 3.2.2 on 2022-05-14 05:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mail', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='email',
            name='spam',
            field=models.BooleanField(default=False),
        ),
    ]
