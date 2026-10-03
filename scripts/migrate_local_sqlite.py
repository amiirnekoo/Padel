import sqlite3

conn = sqlite3.connect("padel.db")
cur = conn.cursor()
cols = [c[1] for c in cur.execute("PRAGMA table_info(users)").fetchall()]
print("Current columns:", cols)

if "email" not in cols:
    cur.execute("ALTER TABLE users ADD COLUMN email VARCHAR(100);")
    print("Added email column.")

if "preferred_sport" not in cols:
    cur.execute("ALTER TABLE users ADD COLUMN preferred_sport VARCHAR(20) DEFAULT 'PADEL';")
    print("Added preferred_sport column.")

if "dominant_hand" not in cols:
    cur.execute("ALTER TABLE users ADD COLUMN dominant_hand VARCHAR(20) DEFAULT 'RIGHT';")
    print("Added dominant_hand column.")

conn.commit()
new_cols = [c[1] for c in cur.execute("PRAGMA table_info(users)").fetchall()]
print("Updated columns:", new_cols)
conn.close()
