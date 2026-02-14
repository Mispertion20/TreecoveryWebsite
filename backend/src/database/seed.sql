-- Seed Data: Initial data for Almaty and Astana
-- Description: Seeds cities, districts, and sample users for testing
-- Created: 2025-01-XX

-- Insert Almaty city
INSERT INTO cities (id, name_ru, name_kz, name_en, center_lat, center_lng)
VALUES (
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    'Алматы',
    'Алматы',
    'Almaty',
    43.2220,
    76.8512
) ON CONFLICT (id) DO NOTHING;

-- Insert Astana city
INSERT INTO cities (id, name_ru, name_kz, name_en, center_lat, center_lng)
VALUES (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    'Астана',
    'Астана',
    'Astana',
    51.1694,
    71.4491
) ON CONFLICT (id) DO NOTHING;

-- Insert sample districts for Almaty
INSERT INTO districts (id, city_id, name_ru, name_kz, name_en)
VALUES
    (
        'c3d4e5f6-a7b8-9012-cdef-123456789012',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'Алмалинский район',
        'Алмалы ауданы',
        'Almalinsky District'
    ),
    (
        'd4e5f6a7-b8c9-0123-def0-234567890123',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'Медеуский район',
        'Медеу ауданы',
        'Medeu District'
    ),
    (
        'e5f6a7b8-c9d0-1234-ef01-345678901234',
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'Турксибский район',
        'Түрксіб ауданы',
        'Turksib District'
    )
ON CONFLICT (id) DO NOTHING;

-- Insert sample districts for Astana
INSERT INTO districts (id, city_id, name_ru, name_kz, name_en)
VALUES
    (
        'f6a7b8c9-d0e1-2345-f012-456789012345',
        'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        'Алматинский район',
        'Алматы ауданы',
        'Almaty District'
    ),
    (
        'a7b8c9d0-e1f2-3456-0123-567890123456',
        'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        'Есильский район',
        'Есіл ауданы',
        'Yesil District'
    ),
    (
        'b8c9d0e1-f2a3-4567-1234-678901234567',
        'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        'Сарыаркинский район',
        'Сарыарқа ауданы',
        'Saryarka District'
    )
ON CONFLICT (id) DO NOTHING;

-- Insert sample users
-- Note: Password hashes are placeholders - replace with actual bcrypt hashes
-- Default password for test users: "Test123!" (should be hashed with bcrypt, salt rounds: 10)

-- Super admin user
INSERT INTO users (id, email, password_hash, role, city_id)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'admin@treecovery.kz',
    '$2b$10$placeholder_hash_for_Test123!', -- Replace with actual bcrypt hash
    'super_admin',
    NULL
) ON CONFLICT (id) DO NOTHING;

-- Almaty admin user
INSERT INTO users (id, email, password_hash, role, city_id)
VALUES (
    '22222222-2222-2222-2222-222222222222',
    'almaty.admin@treecovery.kz',
    '$2b$10$placeholder_hash_for_Test123!', -- Replace with actual bcrypt hash
    'admin',
    'a1b2c3d4-e5f6-7890-abcd-ef1234567890'
) ON CONFLICT (id) DO NOTHING;

-- Astana admin user
INSERT INTO users (id, email, password_hash, role, city_id)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'astana.admin@treecovery.kz',
    '$2b$10$placeholder_hash_for_Test123!', -- Replace with actual bcrypt hash
    'admin',
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'
) ON CONFLICT (id) DO NOTHING;

-- Regular user
INSERT INTO users (id, email, password_hash, role, city_id)
VALUES (
    '44444444-4444-4444-4444-444444444444',
    'user@treecovery.kz',
    '$2b$10$placeholder_hash_for_Test123!', -- Replace with actual bcrypt hash
    'user',
    NULL
) ON CONFLICT (id) DO NOTHING;

-- Insert sample green spaces for Almaty
-- Note: These are sample records. In production, you would load real data from CSV or API
INSERT INTO green_spaces (
    id,
    type,
    species_ru,
    species_kz,
    species_en,
    species_scientific,
    latitude,
    longitude,
    city_id,
    district_id,
    planting_date,
    status,
    notes,
    responsible_org,
    created_by
)
VALUES
    -- Almaty samples
    (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'tree',
        'Тополь',
        'Терек',
        'Poplar',
        'Populus',
        43.2389,
        76.8897,
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'c3d4e5f6-a7b8-9012-cdef-123456789012',
        '2023-04-15',
        'alive',
        'Посажен в рамках программы озеленения',
        'Акимат г. Алматы',
        '22222222-2222-2222-2222-222222222222'
    ),
    (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'tree',
        'Береза',
        'Қайың',
        'Birch',
        'Betula',
        43.2500,
        76.9000,
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'd4e5f6a7-b8c9-0123-def0-234567890123',
        '2024-05-20',
        'alive',
        NULL,
        'Акимат г. Алматы',
        '22222222-2222-2222-2222-222222222222'
    ),
    (
        'cccccccc-cccc-cccc-cccc-cccccccccccc',
        'park',
        'Парк',
        'Саябақ',
        'Park',
        NULL,
        43.2200,
        76.8500,
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        'c3d4e5f6-a7b8-9012-cdef-123456789012',
        '2022-09-10',
        'alive',
        'Центральный парк города',
        'Акимат г. Алматы',
        '22222222-2222-2222-2222-222222222222'
    ),
    -- Astana samples
    (
        'dddddddd-dddd-dddd-dddd-dddddddddddd',
        'tree',
        'Ель',
        'Шырша',
        'Spruce',
        'Picea',
        51.1694,
        71.4491,
        'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        'f6a7b8c9-d0e1-2345-f012-456789012345',
        '2023-10-01',
        'alive',
        NULL,
        'Акимат г. Астаны',
        '33333333-3333-3333-3333-333333333333'
    ),
    (
        'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
        'tree',
        'Дуб',
        'Емен',
        'Oak',
        'Quercus',
        51.1800,
        71.4600,
        'b2c3d4e5-f6a7-8901-bcde-f12345678901',
        'a7b8c9d0-e1f2-3456-0123-567890123456',
        '2024-04-12',
        'attention_needed',
        'Требуется полив',
        'Акимат г. Астаны',
        '33333333-3333-3333-3333-333333333333'
    )
ON CONFLICT (id) DO NOTHING;

