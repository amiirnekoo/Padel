import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8')
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect("213.176.121.117", port=22, username="root", password="655crYvKR5", timeout=10)

cmd = """docker exec -i rally_postgres psql -U padel_user -d padel_production -A -F"," -c "
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
ORDER BY table_name, column_name;
" """

stdin, stdout, stderr = client.exec_command(cmd)
lines = stdout.read().decode('utf-8').strip().split('\n')
prod_cols = {}
for line in lines[1:]:
    parts = line.split(',')
    if len(parts) >= 2:
        t, c = parts[0], parts[1]
        prod_cols.setdefault(t, set()).add(c)

# Now check local models
sys.path.insert(0, '.')
from backend.app.models import Base

missing_cols = []
missing_tables = []

for table_name, table in Base.metadata.tables.items():
    if table_name not in prod_cols:
        missing_tables.append(table_name)
    else:
        for col in table.columns:
            if col.name not in prod_cols[table_name]:
                missing_cols.append((table_name, col.name, str(col.type)))

print(f"=== جداول مفقود در padel_production: {missing_tables} ===")
print(f"=== ستون‌های مفقود در padel_production: ===")
for t, c, ty in missing_cols:
    print(f"ALTER TABLE {t} ADD COLUMN IF NOT EXISTS {c} {ty};")

client.close()
