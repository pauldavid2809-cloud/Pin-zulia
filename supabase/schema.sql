-- ==============================================================================
-- PINZULIA VENUE OS - PRODUCTION DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Transactions Table (Multi-Channel Automated Ingestion)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id VARCHAR(50) NOT NULL DEFAULT 'pinzulia',
    reference_code VARCHAR(100) NOT NULL UNIQUE,
    amount_usd NUMERIC(10, 2) NOT NULL,
    amount_ves NUMERIC(15, 2) NOT NULL,
    bcv_rate NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'pago_movil',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    bank_reference VARCHAR(100),
    ingestion_channel VARCHAR(50),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    verified_at TIMESTAMP WITH TIME ZONE
);

-- 3. Ingested Bank Notifications (Idempotency Audit Log)
CREATE TABLE IF NOT EXISTS public.bank_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    app_id VARCHAR(50) NOT NULL DEFAULT 'pinzulia',
    bank VARCHAR(100) NOT NULL,
    reference VARCHAR(100) NOT NULL,
    amount_ves NUMERIC(15, 2) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    raw_payload TEXT NOT NULL,
    is_processed BOOLEAN DEFAULT false,
    matched_transaction_id UUID REFERENCES public.transactions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Bowling Lane Sessions
CREATE TABLE IF NOT EXISTS public.lane_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lane_number INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'disponible',
    remaining_minutes INT DEFAULT 0,
    players JSONB DEFAULT '[]'::jsonb,
    shoes_assigned INT DEFAULT 0,
    has_bumpers BOOLEAN DEFAULT false,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Kitchen Display Orders (KDS)
CREATE TABLE IF NOT EXISTS public.kitchen_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_code VARCHAR(50) NOT NULL UNIQUE,
    lane_number INT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    total_usd NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pendiente',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Bowling Games & Telemetry
CREATE TABLE IF NOT EXISTS public.bowling_games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lane_number INT NOT NULL,
    game_status VARCHAR(50) DEFAULT 'in_progress',
    players JSONB NOT NULL DEFAULT '[]'::jsonb,
    last_ball_speed_kmh NUMERIC(5, 2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lane_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kitchen_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bowling_games ENABLE ROW LEVEL SECURITY;

-- Public read policies for real-time frontend displays
CREATE POLICY "Allow public read access on lane_sessions" ON public.lane_sessions FOR SELECT USING (true);
CREATE POLICY "Allow public read access on bowling_games" ON public.bowling_games FOR SELECT USING (true);
CREATE POLICY "Allow public read access on transactions" ON public.transactions FOR SELECT USING (true);
