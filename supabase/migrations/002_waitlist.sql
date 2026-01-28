-- ============================================
-- Waitlist Table (Beta Signups)
-- ============================================

CREATE TABLE waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    source TEXT DEFAULT 'landing',  -- landing, survey, referral
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- No RLS needed - public insert, admin read
-- Using service role for all operations

-- Index for faster lookups
CREATE INDEX idx_waitlist_email ON waitlist(email);
CREATE INDEX idx_waitlist_created_at ON waitlist(created_at DESC);
