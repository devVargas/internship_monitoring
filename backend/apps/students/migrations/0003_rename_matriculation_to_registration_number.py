from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("students", "0002_rename_table"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    'ALTER TABLE "students_studentprofile" RENAME COLUMN "matriculation" TO "registration_number"',
                    reverse_sql='ALTER TABLE "students_studentprofile" RENAME COLUMN "registration_number" TO "matriculation"',
                ),
                migrations.RunSQL(
                    "ALTER TABLE \"students_studentprofile\" ADD COLUMN \"campus\" varchar(150) NOT NULL DEFAULT 'Sapucaia'",
                    reverse_sql='ALTER TABLE "students_studentprofile" DROP COLUMN "campus"',
                ),
            ],
            state_operations=[],
        ),
    ]
