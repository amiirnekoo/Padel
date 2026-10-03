import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8')
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('213.176.121.117', port=22, username='root', password='655crYvKR5', timeout=10)

cmd = """docker exec -i rally_postgres psql -U padel_user -d postgres -c "DROP DATABASE IF EXISTS padel_test_concurrency_pg16;" && \
docker exec -i rally_postgres psql -U padel_user -d postgres -c "CREATE DATABASE padel_test_concurrency_pg16;"
"""
stdin, stdout, stderr = client.exec_command(cmd)
print("OUT:", stdout.read().decode('utf-8'))
print("ERR:", stderr.read().decode('utf-8'))
client.close()
