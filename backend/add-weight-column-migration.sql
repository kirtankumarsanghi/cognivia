-- Migration: Add weight column to confusion_signals table
-- This enables anti-gaming rate limits for confusion signals

-- Add weight column with default value of 1.00
ALTER TABLE confusion_signals 
ADD COLUMN IF NOT EXISTS weight DECIMAL(3,2) DEFAULT 1.00 NOT NULL;

-- Add index for performance when filtering by weight
CREATE INDEX IF NOT EXISTS idx_confusion_signals_weight ON confusion_signals(weight);

-- Add comment for documentation
COMMENT ON COLUMN confusion_signals.weight IS 'Anti-gaming weight: 1.0 = full weight, 0.1 = diminished weight due to rapid submissions';

-- Verify the migration
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'confusion_signals' 
AND column_name = 'weight';
