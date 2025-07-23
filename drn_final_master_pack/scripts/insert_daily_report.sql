INSERT INTO daily_reports (report_date, tokens_sold, payments_count)
SELECT CURRENT_DATE, SUM(drn_amount), COUNT(*)
FROM tokens
JOIN payments ON tokens.user_id = payments.user_id
WHERE payments.status = 'completed'
ON CONFLICT (report_date) DO UPDATE
SET tokens_sold = EXCLUDED.tokens_sold,
    payments_count = EXCLUDED.payments_count,
    generated_at = NOW();
