import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8')
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('213.176.121.117', port=22, username='root', password='655crYvKR5', timeout=10)

cmd = """docker exec -i rally_postgres psql -U padel_user -d padel_production -c "\\dt" """
stdin, stdout, stderr = client.exec_command(cmd)
print(stdout.read().decode('utf-8'))
client.close()
