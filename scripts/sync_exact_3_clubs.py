import sqlite3
from datetime import date, timedelta, datetime, timezone

conn = sqlite3.connect('padel.db')
cursor = conn.cursor()

valid_clubs = ('club-viva', 'club-lafour', 'club-enghelab')

# 1. Delete slots belonging to fake courts
cursor.execute('''
    DELETE FROM time_slots WHERE court_id IN (
        SELECT id FROM courts WHERE club_id NOT IN (?, ?, ?)
    ) OR court_id = 'court-eng-3'
''', valid_clubs)

# 2. Delete fake courts
cursor.execute('''
    DELETE FROM courts WHERE club_id NOT IN (?, ?, ?) OR id = 'court-eng-3'
''', valid_clubs)

# 3. Delete fake clubs
cursor.execute('''
    DELETE FROM clubs WHERE id NOT IN (?, ?, ?)
''', valid_clubs)

# 4. Insert or update the 3 real clubs
now_str = datetime.now(timezone.utc).isoformat()
clubs_to_sync = [
    (
        'club-enghelab',
        'مجموعه پدل FGB انقلاب (FGB Padel Club)',
        'تهران', 'تهران',
        'خیابان ولیعصر، اتوبان نیایش، مجموعه فرهنگی ورزشی انقلاب، نخستین مجموعه پدل ایران',
        '02122001100', 'PADEL', 24000000, 3.00,
        'آرنا مسابقات، پارکینگ اختصاصی، کافه رستوران، رختکن VIP، نورافکن استاندارد جهانی',
        'APPROVED', 1, 'IR880120000000001234567801', now_str
    ),
    (
        'club-lafour',
        'باشگاه پدل لفور (Lafour Club)',
        'تهران', 'تهران',
        'تهران، منطقه ۱، اقدسیه / آجودانیه، مجتمع تفریحی ورزشی لفور',
        '02126110000', 'PADEL', 30000000, 3.00,
        'کورت سوپر پانورامیک روباز، کافه رستوران اختصاصی، پارکینگ ولت، رختکن VIP',
        'APPROVED', 1, 'IR880120000000001234567805', now_str
    ),
    (
        'club-viva',
        'باشگاه پدل ویوا (VIVA Padel Club)',
        'تهران', 'تهران',
        'تهران، منطقه ۱، مینی‌سیتی، بلوار ارتش، مجتمع ورزشی ویوا پدل',
        '02122440000', 'PADEL', 35000000, 3.00,
        'کورت مسقف سازه‌ای سوپر پانورامیک، چمن مشکی، پارکینگ، کافه رستوران و رختکن مدرن',
        'APPROVED', 1, 'IR880120000000001234567806', now_str
    )
]

for c in clubs_to_sync:
    cursor.execute('''
        INSERT INTO clubs (id, name, city, province, address, phone, sports_supported, default_hourly_rate, commission_rate, amenities, approval_status, is_active, iban, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            name=excluded.name,
            city=excluded.city,
            address=excluded.address,
            phone=excluded.phone,
            sports_supported=excluded.sports_supported,
            default_hourly_rate=excluded.default_hourly_rate,
            commission_rate=excluded.commission_rate,
            amenities=excluded.amenities
    ''', c)

# 5. Insert or update courts
courts_to_sync = [
    ('court-viva-1', 'club-viva', 'کورت ۱ مسقف سازه‌ای (ویوا مینی‌سیتی)', 'PADEL', 1, 1),
    ('court-eng-1', 'club-enghelab', 'کورت ۱ مسابقات آرنا (FGB انقلاب)', 'PADEL', 1, 1),
    ('court-eng-2', 'club-enghelab', 'کورت ۲ سنترال (FGB انقلاب)', 'PADEL', 1, 1),
    ('court-laf-1', 'club-lafour', 'کورت ۱ روباز پانورامیک (لفور)', 'PADEL', 0, 1)
]

for ct in courts_to_sync:
    cursor.execute('''
        INSERT INTO courts (id, club_id, name, sport_type, is_indoor, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
            club_id=excluded.club_id,
            name=excluded.name,
            sport_type=excluded.sport_type,
            is_indoor=excluded.is_indoor,
            is_active=excluded.is_active
    ''', ct)

# 6. Seed slots for viva and lafour if missing
today = date.today()
tomorrow = today + timedelta(days=1)
slot_hours = [
    ('08:00', '09:30', 25000000),
    ('09:30', '11:00', 25000000),
    ('16:30', '18:00', 30000000),
    ('18:00', '19:30', 35000000),
    ('19:30', '21:00', 35000000),
    ('21:00', '22:30', 30000000)
]

for slot_day in [today, tomorrow]:
    day_str = slot_day.strftime("%d")
    for ct in courts_to_sync:
        court_id = ct[0]
        for idx, (st, et, price) in enumerate(slot_hours):
            s_id = f'slot-{court_id}-{day_str}-{idx}'
            cursor.execute('''
                INSERT INTO time_slots (id, court_id, slot_date, start_time, end_time, price, status)
                VALUES (?, ?, ?, ?, ?, ?, 'AVAILABLE')
                ON CONFLICT(id) DO NOTHING
            ''', (s_id, court_id, str(slot_day), st, et, price))

conn.commit()

# Report
clubs_in_db = cursor.execute('SELECT id, name FROM clubs').fetchall()
courts_in_db = cursor.execute('SELECT id, name FROM courts').fetchall()
slots_count = cursor.execute('SELECT COUNT(*) FROM time_slots').fetchone()[0]

print('Synced padel.db successfully:')
print('Clubs in DB count:', len(clubs_in_db))
for c in clubs_in_db:
    print('  Club:', c[0])
print('Courts in DB count:', len(courts_in_db))
for ct in courts_in_db:
    print('  Court:', ct[0], 'Club:', ct[1] if len(ct) > 1 else '')
print('Total Slots in DB:', slots_count)
conn.close()
