# -*- coding: utf-8 -*-
# Generated by Django 1.10.4 on 2017-01-05 00:38
from __future__ import unicode_literals

from django.db import migrations
import wagtail.contrib.table_block.blocks
import wagtail.core.blocks
import wagtail.core.fields
import wagtail.documents.blocks
import wagtail.images.blocks


class Migration(migrations.Migration):

    dependencies = [
        ('home', '0045_merge_20170105_0036'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='aboutlandingpage',
            name='business_intro',
        ),
        migrations.RemoveField(
            model_name='aboutlandingpage',
            name='careers_intro',
        ),
        migrations.RemoveField(
            model_name='aboutlandingpage',
            name='leadership_intro',
        ),
        migrations.RemoveField(
            model_name='aboutlandingpage',
            name='mission_intro',
        ),
        migrations.RemoveField(
            model_name='aboutlandingpage',
            name='option_blocks',
        ),
        migrations.RemoveField(
            model_name='aboutlandingpage',
            name='reports_intro',
        ),
        migrations.AddField(
            model_name='aboutlandingpage',
            name='sections',
            field=wagtail.core.fields.StreamField((('sections', wagtail.core.blocks.StructBlock((('title', wagtail.core.blocks.CharBlock(required=True)), ('intro', wagtail.core.blocks.RichTextBlock(blank=False, null=False, required=False)), ('button_text', wagtail.core.blocks.CharBlock(blank=False, null=False, required=True)), ('related_page', wagtail.core.blocks.PageChooserBlock())))),), null=True),
        ),
        migrations.AlterField(
            model_name='aboutlandingpage',
            name='hero',
            field=wagtail.core.fields.StreamField((('heading', wagtail.core.blocks.CharBlock(classname='full title')), ('paragraph', wagtail.core.blocks.RichTextBlock()), ('html', wagtail.core.blocks.RawHTMLBlock()), ('image', wagtail.images.blocks.ImageChooserBlock()), ('table', wagtail.contrib.table_block.blocks.TableBlock())), blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='resourcepage',
            name='sections',
            field=wagtail.core.fields.StreamField((('sections', wagtail.core.blocks.StructBlock((('title', wagtail.core.blocks.CharBlock(required=True)), ('hide_title', wagtail.core.blocks.BooleanBlock(help_text='Should the section title be displayed?', required=False)), ('content', wagtail.core.blocks.StreamBlock((('text', wagtail.core.blocks.RichTextBlock(blank=False, icon='pilcrow', null=False, required=False)), ('documents', wagtail.core.blocks.ListBlock(wagtail.core.blocks.StructBlock((('image', wagtail.images.blocks.ImageChooserBlock()), ('url', wagtail.core.blocks.URLBlock()), ('text', wagtail.core.blocks.CharBlock()))), icon='doc-empty', template='blocks/section-documents.html')), ('contact_info', wagtail.core.blocks.StructBlock((('label', wagtail.core.blocks.CharBlock(icon='title', required=False)), ('contact_items', wagtail.core.blocks.ListBlock(wagtail.core.blocks.StructBlock((('item_label', wagtail.core.blocks.CharBlock(required=True)), ('item_icon', wagtail.core.blocks.ChoiceBlock(choices=[('email', 'Email'), ('fax', 'Fax'), ('hand', 'Hand delivery'), ('phone', 'Phone'), ('mail', 'Mail')])), ('item_info', wagtail.core.blocks.RichTextBlock(required=True))))))))), ('internal_button', wagtail.core.blocks.StructBlock((('internal_page', wagtail.core.blocks.PageChooserBlock()), ('text', wagtail.core.blocks.CharBlock())))), ('external_button', wagtail.core.blocks.StructBlock((('url', wagtail.core.blocks.URLBlock()), ('text', wagtail.core.blocks.CharBlock())))), ('document_list', wagtail.core.blocks.ListBlock(wagtail.core.blocks.StructBlock((('title', wagtail.core.blocks.CharBlock()), ('document', wagtail.documents.blocks.DocumentChooserBlock()))), icon='doc-empty', template='blocks/document-list.html'))))), ('aside', wagtail.core.blocks.StreamBlock((('title', wagtail.core.blocks.CharBlock(icon='title', required=False)), ('document', wagtail.core.blocks.StructBlock((('image', wagtail.images.blocks.ImageChooserBlock()), ('url', wagtail.core.blocks.URLBlock()), ('text', wagtail.core.blocks.CharBlock())))), ('link', wagtail.core.blocks.StructBlock((('link_type', wagtail.core.blocks.ChoiceBlock(choices=[('search', 'Search'), ('calendar', 'Calendar')], help_text='Set an icon', icon='link', required=False)), ('url', wagtail.core.blocks.URLBlock()), ('text', wagtail.core.blocks.CharBlock(required=True)), ('coming_soon', wagtail.core.blocks.BooleanBlock(required=False)))))), icon='placeholder', template='blocks/section-aside.html'))))),), null=True),
        ),
    ]
