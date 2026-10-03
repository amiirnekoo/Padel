import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8')
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('213.176.121.117', port=22, username='root', password='655crYvKR5', timeout=10)

cmd = "docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' rally_postgres"
stdin, stdout, stderr = client.exec_command(cmd)
pg_ip = stdout.read().decode('utf-8').strip()
print("Postgres Container IP:", pg_ip)
client.close()
