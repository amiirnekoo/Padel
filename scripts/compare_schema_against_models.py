import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8')

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("213.176.121.117", port=22, username="root", password="655crYvKR5", timeout=10)

compare_script = '''
import sys
from backend.app.models.base import Base
# Import all models
import backend.app.models.user
import backend.app.models.club
import backend.app.models.slot
import backend.app.models.booking
import backend.app.models.payment
import backend.app.models.wallet
import backend.app.models.shop
import backend.app.models.content
import backend.app.models.tournament
import backend.app.models.admin
import backend.app.models.matchmaking

import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

PG_URL = "postgresql+asyncpg://padel_user:padel_secret_password_2026@db:5432/padel_production"
engine = create_async_engine(PG_URL)

async def check():
    async with engine.connect() as conn:
        res = await conn.execute(text("""
            SELECT table_name, column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public'
        """))
        existing_cols = set((row[0], row[1]) for row in res.fetchall())

    missing = []
    for table_name, table in Base.metadata.tables.items():
        for col in table.columns:
            if (table_name, col.name) not in existing_cols:
                missing.append((table_name, col.name, str(col.type)))

    print(f"=== بررسی اختلاف اسکیما مدل‌ها با دیتابیس لایو (padel_production) ===")
    if not missing:
        print("✅ هیچ ستون مفقودی یافت نشد؛ اسکیما کاملاً همگام است.")
    else:
        print(f"⚠️ تعداد ستون‌های مفقود در دیتابیس لایو: {len(missing)}")
        for t, c, ty in missing:
            print(f"ALTER TABLE {t} ADD COLUMN IF NOT EXISTS {c} {ty};")

    await engine.dispose()

asyncio.run(check())
'''

stdin, stdout, stderr = client.exec_command("docker exec -i rally_backend python -u -")
stdin.write(compare_script)
stdin.close()

out = stdout.read().decode('utf-8')
err = stderr.read().decode('utf-8')

print(out)
if err and "warning" not in err.lower() and "deprecated" not in err.lower():
    print("ERR:", err)

client.close()
