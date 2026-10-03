import sqlite3
import uuid
from datetime import date, time, datetime, timedelta

conn = sqlite3.connect("padel.db")
cur = conn.cursor()

# Ensure clubs table has a record
cur.execute("SELECT id FROM clubs LIMIT 1")
club = cur.fetchone()
if not club:
    club_id = "club-1"
    cur.execute("""
        INSERT INTO clubs (id, name, address, phone_number, is_active)
        VALUES (?, 'مجموعه پدل انقلاب', 'تهران، باشگاه انقلاب', '02122003344', 1)
    """, (club_id,))
else:
    club_id = club[0]

# Ensure courts table has a record
cur.execute("SELECT id FROM courts LIMIT 1")
court = cur.fetchone()
if not court:
    court_id = "court-1"
    cur.execute("""
        INSERT INTO courts (id, club_id, name, sport_type, is_active)
        VALUES (?, ?, 'کورت سنترال ۱', 'PADEL', 1)
    """, (court_id, club_id))
else:
    court_id = court[0]

# Ensure slot-1 exists in time_slots
cur.execute("SELECT id FROM time_slots WHERE id = 'slot-1'")
slot = cur.fetchone()
today = date.today().isoformat()
if not slot:
    cur.execute("""
        INSERT INTO time_slots (id, court_id, slot_date, start_time, end_time, price, status)
        VALUES ('slot-1', ?, ?, '15:00:00', '16:30:00', 24000000, 'AVAILABLE')
    """, (court_id, today))
    print("Created slot-1 with status AVAILABLE.")
else:
    cur.execute("""
        UPDATE time_slots SET status = 'AVAILABLE', held_by_user_id = NULL, hold_expires_at = NULL WHERE id = 'slot-1'
    """)
    print("Reset slot-1 to AVAILABLE.")

conn.commit()
conn.close()
